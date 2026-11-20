// ─────────────────────────────────────────────────────────────
// Часть 31e: уведомления Android-приложения. Их делает само приложение, без Google и без сервера:
// оно и так раз в 15–60 минут загружает план для виджетов и сравнивает его с прошлым.
// Настройки хранит приложение (android/…/notify/NotifySettings.kt), сайт их только показывает.
// Чистые функции — их проверяет appNotify.test.js.
// ─────────────────────────────────────────────────────────────
import { DEFAULT_PUSH } from "./push";

// «Vor der Stunde»: по умолчанию выключено (решение владельца 2026-11-20), за сколько минут
export const BEFORE_MINUTES = [5, 10, 15];
export const DEFAULT_BEFORE = { on: false, minutes: 10 };

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const time = (value, fallback) => (typeof value === "string" && TIME.test(value) ? value : fallback);

// Ответ ORBookAndroid.notifyState() → состояние. Мусор → null
//   permission: granted — можно; denied — когда-то запретили (нужны настройки Android); ask — ещё не спрашивали
export function parseAppNotify(json) {
  try {
    const raw = typeof json === "string" ? JSON.parse(json) : null;
    if (!raw || typeof raw !== "object") return null;
    const prefs = { ...DEFAULT_PUSH.prefs };
    for (const key of Object.keys(prefs)) if (typeof raw.prefs?.[key] === "boolean") prefs[key] = raw.prefs[key];
    const quiet = {
      on: typeof raw.quiet?.on === "boolean" ? raw.quiet.on : DEFAULT_PUSH.quiet.on,
      start: time(raw.quiet?.start, DEFAULT_PUSH.quiet.start),
      end: time(raw.quiet?.end, DEFAULT_PUSH.quiet.end),
    };
    const before = {
      on: raw.before?.on === true,
      minutes: BEFORE_MINUTES.includes(raw.before?.minutes) ? raw.before.minutes : DEFAULT_BEFORE.minutes,
    };
    return {
      permission: ["granted", "denied"].includes(raw.permission) ? raw.permission : "ask",
      on: raw.on === true,
      prefs,
      quiet,
      before,
      reminderTime: time(raw.reminderTime, "18:00"),
      lastCheckAt: Number.isFinite(raw.lastCheckAt) && raw.lastCheckAt > 0 ? raw.lastCheckAt : null,
    };
  } catch {
    return null;
  }
}

// Что показать сверху «Mitteilungen» в приложении: app — можно включать (или уже включено), app-denied — запрещено в Android
export const appSupport = (state) => (state?.permission === "denied" ? "app-denied" : "app");

// Что отправить приложению (ORBookAndroid.saveNotify)
export const appSettingsOf = ({ enabled, prefs, quiet, before, reminderTime }) => ({
  on: Boolean(enabled),
  prefs: { ...DEFAULT_PUSH.prefs, ...prefs },
  quiet: { ...DEFAULT_PUSH.quiet, ...quiet },
  before: { ...DEFAULT_BEFORE, ...before },
  reminderTime: time(reminderTime, "18:00"),
});

// «Zuletzt geprüft: 07:14» — когда приложение последний раз спрашивало сервер
export function lastCheckLabel(ms, now = new Date()) {
  if (!ms) return null;
  const at = new Date(ms);
  const hhmm = at.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  const sameDay = at.toDateString() === now.toDateString();
  return sameDay ? hhmm : `${at.toLocaleDateString("de-DE", { day: "numeric", month: "numeric" })} ${hhmm}`;
}
