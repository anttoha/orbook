// ─────────────────────────────────────────────────────────────
// format.js — німецькі підписи і дрібні розрахунки для екранів (без бібліотек).
// Основа — гайд orbook-be (docs/frontend/03-plan.md), плюс кілька помічників
// для дат (понеділок тижня, номер KW, назви днів).
//
// ГОЛОВНЕ ПРАВИЛО: день — це рядок "YYYY-MM-DD" (як у відповідях сервера).
// Так не буває зсувів часового поясу, і рядки можна порівнювати: "2026-10-05" < "2026-10-07".
// ─────────────────────────────────────────────────────────────

const MONTHS = ["Jan", "Feb", "März", "Apr", "Mai", "Juni", "Juli", "Aug", "Sept", "Okt", "Nov", "Dez"];
const MONTHS_LONG = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const WEEKDAYS_LONG = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

// ── Дати ──

// "YYYY-MM-DD" → Date у UTC (опівночі, без зсуву часового поясу пристрою)
export const parseDay = (iso) => new Date(`${iso}T00:00:00Z`);
// Date → "YYYY-MM-DD"
export const toIso = (date) => date.toISOString().slice(0, 10);
// "2026-10-05" + 2 → "2026-10-07"
export const addDays = (iso, n) => toIso(new Date(parseDay(iso).getTime() + n * 86400000));
// Скільки днів від a до b ("2026-10-05", "2026-10-07" → 2)
export const daysBetween = (a, b) => Math.round((parseDay(b) - parseDay(a)) / 86400000);
// Чи рядок — правильна дата "YYYY-MM-DD"
export const isIsoDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value ?? "") && toIso(parseDay(value)) === value;

// День тижня: 0 = неділя, 1 = понеділок … 6 = субота
const weekdayIndex = (iso) => parseDay(iso).getUTCDay();
// Субота або неділя?
export const isWeekend = (iso) => weekdayIndex(iso) === 0 || weekdayIndex(iso) === 6;
// Понеділок тижня, в якому лежить день
export const mondayOf = (iso) => addDays(iso, -((weekdayIndex(iso) + 6) % 7));

// Номер тижня за ISO (KW): тиждень, у якому четвер, належить своєму року
export function isoWeek(iso) {
  const thursday = addDays(mondayOf(iso), 3); // четвер цього тижня
  const firstJan = `${thursday.slice(0, 4)}-01-01`; // 1 січня року четверга
  return Math.floor(daysBetween(firstJan, thursday) / 7) + 1;
}

// ── Назви ──

export const weekdayShort = (iso) => WEEKDAYS_LONG[weekdayIndex(iso)].slice(0, 2); // "Mi"
export const weekdayLong = (iso) => WEEKDAYS_LONG[weekdayIndex(iso)]; // "Mittwoch"
export const dayNumber = (iso) => String(parseDay(iso).getUTCDate()); // "7"
export const monthLong = (iso) => MONTHS_LONG[parseDay(iso).getUTCMonth()]; // "Oktober"
export const longDate = (iso) => `${dayNumber(iso)}. ${monthLong(iso)}`; // "7. Oktober"
export const numericDate = (iso) => `${dayNumber(iso)}.${parseDay(iso).getUTCMonth() + 1}.`; // "7.10."

// «10. Sept» — коротка дата для підписів
export function shortDate(iso) {
  const d = parseDay(iso);
  return `${d.getUTCDate()}. ${MONTHS[d.getUTCMonth()]}`;
}

// «in 2 Tagen», «morgen», «heute», «vor 3 Tagen» — за кількістю днів (поле daysLeft з API)
export function daysLeftText(n) {
  if (n === 0) return "heute";
  if (n === 1) return "morgen";
  if (n === -1) return "gestern";
  return n > 0 ? `in ${n} Tagen` : `vor ${-n} Tagen`;
}

// «heute» / «morgen» / «gestern» або null (для «Mittwoch · heute»)
export function relativeDayWord(iso, todayIso) {
  const diff = daysBetween(todayIso, iso);
  return { 0: "heute", 1: "morgen", [-1]: "gestern" }[diff] ?? null;
}

// Підпис тижня: «KW 41 · 5.–9. Okt» (або «28. Sept–2. Okt», якщо місяці різні).
// from / to — перший і останній показаний день
export function weekTitle(from, to) {
  const kw = isoWeek(from);
  const [d1, d2] = [parseDay(from).getUTCDate(), parseDay(to).getUTCDate()];
  const [m1, m2] = [MONTHS[parseDay(from).getUTCMonth()], MONTHS[parseDay(to).getUTCMonth()]];
  return m1 === m2 ? `KW ${kw} · ${d1}.–${d2}. ${m2}` : `KW ${kw} · ${d1}. ${m1}–${d2}. ${m2}`;
}

