// ─────────────────────────────────────────────────────────────
// admin.js — чисті функції адмінки (основа — docs/examples/admin-client.js з бекенду).
// Тут немає React і запитів: лише підписи і розрахунки, тому все легко перевірити тестом.
// Моменти з сервера — ISO з поясом Берліна ("2026-10-07T16:40:00+02:00"),
// тому годину й дату беремо прямо з рядка: це вже берлінський час.
// ─────────────────────────────────────────────────────────────
import { addDays, daysBetween, daysLeftText, shortDate } from "./format";

// Сьогодні в Берліні: "2026-11-06" (шведський формат дати якраз YYYY-MM-DD)
export const berlinToday = (date = new Date()) =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin" }).format(date);

// Зараз у Берліні: "16:40" (час перевірки «Verbindung testen»)
export const berlinClock = (date = new Date()) =>
  new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

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
  if (daysBetween(day, todayIso) === 1)
    return withTime ? `gestern ${clock(iso)}` : "gestern";
  return shortDate(day);
}

// Рівень запису Protokoll → підпис і колір крапки
const LEVELS = {
  ok: { text: "ok", dot: "bg-ok" },
  warn: { text: "Hinweis", dot: "bg-accent" },
  err: { text: "Fehler", dot: "bg-danger" },
};
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
  const last = status?.lastOkAt
    ? `Zuletzt geladen ${clock(status.lastOkAt)}`
    : "Noch nie geladen";
  return status?.nextFetchAt
    ? `${last} · nächster Abruf ${clock(status.nextFetchAt)}`
    : last;
}

// Смужка «Letzte 24 Stunden»: 24 стовпчики 'ok' | 'error' | null (у цю годину опиту не було)
export const hoursStrip = (hours = []) =>
  hours.map((h) => ({ hour: h.hour.slice(11, 13), status: h.status }));
export const errorHours = (hours = []) =>
  hours.filter((h) => h.status === "error").length;

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
  return {
    since: `Seit ${shortDate(changedAt)}`,
    ago: daysLeftText(-daysBetween(changedAt, todayIso)),
  };
}

// Місце на диску: «DB 2,1 MB · Backups 40 von 300 MB · 63 % frei»
const mb = (bytes) =>
  `${(bytes / 1048576).toLocaleString("de-DE", { maximumFractionDigits: 1 })} MB`;
export function storageText(storage) {
  if (!storage) return "";
  const backups = `Backups ${mb(storage.backupsBytes ?? 0)} von ${mb(storage.backupsLimitBytes ?? 0)}`;
  return `DB ${mb(storage.dbBytes ?? 0)} · ${backups} · ${storage.diskFreePercent ?? "?"} % frei`;
}

// ── Editor-Codes ──

// Lehrer-Code (частина 14): kind = "teacher", label = Kürzel
export const isTeacherCode = (code) => code?.kind === "teacher";

// Права Lehrer-Code → «Klausuren · Hausaufgaben» / «Nur Klausuren» (макет handy-10); + «Materialien» (частина 15)
function teacherRightsText(rights) {
  const parts = [rights?.create && "Tests", rights?.homework && "Hausaufgaben", rights?.materials && "Materialien"].filter(Boolean);
  if (parts.length === 0) return "—";
  return parts.length === 1 ? `Nur ${parts[0]}` : parts.join(" · ");
}

// Права коду → підпис як у макеті. Hausaufgaben і Materialien у Editor-Code — додатком у кінці
export function rightsText(rights, kind = "editor") {
  if (kind === "teacher") return teacherRightsText(rights);
  let text = "—";
  if (rights?.editAll) text = "Alle bearbeiten";
  else if (rights?.create && rights?.editOwn)
    text = "Eintragen · eigene bearbeiten";
  else if (rights?.create) text = "Eintragen";
  else if (rights?.editOwn) text = "Eigene bearbeiten";
  const extra = [rights?.homework && "Hausaufgaben", rights?.materials && "Materialien"].filter(Boolean);
  if (extra.length === 0) return text;
  return [...(text === "—" ? [] : [text]), ...extra].join(" · ");
}

// Хоч одне право має лишитись (інакше сервер відповість 422)
export const hasRight = (rights) =>
  Boolean(
    rights.create ||
    rights.editOwn ||
    rights.editAll ||
    rights.homework ||
    rights.editTeacher ||
    rights.materials,
  );

// Скільки записів зробив код: Klausuren + Hausaufgaben (homeworkCount буває відсутнім у старого сервера)
export const entriesCount = (code) =>
  (code.examCount ?? 0) + (code.homeworkCount ?? 0);

// Права, які можна міняти: у Lehrer-Code — лише create, homework і materials (решту сервер не приймає)
export const editableRights = (code, rights) =>
  isTeacherCode(code)
    ? { create: Boolean(rights.create), homework: Boolean(rights.homework), materials: Boolean(rights.materials) }
    : rights;

// status коду → чип: AKTIV / GESPERRT / ABGELAUFEN
export const codeChip = (code) =>
  ({ ok: "AKTIV", locked: "GESPERRT", expired: "ABGELAUFEN" })[code.status] ??
  "";

// День останнього використання: «heute», «gestern», «vor 5 Tagen», «vor 3 Wochen», «noch nie»
export function lastUsedDay(iso, todayIso) {
  if (!iso) return "noch nie";
  const days = daysBetween(iso.slice(0, 10), todayIso);
  return days >= 14
    ? `vor ${Math.round(days / 7)} Wochen`
    : daysLeftText(-days);
}

