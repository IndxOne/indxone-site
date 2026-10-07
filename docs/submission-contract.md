# Contrat de soumission — 2026-09-29

## Endpoints

| Endpoint | Méthode | Format |
|---|---|---|
| `/api/submit-idee` | POST | JSON, parcours guidé |
| `/api/contact` | POST | JSON, contact FR/EN |

Les anciennes mentions `/api/submit-idea` et `/merci-idee` ne désignent pas des routes du site. Confirmation actuelle : `/merci/`.

## Validation

Corps JSON objet, 32 KiB maximum ; types primitifs, longueurs, email, enums et réponses obligatoires validés côté serveur. Origine navigateur limitée au domaine de la requête ; cette vérification ne constitue pas une authentification.

- `submission_id` : UUID v4 persistant pour une demande et ses retries.
- `started_at` : début du brouillon, au moins trois secondes avant l'envoi ; un brouillon ancien reste acceptable.
- `created_at` : nouvel horodatage à chaque tentative, écart serveur maximal cinq minutes.
- `company_name` : honeypot du parcours guidé, envoyé mais jamais stocké dans le brouillon.
- Contact historique : honeypot `bot_field`, langue `fr` ou `en`.
- Consentement guidé : `{ accepted: true, accepted_at: ISO }`. Jamais restauré automatiquement après rechargement.

Les champs optionnels possèdent également des bornes. Les champs de réponse inconnus sont refusés.

## Livraison et retries

Production publiée uniquement : POST URL-encoded vers Netlify Forms. Destination explicite de configuration, sinon URL du site fournie par le contexte Netlify, sinon domaine INDXONE.

Avant transmission : reçu atomique Netlify Blobs, consistance forte, clé formulaire/UUID. Le reçu contient hash des champs normalisés, état et date ; aucun nom, email ou texte de réponse en clair.

- UUID déjà livré, mêmes champs : retour de succès sans nouvel envoi.
- UUID réutilisé avec champs différents : conflit.
- Transmission concurrente : une seule instance transmet.
- Échec HTTP explicite : retry possible.
- Résultat réseau ambigu ou reçu resté `pending` : pas de retransmission ; consulter Netlify Forms puis réconcilier le reçu avant reprise.

Les reçus persistent ; suppression manuelle possible dans le dashboard Blobs. Leur purge retire la garantie de déduplication pour les identifiants concernés.

## Preview et local

Tout contexte autre que `production`, ainsi que les déploiements non publiés, renvoie `{ ok: false, simulated: true }` après validation. Aucun POST externe, aucun accès au store. Le client annonce la simulation et conserve les réponses ; il ne redirige pas vers une confirmation réelle.

Aucune variable avec scope Functions spécifique nécessaire pour cette isolation : elle repose sur `context.deploy`.

## Limites

Netlify Forms reste accessible directement sur le site : la validation de la fonction ne remplace pas le filtre antispam natif et ne protège pas tous les chemins d'ingestion Netlify. Aucun email transactionnel personnalisé ni connexion CRM ajoutés.

Notifications et réception réelle à vérifier dans le dashboard avant publication production. Le HTTP 2xx du service externe seul ne constitue pas une preuve d'enregistrement inspectée dans le dashboard.