// Великий заголовок тижня: «Diese Woche», «Nächste Woche», «Letzte Woche» або місяць
export function weekHeading(monday, todayIso) {
  const diff = daysBetween(mondayOf(todayIso), monday) / 7; // на скільки тижнів від поточного
  if (diff === 0) return "Diese Woche";
  if (diff === 1) return "Nächste Woche";
  if (diff === -1) return "Letzte Woche";
  return monthLong(monday);
}

// «Stand von heute 07:12» / «Stand von gestern 18:30» / «Stand von 5.10. 07:12».
// moment — ISO з API (+02:00); nowIso — сьогодні "YYYY-MM-DD". moment = null → null
export function standText(moment, nowIso) {
  if (!moment) return null;
  const day = moment.slice(0, 10);
  const time = moment.slice(11, 16);
  if (day === nowIso) return `Stand von heute ${time}`;
  if (day === addDays(nowIso, -1)) return `Stand von gestern ${time}`;
  return `Stand von ${numericDate(day)} ${time}`;
}

// Наступний (step = 1) або попередній (step = -1) навчальний день: пропускає вихідні і meta.holidays
export function nextSchoolDay(iso, holidays = [], step = 1) {
  const free = new Set(holidays);
  for (let i = 1; i <= 400; i++) {
    const next = addDays(iso, i * step);
    if (!isWeekend(next) && !free.has(next)) return next;
  }
  return null;
}

// ── Уроки ──

// Бейдж уроку за status (moved і added поки малюються як VERTRETUNG — рішення власника)
const BADGES = {
  substitution: "VERTRETUNG",
  moved: "VERTRETUNG",
  added: "VERTRETUNG",
  cancelled: "FÄLLT AUS",
  room_change: "RAUM",
};
export const lessonBadge = (lesson) => (lesson.examId ? "KLAUSUR" : BADGES[lesson.status] ?? null);

// Підпис переносу: «verlegt auf Fr (2.10.) 1. Std» / «verlegt von 3. Std»
export function movedText(moved) {
  const slot = (s) => (s.date ? `${weekdayShort(s.date)} (${numericDate(s.date)}) ` : "") + `${s.period}. Std`;
  if (moved?.to) return `verlegt auf ${slot(moved.to)}`;
  if (moved?.from) return `verlegt von ${slot(moved.from)}`;
  return "";
}

// Фільтр «Meine Kurse». courses — відповідь /api/courses; picked — Set номерів вибраних курсів.
// Нічого не вибрано — показуємо все. Уроки без course і обов'язкові курси видно завжди.
export function visibleLessons(lessons, courses, picked) {
  if (!picked || picked.size === 0) return lessons;
  const optional = new Set(courses.filter((c) => c.optional).map((c) => c.nr));
  return lessons.filter((l) => !l.course || !optional.has(l.course.nr) || picked.has(l.course.nr));
}

// Назва предмета: з відповіді, інакше код (так у TW, Spr, SF, HS)
export const subjectName = (subject) => subject.name ?? subject.code;

// Пояснення школи до уроку (lesson.info). Стандартні фрази («En (T25) fällt aus», «für En (T25)»,
// «verlegt von St.7 …») дублюють бейдж — їх не показуємо, решту («Sporttheorie») — як є.
const BOILERPLATE = /^(?:\S+ \([^)]*\) )?(?:fällt aus|verlegt (?:von|nach) .*)$|^für \S+ \([^)]*\)$/;
export const lessonCaption = (lesson) => (lesson.info && !BOILERPLATE.test(lesson.info) ? lesson.info : null);

// Рядок «3 fallen aus · 2 Vertretungen» під тижнем
export function weekSummaryText(summary) {
  const parts = [];
  if (summary.cancelled) parts.push(`${summary.cancelled} ${summary.cancelled === 1 ? "fällt" : "fallen"} aus`);
  const changed = summary.substitutions + summary.moved + summary.added;
  if (changed) parts.push(`${changed} ${changed === 1 ? "Vertretung" : "Vertretungen"}`);
  if (summary.roomChanges) parts.push(`${summary.roomChanges} Raumwechsel`);
  return parts.length ? parts.join(" · ") : "Keine Änderungen";
}

// Коли Klausur: до 14 днів — «in 2 Tagen», далі — «1. Okt»
export const examWhen = (exam) => (exam.daysLeft <= 14 ? daysLeftText(exam.daysLeft) : shortDate(exam.date));

// Абзаци «Info zum Tag»: порожній рядок у day.info = розрив абзацу
export function infoParagraphs(info) {
  const paragraphs = [[]];
  for (const line of info) {
    if (line.trim() === "") paragraphs.push([]); // порожній рядок — новий абзац
    else paragraphs.at(-1).push(line); // інакше — дописуємо до поточного
  }
  return paragraphs.filter((p) => p.length).map((p) => p.join(" "));
}
