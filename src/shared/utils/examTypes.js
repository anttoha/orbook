// ─────────────────────────────────────────────────────────────
// examTypes.js — «Arten von Tests» в админке (часть 24) без React: список для PUT /api/admin/exam-types.
// Сервер получает весь список по порядку; переименование — с was (старое имя), тогда меняются и записи.
// ─────────────────────────────────────────────────────────────

export const NAME_MAX = 30;
export const SHORT_MAX = 4;

// Ответ сервера → строки страницы: { name, short, count, was }. was — имя, под которым вид сейчас сохранён
export const toRows = (types) => (types ?? []).map((type) => ({ name: type.name, short: type.short, count: type.count ?? 0, was: type.name }));

// Строки → тело PUT: новые виды без was
export const toPayload = (rows) => rows.map((row) => ({ name: row.name.trim(), short: row.short.trim(), ...(row.was ? { was: row.was } : {}) }));

// Переставить строку from на место to (перетаскивание «⋮⋮»)
export function moveRow(rows, from, to) {
  if (from === to || from < 0 || to < 0 || from >= rows.length || to >= rows.length) return rows;
  const next = [...rows];
  const [row] = next.splice(from, 1);
  next.splice(to, 0, row);
  return next;
}

// Проверка в окне «Art bearbeiten» до отправки (сервер проверит то же): { name?, short? }
export function validateType(form, rows, index) {
  const errors = {};
  const name = form.name.trim();
  const short = form.short.trim();
  const others = rows.filter((_, k) => k !== index);
  if (!name) errors.name = "Bitte einen Namen eintragen.";
  else if (name.length > NAME_MAX) errors.name = `Höchstens ${NAME_MAX} Zeichen.`;
  else if (others.some((row) => row.name.trim().toLowerCase() === name.toLowerCase())) errors.name = `„${name}“ gibt es schon.`;
  if (!/^[A-Za-zÄÖÜäöüß0-9]{1,4}$/.test(short)) errors.short = "1 bis 4 Buchstaben oder Ziffern.";
  else if (others.some((row) => row.short.trim().toLowerCase() === short.toLowerCase())) errors.short = `Kürzel „${short}“ gibt es schon.`;
  return errors;
}

// «3 Einträge» / «1 Eintrag» / «keine Einträge»
export const countText = (count) => (count === 1 ? "1 Eintrag" : count ? `${count} Einträge` : "keine Einträge");
