// ─────────────────────────────────────────────────────────────
// entries.js — записи на урок (часть 24): виды с Kürzel, «verschoben von …», следующий урок предмета,
// записи конкретного урока. Без React — всё проверяется тестами (entries.test.js).
// ─────────────────────────────────────────────────────────────
import { numericDate, weekdayShort } from "./format";

export const DETAILS_MAX = 300;
export const MATERIALS_MAX = 5;

// Виды по умолчанию — как на сервере (docs/API.md «meta»), пока meta не пришла или сервер старый
export const DEFAULT_TYPES = [
  { name: "Klassenarbeit", short: "KA" },
  { name: "Leistungskontrolle", short: "LK" },
  { name: "Test", short: "T" },
  { name: "Abgabe", short: "AB" },
];

// Kürzel, если сервер его не прислал: первые буквы слов («Mündliche Prüfung» → «MP»), одно слово — «Re»
export function defaultShort(name) {
  const known = DEFAULT_TYPES.find((type) => type.name === name);
  if (known) return known.short;
  const words = (name ?? "").split(/[\s\-/]+/).filter(Boolean);
  if (words.length > 1) return words.slice(0, 4).map((word) => word[0]).join("").toUpperCase();
  return name ? name.slice(0, 2).replace(/^./, (c) => c.toUpperCase()) : "?";
}

// Виды из meta: новый сервер — examTypeList, старый — только имена (examTypes)
export function typeList(meta) {
  if (meta?.examTypeList?.length) return meta.examTypeList;
  if (meta?.examTypes?.length) return meta.examTypes.map((name) => ({ name, short: defaultShort(name) }));
  return DEFAULT_TYPES;
}

// Kürzel вида для клетки недели. Вид могли удалить из списка — тогда считаем сами
export const typeShort = (type, list) => list.find((item) => item.name === type)?.short ?? defaultShort(type);

// Главный вид (крупный, закрашенный бейдж): Klassenarbeit, а у старых записей — Klausur
export const isMajorType = (type) => type === "Klassenarbeit" || type === "Klausur";

// «Mi 17.09., 3. Std»
export const slotText = (date, lesson) => `${weekdayShort(date)} ${numericDate(date)}${lesson ? `, ${lesson}. Std` : ""}`;

// «von Mi 17.09., 3. Std» — сервер перенёс запись (movedFrom); обычно null
export const movedFromText = (entry) => (entry?.movedFrom?.date ? `von ${slotText(entry.movedFrom.date, entry.movedFrom.lesson)}` : null);

// Описание к Test: несколько строк, без контактов и ссылок (как clean_details на сервере). null — всё хорошо
export function validateDetails(value) {
  const text = (value ?? "").trim();
  if (text.length > DETAILS_MAX) return `Die Beschreibung darf höchstens ${DETAILS_MAX} Zeichen lang sein.`;
  // eslint-disable-next-line no-control-regex -- ищем именно управляющие символы, кроме переноса строки
  if (/[\u0000-\u0009\u000b-\u001f\u007f-\u009f]/.test(text)) return "Die Beschreibung enthält ungültige Zeichen.";
  if (/[^\s@]+@[^\s@]+\.[^\s@]+/.test(text)) return "Bitte keine E-Mail-Adressen in der Beschreibung.";
  if (/(https?:\/\/|www\.|\b[a-z0-9-]+\.(?:de|com|net|org|eu|io|app|info|ru|me|ly)\b)/i.test(text)) return "Links bitte als Material anhängen.";
  for (const run of text.match(/[+\d][\d\s/()-]*/g) ?? []) {
    if ((run.match(/\d/g) ?? []).length >= 9) return "Bitte keine Telefonnummern in der Beschreibung.";
  }
  return null;
}

// Уроки дня: опубликованный план, иначе Muster (expectedLessons). Выпавшие не считаются
const lessonsOf = (day) => (day?.lessons?.length ? day.lessons : day?.expectedLessons ?? []).filter((lesson) => lesson.status !== "cancelled");

// Следующие уроки предмета после (date, period): [{ date, period }], не больше count.
// days — дни загруженных недель (в любом порядке). Не нашли — меньше элементов (форма покажет «Anderes Datum»)
export function nextLessons(days, subject, from, count = 2) {
  if (!subject) return [];
  // один день может прийти дважды (из двух загруженных недель) — повторы убираем
  const unique = [...new Map(days.filter((day) => day?.date >= from.date).map((day) => [day.date, day])).values()];
  const sorted = unique.sort((a, b) => a.date.localeCompare(b.date));
  const found = [];
  for (const day of sorted) {
    const periods = [...new Set(lessonsOf(day).filter((lesson) => lesson.subject?.code === subject).map((lesson) => lesson.period))].sort((a, b) => a - b);
    for (const period of periods) {
      if (day.date === from.date && period <= (from.period ?? 99)) continue;
      // двойной урок (3 и 4 подряд) — одна «Stunde»: берём только первый урок блока
      if (found.at(-1)?.date === day.date && found.at(-1).last === period - 1) {
        found.at(-1).last = period;
        continue;
      }
      found.push({ date: day.date, period, last: period });
      if (found.length > count) break;
    }
    if (found.length > count) break;
  }
  return found.slice(0, count).map(({ date, period }) => ({ date, period }));
}

// Записи нажатого урока: Tests с этим днём/уроком/предметом и Hausaufgaben «bis zu dieser Stunde»
export function lessonEntries(exams, homework, date, lesson) {
  const code = lesson?.subject?.code;
  if (!code) return { exams: [], homework: [] };
  const here = (item, day) => day === date && item.subject?.code === code && (item.lesson == null || item.lesson === lesson.period);
  return {
    exams: exams.filter((exam) => here(exam, exam.date)),
    homework: homework.filter((item) => here(item, item.due) && item.lesson != null),
  };
}

// Записи, которые сервер увёз с этого (выпавшего) урока: «Test Unit 3 → Fr 19.09., 4. Std»
export function movedAway(exams, date, lesson) {
  const code = lesson?.subject?.code;
  return exams.filter((exam) => exam.movedFrom?.date === date && exam.movedFrom.lesson === lesson.period && exam.subject?.code === code);
}
