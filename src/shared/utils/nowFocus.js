// ─────────────────────────────────────────────────────────────
// «Für dich jetzt» (часть 50b): что показать прямо сейчас. Одна чистая функция над тем,
// что уже загружено (план, погода, задания, тесты, Termine); блок на Start только рисует ответ.
// Ту же логику повторит виджет Android (50c), поэтому правила — здесь и в тестах.
// Отрезки дня по порядку: ferien → morgen → stunde → pause → nachmittag → abend.
// ─────────────────────────────────────────────────────────────
import { translate } from "../i18n/translate";
import { coversDay, isFree, lastDay } from "./appointments";
import { addDays, daysBetween, nextSchoolDay, subjectName } from "./format";
import { berlinParts, lessonProgress, lessonState, toMinutes } from "./lessonClock";
import { dayOf, hourAt, leaveTime, weatherTips } from "./weather";

const CHANGED = ["cancelled", "substitution", "moved", "added", "room_change"];
export const isChanged = (lesson) => CHANGED.includes(lesson.status);
const active = (lessons) => lessons.filter((l) => l.status !== "cancelled");
const byTime = (a, b) => (a.start && b.start ? toMinutes(a.start) - toMinutes(b.start) : (a.period ?? 0) - (b.period ?? 0));
const clockMinutes = (hhmm) => (/^\d{2}:\d{2}$/.test(hhmm ?? "") ? toMinutes(hhmm) : 17 * 60);

// Уроки дня (null — день не загружен; не «ok» — уроков нет)
const lessonsOfDay = (day) => (day?.status === "ok" ? [...(day.lessons ?? [])].sort(byTime) : []);

// Главные уроки дня для списка: первый урок + изменённые, остальное — по порядку; всё по времени.
// changesFirst: false («Änderungen» выключены) — просто первые n
export function keyLessons(lessons, n = 3, changesFirst = true) {
  const sorted = [...lessons].sort(byTime);
  const first = sorted.find((l) => l.status !== "cancelled");
  const wanted = changesFirst ? [first, ...sorted.filter(isChanged), ...sorted] : sorted;
  const picked = [];
  for (const lesson of wanted) if (lesson && !picked.includes(lesson) && picked.length < n) picked.push(lesson);
  return picked.sort(byTime);
}

// Первая вещь предмета («Sportsachen!» справа в «Danach») или null
export const itemFor = (lesson, settings) => (settings.show.mitnehmen ? (settings.items[lesson.subject?.code]?.[0] ?? null) : null);

// Справа у урока: «fällt aus», «Vertretung · Kle · 204», «Raum 014 statt 012» или «Web · 102»
export function lessonAside(lesson, t = translate, changes = true) {
  const place = [lesson.teacher, lesson.room].filter(Boolean).join(" · ");
  if (!changes) return { text: place, className: "text-faint" };
  if (lesson.status === "cancelled") return { text: t("fällt aus"), className: "font-extrabold text-danger" };
  if (["substitution", "moved", "added"].includes(lesson.status)) return { text: [t("Vertretung"), place].filter(Boolean).join(" · "), className: "font-bold text-accent-ink" };
  const oldRoom = lesson.changes?.room?.old;
  if (lesson.status === "room_change" && oldRoom) return { text: t("Raum {a} statt {b}", { a: lesson.room, b: oldRoom }), className: "font-bold text-accent-ink" };
  return { text: place, className: "text-faint" };
}

// «Что взять» в день: погода → тесты → вещи по предметам (без повторов).
// → [{ key, label, kind: "wetter" | "test" | "fach" }]
export function packList({ lessons = [], exams = [], weatherDay = null, leaveHour = null, settings }) {
  const out = [];
  if (settings.show.wetter) for (const tip of weatherTips(weatherDay, leaveHour, settings.tips)) out.push({ ...tip, kind: "wetter" });
  if (settings.show.tests && settings.testReminder) {
    for (const exam of exams) out.push({ key: `test-${exam.id}`, label: translate("Test: {fach}", { fach: subjectName(exam.subject) }), kind: "test" });
  }
  if (settings.show.mitnehmen) {
    const seen = new Set();
    for (const lesson of active(lessons)) {
      for (const item of settings.items[lesson.subject?.code] ?? []) {
        const low = item.toLocaleLowerCase("de");
        if (seen.has(low)) continue;
        seen.add(low);
        out.push({ key: `fach-${low}`, label: item, kind: "fach" });
      }
    }
  }
  return out;
}

// Задания до дня date включительно (просроченные тоже): открытые строки из aufgabenList
const homeworkUntil = (homework, date) => homework.filter((row) => row.due && row.due <= date);
// Тесты в дни [from, to]
const examsBetween = (exams, from, to) => exams.filter((exam) => exam.date >= from && exam.date <= to);

