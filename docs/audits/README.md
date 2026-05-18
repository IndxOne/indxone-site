# Audits Lighthouse — INDXONE

Ce dossier archive les rapports Lighthouse et les analyses de performance pour le site indxone.com.

## Rapports disponibles

| Page | Fichier | Statut |
|------|---------|--------|
| https://indxone.com/ | `lighthouse-home.md` | ✅ Analyse de code |
| https://indxone.com/collectivites/ | `lighthouse-collectivites.md` | ✅ Analyse de code |
| https://indxone.com/en/ | `lighthouse-en.md` | ✅ Analyse de code |

## Comment lancer un audit réel

```bash
# Installation
npm install -g lighthouse

# Audit desktop
lighthouse https://indxone.com/ --view --output html --output-path ./docs/audits/lighthouse-home.html

# Audit mobile (stratégie par défaut)
lighthouse https://indxone.com/ --view --output html --output-path ./docs/audits/lighthouse-home-mobile.html \
  --chrome-flags="--headless --no-sandbox"
```

## Correctifs appliqués pendant cet audit

| Correctif | Impact | Fichier |
|-----------|--------|---------|
| CSS bundling : style.css = bundle optimisé | 23 requêtes → 1 | `scripts/build.js:158` |
| PurgeCSS : chemins explicites (évite node_modules) | Build plus rapide | `postcss.config.js:6-11` |
| Maintenance tiers : badges "Recommandé pour X" | UX améliorée | `collectivites/index.html` |
| Prix catalogue barrés + pilote fondateur | Transparence tarifaire | `collectivites/index.html` |

## Prochaines améliorations recommandées

1. **Self-hosting des polices** (WOFF2) pour supprimer la requête Google Fonts
2. **Preload police critique** Sora dans le `<head>`
3. **Audit réel depuis un navigateur** pour valider les scores et archiver le HTML
4. **Lazy loading** si des images raster sont ajoutées à l'avenir
