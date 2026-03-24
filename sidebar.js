INDXONE.register({ // Enregistre un module auprès de l’instance INDXONE
  id: 'sidebar', // Identifiant unique du module (ici "sidebar")
  order: 21, // Ordre d’exécution/de rendu (priorité relative)
  // Déclare le CSS encapsulé pour ce module
  css: ` 
.main-layout{max-width:1200px;margin:0 auto;padding:3rem 5vw 2rem}`, // Style pour .main-layout
  render(C) { // Fonction de rendu du module (taille C non utilisée ici)
    const actu = document.getElementById('actualites'); // Trouve l’élément #actualites
    if (!actu) return; // Si introuvable, quitte la fonction (sécurité)
    const wrapper = document.createElement('div'); // Crée un nouvel élément <div> pour servir de wrapper
    wrapper.className = 'main-layout'; // Attribue la classe CSS "main-layout" au wrapper
    actu.parentNode.insertBefore(wrapper, actu); // Insère le wrapper avant l’élément #actualites dans le DOM
    wrapper.appendChild(actu); // Déplace #actualites à l’intérieur du wrapper, centralisant ainsi son contenu
  },
}); // Fin de l’enregistrement du module