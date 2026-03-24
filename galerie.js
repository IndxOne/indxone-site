/**
 * Renderer : galerie — Galerie photos communale
 * Tier     : Connectée, Premium
 * Data     : C.medias = [{ src, alt, caption? }]
 * Eco      : lazy loading natif, pas de lib
 */
INDXONE.register({
  id: 'galerie',
  order: 73,
  css: `
.galerie-section{background:var(--bg);border-top:1px solid var(--border);padding:3rem 5vw}
.gal-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1rem;margin-top:1.2rem}
.gal-item{position:relative;border-radius:16px;overflow:hidden;display:block;aspect-ratio:4/3;border:1px solid var(--border);background:var(--bg2)}
.gal-item img{width:100%;height:100%;object-fit:cover;transition:transform .35s ease}
.gal-item:hover img{transform:scale(1.05)}
.gal-caption{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(28,46,26,.75));color:#fff;font-size:.72rem;padding:.5rem .75rem}`,

  render(C, main) {
    const medias = C.medias || [];
    const sec = document.createElement('section');
    sec.id = 'galerie';
    sec.className = 'galerie-section';
    sec.setAttribute('aria-labelledby', 'galerie-h2');
    sec.innerHTML = `
<div class="si">
  <h2 class="section-title" id="galerie-h2">🖼️ Galerie</h2>
  ${!medias.length
    ? `<p style="color:var(--muted);font-size:.875rem;font-style:italic">Aucune photo disponible pour l'instant.</p>`
    : `<div class="gal-grid">${medias.map((m,i) => `
  <a href="${m.src}" class="gal-item rv" target="_blank" rel="noopener" aria-label="${m.alt||'Photo '+(i+1)}">
    <img src="${m.src}" alt="${m.alt||''}" loading="lazy" decoding="async">
    ${m.caption?`<span class="gal-caption">${m.caption}</span>`:''}
  </a>`).join('')}</div>`}
</div>`;
    main.appendChild(sec);
  },
});