// Что про следующий учебный день: «Für morgen» и «Nächster Schultag»
function aheadOf(kind, date, { days, weather, homework, exams, appointments, settings }) {
  const lessons = lessonsOfDay(days[date]);
  return {
    kind,
    date,
    loaded: Boolean(days[date]),
    weatherDay: settings.show.wetter ? dayOf(weather, date) : null,
    first: active(lessons)[0] ?? null,
    lessons: keyLessons(lessons, 3, settings.show.aenderungen),
    dayLessons: lessons, // все уроки дня: блоку нужно меньше строк, когда есть задания
    changes: settings.show.aenderungen ? lessons.filter(isChanged) : [],
    homework: settings.show.hausaufgaben ? homeworkUntil(homework, date) : [],
    exams: settings.show.tests ? examsBetween(exams, date, addDays(date, 2)) : [],
    appointments: settings.show.termine ? appointments.filter((item) => coversDay(item, date)) : [],
  };
}

// Идут каникулы (Termin вида «Frei», который покрывает сегодня)?
function ferienOf(today, { appointments, holidays, homework, exams, weather, settings }) {
  const item = appointments.filter(isFree).find((a) => coversDay(a, today));
  if (!item) return null;
  const backOn = nextSchoolDay(lastDay(item), holidays);
  const total = daysBetween(item.dateFrom, backOn);
  return {
    kind: "ferien",
    item,
    backOn,
    daysFree: daysBetween(today, backOn),
    progress: total > 0 ? daysBetween(item.dateFrom, today) / total : null,
    weatherDay: settings.show.wetter ? dayOf(weather, today) : null,
    // первый тест и первое задание после каникул
    exams: settings.show.tests ? exams.filter((e) => e.date >= backOn).slice(0, 1) : [],
    homework: settings.show.hausaufgaben ? homework.filter((row) => row.due && row.due >= today).slice(0, 1) : [],
  };
}

// input: { now, today, days: { [date]: day | null }, weather, homework (открытые строки aufgabenList),
//          exams (уже отфильтрованы «Nur meine Kurse»), appointments, holidays, settings }
// days[date] — день с уроками, уже отфильтрованными по курсам (null — не загружен).
// Ответ: { kind: "loading" | "ferien" | "morgen" | "stunde" | "pause" | "nachmittag" | "abend", … }
export function nowFocus(input) {
  const { now, today, days, weather, exams = [], holidays = [], settings } = input;
  const ctx = { ...input, homework: input.homework ?? [], exams, appointments: input.appointments ?? [], holidays };

  const ferien = ferienOf(today, ctx);
  if (ferien) return ferien;

  const todayDay = days[today];
  if (!todayDay) return { kind: "loading", date: today };

  const minutes = berlinParts(now).minutes;
  const lessons = lessonsOfDay(todayDay);
  const live = lessonState(lessons, now);
  const next = nextSchoolDay(today, holidays);
  const weatherDay = settings.show.wetter ? dayOf(weather, today) : null;
  const hasLessons = active(lessons).length > 0;
  const firstStart = hasLessons ? toMinutes(active(lessons)[0].start ?? "00:00") : null;

  // Плана на сегодня нет (ещё не вышел, сервер недоступен) — утро без уроков: погода и что надеть
  if (todayDay.status !== "ok" && todayDay.status !== "holiday") {
    return { kind: "morgen", date: today, leave: null, leaveIn: null, weatherDay, leaveHour: null, lessons: [], pack: packList({ weatherDay, settings }) };
  }

  if (hasLessons && !live.over) {
    if (live.current) {
      const after = active(lessons).filter((l) => l.start && toMinutes(l.start) >= toMinutes(live.current.end)).slice(0, 2);
      const rainLater = weatherDay?.rainFrom != null && weatherDay.rainFrom * 60 > minutes ? weatherDay : null;
      return { kind: "stunde", date: today, lesson: live.current, minutesLeft: live.minutesLeft, progress: lessonProgress(live.current, now), after, rain: rainLater };
    }
    if (firstStart != null && minutes < firstStart) {
      const leave = leaveTime(lessons, settings.leaveMinutes);
      const leaveHour = hourAt(weatherDay, leave);
      const todaysExams = exams.filter((e) => e.date === today);
      return {
        kind: "morgen",
        date: today,
        leave,
        leaveIn: leave ? toMinutes(leave) - minutes : null, // ≤ 0 — «los!»
        weatherDay,
        leaveHour,
        lessons: keyLessons(lessons, 3, settings.show.aenderungen),
        pack: packList({ lessons, exams: todaysExams, weatherDay, leaveHour, settings }),
      };
    }
    if (live.next) {
      const after = active(lessons).filter((l) => l !== live.next && l.start && toMinutes(l.start) > toMinutes(live.next.start)).slice(0, 2);
      return { kind: "pause", date: today, lesson: live.next, inMinutes: live.breakMinutes, oldRoom: live.next.changes?.room?.old ?? null, after };
    }
  }

  // Уроки кончились (или сегодня их нет): до «Abends ab» — «Für morgen», если завтра учебный день; иначе — следующий учебный
  const tomorrow = addDays(today, 1);
  if (hasLessons && minutes < clockMinutes(settings.eveningFrom) && next === tomorrow) return aheadOf("nachmittag", next, ctx);
  return aheadOf("abend", next, ctx);
}

// Сколько дней надо загрузить: сегодня и следующий учебный день
export const focusDates = (today, holidays = []) => [today, nextSchoolDay(today, holidays)];
