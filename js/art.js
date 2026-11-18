/* Иконки и иллюстрации (оригинальные SVG) */
window.ART = (() => {
  const P = {
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2 .6 3.5 2.6 3.5 6"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    wallet: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M16 15h2"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
    send: '<path d="M4 12l16-8-6 16-3-7z"/>',
    bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4zM10 21h4"/>',
    ban: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r=".8"/><circle cx="4.5" cy="12" r=".8"/><circle cx="4.5" cy="18" r=".8"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
    chev: '<path d="M9 6l6 6-6 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    crown: '<path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z"/>',
    secret: '<path d="M3 3l18 18M10.6 6.1A9.8 9.8 0 0 1 12 6c5 0 9 6 9 6a17 17 0 0 1-3 3.5M6.6 6.6C4.2 8.2 3 12 3 12s4 6 9 6a8.6 8.6 0 0 0 4.4-1.2"/>',
    box: '<path d="M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10"/>',
    bag: '<path d="M5 8h14l-1 13H6zM9 8V6a3 3 0 0 1 6 0v2"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5h.01"/>',
    shuffle: '<path d="M3 7h4l10 10h4M3 17h4l3-3M14 10l3-3h4M18 4l3 3-3 3M18 14l3 3-3 3"/>',
    bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.6.6 1 1.4 1 2.5h6c0-1.1.4-1.9 1-2.5A6 6 0 0 0 12 3z"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'
  };
  const icon = (name, cls = "") => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[name] || ""}</svg>`;

  /* Окна домов: часть «мигает» гирляндой */
  const windows = (x0, y0, cols, rows, dx = 9, dy = 11) => {
    let s = "";
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const lit = (r * 7 + c * 3 + x0) % 5 !== 0;
      if (lit) s += `<rect class="${(r + c) % 4 === 0 ? "blink" : ""}" x="${x0 + c * dx}" y="${y0 + r * dy}" width="4" height="5" fill="#ecd9a8" opacity="${(r + c) % 3 ? .9 : .55}"/>`;
    }
    return s;
  };

  /* Главная иллюстрация: газовый промысел в новогоднюю ночь.
     Факельная башня — ёлка, пламя — звезда, по эстакаде — гирлянда. */
  const bulbs = (pts, cls = "blink") => pts.map(([x, y], i) =>
    `<circle class="${i % 2 ? cls : ""}" cx="${x}" cy="${y}" r="1.8" fill="${i % 3 === 0 ? "#d23a2f" : "#ecd9a8"}"/>`).join("");

  const tree = (() => {
    // решётчатая башня-ёлка: силуэт треугольника + раскосы
    let s = `<path d="M84 52L56 196M84 52l28 144" stroke="#f3f4f8" stroke-width="1.6"/>`;
    for (let y = 70; y < 196; y += 18) {
      const k = (y - 52) / 144, half = 28 * k, k2 = Math.min(1, (y + 18 - 52) / 144), h2 = 28 * k2;
      s += `<path d="M${84 - half} ${y}h${half * 2}M${84 - half} ${y}L${84 + h2} ${Math.min(y + 18, 196)}M${84 + half} ${y}L${84 - h2} ${Math.min(y + 18, 196)}" stroke="#f3f4f8" stroke-width=".8" opacity=".55"/>`;
    }
    // гирлянда по спирали
    const pts = [];
    for (let i = 0; i < 14; i++) { const y = 66 + i * 9.5, k = (y - 52) / 144, side = i % 2 ? 1 : -1; pts.push([84 + side * 26 * k * .8, y]); }
    s += `<path d="M${pts.map(p => p.join(" ")).join("L")}" fill="none" stroke="#ecd9a8" stroke-width=".7" opacity=".6"/>` + bulbs(pts);
    return s;
  })();

  const hero = `
<svg viewBox="0 0 360 210" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Газовый промысел в новогоднюю ночь: факельная башня-ёлка, газгольдеры и газопровод с гирляндой">
  <mask id="moonCutH"><rect width="360" height="210" fill="#fff"/><circle cx="324" cy="31" r="12" fill="#000"/></mask><circle cx="318" cy="36" r="14" fill="#ecd9a8" mask="url(#moonCutH)"/>
  <g stroke="#fff" stroke-width="1.1" stroke-linecap="round" opacity=".85">
    <path d="M160 22v6M157 25h6M158 23l4 4M162 23l-4 4"/><path d="M262 66v5M259.5 68.5h5"/>
    <path d="M24 34v5M21.5 36.5h5"/><path d="M206 44v4M204 46h4"/>
  </g>
  <!-- дальний лес -->
  <path d="M0 180l10-16 10 16 8-12 9 12 10-18 10 18H0zM300 182l9-14 9 14 8-11 8 11 10-16 10 16h6v2H300z" fill="#18264f"/>
  <!-- ректификационные колонны -->
  <g>
    <rect x="138" y="88" width="16" height="110" rx="8" fill="#22336a"/>
    <rect x="160" y="112" width="12" height="86" rx="6" fill="#1b2a5a"/>
    <path d="M134 110h24M134 132h24M134 154h24M134 176h24M157 128h18M157 150h18M157 172h18" stroke="#3b5b8f" stroke-width="1.4"/>
    ${bulbs([[146, 98], [146, 121], [146, 143], [166, 140], [166, 162], [146, 165]])}
  </g>
  <!-- шаровые газгольдеры -->
  <g>
    <path d="M222 168v26M262 168v26M236 172v22M248 172v22M284 172v22M314 172v22M296 176v18" stroke="#3b5b8f" stroke-width="2"/>
    <circle cx="242" cy="150" r="27" fill="#2a3d72"/>
    <path d="M222 140a24 24 0 0 1 22-15" stroke="#f3f4f8" stroke-width="2" fill="none" opacity=".35" stroke-linecap="round"/>
    <path d="M215 152h54" stroke="#b3261e" stroke-width="3"/>
    <circle cx="299" cy="160" r="20" fill="#24376b"/>
    <path d="M285 152a18 18 0 0 1 15-11" stroke="#f3f4f8" stroke-width="1.6" fill="none" opacity=".35" stroke-linecap="round"/>
    <path d="M279 162h40" stroke="#b3261e" stroke-width="2.5"/>
    <path d="M242 123v-8l6 4" stroke="#ecd9a8" stroke-width="1.2" fill="#d23a2f"/>
  </g>
  <!-- факельная башня-ёлка -->
  ${tree}
  <g class="flame">
    <path d="M84 30c7 8 9 13 6 19-1.5 3-4 4.5-6 4.5s-4.5-1.5-6-4.5c-2.5-5 0-10 6-19z" fill="#d23a2f"/>
    <path d="M84 39c3.5 4 4.5 7 3 10-.8 1.5-2 2.3-3 2.3s-2.2-.8-3-2.3c-1.2-2.6 0-5.5 3-10z" fill="#ecd9a8"/>
  </g>
  <path d="M80 52h8" stroke="#f3f4f8" stroke-width="2"/>
  <!-- подарки у основания -->
  <rect x="64" y="186" width="14" height="12" fill="#b3261e"/><rect x="70" y="186" width="2.4" height="12" fill="#f3f4f8"/>
  <rect x="90" y="182" width="16" height="16" fill="#ecd9a8"/><rect x="97" y="182" width="2.4" height="16" fill="#b3261e"/><rect x="90" y="189" width="16" height="2.4" fill="#b3261e"/>
  <!-- эстакада с газопроводом и гирляндой -->
  <path d="M120 186h240M120 191h240" stroke="#ecd9a8" stroke-width="3.2"/>
  <path d="M128 184v14M196 184v14M276 184v14M344 184v14" stroke="#3b5b8f" stroke-width="2"/>
  <path d="M120 184q17 8 34 0t34 0 34 0 34 0 34 0 34 0 34 0" fill="none" stroke="#ecd9a8" stroke-width=".7" opacity=".6"/>
  ${bulbs([[137, 188], [171, 188], [205, 188], [239, 188], [273, 188], [307, 188], [341, 188]])}
  <!-- задвижка -->
  <rect x="226" y="180" width="8" height="16" rx="1" fill="#b3261e"/>
  <path d="M230 180v-8" stroke="#f3f4f8" stroke-width="1.6"/>
  <circle cx="230" cy="170" r="5" fill="none" stroke="#d23a2f" stroke-width="2"/>
  <path d="M0 202q60-6 120 0t120 0 120 0V210H0z" fill="#f3f4f8" opacity=".9"/>
</svg>`;

  /* Экран жеребьёвки: подарок «поступает» по магистральному газопроводу */
  const pipe = `
<svg class="pipe" viewBox="0 0 360 288" preserveAspectRatio="xMidYMin meet" aria-hidden="true">
  <!-- опоры -->
  <path d="M46 172v78M140 172v78" stroke="#3b5b8f" stroke-width="5"/>
  <path d="M30 250h32M124 250h32" stroke="#3b5b8f" stroke-width="4"/>
  <!-- труба -->
  <rect x="-10" y="128" width="210" height="44" fill="#ecd9a8"/>
  <rect x="-10" y="132" width="210" height="8" fill="#fff" opacity=".35"/>
  <rect x="-10" y="162" width="210" height="10" fill="#000" opacity=".12"/>
  <!-- фланцы -->
  <rect x="84" y="120" width="10" height="60" rx="2" fill="#d8c08a"/>
  <rect x="184" y="118" width="16" height="64" rx="3" fill="#d8c08a"/>
  <!-- красные бандажи -->
  <rect x="20" y="128" width="8" height="44" fill="#b3261e"/><rect x="150" y="128" width="8" height="44" fill="#b3261e"/>
  <!-- задвижка со штурвалом -->
  <rect x="38" y="104" width="18" height="24" rx="2" fill="#b3261e"/>
  <path d="M47 104V82" stroke="#f3f4f8" stroke-width="2.4"/>
  <g class="valve">
    <circle cx="47" cy="78" r="15" fill="none" stroke="#d23a2f" stroke-width="3.2"/>
    <path d="M47 63v30M32 78h30M36.4 67.4l21.2 21.2M57.6 67.4L36.4 88.6" stroke="#d23a2f" stroke-width="1.6"/>
    <circle cx="47" cy="78" r="3" fill="#f3f4f8"/>
  </g>
  <!-- торец трубы -->
  <ellipse cx="200" cy="150" rx="9" ry="31" fill="#d8c08a"/>
  <ellipse cx="201" cy="150" rx="5.5" ry="25" fill="#111b3a"/>
  <!-- гирлянда по трубе -->
  <path d="M0 126q25 12 50 0t50 0 50 0 40 0" fill="none" stroke="#f3f4f8" stroke-width=".8" opacity=".6"/>
  ${bulbs([[25, 132], [75, 132], [125, 132], [170, 132]])}
  <!-- снег -->
  <path d="M0 252q90-8 180 0t180 0V288H0z" fill="#f3f4f8" opacity=".92"/>
</svg>`;

  return { icon, hero, pipe };
})();
