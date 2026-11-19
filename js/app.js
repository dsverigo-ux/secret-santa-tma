/* =========================================================
   Тайный Санта Р-СТРОЙ — Telegram Mini App
   Простой линейный сценарий без возврата назад:
   правила → пожелания → ожидание → жеребьёвка → подопечный → готово
   ========================================================= */
(() => {
  "use strict";

  const tg = window.Telegram && window.Telegram.WebApp;
  const inTelegram = !!(tg && tg.initData);
  const G = window.GAME;
  const { icon, pipe } = window.ART;
  const THEME = document.documentElement.dataset.theme || "classic";
  const hero = (window.ART.heroes && window.ART.heroes[THEME]) || window.ART.hero;
  const $app = document.getElementById("app");

  const VARIANT = document.documentElement.dataset.variant;
  const BRAND = VARIANT === "ruby" ? { bg: "#5a1111", btn: "#f5efe8", btnText: "#5a1111" } : {
    bg: ({ aurora: "#050b14", retro: "#efe3c8", neon: "#07070c", velvet: "#0c2416", frost: "#eef3f9", minimal: "#eeedea", cozy: "#5b7fd6", dusk: "#2a3a72", crystal: "#3a5a7c", window: "#16224a", gift: "#f2f2f2", ice: "#e8edf3", chrome: "#e6e6e8", soft: "#e6e9f0" })[THEME] || "#111b3a",
    btn: ({ neon: "#ff3b30", velvet: "#f5f7ef", minimal: "#1a1a1a", cozy: "#c8352b", crystal: "#ffffff", gift: "#c8262b", ice: "#1c2a4a", chrome: "#000000", soft: "#1f3a8a" })[THEME] || "#b3261e",
    btnText: ({ velvet: "#0c2416", crystal: "#1f2f5c" })[THEME] || "#ffffff"
  };

  /* ---------- Telegram ---------- */
  let userName = "коллега";
  if (inTelegram) {
    tg.ready();
    tg.expand();
    /* на телефонах — сразу на весь экран (Telegram 8.0+) */
    try {
      if (tg.requestFullscreen && tg.isVersionAtLeast && tg.isVersionAtLeast("8.0") && ["ios", "android"].includes(tg.platform) && !tg.isFullscreen) tg.requestFullscreen();
    } catch (e) { /* старые клиенты остаются в обычном режиме */ }
    try {
      tg.setHeaderColor(BRAND.bg);
      tg.setBackgroundColor(BRAND.bg);
      tg.setBottomBarColor && tg.setBottomBarColor(BRAND.bg);
      tg.BackButton.hide();                       // назад ходить нельзя
      tg.disableVerticalSwipes && tg.disableVerticalSwipes();
    } catch (e) { /* старые клиенты */ }
    const u = tg.initDataUnsafe && tg.initDataUnsafe.user;
    if (u && u.first_name) userName = u.first_name;
  }

  /* ---------- Состояние (сохраняется между запусками) ---------- */
  const KEY = "rstroy_santa_v1";
  /* сброс прогресса: в браузере ?reset, в Telegram — ссылка t.me/SecretRGameBot/santa?startapp=reset */
  const startParam = inTelegram && tg.initDataUnsafe && tg.initDataUnsafe.start_param;
  if (new URLSearchParams(location.search).has("reset") || startParam === "reset") {
    try { localStorage.removeItem(KEY); } catch (e) {}
    if (inTelegram && tg.CloudStorage) tg.CloudStorage.removeItem(KEY);
  }
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const state = Object.assign({ step: "welcome", wishes: "", notWanted: "" }, load());
  const save = () => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
    if (inTelegram && tg.CloudStorage) tg.CloudStorage.setItem(KEY, JSON.stringify(state));
  };
  const goStep = step => {
    if (LIVE) {                                   // настоящая игра: шаг определяет сервер
      if (step === "wishlist") view = "wishlist";
      if (step === "recipient" && S.me) { S.me.revealed = true; call("/api/reveal").catch(() => {}); }
      if (step === "done" && S.me) { S.me.bought = true; call("/api/bought").catch(() => {}); }
      render(); return;
    }
    state.step = step; save(); render();
  };

  /* ---------- Настоящая игра: связь с сервером ---------- */
  // Демо остаётся в обычном браузере и по ссылке с ?demo
  const LIVE = !!(G.api && inTelegram) && !new URLSearchParams(location.search).has("demo");
  let S = null;          // ответ сервера: кто я, статус игры, подопечный
  let view = null;       // локальные экраны: "wishlist" | "admin"
  const call = async (path, extra = {}) => {
    const r = await fetch(G.api.replace(/\/$/, "") + path, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.assign({ initData: tg.initData }, extra))
    });
    const d = await r.json().catch(() => ({ ok: false, error: "network" }));
    if (!d.ok) throw new Error(d.error || "error");
    return d;
  };
  const refresh = async () => {
    S = await call("/api/me");
    G.participants = S.counts.approved;
    if (S.me) { state.wishes = S.me.wishes || ""; state.notWanted = S.me.notWanted || ""; }
  };
  const liveStep = () => {
    if (view === "admin") return "admin";
    const m = S.me;
    if (!m) return S.drawn ? "late" : (view === "wishlist" ? "wishlist" : "welcome");
    if (m.status === "pending") return "pending";
    if (m.status === "rejected") return "rejected";
    if (!S.drawn) return "waiting";
    if (!S.recipient) return "late";
    if (!m.revealed) return "reveal";
    return m.bought ? "done" : "recipient";
  };
  // подопечный: настоящий с сервера или демонстрационный
  const recip = () => {
    if (!(LIVE && S && S.recipient)) return G.demoRecipient;
    const r = S.recipient;
    return { name: r.name, dept: r.dept || "", wishes: lines(r.wishes || ""), notWanted: r.notWanted || "", color: "#1f3a8a" };
  };
  const signTip = r => r.forName ? `Подпиши «Для ${esc(r.forName)}», свою подпись не ставь` : "Подпиши подарок именем коллеги, свою подпись не ставь";

  /* ---------- Утилиты ---------- */
  const esc = (s = "") => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const nb = (s = "") => s.replace(/Р-СТРОЙ/g, '<span style="white-space:nowrap">Р-СТРОЙ</span>');
  const fmtDate = iso => new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
  const money = n => `${Number(n).toLocaleString("ru-RU")} ${G.currency}`;
  const daysLeft = iso => Math.max(0, Math.ceil((new Date(iso) - new Date()) / 864e5));
  const plural = (n, f) => f[(n % 10 === 1 && n % 100 !== 11) ? 0 : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) ? 1 : 2];
  const initials = name => name.split(/\s+/).map(p => p[0]).join("").slice(0, 2).toUpperCase();
  const lines = t => t.split(/\n+/).map(s => s.trim()).filter(Boolean);

  const haptic = (type = "light") => {
    if (!inTelegram || !tg.HapticFeedback) return;
    if (["success", "error", "warning"].includes(type)) tg.HapticFeedback.notificationOccurred(type);
    else tg.HapticFeedback.impactOccurred(type);
  };
  const toast = msg => {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("is-visible");
    clearTimeout(toast.t);
    toast.t = setTimeout(() => el.classList.remove("is-visible"), 2600);
  };
  /* Подтверждение: своё окно внутри приложения — работает в любом браузере и в Telegram */
  const confirmDialog = (text, cb, yes = "Да", no = "Нет, исправить") => {
    const wrap = document.createElement("div");
    wrap.className = "modal";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-modal", "true");
    wrap.innerHTML = `<div class="modal__box">
        <p class="modal__text">${esc(text)}</p>
        <button type="button" class="btn btn--primary btn--block modal__yes">${esc(yes)}</button>
        <button type="button" class="btn btn--text btn--block modal__no">${esc(no)}</button>
      </div>`;
    const close = () => { wrap.remove(); if (inTelegram) tg.MainButton.show(); };
    wrap.querySelector(".modal__yes").onclick = () => { close(); cb(); };
    wrap.querySelector(".modal__no").onclick = close;
    wrap.addEventListener("click", e => { if (e.target === wrap) close(); });
    if (inTelegram) tg.MainButton.hide();
    document.body.appendChild(wrap);
    haptic("light");
    wrap.querySelector(".modal__yes").focus();
  };

  /* ---------- Большая кнопка внизу (родная кнопка Telegram) ---------- */
  let mainHandler = null;
  const fbMain = document.getElementById("fallback-main");
  const fbMainBtn = document.getElementById("fallback-main-btn");
  document.getElementById("fallback-back").hidden = true;

  function setMain(text, handler) {
    if (mainHandler && inTelegram) tg.MainButton.offClick(mainHandler);
    mainHandler = () => { haptic("medium"); handler(); };
    if (inTelegram) {
      tg.MainButton.setParams({ text, color: BRAND.btn, text_color: BRAND.btnText, is_visible: true, is_active: true });
      tg.MainButton.onClick(mainHandler);
    } else {
      fbMainBtn.textContent = text;
      fbMainBtn.onclick = mainHandler;
      fbMain.hidden = false;
    }
  }
  function hideMain() {
    if (inTelegram) { if (mainHandler) tg.MainButton.offClick(mainHandler); tg.MainButton.hide(); }
    else fbMain.hidden = true;
    mainHandler = null;
  }

  if (THEME === "chrome" || THEME === "soft") {
    const m = document.createElement("script"); m.type = "module"; m.src = "js/tree3d.js?v=29"; document.head.appendChild(m);
  }
  const mount = html => {
    $app.innerHTML = `<section class="screen simple">${html}</section>`; window.scrollTo(0, 0);
    if (window.mountTree3D) window.mountTree3D();
  };
  const masthead = () => THEME === "soft" ? SF.garland() : `
    <div class="masthead"><b>Р-СТРОЙ</b><span class="masthead__dot"></span><span>Тайный Санта</span><span class="masthead__dot"></span><span>Зима 2027</span></div>`;
  const stepper = (n, label) => `
    <div class="stepper"><span class="stepper__n">Шаг ${n} из 3</span><span class="stepper__label">${label}</span>
      <span class="stepper__bar"><i style="width:${n / 3 * 100}%"></i></span></div>`;
  const facts = () => `
    <div class="facts paper">
      <div class="fact fact--t"><span class="fact__k">Бюджет подарка</span><span class="fact__v">до ${money(G.budget)}</span></div>
      <div class="fact fact--t"><span class="fact__k">Жеребьёвка</span><span class="fact__v">${fmtDate(G.drawDate)}</span></div>
      <div class="fact fact--t"><span class="fact__k">Вручение</span><span class="fact__v">${fmtDate(G.exchangeDate)}, ${G.place}</span></div>
    </div>`;


  /* ---------- «Хром»: блоки без типовых карточек ---------- */
  const CR = THEME === "chrome";
  const crTicket = () => `
    <div class="cr-ticket">
      <div class="cr-ticket__body">
        <div><span>бюджет</span><b>до ${money(G.budget)}</b></div>
        <div><span>жеребьёвка</span><b>${fmtDate(G.drawDate)}</b></div>
        <div><span>вручение</span><b>${fmtDate(G.exchangeDate)}</b><em>${G.place}</em></div>
      </div>
      <div class="cr-coupon__stub"><span>главное</span></div>
    </div>`;
  const crList = (items, notWanted) => `
    <ol class="cr-list">
      ${items.map((w, i) => `<li><i>${String(i + 1).padStart(2, "0")}</i><span>${esc(w)}</span></li>`).join("")}
    </ol>
    ${notWanted ? `<div class="cr-no"><span class="cr-pill cr-pill--dark">не дарить</span><p>${esc(notWanted)}</p></div>` : ""}`;
  const crBand = (text) => `<div class="cr-band cr-band--static"><div class="cr-band__run">${`<span>${text}</span><span>✦</span>`.repeat(6)}</div></div>`;

  /* =======================================================
     1. Знакомство и правила
     ======================================================= */
  // Без иконок: в «Хроме» — маленькая 3D-ёлочка, в остальных темах — ничего
  const bigMark = () => THEME === "chrome" ? `<div class="cr-tree cr-tree--sm" data-tree3d></div>` : THEME === "soft" ? `<div class="sf-badge"><div class="sf-badge__tree" data-tree3d="plain"></div></div>` : "";

  function renderWelcome() {
    if (THEME === "chrome") return renderWelcomeChrome();
    if (THEME === "soft") return renderWelcomeSoft();
    const avatars = (G.joined || []).map(p => `<span class="pp__av" style="background:${p.c}">${p.i}</span>`).join("");
    mount(`
      ${masthead()}
      <div class="title-block">
        <span class="title-block__script script">Тайный</span>
        <div class="title-block__wide">Санта</div>
        <div class="title-block__note">${nb("Новый год<br>Р-СТРОЙ")}</div>
        <div class="title-block__date">${G.exchangeDate.split("-").reverse().join("/")}</div>
      </div>
      <div class="scene">${hero.replace("{{date}}", G.exchangeDate.split("-").reverse().join(" · "))}<div class="scene__corner"></div></div>

      <p class="hook rise" style="--d:.05s">В этом году кто-то из коллег станет твоим Тайным Сантой. А&nbsp;ты&nbsp;— чьим-то.</p>

      <div class="pp rise" style="--d:.15s">
        <div class="pp__avs">${avatars}<span class="pp__av pp__more">+${G.participants - (G.joined || []).length}</span></div>
        <div class="pp__txt"><b>${G.participants} ${plural(G.participants, ["коллега", "коллеги", "коллег"])}</b> уже в игре</div>
      </div>

      <div class="countdown rise" style="--d:.25s" aria-live="polite">
        <div class="countdown__label">До жеребьёвки</div>
        <div class="countdown__nums" id="cd"></div>
      </div>

      <div class="beats rise" style="--d:.35s">
        <div class="beat"><span class="beat__n">i</span><div><b>Подарок, который правда хочется</b><span>Санта выберет его по твоему списку желаний</span></div></div>
        <div class="beat"><span class="beat__n">ii</span><div><b>Интрига до самого праздника</b><span>Кто тебе дарит — узнаешь только ${fmtDate(G.exchangeDate)}</span></div></div>
        <div class="beat"><span class="beat__n">iii</span><div><b>Повод порадовать коллегу</b><span>Без лишних слов — просто подарок под ёлкой</span></div></div>
      </div>

      <details class="how rise" style="--d:.45s">
        <summary>Как это работает</summary>
        <ol class="rules">
          <li><b>Расскажи о своих желаниях.</b> 2–3 идеи — их прочитает только твой Санта.</li>
          <li><b>${fmtDate(G.drawDate)} узнай, кому даришь ты.</b> Придёт сообщение в Telegram.</li>
          <li><b>Подготовь подарок до ${money(G.budget)}.</b> Подпиши имя получателя, своё — нет.</li>
          <li><b>${fmtDate(G.exchangeDate)} вручи его ${G.place}.</b> И смотри, как случается чудо.</li>
        </ol>
        <p class="how__secret">Главное правило — тайна. Никому не говори, кому даришь.</p>
      </details>

      <p class="micro rise" style="--d:.5s">Займёт минуту · участие по желанию</p>
    `);
    const cd = document.getElementById("cd");
    const tick = () => {
      const ms = Math.max(0, new Date(G.drawDate + "T10:00:00") - new Date());
      const d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60;
      cd.innerHTML = `<span><b>${d}</b>${plural(d, ["день", "дня", "дней"])}</span><span><b>${String(h).padStart(2, "0")}</b>ч</span><span><b>${String(m).padStart(2, "0")}</b>мин</span>`;
    };
    tick(); clearInterval(renderWelcome.t); renderWelcome.t = setInterval(tick, 30000);
    setMain("Участвую!", () => goStep("wishlist"));
  }


  /* Главный экран в стиле «хром + пилюли»: объёмная ёлка, цифры, купоны-шаги, бегущая строка */
  function renderWelcomeChrome() {
    const d = daysLeft(G.drawDate);
    const steps = [
      ["шаг 1", "расскажи о&nbsp;желаниях", "2–3 идеи подарка — увидит только твой Санта", "желания"],
      ["шаг 2", "узнай, кому даришь", `${fmtDate(G.drawDate)} придёт сообщение в Telegram`, "жеребьёвка"],
      ["шаг 3", `подари подарок до&nbsp;${money(G.budget)}`, `${fmtDate(G.exchangeDate)} ${G.place}`, "праздник"]
    ];
    mount(`
      <div class="cr-top rise" style="--d:0s"><span class="cr-pill cr-pill--dark">новогодняя игра ${nb("Р-СТРОЙ")}</span></div>
      <h1 class="cr-title rise" style="--d:.05s">тайный санта</h1>
      <div class="cr-tree" data-tree3d aria-label="Хромированная ёлка медленно поворачивается"></div>
      <div class="cr-stats rise" style="--d:.15s">
        <div><span class="cr-stats__k">в игре</span><b>${G.participants}</b><span class="cr-stats__u">${plural(G.participants, ["коллега", "коллеги", "коллег"])}</span></div>
        <i></i>
        <div><span class="cr-stats__k">до жеребьёвки</span><b>${d}</b><span class="cr-stats__u">${plural(d, ["день", "дня", "дней"])}</span></div>
      </div>
      <p class="cr-hook rise" style="--d:.25s">В этом году кто-то из коллег станет твоим Тайным Сантой. А ты — чьим-то.</p>

      <div class="cr-coupons rise" style="--d:.35s">
        ${steps.map(([n, t, sub, stub]) => `
          <div class="cr-coupon">
            <div class="cr-coupon__body"><span class="cr-coupon__n">${n}</span><b>${t}</b><span>${sub}</span></div>
            <div class="cr-coupon__stub"><span>${stub}</span></div>
          </div>`).join("")}
      </div>

      <div class="cr-band"><div class="cr-band__run">
        ${"<span>тсс… главное правило — тайна</span><span>✦</span><span>никому не говори, кому даришь</span><span>✦</span>".repeat(4)}
      </div></div>
      <p class="micro">займёт минуту · участие по желанию</p>
    `);
    setMain("УЧАСТВУЮ", () => goStep("wishlist"));
  }


  /* ---------- «Мягкий»: неоморфизм + чуть-чуть новогоднего ---------- */
  const SF = {
    bauble: (id, red = true) => `
      <svg class="sf-bauble" viewBox="0 0 60 92" aria-hidden="true">
        <defs>
          <radialGradient id="${id}g" cx="36%" cy="34%" r="70%">
            <stop offset="0" stop-color="${red ? "#ff8a80" : "#9ec0ff"}"/><stop offset=".45" stop-color="${red ? "#d93a3a" : "#2563eb"}"/><stop offset="1" stop-color="${red ? "#7c1010" : "#0f2f8a"}"/>
          </radialGradient>
          <linearGradient id="${id}c" x1="0" x2="1"><stop offset="0" stop-color="#b8892f"/><stop offset=".5" stop-color="#f5d27a"/><stop offset="1" stop-color="#a87a22"/></linearGradient>
        </defs>
        <line x1="30" y1="0" x2="30" y2="26" stroke="#9aa3b5" stroke-width="1.2"/>
        <rect x="23" y="25" width="14" height="9" rx="2" fill="url(#${id}c)"/>
        <circle cx="30" cy="60" r="27" fill="url(#${id}g)"/>
        <ellipse cx="21" cy="49" rx="7" ry="4.5" fill="#fff" opacity=".55" transform="rotate(-35 21 49)"/>
        <path d="M6 62 Q30 72 54 62" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.5"/>
      </svg>`,
    garland: () => {
      const n = 9, pts = [];
      for (let i = 0; i < n; i++) { const x = 22 + i * (356 / (n - 1)); const t = (x - 200) / 200; pts.push([x, 14 + 30 * (1 - t * t)]); }
      const cols = ["#1f3a8a", "#c8102e", "#c9ced6"];
      return `<svg class="sf-garland" viewBox="0 0 400 70" preserveAspectRatio="none" aria-hidden="true">
        <path d="M-10 6 Q200 86 410 6" fill="none" stroke="#8f99ad" stroke-width="1.2"/>
        ${pts.map(([x, y], i) => `<g class="sf-bulb" style="--d:${(i * .37) % 2}s"><rect x="${x - 2.5}" y="${y - 3}" width="5" height="5" rx="1" fill="#8f99ad"/><ellipse cx="${x}" cy="${y + 8}" rx="4.6" ry="7" fill="${cols[i % 3]}"/><ellipse cx="${x - 1.4}" cy="${y + 5.5}" rx="1.3" ry="2.2" fill="#fff" opacity=".7"/></g>`).join("")}
      </svg>`;
    },
    ring: (big, small, frac) => {
      const r = 118, c = 2 * Math.PI * r, a = -Math.PI / 2 + frac * 2 * Math.PI;
      const dx = 150 + r * Math.cos(a), dy = 150 + r * Math.sin(a);
      return `<div class="sf-ring">
        <svg viewBox="0 0 300 300" aria-hidden="true">
          <circle cx="150" cy="150" r="${r}" fill="none" stroke="#d5dae4" stroke-width="9"/>
          <circle cx="150" cy="150" r="${r}" fill="none" stroke="#1f3a8a" stroke-width="9" stroke-linecap="round" stroke-dasharray="${(c * frac).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 150 150)"/>
          <circle cx="${dx.toFixed(1)}" cy="${dy.toFixed(1)}" r="10" fill="#1f3a8a" stroke="#eef1f6" stroke-width="5"/>
        </svg>
        <div class="sf-ring__in"><b>${big}</b><span>${small}</span></div>
        <div class="sf-ring__toy" data-tree3d="plain" aria-hidden="true"></div>
      </div>`;
    }
  };

  function renderWelcomeSoft() {
    const d = daysLeft(G.drawDate);
    const start = new Date("2026-11-01").getTime(), end = new Date(G.drawDate).getTime();
    const frac = Math.min(.97, Math.max(.04, (Date.now() - start) / (end - start)));
    mount(`
      ${SF.garland()}
      <div class="sf-head rise" style="--d:0s">
        <span class="sf-eyebrow">Привет, ${esc(userName)}</span>
        <h1 class="sf-title">Пора стать Сантой</h1>
      </div>
      ${SF.ring(d, plural(d, ["день", "дня", "дней"]) + " до жеребьёвки", frac)}
      <div class="sf-rows rise" style="--d:.15s">
        <div class="sf-row"><i class="sf-dot"></i><div><span>Новогодняя игра</span><b>Тайный Санта ${nb("Р-СТРОЙ")}</b></div></div>
        <div class="sf-row"><div><span>Бюджет подарка</span><b>до ${money(G.budget)}</b></div></div>
        <div class="sf-row"><div><span>Вручение</span><b>${fmtDate(G.exchangeDate)}, ${G.place}</b></div></div>
      </div>
      <p class="sf-meta">${G.participants >= 3 ? `${G.participants} ${plural(G.participants, ["коллега", "коллеги", "коллег"])} уже в игре · ` : ""}займёт минуту</p>
      <details class="sf-how">
        <summary>Как это работает</summary>
        <ol>
          <li><b>Расскажи о желаниях.</b> 2–3 идеи подарка — их увидит только твой Санта.</li>
          <li><b>Узнай, кому даришь.</b> ${fmtDate(G.drawDate)} придёт сообщение в Telegram.</li>
          <li><b>Подари подарок до ${money(G.budget)}.</b> ${fmtDate(G.exchangeDate)} ${G.place}. Главное — никому не говорить!</li>
        </ol>
      </details>
    `);
    setMain("Участвую", () => goStep("wishlist"));
  }

  /* =======================================================
     2. Пожелания
     ======================================================= */
  function renderWishlist() {
    mount(`
      ${masthead()}
      ${stepper(1, "<b>Р\u2011СТРОЙ</b> собирает пожелания")}
      <h1>О чём ты мечтаешь в этом году?</h1>
      <p class="lead">Напиши 2–3 идеи — каждую с новой строки. Чем конкретнее, тем легче Санте угадать: можно добавить любимый цвет или размер.</p>

      <div class="section paper paper--pad">
        ${LIVE ? `<label class="field">
          <span class="field__label">Как тебя зовут (имя и фамилия)</span>
          <input class="input" id="w-name" autocomplete="name" value="${esc(((S.user.firstName || "") + " " + (S.user.lastName || "")).trim())}" placeholder="Например: Анна Иванова" />
        </label>
        <label class="field">
          <span class="field__label">Отдел (можно пропустить)</span>
          <input class="input" id="w-dept" placeholder="Например: сметно-договорный отдел" />
        </label>` : ""}
        <label class="field">
          <span class="field__label">Мне будет приятно получить</span>
          <textarea class="textarea textarea--big" id="w-wishes" placeholder="Например:&#10;тёплый плед в клетку&#10;хороший чай&#10;книга о путешествиях">${esc(state.wishes)}</textarea>
        </label>
        <label class="field">
          <span class="field__label">Лучше не дарить (можно пропустить)</span>
          <textarea class="textarea" id="w-not" placeholder="Например: сладкое — аллергия; духи">${esc(state.notWanted)}</textarea>
        </label>
      </div>
      <div class="chips-wrap">
        <div class="chips__label">Быстрые идеи — нажми, чтобы добавить</div>
        <div class="chips" id="chips">${(G.ideas || []).map(t => `<button type="button" class="chip-idea">${esc(t)}</button>`).join("")}</div>
      </div>
      <p class="hint">После сохранения поменять пожелания можно только через организатора.</p>
    `);
    document.getElementById("chips").addEventListener("click", e => {
      const b = e.target.closest(".chip-idea"); if (!b) return;
      const ta = document.getElementById("w-wishes");
      const lines = ta.value.split("\n").map(x => x.trim()).filter(Boolean);
      if (!lines.includes(b.textContent)) lines.push(b.textContent);
      ta.value = lines.join("\n");
      b.classList.add("is-on"); haptic("light");
    });

    setMain("Следующий шаг", () => {
      const wishes = document.getElementById("w-wishes").value.trim();
      const notWanted = document.getElementById("w-not").value.trim();
      if (!wishes) { haptic("error"); toast("Напиши хотя бы одно пожелание"); document.getElementById("w-wishes").focus(); return; }
      if (LIVE) {
        const name = document.getElementById("w-name").value.trim();
        const dept = document.getElementById("w-dept").value.trim();
        if (name.length < 2) { haptic("error"); toast("Напиши, как тебя зовут"); document.getElementById("w-name").focus(); return; }
        confirmDialog("Всё верно? Заявка уйдёт организатору, а пожелания — твоему Санте. Поменять их потом можно только через организатора.", () => {
          const send = () => call("/api/join", { name, dept, wishes, notWanted })
            .then(refresh).then(() => { view = null; haptic("success"); render(); })
            .catch(() => { haptic("error"); toast("Не получилось отправить. Попробуй ещё раз"); });
          // разрешение боту писать — чтобы прислать результат жеребьёвки
          const u = tg.initDataUnsafe && tg.initDataUnsafe.user;
          if (tg.requestWriteAccess && !(u && u.allows_write_to_pm)) { try { tg.requestWriteAccess(() => send()); } catch (e) { send(); } }
          else send();
        });
        return;
      }
      confirmDialog("Всё верно? Пожелания отправятся твоему Санте. Поменять их потом можно только через организатора.", () => {
        state.wishes = wishes; state.notWanted = notWanted;
        haptic("success");
        goStep("waiting");
      });
    });
  }

  /* =======================================================
     3. Ожидание жеребьёвки
     ======================================================= */
  function renderWaiting() {
    const d = daysLeft(G.drawDate);
    mount(`
      ${masthead()}
      ${stepper(2, "<b>Р\u2011СТРОЙ</b> ждёт жеребьёвку")}
      <div class="bigstate">
        ${bigMark()}
        <h1>Отлично! Ты всё делаешь правильно</h1>
        <p class="lead">Твои пожелания уже у Санты. <b>${fmtDate(G.drawDate)}</b>${d ? ` (через ${d} ${plural(d, ["день", "дня", "дней"])})` : ""} придёт сообщение, кому даришь ты. А пока можно присматриваться к идеям и ждать чуда.</p>
      </div>

      ${state.wishes ? `<div class="section">
        <div class="section__head"><span class="section__title">Твои пожелания</span></div>
        ${CR ? crList(lines(state.wishes), state.notWanted) : `<div class="paper">
          ${lines(state.wishes).map((w, i) => `<div class="wish"><div class="wish__num">${String(i + 1).padStart(2, "0")}</div><div class="wish__body">${esc(w)}</div></div>`).join("")}
          ${state.notWanted ? `<div class="kv"><div class="kv__k">Не дарить</div><div class="kv__v">${esc(state.notWanted)}</div></div>` : ""}
        </div>`}
      </div>` : ""}

      <div class="section">${CR ? crTicket() : facts()}</div>
      <p class="hint">Нужно что-то поменять — напиши организатору игры.</p>

      <div class="section invite-cta">
        <p>Чем больше коллег в игре — тем интереснее. Позови тех, кто ещё не знает.</p>
        <button type="button" class="btn btn--ghost-ink btn--block" id="share">Позвать коллегу</button>
      </div>

      ${LIVE ? "" : `<button class="demo-link${CR ? " cr-link" : ""}" id="demo-draw">Демо: показать, что будет после жеребьёвки</button>`}
    `);
    document.getElementById("share").onclick = () => {
      const url = "https://t.me/share/url?url=" + encodeURIComponent("https://t.me/SecretRGameBot/santa") + "&text=" + encodeURIComponent("Я уже в Тайном Санте Р-СТРОЙ! Присоединяйся — займёт минуту ✨");
      inTelegram ? tg.openTelegramLink(url) : window.open(url, "_blank");
    };
    if (!LIVE) document.getElementById("demo-draw").onclick = () => goStep("reveal");
    if (inTelegram) setMain("Закрыть", () => tg.close()); else hideMain();
  }

  /* =======================================================
     4. Жеребьёвка — подарок поступает по газопроводу
     ======================================================= */
  function renderReveal() {
    const r = recip();
    if (THEME === "ice" || THEME === "chrome" || THEME === "soft") return renderMelt(r);
    mount(`
      ${masthead()}
      ${stepper(3, "<b>Р\u2011СТРОЙ</b> тянет жребий")}
      <div class="draw">
        <h1>Жеребьёвка прошла!</h1>
        <p class="lead" style="text-align:center">Имена перемешаны и разлетелись по адресам. Нажми кнопку — узнаешь, для кого ты Санта в этом году.</p>
        <div class="pipe-stage">
          ${pipe}
          <div class="gift-box" id="gift" aria-live="polite">
            <div class="gift-box__inner">
              <div class="gift-box__face"><span class="gift-box__tag">СЮРПРИЗ</span><span class="gift-box__corner"></span></div>
              <div class="gift-box__back">
                <div class="gift-box__label">Ты даришь</div>
                <div style="margin-top:10px"><div class="avatar" style="background:${r.color}">${esc(initials(r.name))}</div></div>
                <h2>${esc(r.name.split(" ")[0])}</h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    `);
    const open = () => {
      document.getElementById("gift").classList.add("is-open");
      haptic("success");
      confetti();
      setMain("Дальше", () => goStep("recipient"));
    };
    document.getElementById("gift").addEventListener("click", open);
    setMain("Узнать, кому я дарю", open);
  }


  function renderMelt(r) {
    mount(`
      ${masthead()}
      ${stepper(3, "<b>Р\u2011СТРОЙ</b> тянет жребий")}
      <h1>Жеребьёвка прошла!</h1>
      <p class="lead">Имя твоего подопечного спрятано подо льдом. Растопи его.</p>
      <div class="melt" id="melt">
        <div class="melt__photo"></div>
        <div class="melt__name">
          <div class="melt__eyebrow">Ты — Тайный Санта для</div>
          <div class="melt__who">${esc(r.name.split(" ")[0])}<br><em>${esc(r.name.split(" ").slice(1).join(" "))}</em></div>
          <div class="melt__dept">${esc(r.dept)}</div>
        </div>
        <div class="melt__frost"></div>
      </div>
    `);
    const melt = document.getElementById("melt");
    const open = () => {
      if (melt.classList.contains("is-melted")) return;
      melt.classList.add("is-melted"); haptic("success"); confetti();
      setMain("Что хочет получить?", () => goStep("recipient"));
    };
    melt.addEventListener("click", open);
    setMain("Растопить лёд", open);
  }

  function confetti() {
    const box = document.createElement("div");
    box.className = "confetti";
    const colors = THEME === "soft" ? ["#1f3a8a", "#c8102e", "#c9ced6", "#ffffff", "#8fa2c8"] : THEME === "chrome" ? ["#0b1690", "#c9ced6", "#ffffff", "#111111", "#7d8796"] : THEME === "ice" ? ["#ffffff", "#dbe7f5", "#b9cbe3", "#1c2a4a", "#eef4fb"] : ["#b3261e", "#ecd9a8", "#f3f4f8", "#2a3d72", "#d23a2f"];
    for (let i = 0; i < 70; i++) {
      const p = document.createElement("i");
      p.style.left = Math.random() * 100 + "%";
      p.style.background = colors[i % colors.length];
      p.style.animationDuration = 1.6 + Math.random() * 1.8 + "s";
      p.style.animationDelay = Math.random() * .4 + "s";
      box.appendChild(p);
    }
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 4000);
  }

  /* =======================================================
     5. Подопечный
     ======================================================= */
  function recipientCard() {
    const r = recip();
    if (CR) return `
      <div class="cr-ticket cr-ticket--who">
        <div class="cr-ticket__body">
          <span class="cr-pill cr-pill--dark">ты — тайный санта для</span>
          <h2 class="cr-who">${esc(r.name)}</h2>
          <em>${esc(r.dept)}</em>
        </div>
        <div class="cr-coupon__stub"><span>подопечный</span></div>
      </div>
      <div class="section">
        <div class="section__head"><span class="section__title">что ${esc(r.name.split(" ")[0])} хочет получить</span></div>
        ${crList(r.wishes, r.notWanted)}
      </div>
      <div class="section cr-tips">
        <div class="cr-tips__h">подсказки санте</div>
        <ol>
          <li><i>01</i><span>Перечитай пожелания ещё раз перед покупкой</span></li>
          <li><i>02</i><span>Держись бюджета — до ${money(G.budget)}</span></li>
          <li><i>03</i><span>${signTip(r)}</span></li>
          <li><i>04</i><span>Вручи ${fmtDate(G.exchangeDate)} ${G.place}</span></li>
        </ol>
      </div>
      ${crBand(`тсс… это секрет до ${fmtDate(G.exchangeDate)}`)}`;
    return `
      <div class="doc-head recipient">
        <div class="eyebrow">Ты — Тайный Санта для</div>
        <div class="avatar avatar--lg" style="background:${r.color}">${esc(initials(r.name))}</div>
        <h1 style="max-width:none">${esc(r.name)}</h1>
        <div class="recipient__dept">${esc(r.dept)}</div>
      </div>
      <div class="section">
        <div class="section__head"><span class="section__title">Что ${esc(r.name.split(" ")[0])} хочет получить</span></div>
        <div class="paper">
          ${r.wishes.map((w, i) => `<div class="wish"><div class="wish__num">${String(i + 1).padStart(2, "0")}</div><div class="wish__body">${esc(w)}</div></div>`).join("")}
          ${r.notWanted ? `<div class="kv"><div class="kv__k" style="color:var(--red)">Не дарить</div><div class="kv__v">${esc(r.notWanted)}</div></div>` : ""}
        </div>
      </div>
      <div class="section">
        <div class="section__head"><span class="section__title">Подсказки Санте</span></div>
        <div class="paper">
          <div class="fact fact--n"><span class="fact__n">01</span><span>Перечитай пожелания ещё раз перед покупкой</span></div>
          <div class="fact fact--n"><span class="fact__n">02</span><span>Держись бюджета — до ${money(G.budget)}</span></div>
          <div class="fact fact--n"><span class="fact__n">03</span><span>${signTip(r)}</span></div>
          <div class="fact fact--n"><span class="fact__n">04</span><span>Вручи ${fmtDate(G.exchangeDate)} ${G.place}</span></div>
        </div>
      </div>
      <div class="section note"><div><b>Тсс… это секрет до ${fmtDate(G.exchangeDate)}.</b></div></div>`;
  }

  function renderRecipient() {
    mount(`${masthead()}${stepper(3, "<b>Р\u2011СТРОЙ</b> выбирает подарки")}<h1 class="screen-title">Время выбирать подарок!</h1>${recipientCard()}`);
    setMain("Подарок куплен!", () =>
      confirmDialog("Отметить, что подарок куплен?", () => { haptic("success"); goStep("done"); }, "Да, куплен", "Пока нет"));
  }

  /* =======================================================
     6. Готово
     ======================================================= */
  function renderDone() {
    mount(`
      ${masthead()}
      <div class="bigstate">
        ${THEME === "gift" && window.ART.giftBox3d ? `<div class="gx-done">${window.ART.giftBox3d("gxd")}</div>` : bigMark()}
        <h1>Ура! Подарок готов!</h1>
        <p class="lead">Ты молодец! <b>${fmtDate(G.exchangeDate)}</b> положи подарок под ёлку ${G.place}. Скоро и тебя найдёт сюрприз от твоего Санты.</p>
      </div>
      ${recipientCard()}
    `);
    if (inTelegram) setMain("Закрыть", () => tg.close()); else hideMain();
  }

  /* ---------- Отрисовка по шагу ---------- */

  /* =======================================================
     Настоящая игра: заявка, отказ, опоздание, панель организатора
     ======================================================= */
  const myWishes = () => state.wishes ? `<div class="section">
      <div class="section__head"><span class="section__title">Твои пожелания</span></div>
      ${CR ? crList(lines(state.wishes), state.notWanted) : `<div class="paper">
        ${lines(state.wishes).map((w, i) => `<div class="wish"><div class="wish__num">${String(i + 1).padStart(2, "0")}</div><div class="wish__body">${esc(w)}</div></div>`).join("")}
        ${state.notWanted ? `<div class="kv"><div class="kv__k">Не дарить</div><div class="kv__v">${esc(state.notWanted)}</div></div>` : ""}
      </div>`}
    </div>` : "";
  const closeBtn = () => { if (inTelegram) setMain("Закрыть", () => tg.close()); else hideMain(); };

  function renderPending() {
    mount(`
      ${masthead()}
      ${stepper(1, "<b>Р‑СТРОЙ</b> собирает пожелания")}
      <div class="bigstate">
        ${bigMark()}
        <h1>Заявка отправлена!</h1>
        <p class="lead">Организатор подтвердит участие, и бот пришлёт сообщение. Жеребьёвка — <b>${fmtDate(G.drawDate)}</b>. А пока можно присматриваться к идеям и ждать чуда.</p>
      </div>
      ${myWishes()}
      <p class="hint">Нужно что-то поменять — напиши организатору игры.</p>
    `);
    closeBtn();
  }
  function renderRejected() {
    mount(`${masthead()}<div class="bigstate">${bigMark()}<h1>Участие не подтверждено</h1>
      <p class="lead">Организатор не подтвердил заявку. Если это ошибка — напиши организатору игры.</p></div>`);
    closeBtn();
  }
  function renderLate() {
    mount(`${masthead()}<div class="bigstate">${bigMark()}<h1>Жеребьёвка уже прошла</h1>
      <p class="lead">В этом году пары уже распределены. Напиши организатору — возможно, получится что-то придумать.</p></div>`);
    closeBtn();
  }

  async function notifyAll(retry = false) {
    let sent = 0;
    for (let i = 0; i < 15; i++) {
      const d = await call("/api/admin/notify", i === 0 && retry ? { retry: true } : {});
      sent += d.sent;
      if (!d.left) break;
    }
    return sent;
  }

  async function renderAdmin() {
    mount(`${masthead()}<h1 class="screen-title">Панель организатора</h1><p class="lead">Загружаю список…</p>`);
    hideMain();
    let d;
    try { d = await call("/api/admin/list"); } catch (e) { toast("Не удалось загрузить список"); return; }
    if (view !== "admin") return;
    const by = st => d.list.filter(p => p.status === st);
    const pend = by("pending"), appr = by("approved"), rej = by("rejected");
    const sub = p => esc([p.dept, p.username && "@" + p.username].filter(Boolean).join(" · "));
    const row = (p, acts) => `<div class="adm-row"><div class="adm-row__who"><b>${esc(p.name)}</b><span>${sub(p)}</span></div><div class="adm-row__act">${acts}</div></div>`;
    const btn = (id, st, t, cls = "") => `<button type="button" class="adm-btn ${cls}" data-id="${id}" data-st="${st}">${t}</button>`;
    const bought = appr.filter(p => p.bought).length;
    mount(`
      ${masthead()}
      <h1 class="screen-title">Панель организатора</h1>
      <div class="facts paper">
        <div class="fact fact--t"><span class="fact__k">В игре</span><span class="fact__v">${appr.length} ${plural(appr.length, ["участник", "участника", "участников"])}</span></div>
        <div class="fact fact--t"><span class="fact__k">Ждут подтверждения</span><span class="fact__v">${pend.length}</span></div>
        <div class="fact fact--t"><span class="fact__k">Жеребьёвка</span><span class="fact__v">${d.drawn ? `проведена · подарки купили ${bought} из ${appr.length}` : `ещё не проводилась · план — ${fmtDate(G.drawDate)}`}</span></div>
      </div>
      ${pend.length ? `<div class="section">
        <div class="section__head"><span class="section__title">Ждут подтверждения</span></div>
        <div class="paper">${pend.map(p => row(p, btn(p.tg_id, "approved", "Одобрить", "adm-btn--yes") + btn(p.tg_id, "rejected", "Отклонить"))).join("")}</div>
        ${pend.length > 1 ? `<button type="button" class="btn btn--ghost-ink btn--block adm-all" id="adm-all">Одобрить всех (${pend.length})</button>` : ""}
      </div>` : ""}
      <div class="section">
        <div class="section__head"><span class="section__title">В игре</span></div>
        ${appr.length ? `<div class="paper">${appr.map(p => row(p, d.drawn ? `<span class="adm-tag">${p.bought ? "подарок куплен" : "ещё выбирает"}</span>` : btn(p.tg_id, "rejected", "Убрать"))).join("")}</div>` : `<p class="hint">Пока никого — одобрите заявки выше.</p>`}
      </div>
      ${rej.length ? `<div class="section">
        <div class="section__head"><span class="section__title">Отклонены</span></div>
        <div class="paper">${rej.map(p => row(p, d.drawn ? "" : btn(p.tg_id, "approved", "Вернуть"))).join("")}</div>
      </div>` : ""}
      <p class="hint">Ссылка для коллег: t.me/SecretRGameBot/santa</p>
      <button type="button" class="demo-link" id="adm-back">Вернуться в игру</button>
    `);
    document.getElementById("adm-back").onclick = () => { view = null; refresh().then(render).catch(render); };
    document.querySelectorAll(".adm-btn[data-id]").forEach(b => b.onclick = async () => {
      b.disabled = true;
      try { await call("/api/admin/set", { id: Number(b.dataset.id), status: b.dataset.st }); haptic("success"); }
      catch (e) { toast("Не получилось, попробуйте ещё раз"); }
      renderAdmin();
    });
    const all = document.getElementById("adm-all");
    if (all) all.onclick = async () => {
      all.disabled = true;
      const ids = pend.map(p => p.tg_id);
      try { for (let i = 0; i < ids.length; i += 10) await call("/api/admin/set", { ids: ids.slice(i, i + 10), status: "approved" }); haptic("success"); }
      catch (e) { toast("Одобрены не все — попробуйте ещё раз"); }
      renderAdmin();
    };
    if (!d.drawn) {
      setMain("Провести жеребьёвку", () => {
        if (appr.length < 3) { haptic("error"); toast("Нужно хотя бы 3 участника"); return; }
        confirmDialog(`Провести жеребьёвку для ${appr.length} ${plural(appr.length, ["участника", "участников", "участников"])}? После этого состав изменить нельзя.${pend.length ? ` Заявки без ответа (${pend.length}) в игру не попадут.` : ""}`, async () => {
          try {
            await call("/api/admin/draw");
            toast("Жеребьёвка проведена! Рассылаю сообщения…");
            const n = await notifyAll();
            haptic("success"); toast(`Готово: сообщения получили ${n}`);
          } catch (e) { haptic("error"); toast("Не получилось провести жеребьёвку"); }
          await refresh().catch(() => {});
          renderAdmin();
        }, "Да, провести", "Пока нет");
      });
    } else if (appr.some(p => p.notified !== 1)) {
      setMain("Разослать сообщения ещё раз", async () => {
        try { const n = await notifyAll(true); toast(`Отправлено: ${n}`); } catch (e) { toast("Не получилось отправить"); }
        renderAdmin();
      });
    }
  }

  const screens = { pending: renderPending, rejected: renderRejected, late: renderLate, admin: renderAdmin, welcome: renderWelcome, wishlist: renderWishlist, waiting: renderWaiting, reveal: renderReveal, recipient: renderRecipient, done: renderDone };
  function render() {
    hideMain();
    const st = LIVE ? liveStep() : state.step;
    (screens[st] || renderWelcome)();
    // организатору — вход в панель с любого экрана игры
    if (LIVE && S.admin && st !== "admin") {
      const b = document.createElement("button");
      b.type = "button"; b.className = "demo-link adm-link"; b.textContent = "Панель организатора";
      b.onclick = () => { view = "admin"; render(); };
      const sec = $app.querySelector(".screen"); if (sec) sec.appendChild(b);
    }
  }

  /* ---------- Снегопад ---------- */
  (function snowfall() {
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = document.createElement("div");
    box.className = "snowfall";
    box.setAttribute("aria-hidden", "true");
    const n = window.innerWidth < 600 ? 46 : 70;
    for (let i = 0; i < n; i++) {
      const f = document.createElement("i");
      const spark = i % 3 === 0;                           // каждая третья — блестящая искра
      const size = spark ? 10 + Math.random() * 8 : 2 + Math.random() * 4.5;
      const dur = 8 + Math.random() * 10, glint = 1.2 + Math.random() * 1.6;
      if (spark) f.className = "spark";
      f.style.cssText = `left:${Math.random() * 100}%;width:${size}px;height:${size}px;` +
        `opacity:${.45 + Math.random() * .5};` +
        `animation-duration:${dur}s${spark ? `, ${glint}s` : ""};` +
        `animation-delay:${-Math.random() * dur}s${spark ? `, ${-Math.random() * glint}s` : ""};` +
        `--dx:${(Math.random() * 80 - 40).toFixed(0)}px;--y:${(Math.random() * 100).toFixed(1)}%;` +
        (!spark && size > 5 ? "filter:blur(1px);" : "");
      box.appendChild(f);
    }
    document.body.appendChild(box);
  })();

  /* демо-просмотр конкретного шага: ?step=wishlist и т. п. */
  const forced = new URLSearchParams(location.search).get("step");
  if (forced && screens[forced]) state.step = forced;
  if (LIVE) {
    mount(`<div class="bigstate" style="margin-top:30vh"><p class="lead">Загружаю игру…</p></div>`);
    refresh().then(render).catch(() => {
      mount(`<div class="bigstate">${bigMark()}<h1>Нет связи с игрой</h1><p class="lead">Проверь интернет и открой приложение ещё раз.</p></div>`);
      if (inTelegram) setMain("Попробовать снова", () => location.reload());
    });
  } else render();
})();
