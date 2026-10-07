# SEO-002A — audit technique vitrine

Source de vérité : https://github.com/IndxOne/indxone-site/issues/7.
Audit en lecture seule effectué avant correction sur `ux/premium-site-preview`,
base `0e3ae4ae18d234e3d4e490ca04cdbedcc1da426c`, le 7 octobre 2026.

## URLs avant correction

Les URLs ci-dessous sont sur `https://indxone.com`. Les statuts sont ceux des
règles locales, pas une inspection Google. Les réécritures 200 servent le HTML
sans redirection du navigateur. Le build transforme les deux fichiers légaux
racine en dossiers contenant `index.html`.

| Source sitemap | Redirection | URL finale | Canonical HTML assemblé | Indexabilité prévue | Sitemap |
| --- | --- | --- | --- | --- | --- |
| `/` | aucune | `/` | absent | publique, sans noindex | conserver |
| `/collectivites` | 301 | `/collectivites/` | absent | publique, sans noindex | remplacer par finale |
| `/projets/` | réécriture 200 | `/projets/` | absent | publique, sans noindex | conserver, sans forcer indexation |
| `/mentions-legales` | 301 | `/mentions-legales/` | absent | publique, index/follow | remplacer par finale |
| `/politique-confidentialite` | 301 | `/politique-confidentialite/` | absent | publique, index/follow | remplacer par finale |
| `/accessibilite` | 301 | `/accessibilite/` | absent | publique, index/follow | remplacer par finale |
| `/votre-idee/` (absente) | réécriture 200 ; variante sans slash en 301 | `/votre-idee/` | `/votre-idee` | publique, sans noindex ; indexée selon issue | ajouter et corriger canonical |

Fichiers lus : sitemap, robots, redirects, netlify.toml, les sept sources HTML,
leurs includes, le build, les tests et la configuration CI.
`netlify.toml` n'ajoute aucune redirection aux sept URLs publiques ni noindex.
`/merci/` et `404.html` déclarent noindex. Le fragment temporaire
`startup-launch-kit-bloc.html` n'est pas publié par le build. Les sources,
administrations, APIs, URLs Netlify et Preview ne sont pas des pages du sitemap.
Aucune landing page ajoutée. Aucun travail sur les autres domaines.

## Diff minimal retenu

- Quatre URLs de sitemap prennent le slash final, ajout de `/votre-idee/`.
- Canonical existant de `/votre-idee/` aligné sur la finale. Aucun autre canonical
  existant incorrect trouvé ; absence documentée sans en ajouter à six pages.
- Retrait du Product duplicatif, Service et ses trois Offer conservés à l'identique.
- Un groupe robots universel conserve toutes les exclusions techniques existantes.
  Les groupes Googlebot/Bingbot/Slurp/DuckDuckBot supprimaient en pratique les
  protections du groupe générique pour les robots correspondants. Retrait des
  Allow redondants, Crawl-delay, Request-rate et Clean-param non compris par Google.
  Les motifs d'exclusion existants sont standards ; aucune ressource CSS, JS,
  image ou police nécessaire au rendu n'est concernée. Disallow ne garantit pas
  la confidentialité et ne remplace aucune protection applicative.
- Tests ciblés sans nouvelle dépendance, sur XML réellement parsé, HTML assemblé,
  redirections, JSON-LD et ressources référencées.

## Justification des lastmod

Les dates désignent la dernière modification significative de la page générée,
pas sa date de crawl, de build ou de publication production.

