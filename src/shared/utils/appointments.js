// ─────────────────────────────────────────────────────────────
// appointments.js — Termine без React (частина 18, docs/API.md «Termine»).
// Тут: хто який термін бачить, групи списку, підписи дат і часу, перевірка форми, .ics для календаря.
// Сервер перевіряє те саме (422) — тут лише щоб показати помилку до відправки.
// ─────────────────────────────────────────────────────────────
import { isTeacher } from "./examRules";
import { addDays, daysBetween, daysLeftText, isIsoDate, longDate, mondayOf, shortDate, subjectName, weekdayLong, weekdayShort } from "./format";
import { validateHomeworkText } from "./homework";

export const TITLE_MAX = 60;
export const PLACE_MAX = 80;
export const NOTE_MAX = 300;
export const MAX_DAYS = 100; // найдовший термін (Sommerferien)

// Вид терміну: значення API → кнопка у формі, бейдж, «N Tage bis …»
export const KINDS = [
  { value: "trip", label: "Ausflug", badge: "Ausflug", until: "zum Ausflug" },
  { value: "parents", label: "Elternabend", badge: "Elternabend", until: "zum Elternabend" },
  { value: "free", label: "Frei", badge: "Frei", until: "zum freien Tag" },
  { value: "other", label: "Sonstiges", badge: "Termin", until: "zum Termin" },
];
export const kindInfo = (kind) => KINDS.find((k) => k.value === kind) ?? KINDS[3];

// Вільний день — зелений, решта — фіолетовий (макет: плитка дати, бейдж, смужка в тижні)
export const isFree = (item) => item?.kind === "free";

// Останній день терміну (dateTo може бути null — один день)
export const lastDay = (item) => item.dateTo ?? item.dateFrom;

// Чи йде термін у цей день
export const coversDay = (item, iso) => item.dateFrom <= iso && iso <= lastDay(item);

// ── Хто що бачить ──

// Предмети учня за «Meine Kurse»: обов'язкові курси + вибрані (порожній picked — усі).
// null — бачити все (учитель, або курсів ще немає)
export function mySubjects(me, courses, picked, hiddenRequired = []) {
  if (isTeacher(me) || !courses?.length) return null;
  const all = !picked || picked.length === 0;
  const codes = courses.filter((c) => (c.optional ? all || picked.includes(c.nr) : !hiddenRequired.includes(c.nr))).map((c) => c.subject?.code);
  return new Set(codes.filter(Boolean));
}

// Курсовий термін (subject не null) видно лише тим, у кого є цей предмет
export const visibleAppointments = (items, subjects) => (subjects ? items.filter((item) => !item.subject || subjects.has(item.subject.code)) : items);

// Список: лише ті, що ще не скінчились
export const upcomingAppointments = (items, today) => items.filter((item) => lastDay(item) >= today);

// Терміни одного дня (для смужки тижня і плашки дня)
export const appointmentsOn = (items, iso) => items.filter((item) => coversDay(item, iso));

// «Diese Woche» / «Nächste Woche» / «Später». Термін, що вже йде, — у «Diese Woche». Порожні групи не показуємо
export function groupAppointments(items, today) {
  const nextMonday = addDays(mondayOf(today), 7);
  const afterNext = addDays(nextMonday, 7);
  const start = (item) => (item.dateFrom < today ? today : item.dateFrom);
  const groups = [
    { title: "Diese Woche", items: items.filter((item) => start(item) < nextMonday) },
    { title: "Nächste Woche", items: items.filter((item) => start(item) >= nextMonday && start(item) < afterNext) },
    { title: "Später", items: items.filter((item) => start(item) >= afterNext) },
  ];
  return groups.filter((group) => group.items.length > 0);
}

// ── Підписи ──

// «07:45–15:00», «ab 19:00» або null (увесь день)
export function timeText(item) {
  if (!item.timeFrom) return null;
  return item.timeTo ? `${item.timeFrom}–${item.timeTo}` : `ab ${item.timeFrom}`;
}

// Хто вніс, коротко для рядка списку: «von Ric». Школа й Editor-Code — без імені
export const byText = (item) => (item.author?.short ? `von ${item.author.short}` : null);

