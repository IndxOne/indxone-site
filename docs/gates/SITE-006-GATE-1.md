# SITE-006 — Gate 1

## Audit simplification

| Zone | Problème | Impact visiteur | Décision | Proposition |
|---|---|---|---|---|
| Accueil — structure | Après le hero, 7 blocs successifs se concurrencent : Terrain, point de départ, méthode, offres, réalisations, produits, à propos, puis contact. Plusieurs blocs prouvent ou expliquent la même chose. | Le visiteur comprend le début puis doit trier trop d'informations avant d'agir. | Simplifier | Construire un parcours principal : promesse → point de départ → preuves → contact. Reléguer offres détaillées, méthode et produits en second niveau si nécessaires. |
| Accueil — offres | « Audit & architecture », « système d'information », noms d'outils et « Kit de lancement » réintroduisent un vocabulaire de consultant après un hero volontairement simple. | Un non-tech doit traduire l'offre au lieu de reconnaître son problème. | Simplifier | Nommer les offres par résultat/besoin. Garder outils et expertise comme preuves secondaires. |
| Accueil — répétitions | Terrain, Réalisations et Produits IndxOne répètent plusieurs exemples (communes, transformation, Hub, TAGA). | Allonge la page et dilue les preuves fortes. | Supprimer / fusionner | Une seule section de preuves avec 3 cas maximum ; lien vers Réalisations pour approfondir. |
| Navigation | « Solutions », « Réalisations », « Collectivités », « À propos » + deux formulations CTA différentes (« Démarrer un projet » / « Échangeons sur votre projet »). | Deux appels à l'action semblent différents alors qu'ils conduisent au même parcours. | Simplifier | Unifier le CTA sur « Échangeons sur votre projet ». Conserver une navigation courte. |
| Réalisations | Page globalement accessible, mais « cockpit indépendant », « local-first » et certains libellés produit demandent une culture numérique. | Les preuves métier sont claires ; le bloc Hub casse légèrement cette simplicité. | Simplifier | Expliquer le bénéfice avant la caractéristique technique ; garder « local-first » en détail secondaire. |
| Formulaire — longueur | 6 étapes + récapitulatif, avec plusieurs questions obligatoires avant le contact. | Effort élevé pour quelqu'un qui veut simplement expliquer son besoin. | Simplifier | Viser 3 étapes : besoin → contexte essentiel → contact. Le reste se précise pendant l'échange. |
| Formulaire — jargon | « environnement technique et organisationnel », exemples ERP/M365/CRM, « cadrer », « piloter la mise en œuvre », « mise en production ». | Contredit la promesse d'un parcours accessible aux non-techniciens. | Simplifier | Questions quotidiennes : « Qu'utilisez-vous aujourd'hui ? », « Que voulez-vous améliorer ? », « Jusqu'où souhaitez-vous être accompagné ? ». |
| Footer | « Chef de projet SI & AMOA. Cadrage, pilotage et transformation des projets SI. » remet le jargon en conclusion. | Dernière impression plus technique que le parcours principal. | Simplifier | « Conseil et pilotage de projets numériques. » puis expertise SI/AMOA ailleurs en preuve. |

## Priorités

1. **Réduire l'accueil à un parcours unique.** Promesse → 4 points de départ → preuves → contact. Éliminer les répétitions avant tout ajout.
2. **Ramener le formulaire à 3 étapes.** Demander uniquement ce qui est nécessaire pour décider du prochain échange.
3. **Créer deux niveaux de lecture.** Texte principal compréhensible sans vocabulaire IT ; expertise, outils et termes SI accessibles en second niveau pour rassurer les interlocuteurs techniques.

## Invariants

- H1 : « Vos projets numériques, bien pilotés. »
- 4 portes d'entrée validées.
- TJM public : 620 € HT/j.
- Bloc Terrain conservé comme preuve, quitte à être fusionné avec les autres preuves.
- « Chef de projet SI & AMOA » conservé comme preuve d'expertise en second niveau.
- Production inchangée.
- Aucun changement fonctionnel dans cette Gate.

## Gate

**STOP HUMAN QA.**

Aucune implémentation avant validation humaine des trois priorités.