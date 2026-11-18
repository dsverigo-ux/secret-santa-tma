/* Иллюстрации для альтернативных тем оформления */
(() => {
  const bulbs = (pts, colors = ["#ecd9a8", "#d23a2f"], r = 1.8, cls = "blink") =>
    pts.map(([x, y], i) => `<circle class="${i % 2 ? cls : ""}" cx="${x}" cy="${y}" r="${r}" fill="${colors[i % colors.length]}"/>`).join("");

  /* ---------- 1. Северное сияние: «фонтанная ёлка» на Ямале ----------
     Фонтанная арматура скважины у газовиков так и называется — «ёлка».  */
  const aurora = `
<svg viewBox="0 0 360 210" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Фонтанная арматура скважины, украшенная как новогодняя ёлка, под северным сиянием">
  <defs>
    <linearGradient id="au1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cf2c9" stop-opacity="0"/><stop offset=".55" stop-color="#7cf2c9" stop-opacity=".75"/><stop offset="1" stop-color="#3fb5ff" stop-opacity="0"/></linearGradient>
    <linearGradient id="au2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ec5ff" stop-opacity="0"/><stop offset=".6" stop-color="#6aa8ff" stop-opacity=".6"/><stop offset="1" stop-color="#b3261e" stop-opacity="0"/></linearGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5"/></filter>
    <radialGradient id="glowStar"><stop offset="0" stop-color="#fff6d8"/><stop offset="1" stop-color="#fff6d8" stop-opacity="0"/></radialGradient>
  </defs>
  <g filter="url(#soft)">
    <path class="au-a" d="M-20 70C40 20 90 90 150 50S260 10 380 60L380 110C260 70 200 120 140 100S30 90-20 130z" fill="url(#au1)"/>
    <path class="au-b" d="M40 40C110 0 170 60 230 30S330 0 390 30L390 70C320 50 270 90 210 70S110 50 40 90z" fill="url(#au2)"/>
  </g>
  <g fill="#fff">${[[30,20],[70,44],[128,18],[200,24],[248,52],[300,16],[338,40],[180,64],[20,80]].map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="${i%3?0.8:1.3}" opacity=".85"/>`).join("")}</g>
  <!-- горизонт: огни промысла -->
  <path d="M0 168q40-10 90-4t110-6 160 4V210H0z" fill="#dce8f2" opacity=".14"/>
  ${bulbs([[214,160],[228,159],[242,158],[290,160],[304,161],[318,160]], ["#ecd9a8"], 1.1)}
  <path d="M262 160v-22M258 138h8" stroke="#dce8f2" stroke-width="1.2" opacity=".5"/>
  <circle cx="262" cy="134" r="2.4" fill="#ff8a5c" class="blink"/>
  <!-- тундра -->
  <path d="M0 180q90-14 180-4t180-2V210H0z" fill="#eef4fa"/>
  <path d="M0 188q120-8 220 0t140-2" stroke="#c9d8e8" stroke-width="1.2" fill="none"/>
  <!-- газопровод от «ёлки» -->
  <path d="M152 94h18v80h190" fill="none" stroke="#ecd9a8" stroke-width="5" stroke-linejoin="round"/>
  <path d="M200 172v10M260 172v10M320 172v10" stroke="#8aa0b8" stroke-width="2"/>
  <!-- фонтанная арматура «ёлка» -->
  <g>
    <rect x="86" y="170" width="48" height="10" rx="1.5" fill="#2a3d72"/>
    <rect x="94" y="160" width="32" height="10" fill="#3b5b8f"/>
    <rect x="103" y="74" width="14" height="88" fill="#f3f4f8"/>
    <rect x="96" y="136" width="28" height="15" rx="2" fill="#b3261e"/>
    <rect x="96" y="112" width="28" height="15" rx="2" fill="#b3261e"/>
    <path d="M96 143.5h-8M124 119.5h8" stroke="#f3f4f8" stroke-width="2"/>
    <circle cx="82" cy="143.5" r="7" fill="none" stroke="#ecd9a8" stroke-width="2.2"/><path d="M75 143.5h14M82 136.5v14" stroke="#ecd9a8" stroke-width="1"/>
    <circle cx="138" cy="119.5" r="7" fill="none" stroke="#ecd9a8" stroke-width="2.2"/><path d="M131 119.5h14M138 112.5v14" stroke="#ecd9a8" stroke-width="1"/>
    <rect x="68" y="88" width="84" height="12" rx="2" fill="#f3f4f8"/>
    <rect x="74" y="85" width="5" height="18" fill="#d8dee8"/><rect x="141" y="85" width="5" height="18" fill="#d8dee8"/>
    <rect x="84" y="86" width="12" height="16" rx="2" fill="#b3261e"/><rect x="124" y="86" width="12" height="16" rx="2" fill="#b3261e"/>
    <path d="M90 86v-6M130 86v-6" stroke="#f3f4f8" stroke-width="1.6"/>
    <circle cx="90" cy="77" r="4.5" fill="none" stroke="#ecd9a8" stroke-width="1.8"/><circle cx="130" cy="77" r="4.5" fill="none" stroke="#ecd9a8" stroke-width="1.8"/>
    <rect x="100" y="66" width="20" height="9" rx="1.5" fill="#ecd9a8"/>
    <!-- манометр -->
    <path d="M60 94h8" stroke="#f3f4f8" stroke-width="2"/>
    <circle cx="55" cy="94" r="7" fill="#f3f4f8" stroke="#2a3d72" stroke-width="1.5"/><path d="M55 94l3-4" stroke="#b3261e" stroke-width="1.4"/>
    <!-- гирлянда -->
    <path d="M70 102q20 14 40 4t40-4M92 128q18 10 36 0M92 152q18 10 36 0" fill="none" stroke="#ecd9a8" stroke-width=".7" opacity=".7"/>
    ${bulbs([[78,106],[94,110],[110,106],[126,103],[142,103],[98,132],[110,134],[122,132],[98,156],[110,158],[122,156]], ["#ecd9a8", "#d23a2f", "#7cf2c9"], 2)}
    <!-- звезда -->
    <circle cx="110" cy="50" r="16" fill="url(#glowStar)" opacity=".7"/>
    <path d="M110 40l3 6.6 7.2.8-5.4 4.9 1.5 7.1-6.3-3.6-6.3 3.6 1.5-7.1-5.4-4.9 7.2-.8z" fill="#d23a2f" stroke="#ecd9a8" stroke-width=".8"/>
  </g>
  <!-- подарки -->
  <rect x="140" y="166" width="16" height="14" fill="#b3261e"/><rect x="147" y="166" width="2.4" height="14" fill="#f3f4f8"/>
  <rect x="60" y="170" width="20" height="12" fill="#2a3d72"/><rect x="69" y="170" width="2.4" height="12" fill="#7cf2c9"/>
