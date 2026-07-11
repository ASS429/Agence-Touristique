import React from 'react';
// jsPDF est chargé à la DEMANDE (import dynamique dans generateDevisPDF) pour
// ne pas alourdir le bundle initial de l'admin — il n'est utile que lors de
// la génération d'un devis PDF.

// =====================================================================
// src/admin/pdf-devis.jsx — Générateur de devis PDF
//
// Depuis l'écran "Demandes reçues", permet à l'admin de générer un
// PDF de proposition commerciale professionnelle à partir d'une
// demande de contact, prêt à envoyer au client.
//
// Utilise jsPDF chargé via CDN dans admin/index.html.
// =====================================================================

// Couleurs harmonisées avec le design system ACT
const PDF_COLORS = {
  terra:  [200, 89, 59],    // #C8593B
  ink:    [14, 15, 16],     // #0E0F10
  sand:   [251, 248, 243],  // #FBF8F3
  sand2:  [245, 239, 228],  // #F5EFE4
  border: [217, 201, 167],  // #D9C9A7
  muted:  [90, 90, 92]
};

// Retourne les infos ACT depuis site_settings si présentes, sinon
// fallback aux constantes tirées du contrat.
async function loadCompanyInfo() {
  try {
    const { data } = await window.SB.from('site_settings').select('*');
    const m = Object.fromEntries((data || []).map(r => [r.key, r]));
    return {
      name:    m['legal.company_name']?.value_fr || 'Africa Connection Tours',
      form:    m['legal.form']?.value_fr         || 'SA',
      capital: m['legal.capital']?.value_fr      || '20 000 000 FCFA',
      rccm:    m['legal.rccm']?.value_fr         || '',
      ninea:   m['legal.ninea']?.value_fr        || '',
      license: m['legal.license']?.value_fr      || 'Licence tourisme n° 006523',
      address: m['contact.address']?.value_fr    || '52, rue Félix Faure — BP 11446, Dakar-Peytavin, Sénégal',
      phone:   m['contact.phone_main']?.value_fr || '+221 33 849 52 00',
      email:   m['contact.email']?.value_fr      || 'act@orange.sn',
      website: 'act-senegal.com'
    };
  } catch {
    return {
      name: 'Africa Connection Tours',
      form: 'SA',
      capital: '20 000 000 FCFA',
      rccm: '', ninea: '',
      license: 'Licence tourisme n° 006523',
      address: '52, rue Félix Faure — BP 11446, Dakar-Peytavin, Sénégal',
      phone: '+221 33 849 52 00',
      email: 'act@orange.sn',
      website: 'act-senegal.com'
    };
  }
}

function formatDateFR(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch { return iso; }
}

function refNumber(req) {
  // Ref sur 6 chars depuis l'UUID + date : ex "AB12CD-25010"
  const short = (req.id || '').replace(/-/g, '').slice(0, 6).toUpperCase();
  const d = req.created_at ? new Date(req.created_at) : new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const mon = String(d.getMonth() + 1).padStart(2, '0');
  return `${short}-${day}${mon}`;
}

