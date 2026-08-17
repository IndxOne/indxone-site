# Optimisation corporate d'INDXONE

## Positionnement retenu

La page d'accueil présente désormais deux piliers lisibles :

1. **Modern Workplace & Cloud** : Microsoft 365, Entra ID, Azure, identités, adoption et pilotage des prestataires.
2. **Software Engineering & Low-Code** : Power Platform, FlutterFlow, Supabase, API, intégration et applications métier.

Le portfolio et le Hub deviennent des preuves de savoir-faire, et non les seuls éléments de positionnement.

## Livré dans cette tranche

- section expertise à deux piliers, en français et en anglais ;
- trois cas d'usage basés sur des réalisations déjà présentes dans le portfolio ;
- section **IndxOne Lab** pour Hub, TAGA et Carnet ;
- signaux de confiance fondés sur des éléments vérifiables du CV et du portfolio ;
- champs facultatifs de budget et d'horizon dans les formulaires Netlify Forms ;
- métadonnées SEO mises à jour et navigation vers Expertise / Lab ;
- HSTS, CSP, `frame-ancestors`, `object-src` et politiques existantes renforcées.

## Hors périmètre volontaire

- **Microsoft Bookings** : nécessite une URL de réservation et un choix de compte/tenant ;
- **lead magnet** : nécessite le contenu final, la base légale et le canal de distribution ;
- **SPF, DKIM, DMARC Zoho** : à vérifier et modifier dans le DNS du domaine, jamais dans le dépôt ;
- **certification AWS Cloud Practitioner** : à publier uniquement après confirmation documentaire ;
- **blog Markdown** : à traiter comme un chantier séparé avec stratégie éditoriale et pagination ;
- URL publique de `carnet.indxone.com` : le lien reste volontairement désactivé tant que le sous-domaine n'est pas confirmé.

## Contrôles de sortie

Le build doit produire `dist/` à partir des includes, conserver les formulaires Netlify et valider les pages FR/EN avec les contrôles existants (`npm run lint:full`, `npm test`).
