// ─────────────────────────────────────────────────────────────
// format.js — німецькі підписи і дрібні розрахунки для екранів (без бібліотек).
// Основа — гайд orbook-be (docs/frontend/03-plan.md), плюс кілька помічників
// для дат (понеділок тижня, номер KW, назви днів).
//
// ГОЛОВНЕ ПРАВИЛО: день — це рядок "YYYY-MM-DD" (як у відповідях сервера).
// Так не буває зсувів часового поясу, і рядки можна порівнювати: "2026-10-05" < "2026-10-07".
// ─────────────────────────────────────────────────────────────

import { translate } from "../i18n/translate";
import { groupName } from "./courses";

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

export const weekdayShort = (iso) => translate(WEEKDAYS_LONG[weekdayIndex(iso)].slice(0, 2)); // "Mi" (en «We», uk «Ср»)
export const weekdayLong = (iso) => translate(WEEKDAYS_LONG[weekdayIndex(iso)]); // "Mittwoch"
export const dayNumber = (iso) => String(parseDay(iso).getUTCDate()); // "7"
export const monthLong = (iso) => translate(MONTHS_LONG[parseDay(iso).getUTCMonth()]); // "Oktober"
export const longDate = (iso) => `${dayNumber(iso)}. ${monthLong(iso)}`; // "7. Oktober"
export const numericDate = (iso) => `${dayNumber(iso)}.${parseDay(iso).getUTCMonth() + 1}.`; // "7.10."

