#!/usr/bin/env python3
"""
Africa Connection Tours — Export CONTENU MULTILINGUE data.jsx + i18n.jsx
                          → seed SQL Supabase (idempotent).

Génère supabase/seed/seed_content_full.sql couvrant, dans les 4 langues :
    circuits, excursions, ateliers

Différences avec l'ancien export_data_jsx.py :
    * Récupère EN/IT/DE depuis le dictionnaire i18n (clés
      circuit.<id>.title, excursion.<id>.short, atelier.<id>.subtitle…).
    * UPSERT (on conflict (slug) do update) → ré-exécutable pour
      rafraîchir la base sans doublon.
    * Nettoyage préalable des lignes parasites (slug null / 'sans-slug').
    * Ignore les items sans id valide (au lieu de créer 'sans-slug').

Usage :
    python supabase/seed/export_content.py
Puis coller supabase/seed/seed_content_full.sql dans le SQL editor Supabase.
"""

import os, re, json, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
DATA_JSX = os.path.join(ROOT, 'src', 'data.jsx')
I18N_JSX = os.path.join(ROOT, 'src', 'i18n.jsx')
OUT_SQL  = os.path.join(HERE, 'seed_content_full.sql')

LANGS = ['fr', 'en', 'it', 'de']

# ---------------------------------------------------------------------
# Parser balanced-bracket : valeur d'un const de premier niveau.
# ---------------------------------------------------------------------
def find_const_value(src, name):
    idx = src.find(f'const {name} = ')
    if idx < 0:
        idx = src.find(f'var {name} = ')
    if idx < 0:
        return None
    i = src.index('=', idx) + 1
    while i < len(src) and src[i] in ' \t\n':
        i += 1
    if i >= len(src) or src[i] not in '[{':
        return None
    depth = 0; in_str = None; start = i
    while i < len(src):
        c = src[i]
        if in_str:
            if c == '\\': i += 2; continue
            if c == in_str: in_str = None
        else:
            if c in '"\'`': in_str = c
            elif c in '[{': depth += 1
            elif c in ']}':
                depth -= 1
                if depth == 0:
                    return src[start:i+1]
        i += 1
    return None

def extract_object_fields(src):
    src = src.strip()
    if not src.startswith('{'):
        return {}
    src = src[1:-1]
    fields = {}; i = 0
    while i < len(src):
        while i < len(src) and src[i] in ' \t\n\r,':
            i += 1
        if i >= len(src):
            break
        if src[i] in '"\'':
            q = src[i]; j = i+1
            while j < len(src) and src[j] != q:
                if src[j] == '\\': j += 2; continue
                j += 1
            key = src[i+1:j]; i = j+1
        else:
            j = i
            while j < len(src) and (src[j].isalnum() or src[j] == '_'):
                j += 1
            key = src[i:j]; i = j
        while i < len(src) and src[i] in ' \t\n\r':
            i += 1
        if i >= len(src) or src[i] != ':':
            continue
        i += 1
        while i < len(src) and src[i] in ' \t\n\r':
            i += 1
        start = i; depth = 0; in_str = None
        while i < len(src):
            c = src[i]
            if in_str:
                if c == '\\': i += 2; continue
                if c == in_str: in_str = None
            else:
                if c in '"\'`': in_str = c
                elif c in '[{(': depth += 1
                elif c in ']})':
                    if depth == 0: break
                    depth -= 1
                elif c == ',' and depth == 0: break
            i += 1
        fields[key] = src[start:i].strip()
    return fields

def strip_js_comments(s):
    """Retire les commentaires // et /* */ en respectant les chaînes
    (simple, double, template). Indispensable avant de découper le
    tableau : un item précédé d'un commentaire serait sinon ignoré."""
    out = []; i = 0; in_str = None
    while i < len(s):
        c = s[i]
        if in_str:
            out.append(c)
            if c == '\\' and i+1 < len(s):
                out.append(s[i+1]); i += 2; continue
            if c == in_str:
                in_str = None
            i += 1; continue
        # hors chaîne
        if c in '"\'`':
            in_str = c; out.append(c); i += 1; continue
        if c == '/' and i+1 < len(s) and s[i+1] == '/':
            while i < len(s) and s[i] != '\n':
                i += 1
            continue
        if c == '/' and i+1 < len(s) and s[i+1] == '*':
            i += 2
            while i+1 < len(s) and not (s[i] == '*' and s[i+1] == '/'):
                i += 1
            i += 2; continue
        out.append(c); i += 1
    return ''.join(out)

