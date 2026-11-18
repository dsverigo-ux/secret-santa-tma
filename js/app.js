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

  const BRAND = {
    bg: ({ aurora: "#050b14", retro: "#efe3c8", neon: "#07070c", velvet: "#0c2416", frost: "#eef3f9", minimal: "#eeedea", cozy: "#5b7fd6", dusk: "#2a3a72" })[THEME] || "#111b3a",
    btn: ({ neon: "#ff3b30", velvet: "#f5f7ef", minimal: "#1a1a1a", cozy: "#c8352b" })[THEME] || "#b3261e",
    btnText: THEME === "velvet" ? "#0c2416" : "#ffffff"
  };

  /* ---------- Telegram ---------- */
  let userName = "коллега";
  if (inTelegram) {
    tg.ready();
    tg.expand();
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
  if (new URLSearchParams(location.search).has("reset")) { try { localStorage.removeItem(KEY); } catch (e) {} }
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const state = Object.assign({ step: "welcome", wishes: "", notWanted: "" }, load());
  const save = () => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
    if (inTelegram && tg.CloudStorage) tg.CloudStorage.setItem(KEY, JSON.stringify(state));
  };
  const goStep = step => { state.step = step; save(); render(); };

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
  const confirmDialog = (text, cb) => {
    if (inTelegram && tg.showConfirm) tg.showConfirm(text, ok => ok && cb());
    else if (window.confirm(text)) cb();
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

  const mount = html => { $app.innerHTML = `<section class="screen simple">${html}</section>`; window.scrollTo(0, 0); };
  const masthead = () => `
    <div class="masthead"><b>Р-СТРОЙ</b><span class="masthead__dot"></span><span>Тайный Санта</span><span class="masthead__dot"></span><span>Зима 2027</span></div>`;
  const stepper = (n, label) => `
    <div class="stepper"><span class="stepper__n">Шаг ${n} из 3</span><span class="stepper__label">${label}</span>
      <span class="stepper__bar"><i style="width:${n / 3 * 100}%"></i></span></div>`;
  const facts = () => `
    <div class="facts paper">
      <div class="fact"><span class="fact__ic">${icon("wallet")}</span><span><b>Бюджет подарка</b> — до ${money(G.budget)}</span></div>
      <div class="fact"><span class="fact__ic">${icon("shuffle")}</span><span><b>Жеребьёвка</b> — ${fmtDate(G.drawDate)}</span></div>
      <div class="fact"><span class="fact__ic">${icon("gift")}</span><span><b>Вручение</b> — ${fmtDate(G.exchangeDate)}, ${G.place}</span></div>
    </div>`;

  /* =======================================================
     1. Знакомство и правила
     ======================================================= */
  function renderWelcome() {
    mount(`
      ${masthead()}
      <div class="title-block">
        <span class="title-block__script script">Тайный</span>
        <div class="title-block__wide">Санта</div>
        <div class="title-block__note">${nb("Новый год<br>Р-СТРОЙ")}</div>
      </div>
      <div class="scene">${hero}<div class="scene__corner"></div></div>

      <p class="lead"><b>Привет, ${esc(userName)}! Это Тайный Санта ${nb("Р-СТРОЙ")}!</b><br>Надеемся, новогодние подарки тебя порадуют.</p>

      <div class="section">
        <div class="section__head"><span class="section__title">Какие правила?</span></div>
        <ol class="rules">
          <li><b>Напиши, что хочешь получить.</b> Это увидит только тот, кто будет тебе дарить.</li>
          <li><b>${fmtDate(G.drawDate)} узнаешь, кому даришь ты.</b> Придёт сообщение в Telegram.</li>
          <li><b>Купи подарок до ${money(G.budget)}</b> и вручи его ${fmtDate(G.exchangeDate)} ${G.place}.</li>
        </ol>
      </div>

      <div class="section">
        <div class="section__head"><span class="section__title">Твои возможности</span></div>
        <div class="paper">
          <div class="fact"><span class="fact__ic">${icon("list")}</span><span>Рассказать, какой подарок тебя обрадует</span></div>
          <div class="fact"><span class="fact__ic">${icon("gift")}</span><span>Узнать, кому даришь, и что он(а) хочет</span></div>
          <div class="fact"><span class="fact__ic">${icon("check")}</span><span>Отметить, что подарок готов</span></div>
        </div>
      </div>

      <div class="section note">${icon("secret")}<div><b>Главное правило — тайна.</b> Никому не говори, кому даришь подарок.</div></div>
    `);
    setMain("Поехали!", () => goStep("wishlist"));
  }

  /* =======================================================
     2. Пожелания
     ======================================================= */
  function renderWishlist() {
    mount(`
      ${masthead()}
      ${stepper(1, "Твои пожелания")}
      <h1>Что ты хочешь получить?</h1>
      <p class="lead">Напиши 2–3 идеи — каждую с новой строки. Так твоему Санте будет проще выбрать подарок.</p>

      <div class="section paper paper--pad">
        <label class="field">
          <span class="field__label">Я буду рад(а)</span>
          <textarea class="textarea textarea--big" id="w-wishes" placeholder="Например:&#10;тёплый шарф&#10;книга о рыбалке&#10;хороший чай">${esc(state.wishes)}</textarea>
        </label>
        <label class="field">
          <span class="field__label">Мне лучше не дарить (можно пропустить)</span>
          <textarea class="textarea" id="w-not" placeholder="Например: сладкое, духи">${esc(state.notWanted)}</textarea>
        </label>
      </div>
      <p class="hint">${icon("bulb", "i--sm")}После сохранения поменять пожелания можно только через организатора.</p>
    `);

    setMain("Следующий шаг", () => {
      const wishes = document.getElementById("w-wishes").value.trim();
      const notWanted = document.getElementById("w-not").value.trim();
      if (!wishes) { haptic("error"); toast("Напиши хотя бы одно пожелание"); document.getElementById("w-wishes").focus(); return; }
      confirmDialog("Сохранить пожелания? Потом поменять их можно только через организатора.", () => {
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
      ${stepper(2, "Ждём жеребьёвку")}
      <div class="bigstate">
        <div class="bigstate__ic">${icon("check")}</div>
        <h1>Отлично! Ты всё сделал(а) правильно!</h1>
        <p class="lead">Теперь ждём жеребьёвку — <b>${fmtDate(G.drawDate)}</b>${d ? `, через ${d} ${plural(d, ["день", "дня", "дней"])}` : ""}. В этот день придёт сообщение в Telegram: кому ты даришь подарок.</p>
      </div>

      ${state.wishes ? `<div class="section">
        <div class="section__head"><span class="section__title">Твои пожелания</span></div>
        <div class="paper">
          ${lines(state.wishes).map((w, i) => `<div class="wish"><div class="wish__num">${String(i + 1).padStart(2, "0")}</div><div class="wish__body">${esc(w)}</div></div>`).join("")}
          ${state.notWanted ? `<div class="kv"><div class="kv__k">${icon("ban", "i--sm")}Не дарить</div><div class="kv__v">${esc(state.notWanted)}</div></div>` : ""}
        </div>
      </div>` : ""}

      <div class="section">${facts()}</div>
      <p class="hint">${icon("help", "i--sm")}Нужно что-то поменять — напиши организатору игры.</p>

      <button class="demo-link" id="demo-draw">Демо: показать, что будет после жеребьёвки</button>
    `);
    document.getElementById("demo-draw").onclick = () => goStep("reveal");
    if (inTelegram) setMain("Закрыть", () => tg.close()); else hideMain();
  }

  /* =======================================================
     4. Жеребьёвка — подарок поступает по газопроводу
     ======================================================= */
  function renderReveal() {
    const r = G.demoRecipient;
    mount(`
      ${masthead()}
      ${stepper(3, "Кому ты даришь")}
      <div class="draw">
        <h1>Жеребьёвка прошла!</h1>
        <p class="lead" style="text-align:center">Нажми кнопку внизу — узнаешь, кому даришь подарок.</p>
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

  function confetti() {
    const box = document.createElement("div");
    box.className = "confetti";
    const colors = ["#b3261e", "#ecd9a8", "#f3f4f8", "#2a3d72", "#d23a2f"];
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
    const r = G.demoRecipient;
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
          ${r.notWanted ? `<div class="kv"><div class="kv__k" style="color:var(--red)">${icon("ban", "i--sm")}Не дарить</div><div class="kv__v">${esc(r.notWanted)}</div></div>` : ""}
        </div>
      </div>
      <div class="section">${facts()}</div>
      <div class="section note">${icon("secret")}<div><b>Это секрет.</b> Никому не говори, кому даришь подарок.</div></div>`;
  }

  function renderRecipient() {
    mount(`${masthead()}${stepper(3, "Твой подопечный")}<h1 class="screen-title">Время выбирать подарок!</h1>${recipientCard()}`);
    setMain("Подарок куплен!", () =>
      confirmDialog("Отметить, что подарок куплен?", () => { haptic("success"); goStep("done"); }));
  }

  /* =======================================================
     6. Готово
     ======================================================= */
  function renderDone() {
    mount(`
      ${masthead()}
      <div class="bigstate">
        <div class="bigstate__ic">${icon("gift")}</div>
        <h1>Ура! Подарок готов!</h1>
        <p class="lead">Ты молодец! Осталось вручить его <b>${fmtDate(G.exchangeDate)}</b> ${G.place}. Не забудь упаковать и подписать имя получателя.</p>
      </div>
      ${recipientCard()}
    `);
    if (inTelegram) setMain("Закрыть", () => tg.close()); else hideMain();
  }

  /* ---------- Отрисовка по шагу ---------- */
  const screens = { welcome: renderWelcome, wishlist: renderWishlist, waiting: renderWaiting, reveal: renderReveal, recipient: renderRecipient, done: renderDone };
  function render() { hideMain(); (screens[state.step] || renderWelcome)(); }

  /* ---------- Снегопад ---------- */
  (function snowfall() {
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = document.createElement("div");
    box.className = "snowfall";
    box.setAttribute("aria-hidden", "true");
    const n = window.innerWidth < 600 ? 46 : 70;
    for (let i = 0; i < n; i++) {
      const f = document.createElement("i");
      const size = 2 + Math.random() * 4.5, dur = 8 + Math.random() * 10;
      f.style.cssText = `left:${Math.random() * 100}%;width:${size}px;height:${size}px;` +
        `opacity:${.35 + Math.random() * .55};animation-duration:${dur}s;animation-delay:${-Math.random() * dur}s;` +
        `--dx:${(Math.random() * 80 - 40).toFixed(0)}px;--y:${(Math.random() * 100).toFixed(1)}%;` +
        (size > 5 ? "filter:blur(1px);" : "");
      box.appendChild(f);
    }
    document.body.appendChild(box);
  })();

  /* демо-просмотр конкретного шага: ?step=wishlist и т. п. */
  const forced = new URLSearchParams(location.search).get("step");
  if (forced && screens[forced]) state.step = forced;
  render();
})();
