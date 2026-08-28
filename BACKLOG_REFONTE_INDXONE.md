# Backlog d'implémentation — refonte mobile first INDXONE

Date : 26 août 2026
Dépôt : /home/adminkon/projets/indxone-site
Référence : CAHIER_DES_CHARGES_REFONTE_INDXONE.md §18
Priorité absolue : mobile first

## Règle de livraison

Un lot visuel n'est pas terminé tant que le parcours n'est pas validé à 360 px
et 390 px. Les adaptations 768, 1024 et 1440 px viennent ensuite. À chaque
écran, vérifier : pas de débordement horizontal, CTA atteignable au pouce,
texte lisible, focus visible, clavier, zoom 200 %, reduced-motion et états
erreur/chargement/succès.

## P0 — Baseline et décisions

### B0.1 — Protéger le worktree existant
- Responsable : Codex
- État : terminé (audit initial réalisé)
- Vérifier les modifications non commitées avant chaque lot.
- Ne supprimer aucun contenu, test ou lien sans décision documentée.
- Sortie : état Git et base de branche consignés.

### B0.2 — Fermer les ambiguïtés de contenu
- Responsable : Codex + propriétaire
- État : décision requise
- Identifier la section à retirer mentionnée au point 2.
- Identifier les éléments visés par « ajouter ces éléments » au point 5.
- Confirmer les statuts et URLs de Hub, IndxOne Note, Carnet et TAGA.
- Sortie : décisions ajoutées au fichier de collaboration.

## P1 — Fondation mobile first

### B1.1 — Cartographier les tokens de la maquette
- Responsable : Claude Code
- Dépend de : B0.1
- Modifier : css/variables.css et primitives partagées.
- Définir couleurs, typographies, tailles fluides, espacements, rayons, ombres,
  largeurs, transitions et états.
- Partir de 360 px : aucune valeur ne doit rendre le contenu illisible ou
  provoquer un scroll horizontal.
- Sortie : commit isolé + captures 360/390/1440.

### B1.2 — Construire les primitives responsives
- Responsable : Claude Code
- Dépend de : B1.1
- Harmoniser navigation, boutons, cartes, grilles, formulaires, labels,
  messages, sections et footer.
- Prévoir une cible tactile confortable et un menu mobile clavier/Échap.
- Retirer définitivement les restes du thème sombre.
- Sortie : primitives testées sur mobile et desktop.

## P2 — Homepage

### B2.1 — Refaire le hero mobile
- Responsable : Claude Code
- Dépend de : B1.2
- Message : « Donnons vie à votre idée ».
- CTA principal : « Racontez votre idée » → /votre-idee.
- CTA secondaire : « Découvrir mes réalisations ».
- Illustration lisible et non bloquante sur petit écran.
- Géographie : « Aisne · Île-de-France · Remote ».
- Sortie : hero validé 360/390 avant adaptation desktop.

### B2.2 — Restructurer les sections de la homepage
- Responsable : Claude Code, revue Codex
- Dépend de : B2.1
- Ordre : types de projets, accompagnement, services, preuves, réalisations,
  produits, collectivités, à propos, contact, footer.
- Commencer par une colonne mobile ; les grilles deviennent multi-colonnes
  seulement quand la largeur le permet.
- CTA principaux vers /votre-idee.
- Conserver les preuves réelles et la formulation CDI/mission/accompagnement.
- Sortie : homepage FR mobile, puis tablette/desktop ; équivalent EN vérifié.

### B2.3 — Nuancer collectivités et preuves
- Responsable : Codex, revue Big Pickle
- Dépend de : B2.2
- Remplacer les claims non prouvés par des formulations démontrées, visées,
  incluses, optionnelles ou dépendantes du contexte.
- Utiliser +15 projets et 5 ans d'expériences uniquement après confirmation.
- Sortie : tableau de claims validés et contenu intégré.

## P3 — Parcours de conversion

### B3.1 — Construire /votre-idee en mobile first
- Responsable : Codex
- État : terminé pour la première version MVP
- Dépend de : B1.2 et B2.2
- Cinq branches : mariage/événement, site, application, activité, idée floue.
- Une question ou petit groupe cohérent par écran.
- Maximum 15 questions utiles.
- Boutons précédent/suivant accessibles sans masquer le clavier mobile.
- Barre de progression indicative et non anxiogène.
- Sortie : parcours complet 360/390, puis adaptation desktop.

