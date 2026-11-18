/* =========================================================
   Тайный Санта × Р-СТРОЙ — Telegram Mini App
   Верстка + демо-логика (данные в js/data.js)
   ========================================================= */
(() => {
  "use strict";

  const tg = window.Telegram && window.Telegram.WebApp;
  const inTelegram = !!(tg && tg.initData);
  const state = JSON.parse(JSON.stringify(window.MOCK));
  const { icon, hero, crane } = window.ART;
  const $app = document.getElementById("app");
  const BRAND = { navy: "#111b3a", red: "#b3261e" };

  /* ---------- Telegram: инициализация ---------- */
  if (inTelegram) {
    tg.ready();
    tg.expand();
    try {
      tg.setHeaderColor(BRAND.navy);
      tg.setBackgroundColor(BRAND.navy);
      tg.setBottomBarColor && tg.setBottomBarColor(BRAND.navy);
    } catch (e) { /* старые клиенты */ }
    const u = tg.initDataUnsafe && tg.initDataUnsafe.user;
    if (u) { state.me.first_name = u.first_name; state.me.photo = u.photo_url; }
  }

  /* ---------- Утилиты ---------- */
  const esc = (s = "") => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const initials = name => name.split(/\s+/).map(p => p[0]).join("").slice(0, 2).toUpperCase();
  const fmtDate = iso => new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
  const fmtShort = iso => new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short" }).replace(".", "");
  const fmtMoney = (n, cur) => `${Number(n).toLocaleString("ru-RU")} ${cur}`;
  const daysLeft = iso => Math.max(0, Math.ceil((new Date(iso) - new Date()) / 864e5));
  const plural = (n, f) => f[(n % 10 === 1 && n % 100 !== 11) ? 0 : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) ? 1 : 2];
  const getGame = id => state.games.find(g => g.id === id);
  const code = id => id.replace("g_", "");
  const avatar = (p, size = "") =>
    `<div class="avatar ${size}" style="background:${p.color || "var(--navy-2)"}">${p.photo ? `<img src="${esc(p.photo)}" alt="">` : esc(initials(p.name || p.first_name))}</div>`;
  const coverClass = (c, base) => (c === "red" ? `${base}--red` : c === "champ" ? `${base}--champ` : "");

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
    toast.t = setTimeout(() => el.classList.remove("is-visible"), 2200);
  };
  const confirmDialog = (text, cb) => {
    if (inTelegram && tg.showConfirm) tg.showConfirm(text, ok => ok && cb());
    else if (window.confirm(text)) cb();
  };

  /* ---------- MainButton / BackButton (с фолбэком вне Telegram) ---------- */
  let mainHandler = null;
  const fbMain = document.getElementById("fallback-main");
  const fbMainBtn = document.getElementById("fallback-main-btn");
  const fbBack = document.getElementById("fallback-back");

  function setMain(text, handler) {
    if (mainHandler && inTelegram) tg.MainButton.offClick(mainHandler);
    mainHandler = () => { haptic("medium"); handler(); };
    if (inTelegram) {
      tg.MainButton.setParams({ text, color: BRAND.red, text_color: "#ffffff", is_visible: true, is_active: true });
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
  function setBack(visible) {
    if (inTelegram) visible ? tg.BackButton.show() : tg.BackButton.hide();
    else { fbBack.hidden = !visible; document.body.classList.toggle("has-fallback-back", visible); }
  }
  const goBack = () => (history.length > 1 ? history.back() : go(""));
  if (inTelegram) tg.BackButton.onClick(goBack);
  fbBack.addEventListener("click", goBack);

  /* ---------- Роутер ---------- */
  const go = path => { location.hash = "#/" + path; };
  const routes = {
    "": renderHome, create: renderCreate, invite: renderInvite, game: renderGame,
    wishlist: renderWishlist, exclusions: renderExclusions, draw: renderDraw,
    recipient: renderRecipient, chat: renderChat
  };
  function router() {
    const [name = "", param] = location.hash.replace(/^#\/?/, "").split("/");
    hideMain();
    setBack(name !== "");
    window.scrollTo(0, 0);
    (routes[name] || renderHome)(param);
  }
  window.addEventListener("hashchange", router);
  $app.addEventListener("click", e => {
    const t = e.target.closest("[data-go]");
    if (t) { haptic("light"); go(t.dataset.go); }
  });
  const mount = html => { $app.innerHTML = `<section class="screen">${html}</section>`; };

  const masthead = (right = "Зима 2027") => `
    <div class="masthead">
      <b>Р-СТРОЙ</b><span class="masthead__dot"></span><span>Тайный Санта</span><span class="masthead__dot"></span><span>${right}</span>
    </div>`;

  const listItem = ({ go: to, id, ic, red, title, sub, chev = true }) => `
    <button class="list__item" ${to ? `data-go="${to}"` : ""} ${id ? `id="${id}"` : ""}>
      <span class="list__icon ${red ? "list__icon--red" : ""}">${icon(ic)}</span>
      <span class="list__body"><span class="list__title" style="display:block">${title}</span>${sub ? `<span class="list__sub">${sub}</span>` : ""}</span>
      ${chev ? `<span class="chev">${icon("chev", "i--sm")}</span>` : ""}
    </button>`;

  /* =======================================================
     1. Главная
     ======================================================= */
  function renderHome() {
    const status = g => ({
      registration: `Жеребьёвка ${fmtShort(g.drawDate)}`,
      drawn: "Подопечный известен",
      finished: "Завершена"
    }[g.status]);

    mount(`
      ${masthead()}
      <div class="title-block">
        <span class="title-block__script script">Тайный</span>
        <div class="title-block__wide">Санта</div>
        <div class="title-block__note">Строим<br>праздник<br>вместе</div>
      </div>

      <div class="scene">
        ${hero}
        <div class="scene__corner"></div>
      </div>

      <div class="section">
        <div class="section__head">
          <span class="section__title">Мои игры</span>
          <span class="hello"><span class="hello__text">Привет, <b>${esc(state.me.first_name)}</b></span>${avatar({ ...state.me, name: state.me.first_name }, "avatar--sm")}</span>
        </div>
        ${state.games.length ? state.games.map(g => `
          <button class="ticket ${coverClass(g.cover, "ticket")}" data-go="${g.status === "drawn" ? "recipient" : "game"}/${g.id}">
            <div class="ticket__top">
              <span class="badge ${g.status === "drawn" ? "badge--champ" : ""}">${g.isOwner ? icon("crown", "i--sm") : ""}${status(g)}</span>
              <span class="ticket__code">№ ${code(g.id)}</span>
            </div>
            <div class="ticket__title">${esc(g.title)}</div>
            <div class="ticket__meta">
              <span>${icon("wallet", "i--sm")}до ${fmtMoney(g.budget, g.currency)}</span>
              <span>${icon("users", "i--sm")}${g.participants.length}</span>
              <span>${icon("gift", "i--sm")}${fmtShort(g.exchangeDate)}</span>
            </div>
          </button>`).join("") : `
          <div class="paper empty">
            <h2 style="color:var(--ink)">Пока нет игр</h2>
            <p>Создайте игру и пригласите коллег или вступите по ссылке</p>
          </div>`}
      </div>

      <div class="section">
        <div class="section__head"><span class="section__title">Вступить по коду</span></div>
        <div class="input-group">
          <input class="input input--dark" id="join-code" placeholder="Например, FAM" maxlength="12" autocapitalize="characters" />
          <button class="btn btn--outline" id="join-btn">Найти</button>
        </div>
      </div>

      <div class="section paper">
        ${listItem({ go: "invite", ic: "link", title: "Демо: приглашение", sub: "Как выглядит вход по ссылке" })}
        ${listItem({ id: "how-btn", ic: "help", title: "Как это работает", sub: "Правила в трёх шагах" })}
      </div>
    `);

    document.getElementById("join-btn").onclick = () => go("invite");
    document.getElementById("how-btn").onclick = () => {
      const text = "1. Организатор создаёт игру и делится ссылкой.\n2. Участники заполняют вишлисты.\n3. После жеребьёвки каждый узнаёт, кому дарит подарок.";
      inTelegram ? tg.showAlert(text) : alert(text);
    };
    setMain("Создать игру", () => go("create"));
  }

  /* =======================================================
     2. Создание игры
     ======================================================= */
  function renderCreate() {
    const iso = d => d.toISOString().slice(0, 10);
    const d1 = new Date(); d1.setDate(d1.getDate() + 14);
    const d2 = new Date(); d2.setDate(d2.getDate() + 30);

    mount(`
      ${masthead("Новая игра")}
      <h1>Новая <span class="script" style="font-size:34px">игра</span></h1>
      <p class="muted" style="margin:6px 0 0">Основное — сейчас, остальное можно изменить позже</p>

      <div class="section">
        <div class="section__head"><span class="section__title">Основное</span></div>
        <div class="paper paper--pad">
          <label class="field">
            <span class="field__label">Название</span>
            <input class="input" id="f-title" placeholder="Например, Новый год в ПТО" maxlength="60" />
          </label>
          <div class="field">
            <span class="field__label">Обложка</span>
            <div class="cover-pick">
              <label><input type="radio" name="cover" value="navy" checked><span class="c-navy" aria-label="Синяя"></span></label>
              <label><input type="radio" name="cover" value="red"><span class="c-red" aria-label="Красная"></span></label>
              <label><input type="radio" name="cover" value="champ"><span class="c-champ" aria-label="Шампань"></span></label>
            </div>
          </div>
          <label class="field">
            <span class="field__label">Бюджет подарка</span>
            <div class="input-group">
              <input class="input" id="f-budget" type="number" inputmode="numeric" placeholder="3 000" />
              <select class="select" id="f-cur"><option>₽</option><option>$</option><option>€</option></select>
            </div>
          </label>
        </div>
      </div>

      <div class="section">
        <div class="section__head"><span class="section__title">Сроки и формат</span></div>
        <div class="paper paper--pad">
          <div class="row">
            <label class="field"><span class="field__label">Жеребьёвка</span><input class="input" id="f-draw" type="date" value="${iso(d1)}" /></label>
            <label class="field"><span class="field__label">Обмен</span><input class="input" id="f-exchange" type="date" value="${iso(d2)}" /></label>
          </div>
          <div class="field">
            <span class="field__label">Формат</span>
            <div class="segmented">
              <label><input type="radio" name="format" value="offline" checked><span>${icon("users", "i--sm")}Встреча</span></label>
              <label><input type="radio" name="format" value="delivery"><span>${icon("box", "i--sm")}Доставка</span></label>
            </div>
          </div>
          <label class="field">
            <span class="field__label">Правила (необязательно)</span>
            <textarea class="textarea" id="f-rules" placeholder="Например: упаковка обязательна"></textarea>
          </label>
        </div>
      </div>

      <div class="section">
        <div class="section__head"><span class="section__title">Настройки</span></div>
        <div class="paper">
          <div class="switch-row">
            <div><div class="list__title">Я тоже участвую</div><div class="list__sub">Организатор получит подопечного</div></div>
            <label class="switch"><input type="checkbox" checked><span></span></label>
          </div>
          <div class="switch-row">
            <div><div class="list__title">Анонимный чат</div><div class="list__sub">Санта может задавать вопросы</div></div>
            <label class="switch"><input type="checkbox" checked><span></span></label>
          </div>
          <div class="switch-row">
            <div><div class="list__title">Вишлист обязателен</div><div class="list__sub">Без него нельзя провести жеребьёвку</div></div>
            <label class="switch"><input type="checkbox"><span></span></label>
          </div>
        </div>
      </div>
    `);

    setMain("Создать игру", () => {
      const title = document.getElementById("f-title").value.trim();
      const budget = +document.getElementById("f-budget").value;
      if (!title) { haptic("error"); toast("Введите название игры"); return; }
      if (!budget) { haptic("error"); toast("Укажите бюджет"); return; }
      const id = "g_" + Math.random().toString(36).slice(2, 6).toUpperCase();
      state.games.unshift({
        id, title, budget,
        cover: document.querySelector("[name=cover]:checked").value,
        currency: document.getElementById("f-cur").value,
        drawDate: document.getElementById("f-draw").value,
        exchangeDate: document.getElementById("f-exchange").value,
        format: document.querySelector("[name=format]:checked").value,
        rules: document.getElementById("f-rules").value.trim(),
        isOwner: true, status: "registration", anonChat: true,
        participants: [{ id: 1, name: state.me.first_name, color: state.me.color, wishlist: false }],
        exclusions: []
      });
      haptic("success");
      history.replaceState(null, "", "#/");
      go("game/" + id);
      toast("Игра создана — пригласите участников");
    });
  }

  /* =======================================================
     3. Приглашение (вход по ссылке startapp)
     ======================================================= */
  function renderInvite() {
    const g = state.invite;
    if (!g) { toast("Вы уже в этой игре"); return go(""); }
    mount(`
      ${masthead("Приглашение")}
      <div class="doc-head ${coverClass(g.cover, "doc-head")}">
        <div class="eyebrow">Официальное приглашение</div>
        <h1>${esc(g.title)}</h1>
        <span class="script">от ${esc(g.owner)}</span>
      </div>

      <div class="tiles">
        <div class="tile"><div class="tile__label">Бюджет</div><div class="tile__value">${fmtMoney(g.budget, g.currency)}</div></div>
        <div class="tile"><div class="tile__label">Участники</div><div class="tile__value">${g.count}</div></div>
        <div class="tile tile--navy"><div class="tile__label">До жеребьёвки</div><div class="tile__value">${daysLeft(g.drawDate)} ${plural(daysLeft(g.drawDate), ["день", "дня", "дней"])}</div></div>
      </div>

      <div class="section paper">
        <div class="kv"><div class="kv__k">${icon("shuffle", "i--sm")}Жеребьёвка</div><div class="kv__v">${fmtDate(g.drawDate)}</div></div>
        <div class="kv"><div class="kv__k">${icon("gift", "i--sm")}Обмен подарками</div><div class="kv__v">${fmtDate(g.exchangeDate)}</div></div>
      </div>

      <div class="section note">${icon("secret")}<div>Никто, кроме вас, не узнает, кому вы дарите подарок. Организатор тоже не видит пары.</div></div>
    `);

    setMain("Участвую", () => {
      const names = ["Никита Р.", "Аня Л.", "Петя М.", "Света Г.", "Дима Ф.", "Лена Ж.", "Костя Б.", "Юля Т."];
      const colors = ["#b3261e", "#2a3d72", "#8a6d2b", "#3b5b8f"];
      state.games.push({
        id: g.id, title: g.title, cover: g.cover,
        budget: g.budget, currency: g.currency, drawDate: g.drawDate, exchangeDate: g.exchangeDate,
        format: "offline", rules: "", isOwner: false, status: "registration", anonChat: true,
        participants: names.slice(0, g.count).map((name, i) => ({ id: 100 + i, name, color: colors[i % 4], wishlist: i % 3 !== 0 }))
          .concat([{ id: 1, name: state.me.first_name, color: state.me.color, wishlist: false }]),
        exclusions: []
      });
      state.invite = null;
      haptic("success");
      history.replaceState(null, "", "#/");
      go("wishlist/" + g.id);
      toast("Вы в игре! Заполните вишлист");
    });
  }

  /* =======================================================
     4. Экран игры (до жеребьёвки)
     ======================================================= */
  function renderGame(id) {
    const g = getGame(id);
    if (!g) return go("");
    if (g.status === "drawn") return go("recipient/" + id);

    const me = g.participants.find(p => p.id === 1);
    const filled = g.participants.filter(p => p.wishlist).length;
    const link = `https://t.me/secret_santa_bot/app?startapp=${g.id}`;

    mount(`
      ${masthead("№ " + code(g.id))}
      <div class="doc-head ${coverClass(g.cover, "doc-head")}">
        <div class="eyebrow">${g.isOwner ? "Вы — организатор" : "Участник игры"}</div>
        <h1>${esc(g.title)}</h1>
        <span class="script">${g.format === "delivery" ? "подарки — доставкой" : "обмен на встрече"}</span>
      </div>

      <div class="tiles">
        <div class="tile"><div class="tile__label">Бюджет</div><div class="tile__value">${fmtMoney(g.budget, g.currency)}</div></div>
        <div class="tile"><div class="tile__label">Жеребьёвка</div><div class="tile__value">${fmtShort(g.drawDate)}</div></div>
        <div class="tile tile--navy"><div class="tile__label">Обмен</div><div class="tile__value">${fmtShort(g.exchangeDate)}</div></div>
      </div>

      ${me && !me.wishlist ? `
      <div class="section">
        <button class="callout" data-go="wishlist/${g.id}">
          ${icon("list")}<span style="flex:1"><b>Заполните вишлист</b><span class="small">Так Санте будет проще выбрать подарок</span></span>${icon("chev", "i--sm")}
        </button>
      </div>` : ""}

      <div class="section">
        <div class="section__head"><span class="section__title">Приглашение</span></div>
        <div class="paper invite">
          <div class="invite__body">
            <div class="invite__code">${code(g.id)}</div>
            <div class="invite__link">${link}</div>
          </div>
          <button class="btn btn--soft btn--icon" id="copy-btn" aria-label="Копировать ссылку">${icon("copy")}</button>
          <button class="btn btn--navy btn--sm" id="share-btn">${icon("send", "i--sm")}Позвать</button>
        </div>
      </div>

      <div class="section">
        <div class="section__head">
          <span class="section__title">Участники · ${g.participants.length}</span>
          <span class="section__aside">вишлисты ${filled}/${g.participants.length}</span>
        </div>
        <div class="progress"><span style="width:${filled / g.participants.length * 100}%"></span></div>
        <div class="paper">
          ${g.participants.map(p => `
            <div class="list__item" style="cursor:default">
              ${avatar(p, "avatar--sm")}
              <div class="list__body"><div class="list__title">${esc(p.name)}${p.id === 1 ? " · вы" : ""}</div></div>
              ${p.wishlist ? `<span class="tag tag--ok">${icon("check", "i--sm")}вишлист</span>` : `<span class="tag tag--warn">нет вишлиста</span>`}
            </div>`).join("")}
        </div>
      </div>

      <div class="section paper">
        ${listItem({ go: "wishlist/" + g.id, ic: "list", title: "Мой вишлист" })}
        ${g.isOwner ? `
          ${listItem({ go: "exclusions/" + g.id, ic: "ban", red: true, title: "Исключения", sub: g.exclusions.length ? `${g.exclusions.length} ${plural(g.exclusions.length, ["пара", "пары", "пар"])}` : "Кто не дарит друг другу" })}
          ${listItem({ id: "remind-btn", ic: "bell", title: "Напомнить про вишлисты", sub: "Бот напишет тем, кто не заполнил", chev: false })}` : ""}
      </div>

      ${g.rules ? `
      <div class="section">
        <div class="section__head"><span class="section__title">Правила</span></div>
        <div class="paper paper--pad">${esc(g.rules)}</div>
      </div>` : ""}

      <div class="section center">
        <button class="btn btn--text" id="leave-btn">${g.isOwner ? "Удалить игру" : "Выйти из игры"}</button>
      </div>
    `);

    document.getElementById("copy-btn").onclick = () => {
      navigator.clipboard && navigator.clipboard.writeText(link);
      haptic("success"); toast("Ссылка скопирована");
    };
    document.getElementById("share-btn").onclick = () => {
      const url = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(`Присоединяйся к Тайному Санте «${g.title}»`)}`;
      inTelegram ? tg.openTelegramLink(url) : window.open(url, "_blank");
    };
    const remind = document.getElementById("remind-btn");
    if (remind) remind.onclick = () => { haptic("success"); toast("Напоминание отправлено"); };
    document.getElementById("leave-btn").onclick = () =>
      confirmDialog(g.isOwner ? "Удалить игру для всех участников?" : "Выйти из игры?", () => {
        state.games = state.games.filter(x => x.id !== g.id);
        go("");
      });

    if (g.isOwner) {
      setMain(`Провести жеребьёвку · ${g.participants.length}`, () => {
        if (g.participants.length < 3) { haptic("error"); toast("Нужно минимум 3 участника"); return; }
        confirmDialog("Провести жеребьёвку сейчас? После этого нельзя добавить участников.", () => go("draw/" + g.id));
      });
    }
  }

  /* =======================================================
     5. Вишлист
     ======================================================= */
  function renderWishlist(id) {
    const w = state.myWishlist;
    const draw = () => {
      document.getElementById("wishes").innerHTML = w.wishes.length ? w.wishes.map((x, i) => `
        <div class="wish">
          <div class="wish__num">${String(i + 1).padStart(2, "0")}</div>
          <div class="wish__body">
            <div>${esc(x.text)}</div>
            ${x.link ? `<a class="wish__link" href="${esc(x.link)}" target="_blank" rel="noopener">${icon("ext", "i--sm")}${esc(x.link.replace(/^https?:\/\/(www\.)?/, ""))}</a>` : ""}
          </div>
          <button class="icon-btn" data-del="${i}" aria-label="Удалить">${icon("x", "i--sm")}</button>
        </div>`).join("") : `<div class="empty">Добавьте хотя бы одно желание</div>`;
    };

    mount(`
      ${masthead("Вишлист")}
      <h1>Мой <span class="script" style="font-size:34px">вишлист</span></h1>
      <p class="muted" style="margin:6px 0 0">Его увидит только ваш Тайный Санта</p>

      <div class="section">
        <div class="section__head"><span class="section__title">Хочу получить</span></div>
        <div class="paper" id="wishes"></div>
        <div class="paper paper--pad" style="margin-top:10px">
          <input class="input" id="w-text" placeholder="Что бы вы хотели?" style="margin-bottom:8px" />
          <div class="input-group">
            <input class="input" id="w-link" placeholder="Ссылка (необязательно)" />
            <button class="btn btn--primary btn--icon" id="w-add" aria-label="Добавить">${icon("plus")}</button>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section__head"><span class="section__title">Подсказки Санте</span></div>
        <div class="paper paper--pad">
          <label class="field">
            <span class="field__label">Не дарите мне</span>
            <textarea class="textarea" id="w-not" placeholder="Аллергии, то, что уже есть">${esc(w.notWanted)}</textarea>
          </label>
          <label class="field">
            <span class="field__label">Мне нравится</span>
            <textarea class="textarea" id="w-hints" placeholder="Размер, любимые цвета, хобби">${esc(w.hints)}</textarea>
          </label>
        </div>
      </div>
    `);
    draw();

    document.getElementById("w-add").onclick = () => {
      const text = document.getElementById("w-text").value.trim();
      const link = document.getElementById("w-link").value.trim();
      if (!text) { haptic("error"); toast("Опишите желание"); return; }
      w.wishes.push(link ? { text, link } : { text });
      document.getElementById("w-text").value = "";
      document.getElementById("w-link").value = "";
      haptic("light"); draw();
    };
    document.getElementById("wishes").addEventListener("click", e => {
      const b = e.target.closest("[data-del]");
      if (b) { w.wishes.splice(+b.dataset.del, 1); haptic("light"); draw(); }
    });

    setMain("Сохранить вишлист", () => {
      w.notWanted = document.getElementById("w-not").value;
      w.hints = document.getElementById("w-hints").value;
      const g = getGame(id);
      if (g) { const me = g.participants.find(p => p.id === 1); if (me) me.wishlist = w.wishes.length > 0; }
      if (inTelegram && tg.CloudStorage) tg.CloudStorage.setItem("wishlist", JSON.stringify(w));
      haptic("success"); toast("Вишлист сохранён");
      g && g.status !== "drawn" ? go("game/" + id) : goBack();
    });
  }

  /* =======================================================
     6. Исключения
     ======================================================= */
  function renderExclusions(id) {
    const g = getGame(id);
    if (!g) return go("");
    const byId = pid => g.participants.find(p => p.id === pid);
    const opts = g.participants.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join("");

    const draw = () => {
      document.getElementById("pairs").innerHTML = g.exclusions.length ? g.exclusions.map(([a, b], i) => `
        <div class="pair">
          ${avatar(byId(a), "avatar--sm")}<span class="pair__name">${esc(byId(a).name)}</span>
          <span class="pair__x">${icon("ban", "i--sm")}</span>
          ${avatar(byId(b), "avatar--sm")}<span class="pair__name">${esc(byId(b).name)}</span>
          <button class="icon-btn" data-del="${i}" aria-label="Удалить">${icon("trash", "i--sm")}</button>
        </div>`).join("") : `<div class="empty">Исключений нет — все могут выпасть всем</div>`;
    };

    mount(`
      ${masthead("Исключения")}
      <h1>Исключения</h1>
      <p class="muted" style="margin:6px 0 0">Эти участники не станут Сантами друг для друга — например, супруги или коллеги из одного кабинета</p>

      <div class="section">
        <div class="section__head"><span class="section__title">Пары</span></div>
        <div class="paper" id="pairs"></div>
      </div>

      <div class="section">
        <div class="section__head"><span class="section__title">Добавить пару</span></div>
        <div class="paper paper--pad">
          <div class="row" style="margin-bottom:10px">
            <select class="select" id="ex-a">${opts}</select>
            <select class="select" id="ex-b">${opts}</select>
          </div>
          <button class="btn btn--navy btn--block" id="ex-add">${icon("plus", "i--sm")}Добавить</button>
        </div>
      </div>
    `);
    document.getElementById("ex-b").selectedIndex = 1;
    draw();

    document.getElementById("ex-add").onclick = () => {
      const a = +document.getElementById("ex-a").value, b = +document.getElementById("ex-b").value;
      if (a === b) { haptic("error"); toast("Выберите двух разных участников"); return; }
      if (g.exclusions.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) { toast("Такая пара уже есть"); return; }
      g.exclusions.push([a, b]); haptic("light"); draw();
    };
    document.getElementById("pairs").addEventListener("click", e => {
      const btn = e.target.closest("[data-del]");
      if (btn) { g.exclusions.splice(+btn.dataset.del, 1); draw(); }
    });

    setMain("Готово", goBack);
  }

  /* =======================================================
     7. Жеребьёвка — кран опускает подарок
     ======================================================= */
  function renderDraw(id) {
    const g = getGame(id);
    if (!g) return go("");
    const candidates = g.participants.filter(p => p.id !== 1);
    const rec = candidates[Math.floor(Math.random() * candidates.length)];

    mount(`
      <div class="draw">
        <div class="eyebrow">Жеребьёвка проведена</div>
        <h1 style="margin-top:8px">Ваш подарок</h1>
        <span class="script">уже на подъёме</span>

        <div class="crane-stage">
          ${crane}
          <div class="cable"></div>
          <div class="gift-box" id="gift" role="button" tabindex="0" aria-label="Открыть подарок">
            <div class="gift-box__inner">
              <div class="gift-box__face"><span class="gift-box__tag">НАЖМИТЕ</span><span class="gift-box__corner"></span></div>
              <div class="gift-box__back">
                <div class="small muted" style="font-weight:700;letter-spacing:.1em;text-transform:uppercase;font-size:10px">Вы — Санта для</div>
                <div style="margin-top:12px">${avatar(rec, "avatar--sm")}</div>
                <h2>${esc(rec.name)}</h2>
              </div>
            </div>
          </div>
          <div class="tap-hint" id="draw-hint">Все участники получили уведомление от бота</div>
        </div>
      </div>
    `);

    const gift = document.getElementById("gift");
    const open = () => {
      if (gift.classList.contains("is-open")) return;
      gift.classList.add("is-open");
      document.getElementById("draw-hint").textContent = "Никому не говорите — это секрет";
      haptic("success");
      confetti();
      Object.assign(g, {
        status: "drawn", giftStatus: 0,
        recipient: {
          ...rec,
          wishes: [{ text: "Хорошая книга по истории архитектуры" }, { text: "Термокружка для объекта", link: "https://market.yandex.ru" }],
          notWanted: "Ничего с резким запахом",
          hints: "Любит путешествовать и фотографировать"
        }
      });
      setMain("Посмотреть вишлист", () => { history.replaceState(null, "", "#/"); go("recipient/" + g.id); });
    };
    gift.addEventListener("click", open);
    gift.addEventListener("keydown", e => (e.key === "Enter" || e.key === " ") && open());
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
     8. Подопечный
     ======================================================= */
  function renderRecipient(id) {
    const g = getGame(id);
    if (!g || !g.recipient) return go("");
    const r = g.recipient;
    const steps = [["bag", "Куплен"], ["box", "Отправлен"], ["spark", "Получен"]];
    const left = daysLeft(g.exchangeDate);

    mount(`
      ${masthead("№ " + code(g.id))}
      <div class="doc-head ${coverClass(g.cover, "doc-head")} recipient">
        <div class="eyebrow">${esc(g.title)}</div>
        ${avatar(r, "avatar--lg")}
        <div class="eyebrow" style="letter-spacing:.14em">Вы — Тайный Санта для</div>
        <h1 style="max-width:none;margin-top:6px">${esc(r.name)}</h1>
        <div class="recipient__tags">
          <span class="badge">${icon("wallet", "i--sm")}до ${fmtMoney(g.budget, g.currency)}</span>
          <span class="badge">${icon("calendar", "i--sm")}${fmtShort(g.exchangeDate)}</span>
          <span class="badge badge--champ">${left} ${plural(left, ["день", "дня", "дней"])}</span>
        </div>
      </div>

      <div class="section">
        <div class="section__head"><span class="section__title">Статус подарка</span></div>
        <div class="paper steps">
          ${steps.map(([ic, label], i) => `
            <div class="step ${g.giftStatus > i ? "is-done" : ""}">
              <div class="step__dot">${icon(g.giftStatus > i ? "check" : ic, "i--sm")}</div>${label}
            </div>`).join("")}
        </div>
      </div>

      <div class="section">
        <div class="section__head"><span class="section__title">Вишлист</span><span class="section__aside">${r.wishes.length} ${plural(r.wishes.length, ["желание", "желания", "желаний"])}</span></div>
        <div class="paper">
          ${r.wishes.map((x, i) => `
            <div class="wish">
              <div class="wish__num">${String(i + 1).padStart(2, "0")}</div>
              <div class="wish__body">
                <div>${esc(x.text)}</div>
                ${x.link ? `<a class="wish__link" href="${esc(x.link)}" target="_blank" rel="noopener">${icon("ext", "i--sm")}${esc(x.link.replace(/^https?:\/\/(www\.)?/, ""))}</a>` : ""}
              </div>
            </div>`).join("")}
        </div>
        ${r.notWanted || r.hints ? `
        <div class="paper" style="margin-top:10px">
          ${r.notWanted ? `<div class="kv"><div class="kv__k" style="color:var(--red)">${icon("ban", "i--sm")}Не дарить</div><div class="kv__v">${esc(r.notWanted)}</div></div>` : ""}
          ${r.hints ? `<div class="kv"><div class="kv__k">${icon("bulb", "i--sm")}Подсказки</div><div class="kv__v">${esc(r.hints)}</div></div>` : ""}
        </div>` : ""}
      </div>

      <div class="section paper">
        ${g.anonChat ? listItem({ go: "chat/" + g.id, ic: "secret", red: true, title: "Анонимный вопрос", sub: `${esc(r.name)} не узнает, кто спрашивает` }) : ""}
        ${listItem({ go: "wishlist/" + g.id, ic: "list", title: "Мой вишлист", sub: "Его видит ваш Санта" })}
      </div>
    `);

    const next = ["Подарок куплен", "Подарок отправлен", null][Math.min(g.giftStatus, 2)];
    if (next) setMain(next, () => { g.giftStatus++; haptic("success"); renderRecipient(id); });
  }

  /* =======================================================
     9. Анонимный чат
     ======================================================= */
  function renderChat(id) {
    const g = getGame(id);
    if (!g || !g.recipient) return go("");
    const drawMsgs = () => {
      document.getElementById("chat").innerHTML = state.chat.map(m => `
        <div class="msg ${m.from === "santa" ? "msg--out" : "msg--in"}">${esc(m.text)}<div class="msg__meta">${m.time}</div></div>`).join("");
      window.scrollTo(0, document.body.scrollHeight);
    };

    mount(`
      <div class="chat-head">
        ${avatar(g.recipient, "avatar--sm")}
        <div style="flex:1"><h3>${esc(g.recipient.name)}</h3><div class="small muted">вы пишете как <span class="script" style="font-size:16px">Тайный Санта</span></div></div>
      </div>
      <p class="chat-note">${icon("secret", "i--sm")}Сообщения доставляет бот, ваше имя скрыто</p>
      <div class="chat" id="chat"></div>
      <form class="composer" id="composer">
        <div class="composer__inner">
          <input class="input input--dark" id="msg" placeholder="Спросите о вкусах…" autocomplete="off" />
          <button class="btn btn--primary btn--icon" aria-label="Отправить">${icon("send")}</button>
        </div>
      </form>
    `);
    drawMsgs();

    document.getElementById("composer").addEventListener("submit", e => {
      e.preventDefault();
      const input = document.getElementById("msg");
      const text = input.value.trim();
      if (!text) return;
      state.chat.push({ from: "santa", text, time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }) });
      input.value = "";
      haptic("light");
      drawMsgs();
    });
  }

  /* ---------- Старт: учитываем start_param из ссылки ---------- */
  const startParam = inTelegram && tg.initDataUnsafe && tg.initDataUnsafe.start_param;
  if (startParam && !getGame(startParam)) location.hash = "#/invite";
  router();
})();
