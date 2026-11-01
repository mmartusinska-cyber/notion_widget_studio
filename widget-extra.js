/* Adds the counter and Warsaw weather export types to the builder. */
(() => {
  const legacy = window.widgetDocument;
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const makeCounter = c => {
    const title = escapeHtml(c.title), key = String(c.title || 'licznik').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    return `<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;font:15px/1.5 system-ui;background:transparent}.w{width:100%;padding:22px 16px;text-align:center;background:${c.bg};color:${c.fg};border-radius:${c.rounded?'17px':'3px'};border:1px solid #0000000a;box-shadow:0 8px 28px #00000010}.title{font-size:12px;letter-spacing:.09em;text-transform:uppercase;opacity:.65;font-weight:700;margin-bottom:10px}.n{font-size:64px;line-height:1.15;font-weight:700;font-variant-numeric:tabular-nums}.buttons{display:flex;justify-content:center;gap:12px;margin-top:12px}.buttons button{width:54px;height:54px;border:1px solid color-mix(in srgb,${c.fg} 18%,transparent);border-radius:9px;background:color-mix(in srgb,${c.fg} 5%,transparent);color:${c.fg};font-size:28px;line-height:1;cursor:pointer}</style></head><body><div class="w">${title?`<div class="title">${title}</div>`:''}<div class="n" id="n">${c.initial}</div><div class="buttons"><button aria-label="Zmniejsz" id="minus">−</button><button aria-label="Zwiększ" id="plus">+</button></div></div><script>const k='notion-counter-${key}',n=document.getElementById('n');let v=Math.max(0,Number(localStorage.getItem(k)??${c.initial}));function show(){n.textContent=v;localStorage.setItem(k,v)}document.getElementById('plus').onclick=()=>{v++;show()};document.getElementById('minus').onclick=()=>{v=Math.max(0,v-1);show()};show()<\/script></body></html>`;
  };
  const makeWeather = c => {
    const title = escapeHtml(c.title);
    return `<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title||'Pogoda Warszawa'}</title><style>*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;font:14px/1.45 system-ui;background:transparent}.w{width:100%;padding:18px 15px;background:${c.bg};color:${c.fg};border-radius:${c.rounded?'17px':'3px'};border:1px solid #0000000a;box-shadow:0 8px 28px #00000010}.title{text-align:center;font-size:12px;letter-spacing:.09em;text-transform:uppercase;opacity:.65;font-weight:700;margin-bottom:10px}.tabs{display:flex;gap:7px;margin:3px 0 10px}.tabs button{flex:1;padding:7px;border:1px solid color-mix(in srgb,${c.fg} 12%,transparent);border-radius:8px;background:transparent;color:inherit;font-size:12px;cursor:pointer}.tabs button.active{background:color-mix(in srgb,${c.accent} 15%,transparent);border-color:${c.accent};font-weight:700}.list{max-height:240px;overflow:auto;scrollbar-width:thin}.row{display:grid;grid-template-columns:46px 1fr 60px 67px;gap:4px;align-items:center;padding:8px 2px;border-bottom:1px solid color-mix(in srgb,${c.fg} 9%,transparent);font-size:12px}.hour{font-weight:700}.temp{text-align:right;font-weight:700;white-space:nowrap}.temp small{font-weight:400;opacity:.62}.meta{text-align:center;white-space:nowrap;font-size:11px}.state{text-align:center;padding:24px 5px;opacity:.7}.credit{text-align:center;font-size:10px;opacity:.52;margin-top:8px}</style></head><body><div class="w">${title?`<div class="title">${title}</div>`:''}<div id="app" class="state">Pobieram prognozę…</div><div class="credit">Warszawa · dane: Open-Meteo</div></div><script>const app=document.getElementById('app'),api='https://api.open-meteo.com/v1/forecast?latitude=52.2297&longitude=21.0122&hourly=temperature_2m,apparent_temperature,precipitation_probability,weather_code,cloud_cover&timezone=Europe%2FWarsaw&forecast_days=2&temperature_unit=celsius';function icon(c,n){if(c>=71&&c<=77||c>=85&&c<=86)return'❄️';if(c>=51&&c<=67||c>=80&&c<=82||c>=95)return'🌧️';return n<15?'☀️':n<55?'🌤️':'☁️'}function key(a){let p=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Warsaw'}).format(new Date()).split('-').map(Number);return new Date(Date.UTC(p[0],p[1]-1,p[2]+a)).toISOString().slice(0,10)}function draw(d,a){let h=d.hourly,hr=Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Warsaw',hour:'2-digit',hourCycle:'h23'}).format(new Date())),r=h.time.map((t,i)=>({t,i})).filter(x=>x.t.slice(0,10)===key(a)&&(a||Number(x.t.slice(11,13))>=hr));app.className='';app.innerHTML='<div class="tabs"><button class="'+(!a?'active':'')+'" data-day="0">Dziś</button><button class="'+(a?'active':'')+'" data-day="1">Jutro</button></div><div class="list">'+(r.map(x=>'<div class="row"><span class="hour">'+x.t.slice(11,16)+'</span><span class="meta">💧 '+(h.precipitation_probability[x.i]??0)+'%</span><span class="meta">'+icon(h.weather_code[x.i]??0,h.cloud_cover[x.i]??0)+' '+Math.round(h.cloud_cover[x.i]??0)+'%</span><span class="temp">'+Math.round(h.temperature_2m[x.i])+'° <small>('+Math.round(h.apparent_temperature[x.i])+'°)</small></span></div>').join('')||'<div class="state">Brak godzinowej prognozy.</div>')+'</div>';app.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>draw(d,Number(b.dataset.day)))}fetch(api).then(r=>{if(!r.ok)throw Error();return r.json()}).then(d=>draw(d,0)).catch(()=>{app.className='state';app.textContent='Nie udało się pobrać prognozy. Sprawdź połączenie.'})<\/script></body></html>`;
  };
  const baseDynamicForm = window.dynamicForm;
  const baseConfig = window.config;
  const baseRender = window.render;
  const isChecked = id => !!document.getElementById(id)?.checked;
  const controls = '<div class="section-title">Wygląd licznika</div><div class="field"><label for="counterBg">Kolor tła</label><div class="color-row"><input type="color" id="counterBg" value="#ffffff"><label class="check"><input type="checkbox" id="transparentBg"> Przezroczyste</label></div></div><div class="row"><label class="check"><input type="checkbox" id="counterShadow" checked> Cień</label><label class="check"><input type="checkbox" id="counterBorder" checked> Kontur</label></div><div class="field"><label for="counterFont">Czcionka licznika</label><select id="counterFont"><option value="system-ui,-apple-system,Segoe UI,sans-serif">Systemowa</option><option value="Arial,sans-serif">Arial</option><option value="Georgia,serif">Georgia</option><option value="monospace">Monospace</option></select></div><div class="field"><label for="counterSize">Wielkość czcionki: <span id="sizeValue">64</span> px</label><input id="counterSize" type="range" min="24" max="80" step="2" value="64"></div><div class="field"><label for="counterScale">Rozmiar całego licznika: <span id="scaleValue">80</span>%</label><input id="counterScale" type="range" min="45" max="100" step="5" value="80"><small>Zmniejsza kartę, odstępy i przyciski. Cyfrę dopasujesz osobno wyżej.</small></div>';
  window.config = () => ({...baseConfig(), counterBg:isChecked('transparentBg')?'transparent':(document.getElementById('counterBg')?.value||'#ffffff'), counterShadow:isChecked('counterShadow'), counterBorder:isChecked('counterBorder'), counterFont:document.getElementById('counterFont')?.value||'system-ui,-apple-system,Segoe UI,sans-serif', counterSize:Number(document.getElementById('counterSize')?.value||64), counterScale:Number(document.getElementById('counterScale')?.value||80)});
  window.render = () => {
    const w = document.getElementById('widget');
    w.style.width = ''; w.style.padding = ''; w.style.background = ''; w.style.boxShadow = ''; w.style.border = '';
    baseRender();
    const c = window.config();
    if (c.type !== 'counter') return;
    const scale = c.counterScale / 100;
    w.style.width = `min(100%,${420 * scale}px)`;
    w.style.padding = `${24 * scale}px ${20 * scale}px`;
    w.style.background = c.counterBg;
    w.style.boxShadow = c.counterShadow ? '0 12px 34px #25231b12' : 'none';
    w.style.border = c.counterBorder ? '1px solid color-mix(in srgb,var(--wfg) 13%,transparent)' : 'none';
    const number = w.querySelector('[data-number]');
    if (number) { number.style.fontFamily = c.counterFont; number.style.fontSize = `${c.counterSize}px`; }
    w.querySelectorAll('[data-delta]').forEach(b => { b.style.width = `${54 * scale}px`; b.style.height = `${54 * scale}px`; b.style.fontSize = `${28 * scale}px`; });
  };
  window.dynamicForm = () => {
    baseDynamicForm();
    if (document.getElementById('type').value === 'counter') document.getElementById('dynamic').insertAdjacentHTML('beforeend', controls);
    window.render();
  };
  document.getElementById('type').onchange = window.dynamicForm;
  document.addEventListener('input', e => {
    if (e.target.id === 'counterSize') document.getElementById('sizeValue').textContent = e.target.value;
    if (e.target.id === 'counterScale') document.getElementById('scaleValue').textContent = e.target.value;
  });
  window.dynamicForm();
  const makeStyledCounter = c => {
    const scale = (c.counterScale || 80) / 100;
    return makeCounter(c)
      .replace('width:100%;padding:22px 16px;text-align:center;', `width:min(100%,${420*scale}px);padding:${24*scale}px ${20*scale}px;text-align:center;`)
      .replace(`background:${c.bg};color:${c.fg};border-radius:${c.rounded?'17px':'3px'};border:1px solid #0000000a;box-shadow:0 8px 28px #00000010`, `background:${c.counterBg||c.bg};color:${c.fg};border-radius:${c.rounded?'17px':'3px'};border:${c.counterBorder?'1px solid color-mix(in srgb,'+c.fg+' 13%,transparent)':'none'};box-shadow:${c.counterShadow?'0 8px 28px #00000010':'none'}`)
      .replace('.n{font-size:64px;line-height:1.15;', `.n{font-size:${c.counterSize||64}px;font-family:${c.counterFont||'system-ui,sans-serif'};line-height:1.15;`)
      .replace('width:54px;height:54px;', `width:${54*scale}px;height:${54*scale}px;`)
      .replace('font-size:28px;line-height:1;', `font-size:${28*scale}px;line-height:1;`);
  };
  window.widgetDocument = c => c.type === 'counter' ? makeStyledCounter(c) : c.type === 'weather' ? makeWeather(c) : legacy(c);
})();