// Рядок над назвою: «Physik · 07:45–15:00 · von Ric». Для всього класу предмет не пишемо.
// Багатоденний — «bis Sa, 24. Okt», бо час там не головне
export function metaText(item) {
  const parts = [];
  if (item.subject) parts.push(subjectName(item.subject));
  if (item.dateTo) parts.push(`bis ${weekdayShort(item.dateTo)}, ${shortDate(item.dateTo)}`);
  const time = timeText(item);
  if (time) parts.push(time);
  if (item.place) parts.push(item.place);
  const by = byText(item);
  if (by) parts.push(by);
  return parts.join(" · ");
}

// Праворуч у рядку: «heute», «morgen», «in 12 Tagen», «läuft» або «13. Okt»
export function whenText(item, today) {
  if (item.dateFrom < today) return "läuft";
  const days = daysBetween(today, item.dateFrom);
  return days <= 14 ? daysLeftText(days) : shortDate(item.dateFrom);
}

// «Montag, 29. September» або «Mo, 13. Okt – Sa, 24. Okt»
export function dateText(item) {
  if (!item.dateTo) return `${weekdayLong(item.dateFrom)}, ${longDate(item.dateFrom)}`;
  return `${weekdayShort(item.dateFrom)}, ${shortDate(item.dateFrom)} – ${weekdayShort(item.dateTo)}, ${shortDate(item.dateTo)}`;
}

// Картка у вікні: { number, label } — «12 · Tage bis zum Ausflug», «Heute», «Läuft · noch 3 Tage»
export function countdown(item, today) {
  const until = kindInfo(item.kind).until;
  if (item.dateFrom > today) {
    const days = daysBetween(today, item.dateFrom);
    return { number: days, label: `${days === 1 ? "Tag" : "Tage"} bis ${until}` };
  }
  if (lastDay(item) === today) return { number: null, label: item.dateFrom === today ? "Heute" : "Letzter Tag heute" };
  const left = daysBetween(today, lastDay(item));
  return { number: null, label: `Läuft · noch ${left} ${left === 1 ? "Tag" : "Tage"}` };
}

// Плашка «Eingetragen von …» у вікні
export function sourceText(item, me) {
  if (item.source === "admin") return { name: "der Schule", role: null };
  const short = item.author?.short;
  if (short) return me?.teacher?.short === short ? { name: `Ihnen (${short})`, role: null } : { name: short, role: "Lehrkraft" };
  return { name: null, role: "mit Editor-Code" };
}

// Для кого: «Gilt für alle mit dem Kurs Physik.» / «Gilt für die ganze Klasse.»
export const audienceText = (item) => (item.subject ? `Gilt für alle mit dem Kurs ${subjectName(item.subject)}.` : "Gilt für die ganze Klasse.");

// Текст для «Teilen» — без автора
export function appointmentText(item) {
  const lines = [`${kindInfo(item.kind).label}: ${item.title}`, dateText(item) + (timeText(item) ? ` · ${timeText(item)}` : "")];
  if (item.place) lines.push(item.place);
  if (item.note) lines.push(item.note);
  return `${lines.join("\n")}\n\nvia ORBook`;
}

// ── Права ──

export const canCreateAppointments = (me) => Boolean(me?.teacher?.canAppointments || me?.editor?.canAppointments);

// Куди веде «+»: учню без коду — спершу Editor-Code; з кодом без права — кнопки немає
export function addAppointmentTarget(me) {
  if (canCreateAppointments(me)) return "/testen/termine/neu";
  return me?.editor || isTeacher(me) ? null : "/editor-code?weiter=termin";
}

// «Für»: учитель — лише свої предмети (teacher.subjects), інші — усі з форми Klausur
export function appointmentSubjects(me, allSubjects) {
  if (!isTeacher(me)) return allSubjects;
  const own = me.teacher?.subjects ?? [];
  return allSubjects.filter((subject) => own.includes(subject.code));
}

// ── Форма ──

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

// Запис → поля форми (порожній рядок замість null: так простіше полям вводу)
export const appointmentToForm = (item) => ({
  kind: item?.kind ?? "trip",
  subject: item?.subject?.code ?? null,
  title: item?.title ?? "",
  dateFrom: item?.dateFrom ?? "",
  dateTo: item?.dateTo ?? "",
  timeFrom: item?.timeFrom ?? "",
  timeTo: item?.timeTo ?? "",
  place: item?.place ?? "",
  note: item?.note ?? "",
});