def split_array_items(arr):
    arr = strip_js_comments(arr)
    inner = arr.strip()[1:-1].strip()
    items = []; depth = 0; in_str = None; start = 0; i = 0
    while i < len(inner):
        c = inner[i]
        if in_str:
            if c == '\\': i += 2; continue
            if c == in_str: in_str = None
        else:
            if c in '"\'`': in_str = c
            elif c in '[{(': depth += 1
            elif c in ']})': depth -= 1
            elif c == ',' and depth == 0:
                seg = inner[start:i].strip()
                if seg: items.append(seg)
                start = i+1
        i += 1
    tail = inner[start:].strip()
    if tail: items.append(tail)
    return items

def js_str(v):
    """Décode un littéral chaîne JS (quote simple/double/template)."""
    if v is None: return None
    v = v.strip()
    if v in ('null', 'undefined', ''): return None
    if v[0] in '"\'`':
        q = v[0]; s = ''; i = 1
        while i < len(v):
            if v[i] == '\\':
                nxt = v[i+1] if i+1 < len(v) else ''
                s += {'n':'\n','t':'\t','r':'\r','\\':'\\',q:q}.get(nxt, nxt)
                i += 2; continue
            if v[i] == q: break
            s += v[i]; i += 1
        return s
    return None

def js_num(v):
    if v is None: return None
    v = v.strip()
    if v in ('null', 'undefined', ''): return None
    try:
        return int(v) if '.' not in v else float(v)
    except ValueError:
        return None

# ---------------------------------------------------------------------
# i18n : { lang: { key: value } }
# ---------------------------------------------------------------------
def parse_i18n(src):
    dicts = {}
    for lang in ['EN', 'FR', 'IT', 'DE']:
        m = re.search(r'\b' + lang + r'\s*:\s*\{', src)
        if not m:
            continue
        i = m.end() - 1  # position du {
        depth = 0; in_str = None; start = i
        while i < len(src):
            c = src[i]
            if in_str:
                if c == '\\': i += 2; continue
                if c == in_str: in_str = None
            else:
                if c in '"\'`': in_str = c
                elif c == '{': depth += 1
                elif c == '}':
                    depth -= 1
                    if depth == 0:
                        break
            i += 1
        block = src[start:i+1]
        # Extraire 'key':'value' — clé quotée simple, valeur quotée
        entries = {}
        for km in re.finditer(r"'((?:[^'\\]|\\.)*)'\s*:\s*'((?:[^'\\]|\\.)*)'", block):
            key = km.group(1)
            val = km.group(2).replace("\\'", "'").replace('\\n', '\n').replace('\\"', '"')
            entries[key] = val
        dicts[lang.lower()] = entries
    return dicts

def tr(i18n, key, fr_default):
    """Retourne {fr,en,it,de} pour une clé i18n, avec fallback FR."""
    out = {}
    for lang in LANGS:
        d = i18n.get(lang, {})
        out[lang] = d.get(key) or (fr_default if lang == 'fr' else None)
    # Si FR absent du dict, utiliser le littéral data.jsx
    if not out['fr']:
        out['fr'] = fr_default
    return out

def sql(v):
    if v is None: return 'NULL'
    if isinstance(v, bool): return 'true' if v else 'false'
    if isinstance(v, (int, float)): return str(v)
    return "'" + str(v).replace("'", "''") + "'"

