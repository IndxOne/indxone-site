# Charte graphique INDXONE (corporate vs commune)

## Principes généraux

**INDXONE SASU** possède deux univers visuels distincts :

1. **Corporate** (`indxone.com`) — Bleu nuit / or / encre pour le site vitrine consultant SI
2. **Commune** (`mairies.indxone.com/*`) — Rouge `#D21C1C` pour les sites mairies (offre collectivités)

Le rouge mairie ne doit jamais être utilisé comme couleur primaire sur le site corporate.

## Palette corporate (indxone.com)

| Rôle | Token | Hex | Usage |
|------|-------|-----|-------|
| Texte principal | `--ink` | `#0F1923` | Titres, corps, `theme-color` PWA |
| Texte secondaire | `--ink-light` | `#3D4F5C` | Descriptions |
| Fond clair | `--bone` | `#F7F4EF` | Fond page |
| Primaire institutionnel | `--blue` | `#1B3A6B` | CTA, liens, dégradés hero |
| Primaire hover | `--blue-mid` | `#2D5A9E` | États interactifs |
| Accent premium | `--gold` | `#C9A84C` | Highlights, badges |
| Territoire / collectivités | `--green` | `#2A7A4B` | Section collectivités, stats |
| Succès | `--success` | `#28C840` | Feedback formulaire |
| Erreur | `--error` | `#FF5F57` | Erreurs formulaire |

## Palette commune (mairies.indxone.com)

| Rôle | Valeur |
|------|--------|
| Primaire commune | `#D21C1C` (rouge institutionnel) |
| Secondaire | Variables selon commune |

## Règle d'or

- **Aucun élément de nav, footer ou CTA principal** sur `indxone.com` ne doit utiliser le rouge `#D21C1C`
- Les screenshots / mockups de démo mairie peuvent montrer le rouge avec la légende « site communal »
- `theme_color` du manifest = `#0F1923` (déjà conforme)

## Dark mode

Maintenir les contrastes WCAG AA sur les deux modes. Les tokens CSS sont dans `css/variables.css` et les overrides dark dans `css/utilities/theme.css`.
