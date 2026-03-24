/**
 * ══════════════════════════════════════════════
 *  Généré par INDXONE Pipeline Mairies V2
 *  Commune : Mons-en-Laonnois (02000)
 *  INSEE   : 02497
 *  Date    : 2026-03-23
 *  indxone.com · contact@indxone.com
 * ══════════════════════════════════════════════
 */

const MAIRIE_CONFIG = {

  commune: {
    nom:         "Mons-en-Laonnois",
    nomComplet:  "Commune de Mons-en-Laonnois",
    departement: "Aisne",
    codePostal:  "02000",
    codeInsee:   "02497",
    arrondissement: "Aisne",
    region:      "Hauts-de-France",
    epci:        "CA du Pays de Laon",
    population:  "~1 146",
    superficie:  "4,0 km²",
    description: "Commune rurale du Laonnois, nichée dans les collines de l'Aisne. 1 146 habitants, à 10 km de Laon, au cœur des Hauts-de-France.",
    emoji: "🏛️",
  },

  contact: {
    adresse:    "Mairie de Mons-en-Laonnois",
    ville:      "02000 Mons-en-Laonnois",
    telephone:  "+33 3 23 24 12 93",
    telLink:    "33323241293",
    email:      "info@indxone.com",
    siteUrl:    "https://www.monsenlaonnois02.fr/",
    googleMaps: "https://maps.google.com/?q=Mairie+de+Mons-en-Laonnois+02000+Mons-en-Laonnois",
    lat: 49.5372,
    lng: 3.5531,
  },

  equipe: {
    maire:       "Gerard CHARLES",
    mandatDebut: "2020",
    mandatFin:   "2026",
  },

  elus: [
    { nom: "Gérard CHARLES",    role: "Maire",                photo: null },
    { nom: "Nathalie DUHANT",   role: "1er Adjoint",          photo: null },
    { nom: "Olivier BILLARD",   role: "2ème Adjoint",         photo: null },
  ],


  horaires: [
    {
        "jour": "Lundi",
        "jourIdx": 1,
        "ouvert": true,
        "heures": "15h00 - 18h30",
        "debut": 900,
        "fin": 1110
    },
    {
        "jour": "Mardi",
        "jourIdx": 2,
        "ouvert": true,
        "heures": "15h00 - 18h30",
        "debut": 900,
        "fin": 1110
    },
    {
        "jour": "Mercredi",
        "jourIdx": 3,
        "ouvert": true,
        "heures": "15h00 - 18h30",
        "debut": 900,
        "fin": 1110
    },
    {
        "jour": "Jeudi",
        "jourIdx": 4,
        "ouvert": false,
        "heures": "Fermé",
        "debut": 0,
        "fin": 0
    },
    {
        "jour": "Vendredi",
        "jourIdx": 5,
        "ouvert": true,
        "heures": "15h00 - 18h30",
        "debut": 900,
        "fin": 1110
    },
    {
        "jour": "Samedi",
        "jourIdx": 6,
        "ouvert": false,
        "heures": "Fermé",
        "debut": 0,
        "fin": 0
    },
    {
        "jour": "Dimanche",
        "jourIdx": 0,
        "ouvert": false,
        "heures": "Fermé",
        "debut": 0,
        "fin": 0
    }
],


  tier: "active",

  couleurs: {
    primary:    "#2D5016",
    accent:     "#5B8A6B",
    highlight:  "#C4703A",
    bg:         "#F5F0E8",
    bg2:        "#EBF2E4",
    deep:       "#1C2E1A",
    muted:      "#5C6B60",
    border:     "rgba(91,138,107,0.14)",
  },

  design: {
    tokens: {
      primary:       "#2D5016",
      primaryDark:   "#1C2E1A",
      accent:        "#5B8A6B",
      highlight:     "#C4703A",
      highlightDark: "#A85A2A",
      light:         "#EBF2E4",
      dark:          "#1C2E1A",
      text:          "#2C3620",
      muted:         "#5C6B60",
      border:        "rgba(91,138,107,0.18)",
      bg:            "#F5F0E8",
    },
  },

  seo: {
    title:       "Mairie de Mons-en-Laonnois (02000) — Site officiel",
    description: "Site officiel de la commune de Mons-en-Laonnois (02000, Aisne). Actualités, démarches, agenda, conseil municipal.",
    ogImage:     "/img/og-mairie.jpg",
    canonical:   "https://mairie-mons-en-laonnois.indxone.com/",
  },

  formulaire: {
    provider: "netlify",
    formName: "contact-mairie-mons-en-laonnois",
    endpoint: "",
    sujets: [
      "État civil (naissance, mariage, décès)",
      "Urbanisme (permis, déclaration)",
      "Voirie & travaux",
      "Collecte des déchets",
      "Réservation salle communale",
      "Autre demande",
    ],
  },

  urgence: { actif: false, message: "" },

  actualites: [
  {
    titre: "Conseil municipal — compte-rendu",
    extrait: "Retrouvez le compte-rendu de la dernière séance du conseil municipal de mars 2026.",
    categorie: "Mairie",
    jourAff: "10",           // ← jour en chiffre
    moisAff: "MAR",          // ← mois en 3 lettres majuscules
    couleur: "blue",         // ← "blue", "green" ou "orange"
    lien: "#",
    lienLabel: "Lire la suite"  // ← texte du lien
  },
  {
    titre: "Travaux de voirie — rue de l'Église",
    extrait: "Travaux de réfection du 17 au 21 mars. Circulation alternée.",
    categorie: "Travaux",
    jourAff: "12",
    moisAff: "MAR",
    couleur: "orange",
    lien: "#",
    lienLabel: "En savoir plus"
  },
  {
    titre: "Collecte des déchets verts",
    extrait: "La collecte reprend le samedi 22 mars. Sortez vos sacs avant 7h.",
    categorie: "Environnement",
    jourAff: "08",
    moisAff: "MAR",
    couleur: "green",
    lien: "#",
    lienLabel: "Voir le calendrier"
  }
],

  agenda: [
  {
    titre: "Conseil municipal",
    dateIso: "2026-03-25",          // ← format ISO pour l'attribut datetime
    dateAff: "Mer 25 mars 2026",    // ← texte affiché dans la carte
    details: "Séance publique du conseil municipal. 20h00 — Salle des fêtes.", // ← PAS description
    tag: "Mairie",
    couleur: "blue"                 // ← "blue", "orange" ou "green"
  },
  {
    titre: "Marché de printemps",
    dateIso: "2026-04-06",
    dateAff: "Dim 6 avril 2026",
    details: "9h00–13h00 — Place de la mairie. Producteurs locaux, entrée libre.",
    tag: "Animation",
    couleur: "orange"
  },
  {
    titre: "Permanence du maire",
    dateIso: "2026-03-28",
    dateAff: "Sam 28 mars 2026",
    details: "10h00–12h00 — Mairie. Sur rendez-vous.",
    tag: "Mairie",
    couleur: "blue"
  }
],


  services: [
    {
      emoji: "🗑️",
      label: "Déchets",
      desc:  "Calendrier & consignes",
      lien:  "https://sirtom-du-laonnois.com/infos-pratiques/jour-de-collecte/?calendrier_collecte_ville=1051",
    },
    {
      emoji: "🚧",
      label: "Voirie & travaux",
      desc:  "Signaler un problème",
      lien:  "#signalement",
    },
    {
      emoji: "🏫",
      label: "École",
      desc:  "Inscriptions & infos",
      lien:  "https://www.service-public.gouv.fr/particuliers/vosdroits/N19805",
    },
    {
      emoji: "⚰️",
      label: "État civil",
      desc:  "Actes & certificats",
      lien:  "https://www.service-public.gouv.fr/particuliers/vosdroits/N19810",
    },
    {
      emoji: "🏗️",
      label: "Urbanisme",
      desc:  "Permis & déclarations",
      lien:  "https://www.service-public.fr/particuliers/vosdroits/N319",
    },
    {
      emoji: "📋",
      label: "Conseil municipal",
      desc:  "CR & délibérations",
      lien:  "#actualites",
    },
    {
      emoji: "🌳",
      label: "Environnement",
      desc:  "Espaces verts",
      lien:  "https://www.hautsdefrance.fr/environnement-defis/",
    },
    {
      emoji: "💻",
      label: "Service-Public.fr",
      desc:  "Toutes les démarches",
      lien:  "https://www.service-public.fr",
    },
  ],

  liensUtiles: [
    { label:"Service-Public.fr",                   url:"https://www.service-public.fr" },
    { label:"Préfecture — Aisne", url:"#" },
    { label:"Légifrance",                          url:"https://legifrance.gouv.fr" },
  ],

  medias: [],

  scores: {
    "siteWeb": 10,
    "demarches": 15,
    "accessibilite": 15,
    "reseaux": 20,
    "transparence": 10
},

  poi: [],

  demarchesLocales: [
    {
        "ico": "🏟️",
        "title": "Réservation salle communale",
        "desc": "Demande pour événements associatifs ou privés",
        "url": "#nous-contacter",
        "src": "Mairie de Mons-en-Laonnois"
    }
],

  socioEco: {
    revenuMedian:      null,
    tauxChomage:       null,
    partProprietaires: null,
    partLogSociaux:    null,
    source:            "INSEE — Millésime 2021",
    annee:             "2021",
  },

};