// Поля форми → тіло запиту: порожнє — null (сервер так очищає поле)
export function formToBody(form) {
  const empty = (value) => (value?.trim() ? value.trim() : null);
  return {
    kind: form.kind,
    subject: form.subject ?? null,
    title: form.title.trim(),
    dateFrom: form.dateFrom,
    dateTo: empty(form.dateTo),
    timeFrom: empty(form.timeFrom),
    timeTo: empty(form.timeTo),
    place: empty(form.place),
    note: empty(form.note),
  };
}

// Перевірка перед відправкою: { поле: текст помилки }. originalLastDay — у правці старі дати не «в минулому»
export function validateAppointmentForm(form, today, originalDates = null) {
  const errors = {};
  const title = form.title.trim();
  if (!title) errors.title = "Bitte einen Titel eingeben.";
  else if (title.length > TITLE_MAX) errors.title = `Der Titel darf höchstens ${TITLE_MAX} Zeichen lang sein.`;
  if (!isIsoDate(form.dateFrom)) errors.dateFrom = "Bitte ein Datum wählen.";
  const to = form.dateTo?.trim() ? form.dateTo : null;
  if (to && !isIsoDate(to)) errors.dateTo = "Bitte ein gültiges Datum wählen.";
  if (!errors.dateFrom && to && !errors.dateTo) {
    if (to < form.dateFrom) errors.dateTo = "Das Ende liegt vor dem Anfang.";
    else if (daysBetween(form.dateFrom, to) >= MAX_DAYS) errors.dateTo = `Ein Termin darf höchstens ${MAX_DAYS} Tage dauern.`;
  }
  const changed = !originalDates || originalDates.from !== form.dateFrom || (originalDates.to ?? "") !== (to ?? "");
  if (!errors.dateFrom && !errors.dateTo && changed && (to ?? form.dateFrom) < today) errors.dateFrom = "Der Termin liegt in der Vergangenheit.";
  const from = form.timeFrom?.trim();
  const until = form.timeTo?.trim();
  if (from && !TIME.test(from)) errors.timeFrom = "Bitte die Uhrzeit als HH:MM eingeben.";
  if (until && !TIME.test(until)) errors.timeTo = "Bitte die Uhrzeit als HH:MM eingeben.";
  else if (until && !from) errors.timeTo = "Bitte zuerst die Anfangszeit eingeben.";
  else if (until && from && !to && !errors.timeFrom && until <= from) errors.timeTo = "Das Ende liegt vor dem Anfang.";
  if (form.place.trim().length > PLACE_MAX) errors.place = `Der Ort darf höchstens ${PLACE_MAX} Zeichen lang sein.`;
  if (form.note.trim()) {
    const noteError = validateHomeworkText(form.note);
    if (noteError) errors.note = noteError.replace("Die Aufgabe", "Der Hinweis").replace("in der Aufgabe", "im Hinweis");
  }
  return errors;
}

// Підказка під датою: «Montag · in 12 Tagen»
export function dateHint(iso, today) {
  if (!isIsoDate(iso)) return null;
  const days = daysBetween(today, iso);
  return `${weekdayLong(iso)} · ${days >= 0 ? daysLeftText(days) : "vorbei"}`;
}

// ── Календар (.ics) ──

const icsText = (value) => value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
const icsDate = (iso) => iso.replace(/-/g, "");

// Файл для «Kalender»: без часу — подія на весь день (DTEND — день після останнього), з часом — за часом школи
export function appointmentIcs(item, stamp) {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//ORBook//Termine//DE", "BEGIN:VEVENT", `UID:termin-${item.id}@orbook`, `DTSTAMP:${stamp}`];
  if (item.timeFrom) {
    const end = item.timeTo ?? item.timeFrom;
    lines.push(`DTSTART;TZID=Europe/Berlin:${icsDate(item.dateFrom)}T${item.timeFrom.replace(":", "")}00`);
    lines.push(`DTEND;TZID=Europe/Berlin:${icsDate(lastDay(item))}T${end.replace(":", "")}00`);
  } else {
    lines.push(`DTSTART;VALUE=DATE:${icsDate(item.dateFrom)}`, `DTEND;VALUE=DATE:${icsDate(addDays(lastDay(item), 1))}`);
  }
  lines.push(`SUMMARY:${icsText(item.title)}`);
  if (item.place) lines.push(`LOCATION:${icsText(item.place)}`);
  if (item.note) lines.push(`DESCRIPTION:${icsText(item.note)}`);
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\r\n");
}