| Page | Date retenue | Preuve Git / modification |
| --- | --- | --- |
| `/` | 2026-10-03 | `126dc30` : contenu du parcours d'accueil |
| `/collectivites/` | 2026-10-07 | ce lot : correction du graphe de données structurées |
| `/projets/` | 2026-10-03 | `4fc1885` : contenu de la page |
| `/mentions-legales/` | 2026-10-03 | `d3209d1` : données structurées et footer partagé |
| `/politique-confidentialite/` | 2026-10-03 | `d3209d1` : données structurées et footer partagé |
| `/accessibilite/` | 2026-10-03 | footer partagé `d3209d1`, présent dans le HTML généré ; source propre `11a99fd` du 2026-09-03 |
| `/votre-idee/` | 2026-10-03 | `0e3ae4a` : formulaire en trois étapes ; correction canonical seule ne date pas le contenu du 7 octobre |

## Limites et points non traités

- `priority` et `changefreq` existants sont conservés. Proposition pour validation
  ultérieure : supprimer ces indications ignorées par Google, sans les optimiser.
  Aucun champ de ce type inventé pour la nouvelle entrée.
- Hreflang et og:url historiques sans slash sur certaines pages : documentés,
  non modifiés dans le périmètre explicitement demandé (canonical existant).
- Une absence de canonical explicite n'est pas une déclaration contradictoire.
- La syntaxe JSON-LD est validée localement ; Service n'offre pas la garantie d'un
  résultat enrichi Google. Aucune inspection, demande d'indexation ni soumission.
- Netlify production est relié à GitLab, selon le déploiement publié et SITE-001.
  Une poussée GitHub seule ne garantit pas un Deploy Preview au SHA livré.
- Le build publié et la production ne sont pas modifiés par ces corrections de branche.

Aucun changement Search Console. Production inchangée. SEO-002B non lancé.

## Contrôles locaux exécutés

- `npx vitest run tests/unit/seo.test.js` : 4 tests réussis.
- `npm run test:unit` : 54 tests réussis, 5 fichiers.
- `npm run lint` : CSS et HTML généré valides, code retour 0 ; inclut `build:all`.
- `npm run build:all` : réussi, code retour 0.
- `npx playwright test tests/e2e/seo.spec.js` : 6 tests réussis ; HTTP 200 pour
  les six cibles et les sept pages du sitemap, sans redirection sur les URLs finales.
- `npx playwright test tests/e2e/basic.spec.js` : 27 tests réussis.
- `npx prettier --check tests/unit/seo.test.js tests/e2e/seo.spec.js` : réussi.
- `git diff --check` : réussi.
- XML source et dist parsés avec ElementTree, sans erreur.
- Comparaison des artefacts : seuls sitemap, robots, Collectivités et Votre idée
  changent ; HTML hors JSON-LD/canonical strictement identique pour les deux pages.
- Comparaison navigateur avant/après à 390 et 1440 px sur quatre pages : huit
  captures full-page identiques, zéro erreur console/pageerror dans les deux versions.
  Fonts et analytics externes neutralisés à l'identique pour cette comparaison.

Les tests HTTP locaux utilisent le serveur statique du repo, pas le moteur
Netlify : les règles Netlify sont vérifiées séparément dans les tests unitaires.
Les deux premières tentatives navigateur ont été bloquées par l'interdiction
sandbox d'ouvrir un port ; les exécutions autorisées suivantes ont réussi.

## Limite Preview vérifiée

La branche GitLab `ux/premium-site-preview` renvoie 404 Branch Not Found sur le
projet `80204461`. GitHub ne déclare aucun déploiement pour cette branche. Les
outils connectés consultés ne fournissent pas de chemin permettant d'envoyer le
build local en brouillon au SHA exact avec le scope Preview explicitement garanti.
Aucun appel générique `deploy-site` effectué : il ne permet pas de sélectionner
le SHA ou le contexte dans son schéma. Aucun CLI Netlify ni credential Netlify
n'est configuré dans cet environnement.

La Preview distante et son smoke ne sont donc pas validés. Fournir un accès de
déploiement brouillon Netlify pour terminer cette étape. La contrainte de ne créer
aucune branche est respectée ; aucune branche GitLab n'a été créée ou importée.
La QA sur déploiement réel reste un point bloquant avant toute validation distante.
