// ─────────────────────────────────────────────────────────────
// «Aufgaben» (часть 25): домашки класса + свои задачи, галочка «erledigt».
// Всё это живёт только на устройстве (и в зашифрованном Sync-блоке). Класс галочек не видит.
// Своя задача: { id: "t-…", text, due: "2026-09-19" | null, subject: "De" | null, done, updatedAt, deleted? }
// Галочка у домашки: { id: "<id домашки>", done, updatedAt }
// ─────────────────────────────────────────────────────────────
import { addDays, isWeekend, mondayOf, numericDate, weekdayShort } from "./format";
import { groupHomework } from "./homework";

export const TASK_MAX = 120;
const DONE_VISIBLE_DAYS = 14; // сделанные свои задачи видны в «Erledigt» две недели

export const newTask = ({ text, due = null, subject = null }, now = new Date()) => ({
  id: `t-${crypto.randomUUID()}`,
  text: text.trim(),
  due,
  subject,
  done: false,
  updatedAt: now.toISOString(),
});
export const editTask = (task, patch, now = new Date()) => ({ ...task, ...patch, updatedAt: now.toISOString() });
// Удаление — «надгробок», чтобы оно дошло до других устройств
export const removeTask = (task, now = new Date()) => ({ ...task, text: "", deleted: true, updatedAt: now.toISOString() });

// Галочка домашки: новая запись вместо старой
export const setMark = (marks, id, done, now = new Date()) => [...marks.filter((m) => m.id !== String(id)), { id: String(id), done, updatedAt: now.toISOString() }];

export function validateTaskText(value) {
  const text = (value ?? "").trim();
  if (!text) return "Was ist zu tun?";
  if (text.length > TASK_MAX) return `Höchstens ${TASK_MAX} Zeichen.`;
  return null;
}

// Чипы «Bis wann?»: Morgen и следующий учебный день после него (без субботы и воскресенья)
export function dueChoices(today) {
  const tomorrow = addDays(today, 1);
  let next = addDays(tomorrow, 1);
  while (isWeekend(next)) next = addDays(next, 1);
  return [
    { label: "Morgen", value: tomorrow },
    { label: `${weekdayShort(next)} ${numericDate(next)}`, value: next },
  ];
}

// Одна строка списка: домашка класса или своя задача
const homeworkRow = (item, done) => ({ kind: "homework", key: `hw-${item.id}`, id: item.id, item, due: item.due, subject: item.subject?.code ?? null, text: item.text?.split("\n")[0] ?? "", done });
const ownRow = (task) => ({ kind: "own", key: task.id, id: task.id, task, due: task.due, subject: task.subject, text: task.text, done: task.done });

const byDue = (a, b) => (a.due ?? "9999").localeCompare(b.due ?? "9999") || a.key.localeCompare(b.key);

// Список «Aufgaben»: открытые по группам («Bis morgen» … «Ohne Datum») и сделанные отдельно
export function aufgabenList({ homework = [], tasks = [], marks = [], today }) {
  const doneIds = new Set(marks.filter((m) => m.done).map((m) => m.id));
  const rows = [...homework.map((item) => homeworkRow(item, doneIds.has(String(item.id)))), ...tasks.filter((t) => !t.deleted).map(ownRow)].sort(byDue);
  const open = rows.filter((row) => !row.done);
  const since = addDays(today, -DONE_VISIBLE_DAYS);
  const done = rows.filter((row) => row.done && (row.kind === "homework" || row.task.updatedAt.slice(0, 10) >= since));
  const groups = groupHomework(open.filter((row) => row.due), today);
  const undated = open.filter((row) => !row.due);
  if (undated.length > 0) groups.push({ title: "Ohne Datum", items: undated });
  return { groups, open, done };
}

// Строки на один день (блок в дне): домашки этого дня и свои задачи на этот день
export function aufgabenOfDay({ homework = [], tasks = [], marks = [], date }) {
  const doneIds = new Set(marks.filter((m) => m.done).map((m) => m.id));
  return [
    ...homework.filter((item) => item.due === date).map((item) => homeworkRow(item, doneIds.has(String(item.id)))),
    ...tasks.filter((t) => !t.deleted && t.due === date).map(ownRow),
  ];
}

// Карточка «Diese Woche» на ПК: сколько из задач с сроком на этой неделе уже сделано
export function weekProgress({ open, done }, today) {
  const from = mondayOf(today);
  const to = addDays(from, 6);
  const inWeek = (row) => row.due && row.due >= from && row.due <= to;
  const tomorrow = addDays(today, 1);
  return {
    done: done.filter(inWeek).length,
    total: open.filter(inWeek).length + done.filter(inWeek).length,
    dueSoon: open.filter((row) => row.due && row.due <= tomorrow).length,
  };
}