// =====================================================================
// generateDevis(request, opts) — produit un PDF prêt à télécharger.
// =====================================================================
async function generateDevisPDF(request, opts = {}) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  const W = doc.internal.pageSize.getWidth();  // 210
  const H = doc.internal.pageSize.getHeight(); // 297
  const M = 18;   // marge

  const company = await loadCompanyInfo();

  // -----------------------------------------------------------
  // Header — bandeau terra 30mm avec logo texte
  // -----------------------------------------------------------
  doc.setFillColor(...PDF_COLORS.terra);
  doc.rect(0, 0, W, 30, 'F');

  doc.setTextColor(...PDF_COLORS.sand);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('AFRICA CONNECTION TOURS', M, 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Tour-opérateur au Sénégal depuis 1996', M, 20);
  doc.text(company.website, M, 25);

  // Ref + date à droite
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('PROPOSITION COMMERCIALE', W - M, 14, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Réf. ${refNumber(request)}`, W - M, 20, { align: 'right' });
  doc.text(formatDateFR(new Date().toISOString()), W - M, 25, { align: 'right' });

  // -----------------------------------------------------------
  // Bloc client + info projet
  // -----------------------------------------------------------
  let y = 45;
  doc.setTextColor(...PDF_COLORS.ink);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('DESTINATAIRE', M, y);
  doc.text('OBJET', W / 2 + 5, y);
  y += 5;
  doc.setDrawColor(...PDF_COLORS.border);
  doc.line(M, y, W / 2 - 5, y);
  doc.line(W / 2 + 5, y, W - M, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const clientLines = [
    request.full_name || 'Client',
    request.email || '',
    request.phone || '',
    request.country || ''
  ].filter(Boolean);
  clientLines.forEach((line, i) => doc.text(line, M, y + i * 5));

  const objectLines = [
    request.kind === 'devis'  ? 'Demande de devis' :
    request.kind === 'custom' ? 'Voyage sur mesure' : 'Demande d\'information',
    request.circuit_slug ? `Circuit : ${request.circuit_slug}` : null,
    request.travelers    ? `${request.travelers} voyageur${request.travelers > 1 ? 's' : ''}` : null,
    (request.travel_start || request.travel_end) ?
      `Dates : ${formatDateFR(request.travel_start)}${request.travel_end ? ' → ' + formatDateFR(request.travel_end) : ''}`
      : null,
    request.budget ? `Budget indicatif : ${request.budget}` : null
  ].filter(Boolean);
  objectLines.forEach((line, i) => doc.text(line, W / 2 + 5, y + i * 5));

  y += Math.max(clientLines.length, objectLines.length) * 5 + 12;

  // -----------------------------------------------------------
  // Mot d'introduction
  // -----------------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...PDF_COLORS.terra);
  const intro = opts.introTitle || 'Chère cliente, cher client,';
  doc.text(intro, M, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...PDF_COLORS.ink);
  const introText = opts.introText ||
    'Nous vous remercions de l\'intérêt que vous portez à Africa Connection Tours. Suite à votre demande, nous avons le plaisir de vous adresser cette proposition personnalisée, préparée avec le soin qui caractérise nos vingt-huit années d\'organisation de voyages au Sénégal.';
  const introSplit = doc.splitTextToSize(introText, W - 2 * M);
  doc.text(introSplit, M, y);
  y += introSplit.length * 5 + 8;

  // -----------------------------------------------------------
  // Détails / Message du client
  // -----------------------------------------------------------
  if (request.message) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Contexte de la demande', M, y);
    y += 3;
    doc.setDrawColor(...PDF_COLORS.border);
    doc.line(M, y, W - M, y);
    y += 5;

    doc.setFillColor(...PDF_COLORS.sand2);
    const msgLines = doc.splitTextToSize(request.message, W - 2 * M - 8);
    const boxH = msgLines.length * 5 + 8;
    doc.rect(M, y, W - 2 * M, boxH, 'F');
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.text(msgLines, M + 4, y + 6);
    y += boxH + 8;
  }

  // -----------------------------------------------------------
  // Proposition (lignes)
  // -----------------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Notre proposition', M, y);
  y += 3;
  doc.line(M, y, W - M, y);
  y += 6;

  // Placeholder de lignes de proposition. L'admin peut éditer avant
  // export (opts.lines). Sinon on inclut un template minimal.
  const lines = opts.lines || [
    { title: 'Programme personnalisé selon la demande',
      desc: 'Détails à compléter par l\'agence : itinéraire, hébergement, transport, guide, repas.' },
    { title: 'Accompagnement multilingue',
      desc: 'Guide francophone (option anglais / italien / allemand).' },
    { title: 'Transferts et logistique',
      desc: 'Véhicules climatisés, assurance responsabilité civile, coordination temps réel.' }
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  lines.forEach(l => {
    if (y > H - 60) { doc.addPage(); y = M; }
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(...PDF_COLORS.terra);
    doc.circle(M + 2, y - 1, 1.4, 'F');
    doc.text(l.title, M + 8, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...PDF_COLORS.muted);
    const descLines = doc.splitTextToSize(l.desc, W - 2 * M - 8);
    doc.text(descLines, M + 8, y);
    doc.setTextColor(...PDF_COLORS.ink);
    y += descLines.length * 5 + 5;
  });

  // -----------------------------------------------------------
  // Bloc tarif — "Sur devis" par défaut (directive ACT)
  // -----------------------------------------------------------
  y += 4;
  if (y > H - 70) { doc.addPage(); y = M; }
  doc.setFillColor(...PDF_COLORS.ink);
  doc.rect(M, y, W - 2 * M, 22, 'F');
  doc.setTextColor(...PDF_COLORS.sand);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TARIF', M + 4, y + 8);
  doc.setFontSize(14);
  const price = opts.price || 'Sur devis personnalisé';
  doc.text(price, W - M - 4, y + 8, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(opts.priceNote || 'Le tarif définitif est établi après validation du programme.',
           M + 4, y + 16);
  y += 30;

  // -----------------------------------------------------------
  // Prochaines étapes
  // -----------------------------------------------------------
  if (y > H - 60) { doc.addPage(); y = M; }
  doc.setTextColor(...PDF_COLORS.ink);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Prochaines étapes', M, y);
  y += 3;
  doc.setDrawColor(...PDF_COLORS.border);
  doc.line(M, y, W - M, y);
  y += 6;

  const steps = opts.steps || [
    'Validation de la proposition par vos soins.',
    'Signature du contrat de voyage et versement de l\'acompte (30% du montant total).',
    'Confirmation des réservations (hébergement, transport, guide).',
    'Envoi du carnet de voyage détaillé 30 jours avant le départ.'
  ];
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  steps.forEach((s, i) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PDF_COLORS.terra);
    doc.text(`${i + 1}.`, M, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...PDF_COLORS.ink);
    const sLines = doc.splitTextToSize(s, W - 2 * M - 8);
    doc.text(sLines, M + 6, y);
    y += sLines.length * 5 + 2;
  });

  // -----------------------------------------------------------
  // Footer légal (sur chaque page)
  // -----------------------------------------------------------
  const drawFooter = (page) => {
    doc.setPage(page);
    doc.setFillColor(...PDF_COLORS.sand2);
    doc.rect(0, H - 20, W, 20, 'F');
    doc.setTextColor(...PDF_COLORS.muted);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(company.address, M, H - 13);
    doc.text(`Tél : ${company.phone}   ·   ${company.email}   ·   ${company.website}`, M, H - 9);
    doc.text(`${company.name} — ${company.form}, capital ${company.capital}   ·   ${company.license}`, M, H - 5);
    doc.text(`Page ${page}/${doc.internal.getNumberOfPages()}`, W - M, H - 5, { align: 'right' });
  };
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) drawFooter(p);

  // -----------------------------------------------------------
  // Sauvegarde
  // -----------------------------------------------------------
  const fname = `ACT-devis-${refNumber(request)}-${(request.full_name || 'client').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.pdf`;
  doc.save(fname);
  return fname;
}

if (typeof window !== 'undefined') window.generateDevisPDF = generateDevisPDF;
export { generateDevisPDF };
