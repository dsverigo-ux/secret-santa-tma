/* =========================================================
   Тайный Санта — Telegram Mini App (верстка + демо-логика)
   ========================================================= */
(() => {
  "use strict";

  const tg = window.Telegram && window.Telegram.WebApp;
  const inTelegram = !!(tg && tg.initData);
  const state = JSON.parse(JSON.stringify(window.MOCK));
  const $app = document.getElementById("app");

  /* ---------- Telegram: инициализация ---------- */
  if (inTelegram) {
    document.documentElement.classList.add("tg");
    tg.ready();
    tg.expand();
    tg.setHeaderColor && tg.setHeaderColor("bg_color");
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
      const u = tg.initDataUnsafe.user;
      state.me.first_name = u.first_name;
      state.me.photo = u.photo_url;
    }
  }

  /* ---------- Утилиты ---------- */
  const esc = (s = "") => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const initials = name => name.split(/\s+/).map(p => p[0]).join("").slice(0, 2).toUpperCase();
  const fmtDate = iso => new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
  const fmtMoney = (n, cur) => `${Number(n).toLocaleString("ru-RU")} ${cur}`;
  const daysLeft = iso => Math.max(0, Math.ceil((new Date(iso) - new Date()) / 864e5));
  const plural = (n, f) => f[(n % 10 === 1 && n % 100 !== 11) ? 0 : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) ? 1 : 2];
  const getGame = id => state.games.find(g => g.id === id);
  const avatar = (p, size = "") =>
    `<div class="avatar ${size}" style="background:${p.color || "var(--pine)"}">${p.photo ? `<img src="${esc(p.photo)}" alt="">` : esc(initials(p.name || p.first_name))}</div>`;

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
      tg.MainButton.setParams({ text, is_visible: true, is_active: true });
      tg.MainButton.onClick(mainHandler);
    } else {
      fbMainBtn.textContent = text;
      fbMainBtn.onclick = mainHandler;
      fbMain.hidden = false;
    }
  }
  function hideMain() {
    if (inTelegram) {
      if (mainHandler) tg.MainButton.offClick(mainHandler);
      tg.MainButton.hide();
    } else fbMain.hidden = true;
    mainHandler = null;
  }
  function setBack(visible) {
    if (inTelegram) visible ? tg.BackButton.show() : tg.BackButton.hide();
    else {
      fbBack.hidden = !visible;
      document.body.classList.toggle("has-fallback-back", visible);
    }
  }
  const goBack = () => (history.length > 1 ? history.back() : go(""));
  if (inTelegram) tg.BackButton.onClick(goBack);
  fbBack.addEventListener("click", goBack);

  /* ---------- Роутер ---------- */
  const go = path => { location.hash = "#/" + path; };
  const routes = {
    "": renderHome,
    create: renderCreate,
    invite: renderInvite,
    game: renderGame,
    wishlist: renderWishlist,
    exclusions: renderExclusions,
    draw: renderDraw,
    recipient: renderRecipient,
    chat: renderChat
  };

  function router() {
    const [name = "", param] = location.hash.replace(/^#\/?/, "").split("/");
    const view = routes[name] || renderHome;
    hideMain();
    setBack(name !== "");
    window.scrollTo(0, 0);
    view(param);
  }
  window.addEventListener("hashchange", router);

  // Делегирование кликов: data-go="route/param"
  $app.addEventListener("click", e => {
    const t = e.target.closest("[data-go]");
    if (t) { haptic("light"); go(t.dataset.go); }
  });

  const mount = html => { $app.innerHTML = `<section class="screen">${html}</section>`; };

  /* =======================================================
     1. Главная
     ======================================================= */
  function renderHome() {
    const statusLabel = g => ({
      registration: `Жеребьёвка ${fmtDate(g.drawDate)}`,
      drawn: "Подопечный выбран",
      finished: "Завершена"
    }[g.status]);

    mount(`
      <header class="hero">
        <div>
          <div class="hero__hello">Привет, ${esc(state.me.first_name)} 👋</div>
          <h1>Тайный Санта</h1>
        </div>
        ${avatar({ ...state.me, name: state.me.first_name })}
      </header>

      <div class="section">
        <div class="section__head"><span class="section__title">Мои игры</span></div>
        ${state.games.length ? state.games.map(g => `
          <button class="game-card ${g.theme ? "game-card--" + g.theme : ""}" data-emoji="${g.emoji}"
                  data-go="${g.status === "drawn" ? "recipient" : "game"}/${g.id}">
            <span class="chip chip--status">${g.isOwner ? "👑 Организатор · " : ""}${statusLabel(g)}</span>
            <div class="game-card__title">${esc(g.title)}</div>
            <div class="game-card__meta">
              <span class="chip">💰 до ${fmtMoney(g.budget, g.currency)}</span>
              <span class="chip">👥 ${g.participants.length}</span>
              <span class="chip">📅 ${fmtDate(g.exchangeDate)}</span>
            </div>
          </button>`).join("") : `
          <div class="card empty">
            <div class="empty__emoji">🎁</div>
            <h2>Пока нет игр</h2>
            <p class="muted">Создайте игру и пригласите друзей или вступите по ссылке</p>
          </div>`}
      </div>

      <div class="section">
        <div class="section__head"><span class="section__title">Вступить по коду</span></div>
        <div class="card">
          <div class="input-group">
            <input class="input" id="join-code" placeholder="Например, DRUZ" maxlength="12" autocapitalize="characters" />
            <button class="btn btn--ghost" id="join-btn">Найти</button>
          </div>
          <p class="small muted" style="margin:10px 4px 0">Или откройте ссылку-приглашение от организатора</p>
        </div>
      </div>

      <div class="section">
        <div class="list">
          <button class="list__item" data-go="invite">
            <span style="font-size:22px">✉️</span>
            <div class="list__body"><div class="list__title">Демо: экран приглашения</div><div class="list__sub">Как выглядит вход по ссылке</div></div>
            <span class="chev">›</span>
          </button>
          <button class="list__item" id="how-btn">
            <span style="font-size:22px">❓</span>
            <div class="list__body"><div class="list__title">Как это работает</div><div class="list__sub">Правила в трёх шагах</div></div>
            <span class="chev">›</span>
          </button>
        </div>
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
    const emojis = ["🎄", "🎅", "❄️", "🎁", "⛄", "🦌"];
    const today = new Date();
    const iso = d => d.toISOString().slice(0, 10);
    const d1 = new Date(today); d1.setDate(d1.getDate() + 14);
    const d2 = new Date(today); d2.setDate(d2.getDate() + 30);

    mount(`
      <h1>Новая игра</h1>
      <p class="muted">Заполните основное — остальное можно поменять позже</p>

      <div class="section">
        <label class="field">
          <span class="field__label">Название</span>
          <input class="input" id="f-title" placeholder="Например, Новый год в отделе" maxlength="60" />
        </label>

        <div class="field">
          <span class="field__label">Обложка</span>
          <div class="emoji-pick">
            ${emojis.map((e, i) => `<label><input type="radio" name="emoji" value="${e}" ${i ? "" : "checked"}><span>${e}</span></label>`).join("")}
          </div>
        </div>

        <label class="field">
          <span class="field__label">Бюджет подарка</span>
          <div class="input-group">
            <input class="input" id="f-budget" type="number" inputmode="numeric" placeholder="3000" />
            <select class="select" id="f-cur"><option>₽</option><option>$</option><option>€</option></select>
          </div>
        </label>

        <div class="row">
          <label class="field">
            <span class="field__label">Жеребьёвка</span>
            <input class="input" id="f-draw" type="date" value="${iso(d1)}" />
          </label>
          <label class="field">
            <span class="field__label">Обмен подарками</span>
            <input class="input" id="f-exchange" type="date" value="${iso(d2)}" />
          </label>
        </div>

        <div class="field">
          <span class="field__label">Формат</span>
          <div class="segmented">
            <label><input type="radio" name="format" value="offline" checked><span>🤝 Встреча</span></label>
            <label><input type="radio" name="format" value="delivery"><span>📦 Доставка</span></label>
          </div>
        </div>

        <label class="field">
          <span class="field__label">Правила и пожелания (необязательно)</span>
          <textarea class="textarea" id="f-rules" placeholder="Например: упаковка обязательна, без алкоголя"></textarea>
        </label>
      </div>

      <div class="section">
        <div class="section__head"><span class="section__title">Настройки</span></div>
        <div class="list">
          <div class="switch-row">
            <div><div class="list__title">Я тоже участвую</div><div class="list__sub">Организатор получит подопечного</div></div>
            <label class="switch"><input type="checkbox" checked><span></span></label>
          </div>
          <div class="switch-row">
            <div><div class="list__title">Анонимный чат</div><div class="list__sub">Санта может задавать вопросы подопечному</div></div>
            <label class="switch"><input type="checkbox" checked><span></span></label>
          </div>
          <div class="switch-row">
            <div><div class="list__title">Вишлист обязателен</div><div class="list__sub">Нельзя провести жеребьёвку без вишлистов</div></div>
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
      const id = "g_" + Math.random().toString(36).slice(2, 7).toUpperCase();
      state.games.unshift({
        id, title, budget,
        emoji: document.querySelector("[name=emoji]:checked").value,
        theme: "gold",
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
      toast("Игра создана 🎉 Пригласите участников");
    });
  }

  /* =======================================================
     3. Приглашение (вход по ссылке startapp)
     ======================================================= */
  function renderInvite() {
    const g = state.invite;
    if (!g) { toast("Вы уже в этой игре"); return go(""); }
    mount(`
      <div class="game-head">
        <div class="game-head__emoji">${g.emoji}</div>
        <p class="muted" style="margin:14px 0 4px">${esc(g.owner)} приглашает вас в игру</p>
        <h1>${esc(g.title)}</h1>
      </div>

      <div class="stats">
        <div class="stat"><div class="stat__value">${fmtMoney(g.budget, g.currency)}</div><div class="stat__label">бюджет</div></div>
        <div class="stat"><div class="stat__value">${g.count}</div><div class="stat__label">${plural(g.count, ["участник", "участника", "участников"])}</div></div>
        <div class="stat"><div class="stat__value">${daysLeft(g.drawDate)} дн.</div><div class="stat__label">до жеребьёвки</div></div>
      </div>

      <div class="section">
        <div class="list">
          <div class="list__item"><span style="font-size:20px">🎲</span><div class="list__body"><div class="list__sub">Жеребьёвка</div><div class="list__title">${fmtDate(g.drawDate)}</div></div></div>
          <div class="list__item"><span style="font-size:20px">🎁</span><div class="list__body"><div class="list__sub">Обмен подарками</div><div class="list__title">${fmtDate(g.exchangeDate)}</div></div></div>
        </div>
      </div>

      <div class="section callout">
        <div class="callout__icon">🤫</div>
        <div class="small">Никто, кроме вас, не узнает, кому вы дарите подарок. Организатор тоже не видит пары.</div>
      </div>
    `);

    setMain("Участвую!", () => {
      state.games.push({
        id: g.id, title: g.title, emoji: g.emoji, theme: "pine",
        budget: g.budget, currency: g.currency, drawDate: g.drawDate, exchangeDate: g.exchangeDate,
        format: "offline", rules: "", isOwner: false, status: "registration", anonChat: true,
        participants: Array.from({ length: g.count }, (_, i) => ({ id: 100 + i, name: ["Никита Р.", "Аня Л.", "Петя М.", "Света Г.", "Дима Ф.", "Лена Ж.", "Костя Б.", "Юля Т."][i] || "Гость", color: ["#c2362f", "#5b6ee1", "#d9a441", "#2a9d8f"][i % 4], wishlist: i % 3 !== 0 }))
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
      <div class="game-head">
        <div class="game-head__emoji">${g.emoji}</div>
        <h1>${esc(g.title)}</h1>
        ${g.isOwner ? `<p style="margin:8px 0 0"><span class="tag tag--accent">👑 Вы организатор</span></p>` : ""}
      </div>

      <div class="stats">
        <div class="stat"><div class="stat__value">${fmtMoney(g.budget, g.currency)}</div><div class="stat__label">бюджет</div></div>
        <div class="stat"><div class="stat__value">${fmtDate(g.drawDate).split(" ")[0]} ${fmtDate(g.drawDate).split(" ")[1].slice(0, 3)}</div><div class="stat__label">жеребьёвка</div></div>
        <div class="stat"><div class="stat__value">${fmtDate(g.exchangeDate).split(" ")[0]} ${fmtDate(g.exchangeDate).split(" ")[1].slice(0, 3)}</div><div class="stat__label">обмен</div></div>
      </div>

      ${me && !me.wishlist ? `
      <div class="section callout" data-go="wishlist/${g.id}" style="cursor:pointer">
        <div class="callout__icon">📝</div>
        <div><b>Заполните вишлист</b><div class="small">Так Санте будет проще выбрать подарок</div></div>
      </div>` : ""}

      <div class="section">
        <div class="section__head"><span class="section__title">Приглашение</span></div>
        <div class="invite">
          <div class="invite__code">
            <div class="list__title">Код: ${g.id.replace("g_", "")}</div>
            <div class="invite__link">${link}</div>
          </div>
          <button class="btn btn--ghost btn--sm" id="copy-btn">Копировать</button>
          <button class="btn btn--primary btn--sm" id="share-btn">Позвать</button>
        </div>
      </div>

      <div class="section">
        <div class="section__head">
          <span class="section__title">Участники · ${g.participants.length}</span>
          <span class="small muted">вишлисты ${filled}/${g.participants.length}</span>
        </div>
        <div class="progress" style="margin:0 4px 10px"><span style="width:${filled / g.participants.length * 100}%"></span></div>
        <div class="list">
          ${g.participants.map(p => `
            <div class="list__item">
              ${avatar(p, "avatar--sm")}
              <div class="list__body"><div class="list__title">${esc(p.name)}${p.id === 1 ? " (вы)" : ""}</div></div>
              ${p.wishlist ? `<span class="tag tag--ok">✓ вишлист</span>` : `<span class="tag tag--warn">нет вишлиста</span>`}
            </div>`).join("")}
        </div>
      </div>

      <div class="section">
        <div class="list">
          <button class="list__item" data-go="wishlist/${g.id}">
            <span style="font-size:20px">📝</span>
            <div class="list__body"><div class="list__title">Мой вишлист</div></div><span class="chev">›</span>
          </button>
          ${g.isOwner ? `
          <button class="list__item" data-go="exclusions/${g.id}">
            <span style="font-size:20px">🚫</span>
            <div class="list__body"><div class="list__title">Исключения</div><div class="list__sub">${g.exclusions.length ? g.exclusions.length + " " + plural(g.exclusions.length, ["пара", "пары", "пар"]) : "Кто не может дарить друг другу"}</div></div><span class="chev">›</span>
          </button>
          <button class="list__item" id="remind-btn">
            <span style="font-size:20px">🔔</span>
            <div class="list__body"><div class="list__title">Напомнить про вишлисты</div><div class="list__sub">Бот отправит сообщение тем, кто не заполнил</div></div>
          </button>` : ""}
        </div>
      </div>

      ${g.rules ? `
      <div class="section">
        <div class="section__head"><span class="section__title">Правила</span></div>
        <div class="card">${esc(g.rules)}</div>
      </div>` : ""}

      <div class="section center">
        <button class="btn btn--danger" id="leave-btn">${g.isOwner ? "Удалить игру" : "Выйти из игры"}</button>
      </div>
    `);

    document.getElementById("copy-btn").onclick = () => {
      navigator.clipboard && navigator.clipboard.writeText(link);
      haptic("success"); toast("Ссылка скопирована");
    };
    document.getElementById("share-btn").onclick = () => {
      const url = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(`Присоединяйся к Тайному Санте «${g.title}» 🎁`)}`;
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
      setMain(`Провести жеребьёвку (${g.participants.length})`, () => {
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
          <div class="wish__num">${i + 1}</div>
          <div class="wish__body">
            <div>${esc(x.text)}</div>
            ${x.link ? `<a class="wish__link" href="${esc(x.link)}" target="_blank" rel="noopener">${esc(x.link)}</a>` : ""}
          </div>
          <button class="icon-btn" data-del="${i}" aria-label="Удалить">✕</button>
        </div>`).join("") : `<div class="empty"><div class="muted">Добавьте хотя бы одно желание</div></div>`;
    };

    mount(`
      <h1>Мой вишлист</h1>
      <p class="muted">Его увидит только ваш Тайный Санта</p>

      <div class="section">
        <div class="section__head"><span class="section__title">Хочу получить</span></div>
        <div class="list" id="wishes"></div>
        <div class="card" style="margin-top:10px">
          <input class="input" id="w-text" placeholder="Что бы вы хотели?" style="background:var(--bg-2);margin-bottom:8px" />
          <div class="input-group">
            <input class="input" id="w-link" placeholder="Ссылка (необязательно)" style="background:var(--bg-2)" />
            <button class="btn btn--primary" id="w-add" aria-label="Добавить">＋</button>
          </div>
        </div>
      </div>

      <div class="section">
        <label class="field">
          <span class="field__label">🚫 Не дарите мне</span>
          <textarea class="textarea" id="w-not" placeholder="Аллергии, то, что уже есть">${esc(w.notWanted)}</textarea>
        </label>
        <label class="field">
          <span class="field__label">💡 Подсказки для Санты</span>
          <textarea class="textarea" id="w-hints" placeholder="Размер, любимые цвета, хобби">${esc(w.hints)}</textarea>
        </label>
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

    setMain("Сохранить", () => {
      w.notWanted = document.getElementById("w-not").value;
      w.hints = document.getElementById("w-hints").value;
      const g = getGame(id);
      if (g) { const me = g.participants.find(p => p.id === 1); if (me) me.wishlist = w.wishes.length > 0; }
      if (inTelegram && tg.CloudStorage) tg.CloudStorage.setItem("wishlist", JSON.stringify(w));
      haptic("success"); toast("Вишлист сохранён");
      g ? go("game/" + id) : goBack();
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
          ${avatar(byId(a), "avatar--sm")}<span>${esc(byId(a).name)}</span>
          <span class="pair__x">✕</span>
          ${avatar(byId(b), "avatar--sm")}<span style="flex:1">${esc(byId(b).name)}</span>
          <button class="icon-btn" data-del="${i}" aria-label="Удалить">🗑</button>
        </div>`).join("") : `<div class="empty"><div class="muted">Исключений нет — все могут выпасть всем</div></div>`;
    };

    mount(`
      <h1>Исключения</h1>
      <p class="muted">Эти участники не станут Сантами друг для друга — например, супруги или соседи по столу</p>

      <div class="section">
        <div class="list" id="pairs"></div>
      </div>

      <div class="section">
        <div class="section__head"><span class="section__title">Добавить пару</span></div>
        <div class="card">
          <div class="row" style="margin-bottom:10px">
            <select class="select" id="ex-a" style="background:var(--bg-2)">${opts}</select>
            <select class="select" id="ex-b" style="background:var(--bg-2)">${opts}</select>
          </div>
          <button class="btn btn--ghost btn--block" id="ex-add">Добавить исключение</button>
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
     7. Жеребьёвка
     ======================================================= */
  function renderDraw(id) {
    const g = getGame(id);
    if (!g) return go("");
    const candidates = g.participants.filter(p => p.id !== 1);
    const rec = candidates[Math.floor(Math.random() * candidates.length)];

    mount(`
      <div class="draw">
        <h1>Жеребьёвка проведена!</h1>
        <p class="muted">Все участники получили уведомление от бота.<br>Нажмите на подарок, чтобы узнать подопечного</p>

        <div class="gift-box" id="gift" role="button" tabindex="0" aria-label="Открыть подарок">
          <div class="gift-box__inner">
            <div class="gift-box__face"><span class="gift-box__bow">🎀</span></div>
            <div class="gift-box__back">
              <div class="small muted">Вы — Тайный Санта для</div>
              <div style="margin:12px 0">${avatar(rec, "avatar--lg")}</div>
              <h2>${esc(rec.name)}</h2>
            </div>
          </div>
        </div>
        <p class="small muted" id="draw-hint">🤫 Никому не говорите!</p>
      </div>
    `);

    const gift = document.getElementById("gift");
    const open = () => {
      if (gift.classList.contains("is-open")) return;
      gift.classList.add("is-open");
      haptic("success");
      confetti();
      g.status = "drawn";
      g.giftStatus = 0;
      g.recipient = {
        ...rec,
        wishes: [{ text: "Хорошая книга по истории" }, { text: "Термокружка", link: "https://market.yandex.ru" }],
        notWanted: "Ничего с запахом",
        hints: "Любит путешествовать"
      };
      setMain("Посмотреть вишлист", () => { history.replaceState(null, "", "#/"); go("recipient/" + g.id); });
    };
    gift.addEventListener("click", open);
    gift.addEventListener("keydown", e => (e.key === "Enter" || e.key === " ") && open());
  }

  function confetti() {
    const box = document.createElement("div");
    box.className = "confetti";
    const colors = ["#c2362f", "#d9a441", "#1f5c45", "#ffffff", "#5b6ee1"];
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
    const steps = [["🛍", "Куплен"], ["📦", "Отправлен"], ["🎉", "Получен"]];

    mount(`
      <div class="recipient">
        <p class="small muted" style="margin:0 0 14px">${g.emoji} ${esc(g.title)}</p>
        ${avatar(r, "avatar--lg")}
        <p class="muted" style="margin:0">Вы дарите подарок</p>
        <h1>${esc(r.name)}</h1>
        <p style="margin:12px 0 0">
          <span class="tag">💰 до ${fmtMoney(g.budget, g.currency)}</span>
          <span class="tag">📅 ${fmtDate(g.exchangeDate)}</span>
          <span class="tag tag--accent">⏳ ${daysLeft(g.exchangeDate)} ${plural(daysLeft(g.exchangeDate), ["день", "дня", "дней"])}</span>
        </p>
      </div>

      <div class="section">
        <div class="section__head"><span class="section__title">Статус подарка</span></div>
        <div class="card">
          <div class="timeline">
            ${steps.map(([ic, label], i) => `
              <div class="timeline__step ${g.giftStatus > i ? "is-done" : ""}">
                <div class="timeline__dot">${g.giftStatus > i ? "✓" : ic}</div>${label}
              </div>`).join("")}
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section__head"><span class="section__title">Вишлист</span></div>
        <div class="list">
          ${r.wishes.map((x, i) => `
            <div class="wish">
              <div class="wish__num">${i + 1}</div>
              <div class="wish__body">
                <div>${esc(x.text)}</div>
                ${x.link ? `<a class="wish__link" href="${esc(x.link)}" target="_blank" rel="noopener">${esc(x.link)}</a>` : ""}
              </div>
            </div>`).join("")}
        </div>
      </div>

      ${r.notWanted ? `<div class="section card"><div class="small muted">🚫 Не дарить</div><div style="margin-top:4px">${esc(r.notWanted)}</div></div>` : ""}
      ${r.hints ? `<div class="card" style="margin-top:10px"><div class="small muted">💡 Подсказки</div><div style="margin-top:4px">${esc(r.hints)}</div></div>` : ""}

      ${g.anonChat ? `
      <div class="section">
        <div class="list">
          <button class="list__item" data-go="chat/${g.id}">
            <span style="font-size:22px">🕵️</span>
            <div class="list__body"><div class="list__title">Анонимный вопрос подопечному</div><div class="list__sub">${esc(r.name)} не узнает, кто спрашивает</div></div>
            <span class="chev">›</span>
          </button>
          <button class="list__item" data-go="wishlist/${g.id}">
            <span style="font-size:22px">📝</span>
            <div class="list__body"><div class="list__title">Мой вишлист</div><div class="list__sub">Его видит ваш Санта</div></div>
            <span class="chev">›</span>
          </button>
        </div>
      </div>` : ""}
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
      <div class="hero" style="margin-bottom:6px">
        <div style="display:flex;gap:12px;align-items:center">
          ${avatar(g.recipient, "avatar--sm")}
          <div><h3>${esc(g.recipient.name)}</h3><div class="small muted">вы пишете как 🎅 Тайный Санта</div></div>
        </div>
      </div>
      <p class="chat-note">Сообщения доставляет бот. Ваше имя скрыто.</p>
      <div class="chat" id="chat"></div>
      <form class="composer" id="composer">
        <div class="composer__inner">
          <input class="input" id="msg" placeholder="Спросите о вкусах…" autocomplete="off" />
          <button class="btn btn--primary" aria-label="Отправить">➤</button>
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
