// Town decorations: beach circus by day, campfire gathering by night (runs after town.js)
(() => {
  'use strict';
  const town = document.getElementById('town'), map = document.getElementById('town-map');
  if (!town || !map) return;
  const NS = 'http://www.w3.org/2000/svg';
  const G = (x, y) => [480 + .63 * x - .53 * y, 140 + .26 * x + .31 * y];
  let seed = 11; const rnd = () => ((seed = seed * 16807 % 2147483647) / 2147483647);
  const at = ([x, y]) => `translate(${x.toFixed(1)} ${y.toFixed(1)})`;

  // A little person; hat='bucket' is Xiaoyun's woven hat.
  function person({shirt = '#4b7bd0', skin = '#f2cfae', hat = '', pose = 'sit', flip = false} = {}) {
    let s = `<g transform="scale(${flip ? -1 : 1} 1)">`;
    s += pose === 'sit'
      ? `<path d="M-3 0h8M-3 0v-3h4" stroke="#3b4256" stroke-width="2.6" stroke-linecap="round" fill="none"/>`
      : `<path d="M-2 0v-7M2 0v-7" stroke="#3b4256" stroke-width="2.4" stroke-linecap="round"/>`;
    s += `<rect x="-4" y="${pose === 'sit' ? -12 : -15}" width="8" height="10" rx="3.5" fill="${shirt}"/>`;
    const hy = pose === 'sit' ? -16 : -19;
    s += `<circle cy="${hy}" r="3.8" fill="${skin}"/>`;
    if (hat === 'bucket') s += `<ellipse cy="${hy - 2.4}" rx="6.4" ry="1.8" fill="#4a4a4a"/><path d="M-3.6 ${hy - 2.4}q0-4.6 3.6-4.6t3.6 4.6z" fill="#8c8c8c"/><path d="M-3 ${hy - 4}h6M-2.6 ${hy - 5.6}h5.2" stroke="#e8e8e8" stroke-width=".7" stroke-dasharray="1 .8"/><path d="M-3.5 ${hy - 2.9}h7" stroke="#2f2f2f" stroke-width=".9"/>`;
    if (hat === 'beanie') s += `<path d="M-3.8 ${hy - 1}q0-4.8 3.8-4.8t3.8 4.8z" fill="#c4553b"/><circle cy="${hy - 6}" r="1.2" fill="#f1d9a8"/>`;
    return s + '</g>';
  }

  // ------------------------------------------------------------------ Circus
  const T = G(98, 787), C = G(170, 800), B = G(30, 781);
  const stripes = (n, f) => Array.from({length: n}, (_, i) => f(i)).join('');
  const arcY = x => -22 + 12 * Math.sqrt(Math.max(0, 1 - (x / 32) ** 2));
  const roof = stripes(8, i => {
    const x1 = -32 + i * 8, x2 = x1 + 8;
    return `<path d="M0 -56L${x1} ${arcY(x1).toFixed(1)}L${x2} ${arcY(x2).toFixed(1)}Z" fill="${i % 2 ? '#fff3e2' : '#d9463b'}"/>`;
  });
  const scallops = stripes(8, i => { const x = -28 + i * 8; return `<circle cx="${x}" cy="${(arcY(x) + 1).toFixed(1)}" r="3.2" fill="#f2c14e"/>`; });
  const confetti = stripes(18, i => {
    const a = rnd() * Math.PI * 2, d = 30 + rnd() * 40;
    return `<rect class="confetti" x="-1.5" y="-1" width="3" height="2" fill="${['#e8483b','#f2c14e','#4b7bd0','#4bb37a','#ef8fb2'][i % 5]}" style="--dx:${(Math.cos(a) * d).toFixed(0)}px;--dy:${(Math.sin(a) * d * .7 - 30).toFixed(0)}px;--r:${(rnd() * 540).toFixed(0)}deg"/>`;
  });
  const balloonColors = ['#e8483b', '#f2c14e', '#4b7bd0', '#ef8fb2'];
  const balloons = balloonColors.map((c, i) => {
    const bx = -9 + i * 6, by = -40 - (i % 2) * 7;
    return `<g class="balloon" style="--d:${(i * .7).toFixed(1)}s"><path d="M${bx} ${by + 6}Q${bx + 2} ${(by - 20) / 2 + 10} 0 -14" stroke="#7a6a58" stroke-width=".6" fill="none"/><ellipse cx="${bx}" cy="${by}" rx="4.2" ry="5.2" fill="${c}"/><ellipse cx="${bx - 1.4}" cy="${by - 1.8}" rx="1.1" ry="1.6" fill="#fff" opacity=".55"/></g>`;
  }).join('');
  const circus = `
  <g class="circus" ${''}>
    <g class="tent" transform="${at(T)} scale(.85)" role="button" aria-label="Circus: play a show">
      <ellipse cy="3" rx="36" ry="12" fill="#5b4a2f" opacity=".16"/>
      <clipPath id="wall"><path d="M-30 0V-22A30 11 0 0 0 30 -22V0A30 11 0 0 1 -30 0Z"/></clipPath>
      <path d="M-30 0V-22A30 11 0 0 0 30 -22V0A30 11 0 0 1 -30 0Z" fill="#fff3e2"/>
      <g clip-path="url(#wall)">${stripes(7, i => `<rect x="${-30 + i * 10}" y="-40" width="5" height="60" fill="#d9463b"/>`)}</g>
      <path d="M-30 0A30 11 0 0 0 30 0" fill="none" stroke="#b8352c" stroke-width="1.4"/>
      <path class="door" d="M-8 10.6L0 -12L8 10.6Z" fill="#3d2133"/>
      <path class="curtain l" d="M-8 10.6L0 -12L0 10.6Z" fill="#c23a32"/><path class="curtain r" d="M0 10.6L0 -12L8 10.6Z" fill="#c23a32"/>
      ${roof}${scallops}
      <path d="M0 -56V-70" stroke="#6b5a48" stroke-width="1.3"/><path class="flag" d="M0 -70L13 -66.5L0 -63Z" fill="#3d73c9"/>
      <g class="acrobat" transform="translate(0 -56)">${person({shirt: '#f2c14e', pose: 'stand'})}</g>
      <g class="burst" transform="translate(0 -56)">${confetti}</g>
    </g>
    <g class="clown" transform="${at(C)}">
      <ellipse cy="1" rx="8" ry="2.6" fill="#5b4a2f" opacity=".15"/>
      ${person({shirt: '#8d5bb0', pose: 'stand'})}
      <path d="M-3 -21l3-7 3 7z" fill="#e8483b"/><circle cy="-19" r="1.1" fill="#e8483b"/>
      <path d="M-4 -12l-4-7M4 -12l4-7" stroke="#8d5bb0" stroke-width="2" stroke-linecap="round"/>
      <circle class="ball b1" r="1.8" fill="#e8483b"/><circle class="ball b2" r="1.8" fill="#f2c14e"/><circle class="ball b3" r="1.8" fill="#4bb37a"/>
    </g>
    <g class="cart" transform="${at(B)}">
      <ellipse cy="2" rx="12" ry="4" fill="#5b4a2f" opacity=".15"/>
      <path d="M-9 0v-9h18v9z" fill="#f4e3c3"/><path d="M-9 -9h18l-2 -3h-14z" fill="#e8483b"/><circle cx="-5" cy="1" r="2" fill="#5b4a3a"/><circle cx="5" cy="1" r="2" fill="#5b4a3a"/>
      <path d="M0 -12V-14" stroke="#7a6a58"/>${balloons}
    </g>
  </g>`;

  // ---------------------------------------------------------------- Campfire
  // The fire pit belongs to the campsite art. Find it in map units and redraw the same
  // flame on top at night, unfiltered, so it glows instead of being darkened with the scene.
  const flameEl = map.querySelector('.camp-flame');
  let F = G(1000, 700), k = .65, flamePaths = '';
  if (flameEl) {
    const ctm = flameEl.parentNode.getScreenCTM();               // the fire pit's own coordinates
    const m = map.getBoundingClientRect(), toMap = 1200 / m.width;
    const pt = new DOMPoint(0, 3).matrixTransform(ctm);
    F = [(pt.x - m.left) * toMap, (pt.y - m.top) * toMap];
    k = ctm.a * toMap;
    flamePaths = flameEl.innerHTML;
  }
  const sparks = stripes(12, i => `<circle class="spark" r="${(0.7 + rnd() * .7).toFixed(1)}" fill="${rnd() < .5 ? '#ffd27a' : '#ff9a4a'}" style="--x:${(rnd() * 16 - 8).toFixed(1)}px;--t:${(1.6 + rnd() * 1.6).toFixed(1)}s;--d:${(-rnd() * 3).toFixed(1)}s"/>`);
  const camp = `
  <g class="campfire" transform="${at(F)}">
    <circle class="fire-glow" r="70" fill="url(#fireGlow)"/>
    <g class="folk" transform="translate(-9 24)">${person({shirt: '#2f5d8a', hat: 'bucket'})}
      <g class="guitar"><ellipse cx="5" cy="-8" rx="3.6" ry="2.8" fill="#c58a4a"/><path d="M7 -9.5l7 -4" stroke="#6b4a2a" stroke-width="1.4"/><circle cx="5" cy="-8" r=".9" fill="#5a3a1a"/></g>
      <text class="note n1" x="-9" y="-25">♪</text><text class="note n2" x="-4" y="-27">♫</text></g>
    <g class="folk" transform="translate(21 0)">${person({shirt: '#c4553b', hat: 'beanie', flip: true})}
      <path d="M-3 -10L-13 -5" stroke="#8a6a44" stroke-width="1"/><circle cx="-13" cy="-5" r="1.6" fill="#fff6e6"/></g>
    <g class="folk" transform="translate(15 19)">${person({shirt: '#4bb37a', flip: true})}</g>
    <g class="flames" transform="scale(${k.toFixed(3)}) translate(0 -3)"><g class="night-flame">${flamePaths}</g></g>
    <g class="sparks" transform="translate(0 -10)">${sparks}</g>
  </g>`;

  // ----------------------------------------------------------------- Fireflies
  const spots = [[60, 420], [110, 470], [140, 390], [90, 380], [40, 470], [620, 690], [690, 700], [720, 680], [600, 705], [730, 40], [96, 150], [920, 505], [960, 480]];
  const flies = spots.map(([x, y]) => { const [px, py] = G(x, y);
    return `<circle class="firefly" cx="${px.toFixed(1)}" cy="${(py - 8 - rnd() * 10).toFixed(1)}" r="1.5" style="--dx:${(rnd() * 24 - 12).toFixed(0)}px;--dy:${(rnd() * 14 - 7).toFixed(0)}px;--t:${(5 + rnd() * 5).toFixed(1)}s;--b:${(1.4 + rnd() * 1.6).toFixed(1)}s"/>`; }).join('');

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 1200 800'); svg.setAttribute('class', 'town-fun'); svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = `<defs><radialGradient id="fireGlow"><stop offset="0" stop-color="#ffb35c" stop-opacity=".55"/><stop offset=".45" stop-color="#ff8a3a" stop-opacity=".16"/><stop offset="1" stop-color="#ff8a3a" stop-opacity="0"/></radialGradient></defs>
    ${circus}${camp}<g class="fireflies">${flies}</g>`;
  map.append(svg);

  // Shooting star in the night sky
  const sky = town.querySelector('.town-sky');
  if (sky) { const s = document.createElement('span'); s.className = 'shooting-star'; sky.append(s); }

  // ------------------------------------------------------------- Interactions
  const tent = svg.querySelector('.tent');
  let showTimer;
  tent.addEventListener('click', e => {
    e.stopPropagation();
    if (svg.classList.contains('show')) return;
    svg.classList.add('show'); clearTimeout(showTimer);
    showTimer = setTimeout(() => svg.classList.remove('show'), 6000);
  });
  svg.querySelectorAll('.balloon').forEach(b => b.addEventListener('click', e => {
    e.stopPropagation();
    if (b.classList.contains('fly')) return;
    b.classList.add('fly'); setTimeout(() => b.classList.remove('fly'), 7000);
  }));
  const campBtn = map.querySelector('.town-building[data-module="miscellaneous"]');
  // The fire flares up while the campsite (or its label) is hovered or focused, and drops as soon as it isn't.
  const flareOn = () => svg.classList.add('flare'), flareOff = () => svg.classList.remove('flare');
  const campLabel = [...map.querySelectorAll('.town-label')].find(l => l.textContent.startsWith('Miscellaneous'));
  for (const el of [campBtn, campLabel].filter(Boolean)) {
    el.addEventListener('mouseenter', flareOn); el.addEventListener('mouseleave', flareOff);
    el.addEventListener('focus', flareOn); el.addEventListener('blur', flareOff);
  }

})();
