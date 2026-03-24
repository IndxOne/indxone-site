/**
 * INDXONE — Mairie Engine v3
 * Plugin registry · orchestre les renderers selon C.sections + C.tier
 * Aucune référence directe aux sections — 0 modification nécessaire pour ajouter une feature.
 */
(function() {
  'use strict';

  /* ── Feature map par tier ── */
  const TIER_SECTIONS = {
    vitrine:   ['services','carte','contact'],
    active: ['meteo','actualites','sidebar','services','agenda','elus','signalement','score','carte','contact'],
    connectee: ['urgence','actualites','sidebar','services','agenda','meteo','score','carte','contact'],
    premium:   ['urgence','actualites','sidebar','services','agenda','meteo','signalement','score','galerie','elus','carte','contact'],
  };

  /* ── CSS tokens globaux ── */
  const BASE_CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased}
body{font-family:'DM Sans',sans-serif;color:var(--text);background:var(--bg);font-size:16px;line-height:1.65}
.skip-link{position:absolute;top:-100px;left:1rem;background:var(--forest);color:#fff;padding:8px 16px;border-radius:0 0 6px 6px;font-size:.875rem;font-weight:500;text-decoration:none;z-index:9999;transition:top .2s}
.skip-link:focus{top:0}
.si{max-width:1200px;margin:0 auto;padding:0 5vw}
.section-title{font-family:Georgia,serif;font-weight:700;font-size:1.35rem;color:var(--deep);margin-bottom:1.2rem;padding-bottom:.6rem;border-bottom:2px solid var(--sage);display:flex;align-items:center;gap:10px}
.rv{opacity:0;transform:translateY(22px);transition:opacity .6s ease,transform .6s ease}
.rv.visible{opacity:1;transform:translateY(0)}
.btn{display:inline-flex;align-items:center;gap:8px;padding:11px 24px;border-radius:8px;font-size:.875rem;font-weight:500;text-decoration:none;transition:all .22s;cursor:pointer;border:1.5px solid transparent;white-space:nowrap}
.btn:focus-visible{outline:3px solid var(--accent);outline-offset:2px}
`;

  /* ── Helpers globaux ── */
  const $ = id => document.getElementById(id);
  const icon = (path, size=15) =>
    `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;

  const ICONS = {
    clock:    '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    phone:    '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6z"/>',
    mail:     '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
    pin:      '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    map:      '<polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>',
    send:     '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
    globe:    '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    warn:     '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  };

  /* ── Plugin registry ── */
  const _registry = {};  // { id: { order, render, css? } }

  function register(plugin) {
    if (!plugin.id || typeof plugin.render !== 'function') {
      console.warn('INDXONE: plugin invalide', plugin);
      return;
    }
    _registry[plugin.id] = plugin;
  }

  /* ── Inject CSS ── */
  function injectCSS(css) {
    const s = document.createElement('style');
    s.textContent = css;
    document.head.appendChild(s);
  }

  /* ── Apply design tokens ── */
  function applyTokens(C) {
    const t = C.design?.tokens || {};
    const r = document.documentElement.style;
    const map = {
      '--primary':   t.primary       || '#2D5016',
      '--primary-d': t.primaryDark   || '#1C2E1A',
      '--accent':    t.accent        || '#5B8A6B',
      '--highlight': t.highlight     || '#C4703A',
      '--success':   '#22c55e',
      '--danger':    '#ef4444',
      '--light':     t.light         || '#EBF2E4',
      '--dark':      t.dark          || '#1C2E1A',
      '--deep':      t.dark          || '#1C2E1A',
      '--text':      t.text          || '#2C3620',
      '--muted':     t.muted         || '#5C6B60',
      '--border':    t.border        || 'rgba(91,138,107,0.18)',
      '--white':     '#FFFFFF',
      '--bg':        t.bg            || '#F5F0E8',
      '--bg2':       t.light         || '#EBF2E4',
      '--card':      '#FFFFFF',
      '--card-bg':   '#FFFFFF',
    };
    Object.entries(map).forEach(([k, v]) => r.setProperty(k, v));
  }

  /* ── SEO ── */
  function applySEO(C) {
    document.title = C.seo?.title || C.commune.nomComplet;
    const m = document.querySelector('meta[name="description"]');
    if (m) m.content = C.seo?.description || '';
    const link = document.createElement('link');
    link.rel = 'canonical';
    link.href = C.seo?.canonical || '';
    document.head.appendChild(link);
    // JSON-LD
    const ld = {
      '@context': 'https://schema.org',
      '@type': 'GovernmentOrganization',
      name: C.commune.nomComplet,
      url: C.seo?.canonical || '',
      telephone: C.contact.telephone,
      email: C.contact.email,
      address: {
        '@type': 'PostalAddress',
        streetAddress: C.contact.adresse,
        addressLocality: C.commune.nom,
        postalCode: C.commune.codePostal,
        addressCountry: 'FR',
      },
    };
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(ld);
    document.head.appendChild(s);
  }

  /* ── Scroll reveal ── */
  function initReveal() {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.rv').forEach(el => obs.observe(el));
  }

  /* ── Boot ── */
  function boot(C) {
    applyTokens(C);
    applySEO(C);
    injectCSS(BASE_CSS);

    // Résoudre sections : config > tier map > défaut tier
    const sections = C.sections || TIER_SECTIONS[C.tier] || TIER_SECTIONS.vitrine;

    // Core toujours en premier (nav, hero, info-strip, footer)
    if (_registry.core) {
      if (_registry.core.css) injectCSS(_registry.core.css);
      _registry.core.render(C, { $, icon, ICONS });
    }

    // Sections ordonnées
    const main = $('main');
    sections.forEach(id => {
      const p = _registry[id];
      if (!p) { console.warn(`INDXONE: renderer "${id}" non trouvé`); return; }
      if (p.css) injectCSS(p.css);
      p.render(C, main, { $, icon, ICONS });
    });

    // Urgence (hors sections, injection directe)
    if (C.urgence?.actif && _registry.urgence) {
      if (_registry.urgence.css) injectCSS(_registry.urgence.css);
      _registry.urgence.render(C, $('urgence'), { icon, ICONS });
    }

    initReveal();
  }

  /* ── Public API ── */
  window.INDXONE = { register, boot, ICONS, icon, $ };

  // Auto-boot quand le DOM est prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (typeof MAIRIE_CONFIG !== 'undefined') boot(MAIRIE_CONFIG);
    });
  } else {
    if (typeof MAIRIE_CONFIG !== 'undefined') boot(MAIRIE_CONFIG);
  }

})();
