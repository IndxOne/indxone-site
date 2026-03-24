/**
 * Renderer : score — Score numérique de présence digitale
 * Tier     : Active, Connectée, Premium
 * Data     : C.scores { siteWeb, demarches, accessibilite, reseaux, transparence }
 */
INDXONE.register({
  id: 'score',
  order: 60,
  css: `
.score-section{background:var(--cream);border-top:1px solid var(--border);padding:2.5rem 5vw}
.score-layout{display:grid;grid-template-columns:140px 1fr;gap:2.5rem;align-items:center;margin-top:1.2rem}
.sc-grade-wrap{text-align:center}
.sc-grade{width:84px;height:84px;border-radius:50%;border:4px solid;display:flex;align-items:center;justify-content:center;font-family:Georgia,serif;font-weight:700;font-size:2.4rem;margin:0 auto .5rem}
.sc-total{font-family:'DM Sans',sans-serif;font-size:1.1rem;font-weight:700;color:var(--deep)}
.sc-comment{font-size:.72rem;color:var(--muted);margin-top:.2rem}
.sc-row{display:grid;grid-template-columns:150px 1fr 50px;gap:.7rem;align-items:center;margin-bottom:.6rem}
.sc-lbl{font-size:.8rem;color:var(--deep);font-family:'DM Sans',sans-serif}
.sc-track{background:var(--border);border-radius:50px;height:7px;overflow:hidden}
.sc-fill{height:100%;border-radius:50px;background:linear-gradient(90deg,var(--forest),var(--sage));transition:width .8s ease}
.sc-num{font-family:'DM Sans',sans-serif;font-size:.72rem;color:var(--muted);text-align:right}
@media(max-width:640px){.score-layout{grid-template-columns:1fr}.sc-grade-wrap{display:flex;align-items:center;gap:1rem;text-align:left}.sc-grade{margin:0}.sc-row{grid-template-columns:100px 1fr 40px}}`,

  render(C) {
    const S = C.scores || {};
    const CRITERIA = [
      {k:'siteWeb',       l:'Site web',          max:25},
      {k:'demarches',     l:'Démarches en ligne', max:25},
      {k:'accessibilite', l:'Accessibilité',      max:20},
      {k:'reseaux',       l:'Réseaux sociaux',    max:20},
      {k:'transparence',  l:'Transparence',       max:10},
    ];
    const total   = CRITERIA.reduce((a,c)=>a+Math.min(S[c.k]||0,c.max),0);
    const grade   = total>=80?'A':total>=65?'B':total>=50?'C':total>=35?'D':'E';
    const gColor  = total>=80?'#1E8449':total>=65?'var(--sage)':total>=50?'var(--terr)':total>=35?'#D35400':'#C0392B';
    const comment = total>=80?'Excellente présence':total>=65?'Bonne présence':total>=50?'Présence partielle':total>=35?'Présence minimale':'Présence absente';

    const sec = document.createElement('section');
    sec.id = 'score';
    sec.className = 'score-section rv';
    sec.setAttribute('aria-labelledby','score-h2');
    sec.innerHTML = `
<div class="si">
  <h2 class="section-title" id="score-h2">📊 Score numérique</h2>
  <div class="score-layout">
    <div class="sc-grade-wrap">
      <div class="sc-grade" style="border-color:${gColor};color:${gColor}">${grade}</div>
      <div class="sc-total">${total}<span style="font-size:.7em;color:var(--muted)">/100</span></div>
      <div class="sc-comment">${comment}</div>
    </div>
    <div class="sc-bars">
      ${CRITERIA.map(c=>{const v=Math.min(S[c.k]||0,c.max),p=Math.round(v/c.max*100);return`<div class="sc-row"><span class="sc-lbl">${c.l}</span><div class="sc-track"><div class="sc-fill" style="width:${p}%"></div></div><span class="sc-num">${v}/${c.max}</span></div>`;}).join('')}
    </div>
  </div>
</div>`;
    document.getElementById('main').appendChild(sec);
  },
});