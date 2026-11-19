/* =========================================================
   Тайный Санта Р-СТРОЙ — сервер (Cloudflare Worker + D1)

   Что делает:
   • хранит участников и их пожелания (база D1, привязка DB);
   • проверяет, что запрос пришёл из Telegram (подпись initData);
   • организатор одобряет участников и запускает жеребьёвку;
   • бот пишет участникам: «ты в игре», «жеребьёвка прошла».

   Настройки (Settings → Variables and Secrets):
   • BOT_TOKEN  (секрет)  — токен бота от @BotFather;
   • ADMIN_IDS  (текст)   — Telegram ID организаторов через запятую
                            (узнать свой ID: написать боту /myid);
   • WEBAPP_URL (текст, необязательно) — адрес приложения.
   ========================================================= */

const DEFAULT_WEBAPP = "https://dsverigo-ux.github.io/secret-santa-tma/";

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS participants (
     tg_id INTEGER PRIMARY KEY,
     name TEXT NOT NULL,
     dept TEXT DEFAULT '',
     username TEXT DEFAULT '',
     wishes TEXT DEFAULT '',
     not_wanted TEXT DEFAULT '',
     status TEXT DEFAULT 'pending',
     recipient_id INTEGER,
     revealed INTEGER DEFAULT 0,
     bought INTEGER DEFAULT 0,
     notified INTEGER DEFAULT 0,
     created_at TEXT DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)`
];

let schemaReady = false;
async function ensureSchema(env) {
  if (schemaReady) return;
  await env.DB.batch(SCHEMA.map(s => env.DB.prepare(s)));
  schemaReady = true;
}

/* ---------- ответы ---------- */
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type"
};
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", ...CORS } });
const fail = (msg, status = 400) => json({ ok: false, error: msg }, status);

/* ---------- проверка подписи Telegram ---------- */
const enc = new TextEncoder();
async function hmac(key, data) {
  const k = await crypto.subtle.importKey("raw", typeof key === "string" ? enc.encode(key) : key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", k, enc.encode(data)));
}
const hex = buf => [...buf].map(b => b.toString(16).padStart(2, "0")).join("");

async function verifyInitData(initData, botToken) {
  if (!initData) return null;
  const p = new URLSearchParams(initData);
  const hash = p.get("hash");
  if (!hash) return null;
  p.delete("hash");
  const check = [...p.entries()].map(([k, v]) => `${k}=${v}`).sort().join("\n");
  const secret = await hmac("WebAppData", botToken);
  if (hex(await hmac(secret, check)) !== hash) return null;
  const age = Date.now() / 1000 - Number(p.get("auth_date") || 0);
  if (age > 7 * 86400) return null;                      // данные не старше недели
  try { return JSON.parse(p.get("user")); } catch (e) { return null; }
}

/* ---------- Telegram Bot API ---------- */
async function tgApi(env, method, body) {
  try {
    const r = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body)
    });
    return await r.json();
  } catch (e) { return { ok: false, description: String(e) }; }
}
const appButton = (env, text = "Открыть игру", query = "") =>
  ({ inline_keyboard: [[{ text, web_app: { url: (env.WEBAPP_URL || DEFAULT_WEBAPP) + query } }]] });
const say = (env, chatId, text, button) =>
  tgApi(env, "sendMessage", { chat_id: chatId, text, parse_mode: "HTML", reply_markup: button });

const admins = env => String(env.ADMIN_IDS || "").split(/[\s,;]+/).filter(Boolean).map(Number);
const isAdmin = (env, id) => admins(env).includes(Number(id));
const escHtml = s => String(s || "").replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

async function getSetting(env, key) {
  const r = await env.DB.prepare("SELECT value FROM settings WHERE key = ?").bind(key).first();
  return r ? r.value : null;
}
const setSetting = (env, key, value) =>
  env.DB.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").bind(key, String(value)).run();

/* ---------- API приложения ---------- */
async function api(path, body, env) {
  const user = await verifyInitData(body.initData, env.BOT_TOKEN);
  if (!user) return fail("not_telegram", 401);
  const me = await env.DB.prepare("SELECT * FROM participants WHERE tg_id = ?").bind(user.id).first();
  const drawn = (await getSetting(env, "drawn")) === "1";
  const admin = isAdmin(env, user.id);

  /* состояние для экрана */
  if (path === "/api/me") {
    const counts = await env.DB.prepare(
      "SELECT SUM(status = 'approved') AS approved, SUM(status = 'pending') AS pending FROM participants").first();
    let recipient = null;
    if (drawn && me && me.recipient_id) {
      const r = await env.DB.prepare("SELECT name, dept, wishes, not_wanted FROM participants WHERE tg_id = ?").bind(me.recipient_id).first();
      if (r) recipient = { name: r.name, dept: r.dept, wishes: r.wishes, notWanted: r.not_wanted };
    }
    return json({
      ok: true, admin, drawn,
      user: { id: user.id, firstName: user.first_name || "", lastName: user.last_name || "" },
      me: me && { status: me.status, name: me.name, dept: me.dept, wishes: me.wishes, notWanted: me.not_wanted, revealed: !!me.revealed, bought: !!me.bought },
      recipient,
      counts: { approved: Number(counts.approved || 0), pending: Number(counts.pending || 0) }
    });
  }

  /* заявка на участие */
  if (path === "/api/join") {
    if (drawn) return fail("already_drawn");
    if (me) return fail("already_joined");
    const name = String(body.name || "").trim().slice(0, 80);
    const wishes = String(body.wishes || "").trim().slice(0, 1500);
    if (!name || !wishes) return fail("empty");
    await env.DB.prepare("INSERT INTO participants (tg_id, name, dept, username, wishes, not_wanted, status) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .bind(user.id, name, String(body.dept || "").trim().slice(0, 80), user.username || "", wishes,
        String(body.notWanted || "").trim().slice(0, 500), admin ? "approved" : "pending").run();
    if (!admin) {
      for (const a of admins(env)) {
        await say(env, a, `🎄 Новая заявка в Тайного Санту: <b>${escHtml(name)}</b>${body.dept ? ", " + escHtml(body.dept) : ""}.\nПодтвердите участие в панели организатора.`, appButton(env, "Открыть панель"));
      }
    }
    return json({ ok: true });
  }

  if (path === "/api/reveal") {
    if (me) await env.DB.prepare("UPDATE participants SET revealed = 1 WHERE tg_id = ?").bind(user.id).run();
    return json({ ok: true });
  }

  if (path === "/api/bought") {
    if (me) await env.DB.prepare("UPDATE participants SET bought = 1 WHERE tg_id = ?").bind(user.id).run();
    return json({ ok: true });
  }

  /* ---------- организатор ---------- */
  if (!path.startsWith("/api/admin/")) return fail("not_found", 404);
  if (!admin) return fail("forbidden", 403);

  if (path === "/api/admin/list") {
    const { results } = await env.DB.prepare(
      "SELECT tg_id, name, dept, username, status, bought, notified, created_at FROM participants ORDER BY status = 'pending' DESC, created_at").all();
    return json({ ok: true, drawn, list: results });
  }

  if (path === "/api/admin/set") {                       // одобрить / отклонить / вернуть
    if (drawn) return fail("already_drawn");
    const status = ["approved", "rejected", "pending"].includes(body.status) ? body.status : null;
    if (!status) return fail("bad_status");
    const ids = (Array.isArray(body.ids) ? body.ids : [body.id]).map(Number).filter(Boolean);
    for (const id of ids) {
      const p = await env.DB.prepare("SELECT status FROM participants WHERE tg_id = ?").bind(id).first();
      if (!p || p.status === status) continue;
      await env.DB.prepare("UPDATE participants SET status = ? WHERE tg_id = ?").bind(status, id).run();
      if (status === "approved") await say(env, id, "🎄 Организатор подтвердил: ты в игре «Тайный Санта Р-СТРОЙ»!\nКогда пройдёт жеребьёвка, я напишу, кому ты даришь подарок.", appButton(env));
      if (status === "rejected") await say(env, id, "Организатор не подтвердил участие в «Тайном Санте Р-СТРОЙ». Если это ошибка — напиши организатору.");
    }
    return json({ ok: true });
  }

  if (path === "/api/admin/draw") {                      // жеребьёвка
    if (drawn) return fail("already_drawn");
    const { results } = await env.DB.prepare("SELECT tg_id FROM participants WHERE status = 'approved'").all();
    const ids = results.map(r => r.tg_id);
    if (ids.length < 3) return fail("too_few");
    const rnd = new Uint32Array(ids.length);
    crypto.getRandomValues(rnd);
    for (let i = ids.length - 1; i > 0; i--) { const j = rnd[i] % (i + 1); [ids[i], ids[j]] = [ids[j], ids[i]]; }
    // круг: каждый дарит следующему — никто не вытянет сам себя, все получат подарок
    await env.DB.batch(ids.map((id, i) =>
      env.DB.prepare("UPDATE participants SET recipient_id = ?, notified = 0 WHERE tg_id = ?").bind(ids[(i + 1) % ids.length], id)));
    await setSetting(env, "drawn", "1");
    await setSetting(env, "drawn_at", new Date().toISOString());
    return json({ ok: true, count: ids.length });
  }

  if (path === "/api/admin/notify") {                    // рассылка после жеребьёвки — порциями
    if (!drawn) return fail("not_drawn");
    if (body.retry) await env.DB.prepare("UPDATE participants SET notified = 0 WHERE status = 'approved' AND notified = 2").run();
    const { results } = await env.DB.prepare(
      "SELECT tg_id FROM participants WHERE status = 'approved' AND notified = 0 LIMIT 20").all();
    let sent = 0;
    for (const r of results) {
      const res = await say(env, r.tg_id, "🎁 Жеребьёвка прошла! Открой игру — там спрятано имя коллеги, которому ты даришь подарок. Тсс… это секрет!", appButton(env, "Узнать, кому дарю"));
      await env.DB.prepare("UPDATE participants SET notified = ? WHERE tg_id = ?").bind(res.ok ? 1 : 2, r.tg_id).run();
      if (res.ok) sent++;
    }
    const left = await env.DB.prepare("SELECT COUNT(*) AS n FROM participants WHERE status = 'approved' AND notified = 0").first();
    return json({ ok: true, sent, left: Number(left.n) });
  }

  return fail("not_found", 404);
}

/* ---------- сообщения боту ---------- */
async function onUpdate(update, env) {
  const m = update.message;
  if (!m || !m.text) return;
  const chat = m.chat.id;
  if (m.text.startsWith("/myid")) {
    return say(env, chat, `Твой Telegram ID: <code>${m.from.id}</code>`);
  }
  if (m.text.startsWith("/start")) {
    return say(env, chat,
      "🎄 Привет! Это <b>Тайный Санта Р-СТРОЙ</b>.\n\nКаждый тайно готовит подарок одному коллеге, а кто-то другой — сюрприз для тебя. Нажми кнопку, чтобы участвовать.",
      appButton(env, "Участвую"));
  }
}

const webhookSecret = async env => hex(await hmac("webhook", env.BOT_TOKEN)).slice(0, 32);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (!env.BOT_TOKEN) return fail("BOT_TOKEN is not set", 500);
    if (!env.DB) return fail("D1 binding DB is not set", 500);
    await ensureSchema(env);

    /* разовая настройка: открыть в браузере адрес_воркера/setup */
    if (url.pathname === "/setup") {
      const r = await tgApi(env, "setWebhook", {
        url: `${url.origin}/tg`, secret_token: await webhookSecret(env), allowed_updates: ["message"], drop_pending_updates: true
      });
      await tgApi(env, "setMyCommands", { commands: [{ command: "start", description: "Открыть игру" }, { command: "myid", description: "Мой Telegram ID" }] });
      return json({ ok: r.ok, webhook: `${url.origin}/tg`, telegram: r.description || "", admins: admins(env).length });
    }

    if (url.pathname === "/tg" && request.method === "POST") {
      if (request.headers.get("X-Telegram-Bot-Api-Secret-Token") !== await webhookSecret(env)) return new Response("forbidden", { status: 403 });
      await onUpdate(await request.json(), env).catch(() => {});
      return new Response("ok");
    }

    if (url.pathname.startsWith("/api/") && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      try { return await api(url.pathname, body, env); }
      catch (e) { return fail("server_error", 500); }
    }

    if (url.pathname === "/") return json({ ok: true, app: "Тайный Санта Р-СТРОЙ" });
    return fail("not_found", 404);
  }
};
