// ─────────────────────────────────────────────────────────────
// «Start» из блоков (часть 30c). Раскладка — просто список { id, kind, size, opts }:
// только порядок и размер, без координат. Сетка CSS сама раскладывает его
// на 2 колонки (телефон) или 4 (ПК), поэтому одна раскладка годится для обоих.
// Здесь — чистые функции без React: их легко проверить тестом.
// ─────────────────────────────────────────────────────────────

// Размеры: Klein — одна колонка, Breit и Groß — две (Groß показывает больше строк)
export const SIZES = ["klein", "breit", "gross"];
export const SIZE_LABELS = { klein: "Klein", breit: "Breit", gross: "Groß" };

// Все виды блоков. sizes — какие размеры у блока бывают (первый — по умолчанию),
// opts — настройки блока по умолчанию, feature — раздел, который школа может выключить (me.features)
export const BLOCKS = [
  { kind: "jetzt", label: "Jetzt", hint: "Aktuelle und nächste Stunde", sizes: ["breit"] },
  { kind: "heute", label: "Heute", hint: "Alle Stunden des Tages", sizes: ["breit", "gross"] },
  { kind: "woche", label: "Woche", hint: "Die ganze Woche im Kleinen", sizes: ["gross"] },
  { kind: "tests", label: "Tests", hint: "Was als Nächstes ansteht", sizes: ["klein", "breit", "gross"], opts: { count: 2, mine: true } },
  { kind: "aufgaben", label: "Aufgaben", hint: "Offene Hausaufgaben", sizes: ["klein", "breit"] },
  { kind: "aenderungen", label: "Änderungen", hint: "Ausfall und Vertretung", sizes: ["klein", "breit"] },
  { kind: "termine", label: "Termine", hint: "Ferien, Elternabend, Ausflug", sizes: ["klein", "breit"], opts: { count: 2 } },
  { kind: "notizen", label: "Notizen", hint: "Deine letzten Notizen", sizes: ["klein", "breit"] },
  { kind: "materialien", label: "Materialien", hint: "Neue Links der Klasse", sizes: ["klein", "breit"] },
  { kind: "statistik", label: "Statistik", hint: "Ausfall in dieser Woche", sizes: ["klein"], feature: "statistics" },
  { kind: "countdown", label: "Countdown", hint: "Tage bis zu den Ferien", sizes: ["klein"] },
];

// Сколько строк показывают Tests и Termine (настройка «Einträge»)
export const COUNTS = [2, 3, 5];

export const blockInfo = (kind) => BLOCKS.find((b) => b.kind === kind) ?? null;

// Раскладка по умолчанию (spec): Jetzt, Tests, Aufgaben, Woche, Änderungen, Notizen.
// id = вид: каждый блок на Start бывает только один раз
const DEFAULT_KINDS = ["jetzt", "tests", "aufgaben", "woche", "aenderungen", "notizen"];
export const defaultBlocks = () => DEFAULT_KINDS.map(makeBlock);

function makeBlock(kind) {
  const info = blockInfo(kind);
  return { id: kind, kind, size: info.sizes[0], opts: { ...info.opts } };
}

// Блок раздела, который школа выключила, не показывается и не предлагается.
// features ещё не пришли (undefined) — показываем всё, чтобы Start не «прыгал»
export const isBlockEnabled = (info, features) => !info.feature || features?.[info.feature] !== false;

// Раскладка из хранилища (или из Sync старой/новой версии) → годная раскладка:
// незнакомые виды и повторы отбрасываются, размер, которого у блока нет, — первый допустимый.
// null (ещё ничего не меняли) → по умолчанию; [] — законный выбор «пусто»
export function blocksOf(saved) {
  if (!Array.isArray(saved)) return defaultBlocks();
  const seen = new Set();
  const out = [];
  for (const item of saved) {
    const info = blockInfo(item?.kind);
    if (!info || seen.has(info.kind)) continue;
    seen.add(info.kind);
    const size = info.sizes.includes(item.size) ? item.size : info.sizes[0];
    out.push({ id: info.kind, kind: info.kind, size, opts: { ...info.opts, ...(item.opts ?? {}) } });
  }
  return out;
}

// Добавить блок в конец (уже есть — ничего не меняем)
export const addBlock = (blocks, kind) => (!blockInfo(kind) || blocks.some((b) => b.kind === kind) ? blocks : [...blocks, makeBlock(kind)]);

export const removeBlock = (blocks, id) => blocks.filter((b) => b.id !== id);

// Перенести блок id на место блока overId (так отдаёт перетаскивание)
export function moveBlock(blocks, id, overId) {
  const from = blocks.findIndex((b) => b.id === id);
  const to = blocks.findIndex((b) => b.id === overId);
  if (from < 0 || to < 0 || from === to) return blocks;
  const next = [...blocks];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

// Поставить размер (только допустимый для блока)
export const resizeBlock = (blocks, id, size) =>
  blocks.map((b) => (b.id === id && blockInfo(b.kind).sizes.includes(size) ? { ...b, size } : b));

// Стрелки в углу блока: следующий размер по кругу
export function nextSize(block) {
  const sizes = blockInfo(block.kind).sizes;
  return sizes[(sizes.indexOf(block.size) + 1) % sizes.length];
}

export const setBlockOpt = (blocks, id, key, value) => blocks.map((b) => (b.id === id ? { ...b, opts: { ...b.opts, [key]: value } } : b));

// Классы сетки для размера: телефон — 2 колонки, ПК — 4 (на ПК в «Anpassen» — 3, справа список)
export const SPAN = { klein: "col-span-1", breit: "col-span-2", gross: "col-span-2 row-span-2" };
