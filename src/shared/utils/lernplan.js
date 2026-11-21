// ─────────────────────────────────────────────────────────────
// Lernplan zum Test (часть 41): темы теста по дням до него.
// План = обычные свои задачи «Aufgaben» (tasks.js) с полем plan — поэтому они сами едут через Sync.
// plan: { exam: "12", cls, examDate, subject, label, title, topics: [...], weekend, review }
// ─────────────────────────────────────────────────────────────
import { addDays, isWeekend } from "./format";
import { newTask, TASK_MAX } from "./tasks";
import { translate } from "../i18n/translate";

export const MAX_DAYS = 7;
export const DEFAULT_DAYS = 4;
const MAX_TOPICS = 10;
const TOPIC_MAX = 60;

// «Was lernen»: строки, «,» и «;» → темы. Пункты списков («-», «•», «1.») и точка в конце убираются
export function topicsFrom(details) {
  const seen = new Set();
  return (details ?? "")
    .split(/[\n,;]+/)
    .map((part) => part.replace(/^\s*(?:[-•*–]|\d+[.)])\s*/, "").replace(/[.!:]+\s*$/, "").trim().slice(0, TOPIC_MAX))
    .filter((topic) => {
      const key = topic.toLowerCase();
      if (!topic || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, MAX_TOPICS);
}

// Дни для учёбы: от сегодня до дня перед тестом (без Sa/So, если weekend выключен)
export function learnDays(today, examDate, weekend = false) {
  const days = [];
  for (let day = today; day < examDate && days.length < 60; day = addDays(day, 1)) {
    if (weekend || !isWeekend(day)) days.push(day);
  }
  return days;
}

// Сколько дней можно выбрать (не больше 7) и сколько выбрано по умолчанию
export const maxDays = (today, examDate, weekend) => Math.min(MAX_DAYS, learnDays(today, examDate, weekend).length);
export const defaultDays = (max) => Math.min(DEFAULT_DAYS, max);

// Последние n дней перед тестом
export const planDates = (today, examDate, weekend, n) => {
  const days = learnDays(today, examDate, weekend);
  return n > 0 ? days.slice(-n) : [];
};

// Темы на n дней: последний день — «Alles wiederholen»; тем меньше — по кругу, больше — по несколько за день.
// Результат: [{ topics: [...], review: bool }] длиной n
export function distribute(topics, n) {
  if (n <= 0) return [];
  if (n === 1) return [{ topics, review: true }];
  const slots = n - 1;
  const days = [];
  if (topics.length === 0) {
    for (let i = 0; i < slots; i++) days.push({ topics: [], review: false });
  } else if (topics.length <= slots) {
    for (let i = 0; i < slots; i++) days.push({ topics: [topics[i % topics.length]], review: false });
  } else {
    for (let i = 0; i < slots; i++) {
      const from = Math.floor((i * topics.length) / slots);
      const to = Math.floor(((i + 1) * topics.length) / slots);
      days.push({ topics: topics.slice(from, to), review: false });
    }
  }
  days.push({ topics, review: true });
  return days;
}

// Текст задачи дня
export function dayText(day, subjectLabel) {
  if (day.review) return translate("Alles wiederholen");
  if (day.topics.length === 0) return translate("{subject} lernen", { subject: subjectLabel });
  const text = day.topics.join(" · ");
  return text.length > TASK_MAX ? `${text.slice(0, TASK_MAX - 1)}…` : text;
}

// Предпросмотр «So lernst du»: [{ date, text }]
export function preview({ today, examDate, weekend, n, topics, subjectLabel }) {
  const dates = planDates(today, examDate, weekend, n);
  return distribute(topics, dates.length).map((day, i) => ({ date: dates[i], text: dayText(day, subjectLabel), day }));
}

// Что запомнить о тесте в каждой задаче (тест могут удалить — тогда это всё, что останется)
export const examInfo = (exam, cls) => ({
  exam: String(exam.id),
  cls: cls ?? null,
  examDate: exam.date,
  subject: exam.subject?.code ?? null,
  label: exam.subject?.name ?? exam.subject?.code ?? null,
  title: exam.topic ?? null,
});

// Новые задачи плана. Сделанный раньше день с теми же темами остаётся сделанным
export function buildPlanTasks({ exam, cls, today, weekend, n, topics, subjectLabel, old = [] }, now = new Date()) {
  const info = examInfo(exam, cls);
  const doneKeys = new Set(old.filter((task) => task.done).map((task) => dayKey(task.plan)));
  return preview({ today, examDate: exam.date, weekend, n, topics, subjectLabel }).map(({ date, text, day }) => {
    const plan = { ...info, topics: day.topics, weekend, review: day.review };
    return { ...newTask({ text, due: date, subject: info.subject }, now), done: doneKeys.has(dayKey(plan)), plan };
  });
}
const dayKey = (plan) => `${plan?.review ? "R" : ""}${(plan?.topics ?? []).join("\u0001")}`;

// Задачи плана одного теста (без удалённых), по дате
export const planTasksOf = (tasks, examId) =>
  tasks.filter((task) => !task.deleted && task.plan?.exam === String(examId)).sort((a, b) => (a.due ?? "").localeCompare(b.due ?? ""));

// Настройки плана из его задач — для «Ändern»
export function planSettings(planTasks) {
  const topics = [];
  for (const task of planTasks) {
    if (task.plan.review) continue;
    for (const topic of task.plan.topics ?? []) if (!topics.includes(topic)) topics.push(topic);
  }
  // «Alles wiederholen» несёт все темы — у плана из одного дня других нет
  if (topics.length === 0) for (const topic of planTasks.find((task) => task.plan.review)?.plan.topics ?? []) topics.push(topic);
  return { n: planTasks.length, weekend: Boolean(planTasks[0]?.plan.weekend), topics };
}

export const planProgress = (planTasks) => ({ done: planTasks.filter((task) => task.done).length, total: planTasks.length });

// Планы, сгруппированные по тесту: { [examId]: tasks[] }
export function plansByExam(tasks) {
  const out = {};
  for (const task of tasks) {
    if (task.deleted || !task.plan?.exam) continue;
    (out[task.plan.exam] ??= []).push(task);
  }
  return out;
}

// Тест перенесли: несделанные дни — на последние дни перед новой датой, сделанные не трогаем.
// Возвращает изменённые задачи (или [] — если двигать некуда/нечего)
export function shiftPlan(planTasks, newDate, today, now = new Date()) {
  const open = planTasks.filter((task) => !task.done).sort((a, b) => (a.due ?? "").localeCompare(b.due ?? ""));
  const weekend = Boolean(planTasks[0]?.plan.weekend);
  const dates = learnDays(today, newDate, weekend);
  if (dates.length === 0) return [];
  const slots = dates.slice(-open.length);
  const stamp = now.toISOString();
  return planTasks.map((task) => {
    const i = open.indexOf(task);
    const due = i < 0 ? task.due : (slots[i - (open.length - slots.length)] ?? slots[0]);
    return { ...task, due, plan: { ...task.plan, examDate: newDate }, updatedAt: stamp };
  });
}

// Проверка по свежему списку тестов класса cls: какие планы перенести, у каких тест пропал
export function checkPlans(tasks, exams, cls, today) {
  const byId = new Map(exams.map((exam) => [String(exam.id), exam]));
  const moved = [];
  const gone = [];
  for (const [id, list] of Object.entries(plansByExam(tasks))) {
    const plan = list[0].plan;
    if ((plan.cls ?? null) !== (cls ?? null) || plan.kept) continue;
    const exam = byId.get(id);
    if (exam && exam.date !== plan.examDate) moved.push({ id, exam, tasks: list });
    else if (!exam && plan.examDate >= today) gone.push({ id, plan, tasks: list });
  }
  return { moved, gone };
}
