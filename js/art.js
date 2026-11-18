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

  /* Главная иллюстрация: башенный кран опускает подарок над ночным городом */
  const hero = `
<svg viewBox="0 0 360 210" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Башенный кран опускает новогодний подарок над ночным городом">
  <defs>
    <pattern id="lattice" width="8" height="10" patternUnits="userSpaceOnUse">
      <path d="M0 0L8 10M8 0L0 10" stroke="#f3f4f8" stroke-width="1"/>
    </pattern>
  </defs>
  <!-- луна -->
  <circle cx="312" cy="38" r="15" fill="#ecd9a8"/>
  <circle cx="319" cy="33" r="13" fill="#1f2f5c"/>
  <!-- звёзды-снежинки -->
  <g stroke="#fff" stroke-width="1.1" stroke-linecap="round" opacity=".85">
    <path d="M150 22v6M147 25h6M148 23l4 4M152 23l-4 4"/>
    <path d="M280 80v5M277.5 82.5h5"/>
    <path d="M30 30v5M27.5 32.5h5"/>
    <path d="M196 70v4M194 72h4"/>
  </g>
  <!-- дальний план -->
  <g fill="#18264f">
    <rect x="0" y="150" width="34" height="60"/><rect x="38" y="132" width="26" height="78"/>
    <rect x="250" y="140" width="30" height="70"/><rect x="318" y="126" width="42" height="84"/>
  </g>
  <!-- строящийся дом -->
  <g>
    <rect x="70" y="118" width="64" height="92" fill="#16224a"/>
    <g stroke="#2a3d72" stroke-width="2">
      <path d="M70 118h64M70 140h64M70 162h64M70 184h64M86 118v92M102 118v92M118 118v92"/>
    </g>
    ${windows(74, 146, 6, 6, 10, 11)}
  </g>
  <!-- готовый дом с гирляндой -->
  <g>
    <rect x="150" y="104" width="78" height="106" fill="#141f42"/>
    ${windows(156, 112, 7, 8, 10.5, 11.5)}
    <path d="M150 104q9.75 8 19.5 0t19.5 0 19.5 0 19.5 0" fill="none" stroke="#b3261e" stroke-width="1.2"/>
    <g fill="#ecd9a8"><circle cx="160" cy="108" r="1.6"/><circle cx="179" cy="108" r="1.6"/><circle cx="199" cy="108" r="1.6"/><circle cx="218" cy="108" r="1.6"/></g>
  </g>
  <rect x="284" y="150" width="30" height="60" fill="#16224a"/>
  ${windows(288, 156, 3, 4)}
  <!-- кран: мачта -->
  <rect x="38" y="30" width="12" height="180" fill="url(#lattice)"/>
  <path d="M38 30v180M50 30v180" stroke="#f3f4f8" stroke-width="1.6"/>
  <!-- кабина -->
  <rect x="34" y="34" width="20" height="12" fill="#b3261e"/>
  <rect x="44" y="37" width="7" height="5" fill="#ecd9a8"/>
  <!-- стрела -->
  <path d="M6 30h290" stroke="#f3f4f8" stroke-width="2"/>
  <path d="M50 22h246" stroke="#f3f4f8" stroke-width="1.2"/>
  <path d="M50 22l10 8 10-8 10 8 10-8 10 8 10-8 10 8 10-8 10 8 10-8 10 8 10-8 10 8 10-8 10 8 10-8 10 8 10-8 10 8 10-8 10 8 10-8 10 8 6-6" fill="none" stroke="#f3f4f8" stroke-width="1"/>
  <path d="M44 6v24M44 6L6 30M44 6l252 16" stroke="#f3f4f8" stroke-width="1" opacity=".75"/>
  <rect x="8" y="30" width="18" height="12" fill="#b3261e"/>
  <rect x="226" y="27" width="14" height="6" fill="#b3261e"/>
  <!-- трос и подарок -->
  <g class="swing">
    <path d="M233 33v58" stroke="#f3f4f8" stroke-width="1.2"/>
    <path d="M229 91h8l-4 6z" fill="#f3f4f8"/>
    <path d="M233 97l-12 10M233 97l12 10" stroke="#f3f4f8" stroke-width="1"/>
    <rect x="215" y="107" width="36" height="30" rx="2" fill="#b3261e"/>
    <rect x="230" y="107" width="6" height="30" fill="#f3f4f8"/>
    <rect x="215" y="119" width="36" height="6" fill="#f3f4f8"/>
    <path d="M233 107c-6-8-14-4-9 0zM233 107c6-8 14-4 9 0z" fill="#ecd9a8"/>
  </g>
  <!-- снег на земле -->
  <path d="M0 204q60-6 120 0t120 0 120 0V210H0z" fill="#f3f4f8" opacity=".9"/>
</svg>`;

  /* Мини-кран для экрана жеребьёвки */
  const crane = `
<svg class="crane" viewBox="0 0 360 400" preserveAspectRatio="xMidYMin meet" aria-hidden="true">
  <path d="M70 0v400M82 0v400" stroke="#f3f4f8" stroke-width="1.6" opacity=".9"/>
  <path d="M70 58l12 12M82 58L70 70M70 82l12 12M82 82L70 94M70 106l12 12M82 106L70 118M70 130l12 12M82 130L70 142M70 154l12 12M82 154L70 166M70 178l12 12M82 178L70 190M70 202l12 12M82 202L70 214M70 226l12 12M82 226L70 238M70 250l12 12M82 250L70 262M70 274l12 12M82 274L70 286M70 298l12 12M82 298L70 310M70 322l12 12M82 322L70 334M70 346l12 12M82 346L70 358M70 370l12 12M82 370L70 382M70 394l12 12M82 394L70 406" stroke="#f3f4f8" stroke-width=".9" opacity=".55"/>
  <path d="M20 40h320" stroke="#f3f4f8" stroke-width="2"/>
  <path d="M82 32h258" stroke="#f3f4f8" stroke-width="1.1"/>
  <path d="M82 32 l10 8 10-8 l10 8 10-8 l10 8 10-8 l10 8 10-8 l10 8 10-8 l10 8 10-8 l10 8 10-8 l10 8 10-8 l10 8 10-8 l10 8 10-8 l10 8 10-8 l10 8 10-8" fill="none" stroke="#f3f4f8" stroke-width=".9" opacity=".8"/>
  <path d="M76 10L20 40M76 10l264 22M76 10v22" stroke="#f3f4f8" stroke-width=".9" opacity=".6"/>
  <rect x="64" y="42" width="24" height="14" fill="#b3261e"/><rect x="76" y="45" width="9" height="6" fill="#ecd9a8"/>
  <rect x="22" y="40" width="22" height="14" fill="#b3261e"/>
  <rect x="223" y="37" width="14" height="7" fill="#b3261e"/>
  <path d="M0 392q90-8 180 0t180 0V400H0z" fill="#f3f4f8" opacity=".9"/>
</svg>`;

  return { icon, hero, crane };
})();
