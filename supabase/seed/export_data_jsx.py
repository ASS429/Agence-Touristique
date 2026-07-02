#!/usr/bin/env python3
"""
Africa Connection Tours -- export data.jsx -> seed SQL Supabase.

Extrait les tableaux CIRCUITS, EXCURSIONS, ATELIERS de src/data.jsx
et genere un fichier seed_content.sql pret a etre execute dans le
SQL editor Supabase.

Usage :
    python supabase/seed/export_data_jsx.py

Produit :
    supabase/seed/seed_content.sql

Note : le parser est le meme balanced-bracket que celui du script
DeepL. On ne resout pas les references (t(), badges dynamiques...) :
on prend les strings litterales pour le francais. Les traductions
EN/IT/DE se feront via l'admin (bouton "Traduire").
"""

import os
import re
import json
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
DATA_JSX = os.path.join(ROOT, 'src', 'data.jsx')
OUT_SQL  = os.path.join(HERE, 'seed_content.sql')

# ---------------------------------------------------------------------
# Parser minimal JS -> Python : recupere la valeur d'un identifiant
# de premier niveau (const X = [...] ou {...}).
# ---------------------------------------------------------------------
def find_const_value(src, name):
    """Retourne la sous-chaine JS du tableau/objet assigne a `name`."""
    idx = src.find(f'const {name} = ')
    if idx < 0:
        idx = src.find(f'var {name} = ')
    if idx < 0:
        return None
    start_search = src.index('=', idx) + 1
    # skip spaces
    while start_search < len(src) and src[start_search] in ' \t\n':
        start_search += 1
    if start_search >= len(src) or src[start_search] not in '[{':
        return None
    depth = 0
    in_str = None
    i = start_search
    while i < len(src):
        c = src[i]
        if in_str:
            if c == '\\':
                i += 2
                continue
            if c == in_str:
                in_str = None
        else:
            if c == '"' or c == "'" or c == '`':
                in_str = c
            elif c in '[{':
                depth += 1
            elif c in ']}':
                depth -= 1
                if depth == 0:
                    return src[start_search:i+1]
        i += 1
    return None

# ---------------------------------------------------------------------
# Extraction naive de champs {key: value} au niveau top d'un objet.
# ---------------------------------------------------------------------
def extract_object_fields(js_obj_source):
    """Retourne {key: raw_value_text} pour les proprietes du premier
    objet trouve dans js_obj_source (au niveau top)."""
    # Se positionner apres le { d'ouverture
    src = js_obj_source.strip()
    if not src.startswith('{'):
        return {}
    src = src[1:-1]  # retire { et }

    fields = {}
    i = 0
    while i < len(src):
        # skip whitespace/commas
        while i < len(src) and src[i] in ' \t\n\r,':
            i += 1
        if i >= len(src):
            break
        # Read key (identifier or quoted string)
        if src[i] in '"\'':
            quote = src[i]
            j = i + 1
            while j < len(src) and src[j] != quote:
                if src[j] == '\\':
                    j += 2
                    continue
                j += 1
            key = src[i+1:j]
            i = j + 1
        else:
            j = i
            while j < len(src) and (src[j].isalnum() or src[j] == '_'):
                j += 1
            key = src[i:j]
            i = j
        # skip whitespace + :
        while i < len(src) and src[i] in ' \t\n\r':
            i += 1
        if i >= len(src) or src[i] != ':':
            # not a normal prop, skip
            continue
        i += 1
        while i < len(src) and src[i] in ' \t\n\r':
            i += 1
        # Read value : balanced brackets, respecting strings
        start = i
        depth = 0
        in_str = None
        while i < len(src):
            c = src[i]
            if in_str:
                if c == '\\':
                    i += 2; continue
                if c == in_str:
                    in_str = None
            else:
                if c in '"\'`':
                    in_str = c
                elif c in '[{(':
                    depth += 1
                elif c in ']})':
                    if depth == 0:
                        break
                    depth -= 1
                elif c == ',' and depth == 0:
                    break
            i += 1
        val = src[start:i].strip()
        fields[key] = val
    return fields

# ---------------------------------------------------------------------
# Split top-level items of an array [{...}, {...}, ...]
# ---------------------------------------------------------------------
def split_array_items(arr_src):
    """arr_src commence par [ et finit par ]."""
    inner = arr_src.strip()[1:-1].strip()
    items = []
    depth = 0
    in_str = None
    start = 0
    i = 0
    while i < len(inner):
        c = inner[i]
        if in_str:
            if c == '\\':
                i += 2; continue
            if c == in_str:
                in_str = None
        else:
            if c in '"\'`':
                in_str = c
            elif c in '[{(':
                depth += 1
            elif c in ']})':
                depth -= 1
            elif c == ',' and depth == 0:
                seg = inner[start:i].strip()
                if seg:
                    items.append(seg)
                start = i + 1
        i += 1
    tail = inner[start:].strip()
    if tail:
        items.append(tail)
    return items

# ---------------------------------------------------------------------
# Decode a JS literal into a Python value (strings, numbers, bool).
# ---------------------------------------------------------------------
def js_literal_to_py(v):
    v = v.strip()
    if not v:
        return None
    if v == 'null' or v == 'undefined':
        return None
    if v == 'true':  return True
    if v == 'false': return False
    if v[0] in '"\'':
        # Simple: parse en quote-matched
        quote = v[0]
        s = ''
        i = 1
        while i < len(v):
            if v[i] == '\\':
                nxt = v[i+1] if i+1 < len(v) else ''
                if nxt == 'n': s += '\n'
                elif nxt == 't': s += '\t'
                elif nxt == 'r': s += '\r'
                elif nxt == '\\': s += '\\'
                elif nxt == quote: s += quote
                else: s += nxt
                i += 2
                continue
            if v[i] == quote:
                break
            s += v[i]
            i += 1
        return s
    if v[0] == '`':
        # Template literal sans interpolation : simplifie
        return v[1:-1]
    try:
        if '.' in v: return float(v)
        return int(v)
    except ValueError:
        pass
    # Array ou objet : renvoie brut (non decode)
    return v

