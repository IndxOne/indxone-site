INDXONE.register({
  id: 'contact',
  order: 90,
  css: `
.contact-section{background:var(--bg2);border-top:1px solid var(--border);padding:2.5rem 5vw}
.contact-inner{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:start}
.contact-form-wrap{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:2rem}
.form-group{margin-bottom:1rem}
.form-group label{display:block;font-size:.82rem;font-weight:500;color:var(--deep);margin-bottom:.35rem}
.form-group .req{color:var(--terr)}
.form-group input,.form-group select,.form-group textarea{width:100%;padding:10px 14px;font-size:.88rem;font-family:'DM Sans',sans-serif;border:1.5px solid var(--border);border-radius:10px;background:var(--cream);color:var(--deep);transition:border-color .2s,box-shadow .2s;outline:none}
.form-group input:focus,.form-group select:focus,.form-group textarea:focus{border-color:var(--sage);box-shadow:0 0 0 3px rgba(91,138,107,.12)}
.form-group textarea{resize:vertical;min-height:110px}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
.btn-submit{display:inline-flex;align-items:center;gap:8px;background:var(--forest);color:#fff;padding:11px 26px;border-radius:28px;font-size:.88rem;font-weight:600;border:none;cursor:pointer;transition:filter .2s,transform .2s;font-family:'DM Sans',sans-serif}
.btn-submit:hover{filter:brightness(1.1);transform:translateY(-1px)}
.form-success{display:none;background:#E9F7EF;border:1px solid var(--sage);border-radius:10px;padding:1rem 1.2rem;color:var(--forest);font-size:.85rem;margin-top:1rem}
.cii{display:flex;flex-direction:column;gap:1rem}
.cii-item{display:flex;align-items:flex-start;gap:12px;background:var(--card);border:1px solid var(--border);border-radius:14px;padding:1rem}
.cii-icon{width:38px;height:38px;border-radius:10px;background:var(--bg2);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.cii-icon svg{color:var(--sage)}
.cii-label{font-size:.7rem;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;font-family:'DM Sans',sans-serif;margin-bottom:3px}
.cii-val{font-size:.86rem;color:var(--deep)}
.cii-val a{color:var(--sage);text-decoration:none}
.cii-val a:hover{text-decoration:underline}
@media(max-width:900px){.contact-inner{grid-template-columns:1fr}}
@media(max-width:640px){.form-row{grid-template-columns:1fr}}`,

  render(C, main, ctx) {
    const { icon, ICONS } = ctx;
    const sec = document.createElement('section');
    sec.id = 'contact';
    sec.className = 'contact-section';
    sec.setAttribute('aria-labelledby', 'contact-titre');

    const sujets = (C.formulaire?.sujets || [])
      .map(s => `<option value="${s}">${s}</option>`).join('');
    const fAttr = C.formulaire?.provider === 'netlify'
      ? `data-netlify="true" name="${C.formulaire.formName}"`
      : '';

    // Horaires résumé
    const horOuverts = (C.horaires || []).filter(h => h.ouvert);
    const horTxt = horOuverts.length
      ? horOuverts.map(h => `${h.jour} ${h.heures}`).join(' · ')
      : 'Voir les horaires';

    sec.innerHTML = `
<div class="si">
  <h2 class="section-title" id="contact-titre">${icon(ICONS.mail)} Nous contacter</h2>
  <div class="contact-inner">
  <div>
    <div class="contact-form-wrap rv">
        <div class="form-row">
          <div class="form-group"><label for="nom">Nom <span class="req">*</span></label><input type="text" id="nom" name="nom" required autocomplete="family-name" placeholder="Dupont"></div>
          <div class="form-group"><label for="prenom">Prénom</label><input type="text" id="prenom" name="prenom" autocomplete="given-name" placeholder="Jean"></div>
        </div>
        <div class="form-group"><label for="email">Email <span class="req">*</span></label><input type="email" id="email" name="email" required autocomplete="email" placeholder="jean@example.fr"></div>
        <div class="form-group"><label for="sujet">Objet <span class="req">*</span></label><select id="sujet" name="sujet" required><option value="">— Sélectionnez —</option>${sujets}</select></div>
        <div class="form-group"><label for="message">Message <span class="req">*</span></label><textarea id="message" name="message" required placeholder="Votre demande..."></textarea></div>
        <div class="form-group" style="display:flex;align-items:flex-start;gap:10px">
          <input type="checkbox" id="rgpd" name="rgpd" required style="width:auto;margin-top:3px">
          <label for="rgpd" style="font-size:.8rem;color:var(--muted);font-weight:300;cursor:pointer">J'accepte que mes données soient utilisées pour traiter ma demande. <span class="req">*</span></label>
        </div>
        <button type="submit" class="btn-submit">${icon(ICONS.send)} Envoyer</button>
        <div class="form-success" id="formSuccess" role="alert"><strong>✓ Message envoyé !</strong> La mairie vous répondra sous 2–3 jours ouvrés.</div>
      </form>
    </div>
  </div>
  <div class="cii rv" style="transition-delay:.1s">
    <div class="cii-item"><div class="cii-icon">${icon(ICONS.pin)}</div><div><div class="cii-label">Adresse</div><div class="cii-val">${C.contact.adresse}<br>${C.commune.codePostal} ${C.commune.nom}</div></div></div>
    <div class="cii-item"><div class="cii-icon">${icon(ICONS.phone)}</div><div><div class="cii-label">Téléphone</div><div class="cii-val"><a href="tel:+${C.contact.telLink}">${C.contact.telephone}</a></div></div></div>
    <div class="cii-item"><div class="cii-icon">${icon(ICONS.mail)}</div><div><div class="cii-label">Email</div><div class="cii-val"><a href="mailto:${C.contact.email}">${C.contact.email}</a></div></div></div>
    <div class="cii-item"><div class="cii-icon">${icon(ICONS.clock)}</div><div><div class="cii-label">Horaires</div><div class="cii-val" style="font-size:.82rem">${horTxt}</div></div></div>
    <a href="${C.contact.googleMaps}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:8px;background:var(--forest,var(--forest));color:#fff;padding:11px 20px;border-radius:8px;font-size:.875rem;font-weight:500;text-decoration:none;transition:filter .2s" onmouseover="this.style.filter='brightness(1.15)'" onmouseout="this.style.filter=''">
      ${icon(ICONS.map)} Ouvrir dans Google Maps ↗
    </a>
  </div>
</div>`;
    main.appendChild(sec);

    // Form submit handler
    sec.querySelector('#contactForm')?.addEventListener('submit', function(e) {
      e.preventDefault();
      const f = e.target;
      const valid = ['nom','email','sujet','message'].every(id => f[id]?.value.trim()) && f.rgpd?.checked;
      if (!valid) {
        ['nom','email','sujet','message'].forEach(id => {
          if (f[id]) f[id].style.borderColor = f[id].value.trim() ? '' : '#C0392B';
        });
        return;
      }
      if (C.formulaire?.provider === 'formspree') {
        fetch(C.formulaire.endpoint, { method:'POST', body: new FormData(f), headers:{Accept:'application/json'} })
          .then(() => { sec.querySelector('#formSuccess').style.display = 'block'; f.reset(); });
      } else {
        sec.querySelector('#formSuccess').style.display = 'block';
        f.reset();
      }
    });

    sec.addEventListener('focus', e => {
      if (['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName)) e.target.style.borderColor = '';
    }, true);
  },
});
