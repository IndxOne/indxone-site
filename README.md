# indxone-site

Site vitrine **https://indxone.com** — INDXONE SASU (consultant SI, offre collectivités, portfolio).

## Stack

- **HTML statique** + CSS modulaire (`css/style.css`) — Stack unique en production
- **Build** : PostCSS (purge) + assemble includes + minification HTML (`scripts/build.js`)
- **Déploiement** : **Netlify** (`dist/`, `netlify.toml`, `_redirects`)
- **Analytics** : **Plausible** (sans cookies publicitaires — voir `politique-confidentialite.html`)
- **Formulaires** : **Netlify Forms**
- **Tests** : Vitest (unit), Playwright (e2e)
- **Migration Astro** : Archivée — voir branche `feat/astro-migration`

## Commandes

```bash
npm install
npm run dev          # build + serve dist sur :8000
npm run build:all    # CSS + assemble + HTML → dist/
npm run lint
npm run test:all     # unit + e2e
npm run deploy       # build + netlify deploy --prod
```

## Structure

| Chemin | Rôle |
|--------|------|
| `index.html` | Accueil FR |
| `en/` | Pages EN |
| `collectivites/` | Offre mairies |
| `projets/` | Réalisations |
| `politique-confidentialite.html` | RGPD |
| `mentions-legales.html` | Mentions légales |
| `accessibilite/` | Déclaration d'accessibilité |
| `404.html` | Page erreur |
| `_includes/` | Fragments HTML (head, nav, footer) inclus via `scripts/assemble.js` |
| `scripts/build.js` | Pipeline de publication |
| `docs/SPEC-conformite-amelioration.md` | Roadmap conformité |

## Conformité

Voir `docs/SPEC-conformite-amelioration.md` pour la roadmap complète (Phases 0–3).

## Liens produits

- Hub : https://hub.indxone.com
- Démo mairie : https://mairies.indxone.com/mons-en-laonnois/

## Dépôt

GitLab : `indxone-group/indxone-site`
