# INDXONE — BRAND-01 (candidat)
## Source de vérité provisoire
Le répertoire `brand/` de la branche `brand/brand-01-foundation` du dépôt `indxone-site` est la référence temporaire. Un dépôt distinct `indxone-brand` est envisagé mais **n'a pas été créé**.

## Logo
- Forme officielle : mot-symbole `indxone`, monogramme `ix`, arc terracotta.
- Palette des SVG fournis : encre `#0C1620`, terracotta `#D65F3C`, ivoire `#F7F1E8`.
- Conserver les SVG originaux sans reconstituer le logo en police CSS.
- Source monogramme déjà versionnée : `indxone-site/favicon.svg` et `indx-notepad/assets/brand/indxone-monogram.svg`.
- Vérifier mode clair/sombre, tailles 16/32/180/192/512 et masque PWA avant remplacement.
- Éviter terracotta brut pour petits textes ou boutons à texte blanc : vérifier WCAG AA au cas par cas.

## Politique d'adoption
1. Ne rien importer en production depuis une URL ou un dépôt externe : copier des fichiers versionnés, sous revue.
2. Tokens de marque communs ; tokens d'interface et palettes métier indépendants.
3. Aucun remplacement global des CSS, typography, dark mode, icônes métier ou navigation.
4. Toute application : branche dédiée, tests, aperçu, QA visuelle mobile/desktop, validation humaine.
5. Sites tiers (mairies, Synrel, TAGA) exclus de BRAND-01.

## Périmètre priorisé
1. indxone-site : comparer la palette actuelle #14202B/#C8603A aux SVG ; modifier plus tard sans régression.
2. indx-launcher : rapprocher le bleu #3D54EC de l'identité mère, sous QA.
3. indx-notepad : conserver le monogramme existant et tester favicons/PWA, sans toucher au moteur d'édition.
4. indx-career : aligner l'identification visuelle, préserver la sémantique de décision.
5. english-coach : revoir l'accent rose et le thème sombre doré, sans modifier l'entraînement.
6. indx-hub : mappings entre --ix-* et brand, conserver l'accessibilité et le dark mode.
7. indx-managment : intégrer signature de marque sans casser le système iOS ni les codes de statuts.

## Validation
- Statut : **spécification initiale uniquement**. Ni intégration visuelle ni recette réelle validées.
- Critères futurs : WCAG AA contrastes des états, focus visible, thème clair/sombre, responsive 320–1440, favicons, screenshots de contrôle, build+tests.
