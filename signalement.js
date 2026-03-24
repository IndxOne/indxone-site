INDXONE.register({
  id: 'signalement',
  order: 55,
  css: `
.signal-section{background:var(--bg2);border-top:1px solid var(--border);padding:2.5rem 5vw}
.signal-inner{max-width:760px;margin:0 auto}
.signal-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:2rem}
.signal-intro{font-size:.85rem;color:var(--muted);margin-bottom:1.2rem}
.signal-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
.sig-group{margin-bottom:.9rem}
.sig-group label{display:block;font-size:.82rem;font-weight:500;color:var(--deep);margin-bottom:.35rem}
.sig-group select,.sig-group input,.sig-group textarea{width:100%;padding:10px 14px;font-size:.86rem;font-family:'DM Sans',sans-serif;border:1.5px solid var(--border);border-radius:10px;background:var(--cream);color:var(--deep);transition:border-color .2s;outline:none}
.sig-group select:focus,.sig-group input:focus,.sig-group textarea:focus{border-color:var(--sage);box-shadow:0 0 0 3px rgba(91,138,107,.1)}
.sig-group textarea{resize:vertical;min-height:100px}
.sig-full{grid-column:1/-1}
.sig-submit{display:inline-flex;align-items:center;gap:8px;background:var(--terr);color:#fff;padding:11px 26px;border-radius:28px;font-size:.88rem;font-weight:600;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;transition:filter .2s,transform .2s}
.sig-submit:hover{filter:brightness(1.1);transform:translateY(-1px)}
.sig-success{display:none;background:#E9F7EF;border:1px solid var(--sage);border-radius:10px;padding:1rem;color:var(--forest);font-size:.85rem;margin-top:1rem}
@media(max-width:640px){.signal-grid{grid-template-columns:1fr}}`,

  render(C) {
    const CATS = ['Voirie / nid-de-poule','Éclairage public','Espaces verts','Propreté','Bâtiment communal','Autre'];
    const fAttr = C.formulaire?.provider==='netlify'
      ? `data-netlify="true" name="signalement-${C.formulaire.formName}"` : '';
    const sec = document.createElement('section');
    sec.id = 'signalement';
    sec.className = 'signal-section rv';
    sec.setAttribute('aria-labelledby','signal-h2');
    sec.innerHTML = `
<div class="signal-inner">
  <h2 class="section-title" id="signal-h2">🚧 Signalement citoyen</h2>
  <div class="signal-card">
    <p class="signal-intro">Signalez un problème sur le territoire de ${C.commune.nom}. La mairie traitera votre demande dans les meilleurs délais.</p>
    <form id="signalForm" ${fAttr} novalidate>
      <div class="signal-grid">
        <div class="sig-group">
          <label for="sig-cat">Catégorie *</label>
          <select id="sig-cat" name="categorie" required><option value="">— Choisir —</option>${CATS.map(c=>`<option value="${c}">${c}</option>`).join('')}</select>
        </div>
        <div class="sig-group">
          <label for="sig-lieu">Lieu</label>
          <input type="text" id="sig-lieu" name="lieu" placeholder="Rue, quartier…">
        </div>
        <div class="sig-group sig-full">
          <label for="sig-desc">Description *</label>
          <textarea id="sig-desc" name="description" required placeholder="Décrivez le problème…"></textarea>
        </div>
        <div class="sig-group">
          <label for="sig-nom">Votre nom</label>
          <input type="text" id="sig-nom" name="nom" autocomplete="name">
        </div>
        <div class="sig-group">
          <label for="sig-email">Email (pour suivi)</label>
          <input type="email" id="sig-email" name="email" autocomplete="email">
        </div>
      </div>
      <button type="submit" class="sig-submit">📨 Envoyer le signalement</button>
      <div class="sig-success" id="sigSuccess" role="alert">✓ Signalement transmis. Merci !</div>
    </form>
  </div>
</div>`;
    document.getElementById('main').appendChild(sec);

    sec.querySelector('#signalForm').addEventListener('submit',function(e){
      e.preventDefault();
      const f=e.target;
      if(!f.categorie.value||!f.description.value.trim()){
        if(!f.categorie.value) f.categorie.style.borderColor='#C0392B';
        if(!f.description.value.trim()) f.description.style.borderColor='#C0392B';
        return;
      }
      if(C.formulaire?.provider==='formspree'){
        fetch(C.formulaire.endpoint,{method:'POST',body:new FormData(f),headers:{Accept:'application/json'}})
          .then(()=>{sec.querySelector('#sigSuccess').style.display='block';f.reset();});
      } else {
        sec.querySelector('#sigSuccess').style.display='block';
        f.reset();
      }
    });
  },
});