# INDXONE

Vitrine statique : HTML, CSS modulaire, JavaScript. Publication Netlify depuis `dist/` ; source de déploiement actuelle : GitLab. GitHub sert de miroir et de revue.

## Développement

Node 24, npm 11 ou supérieur.

```bash
npm ci
npm run dev
npm run lint
npm run test:unit
npm run test:e2e
```

`dev` reconstruit le site lors des changements HTML, CSS et JavaScript. Le serveur statique local ne fournit pas les fonctions : leurs handlers sont testés directement dans Vitest ; utiliser Netlify Dev pour une vérification intégrée.

## Build et Preview

```bash
npm run build
npm run deploy
```

Le build échoue et supprime l'artefact partiel si une page, un include ou un bundle obligatoire manque ou est invalide. CSS compilé une fois, fichiers internes exclus de `dist/`.

`deploy` crée uniquement un brouillon Netlify avec la CLI authentifiée. Aucun script de publication production. Sans contexte production publié, les API valident puis répondent explicitement en mode simulation : aucune demande envoyée ni écriture Blobs.

## Formulaires

- `/api/submit-idee` : parcours guidé avec brouillon local, honeypot, consentement renouvelé et UUID stable.
- `/api/contact` : contrat du formulaire contact historique, FR/EN.
- En production : Netlify Forms reçoit les champs déclarés dans le HTML.
- Netlify Blobs conserve uniquement un reçu technique (hash, état, date) pour empêcher les doubles envois, y compris entre instances et déploiements.
- Réponse réseau ambiguë : aucun nouvel envoi automatique. Réconciliation manuelle avant reprise.

Contrat : [docs/submission-contract.md](docs/submission-contract.md). Validation et transfert GitLab : [docs/gates/SITE-001.md](docs/gates/SITE-001.md).

## Tests

Les tests unitaires exécutent le vrai code client, les vrais handlers et le vrai pipeline de build. Les appels externes sont simulés ; leur succès ne prouve pas la réception Netlify réelle. Les tests navigateur vérifient les pages, le mobile et le parcours guidé.
