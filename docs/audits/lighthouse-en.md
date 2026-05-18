# Audit Lighthouse — indxone.com/en/

| Champ | Valeur |
|-------|--------|
| **Date** | 2026-05-18 |
| **URL** | https://indxone.com/en/ |
| **Stratégie** | Mobile |

## Scores cibles (basés sur l'analyse de code)

| Catégorie | Cible | Notes |
|-----------|-------|-------|
| Performance | ≥ 90 | Même stack que la page FR |
| Accessibilité | ≥ 95 | Skip-link, ARIA, formulaires EN avec label corrigé |
| Best Practices | ≥ 90 | HTTPS, pas d'erreurs JS |
| SEO | ≥ 95 | hreflang FR/EN, meta description EN, OG, JSON-LD |

## Correctifs inclus

- **CSS bundling** : 1 requête CSS au lieu de 23
- **Formulaire EN** : `label for="consent-en"` + lien vers `/en/privacy-policy`
- **Nav** : lang-switch FR/EN opérationnel, aria-label
- **Pages légales EN** : legal-notice, privacy-policy, accessibility
- **Hreflang** : toutes les paires FR/EN présentes

## Différences avec la page FR

- Contenu traduit intégralement
- Mêmes performances (même CSS bundle, même JS)
- Structure de navigation identique