</svg>`;

  /* ---------- 2. Советская открытка: ветка, игрушки, часы без минуты полночь ---------- */
  const needles = (() => {
    let s = "";
    for (let t = 0; t <= 1; t += 0.035) {
      const x = 0 + 190 * t, y = 6 + 70 * t - 30 * t * (1 - t) * 2;
      const len = 16 - 8 * t;
      s += `<path d="M${x} ${y}l${-len * .55} ${-len}M${x} ${y}l${len * .9} ${-len * .35}M${x} ${y}l${-len * .3} ${len * .9}M${x} ${y}l${len * .85} ${len * .45}" stroke="${t * 100 % 7 > 3 ? "#24513f" : "#2f6a52"}" stroke-width="1.6" stroke-linecap="round"/>`;
    }
    return s;
  })();
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = i * Math.PI / 6, r1 = 31, r2 = i % 3 ? 27 : 24;
    return `<path d="M${290 + r1 * Math.sin(a)} ${66 - r1 * Math.cos(a)}L${290 + r2 * Math.sin(a)} ${66 - r2 * Math.cos(a)}" stroke="#1f2f5c" stroke-width="${i % 3 ? 1.4 : 2.6}"/>`;
  }).join("");
  const retro = `
<svg viewBox="0 0 360 210" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Новогодняя открытка: еловая ветка с игрушками, часы без минуты полночь, газовый промысел со звездой на факеле">
  <defs>
    <pattern id="ht" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r="1.1" fill="#1f2f5c"/></pattern>
    <linearGradient id="htfade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient>
    <mask id="htm"><rect width="360" height="210" fill="url(#htfade)"/></mask>
  </defs>
  <rect width="360" height="210" fill="url(#ht)" opacity=".16" mask="url(#htm)"/>
  <!-- силуэт промысла -->
  <g fill="#1f2f5c" opacity=".85">
    <path d="M186 170l12-74 12 74z" fill="none" stroke="#1f2f5c" stroke-width="2.4"/>
    <path d="M190 150h16M193 130h10M195 112h6M190 150l13-20M206 150l-13-20" stroke="#1f2f5c" stroke-width="1.2"/>
    <circle cx="250" cy="152" r="20"/><circle cx="292" cy="158" r="14"/>
    <rect x="226" y="166" width="90" height="6"/>
    <rect x="140" y="126" width="12" height="46" rx="6"/><rect x="156" y="140" width="9" height="32" rx="4.5"/>
  </g>
  <!-- красная звезда на факеле -->
  <path d="M198 72l4.2 9 9.8 1.1-7.3 6.7 2 9.7-8.7-4.9-8.7 4.9 2-9.7-7.3-6.7 9.8-1.1z" fill="#b3261e"/>
  <path d="M198 72l4.2 9 9.8 1.1-7.3 6.7 2 9.7-8.7-4.9-8.7 4.9 2-9.7-7.3-6.7 9.8-1.1z" fill="none" stroke="#1f2f5c" stroke-width="1" transform="translate(1.5 1)" opacity=".5"/>
  <!-- сугробы -->
  <path d="M0 176q50-14 110-4t120-2 130 6V210H0z" fill="#fbf6e8" stroke="#1f2f5c" stroke-width="1.6"/>
  <!-- часы -->
  <circle cx="293" cy="69" r="36" fill="#1f2f5c"/>
  <circle cx="290" cy="66" r="35" fill="#fbf6e8" stroke="#1f2f5c" stroke-width="2.4"/>
  ${ticks}
  <path d="M290 66L289 44" stroke="#1f2f5c" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M290 66L287.6 37" stroke="#b3261e" stroke-width="1.8" stroke-linecap="round"/>
  <circle cx="290" cy="66" r="3" fill="#b3261e"/>
  <!-- еловая ветка -->
  <path d="M-4 4C60 10 120 40 196 76" fill="none" stroke="#5b3a22" stroke-width="2.4"/>
  ${needles}
  <!-- игрушки -->
  <path d="M70 26v34M128 46v40M168 64v22" stroke="#1f2f5c" stroke-width=".9"/>
  <g>
    <rect x="65" y="56" width="10" height="6" fill="#c89b3c"/>
    <circle cx="70" cy="76" r="15" fill="#c89b3c"/>
    <path d="M56 72h28M55.5 80h29" stroke="#fbf6e8" stroke-width="2.4"/>
    <circle cx="65" cy="70" r="3" fill="#fbf6e8" opacity=".8"/>
  </g>
  <g>
    <rect x="122" y="82" width="12" height="7" fill="#c89b3c"/>
    <circle cx="128" cy="108" r="21" fill="#b3261e"/>
    <path d="M128 97l3 6.4 7 .8-5.2 4.8 1.4 6.9-6.2-3.5-6.2 3.5 1.4-6.9-5.2-4.8 7-.8z" fill="#fbf6e8"/>
    <path d="M114 100a16 16 0 0 1 9-8" stroke="#fbf6e8" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".8"/>
  </g>
  <g>
    <path d="M163 86h10l-5 34z" fill="#1f2f5c"/>
    <path d="M165.5 92h5" stroke="#fbf6e8" stroke-width="1.4"/>
  </g>
  <!-- снежинки -->
  <g stroke="#1f2f5c" stroke-width="1.4" stroke-linecap="round" opacity=".75">
    <path d="M30 120v14M23 127h14M25 122l10 10M35 122l-10 10"/>
    <path d="M232 26v10M227 31h10M228.5 27.5l7 7M235.5 27.5l-7 7"/>
    <path d="M340 128v10M335 133h10"/>
  </g>
  <g stroke="#b3261e" stroke-width="1.4" stroke-linecap="round"><path d="M96 150v10M91 155h10M92.5 151.5l7 7M99.5 151.5l-7 7"/></g>
</svg>`;

  /* ---------- 3. Огни промысла: неоновая вывеска и контурный промысел ---------- */
  const neon = `
<svg viewBox="0 0 360 210" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Неоновая вывеска «С Новым годом!» над контурной иллюстрацией газового промысла">
  <defs>
    <filter id="ng" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="2.4" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="bokeh"><feGaussianBlur stdDeviation="6"/></filter>
  </defs>
  <g filter="url(#bokeh)" opacity=".55">
    <circle cx="40" cy="40" r="14" fill="#ffb35c"/><circle cx="320" cy="30" r="18" fill="#ff4d42"/>
    <circle cx="250" cy="90" r="10" fill="#ffd28a"/><circle cx="90" cy="120" r="9" fill="#ff4d42"/>
    <circle cx="190" cy="20" r="8" fill="#ffd28a"/>
  </g>
  <text class="neon-flicker" x="180" y="56" text-anchor="middle" font-family="Marck Script, cursive" font-size="40" fill="#ffe7e4" stroke="#ff4d42" stroke-width=".6" filter="url(#ng)">С Новым годом!</text>
  <path d="M96 66h168" stroke="#ff4d42" stroke-width="1.2" filter="url(#ng)" opacity=".8"/>
  <g fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#ng)">
    <!-- факел-ёлка -->
    <path d="M70 196L96 90l26 106M78 164h36M84 138h24M89 114h14M78 164l30-26M114 164l-30-26M84 138l19-24M108 138l-19-24" stroke="#ffe2b8" stroke-width="1.4"/>
    <path class="flame" d="M96 66c7 8 9 13 6 19-1.5 3-4 4.5-6 4.5s-4.5-1.5-6-4.5c-2.5-5 0-10 6-19z" stroke="#ff4d42" stroke-width="1.8" style="transform-origin:96px 88px"/>
    <!-- колонны -->
    <rect x="140" y="110" width="16" height="86" rx="8" stroke="#ffe2b8" stroke-width="1.3"/>
    <rect x="162" y="132" width="11" height="64" rx="5.5" stroke="#ffe2b8" stroke-width="1.3"/>
    <!-- газгольдеры -->
    <circle cx="232" cy="156" r="25" stroke="#ff4d42" stroke-width="1.6"/>
    <circle cx="290" cy="164" r="18" stroke="#ffd28a" stroke-width="1.4"/>
    <path d="M216 176v20M248 176v20M278 178v18M302 178v18" stroke="#ffe2b8" stroke-width="1.2"/>
    <!-- газопровод -->
    <path d="M0 200h360" stroke="#ffd28a" stroke-width="1.6"/>
  </g>
  ${bulbs([[78,180],[88,170],[100,160],[110,150],[86,148],[98,130],[92,122],[100,110],[140,118],[156,126],[166,140],[212,140],[252,140],[276,150],[304,152]], ["#ffd28a", "#ff4d42", "#fff3e0"], 1.7)}
</svg>`;


  /* ---------- 4. Ёлочный бархат: объёмные игрушки на зелёном бархате ---------- */
  const G = (id, stops, fx = .35, fy = .3) => `<radialGradient id="${id}" fx="${fx}" fy="${fy}" r=".75">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("")}</radialGradient>`;
  const defsV = (p) => `
    ${G(p + "red", [[0, "#ff8a7c"], [.45, "#d23a2f"], [1, "#6e110c"]])}
    ${G(p + "gold", [[0, "#fff4c4"], [.5, "#e2b54a"], [1, "#8a5c0e"]])}
    ${G(p + "navy", [[0, "#9db4ef"], [.45, "#2f4a8f"], [1, "#0e1834"]])}
    ${G(p + "berry", [[0, "#ffb3a8"], [.4, "#e0362a"], [1, "#7a0f09"]], .3, .25)}
    <linearGradient id="${p}leaf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6fd17f"/><stop offset="1" stop-color="#1d6a33"/></linearGradient>
    <linearGradient id="${p}boxF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2463a"/><stop offset="1" stop-color="#a51f17"/></linearGradient>
    <linearGradient id="${p}boxS" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9a1c15"/><stop offset="1" stop-color="#6e110c"/></linearGradient>
    <linearGradient id="${p}boxT" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff7366"/><stop offset="1" stop-color="#e2463a"/></linearGradient>
    <filter id="${p}sh" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="8" stdDeviation="7" flood-color="#04140a" flood-opacity=".55"/></filter>
    <filter id="${p}blur"><feGaussianBlur stdDeviation="2.2"/></filter>`;
  const spark = (x, y, r, blur, p) => `<g ${blur ? `filter="url(#${p}blur)"` : ""} stroke="#fff" stroke-width="${blur ? 2.2 : 1.3}" stroke-linecap="round" opacity="${blur ? .55 : .9}"><path d="M${x} ${y - r}v${2 * r}M${x - r} ${y}h${2 * r}M${x - r * .7} ${y - r * .7}l${r * 1.4} ${r * 1.4}M${x + r * .7} ${y - r * .7}l${-r * 1.4} ${r * 1.4}"/></g>`;

  const giftBox = (x, y, w, p) => {
    const h = w * .82, d = w * .32;
    const dots = [[.2, .25], [.55, .18], [.82, .4], [.3, .62], [.68, .7], [.12, .85], [.5, .9]]
      .map(([a, b]) => `<circle cx="${x + a * w}" cy="${y + b * h}" r="${w * .045}" fill="#fff" opacity=".9"/>`).join("");
    return `<g filter="url(#${p}sh)">
      <path d="M${x} ${y}h${w}v${h}h${-w}z" fill="url(#${p}boxF)"/>
      <path d="M${x + w} ${y}l${d} ${-d * .7}v${h}l${-d} ${d * .7}z" fill="url(#${p}boxS)"/>
      <path d="M${x} ${y}l${d} ${-d * .7}h${w}l${-d} ${d * .7}z" fill="url(#${p}boxT)"/>
      ${dots}
      <path d="M${x + w * .44} ${y}h${w * .14}v${h}h${-w * .14}z" fill="#f6f6f2"/>
      <path d="M${x + w} ${y + h * .42}l${d} ${-d * .7}v${w * .12}l${-d} ${d * .7}z" fill="#d9d9d2"/>
      <path d="M${x + w * .44} ${y}l${d} ${-d * .7}h${w * .14}l${-d} ${d * .7}z" fill="#ffffff"/>
      <path d="M${x + w * .51 + d * .5} ${y - d * .35}c${-w * .3} ${-w * .32} ${-w * .42} ${-w * .02} ${-w * .02} 0z" fill="#fff" stroke="#e8e8e0" stroke-width="1"/>
      <path d="M${x + w * .51 + d * .5} ${y - d * .35}c${w * .3} ${-w * .32} ${w * .42} ${-w * .02} ${w * .02} 0z" fill="#fff" stroke="#e8e8e0" stroke-width="1"/>
    </g>`;
  };
  const star = (cx, cy, r, p) => {
    const pts = Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .5 : r; return `${cx + rr * Math.cos(a)} ${cy + rr * Math.sin(a)}`; }).join("L");
    return `<g filter="url(#${p}sh)"><path d="M${pts}z" fill="#9a6a12" transform="translate(2 3)"/><path d="M${pts}z" fill="url(#${p}gold)" stroke="#fff3c0" stroke-width="1" stroke-linejoin="round"/></g>`;
  };
  const gasBall = (cx, cy, r, p) => `<g filter="url(#${p}sh)">
      <path d="M${cx - r * .62} ${cy + r * .55}V${cy + r * 1.45}M${cx + r * .62} ${cy + r * .55}V${cy + r * 1.45}M${cx - r * .2} ${cy + r * .9}V${cy + r * 1.45}M${cx + r * .2} ${cy + r * .9}V${cy + r * 1.45}M${cx - r * .62} ${cy + r * 1.15}H${cx + r * .62}" stroke="#e2b54a" stroke-width="${r * .11}" stroke-linecap="round"/>
      <rect x="${cx - r * .85}" y="${cy + r * 1.42}" width="${r * 1.7}" height="${r * .16}" rx="${r * .08}" fill="#9a6a12"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${p}navy)"/>
      <path d="M${cx - r} ${cy + r * .05}a${r} ${r * .28} 0 0 0 ${2 * r} 0" fill="none" stroke="#d23a2f" stroke-width="${r * .16}"/>
      <ellipse cx="${cx - r * .35}" cy="${cy - r * .42}" rx="${r * .28}" ry="${r * .16}" fill="#fff" opacity=".55" transform="rotate(-30 ${cx - r * .35} ${cy - r * .42})"/>
      <path d="M${cx} ${cy - r}v${-r * .25}" stroke="#e2b54a" stroke-width="${r * .14}"/>
    </g>`;
  const ornament = (cx, cy, r, p) => `<g filter="url(#${p}sh)">
      <defs><clipPath id="${p}clip${cx}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath></defs>
      <rect x="${cx - r * .28}" y="${cy - r * 1.18}" width="${r * .56}" height="${r * .3}" rx="${r * .06}" fill="url(#${p}gold)"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${p}red)"/>
      <g clip-path="url(#${p}clip${cx})" stroke="#fff" stroke-width="${r * .22}" fill="none" opacity=".92">
        <path d="M${cx - r * 1.2} ${cy - r * .55}q${r * 1.2} ${r * .7} ${r * 2.4} ${-r * .1}"/>
        <path d="M${cx - r * 1.2} ${cy + r * .25}q${r * 1.2} ${r * .7} ${r * 2.4} ${-r * .1}"/>
      </g>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${p}red)" opacity=".35"/>
      <ellipse cx="${cx - r * .38}" cy="${cy - r * .4}" rx="${r * .24}" ry="${r * .14}" fill="#fff" opacity=".7" transform="rotate(-35 ${cx - r * .38} ${cy - r * .4})"/>
    </g>`;

  const velvet = `
<svg viewBox="0 0 360 210" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Объёмные ёлочные игрушки: полосатый шар на ветке остролиста, подарок в горошек, золотая звезда и шар-газгольдер">
  <defs>${defsV("v")}</defs>
  ${spark(30, 40, 9, true, "v")}${spark(330, 30, 6, false, "v")}${spark(200, 26, 5, false, "v")}${spark(150, 180, 10, true, "v")}${spark(345, 150, 5, false, "v")}${spark(20, 170, 5, false, "v")}
  <!-- остролист -->
  <g filter="url(#vsh)">
    <path d="M60 18c-18-4-34 6-44 22 8-2 12 2 14 8 6-6 12-4 16 2 4-8 10-8 14-6 0-10 0-18 0-26z" fill="url(#vleaf)"/>
    <path d="M78 16c18-6 36 2 48 18-8-1-12 3-13 9-7-5-13-3-16 3-5-8-11-7-15-5-1-10-2-17-4-25z" fill="url(#vleaf)"/>
    <circle cx="66" cy="20" r="9" fill="url(#vberry)"/><circle cx="80" cy="14" r="8" fill="url(#vberry)"/><circle cx="76" cy="28" r="8.5" fill="url(#vberry)"/>
  </g>
  <path d="M74 34v38" stroke="#e2b54a" stroke-width="1.2"/>
  ${ornament(74, 110, 34, "v")}
  ${star(186, 62, 26, "v")}
  ${gasBall(168, 158, 22, "v")}
  ${giftBox(232, 104, 74, "v")}
</svg>`;

  const mini = {
    coin: `<svg viewBox="0 0 56 56" aria-hidden="true"><defs>${defsV("mc")}</defs>${star(28, 28, 20, "mc")}</svg>`,
    ball: `<svg viewBox="0 0 56 56" aria-hidden="true"><defs>${defsV("mb")}</defs>${ornament(28, 32, 18, "mb")}</svg>`,
    gift: `<svg viewBox="0 0 56 56" aria-hidden="true"><defs>${defsV("mg")}</defs>${giftBox(8, 22, 30, "mg")}</svg>`,
    sphere: `<svg viewBox="0 0 56 56" aria-hidden="true"><defs>${defsV("ms")}</defs>${gasBall(28, 24, 16, "ms")}</svg>`
  };


  /* ---------- 5. Минимал: хромированная снежинка ---------- */
  const minimal = (() => {
    const arm = `M0 0V-150M0 -52l-34 -34M0 -52l34 -34M0 -100l-26 -26M0 -100l26 -26M-34 -86l-8 -22M34 -86l8 -22`;
    const arms = w => Array.from({ length: 6 }, (_, i) => `<path d="${arm}" transform="rotate(${i * 60})" stroke-width="${w}"/>`).join("");
    return `
<svg viewBox="0 0 360 230" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Объёмная хромированная снежинка и хромированный шар-газгольдер">
  <defs>
    <linearGradient id="chr" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fbfbfb"/><stop offset=".22" stop-color="#9c9c9c"/><stop offset=".42" stop-color="#f4f4f4"/>
      <stop offset=".58" stop-color="#6f6f6f"/><stop offset=".78" stop-color="#e9e9e9"/><stop offset="1" stop-color="#8a8a8a"/>
    </linearGradient>
    <radialGradient id="chrBall" fx=".32" fy=".28" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset=".35" stop-color="#bdbdbd"/><stop offset=".7" stop-color="#5e5e5e"/><stop offset="1" stop-color="#cfcfcf"/></radialGradient>
    <filter id="mshadow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter>
  </defs>
  <g transform="translate(250 128) rotate(12)" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <g stroke="#000" opacity=".22" filter="url(#mshadow)" transform="translate(8 12)">${arms(20)}</g>
    <g stroke="#5a5a5a">${arms(21)}</g>
    <g stroke="url(#chr)">${arms(17)}</g>
    <g stroke="#ffffff" opacity=".75" transform="translate(-2 -2)">${arms(3.5)}</g>
    <circle r="16" fill="url(#chrBall)" stroke="#5a5a5a" stroke-width="2"/>
  </g>
  <g transform="translate(64 168)">
    <path d="M0 -42v-14" stroke="#7a7a7a" stroke-width="1"/>
    <rect x="-6" y="-46" width="12" height="7" rx="1.5" fill="url(#chr)"/>
    <ellipse cx="4" cy="10" rx="30" ry="6" fill="#000" opacity=".12" filter="url(#mshadow)"/>
    <circle r="30" fill="url(#chrBall)"/>
    <path d="M-30 2a30 9 0 0 0 60 0" fill="none" stroke="#c8352b" stroke-width="3.5"/>
    <ellipse cx="-11" cy="-13" rx="8" ry="4.5" fill="#fff" opacity=".85" transform="rotate(-35 -11 -13)"/>
  </g>
</svg>`;
  })();

  /* ---------- 6. Уютный: кот-прораб «один на объекте» ---------- */
  const cozy = `
<svg viewBox="0 0 360 230" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Рыжий кот в строительной каске и новогоднем свитере с кружкой какао среди подарков">
  <defs>
    <pattern id="knit" width="12" height="10" patternUnits="userSpaceOnUse">
      <path d="M0 2l6 6 6-6" fill="none" stroke="#fff4e6" stroke-width="2.2" stroke-linejoin="round"/>
    </pattern>
    <radialGradient id="glow" r=".6"><stop offset="0" stop-color="#ffe7b8" stop-opacity=".55"/><stop offset="1" stop-color="#ffe7b8" stop-opacity="0"/></radialGradient>
  </defs>
  <!-- лучи и окно -->
  <g stroke="#fff" stroke-width="1" opacity=".16">${Array.from({ length: 18 }, (_, i) => { const a = i * Math.PI / 9; return `<path d="M180 120L${180 + 300 * Math.cos(a)} ${120 + 300 * Math.sin(a)}"/>`; }).join("")}</g>
  <circle cx="180" cy="120" r="120" fill="url(#glow)"/>
  <!-- гирлянда с игрушкой-газгольдером -->
  <path d="M0 16q45 26 90 6t90 4 90-4 90 6" fill="none" stroke="#2b3a6b" stroke-width="1.2" opacity=".6"/>
  ${bulbs([[18,24],[45,31],[72,27],[108,22],[140,26],[200,27],[232,23],[262,26],[300,25],[334,22]], ["#ffd36b", "#f6a8a0", "#fff4e6"], 3, "blink")}
  <path d="M290 26v14" stroke="#2b3a6b" stroke-width="1"/>
  <circle cx="290" cy="50" r="10" fill="#2b3a6b"/><path d="M280 51a10 3 0 0 0 20 0" fill="none" stroke="#c8352b" stroke-width="2.4"/>
  <path d="M283 59l-2 6M297 59l2 6" stroke="#ffd36b" stroke-width="1.6" stroke-linecap="round"/>
  <ellipse cx="286" cy="46" rx="3" ry="1.8" fill="#fff" opacity=".6"/>
  <!-- пол -->
  <path d="M0 206h360v24H0z" fill="#3a4f9a"/>
  <path d="M0 206h360" stroke="#fff" stroke-width="1" opacity=".25"/>
  <!-- подарки -->
  <g>
    <rect x="34" y="166" width="46" height="40" rx="3" fill="#f6a8a0"/><rect x="53" y="166" width="8" height="40" fill="#fff4e6"/>
    <rect x="30" y="158" width="54" height="11" rx="2" fill="#f7b8b0"/><path d="M57 158c-10-14-22-6-12 0zM57 158c10-14 22-6 12 0z" fill="#fff4e6"/>
    <rect x="86" y="182" width="30" height="24" rx="2" fill="#ffd36b"/><rect x="98" y="182" width="5" height="24" fill="#c8352b"/>
    <rect x="262" y="174" width="40" height="32" rx="3" fill="#fff4e6"/><rect x="262" y="186" width="40" height="6" fill="#c8352b"/><rect x="279" y="174" width="6" height="32" fill="#c8352b"/>
    <rect x="306" y="186" width="26" height="20" rx="2" fill="#c8352b"/><rect x="317" y="186" width="4" height="20" fill="#fff4e6"/>
  </g>
  <!-- хвост -->
  <path d="M222 196c40 4 52-22 40-40-6-9-18-6-16 4" fill="none" stroke="#e8994f" stroke-width="15" stroke-linecap="round"/>
  <path d="M250 196l6-8M259 180l9-3M257 162l9 2" stroke="#c9742f" stroke-width="4" stroke-linecap="round"/>
  <!-- туловище в свитере -->
  <path d="M130 206c-4-46 16-78 50-78s54 32 50 78z" fill="#c8352b"/>
  <rect x="134" y="152" width="92" height="12" fill="url(#knit)"/>
  <path d="M134 176h92" stroke="#fff4e6" stroke-width="1.4" stroke-dasharray="3 5" opacity=".8"/>
  <path d="M150 132c10 10 50 10 60 0" fill="none" stroke="#a82a21" stroke-width="7" stroke-linecap="round"/>
  <!-- кружка с какао -->
  <g>
    <path d="M172 150c-4-8 2-14 0-20M186 150c-4-8 2-14 0-20" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".75"/>
    <rect x="164" y="154" width="32" height="34" rx="5" fill="#fff4e6"/>
    <path d="M196 162c10 0 10 16 0 16" fill="none" stroke="#fff4e6" stroke-width="4"/>
    <rect x="164" y="166" width="32" height="6" fill="#2b3a6b"/>
    <ellipse cx="180" cy="156" rx="14" ry="3" fill="#7a4a2b"/>
  </g>
  <!-- лапы -->
  <ellipse cx="160" cy="172" rx="10" ry="8" fill="#e8994f"/><ellipse cx="200" cy="172" rx="10" ry="8" fill="#e8994f"/>
  <path d="M156 176v-4M161 177v-4M196 177v-4M201 176v-4" stroke="#c9742f" stroke-width="1.4" stroke-linecap="round"/>
  <!-- голова -->
  <path d="M136 92l-8-30 30 16zM224 92l8-30-30 16z" fill="#e8994f"/>
  <path d="M138 86l-4-16 14 8zM222 86l4-16-14 8z" fill="#f6a8a0"/>
  <ellipse cx="180" cy="102" rx="48" ry="38" fill="#e8994f"/>
  <path d="M172 70l2 10M180 68v11M188 70l-2 10" stroke="#c9742f" stroke-width="3" stroke-linecap="round"/>
  <path d="M134 104h12M134 112l12-3M226 104h-12M226 112l-12-3" stroke="#c9742f" stroke-width="3" stroke-linecap="round"/>
  <ellipse cx="180" cy="116" rx="18" ry="12" fill="#fff4e6"/>
  <!-- каска -->
  <path d="M140 78c0-26 18-40 40-40s40 14 40 40z" fill="#ffd36b"/>
  <path d="M180 38v40M162 42c-4 10-4 26-4 36M198 42c4 10 4 26 4 36" stroke="#e8b43a" stroke-width="3" fill="none"/>
  <rect x="132" y="76" width="96" height="9" rx="4.5" fill="#f2c230"/>
  <circle cx="200" cy="60" r="6" fill="#c8352b"/><path d="M198 57v6M198 57h2.5a1.6 1.6 0 0 1 0 3.2H198" stroke="#fff" stroke-width="1.3" fill="none"/>
  <!-- мордочка -->
  <path d="M158 102q6-7 12 0M190 102q6-7 12 0" fill="none" stroke="#2b2b2b" stroke-width="3" stroke-linecap="round"/>
  <ellipse cx="152" cy="114" rx="7" ry="4" fill="#f6a8a0" opacity=".8"/><ellipse cx="208" cy="114" rx="7" ry="4" fill="#f6a8a0" opacity=".8"/>
  <path d="M176 111h8l-4 5z" fill="#e0707a"/>
  <path d="M180 116q-4 6-9 3M180 116q4 6 9 3" fill="none" stroke="#2b2b2b" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M168 116l-24-4M168 120l-24 2M192 116l24-4M192 120l24 2" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".9"/>
  <!-- подпись -->
  <text x="20" y="74" font-family="Marck Script, cursive" font-size="26" fill="#fff4e6">один</text>
  <text x="20" y="100" font-family="Marck Script, cursive" font-size="26" fill="#fff4e6">на объекте</text>
  <path d="M248 74l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="#fff4e6" opacity=".9"/>
  <path d="M320 104l2 4 4 .5-3 3 .8 4-3.8-2-3.8 2 .8-4-3-3 4-.5z" fill="#fff4e6" opacity=".7"/>
</svg>`;


  /* ---------- 9. Кристалл: стеклянная снежинка с глубиной резкости ---------- */
  const crystal = (() => {
    const prism = (len, w, tip) => `M0 ${-w}L${len} ${-w * .7}L${len + tip} 0L${len} ${w * .7}L0 ${w}Z`;
    const half  = (len, w, tip) => `M0 0L${len + tip} 0L${len} ${w * .7}L0 ${w}Z`;
    const branch = (x, len, w, ang) => `
      <g transform="translate(${x} 0) rotate(${ang})">
        <path d="${prism(len, w, w * 2.2)}" fill="url(#ice)" stroke="#fff" stroke-opacity=".85" stroke-width=".9"/>
        <path d="${half(len, w, w * 2.2)}" fill="#7fb6d3" opacity=".28"/>
        <path d="M2 0H${len + w}" stroke="#fff" stroke-width=".8" opacity=".95"/>
      </g>`;
    const arm = () => `
      <path d="${prism(150, 7, 18)}" fill="url(#ice)" stroke="#fff" stroke-opacity=".9" stroke-width="1"/>
      <path d="${half(150, 7, 18)}" fill="#6aa6c8" opacity=".3"/>
      <path d="M4 0H160" stroke="#fff" stroke-width="1.1"/>
      ${branch(46, 56, 5, -58)}${branch(46, 56, 5, 58)}
      ${branch(88, 44, 4.4, -58)}${branch(88, 44, 4.4, 58)}
      ${branch(124, 28, 3.6, -58)}${branch(124, 28, 3.6, 58)}
      <path d="M150 -10l12 10-12 10-12-10z" fill="url(#ice)" stroke="#fff" stroke-width=".8"/>`;
    const flake = Array.from({ length: 6 }, (_, i) => `<g transform="rotate(${i * 60})">${arm()}</g>`).join("");
    return `
<svg viewBox="0 0 360 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Большая стеклянная снежинка с переливом">
  <defs>
    <linearGradient id="ice" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity=".25"/>
      <stop offset=".42" stop-color="#ffffff" stop-opacity=".95"/>
      <stop offset=".5" stop-color="#e3f8ff" stop-opacity="1"/>
      <stop offset=".6" stop-color="#ffffff" stop-opacity=".8"/>
      <stop offset="1" stop-color="#b9e6f4" stop-opacity=".25"/>
    </linearGradient>
    <radialGradient id="core"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#cdeef8" stop-opacity=".2"/></radialGradient>
    <filter id="dof" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7"/></filter>
    <filter id="dof2" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.2"/></filter>
    <filter id="glowC" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="10"/></filter>
  </defs>
  <!-- далёкая размытая снежинка -->
  <g transform="translate(70 70) scale(.32) rotate(18)" filter="url(#dof)" opacity=".55">${flake}</g>
  <!-- свечение -->
  <g transform="translate(292 186) rotate(-8)" filter="url(#glowC)" opacity=".55">${flake}</g>
  <!-- главная снежинка: ближний край слегка размыт -->
  <g transform="translate(292 186) rotate(-8)">
    <g filter="url(#dof2)" opacity=".9">${flake}</g>
    ${flake}
    <path d="M0 -22l19 11v22L0 22l-19-11v-22z" fill="url(#core)" stroke="#fff" stroke-width="1.2"/>
    <path d="M0 -12l10 6v12L0 12l-10-6v-12z" fill="none" stroke="#fff" stroke-width=".8" opacity=".8"/>
  </g>
</svg>`;
  })();

  window.ART.heroes = { retro, neon, velvet, minimal, cozy, crystal }; // в «Северном сиянии» — основная иллюстрация
  window.ART.heroAurora = aurora;
  window.ART.mini = mini;
})();
