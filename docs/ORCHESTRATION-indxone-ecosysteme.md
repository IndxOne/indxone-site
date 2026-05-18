# Orchestration — Écosystème INDXONE (web & Hub)

| Version | 1.1 — 2026-05-17 |
|---------|------------------|

Ce document est la **vue d’ensemble** pour piloter en parallèle les trois propriétés produit. Les specs détaillées restent dans chaque dépôt.

| Propriété | Dépôt | Spec |
|-----------|-------|------|
| **indxone.com** (corporate) | `indxone-site` | [SPEC-conformite-amelioration.md](./SPEC-conformite-amelioration.md) |
| **mairies.indxone.com** (pilote communal) | `indxone-mairies/mons-en-laonnois` | [SPEC-conformite-amelioration.md](../../indxone-mairies/mons-en-laonnois/docs/SPEC-conformite-amelioration.md) |
| **hub.indxone.com** (OS freelance) | `Indxone-Hub` | [SPEC-conformite-amelioration.md](../../Indxone-Hub/docs/SPEC-conformite-amelioration.md) |

---

## Rôles

| Rôle | Responsabilité |
|------|----------------|
| **Orchestrateur** (agent / lead tech) | Prioriser les phases 0 communes, éviter les contradictions marketing/juridiques, synchroniser les audits |
| **Produit** | Valider tarifs, délais, claims Lighthouse / RGPD |
| **Mairie pilote** | Valider contenus `content/*.json` et données `mairie-config.js` |
| **IndxOne** | Valider pages légales SASU, Plausible, formulaires |

---

## Identité visuelle — trois univers

| Univers | Couleur primaire | Où |
|---------|------------------|-----|
| **INDXONE corporate** | Bleu `#1B3A6B`, or `#C9A84C`, encre `#0F1923` | indxone.com |
| **Commune / mairie** | Rouge `#D21C1C` | mons-en-laonnois (+ futures mairies) |
| **IndxOne Hub** | Lime `#E8FF3C`, fond `#0A0A0A` | hub.indxone.com / `hub-app.html` |

Les mockups sur `/collectivites/` peuvent montrer le rouge ; la chrome INDXONE reste bleu/or. Le Hub ne reprend pas ces palettes sur son shell.

---

## Phase 0 globale (semaine de lancement)

Exécuter **en parallèle** :

| # | indxone.com | mons-en-laonnois | Indxone-Hub |
|---|-------------|------------------|-------------|
| 1 | LEGAL-01 : politique (Plausible) | THEME-01 : rouge `mairie-config.js` | LEGAL-06 : footer liens RGPD |
| 2 | NET-01 : fix redirect 404 | NETLIFY-01 : redirects 404 | SHARE-01–03 : partages URL |
| 3 | SEC-01 : `netlify.toml` headers | OPS-01 : formulaire contact | TECH-05 : manifest → hub-app |
| 4 | MKT-01 : claims Lighthouse | CONT-03 : validation mairie | UX-MOBILE-01 : menu (✅ fait) |
| 5 | TECH-01 : Lighthouse + audits | TECH-01 : idem mairie | TECH-01 : Lighthouse dashboard |

**Gate de lancement :** les deux Definition of Done (§13 de chaque spec) sont cochées pour les items Phase 0.

---

## Messages marketing alignés

| Message public | Formulation autorisée | Preuve |
|----------------|----------------------|--------|
| RGPD | « Sans cookies publicitaires » (corporate) ; « RGPD natif » (mairie = pas de trackers tiers sur le site communal) | Politiques à jour |
| Performance | « Optimisé pour Lighthouse 90+ » ou score daté | Rapports dans `docs/audits/` des deux dépôts |
| Délai | « Déploiement rapide (sous conditions) » sauf SLA signé | Contrat / CGV |

---

## Flux utilisateur

```
Visiteur indxone.com
    → /collectivites → démo mairie (mons-en-laonnois)
    → /#tools ou hub.indxone.com → hub-app.html (freelance)

Freelance hub.indxone.com
    → hash router #/dashboard
    → partage lecture seule #/share/...
```

Vérifier ce parcours en e2e Playwright (ticket **PROD-01** corporate + **UX-01** mairie).

---

## Prochaines revues

| Date cible | Ordre du jour |
|------------|---------------|
| Hebdo | Avancement Phase 0, blockers mairie |
| Avant démo publique | Revue claims + captures Lighthouse |
| Post-lancement | Décision ARCH-01 (Astro vs statique) sur indxone.com uniquement |
