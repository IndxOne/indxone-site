/**
 * Renderer : meteo — Météo locale temps réel
 * Tier     : Connectée, Premium
 * API      : open-meteo.com — gratuit, sans clé, CORS ok
 */
INDXONE.register({
  id: 'meteo',
  order: 20,
  css: `
.meteo-section{background:var(--cream);padding:0 5vw 1.5rem}
.meteo-card{max-width:700px;margin:0 auto;background:var(--card);border:1px solid var(--border);border-radius:20px;padding:1.2rem 1.6rem;display:flex;align-items:center;gap:1.4rem;flex-wrap:wrap;box-shadow:0 4px 20px rgba(44,56,32,.07)}
.meteo-temp{font-family:Georgia,serif;font-weight:700;font-size:2.2rem;color:var(--deep);line-height:1;flex-shrink:0}
.meteo-emoji{font-size:1.8rem;flex-shrink:0}
.meteo-label{font-size:.85rem;color:var(--deep);font-weight:600}
.meteo-sub{font-size:.72rem;color:var(--muted);margin-top:2px}
.meteo-pills{display:flex;gap:.6rem;margin-left:auto;flex-wrap:wrap}
.meteo-pill{background:var(--bg2);border:1px solid var(--border);border-radius:50px;padding:4px 12px;font-size:.72rem;color:var(--muted);white-space:nowrap}
.meteo-src{font-size:.6rem;color:var(--muted);opacity:.4;align-self:flex-end;width:100%;text-align:right}`,

  render(C) {
    const WMO = {
      0:'☀️ Ciel dégagé',1:'🌤️ Peu nuageux',2:'⛅ Partiellement nuageux',3:'☁️ Couvert',
      45:'🌫️ Brouillard',48:'🌫️ Brouillard givrant',
      51:'🌦️ Bruine légère',53:'🌦️ Bruine',55:'🌧️ Bruine forte',
      61:'🌧️ Pluie légère',63:'🌧️ Pluie',65:'🌧️ Pluie forte',
      71:'🌨️ Neige légère',73:'❄️ Neige',75:'❄️ Neige forte',
      80:'🌦️ Averses légères',81:'🌧️ Averses',82:'⛈️ Fortes averses',
      95:'⛈️ Orage',96:'⛈️ Orage + grêle',99:'⛈️ Orage fort',
    };
    const sec = document.createElement('section');
    sec.id = 'meteo';
    sec.className = 'meteo-section';
    sec.setAttribute('aria-label','Météo locale');
    sec.innerHTML = `<div class="meteo-card"><p style="color:var(--muted);font-size:.85rem">⏳ Chargement météo…</p></div>`;
    document.getElementById('main').appendChild(sec);

    const el = sec.querySelector('.meteo-card');
    const {lat,lng} = C.contact;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,apparent_temperature,weathercode,windspeed_10m,precipitation&wind_speed_unit=kmh&timezone=auto`)
      .then(r=>r.json())
      .then(d=>{
        const cur=d.current;
        const label=WMO[cur.weathercode]||'🌡️ Météo';
        el.innerHTML=`
  <span class="meteo-emoji">${label.split(' ')[0]}</span>
  <div class="meteo-temp">${Math.round(cur.temperature_2m)}°</div>
  <div>
    <div class="meteo-label">${label.split(' ').slice(1).join(' ')}</div>
    <div class="meteo-sub">Ressenti ${Math.round(cur.apparent_temperature)}°C · ${C.commune.nom}</div>
  </div>
  <div class="meteo-pills">
    <span class="meteo-pill">💧 ${cur.precipitation} mm</span>
    <span class="meteo-pill">💨 ${Math.round(cur.windspeed_10m)} km/h</span>
  </div>
  <span class="meteo-src">Open-Meteo</span>`;
      })
      .catch(()=>{el.innerHTML='<p style="color:var(--muted);font-size:.8rem">Météo indisponible</p>';});
  },
});