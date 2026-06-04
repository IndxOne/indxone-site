# Charte graphique INDXONE

**Date :** Juin 2026
**Périmètre :** indxone.com (corporate) + mairies.indxone.com (produit commune)

> **Principe fondamental :** Le rouge `#D21C1C` est la couleur des sites mairies (offre collectivités), pas celle du site corporate indxone.com.

---

## 1. Univers corporate — indxone.com

### Palette

| Rôle | Token | Hex | Usage |
|------|-------|-----|-------|
| Texte principal | `--ink` | `#0F1923` | Titres, corps, `theme-color` PWA |
| Texte secondaire | `--ink-light` | `#3D4F5C` | Descriptions |
| Fond clair | `--bone` | `#F7F4EF` | Fond page |
| Primaire institutionnel | `--blue` | `#1B3A6B` | CTA, liens forts, dégradés hero |
| Primaire hover | `--blue-mid` | `#2D5A9E` | États interactifs |
| Accent premium | `--gold` | `#C9A84C` | Highlights, badges |
| Territoire / collectivités | `--green` | `#2A7A4B` | Section collectivités, stats |
| Succès / erreur | `--success` / `--error` | `#28C840` / `#FF5F57` | Feedback formulaire |

### Typographie

- Primaire : **Sora** (sans-serif) — titres de section, navigation, corps
- Secondaire : **DM Serif Display** (serif) — titres de page, hero
- Fallback : `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

### Styles clés

- Fond hero : dégradé `--ink` → `#1B2D3E`
- Boutons primaires : fond `--blue`, texte blanc
- Accents : `--gold` pour les badges et highlights
- Arrondis : `--radius-md` (8px) pour les cartes, `--radius-lg` (12px) pour les sections

---

## 2. Univers produit commune — mairies.indxone.com

### Palette

| Rôle | Hex | Usage |
|------|-----|-------|
| Primaire commune | `#D21C1C` | Header, CTA, accents |
| Fond | `#FFFFFF` | Pages |
| Texte | `#1A1A2E` | Corps |

### Principe

Sur indxone.com, les visuels « démo commune » peuvent **montrer** le rouge pilote (`#D21C1C`) dans les mockups / screenshots, avec légende « site communal » — sans remplacer la palette corporate sur la chrome du site INDXONE.

---

## 3. Règles d'usage

1. **Le rouge `#D21C1C` est interdit** sur les éléments chrome de indxone.com (nav, footer, CTA principaux, boutons génériques).
2. La section `/collectivites/` utilise le vert (`--green`) comme couleur de territoire, jamais le rouge.
3. Les screenshots de sites mairie dans les pages corporate sont encapsulés dans des mockups avec bordure et légende.
4. Le `theme-color` PWA est `#0F1923` (ink), pas le rouge.