// Підпис у картці телефона: «zuletzt heute» або «noch nie benutzt»
export const lastUsedText = (iso, todayIso) =>
  iso ? `zuletzt ${lastUsedDay(iso, todayIso)}` : "noch nie benutzt";

// «Gültig bis»: «31. Juli» або «abgelaufen»; дати немає — «—»
export function validText(code) {
  if (code.status === "expired") return "abgelaufen";
  return code.validUntil ? shortDate(code.validUntil) : "—";
}

// Варіанти «Gültig bis». yearEnd — settings.school.yearEnd ("07-31"); null — без «Schuljahresende»
export const validChoices = (yearEnd) => [
  { value: "30d", label: "30 Tage" },
  ...(yearEnd ? [{ value: "schuljahresende", label: "Schuljahresende" }] : []),
  { value: "date", label: "Datum" },
];

// Кінець навчального року: найближче yearEnd ("07-31") від сьогодні. null — не задано
export function schoolYearEnd(todayIso, yearEnd) {
  if (!yearEnd) return null;
  const thisYear = `${todayIso.slice(0, 4)}-${yearEnd}`;
  return thisYear >= todayIso
    ? thisYear
    : `${Number(todayIso.slice(0, 4)) + 1}-${yearEnd}`;
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
  if (/@|https?:|www\.|\d{5,}/i.test(text))
    return "Keine E-Mail, Telefonnummer oder Links.";
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
      if (JSON.stringify(before?.[section]?.[key]) !== JSON.stringify(value))
        (patch[section] ??= {})[key] = value;
    }
  }
  return patch;
}

// 422 при збереженні: які поля підсвітити (["plan.pollMinutes"])
export const invalidKeys = (error) =>
  (error?.details?.fields ?? []).map((f) => f.field);

// Варіанти випадаючих списків. Поточне значення, якого немає в списку, теж показуємо
export const withCurrent = (options, value) =>
  options.some((o) => o.value === value)
    ? options
    : [...options, { value, label: String(value) }];

// ── Kurse und Fächer (GET /api/admin/courses) ──

// Стан курсу на екрані: "pflicht" | "wahl" (вибрав адмін) | { locked: "Gruppe SpJu" | "parallel zu Musik" }.
// automatic — група або паралельний курс: такий завжди Wahl, адмін це не змінить
// Pflicht чи Wahl зараз: підсумок сервера (optional). Старий сервер без optional — за forced
export const courseState = (course) =>
  (course.optional ?? course.forced) ? "wahl" : "pflicht";

// Чому сервер сам вважає курс «Wahl» (automatic): група чи паралельний. Звичайний курс — null.
// Паралельний курс як «Pflicht» — попередження: учні побачать в одному уроці обидва предмети
export function courseCaption(course, state) {
  if (!course.automatic) return null;
  const why = course.group
    ? `Gruppe ${course.group}`
    : course.parallelWith
      ? `parallel zu ${course.parallelWith}`
      : "läuft parallel";
  if (state === "pflicht" && !course.group)
    return `${why} · beide Kurse für alle sichtbar`;
  return `Automatisch Wahl · ${why}`;
}

// Додати nr, якщо ні nr, ні мітки ще немає; прибрати і nr, і мітку. Чужі записи лишаємо як були
const withEntries = (current, add, remove) => {
  const drop = new Set(remove.flatMap((c) => [c.nr, c.label]));
  const kept = current.filter((entry) => !drop.has(entry));
  return [
    ...kept,
    ...add
      .filter((c) => !kept.includes(c.nr) && !kept.includes(c.label))
      .map((c) => c.nr),
  ];
};

// Нові courses.optional і courses.required з чернетки states ({ [nr]: "pflicht" | "wahl" }).
//   звичайний курс: «Wahl» → у optional, «Pflicht» → геть з optional;
//   automatic (сам «Wahl»): «Pflicht» → у required, «Wahl» → геть з required
export function coursesPatch(cfg, courses, states) {
  const pick = (automatic, state) =>
    courses.filter(
      (c) => Boolean(c.automatic) === automatic && states[c.nr] === state,
    );
  const required = withEntries(
    cfg.required ?? [],
    pick(true, "pflicht"),
    pick(true, "wahl"),
  );
  // старий сервер без required: не додаємо порожній список, інакше форма вважала б себе зміненою
  return {
    optional: withEntries(
      cfg.optional ?? [],
      pick(false, "wahl"),
      pick(false, "pflicht"),
    ),
    ...(cfg.required || required.length ? { required } : {}),
  };
}

// Назва предмета в полі: своя від адміна, інакше вбудована; немає — порожньо (підказка «Kein Name — „TW“»)
export const shownName = (subject) => subject.name ?? subject.defaultName ?? "";

// Нові subjects.names з полів. Порожнє поле або вбудована назва — ключ прибираємо (діє вбудована/код)
export function subjectNamesPatch(names, subjects, edited) {
  const result = { ...names };
  for (const subject of subjects) {
    const text = (edited[subject.code] ?? shownName(subject)).trim();
    if (!text || text === subject.defaultName) delete result[subject.code];
    else result[subject.code] = text;
  }
  return result;
}
