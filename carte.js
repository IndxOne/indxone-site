INDXONE.register({
  id: 'carte',
  order: 80,
  css: `
.map-section{background:var(--cream);border-top:1px solid var(--border);padding:2.5rem 5vw}
.map-container{margin-top:1.2rem;border-radius:16px;overflow:hidden;border:1px solid var(--border);box-shadow:0 4px 20px rgba(44,56,32,.1);height:380px}
#map{width:100%;height:100%}
.map-note{font-size:.75rem;color:var(--muted);margin-top:.6rem}
.map-note a{color:var(--sage,var(--accent))}
@media(max-width:768px){.map-container{height:260px;border-radius:12px;margin-bottom:80px}}`,

  render(C, main) {
    const sec = document.createElement('section');
    sec.id = 'carte';
    sec.className = 'map-section';
    sec.setAttribute('aria-labelledby', 'map-titre');
    sec.innerHTML = `
<div class="si">
  <h2 class="section-title" id="map-titre">🗺️ Accès & Plan</h2>
  <p style="font-size:.875rem;color:var(--muted);margin-bottom:1rem;font-weight:300">${C.contact.adresse}, ${C.commune.codePostal} ${C.commune.nom}</p>
  <div class="map-container"><div id="map"></div></div>
  <p class="map-note">Données © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributeurs</p>
</div>`;
    main.appendChild(sec);

    // Lazy-load Leaflet uniquement quand la section est visible
    const obs = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      obs.disconnect();
      _initMap(C);
    }, { threshold: 0.1 });
    obs.observe(sec);
  },
});

function _initMap(C) {
  // CSS Leaflet
  if (!document.getElementById('leaflet-css')) {
    const link = document.createElement('link');
    link.id = 'leaflet-css';
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
    document.head.appendChild(link);
  }
  // JS Leaflet
  const s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
  s.onload = () => {
    const map = L.map('map', { scrollWheelZoom: false })
      .setView([C.contact.lat, C.contact.lng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap', maxZoom: 19,
    }).addTo(map);
    const mk = L.divIcon({
      html: `<div style="background:var(--forest,var(--forest);color:#fff;width:36px;height:36px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;border:3px solid #fff;box-shadow:0 3px 12px rgba(0,0,0,.3);font-size:1rem"><span style="transform:rotate(45deg)">${C.commune.emoji}</span></div>`,
      className: '', iconSize: [36,36], iconAnchor: [18,36], popupAnchor: [0,-40],
    });
    L.marker([C.contact.lat, C.contact.lng], { icon: mk, alt: `Mairie de ${C.commune.nom}` })
      .addTo(map)
      .bindPopup(`<strong style="font-size:.9rem">Mairie de ${C.commune.nom}</strong><br><span style="font-size:.8rem">${C.contact.adresse}, ${C.commune.codePostal}</span><br><a href="${C.contact.googleMaps}" target="_blank" rel="noopener" style="font-size:.8rem;color:var(--sage)">Google Maps ↗</a>`,{maxWidth:200})
      .openPopup();
  };
  document.head.appendChild(s);
}
