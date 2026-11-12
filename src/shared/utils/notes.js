// ─────────────────────────────────────────────────────────────
// Нотатки на пристрої та їх синхронізація (за /opt/orbook-be/docs/frontend/06-notizen.md).
// Сервер бачить тільки зашифрований блок; шифрування — syncCrypto.js.
// Нотатка: { id, text, date: "2026-10-07", subject: "Ma" | null, period: 2 | null, updatedAt: ISO, deleted?: true }
// ─────────────────────────────────────────────────────────────

import { planMomentText } from "./format";

const TOMBSTONE_DAYS = 30; // видалена нотатка живе як «надгробок», щоб видалення дійшло до інших пристроїв

// id: у нотатки до уроку сталий («дата#урок») — на двох пристроях це одна нотатка
export const noteId = (date, period) => (period ? `${date}#${period}` : `${date}#${crypto.randomUUID()}`);

export const newNote = (text, { date = null, subject = null, period = null } = {}, now = new Date()) => ({
  id: noteId(date, period),
  text,
  date,
  subject,
  period,
  updatedAt: now.toISOString(),
});
export const editNote = (note, patch, now = new Date()) => ({ ...note, ...patch, updatedAt: now.toISOString() });
export const deleteNote = (note, now = new Date()) => ({ ...note, text: "", deleted: true, updatedAt: now.toISOString() });
export const visibleNotes = (notes) => notes.filter((n) => !n.deleted);

// Злиття за id: перемагає новіший updatedAt (при рівності — видалена).
// Старі надгробки (понад 30 днів) викидаємо. Сортування за id — однаковий результат на всіх пристроях.
export function mergeNotes(local, remote, now = new Date()) {
  const byId = new Map();
  for (const n of [...remote, ...local]) {
    const have = byId.get(n.id);
    if (!have || n.updatedAt > have.updatedAt || (n.updatedAt === have.updatedAt && n.deleted && !have.deleted)) byId.set(n.id, n);
  }
  const cutoff = new Date(now.getTime() - TOMBSTONE_DAYS * 86400000).toISOString();
  return [...byId.values()].filter((n) => !(n.deleted && n.updatedAt < cutoff)).sort((a, b) => (a.id < b.id ? -1 : 1));
}

export const sameNotes = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export const upgradeNote = (n) => ({
  ...n,
  subject: n.subject ?? null,
  period: n.period ?? null,
  updatedAt: typeof n.updatedAt === "number" ? new Date(n.updatedAt).toISOString() : (n.updatedAt ?? new Date(0).toISOString()),
});

// Чіпи «Zu Fach · optional»: предмети уроків дня без повторів і без null; предмет нотатки — теж
export function noteSubjects(lessons = [], current = null) {
  const codes = lessons.map((l) => l.subject?.code).filter(Boolean);
  return [...new Set(current ? [...codes, current] : codes)];
}

// Підпис під нотаткою: «Sport · 6. Std · nur für dich», «Mathe · nur für dich» або «nur für dich».
// subjectLabel — назва предмета (або null), period — номер уроку (або null)
export const noteMeta = (subjectLabel, period) => [subjectLabel, period ? `${period}. Std` : null, "nur für dich"].filter(Boolean).join(" · ");

// Знайти живу нотатку за id (надгробки не показуємо)
export const findNote = (notes, id) => notes.find((n) => n.id === id && !n.deleted);

// Тексти помилок синхронізації (docs/frontend/06-notizen.md, «Состояния и ошибки»)
export function syncErrorText(error) {
  if (error?.message === "wrong_code") return "Code passt nicht zu den Notizen";
  if (error?.message === "conflict") return "Notizen konnten nicht abgeglichen werden. Später erneut versuchen.";
  if (error?.message === "too_big") return "Zu viele Notizen zum Synchronisieren";
  if (error?.code === "sync_full") return "Der Sync-Speicher ist voll.";
  if (error?.code === "offline" || error?.code === "timeout") return "Nicht synchronisiert — keine Verbindung";
  return error?.message || "Nicht synchronisiert";
}

// Місцевий час пристрою як "2026-11-06T07:40" (синхронізація — це час телефона, а не школи)
const localMoment = (date) => {
  const two = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())}T${two(date.getHours())}:${two(date.getMinutes())}`;
};

// «Zuletzt synchronisiert heute 07:40 · 6 Notizen» / «Noch nicht synchronisiert · 1 Notiz»
export function syncedText(lastSyncAt, now = new Date()) {
  if (!lastSyncAt) return "Noch nicht synchronisiert";
  return `Zuletzt synchronisiert ${planMomentText(localMoment(new Date(lastSyncAt)), localMoment(now).slice(0, 10))} · alles aktuell`;
}
