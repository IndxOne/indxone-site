# SITE-001 — corrections avant refonte

Branche : `ux/premium-site-preview`. Base : `bd34627206a784e7b6de79e2727fb74a2389efbc`.

## Livré

Validation stricte, dates séparées, honeypot transmis, UUID stable, reçus atomiques, erreurs JSON/null gérées, isolation Preview, erreurs client lisibles, build bloquant et CSS unique. Tests exécutent le code réel. Node 24 et dépendances corrigées. Kit : jours et calendrier explicitement définis au devis ; aucun engagement six jours associé implicitement au prix d'entrée.

## Validation

- 49 tests unitaires : handlers, client guidé, client contact, build réel.
- Lint CSS/HTML et build : à confirmer au HEAD final.
- npm audit : zéro vulnérabilité lors de la mise à jour du 29 septembre 2026.
- Tests E2E adaptés à la séparation des dates ; suite navigateur non exécutée localement pendant cette livraison. GitHub CI et GitLab CI les exécutent.
- Aucun envoi réel Forms/Blobs, aucune publication production.

## Source et Preview

Le déploiement actif Netlify indique un commit GitLab. Une PR GitHub ne suffit donc pas à déclencher le Preview officiel. Importer cette branche côté GitLab et ouvrir une Merge Request ; vérifier que Netlify crée un Deploy Preview au SHA exact. Ne pas fusionner main.

```bash
git fetch origin ux/premium-site-preview
git switch --track origin/ux/premium-site-preview
git remote add gitlab https://gitlab.com/indxone-group/indxone-site.git
git push gitlab ux/premium-site-preview
```

Si `gitlab` existe déjà, vérifier son URL au lieu de l'ajouter. Adapter `origin` si le clone local utilise déjà GitLab : la source de cette branche est GitHub.

## Points encore ouverts

Protection de `main` : non modifiée. Les outils connectés ne proposent pas cette mutation. Protéger la source GitLab avec passage par Merge Request et pipeline réussi ; conserver une règle compatible avec le miroir GitHub afin de ne pas bloquer sa synchronisation.

Vérifier le runtime Functions après build : Node 24 attendu, sauf override `AWS_LAMBDA_JS_RUNTIME` déjà configuré dans Netlify. Aucun scope d'environnement supplémentaire nécessaire à l'isolation Preview.

Design : maquettes desktop et mobile, choix visuel avant intégration. Aucun design généré traité comme un écran implémenté. Budget cible : image WebP/AVIF responsive, pas de vidéo ni WebGL, animations limitées et `prefers-reduced-motion`, bouton principal accessible dans le premier viewport, cibles tactiles 44px, test 320/390/768/1440px.
