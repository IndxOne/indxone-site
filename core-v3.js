/**
 * INDXONE — core-v3.js
 * Renderer core : nav · hero · horaires · footer
 * D.A  : Naturel Arrondi (③)
 * Tier : Vitrine(hamburger) · Active/Connectée/Premium(tab bar app)
 * Eco  : 0 lib externe, CSS inline, scroll-reveal via .rv
 */
INDXONE.register({
  id: 'core',
  order: 0,

  css: `
/* ── TOKENS V3 (surcharge depuis config.couleurs via applyTokens) ── */
:root{
  --forest:#2D5016; --sage:#5B8A6B; --terr:#C4703A;
  --cream:#F5F0E8;  --deep:#1C2E1A; --muted:#5C6B60;
  --card:#FFFFFF;   --bg2:#EBF2E4;
  --border:rgba(91,138,107,0.14);
  --alert-bg:#FEF3EA; --alert-tx:#7A3B1E;
}

/* ── RESET + BASE ── */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased}
body{font-family:'DM Sans',sans-serif;background:var(--cream);color:var(--deep);font-size:16px;line-height:1.65}
a{color:inherit}
img{display:block;max-width:100%}
.si{max-width:1200px;margin:0 auto;padding:0 5vw}
.rv{opacity:0;transform:translateY(18px);transition:opacity .55s ease,transform .55s ease}
.rv.visible{opacity:1;transform:translateY(0)}
.section-title{font-family:Georgia,serif;font-weight:700;font-size:1.35rem;color:var(--deep);margin-bottom:1.2rem}

/* ── URGENCE ── */
.urgence-bar{background:var(--alert-bg);border-bottom:1px solid rgba(196,112,58,.2);padding:9px 5vw;display:flex;align-items:center;gap:10px;font-size:.8rem;color:var(--alert-tx);line-height:1.45}
.urgence-bar .urg-ico{font-size:.95rem;flex-shrink:0}
.urgence-bar .urg-close{margin-left:auto;background:none;border:none;cursor:pointer;color:var(--terr);font-size:1.1rem;padding:0 4px;line-height:1;opacity:.7}
.urgence-bar .urg-close:hover{opacity:1}

/* ── NAV desktop ── */
.nav-v3{background:rgba(245,240,232,.96);border-bottom:1px solid transparent;position:sticky;top:0;z-index:200;transition:border-color .3s,backdrop-filter .3s;backdrop-filter:blur(0)}
.nav-v3.scrolled{border-color:var(--border);backdrop-filter:blur(12px)}
.nav-inner{max-width:1200px;margin:0 auto;padding:0 5vw;height:64px;display:flex;align-items:center;justify-content:space-between}
.nav-brand{display:flex;align-items:center;gap:12px;text-decoration:none}
.nav-blob{width:42px;height:42px;background:var(--forest);border-radius:40% 60% 60% 40% / 50% 50% 60% 40%;display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0;transition:border-radius .4s}
.nav-brand:hover .nav-blob{border-radius:50%}
.nav-brand-nom{font-family:Georgia,serif;font-weight:700;font-size:.95rem;color:var(--deep);line-height:1.2}
.nav-brand-dep{font-family:'DM Sans',sans-serif;font-size:.62rem;color:var(--sage);letter-spacing:.04em}
.nav-links{display:flex;align-items:center;gap:4px;list-style:none}
.nav-links a{font-family:'DM Sans',sans-serif;font-size:.8rem;color:var(--deep);text-decoration:none;padding:5px 12px;border-radius:24px;transition:background .2s,color .2s}
.nav-links a:hover{background:var(--sage);color:#fff}
.nav-cta{background:var(--terr)!important;color:#fff!important;font-weight:600!important;padding:8px 18px!important;border-radius:24px!important;white-space:nowrap}

/* ── HAMBURGER (Vitrine uniquement) ── */
.hbg{display:none;flex-direction:column;gap:4px;cursor:pointer;padding:6px;background:none;border:none;border-radius:8px}
.hbg span{display:block;height:2px;background:var(--deep);border-radius:2px;transition:all .3s}
.hbg.open span:nth-child(1){transform:translateY(6px) rotate(45deg)}
.hbg.open span:nth-child(2){opacity:0;transform:scaleX(0)}
.hbg.open span:nth-child(3){transform:translateY(-6px) rotate(-45deg)}
.hbg span:nth-child(1){width:22px}
.hbg span:nth-child(2){width:16px}
.hbg span:nth-child(3){width:22px}
.mob-menu{display:none;position:fixed;inset:64px 0 0;background:var(--forest);z-index:199;flex-direction:column;padding:2rem 5vw;gap:.5rem;overflow-y:auto}
.mob-menu.open{display:flex}
.mob-menu a{font-family:Georgia,serif;font-size:1.25rem;font-weight:700;color:#fff;text-decoration:none;padding:14px 0;border-bottom:1px solid rgba(255,255,255,.1);line-height:1}
.mob-menu a:last-child{border-bottom:none}

/* ── HERO ── */
.hero-v3{max-width:1200px;margin:0 auto;padding:60px 5vw 48px;display:grid;grid-template-columns:1fr 300px;gap:48px;align-items:start}
.hero-badge{display:inline-flex;align-items:center;gap:7px;background:var(--bg2);border-radius:24px;padding:4px 14px;font-family:'DM Sans',sans-serif;font-size:.7rem;color:var(--sage);font-weight:600;margin-bottom:20px}
.hero-h1{font-family:Georgia,serif;font-size:clamp(2.3rem,5vw,3.8rem);font-weight:700;line-height:1.12;color:var(--deep);margin-bottom:14px}
.hero-h1 span{color:var(--sage)}
.hero-sub{font-family:'DM Sans',sans-serif;font-size:.95rem;color:var(--muted);line-height:1.75;max-width:420px;margin-bottom:28px}
.hero-actions{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:32px}
.btn-primary-v3{background:var(--sage);color:#fff;padding:11px 24px;border-radius:28px;font-family:'DM Sans',sans-serif;font-size:.88rem;font-weight:600;text-decoration:none;transition:filter .2s,transform .2s;border:none;cursor:pointer}
.btn-primary-v3:hover{filter:brightness(1.1);transform:translateY(-1px)}
.btn-outline-v3{border:2px solid var(--sage);color:var(--sage);padding:11px 24px;border-radius:28px;font-family:'DM Sans',sans-serif;font-size:.88rem;font-weight:600;text-decoration:none;transition:background .2s,color .2s}
.btn-outline-v3:hover{background:var(--sage);color:#fff}
.btn-alert-v3{border:1.5px solid rgba(196,112,58,.35);color:var(--terr);padding:11px 24px;border-radius:28px;font-family:'DM Sans',sans-serif;font-size:.88rem;font-weight:500;text-decoration:none;transition:background .2s}
.btn-alert-v3:hover{background:var(--alert-bg)}
.hero-stats{display:flex;gap:24px}
.hero-stat .num{font-family:Georgia,serif;font-weight:700;font-size:1.4rem;color:var(--deep);line-height:1}
.hero-stat .lbl{font-family:'DM Sans',sans-serif;font-size:.62rem;color:var(--muted);margin-top:3px;letter-spacing:.04em}

/* ── HORAIRES CARD ── */
.hcrd{background:var(--card);border-radius:24px;padding:24px 20px;box-shadow:0 4px 24px rgba(44,56,48,.08);border:1px solid var(--border)}
.hcrd-row{display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid var(--border)}
.hcrd-row:last-of-type{border-bottom:none}
.hcrd-row.closed{opacity:.35}
.hcrd-row.today .hcrd-j{font-weight:700;color:var(--forest)}
.hcrd-row.today .hcrd-h{color:var(--terr)}
.hcrd-j{font-family:'DM Sans',sans-serif;font-size:.75rem;font-weight:500;color:var(--deep)}
.hcrd-h{font-family:'DM Sans',sans-serif;font-size:.75rem;color:var(--sage);font-weight:600}
.hcrd-h.closed{color:var(--muted);font-weight:400}
.status-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.hcrd-label{font-size:.6rem;color:var(--sage);letter-spacing:.08em;text-transform:uppercase;font-family:'DM Sans',sans-serif;margin-bottom:6px}
.hcrd-divider{border:none;border-top:1px solid var(--border);margin:14px 0}
.hcrd-tel{display:flex;align-items:center;justify-content:center;gap:8px;background:var(--terr);color:#fff;border-radius:24px;padding:10px 16px;font-family:'DM Sans',sans-serif;font-size:.82rem;font-weight:700;text-decoration:none;transition:filter .2s}
.hcrd-tel:hover{filter:brightness(1.1)}
.ini-circle{width:36px;height:36px;background:var(--bg2);border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:Georgia,serif;font-weight:700;color:var(--sage);font-size:.78rem;flex-shrink:0}

/* ── TAB BAR MOBILE (Active+) ── */
.tab-bar{display:none;position:fixed;bottom:0;left:0;right:0;z-index:1000;background:var(--card);border-top:1px solid var(--border);padding:10px 0 env(safe-area-inset-bottom,16px)}
@media(max-width:768px){.tab-bar{display:block}}
.tab-bar-inner{display:flex;justify-content:space-around}
.tab-btn{display:flex;flex-direction:column;align-items:center;gap:3px;background:none;border:none;cursor:pointer;padding:0 12px;position:relative}
.tab-btn .tb-ico{font-size:1.25rem;line-height:1}
.tab-btn .tb-lbl{font-family:'DM Sans',sans-serif;font-size:.58rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#999;transition:color .2s}
.tab-btn.active .tb-lbl{color:var(--sage)}
.tab-btn .tb-line{position:absolute;bottom:-2px;width:20px;height:2px;background:var(--sage);border-radius:2px;transform:scaleX(0);transition:transform .2s}
.tab-btn.active .tb-line{transform:scaleX(1)}

/* ── FOOTER ── */
.footer-v3{background:var(--deep);color:rgba(250,248,244,.9);padding:40px 5vw 28px;margin-top:0}
.footer-inner{max-width:1200px;margin:0 auto}
.footer-top{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:24px;border-bottom:1px solid rgba(255,255,255,.08);margin-bottom:16px;gap:32px;flex-wrap:wrap}
.footer-nom{font-family:Georgia,serif;font-size:1rem;font-weight:700;margin-bottom:5px}
.footer-adr{font-family:'DM Sans',sans-serif;font-size:.72rem;opacity:.45;line-height:1.7}
.footer-links{display:flex;gap:16px;flex-wrap:wrap}
.footer-links a{font-family:'DM Sans',sans-serif;font-size:.72rem;color:rgba(250,248,244,.5);text-decoration:none;transition:color .2s}
.footer-links a:hover{color:rgba(250,248,244,.9)}
.footer-credit{font-family:'DM Sans',sans-serif;font-size:.55rem;color:var(--sage);letter-spacing:.1em;white-space:nowrap;margin-top:4px}
.footer-bottom{font-family:'DM Sans',sans-serif;font-size:.6rem;opacity:.2;letter-spacing:.04em}

/* ── RESPONSIVE ── */
@media(max-width:768px){
  .hero-v3{grid-template-columns:1fr;gap:28px;padding:40px 5vw 36px}
  .hcrd{padding:18px 16px}
  .nav-links,.nav-cta{display:none}
  .footer-top{flex-direction:column;gap:16px}
  .footer-v3{padding:32px 5vw 24px}
  .footer-top{flex-direction:column;gap:20px}
  .footer-nom{font-size:1.1rem}
  .footer-adr{font-size:.78rem;opacity:.6}
  .footer-links{gap:12px}
  .footer-links a{font-size:.78rem}
  .footer-credit{font-size:.62rem;margin-top:8px}
  .footer-bottom{font-size:.65rem;opacity:.3;margin-top:12px} 
}
@media(max-width:900px){
  .hero-v3{grid-template-columns:1fr;gap:28px}
}
`,

  render(C, helpers) {
    const { $ } = helpers;
    const tier = C.tier || 'vitrine';
    const isApp = ['active','connectee','premium'].includes(tier);

    // ── URGENCE ──────────────────────────────────────────────────
    const urgEl = document.getElementById('urgence');
    if (urgEl && C.urgence?.actif && C.urgence.message) {
      urgEl.innerHTML = `<div class="urgence-bar" role="alert">
        <span class="urg-ico">📢</span>
        <span>${C.urgence.message}</span>
        <button class="urg-close" aria-label="Fermer" onclick="this.closest('.urgence-bar').remove()">✕</button>
      </div>`;
    }

    // ── NAV ──────────────────────────────────────────────────────
    const navHtml = `
<a class="skip-link" href="#main">Aller au contenu</a>
<nav class="nav-v3" id="nav-v3" role="navigation" aria-label="Navigation principale">
  <div class="nav-inner">
    <a class="nav-brand" href="/">
      <div class="nav-blob" aria-hidden="true">${C.commune.emoji||'🏘️'}</div>
      <div>
        <div class="nav-brand-nom">${C.commune.nom}</div>
        <div class="nav-brand-dep">${C.commune.departement} · ${C.commune.codeInsee}</div>
      </div>
    </a>
    ${isApp ? `
    <ul class="nav-links" role="list">
  <li><a href="#actualites">Actualités</a></li>
  <li><a href="#services">Services</a></li>
  ${C.contact.telLink
    ? `<li><a href="tel:+${C.contact.telLink}" class="nav-cta">📞 Appeler</a></li>`
    : `<li><a href="#contact" class="nav-cta">Contact</a></li>`}
</ul>` : `
    <button class="hbg" id="hbg" aria-label="Menu" aria-expanded="false" aria-controls="mob-menu">
      <span></span><span></span><span></span>
    </button>
    <ul class="nav-links" role="list">
      <li><a href="#services">Services</a></li>
      <li><a href="#carte">Carte</a></li>
      ${C.contact.telLink ? `<li><a href="tel:+${C.contact.telLink}" class="nav-cta">📞 Appeler</a></li>` : `<li><a href="#contact" class="nav-cta">📞 Contact</a></li>`}
    </ul>`}
  </div>
</nav>
${!isApp ? `
<nav class="mob-menu" id="mob-menu" aria-label="Menu mobile">
  <a href="#services" onclick="closeMobMenu()">Services</a>
  <a href="#carte" onclick="closeMobMenu()">Carte</a>
  <a href="#contact" onclick="closeMobMenu()">Contact</a>
  ${C.contact.telLink ? `<a href="tel:+${C.contact.telLink}">📞 ${C.contact.telephone}</a>` : `<a href="#contact">✉️ Contact</a>`}
</nav>` : ''}`;

    document.getElementById('nav').innerHTML = navHtml;

    // ── HERO ─────────────────────────────────────────────────────
    const today = new Date().toLocaleDateString('fr-FR',{weekday:'long'});
    const todayCap = today.charAt(0).toUpperCase()+today.slice(1);
    const todayH = (C.horaires||[]).find(h=>h.jour===todayCap);
    const nowMin = new Date().getHours()*60+new Date().getMinutes();
    let isOpen = false;
    if(todayH?.ouvert){
      const m=(todayH.heures||'').match(/(\d+)h(\d*)\s*[–\-]\s*(\d+)h(\d*)/);
      if(m) isOpen = nowMin>=parseInt(m[1])*60+(parseInt(m[2]||0)) && nowMin<parseInt(m[3])*60+(parseInt(m[4]||0));
    }
    const dotColor = isOpen ? '#22c55e' : '#ef4444';
    const dotLabel = isOpen ? 'Mairie ouverte' : 'Mairie fermée';
    const dotTx = isOpen ? '#166534' : '#991b1b';

    const initials = (C.equipe?.maire && C.equipe.maire !== '—')
      ? C.equipe.maire.split(' ').map(w=>w[0]).slice(0,2).join('')
      : '🏛️';

    const hRows = (C.horaires||[]).map(h => {
      const unconfirmed = h.heures === 'À confirmer';
      const isToday = h.jour === todayCap;
      const cls = [h.ouvert && !unconfirmed ? '' : 'closed', isToday ? 'today' : ''].join(' ').trim();
      return `<div class="hcrd-row ${cls}"><span class="hcrd-j">${h.jour}</span><span class="hcrd-h ${cls}">${h.heures}</span></div>`;
    }).join('');

    const heroHtml = `
<section class="hero-v3 rv" id="accueil" aria-labelledby="hero-h1">
  <div>
    <div class="hero-badge">🌱 ${C.commune.region||C.commune.departement}</div>
    <h1 class="hero-h1" id="hero-h1">Bienvenue à<br><span>${C.commune.nom}</span></h1>
    <p class="hero-sub">${C.commune.description || 'Retrouvez toutes vos démarches, l\'agenda municipal et les actualités. Site officiel de la commune.'}</p>
    <div class="hero-actions">
      <a href="#services" class="btn-primary-v3">Vos démarches</a>
      <a href="#contact" class="btn-outline-v3">Nous contacter</a>
      ${['connectee','premium'].includes(tier)?`<a href="#signalement" class="btn-alert-v3">⚠ Signaler</a>`:''}
    </div>
    <div class="hero-stats">
      <div class="hero-stat"><div class="num">${C.commune.population}</div><div class="lbl">habitants</div></div>
      <div class="hero-stat"><div class="num">${C.commune.superficie}</div><div class="lbl">superficie</div></div>
      <div class="hero-stat"><div class="num">${C.equipe?.mandatFin||'2026'}</div><div class="lbl">mandat</div></div>
    </div>
  </div>
  <div class="hcrd" aria-label="Informations pratiques">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid var(--border)">
      <div class="status-dot" style="background:${dotColor}" aria-hidden="true"></div>
      <span style="font-family:'DM Sans',sans-serif;font-size:.78rem;font-weight:700;color:${dotTx}">${dotLabel}</span>
      ${todayH?`<span style="font-family:'DM Sans',sans-serif;font-size:.68rem;color:var(--muted);margin-left:auto">${todayH.heures}</span>`:''}
    </div>
    <div class="hcrd-label">Horaires d'ouverture</div>
    ${hRows}
    <hr class="hcrd-divider">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
      <div class="ini-circle" aria-hidden="true">${initials.length <= 2 ? initials : '<span style="font-size:1.1rem">'+initials+'</span>'}</div>
      <div>
        <div class="hcrd-label" style="margin-bottom:2px">Maire</div>
        <div style="font-family:Georgia,serif;font-size:.88rem;font-weight:600;color:var(--deep)">${C.equipe?.maire && C.equipe.maire !== '—' ? C.equipe.maire : 'Non renseigné'}</div>
      </div>
    </div>
    ${C.contact.telLink ? `<a href="tel:+${C.contact.telLink}" class="hcrd-tel">📞 ${C.contact.telephone||'Appeler'}</a>` : C.contact.telephone ? `<div style="font-family:'DM Sans',sans-serif;font-size:.82rem;color:var(--muted);text-align:center">📞 ${C.contact.telephone}</div>` : ''}
  </div>
</section>`;

    document.getElementById('hero').innerHTML = heroHtml;

    // ── FOOTER ───────────────────────────────────────────────────
    const year = new Date().getFullYear();
    document.getElementById('footer').innerHTML = `
<footer class="footer-v3" role="contentinfo">
  <div class="footer-inner">
    <div class="footer-top">
      <div>
        <div class="footer-nom">Mairie de ${C.commune.nom}</div>
        <div class="footer-adr">${C.contact.adresse}, ${C.contact.ville}${C.contact.telephone ? '<br>Tél : '+C.contact.telephone : ''}${C.contact.email ? ' · '+C.contact.email : ''}</div>
      </div>
      <div>
        <nav class="footer-links" aria-label="Liens utiles">
          ${(C.liensUtiles||[]).map(l=>`<a href="${l.url}" target="_blank" rel="noopener">${l.label}</a>`).join('')}
        </nav>
        <div class="footer-credit">PROPULSÉ PAR INDXONE.COM</div>
      </div>
    </div>
    <div class="footer-bottom">© ${year} Mairie de ${C.commune.nom} · Site réalisé par INDXONE · Données : API Gouv</div>
  </div>
</footer>`;

    // ── TAB BAR APP (Active+) ─────────────────────────────────────
    if(isApp){
      const hasSig = document.getElementById('signalement') !== null;
      const tabs4 = [
        {id:'accueil',ico:'🏠',lbl:'Accueil'},
        {id:'services',ico:'📋',lbl:'Services'},
        {id:'actualites',ico:'📰',lbl:'Actus'},
        {id:'contact',ico:'✉️',lbl:'Contact'},
      ];
      const tabs5 = [
        {id:'accueil',     ico:'🏠',lbl:'Accueil'},
        {id:'services',    ico:'📋',lbl:'Services'},
        {id:'actualites',  ico:'📰',lbl:'Actus'},
        {id:'signalement', ico:'🚧',lbl:'Signal'},
        {id:'contact',     ico:'✉️',lbl:'Contact'},
      ];
      const tabs = hasSig ? tabs5 : tabs4;
      const tabBar = document.createElement('div');
      tabBar.className='tab-bar';
      tabBar.setAttribute('role','navigation');
      tabBar.setAttribute('aria-label','Navigation rapide');
      tabBar.innerHTML=`<div class="tab-bar-inner">${tabs.map(t=>`
        <button class="tab-btn" onclick="scrollToSection('${t.id}')" aria-label="${t.lbl}">
          <span class="tb-ico" aria-hidden="true">${t.ico}</span>
          <span class="tb-lbl">${t.lbl}</span>
          <div class="tb-line"></div>
        </button>`).join('')}</div>`;
      document.body.appendChild(tabBar);
      // padding-bottom uniquement sur mobile
      const mq = window.matchMedia('(max-width:768px)');
      const applyPad = e => { document.body.style.paddingBottom = e.matches ? '72px' : '0'; };
      applyPad(mq);
      mq.addEventListener('change', applyPad);
    }

    // ── NAV SCROLL ────────────────────────────────────────────────
    window.addEventListener('scroll',function(){
      const nav=document.getElementById('nav-v3');
      if(nav) nav.classList.toggle('scrolled',window.scrollY>48);
    },{passive:true});

    // ── HAMBURGER ─────────────────────────────────────────────────
    const hbg=document.getElementById('hbg');
    if(hbg){
      hbg.addEventListener('click',function(){
        const open=!hbg.classList.contains('open');
        hbg.classList.toggle('open',open);
        hbg.setAttribute('aria-expanded',String(open));
        document.getElementById('mob-menu').classList.toggle('open',open);
        document.body.style.overflow=open?'hidden':'';
      });
    }
    window.closeMobMenu=function(){
      const h=document.getElementById('hbg');
      const m=document.getElementById('mob-menu');
      if(h){h.classList.remove('open');h.setAttribute('aria-expanded','false')}
      if(m) m.classList.remove('open');
      document.body.style.overflow='';
    };

    // ── SCROLL TO SECTION + TAB ACTIVE ────────────────────────────
    window.scrollToSection=function(id){
      const el=document.getElementById(id);
      if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
      document.querySelectorAll('.tab-btn').forEach(b=>{
        b.classList.toggle('active',b.getAttribute('onclick')===`scrollToSection('${id}')`);
      });
    };

    // Tab bar active on scroll
    if(isApp){
      const observer=new IntersectionObserver(entries=>{
        entries.forEach(e=>{
          if(e.isIntersecting){
            const id=e.target.id;
            document.querySelectorAll('.tab-btn').forEach(b=>{
              b.classList.toggle('active',b.getAttribute('onclick')===`scrollToSection('${id}')`);
            });
          }
        });
      },{threshold:.35});
      ['accueil','actualites','services','contact','carte'].forEach(id=>{
        const el=document.getElementById(id);
        if(el) observer.observe(el);
      });
      // Activer accueil par défaut
      const first=document.querySelector('.tab-btn');
      if(first) first.classList.add('active');
    }
  },
});
