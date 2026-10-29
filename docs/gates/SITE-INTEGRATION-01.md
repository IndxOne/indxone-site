# SITE-INTEGRATION-01 — Réconciliation Vitrine V2 / Brand / Réalisations
Date : 2026-10-29. État : **PR Draft #19 — candidat QA Preview, NO-GO merge/production**.

## Références immuables
- Base fonctionnelle : PR #18, commit `d0d7edf867a115387a8096a5101f948b797fb6fb` (tarif public 580 € HT/j, Produits V2, recette mobile).
- Fondation graphique #13 intégrée en amont de la PR #15 ; source du portage : PR #15, `06de80e90a531b417ce6cc54eade05509ce369fe`.
- Réalisations : PR #14, `8caa12c628c0cd10f41ba60bae7bd5e9b1c5e5b1`.
- Release #10, `1a6cecb187b1172ea14633f73cc53aa1709bbb49` : **non importée**, tarif de 500 € devenu obsolète.

## Arbitrages de réconciliation
1. Ne modifier ni les branches ni les PR #13, #14, #15, #18.
2. Importer de #15 le favicon maître et ses variantes au build, les tokens, les métadonnées partagées et les tests ; réutiliser `sharp` déjà installé ; pas de dépendance ajoutée.
3. Couvrir **toutes les pages** du site, notamment la nouvelle route `/produits/` de #18 et les pages simples 404/merci.
4. Porter de #14 la grille de **six réalisations** dans `/projets/` ; ne pas dupliquer Family et Diagnostic SI dans le teaser homepage (décision UX #18).
5. Préserver les tarifs validés, les formulaires, les CTA privés et le statut « démo » des communes. Aucun lien public vers Family ou Diagnostic SI.
6. **PR #19 cible temporairement `main` pour obtenir une Preview Netlify dédiée** ; elle contient donc aussi les commits #18. Ne pas la fusionner tant que #18 n'est pas intégrée et que le diff n'a pas été recalculé. La définition de base ne constitue pas une autorisation d'intégration.

## Gates
- Lint, tests unitaires, build et Playwright sur **SHA final exact**, y compris tailles 16/32/48/180/192/512 et ICO, metadata de 10 pages, absence de débordements 320/375/390/desktop.
- Preview Netlify vérifiée **READY au même SHA**, distincte de la Preview #18.
- Recette humaine des favicons (onglet clair/sombre, iPhone), de la page Réalisations sur mobile/desktop, de la navigation et des formulaires en Preview simulée.
- Revue des branches concurrentes immédiatement avant toute opération de merge ; **GO explicite distinct requis** pour merge et publication production.
- Traiter PR #10 comme obsolète (ne pas fermer sans décision).

Aucun secret, aucune migration, aucun merge ni changement de production par ce chantier.
