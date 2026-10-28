# BRAND-01-V2 — Site Vitrine : favicon et assets

Statut : implémentation candidate sur branche dédiée, non publiée ; PR Draft empilée sur la fondation [#13](https://github.com/IndxOne/indxone-site/pull/13).

## Source de vérité

- `brand/assets/indxone-monogram.svg` : monogramme ix + arc validé dans la fondation ; inchangé.
- `favicon.svg` : déclinaison du Site avec fond ivoire, mêmes tracés du monogramme, meilleure lecture sur onglets sombres.
- `_includes/brand-head.html` : balises de favicon, manifest, iPhone et thème partagées par toutes les pages. La version de query `brand01v2` permet l'invalidation du cache HTTP ; les raccourcis iOS déjà installés peuvent nécessiter une nouvelle installation.
- `scripts/generate-favicons.js` : depuis le même SVG, génération déterministe **au build** des PNG 16/32/48/180/192/512 et de favicon.ico multi-tailles (entrées PNG). sharp est déjà dans le package-lock.
- `img/site.webmanifest` : métadonnées réduites aux fonctionnalités réelles. Site marketing **sans service worker** : `display: browser` et pas de promesse d'accès hors ligne ; pas d'icône maskable requise.
- Assets `img/icon-ix.*` et anciennes variantes WebP historiques conservés dans le dépôt pour éviter toute régression SEO ; la cohérence des images Open Graph est un lot séparé, sans impact sur les favicons navigateur.

## Preuves attendues

1. CI GitHub : lint + unitaires (tailles PNG, ICO, HTML des routes) + build + E2E.
2. Preview Netlify sur SHA exact, sans publication `main`.
3. QA navigateurs : 16 et 32 px, onglets clair/sombre, favicon.ico, manifest 192/512 ; iPhone Safari Apple Touch 180.
4. QA responsive 320/375/390 px et desktop ; vérification SEO, formulaires, tarifs inchangés.
5. Gate humain : aucun merge ni production avant GO explicite.

Risque : le jeu de ressources raster est généré dans `dist/`, pas committé sous `img/`. Une copie du dépôt sans exécuter `npm run build` conserve les anciens PNG, conformément à l'architecture de publication existante. Les builds Netlify/GitHub utilisent `npm run build`.
