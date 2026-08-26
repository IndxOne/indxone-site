# Contrat de transmission — /votre-idee

Date : 26 août 2026
Auteur : Big Pickle (Lot B4.1)
Statut : draft — en attente de la page /votre-idee (Lot B3)

## 1. Payload versionné

Chaque soumission doit contenir les champs suivants. Le champ `form_version` permet
de suivre les évolutions du formulaire sans casser les soumissions existantes.

```jsonc
{
  "form_version": "1.0.0",          // semver — incrémente à chaque modification du formulaire
  "submission_id": "uuid-v4",       // identifiant unique côté client, non sensible
  "created_at": "2026-08-26T14:30:00.000Z", // UTC, ISO 8601
  "project_type": "mariage",        // valeur du choix initial (enum contrôlé)
  "responses": {
    "trunk": {
      "que_souhaitez_vous": "...",
      "pour_qui": "...",
      "que_doit_on_pouvoir_faire": "...",
      "quelle_ambiance": "...",
      "exemples": "...",
      "quand_comencer": "...",
      "enveloppe": "...",
      "accompagnement": "...",
      "liens_inspirations": "..."
    },
    "conditional": {
      // Clés variables selon project_type — voir §2
    }
  },
  "contact": {
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean@example.com",
    "phone": ""                       // optionnel
  },
  "consent": {
    "accepted": true,
    "accepted_at": "2026-08-26T14:29:55.000Z"
  },
  "meta": {
    "origin": "https://indxone.com/votre-idee",
    "referrer": "https://indxone.com/",
    "utm_source": "",
    "utm_medium": "",
    "utm_campaign": "",
    "user_agent": "Mozilla/5.0 ...",
    "language": "fr"
  },
  "status": "submitted",            // état initial — voir §4
  "attachments": []                  // MVP: vide. Champ réservé pour future extension.
}
```

## 2. Champs conditionnels par project_type

| project_type          | Clés conditionnelles attendues                                          |
|----------------------|-------------------------------------------------------------------------|
| mariage              | date_lieu, nb_invites, services_invites, gestion_reponses, style       |
| site                 | activite_suject, pages_indispensables, nom_domaine, auto_edition, exemples |
| application          | probleme, actions_principales, utilisateurs, usage_mobile_web, premiere_version |
| activite             | offre, clients_visis, contact_actuel, taches_a_simplifier, priorite    |
| idee_floue           | origine, situation_genuante, resultat_ideal, personnes_concernees, niveau_aide |

## 3. Validation côté serveur

### 3.1 Champs obligatoires

- `form_version` : non vide, format semver
- `submission_id` : UUID v4 valide
- `project_type` : dans l'enum autorisé
- `contact.nom` : 1–100 caractères, nettoyé
- `contact.email` : format email valide (RFC 5322 simplifié)
- `consent.accepted` : `true`
- `consent.accepted_at` : ISO 8601 valide, dans les 24h

### 3.2 Limites

- `responses.trunk.*` : max 2000 caractères chacun
- `responses.conditional.*` : max 2000 caractères chacun
- `contact.*` : max 200 caractères
- Nombre max de clés dans `responses.conditional` : 10

### 3.3 Nettoyage (sanitization)

- Supprimer les balises HTML (`<script>`, `<iframe>`, etc.)
- Supprimer les caractères de contrôle (U+0000–U+001F sauf \t, \n, \r)
- Trim sur toutes les valeurs string
- Normaliser les espaces multiples en un seul

### 3.4 Rejet

Le serveur rejette avec HTTP 400 si :
- Un champ obligatoire manque
- Un champ dépasse la limite
- Le consentement n'est pas accepté
- Le `submission_id` n'est pas un UUID v4
- Le `form_version` n'est pas reconnu
- L'email est invalide

## 4. Machine à états

```
submitted → acknowledged → reviewed → contacted → closed
                                      → archived
```

- `submitted` : état initial après transmission
- `acknowledged` : accusé de réception envoyé au demandeur
- `reviewed` : INDXONE a lu la demande
- `contacted` : échange démarré avec le demandeur
- `closed` : demande traitée
- `archived` : conservée pour historique

