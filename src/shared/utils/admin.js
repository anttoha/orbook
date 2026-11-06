// ─────────────────────────────────────────────────────────────
// admin.js — чисті функції адмінки (основа — docs/examples/admin-client.js з бекенду).
// Тут немає React і запитів: лише підписи і розрахунки, тому все легко перевірити тестом.
// Моменти з сервера — ISO з поясом Берліна ("2026-10-07T16:40:00+02:00"),
// тому годину й дату беремо прямо з рядка: це вже берлінський час.
// ─────────────────────────────────────────────────────────────
import { addDays, daysBetween, daysLeftText, shortDate } from "./format";

// Сьогодні в Берліні: "2026-11-06" (шведський формат дати якраз YYYY-MM-DD)
export const berlinToday = (date = new Date()) => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin" }).format(date);

// "2026-10-07T16:40:00+02:00" → "16:40"; null → null
export const clock = (iso) => iso?.slice(11, 16) ?? null;

// «vor 2 Std», «gestern», «vor 5 Tagen» — відносний час для списків
export function ago(iso, nowIso) {
  if (!iso) return "noch nie";
  const minutes = Math.round((Date.parse(nowIso) - Date.parse(iso)) / 60000);
  if (minutes < 1) return "gerade eben";
  if (minutes < 60) return `vor ${minutes} Min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `vor ${hours} Std`;
  const days = Math.round(hours / 24);
  if (days === 1) return "gestern";
  if (days < 14) return `vor ${days} Tagen`;
  return `vor ${Math.round(days / 7)} Wochen`;
}

// Час у Protokoll: сьогодні «16:40», учора «gestern 17:02» (withTime) або «gestern», раніше «10. Sept»
export function eventTime(iso, todayIso, { withTime = true } = {}) {
  const day = iso.slice(0, 10);
  if (day === todayIso) return clock(iso);
  if (daysBetween(day, todayIso) === 1) return withTime ? `gestern ${clock(iso)}` : "gestern";
  return shortDate(day);
}

// Рівень запису Protokoll → підпис і колір крапки
const LEVELS = { ok: { text: "ok", dot: "bg-ok" }, warn: { text: "Hinweis", dot: "bg-accent" }, err: { text: "Fehler", dot: "bg-danger" } };
export const levelOf = (level) => LEVELS[level] ?? LEVELS.ok;

// ── План ──

// Стан картки «Vertretungsplan läuft»: ok | warn (план застарів) | error (помилки підряд)
export function planHealth(plan) {
  if (plan?.consecutiveErrors > 0) return "error";
  return plan?.status?.stale ? "warn" : "ok";
}

// Заголовок і чип картки за станом
export const HEALTH = {
  ok: { title: "Vertretungsplan läuft", chip: "OK", dot: "bg-ok" },
  warn: { title: "Plan ist veraltet", chip: "ALT", dot: "bg-accent" },
  error: { title: "Plan-Abruf gestört", chip: "FEHLER", dot: "bg-danger" },
};

// «Zuletzt geladen 16:40 · nächster Abruf 16:45» (часу немає — «noch nie» / без другої частини)
export function planTimesText(status) {
  const last = status?.lastOkAt ? `Zuletzt geladen ${clock(status.lastOkAt)}` : "Noch nie geladen";
  return status?.nextFetchAt ? `${last} · nächster Abruf ${clock(status.nextFetchAt)}` : last;
}

// Смужка «Letzte 24 Stunden»: 24 стовпчики 'ok' | 'error' | null (у цю годину опиту не було)
export const hoursStrip = (hours = []) => hours.map((h) => ({ hour: h.hour.slice(11, 13), status: h.status }));
export const errorHours = (hours = []) => hours.filter((h) => h.status === "error").length;

// "https://www.stundenplan24.de" → "www.stundenplan24.de"
export const hostOf = (url) => url?.replace(/^https?:\/\//, "") ?? "";

// «Server www.stundenplan24.de · 32 Klassen · 0 Fehler in 24 Std» — частини, яких немає, пропускаємо
export function serverLine(baseUrl, classCount, hours) {
  const parts = [];
  if (baseUrl) parts.push(`Server ${hostOf(baseUrl)}`);
  if (classCount != null) parts.push(`${classCount} Klassen`);
  if (hours?.length) parts.push(`${errorHours(hours)} Fehler in 24 Std`);
  return parts.join(" · ");
}

// Пароль класу: { since: «Seit 10. Sept», ago: «vor 12 Tagen» } або null (дата невідома)
export function classPasswordText(changedAt, todayIso) {
  if (!changedAt) return null;
  return { since: `Seit ${shortDate(changedAt)}`, ago: daysLeftText(-daysBetween(changedAt, todayIso)) };
}

// Місце на диску: «DB 2,1 MB · Backups 40 von 300 MB · 63 % frei»
const mb = (bytes) => `${(bytes / 1048576).toLocaleString("de-DE", { maximumFractionDigits: 1 })} MB`;
export function storageText(storage) {
  if (!storage) return "";
  const backups = `Backups ${mb(storage.backupsBytes ?? 0)} von ${mb(storage.backupsLimitBytes ?? 0)}`;
  return `DB ${mb(storage.dbBytes ?? 0)} · ${backups} · ${storage.diskFreePercent ?? "?"} % frei`;
}

// ── Editor-Codes ──

// Права коду → підпис як у макеті
export function rightsText(rights) {
  if (rights?.editAll) return "Alle bearbeiten";
  if (rights?.create && rights?.editOwn) return "Eintragen · eigene bearbeiten";
  if (rights?.create) return "Eintragen";
  return rights?.editOwn ? "Eigene bearbeiten" : "—";
}

// Хоч одне право має лишитись (інакше сервер відповість 422)
export const hasRight = (rights) => Boolean(rights.create || rights.editOwn || rights.editAll);

// status коду → чип: AKTIV / GESPERRT / ABGELAUFEN
export const codeChip = (code) => ({ ok: "AKTIV", locked: "GESPERRT", expired: "ABGELAUFEN" })[code.status] ?? "";

// «Gültig bis»: «31. Juli» або «abgelaufen»; дати немає — «—»
export function validText(code) {
  if (code.status === "expired") return "abgelaufen";
  return code.validUntil ? shortDate(code.validUntil) : "—";
}

// Кінець навчального року: найближче yearEnd ("07-31") від сьогодні. null — не задано
export function schoolYearEnd(todayIso, yearEnd) {
  if (!yearEnd) return null;
  const thisYear = `${todayIso.slice(0, 4)}-${yearEnd}`;
  return thisYear >= todayIso ? thisYear : `${Number(todayIso.slice(0, 4)) + 1}-${yearEnd}`;
}

// Варіант строку → дата для PATCH validUntil ("30d" → сьогодні + 30)
export function validUntilFor(choice, { todayIso, yearEnd, date }) {
  if (choice === "30d") return addDays(todayIso, 30);
  if (choice === "schuljahresende") return schoolYearEnd(todayIso, yearEnd);
  return date || null;
}

// Мітка коду: 1–40 символів, без e-mail, телефонів і посилань (те саме перевіряє сервер)
export function labelError(label) {
  const text = label.trim();
  if (!text) return "Bitte eine Bezeichnung eingeben.";
  if (text.length > 40) return "Höchstens 40 Zeichen.";
  if (/@|https?:|www\.|\d{5,}/i.test(text)) return "Keine E-Mail, Telefonnummer oder Links.";
  return null;
}

// ── Klausuren ──

// «über Code A · vor 1 Tagen»; код видалили — «unbekannt»
export const authorText = (exam) => exam.createdBy?.label ?? "unbekannt";

// ── Einstellungen ──

// «Änderungen speichern»: лише змінені значення { plan: { pollMinutes: 10 } }
export function settingsPatch(before, after) {
  const patch = {};
  for (const [section, fields] of Object.entries(after)) {
    for (const [key, value] of Object.entries(fields)) {
      if (JSON.stringify(before?.[section]?.[key]) !== JSON.stringify(value)) (patch[section] ??= {})[key] = value;
    }
  }
  return patch;
}

// 422 при збереженні: які поля підсвітити (["plan.pollMinutes"])
export const invalidKeys = (error) => (error?.details?.fields ?? []).map((f) => f.field);

// Варіанти випадаючих списків. Поточне значення, якого немає в списку, теж показуємо
export const withCurrent = (options, value) => (options.some((o) => o.value === value) ? options : [...options, { value, label: String(value) }]);

// ── Kurse und Fächer ──

// Стан курсу на екрані: "pflicht" | "wahl" (вибрав адмін) | { locked: "Gruppe SpJu" | "läuft parallel" }
export function courseState(course, optionalList) {
  const forced = optionalList.includes(course.nr) || optionalList.includes(course.label);
  if (course.group) return { locked: `Gruppe ${course.group}` };
  if (course.optional && !forced) return { locked: "läuft parallel" };
  return forced ? "wahl" : "pflicht";
}

// Новий courses.optional: курси, які адмін зробив «Wahl» (групи й паралельні сервер і так рахує Wahl)
export const optionalList = (courses, states) => courses.filter((c) => states[c.nr] === "wahl").map((c) => c.nr);

// Коди предметів для «Fächer»: з курсів класу і з уже заданих назв, без повторів
export function subjectCodes(courses, names = {}) {
  const codes = courses.map((c) => c.subject?.code).filter(Boolean);
  return [...new Set([...codes, ...Object.keys(names)])];
}

// Нові subjects.names. shown — назва, яку бачить клас (вбудована або від адміна), edited — з полів.
// Змінили — пишемо; стерли власну назву — ключ прибираємо (знову діє вбудована)
export function subjectNamesPatch(names, shown, edited) {
  const result = { ...names };
  for (const [code, value] of Object.entries(edited)) {
    const text = value.trim();
    if (text === (shown[code] ?? "")) continue; // не міняли
    if (text) result[code] = text;
    else delete result[code];
  }
  return result;
}
