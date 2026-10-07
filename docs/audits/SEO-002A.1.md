# SEO-002A.1 — alignement des métadonnées publiques

Issue source : https://github.com/IndxOne/indxone-site/issues/8.
Branche : `ux/premium-site-preview`.
Audit lecture seule du 7 octobre 2026 avant toute modification, base
`cc00efb7d78dbdeaab0d93719e83ab2c30013041`.
Ce HEAD est un commit vide de retrigger Netlify, sans changement fonctionnel.
GitHub est la source de vérité ; Netlify est connecté à GitHub selon le contexte
validé de ce lot. Les remarques GitLab du précédent audit ne décrivent plus cette
configuration. Aucun travail GitLab ni déploiement manuel dans ce lot.

## Tableau avant modification

Tous les chemins de métadonnées ci-dessous sont sur `https://indxone.com`, sans www.
`—` signifie absence de balise. Les pages ont été lues avec leurs includes
assemblés, ainsi que `_redirects`, `sitemap.xml`, `netlify.toml` et le build.

| URL finale | Canonical avant | hreflang avant | og:url avant | Écart confirmé |
| --- | --- | --- | --- | --- |
| `/` | — | fr et x-default → `/` | `/` | canonical absent |
| `/collectivites/` | — | fr et x-default → `/collectivites` | `/collectivites` | canonical absent ; métadonnées vers une 301 |
| `/projets/` | — | — | — | canonical et og:url absents |
| `/votre-idee/` | `/votre-idee/` | — | — | og:url absent |
| `/mentions-legales/` | — | fr et x-default → `/mentions-legales` | `/mentions-legales` | canonical absent ; métadonnées vers une 301 |
| `/politique-confidentialite/` | — | fr et x-default → `/politique-confidentialite` | `/politique-confidentialite` | canonical absent ; métadonnées vers une 301 |
| `/accessibilite/` | — | fr et x-default → `/accessibilite` | — | canonical/og:url absents ; hreflang vers une 301 |

Les routes sans slash passent par les 301 déclarées dans `_redirects` ; les
routes finales sont servies directement ou par réécriture 200. Le build génère
les deux pages légales sous leur dossier final. Aucune redirection locale connue
ne s'applique aux sept URLs finales du sitemap.

## Langues réellement supportées

Les sept pages ont `lang="fr"`. Aucune page `/en/` ni autre locale n'existe dans
le dépôt ou la liste des pages publiées par `scripts/build.js`.
`_includes/head-simple-en.html` est un fragment anglais inutilisé, sans page
publique qui l'inclut. Le build contient une suppression historique de hreflang
anglais ; aucune balise hreflang en active n'est actuellement trouvée dans les
sources publiques. Aucune suppression supplémentaire nécessaire ou proposée.
Le fragment et le build restent inchangés. Aucun hreflang ou contenu anglais créé.

## Tableau après correction

| URL finale | Canonical après | hreflang après | og:url après |
| --- | --- | --- | --- |
| `/` | `/` | fr et x-default → `/` | `/` |
| `/collectivites/` | `/collectivites/` | fr et x-default → `/collectivites/` | `/collectivites/` |
| `/projets/` | `/projets/` | — | `/projets/` |
| `/votre-idee/` | `/votre-idee/` | — | `/votre-idee/` |
| `/mentions-legales/` | `/mentions-legales/` | fr et x-default → `/mentions-legales/` | `/mentions-legales/` |
| `/politique-confidentialite/` | `/politique-confidentialite/` | fr et x-default → `/politique-confidentialite/` | `/politique-confidentialite/` |
| `/accessibilite/` | `/accessibilite/` | fr et x-default → `/accessibilite/` | `/accessibilite/` |

Six canonicals ajoutés ; canonical Votre idée conservé ; trois og:url ajoutés et
trois og:url corrigés ; huit hreflang existants corrigés.
Sitemap, dates lastmod, robots, redirects, JSON-LD, CSS/JS, prix, contenu visible,
positionnement et fonctionnement des formulaires conservés.

## Contrôles et limites

Les tests SEO existants vérifient désormais la présence d'un canonical unique et
d'un og:url unique sur chaque page, leur égalité à l'URL finale, le domaine HTTPS
sans www, l'absence de redirection locale et de cible Preview/Netlify, les
hreflang supportés avec source réelle en français, et le jeu exact des sept URLs
du sitemap. Le smoke navigateur couvre les sept pages et les deux fichiers SEO.
Les acquis JSON-LD et robots de SEO-002A restent contrôlés.

La validation HTTP locale utilise un serveur statique ; les règles Netlify sont
contrôlées séparément dans le dépôt. La Deploy Preview distante reste une gate
externe distincte selon l'issue #8. Aucun déploiement manuel ou production pour
contourner cette gate. Aucun appel Search Console.

Production inchangée. Aucun changement Search Console. Aucun merge vers main.

## Résultats de validation

- `npx vitest run tests/unit/seo.test.js` : 5 tests réussis.
- `npm run test:unit` : 55 tests réussis dans 5 fichiers.
- `npm run lint` : code retour 0, CSS et HTML généré valides.
- `npm run build:all` : code retour 0, build réussi.
- `npx playwright test tests/e2e/seo.spec.js` : 9 tests réussis, couvrant les
  sept pages, le sitemap et robots. Exécution confirmée après stabilisation du build.
- `npx prettier --check tests/unit/seo.test.js tests/e2e/seo.spec.js` : code retour 0.
- `git diff --check` : code retour 0.
- Comparaison DOM avant/après des sept sources assemblées : body strictement
  identique ; tous les éléments du head hors canonical/hreflang/og:url identiques.
- Lecture des sept HTML de dist : canonical et og:url égaux à chaque URL du sitemap.

Aucune suite E2E complète supplémentaire lancée : le lot modifie seulement les
métadonnées et le smoke SEO exigé est vert. La validation Netlify distante est
hors de cette gate et reste à réaliser sur une Preview confirmée.