## 5. Antispam

### 5.1 Honeypot

Champ caché `company_name` — doit être vide. Valeur non vide → rejet silencieux (200 OK pour ne pas révéler le mécanisme).

### 5.2 Timing

Si `created_at` est antérieur de < 3 secondes au timestamp serveur → rejet silencieux.
Le formulaire affiche "Envoi en cours…" pendant 3s minimum avant de permettre la soumission.

### 5.3 Double clic

Le bouton se désactive dès le premier clic. Le `submission_id` est envoyé ; si déjà
traité, le serveur retourne 200 OK (idempotent) sans créer de doublon.

### 5.4 Rate limiting

Netlify Functions : 100 appels/minute par function. Pas de rate-limiting custom nécessaire
pour le MVP. Si spam malgré le honeypot, ajouter un token temporel signé côté client.

## 6. Transmission

### 6.1 Canal principal : Netlify Forms

Le formulaire `/votre-idee` utilise `data-netlify="true"` avec submission AJAX.
La fonction `submit-idea` intercepte, valide et transmet à Netlify Forms.

### 6.2 Notification INDXONE

Netlify envoie un email de notification automatique à l'adresse configurée dans
les settings du formulaire. Cette notification n'est active que si elle est
réellement configurée dans le dashboard Netlify.

### 6.3 Accusé de réception

Le serveur redirige vers `/merci-idee` après soumission réussie. La page affiche :
- Confirmation de réception
- Résumé lisible des réponses
- Identifiant de demande (submission_id tronqué)
- Prochaine étape réelle

### 6.4 Pas d'email transactionnel dans le MVP

L'envoi d'email de confirmation au demandeur n'est implémenté que si un service
d'email transactionnel (Resend, SendGrid, etc.) est explicitement configuré.
Sans ce service, la page de confirmation suffit.

## 7. Conservation et suppression

### 7.1 Durée de conservation

- Données Netlify Forms : conservées dans le dashboard, supprimables manuellement
- Pas de base de données supplémentaire pour le MVP
- Quand Hub sera connecté : les soumissions validées migrent et les données
  Netlify Forms sont archivées puis supprimées

### 7.2 Logs

- Netlify Functions : logs natifs (stdout/stderr), rétention 30 jours
- Pas de journalisation de l'email ou du contenu des réponses dans des fichiers
  personnalisés
- Les erreurs serveur sont logguées sans le contenu du payload

### 7.3 Suppression

- Toute demande peut être supprimée sur demande (RGPD)
- La suppression passe par le dashboard Netlify ( Forms → Submission )
- Pas d'endpoint de suppression API pour le MVP

## 8. Sécurité

- Aucun secret ou clé API dans le code client
- Le `submission_id` est un UUID v4 random, non séquentiel
- L'email n'est jamais exposé dans les URLs
- Le consentement est horodaté et transmis avec le payload
- Le honeypot n'est jamais révélé (display: none + aria-hidden)
- Le serveur valide TOUS les champs, pas seulement les obligatoires
- Le CSP existant est conservé et complété si nécessaire

## 9. Compatibilité ascendante

- Le `form_version` permet d'ajouter des champs sans casser les soumissions existantes
- Le serveur ignore les champs inconnus
- Les champs obligatoires ne peuvent être supprimés qu'en incrémentant le majeur
- Les Nouveaux champs sont toujours optionnels à l'ajout

## 10. Endpoints

| Endpoint              | Méthode | Auth   | Description                           |
|----------------------|---------|--------|---------------------------------------|
| /api/submit-idea     | POST    | publique | Soumission /votre-idee             |
| /api/contact         | POST    | publique | Formulaire contact amélioré        |
| Netlify Forms        | POST    | natif   | Formulaires existants (fallback)     |

## 11. Variables d'environnement

| Variable               | Côté   | Description                           |
|-----------------------|--------|---------------------------------------|
| CONTACT_EMAIL         | server | Adresse de notification INDXONE       |
| SITE_URL              | server | URL de base (https://indxone.com)     |

Aucune clé API tierce requise pour le MVP.
