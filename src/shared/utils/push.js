// ─────────────────────────────────────────────────────────────
// push.js — чистые функции для «Mitteilungen» (часть 17): что умеет устройство, подписи, тело запроса.
// Без React и без браузерных API внутри функций — всё приходит параметрами, поэтому легко тестировать.
// ─────────────────────────────────────────────────────────────
import { NO_OPTIONAL } from "./courses";

// Четыре пункта: ключ сервера → текст как в макете 17 (handy-01)
export const PUSH_PREFS = [
  { key: "planTomorrow", title: "Plan für morgen geändert", hint: "Sobald die Schule was ändert" },
  { key: "cancelledToday", title: "Stunde fällt heute aus", hint: "Sofort, wenn es im Plan steht" },
  { key: "reminder", title: "Erinnerung für morgen", hint: (time) => `Tests und Hausaufgaben · um ${time}` },
  { key: "newExam", title: "Neuer Test eingetragen", hint: "Wenn jemand einen Test einträgt" },
];

// Что стоит на новом устройстве: три пункта из четырёх, свои курсы, ночью тихо
export const DEFAULT_PUSH = {
  prefs: { planTomorrow: true, cancelledToday: true, reminder: true, newExam: false },
  mine: true, // «Meine Kurse» (false — «Ganze Klasse»)
  quiet: { on: true, start: "21:00", end: "06:30" },
};

// Что умеет это устройство.
//   ok           — можно включать;
//   ios-install  — iPhone/iPad в Safari: сначала «Zum Home-Bildschirm» (iOS даёт push только установленным приложениям);
//   unsupported  — браузер не умеет push;
//   denied       — пользователь когда-то нажал «Nicht erlauben».
export function pushSupport({ hasServiceWorker, hasPushManager, hasNotification, permission, isIos, standalone }) {
  if (isIos && !standalone) return "ios-install";
  if (!hasServiceWorker || !hasPushManager || !hasNotification) return "unsupported";
  if (permission === "denied") return "denied";
  return "ok";
}

// Снимок окружения для pushSupport — отдельно, чтобы тест мог подставить свой «браузер»
export function readEnvironment(win = globalThis) {
  const nav = win.navigator ?? {};
  const ua = nav.userAgent ?? "";
  // iPadOS притворяется Mac: узнаём по сенсорному экрану
  const isIos = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && (nav.maxTouchPoints ?? 0) > 1);
  return {
    hasServiceWorker: "serviceWorker" in nav,
    hasPushManager: "PushManager" in win,
    hasNotification: "Notification" in win,
    permission: win.Notification?.permission ?? "default",
    isIos,
    standalone: isStandalone(win),
  };
}

// Открыто как установленное приложение (с рабочего стола), а не во вкладке браузера
export const isStandalone = (win = globalThis) =>
  Boolean(win.matchMedia?.("(display-mode: standalone)").matches || win.navigator?.standalone);

// «3 von 4 an» в Mehr; выключено на устройстве — «Aus»
export function prefsSummary(enabled, prefs) {
  if (!enabled) return "Aus";
  const on = PUSH_PREFS.filter((p) => prefs?.[p.key]).length;
  return on === 0 ? "nichts an" : `${on} von ${PUSH_PREFS.length} an`;
}

// Номера курсов для сервера. null — «Ganze Klasse» (или в «Meine Kurse» видны все курсы).
// picked из userStore: [] — все Wahl-курсы, ["keine"] — ни одного, иначе номера.
export function coursesForPush(mine, picked) {
  if (!mine || !picked?.length) return null;
  return picked.filter((nr) => nr !== NO_OPTIONAL[0]);
}

// Тело PUT /api/push/subscription (docs/API.md «Mitteilungen»)
export function subscriptionBody(subscription, settings, picked) {
  return {
    subscription,
    prefs: { ...DEFAULT_PUSH.prefs, ...settings.prefs },
    courses: coursesForPush(settings.mine, picked),
    quiet: settings.quiet?.on ? { start: settings.quiet.start, end: settings.quiet.end } : null,
  };
}

// «Zwischen 21:00 und 06:30 still»
export const quietLabel = (quiet) => (quiet?.on ? `Zwischen ${quiet.start} und ${quiet.end} still` : "Aus – Mitteilungen kommen immer");

// «Zuletzt: heute 07:14» / «gestern 18:00» / «Mo 06:30»; null — ещё ничего не приходило
const DAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
export function lastSentLabel(iso, now = new Date()) {
  if (!iso) return "Noch nichts angekommen";
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return "Noch nichts angekommen";
  const time = at.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  const dayStart = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((dayStart(now) - dayStart(at)) / 86400000);
  if (days === 0) return `Zuletzt: heute ${time}`;
  if (days === 1) return `Zuletzt: gestern ${time}`;
  if (days < 7) return `Zuletzt: ${DAYS[at.getDay()]} ${time}`;
  return `Zuletzt: ${at.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })}`;
}

// applicationServerKey: base64url → байты (так его хочет pushManager.subscribe)
export function keyToBytes(base64url) {
  const base64 = (base64url + "=".repeat((4 - (base64url.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

// Подписку пора отправить заново: раз в сутки (сервер удаляет подписку после 60 дней тишины)
export const needsRefresh = (lastSyncAt, now = Date.now()) => !lastSyncAt || now - lastSyncAt > 24 * 3600 * 1000;
