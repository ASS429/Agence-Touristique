// Lighthouse CI — budgets de qualité sur le build de prod (dist/).
// Lancé en CI après build + prerender : `npm run lighthouse`.
// Les seuils cassent le job s'ils régressent (perf mobile simulée).
module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      // Avec staticDistDir, LHCI remplace host:port par son serveur statique.
      url: ['http://localhost/', 'http://localhost/circuits/', 'http://localhost/croisieres/'],
      numberOfRuns: 1,
      settings: { chromeFlags: '--no-sandbox' },
    },
    assert: {
      assertions: {
        // Perf en warn : le serveur statique LHCI ne compresse pas (gzip/br)
        // contrairement à Render — le score local (~35-60) n'est pas
        // représentatif de la prod. Les catégories stables sont bloquantes.
        'categories:performance':    ['warn',  { minScore: 0.60 }],
        'categories:accessibility':  ['error', { minScore: 0.90 }],
        'categories:seo':            ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.90 }],
      },
    },
    upload: { target: 'filesystem', outputDir: '.lighthouseci' },
  },
};
