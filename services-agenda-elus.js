/* ── SERVICES ── */
INDXONE.register({ // enregistrement du module Services dans l'application INDXONE
  id: 'services', // ID du module (uniquement en minuscules, sans espaces ni caractères spéciaux)
  order: 30, // ordre d’exécution dans l’UI (les modules sont triés par ordre croissant, les modules avec le même ordre sont triés par ID)
  // CSS spécifique au module
  css: `
.services-section{background:var(--bg2);border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:2.5rem 5vw}
.services-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:.9rem;margin-top:1.2rem}
.service-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:1.2rem 1rem;text-align:center;text-decoration:none;color:var(--deep);transition:transform .2s,box-shadow .2s}
.service-card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(44,56,32,.1);border-color:var(--sage)}
.service-icon{font-size:1.8rem;margin-bottom:.5rem;display:block}
.service-label{font-family:Georgia,serif;font-weight:700;font-size:.85rem;color:var(--deep);line-height:1.3}
.service-desc{font-size:.72rem;color:var(--muted);margin-top:.25rem}`,

  render(C) { // rendu du module dans la page (C est l’objet de données de la commune)
    if (!C.services?.length) return; // sortie si liste vide ou absente
    const sec = document.createElement('section'); // créer section HTML
    sec.id = 'services'; // identifiant section pour ancrage
    sec.className = 'services-section'; // classe CSS pour stylisation et ciblage 
    sec.setAttribute('aria-labelledby','services-titre'); // a11y : associer titre à la section
    sec.innerHTML = `
<div class="si">
  <h2 class="section-title" id="services-titre">🏛️ Services municipaux</h2>
  <div class="services-grid rv">
    ${C.services.map(s=>`
    <a href="${s.lien}" class="service-card"${s.lien.startsWith('http')?' target="_blank" rel="noopener"':''}>
      <span class="service-icon" aria-hidden="true">${s.emoji}</span>
      <div class="service-label">${s.label}</div>
      <div class="service-desc">${s.desc}</div>
    </a>`).join('')}
  </div>
</div>`;
    document.getElementById('main').appendChild(sec); // insertion finale
  },
});

/* ── AGENDA ── */
INDXONE.register({
  id: 'agenda',
  order: 40,
  css: `
.events-section{padding:2.5rem 5vw}
.events-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1rem;margin-top:1.2rem}
.event-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:1.2rem;transition:box-shadow .2s;position:relative;overflow:hidden}
.event-card:hover{box-shadow:0 6px 20px rgba(44,56,32,.09)}
.event-stripe{position:absolute;left:0;top:0;bottom:0;width:4px}
.event-stripe-blue{background:var(--forest)}
.event-stripe-orange{background:var(--terr)}
.event-stripe-green{background:var(--sage)}
.event-date-label{font-family:'DM Sans',sans-serif;font-size:.68rem;color:var(--sage);letter-spacing:.07em;text-transform:uppercase;margin-bottom:.4rem;font-weight:600}
.event-title{font-family:Georgia,serif;font-weight:700;font-size:.95rem;color:var(--deep);margin-bottom:.3rem;line-height:1.3}
.event-info{font-size:.8rem;color:var(--muted);line-height:1.55}
.event-tag{display:inline-block;background:var(--bg2);color:var(--sage);font-size:.65rem;font-family:'DM Sans',sans-serif;font-weight:600;padding:2px 8px;border-radius:50px;margin-top:.6rem}`,

  render(C) {
    if (!C.agenda?.length) return;  // stop si agenda vide ou absente 
    const sec = document.createElement('section');
    sec.id = 'agenda';
    sec.className = 'events-section';
    sec.setAttribute('aria-labelledby','events-titre');
    sec.innerHTML = `
<div class="si">
  <h2 class="section-title" id="events-titre">📅 Agenda</h2>
  <div class="events-grid">
    ${C.agenda.map(e=>`
    <article class="event-card rv">
      <div class="event-stripe event-stripe-${e.couleur||'blue'}"></div>
      <time class="event-date-label" datetime="${e.dateIso}">${e.dateAff}</time>
      <div class="event-title">${e.titre}</div>
      <div class="event-info">${e.details}</div>
      <span class="event-tag">${e.tag}</span>
    </article>`).join('')}
  </div>
</div>`;
    document.getElementById('main').appendChild(sec);
  },
});

/* ── ÉLUS ── */
INDXONE.register({
  id: 'elus',
  order: 70,
  css: `
.elus-section{background:var(--bg2);border-top:1px solid var(--border);padding:2.5rem 5vw}
.elus-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(175px,1fr));gap:1rem;margin-top:1.2rem}
.elu-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:1.2rem;text-align:center}
.elu-avatar{width:52px;height:52px;border-radius:50%;background:var(--forest);color:#fff;display:flex;align-items:center;justify-content:center;font-family:Georgia,serif;font-weight:700;font-size:1.1rem;margin:0 auto .7rem}
.elu-nom{font-family:Georgia,serif;font-weight:700;font-size:.88rem;color:var(--deep)}
.elu-role{font-size:.72rem;color:var(--muted);margin-top:2px;font-family:'DM Sans',sans-serif}`,

  render(C) {
    const list = C.elus?.length ? C.elus : [{nom:C.equipe?.maire||'—',role:'Maire',photo:null}];
    const sec = document.createElement('section');
    sec.id = 'elus';
    sec.className = 'elus-section';
    sec.innerHTML = `
<div class="si">
  <h2 class="section-title" id="elus-titre">👥 Conseil municipal</h2>
  <div class="elus-grid">
    ${list.map(e=>{
      const ini=e.nom.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
      return `<div class="elu-card rv">
        ${e.photo?`<img src="${e.photo}" alt="${e.nom}" class="elu-avatar" style="object-fit:cover" loading="lazy">`:`<div class="elu-avatar" aria-hidden="true">${ini}</div>`}
        <div class="elu-nom">${e.nom}</div>
        <div class="elu-role">${e.role}</div>
      </div>`;
    }).join('')}
  </div>
</div>`;
    document.getElementById('main').appendChild(sec);
  },
});