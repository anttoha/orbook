// ─────────────────────────────────────────────────────────────
// planView.js — «Darstellung → Stundenplan» (частина 30b): що писати і як фарбувати клітинку уроку.
// Налаштування лежать у userStore.plan; тут — чисті функції, тому їх легко перевірити тестом.
// Хто нічого не змінював, бачить план як раніше: значення за замовчуванням = старий вигляд.
// ─────────────────────────────────────────────────────────────
import { PALETTES } from "../constants/fachColors";
import { lessonCode, lessonName } from "./format";
import { fachClasses, paletteOf } from "./lessons";

export const PLAN_DEFAULTS = {
  lessonLabel: "kuerzel", // у клітинці тижня на телефоні: "kuerzel" «Ma» | "name" «Mathe»
  showRoom: true,
  showTeacher: false, // раніше в клітинці тижня вчителя не було
  showTimes: true, // «Uhrzeit links»: час біля номера уроку
  subjectStyle: "flaeche", // колір предмета: "flaeche" заливка | "streifen" смужка зліва | "aus" без кольору
  showFree: true, // вільні уроки — сірі клітинки; вимкнено — порожнє місце
  cancelled: "durchstreichen", // урок, що випав: "durchstreichen" | "ausblenden"
  showBreaks: true, // перерви в списку дня
};

// Допустимі значення: старі або чужі (з Sync новішої версії) значення не ламають екран
const CHOICES = {
  lessonLabel: ["kuerzel", "name"],
  subjectStyle: ["flaeche", "streifen", "aus"],
  cancelled: ["durchstreichen", "ausblenden"],
};

// Повні налаштування: збережене + значення за замовчуванням для того, чого немає або що невідоме
export function planOf(saved) {
  const plan = { ...PLAN_DEFAULTS };
  for (const key of Object.keys(PLAN_DEFAULTS)) {
    const value = saved?.[key];
    if (CHOICES[key] ? CHOICES[key].includes(value) : typeof value === "boolean") plan[key] = value;
  }
  return plan;
}

// Назва в клітинці тижня: «Ma» або «Mathe»
export const cellTitle = (lesson, plan) => (plan.lessonLabel === "name" ? lessonName(lesson) : lessonCode(lesson));

// Рядок під назвою: «Mü · 108» — лише те, що увімкнено; вчитель і кабінет бувають null
export const cellPlace = (lesson, plan) => [plan.showTeacher && lesson.teacher, plan.showRoom && lesson.room].filter(Boolean).join(" · ");

// Класи кольору клітинки за «Fachfarbe»
export function subjectLook(code, overrides, plan) {
  if (plan.subjectStyle === "aus") return "bg-card text-ink";
  if (plan.subjectStyle === "streifen") return `border-l-4 bg-card text-ink ${PALETTES[paletteOf(code, overrides)].border}`;
  return fachClasses(code, overrides);
}

// Уроки для сітки й списку: «Ausfall · Ausblenden» прибирає уроки, що випали
export const shownLessons = (lessons, plan) => (plan.cancelled === "ausblenden" ? lessons.filter((l) => l.status !== "cancelled") : lessons);

// Значення праворуч від «Stundenplan» у Darstellung: слова того, що увімкнено («Raum», «Uhrzeit»).
// Масив, а не рядок: екран перекладає кожне слово через t()
export const planSummary = (plan) => {
  const words = [plan.lessonLabel === "name" && "Name", plan.showRoom && "Raum", plan.showTeacher && "Lehrkraft", plan.showTimes && "Uhrzeit"].filter(Boolean);
  return words.length ? words : ["Nur Fach"];
};

// «Änderung unter dem Tag» (частина 22): підписи самі вже приклад формату
export const CHANGED_FORMATS = [
  { value: "weekday", label: "Mi 15:15" },
  { value: "date", label: "15.09." },
  { value: "datetime", label: "15.09. 15:15" },
];
export const changedFormatLabel = (format) => (CHANGED_FORMATS.find((f) => f.value === format) ?? CHANGED_FORMATS[0]).label;