// «10. Sept» — коротка дата для підписів
export function shortDate(iso) {
  const d = parseDay(iso);
  return `${d.getUTCDate()}. ${translate(MONTHS[d.getUTCMonth()])}`;
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
  const word = { 0: "heute", 1: "morgen", [-1]: "gestern" }[diff];
  return word ? translate(word) : null;
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

// Підпис кнопки «Letzten Stand zeigen · 07:12»: сьогодні тільки час, інакше ще й день. moment = null → «—»
export function lastStandLabel(moment, today) {
  if (moment?.slice(0, 10) === today) return moment.slice(11, 16);
  return planMomentText(moment, today);
}

// Другий рядок у плашці дня: коли план цього дня востаннє змінився.
// Той самий день — завжди «07:08». Інший — за налаштуванням «Darstellung» (частина 22):
//   "weekday" «Mi 15:15» (як було) · "date" «04.11.» · "datetime" «04.11. 15:15».
// Дати в API вже в часі школи (+01:00), тому беремо їх із рядка, а не через Date. Немає плану або часу — null.
export function changedLabel(day, format = "weekday") {
  const moment = day?.changedAt ?? day?.publishedAt;
  if (!moment || day.status !== "ok") return null;
  const date = moment.slice(0, 10);
  const time = moment.slice(11, 16);
  if (date === day.date) return time;
  const dotted = `${date.slice(8, 10)}.${date.slice(5, 7)}.`; // «04.11.»
  if (format === "date") return dotted;
  if (format === "datetime") return `${dotted} ${time}`;
  return `${weekdayShort(date)} ${time}`;
}

// Час у вікні «Info zum Tag»: «heute 07:08», «gestern 18:30», «Mi, 4.11. 15:15». null → «—»
export function planMomentText(moment, today) {
  if (!moment) return "—";
  const date = moment.slice(0, 10);
  const time = moment.slice(11, 16);
  if (date === today) return `heute ${time}`;
  if (date === addDays(today, -1)) return `gestern ${time}`;
  return `${weekdayShort(date)}, ${numericDate(date)} ${time}`;
}

// «aktualisiert vor 3 Min.»: коли сервер востаннє перевіряв план.
// fetchedAt новіший за now буває на демо, де «сьогодні» вигадане: тоді «gerade eben».
export function updatedAgoText(fetchedAt, now) {
  const moment = Date.parse(fetchedAt ?? "");
  if (Number.isNaN(moment)) return null;
  const minutes = Math.floor((now.getTime() - moment) / 60_000);
  if (minutes < 1) return "aktualisiert gerade eben";
  if (minutes < 60) return `aktualisiert vor ${minutes} Min.`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `aktualisiert vor ${hours} Std.`;
  const days = Math.floor(hours / 24);
  return `aktualisiert vor ${days} ${days === 1 ? "Tag" : "Tagen"}`;
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
export const lessonBadge = (lesson) => (lesson.examId ? "TEST" : BADGES[lesson.status] ?? null);

// Підпис переносу: «verlegt auf Fr (2.10.) 1. Std» / «verlegt von 3. Std»
export function movedText(moved) {
  const slot = (s) => (s.date ? `${weekdayShort(s.date)} (${numericDate(s.date)}) ` : "") + `${s.period}. Std`;
  if (moved?.to) return `verlegt auf ${slot(moved.to)}`;
  if (moved?.from) return `verlegt von ${slot(moved.from)}`;
  return "";
}

// Фільтр «Meine Kurse». courses — відповідь /api/courses; picked — Set номерів вибраних курсів за вибором
// (порожній — видно всі за вибором); hiddenRequired — Set прихованих обов'язкових. Уроки без course видно завжди.
export function visibleLessons(lessons, courses, picked, hiddenRequired = new Set()) {
  const allOptional = !picked || picked.size === 0;
  if (allOptional && hiddenRequired.size === 0) return lessons;
  const optional = new Set(courses.filter((c) => c.optional).map((c) => c.nr));
  const shown = (nr) => (optional.has(nr) ? allOptional || picked.has(nr) : !hiddenRequired.has(nr));
  return lessons.filter((l) => !l.course || shown(l.course.nr));
}

// Режим «Alle Kurse» (частина 22): нічого не ховаємо, але чужі уроки позначаємо notMine — їх малюють пунктиром
export function markedLessons(lessons, courses, picked, hiddenRequired = new Set()) {
  const mine = new Set(visibleLessons(lessons, courses, picked, hiddenRequired));
  return lessons.map((lesson) => (mine.has(lesson) ? lesson : { ...lesson, notMine: true }));
}

// Тільки мої уроки (для «що йде зараз»: чужий урок не має бути «Jetzt»)
export const mineOnly = (lessons) => lessons.filter((lesson) => !lesson.notMine);

const NO_SUBJECT_NAME = "Ohne Fach";
const NO_SUBJECT_CODE = "–";

// Назва предмета: з відповіді, інакше код (так у TW, Spr, SF, HS)
export const subjectName = (subject) => subject?.name ?? subject?.code ?? NO_SUBJECT_NAME;

// Назва уроку: «Sport · Mädchen», якщо курс — група Sport (20b), інакше назва предмета.
// course буває null («лишній» урок), label теж — тоді просто предмет
export const lessonName = (lesson) => {
  const group = groupName(lesson?.course?.label);
  return group ? `${subjectName(lesson.subject)} · ${group}` : subjectName(lesson?.subject);
};

// Код у клітинці тижня: «SpMä» / «SpJu» для груп Sport, інакше код предмета
export const lessonCode = (lesson) => (groupName(lesson?.course?.label) ? lesson.course.label : subjectCode(lesson?.subject));

// Код предмета в клітинці. subject буває null: так школа записує заміну чи захід без предмета.
export const subjectCode = (subject) => subject?.code ?? NO_SUBJECT_CODE;

// Код для кружечка: не більше 3 літер («AGTan» → «AGT»), інакше вилазить за край
export const badgeCode = (code) => (code.length > 3 ? code.slice(0, 3) : code);

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

// Коли Klausur: до 14 днів в обидва боки — «in 2 Tagen», «vor 3 Tagen», далі — «1. Okt»
export const examWhen = (exam) => (Math.abs(exam.daysLeft) <= 14 ? daysLeftText(exam.daysLeft) : shortDate(exam.date));

// Абзаци «Info zum Tag»: порожній рядок у day.info = розрив абзацу
export function infoParagraphs(info) {
  const paragraphs = [[]];
  for (const line of info) {
    if (line.trim() === "") paragraphs.push([]); // порожній рядок — новий абзац
    else paragraphs.at(-1).push(line); // інакше — дописуємо до поточного
  }
  return paragraphs.filter((p) => p.length).map((p) => p.join(" "));
}
