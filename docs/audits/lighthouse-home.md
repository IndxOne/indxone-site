# Audit Lighthouse — indxone.com (Page d'accueil)

| Champ | Valeur |
|-------|--------|
| **Date** | 2026-05-18 |
| **URL** | https://indxone.com/ |
| **Stratégie** | Mobile |
| **Build testé** | `npm run build:static` commit `HEAD` |

## Scores (à mesurer sur un poste avec Chrome)

> L'audit automatisé n'a pas pu être lancé dans l'environnement CI actuel (Chrome 148 incompatible avec Lighthouse v10 sous Node 18).  
> Les scores ci-dessous sont des **cibles documentées** basées sur l'analyse de code et les correctifs appliqués.

| Catégorie | Cible | Statut |
|-----------|-------|--------|
| Performance | ≥ 90 | ⬜ À vérifier |
| Accessibilité | ≥ 95 | ✅ Cible atteignable (skip-links, ARIA, contrastes) |
| Best Practices | ≥ 95 | ✅ Cible atteignable (HTTPS, doctype, pas d'erreurs JS) |
| SEO | ≥ 95 | ✅ Cible atteignable (meta, OG, hreflang, JSON-LD, sitemap) |

## Correctifs appliqués pendant l'audit

### CSS Bundling (réduction de 23 requêtes à 1)

**Problème :** Le HTML référençait `css/style.css` qui contenait 22 `@import` pointant vers des modules individuels. Le navigateur effectuait 23 requêtes HTTP séquentielles au lieu d'une seule.

**Correctif :** `scripts/build.js` écrase désormais `dist/css/style.css` avec le bundle PostCSS optimisé (purge + minification). Le fichier passe de 785 octets (imports) à 39 Ko (contenu réel).

**Fichier :** `scripts/build.js:158` — ajout de `fs.writeFileSync(path.join(DIST, 'css/style.css'), result.css);`

### PurgeCSS (timeout évité)

**Problème :** Le glob `'./**/*.html'` dans `postcss.config.js` scannait `node_modules/`, ralentissant considérablement le build.

**Correctif :** Chemins explicites vers les sources HTML uniquement.

**Fichier :** `postcss.config.js:6-11`

## Métriques clés (analyse statique)

| Métrique | Valeur estimée | Note |
|----------|----------------|------|
| Taille totale dist/ | 710 Ko | ✅ Très léger |
| CSS | 39 Ko (1 requête) | ✅ Optimisé |
| JS | 14 Ko (1 fichier, defer) | ✅ Non bloquant |
| Polices | Google Fonts avec `display=swap` | ✅ OK |
| Images | SVG inline + favicons | ✅ Pas d'images raster bloquantes |
| Requêtes CSS avant fix | 23 | 🛠️ Corrigé → 1 |
| Requêtes CSS après fix | 1 | ✅ OK |

## Prochaines améliorations

1. **Self-hosting polices** : remplacer Google Fonts par des fichiers WOFF2 auto-hébergés (supprime une requête externe bloquante).
2. **Preload police critique** : ajouter `<link rel="preload">` pour la police Sora utilisée dans le hero.
3. **Lazy loading** : si des images raster sont ajoutées, utiliser `loading="lazy"`.
4. **Rapport Lighthouse réel** : lancer depuis Chrome desktop en production et archiver le HTML.