### B3.2 — Persistance, validation et récapitulatif
- Responsable : Codex
- État : terminé pour le parcours local et la soumission Netlify
- Dépend de : B3.1
- Persister localement les réponses avant transmission.
- Restaurer après rafraîchissement sans compte obligatoire.
- Valider progressivement avec erreurs associées aux champs.
- Afficher un récapitulatif révisable avant consentement et envoi.
- Gérer double clic, retour arrière et réseau indisponible.

## P4 — Transmission et sécurité

### B4.1 — Contrat de transmission
- Responsable : Big Pickle
- Dépend de : B3.2
- Définir payload versionné : identifiant, UTC, type, réponses, coordonnées,
  consentement horodaté, provenance, statut et version du formulaire.
- Valider et nettoyer côté serveur.
- Ne jamais exposer secret ou contenu personnel dans le navigateur et les URLs.

### B4.2 — Antispam, notification et erreurs
- Responsable : Big Pickle
- Dépend de : B4.1
- Vérifier Netlify Forms ou le fournisseur retenu.
- Garantir la notification INDXONE seulement si elle est réellement configurée.
- Documenter accusé de réception, conservation, suppression et logs minimaux.
- Tester soumission réussie, erreur serveur, timeout, reprise et double clic.

## P5 — Intégration contenu et conformité

### B5.1 — Produits et liens externes
- Responsable : Codex
- Dépend de : B2.2
- Vérifier Hub, IndxOne Note, Carnet, TAGA, Malt, LinkedIn et démonstration
  collectivités.
- Afficher les statuts réels : actif, développement, démonstration ou à venir.
- Ne pas publier un lien externe non vérifié.

### B5.2 — Accessibilité et SEO
- Responsable : Codex, revue Big Pickle
- Dépend de : B2.2 et B3.2
- Vérifier h1, titres, meta, canonical, hreflang, sitemap, robots et JSON-LD.
- Labels, erreurs, focus, contraste, navigation clavier, zoom 200 %,
  reduced-motion et messages dynamiques.
- Tester FR/EN, 360/390 px et les pages légales.

## P6 — Recette mobile first

### B6.1 — Matrice responsive
- Responsable : Codex
- Contributeurs : Claude Code visuel, Big Pickle sécurité
- Dépend de : B1 à B5
- Tester 360, 390, 768, 1024 et 1440 px.
- Scénarios : navigation, CTA, cinq branches, persistance, récapitulatif,
  envoi, erreur réseau, liens externes, formulaires et pages légales.
- Vérifier absence de scroll horizontal et stabilité visuelle.

### B6.2 — Qualité automatisée
- Responsable : Codex
- Dépend de : B6.1
- Exécuter :
  - npm run lint:full
  - npm test
  - npm run test:e2e
  - npm run build:all
  - git diff --check
- Ajouter les tests manquants avant de déclarer la release prête.

### B6.3 — Preview et décision de production
- Responsable : propriétaire + Codex
- Dépend de : B6.2
- Déployer une preview Netlify.
- Produire captures mobile et desktop, rapport Lighthouse et liste des écarts.
- Production uniquement après validation humaine de la preview et rollback
  documenté.

## Vue dépendances

```text
B0 décisions
   ↓
B1 fondation mobile
   ↓
B2 homepage ─────┐
   ↓             │
B3 votre idée ───┼── B5 conformité
   ↓             │
B4 transmission ─┘
        ↓
B6 recette mobile → preview → décision production
```

## Definition of Done par ticket

- contenu réel ou placeholder explicitement marqué ;
- comportement vérifié à 360/390 px avant desktop ;
- clavier, focus, contraste, zoom 200 % et reduced-motion vérifiés ;
- tests et build adaptés exécutés ;
- diff contrôlé ;
- handoff avec fichiers, commit, captures, risques et décision attendue.

## Hors scope

Hub/Carnet eux-mêmes, compte client, paiement, CRM complet, IA commerciale,
collecte massive de fichiers et nouvelle application mobile.