# ---------------------------------------------------------------------
def main():
    src = open(DATA_JSX, encoding='utf-8').read()
    i18n = parse_i18n(open(I18N_JSX, encoding='utf-8').read())

    out = []
    out.append('-- =====================================================================')
    out.append('-- ACT — SEED CONTENU MULTILINGUE (auto-généré par export_content.py)')
    out.append('-- Source : src/data.jsx + src/i18n.jsx')
    out.append('-- Idempotent : upsert par slug + nettoyage des lignes parasites.')
    out.append('-- À exécuter dans le SQL editor Supabase (après migrations 001→005).')
    out.append('-- =====================================================================\n')
    out.append("-- Nettoyage des lignes parasites d'anciens seeds")
    out.append("delete from public.circuits   where slug is null or slug = 'sans-slug';")
    out.append("delete from public.excursions where slug is null or slug = 'sans-slug';")
    out.append("delete from public.ateliers   where slug is null or slug = 'sans-slug';\n")

    counts = {}

    # ---- CIRCUITS ----
    items = split_array_items(find_const_value(src, 'CIRCUITS'))
    n = 0
    out.append('-- ===================== CIRCUITS =====================')
    for it in items:
        f = extract_object_fields(it)
        slug = js_str(f.get('id'))
        if not slug:
            continue
        title = tr(i18n, f'circuit.{slug}.title',    js_str(f.get('title')))
        subt  = tr(i18n, f'circuit.{slug}.subtitle', js_str(f.get('subtitle')))
        region = js_str(f.get('region'))
        days   = js_num(f.get('days'))
        hero   = js_str(f.get('img')) or js_str(f.get('cover'))
        cols = ('slug, title_fr, title_en, title_it, title_de, '
                'subtitle_fr, subtitle_en, subtitle_it, subtitle_de, '
                'region, duration_days, hero_photo, published, sort_order')
        vals = (f"{sql(slug)}, {sql(title['fr'])}, {sql(title['en'])}, {sql(title['it'])}, {sql(title['de'])}, "
                f"{sql(subt['fr'])}, {sql(subt['en'])}, {sql(subt['it'])}, {sql(subt['de'])}, "
                f"{sql(region)}, {sql(days)}, {sql(hero)}, true, {100 + n}")
        upd = ('title_fr=excluded.title_fr, title_en=excluded.title_en, title_it=excluded.title_it, title_de=excluded.title_de, '
               'subtitle_fr=excluded.subtitle_fr, subtitle_en=excluded.subtitle_en, subtitle_it=excluded.subtitle_it, subtitle_de=excluded.subtitle_de, '
               'region=excluded.region, duration_days=excluded.duration_days, hero_photo=excluded.hero_photo, published=true')
        out.append(f'insert into public.circuits ({cols}) values ({vals}) '
                   f'on conflict (slug) do update set {upd};')
        n += 1
    counts['circuits'] = n
    out.append('')

    # ---- EXCURSIONS ----
    items = split_array_items(find_const_value(src, 'EXCURSIONS'))
    n = 0
    out.append('-- ===================== EXCURSIONS =====================')
    for it in items:
        f = extract_object_fields(it)
        slug = js_str(f.get('id'))
        if not slug:
            continue
        title = tr(i18n, f'excursion.{slug}.title', js_str(f.get('title')))
        short = tr(i18n, f'excursion.{slug}.short', js_str(f.get('short')))
        kind = js_str(f.get('kind'))
        fmt = 'halfday' if kind == 'half' else 'fullday'
        start = js_str(f.get('start')) or 'dakar'
        hero  = js_str(f.get('img')) or js_str(f.get('cover'))
        cols = ('slug, title_fr, title_en, title_it, title_de, '
                'short_fr, short_en, short_it, short_de, '
                'format, start_point, hero_photo, published, sort_order')
        vals = (f"{sql(slug)}, {sql(title['fr'])}, {sql(title['en'])}, {sql(title['it'])}, {sql(title['de'])}, "
                f"{sql(short['fr'])}, {sql(short['en'])}, {sql(short['it'])}, {sql(short['de'])}, "
                f"{sql(fmt)}, {sql(start)}, {sql(hero)}, true, {100 + n}")
        upd = ('title_fr=excluded.title_fr, title_en=excluded.title_en, title_it=excluded.title_it, title_de=excluded.title_de, '
               'short_fr=excluded.short_fr, short_en=excluded.short_en, short_it=excluded.short_it, short_de=excluded.short_de, '
               'format=excluded.format, start_point=excluded.start_point, hero_photo=excluded.hero_photo, published=true')
        out.append(f'insert into public.excursions ({cols}) values ({vals}) '
                   f'on conflict (slug) do update set {upd};')
        n += 1
    counts['excursions'] = n
    out.append('')

    # ---- ATELIERS ----
    items = split_array_items(find_const_value(src, 'ATELIERS'))
    n = 0
    out.append('-- ===================== ATELIERS =====================')
    for it in items:
        f = extract_object_fields(it)
        slug = js_str(f.get('id'))
        if not slug:
            continue
        title = tr(i18n, f'atelier.{slug}.title',    js_str(f.get('title')))
        subt  = tr(i18n, f'atelier.{slug}.subtitle', js_str(f.get('subtitle')))
        short = tr(i18n, f'atelier.{slug}.short',    js_str(f.get('short')))
        cat = js_str(f.get('category')) or 'artisanat'
        hero = js_str(f.get('img')) or js_str(f.get('cover'))
        cols = ('slug, title_fr, title_en, title_it, title_de, '
                'subtitle_fr, subtitle_en, subtitle_it, subtitle_de, '
                'short_fr, short_en, short_it, short_de, '
                'category, hero_photo, published, sort_order')
        vals = (f"{sql(slug)}, {sql(title['fr'])}, {sql(title['en'])}, {sql(title['it'])}, {sql(title['de'])}, "
                f"{sql(subt['fr'])}, {sql(subt['en'])}, {sql(subt['it'])}, {sql(subt['de'])}, "
                f"{sql(short['fr'])}, {sql(short['en'])}, {sql(short['it'])}, {sql(short['de'])}, "
                f"{sql(cat)}, {sql(hero)}, true, {100 + n}")
        upd = ('title_fr=excluded.title_fr, title_en=excluded.title_en, title_it=excluded.title_it, title_de=excluded.title_de, '
               'subtitle_fr=excluded.subtitle_fr, subtitle_en=excluded.subtitle_en, subtitle_it=excluded.subtitle_it, subtitle_de=excluded.subtitle_de, '
               'short_fr=excluded.short_fr, short_en=excluded.short_en, short_it=excluded.short_it, short_de=excluded.short_de, '
               'category=excluded.category, hero_photo=excluded.hero_photo, published=true')
        out.append(f'insert into public.ateliers ({cols}) values ({vals}) '
                   f'on conflict (slug) do update set {upd};')
        n += 1
    counts['ateliers'] = n
    out.append('')

    # ---- TESTIMONIALS ----
    # Retours réels (langue d'origine dans text_fr). author_country pilote
    # le drapeau côté site. Remplacement complet : on vide puis on réinsère.
    items = split_array_items(find_const_value(src, 'TESTIMONIALS'))
    n = 0
    out.append('-- ===================== TÉMOIGNAGES =====================')
    out.append('delete from public.testimonials where source = \'internal\';')
    for it in items:
        f = extract_object_fields(it)
        name = js_str(f.get('name'))
        if not name:
            continue
        country = js_str(f.get('from'))
        text = js_str(f.get('text'))
        rating = js_num(f.get('stars')) or 5
        out.append(
            'insert into public.testimonials '
            '(author_name, author_country, source, text_fr, rating, published, sort_order) values ('
            f"{sql(name)}, {sql(country)}, 'internal', {sql(text)}, {sql(rating)}, true, {100 + n});"
        )
        n += 1
    counts['testimonials'] = n
    out.append('')

    with open(OUT_SQL, 'w', encoding='utf-8') as fh:
        fh.write('\n'.join(out))

    print(f'OK → {OUT_SQL}')
    print(f'  circuits     : {counts["circuits"]}')
    print(f'  excursions   : {counts["excursions"]}')
    print(f'  ateliers     : {counts["ateliers"]}')
    print(f'  testimonials : {counts.get("testimonials", 0)}')
    # Contrôle couverture traduction
    miss = 0
    for lang in ['en', 'it', 'de']:
        if not i18n.get(lang):
            print(f'  ATTENTION : bloc i18n {lang.upper()} introuvable', file=sys.stderr)
            miss += 1
    if not miss:
        print(f'  i18n : blocs EN/IT/DE chargés '
              f'({len(i18n.get("en",{}))}/{len(i18n.get("it",{}))}/{len(i18n.get("de",{}))} clés)')

if __name__ == '__main__':
    main()