# ---------------------------------------------------------------------
# SQL escape
# ---------------------------------------------------------------------
def sql_str(s):
    if s is None:
        return 'NULL'
    if isinstance(s, bool):
        return 'true' if s else 'false'
    if isinstance(s, (int, float)):
        return str(s)
    if isinstance(s, (list, dict)):
        return "'" + json.dumps(s, ensure_ascii=False).replace("'", "''") + "'::jsonb"
    return "'" + str(s).replace("'", "''") + "'"

# ---------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------
def main():
    if not os.path.exists(DATA_JSX):
        print(f'ERREUR : {DATA_JSX} introuvable', file=sys.stderr)
        sys.exit(1)

    with open(DATA_JSX, encoding='utf-8') as f:
        src = f.read()

    circuits_src   = find_const_value(src, 'CIRCUITS')
    excursions_src = find_const_value(src, 'EXCURSIONS')
    ateliers_src   = find_const_value(src, 'ATELIERS')

    out = []
    out.append('-- =====================================================================')
    out.append('-- Africa Connection Tours -- SEED de contenus initiaux (auto-genere)')
    out.append('-- Source : src/data.jsx')
    out.append('-- A executer dans le SQL editor Supabase apres 001+002+003.')
    out.append('-- =====================================================================\n')

    def emit_circuits(items):
        out.append('-- Circuits ---')
        for it in items:
            fields = extract_object_fields(it)
            slug   = js_literal_to_py(fields.get('id', "''")) or 'sans-slug'
            title  = js_literal_to_py(fields.get('title', "''"))
            region = js_literal_to_py(fields.get('region', 'null'))
            duration = js_literal_to_py(fields.get('days', 'null'))
            hero   = js_literal_to_py(fields.get('cover', fields.get('image', 'null')))
            out.append(
                'insert into public.circuits (slug, title_fr, region, duration_days, hero_photo, published, sort_order) values ('
                f'{sql_str(slug)}, {sql_str(title)}, {sql_str(region)}, {sql_str(duration)}, {sql_str(hero)}, true, 100'
                ') on conflict (slug) do nothing;'
            )
        out.append('')

    def emit_excursions(items):
        out.append('-- Excursions ---')
        for it in items:
            fields = extract_object_fields(it)
            slug   = js_literal_to_py(fields.get('id', "''")) or 'sans-slug'
            title  = js_literal_to_py(fields.get('title', "''"))
            short  = js_literal_to_py(fields.get('short', fields.get('description', 'null')))
            fmt    = js_literal_to_py(fields.get('format', "'fullday'"))
            start  = js_literal_to_py(fields.get('start', "'dakar'"))
            region = js_literal_to_py(fields.get('region', 'null'))
            hero   = js_literal_to_py(fields.get('cover', fields.get('image', 'null')))
            out.append(
                'insert into public.excursions (slug, title_fr, short_fr, format, start_point, region, hero_photo, published, sort_order) values ('
                f'{sql_str(slug)}, {sql_str(title)}, {sql_str(short)}, {sql_str(fmt)}, {sql_str(start)}, {sql_str(region)}, {sql_str(hero)}, true, 100'
                ') on conflict (slug) do nothing;'
            )
        out.append('')

    def emit_ateliers(items):
        out.append('-- Ateliers ---')
        for it in items:
            fields = extract_object_fields(it)
            slug   = js_literal_to_py(fields.get('id', "''")) or 'sans-slug'
            title  = js_literal_to_py(fields.get('title', "''"))
            subtitle = js_literal_to_py(fields.get('subtitle', 'null'))
            short  = js_literal_to_py(fields.get('short', 'null'))
            cat    = js_literal_to_py(fields.get('category', "'artisanat'"))
            hero   = js_literal_to_py(fields.get('cover', fields.get('image', 'null')))
            out.append(
                'insert into public.ateliers (slug, title_fr, subtitle_fr, short_fr, category, hero_photo, published, sort_order) values ('
                f'{sql_str(slug)}, {sql_str(title)}, {sql_str(subtitle)}, {sql_str(short)}, {sql_str(cat)}, {sql_str(hero)}, true, 100'
                ') on conflict (slug) do nothing;'
            )
        out.append('')

    counts = {'circuits': 0, 'excursions': 0, 'ateliers': 0}

    if circuits_src:
        items = split_array_items(circuits_src)
        emit_circuits(items)
        counts['circuits'] = len(items)
    else:
        print('AVERT: CIRCUITS non trouve', file=sys.stderr)

    if excursions_src:
        items = split_array_items(excursions_src)
        emit_excursions(items)
        counts['excursions'] = len(items)
    else:
        print('AVERT: EXCURSIONS non trouve', file=sys.stderr)

    if ateliers_src:
        items = split_array_items(ateliers_src)
        emit_ateliers(items)
        counts['ateliers'] = len(items)
    else:
        print('AVERT: ATELIERS non trouve', file=sys.stderr)

    with open(OUT_SQL, 'w', encoding='utf-8') as f:
        f.write('\n'.join(out))

    total = sum(counts.values())
    print(f'OK : {total} inserts generes -> {OUT_SQL}')
    for k, v in counts.items():
        print(f'  {k:10s}: {v}')
    print('\nProchaine etape : ouvrir le SQL editor Supabase et coller le contenu de')
    print(f'   {OUT_SQL}')

if __name__ == '__main__':
    main()
