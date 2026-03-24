INDXONE.register({ // Enregistre un module auprès de l’instance INDXONE
  id: 'actualites', // Identifiant unique du module (ici "actualites")
  order: 25, // Ordre d’exécution/de rendu (priorité relative, avant "sidebar")
  // Déclare le CSS encapsulé pour ce module
  css: ` 
  // style du bloc sections actualités
  // liste verticale d’actualités avec date à gauche et contenu à droite
  // effet hover sur les cartes d’actualité
  // bloc date avec jour et mois, couleurs variables selon catégorie
  // style jour en grand, mois en petit et majuscules
  // style mois avec espacement entre lettres et opacité
  // couleur bleue par défaut, verte pour "sage", orange pour "terr"
  // corps de la carte avec catégorie, titre, extrait et lien
  // lien avec effet de déplacement de flèche au hover
  // animation lien avec transition de l’espacement entre le texte et la flèche
  // adaptation mobile avec réduction de la taille de la partie date
.actu-section{padding:1.2rem 0 0} 
.actu-list{display:flex;flex-direction:column;gap:1rem;margin-top:1.2rem}
.actu-card{background:var(--card);border:1px solid var(--border);border-radius:16px;overflow:hidden;display:grid;grid-template-columns:90px 1fr;transition:box-shadow .25s,transform .25s}
.actu-card:hover{box-shadow:0 6px 20px rgba(44,56,32,.1);transform:translateY(-2px)}
.actu-date{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:1rem .5rem;text-align:center;color:#fff}
.actu-date .day{font-family:Georgia,serif;font-weight:700;font-size:1.9rem;line-height:1}
.actu-date .month{font-size:.65rem;text-transform:uppercase;letter-spacing:.08em;opacity:.9;margin-top:3px;font-family:'DM Sans',sans-serif}
.actu-date-blue{background:var(--forest)}
.actu-date-green{background:var(--sage)}
.actu-date-orange{background:var(--terr)}
.actu-body{padding:1rem 1.2rem}
.actu-cat{display:inline-block;background:var(--bg2);color:var(--sage);font-size:.65rem;font-family:'DM Sans',sans-serif;letter-spacing:.07em;text-transform:uppercase;padding:2px 10px;border-radius:50px;margin-bottom:.5rem;font-weight:600}
.actu-title{font-family:Georgia,serif;font-weight:700;font-size:.95rem;color:var(--deep);margin-bottom:.3rem;line-height:1.3}
.actu-excerpt{font-size:.82rem;color:var(--muted);line-height:1.6}
.actu-link{display:inline-flex;align-items:center;gap:5px;font-size:.78rem;color:var(--terr);text-decoration:none;margin-top:.6rem;font-weight:600;transition:gap .2s}
.actu-link:hover{gap:9px}
@media(max-width:640px){.actu-card{grid-template-columns:76px 1fr}}`,

  render(C) { // fonction de rendu (C contient les données)
    if (!C.actualites?.length) return; // rien si pas d’actualités
    const sec = document.createElement('section'); // créer section
    sec.id = 'actualites'; // id section
    sec.setAttribute('aria-labelledby','actu-titre'); // accessibilité : associer titre à la section
    sec.className = 'actu-section rv'; // classes pour style et animation
    // contenu HTML généré dynamiquement
    // boucle sur chaque actualité pour créer une carte d’actualité
    // couleur dynamique selon la catégorie, avec un fallback bleu
    // jour affiché en grand, mois en petit et majuscules
    // mois affiché avec espacement entre les lettres et opacité
    // corps de la carte avec catégorie, titre, extrait et lien
    // lien avec effet de déplacement de flèche au hover
    // animation lien avec transition de l’espacement entre le texte et la flèche
    // adaptation mobile avec réduction de la taille de la partie date
    // lien conditionnel : affiché seulement si le champ "lien" est présent et différent de "#"
    // assembler toutes les cartes dans une liste verticale avec un titre de section
    sec.innerHTML = `
<h2 class="section-title" id="actu-titre">📰 Actualités</h2>
<div class="actu-list">
${C.actualites.map(a=>`
<article class="actu-card rv">
  <div class="actu-date actu-date-${a.couleur||'blue'}">
    <div class="day">${a.jourAff}</div>
    <div class="month">${a.moisAff}</div>
  </div>
  <div class="actu-body">
    <span class="actu-cat">${a.categorie}</span>
    <div class="actu-title">${a.titre}</div>
    <div class="actu-excerpt">${a.extrait}</div>
    ${a.lien&&a.lien!=='#'?`<a href="${a.lien}" class="actu-link">${a.lienLabel||'Lire'} →</a>`:''}
  </div>
</article>`).join('')} 
</div>`;
    document.getElementById('main').appendChild(sec); // injecte dans le DOM
  },
}); // fin INDXONE.register