# Audit Lighthouse — indxone.com/collectivites/

| Champ | Valeur |
|-------|--------|
| **Date** | 2026-05-18 |
| **URL** | https://indxone.com/collectivites/ |
| **Stratégie** | Mobile |

## Scores cibles (basés sur l'analyse de code)

| Catégorie | Cible | Notes |
|-----------|-------|-------|
| Performance | ≥ 85 | Page plus riche que l'accueil (5 cartes tarifs + mod-grid) |
| Accessibilité | ≥ 95 | Skip-link, ARIA, contrastes OK, rôle `alert` sur les alertes |
| Best Practices | ≥ 90 | HTTPS, doctype, pas d'erreurs JS, formulaires Netlify |
| SEO | ≥ 95 | meta description, OG, JSON-LD Product, hreflang, canonical |

## Correctifs inclus

- **CSS bundling** : `css/style.css` = bundle PostCSS optimisé (1 requête au lieu de 23)
- **Grille tarifaire** : prix catalogue barrés + tarif pilote fondateur avec badges d'économie
- **Maintenance** : tableau avec "Recommandé pour X" (tier recommandé)
- **RGPD natif** : promesse alignée avec la réalité technique (Plausible documenté)
- **Thème sombre** : compatibilité WCAG AA

## Observations

- La page charge ~28 Ko de HTML après minification
- Google Fonts avec `display=swap`
- Pas de JS bloquant (tous defer)
- PWA : manifest + splash screen sur certaines pages
