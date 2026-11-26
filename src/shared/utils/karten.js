// ─────────────────────────────────────────────────────────────
// Karteikarten (часть 43): стопки карточек и коробки Leitner. Только чистые функции — их проверяют тесты.
// Стопка: { id: "k-…", name, subject: "En" | null, sides: ["Englisch", "Deutsch"], first: "a" | "b" | "mix",
//           exam: { id, cls, date, type, title } | null, cards: [{ id, a, b, box: 1..5, due: "YYYY-MM-DD" | null }],
//           updatedAt, deleted? }
// Живёт только на устройстве (kartenStore) и в зашифрованном Sync-блоке (kartenSync.js).
// ─────────────────────────────────────────────────────────────
import { addDays } from "./format";
import { translate } from "../i18n/translate";

export const NAME_MAX = 60;
export const SIDE_MAX = 30;
export const TEXT_MAX = 120;
export const CARDS_MAX = 500;
export const DECKS_MAX = 60;
export const BOXES = 5;
// «Weiß ich» → карточка в коробке 2, 3, 4, 5 придёт снова через 1, 2, 4, 8 дней; в коробке 5 ещё раз — через 16
const WAIT_DAYS = { 2: 1, 3: 2, 4: 4, 5: 8 };
const TOP_WAIT = 16;
export const SAFE_BOX = 4; // «sicher» — коробки 4 и 5
export const DEFAULT_SIDES = ["Vorderseite", "Rückseite"];

const uid = (prefix) => `${prefix}-${crypto.randomUUID()}`;
const clip = (text, max) => (text ?? "").trim().slice(0, max);

export const newCard = ({ a, b }) => ({ id: uid("c"), a: clip(a, TEXT_MAX), b: clip(b, TEXT_MAX), box: 1, due: null });

export const newDeck = ({ name, subject = null, sides = DEFAULT_SIDES, first = "a", exam = null, cards = [] }, now = new Date()) => ({
  id: uid("k"),
  name: clip(name, NAME_MAX),
  subject,
  sides: cleanSides(sides),
  first,
  exam,
  cards: cards.slice(0, CARDS_MAX).map(newCard),
  updatedAt: now.toISOString(),
});

export const editDeck = (deck, patch, now = new Date()) => ({ ...deck, ...patch, updatedAt: now.toISOString() });
// Удаление — «надгробок» без карточек, чтобы оно дошло до других устройств
export const removeDeck = (deck, now = new Date()) => ({ ...deck, name: "", cards: [], exam: null, deleted: true, updatedAt: now.toISOString() });

// Пустое имя стороны — «Vorderseite» / «Rückseite»
export const cleanSides = (sides) => [0, 1].map((i) => clip(sides?.[i], SIDE_MAX) || DEFAULT_SIDES[i]);
export const sideName = (deck, side) => translate(cleanSides(deck.sides)[side === "a" ? 0 : 1]);

export function validateDeckName(value) {
  const name = (value ?? "").trim();
  if (!name) return translate("Wie heißt der Stapel?");
  if (name.length > NAME_MAX) return translate("Höchstens {TASK_MAX} Zeichen.", { TASK_MAX: NAME_MAX });
  return null;
}

// ── Лимиты (часть 48): одна проверка для всех мест, где добавляют. Текст ошибки или null ──

// Ещё adding карточек в стопку, где их уже have
export const cardsLimitError = (have, adding) => (have + adding > CARDS_MAX ? translate("Höchstens {n} Karten pro Stapel.", { n: CARDS_MAX }) : null);

// Новая стопка с adding карточками (удалённые стопки не считаются)
export function deckLimitError(decks, adding = 0) {
  if (liveDecks(decks).length >= DECKS_MAX) return translate("Höchstens {n} Stapel. Lösch zuerst einen alten.", { n: DECKS_MAX });
  return cardsLimitError(0, adding);
}

// ── Leitner ──

export const isDue = (card, today) => !card.due || card.due <= today;
export const dueCards = (deck, today) => (deck?.cards ?? []).filter((card) => isDue(card, today));
export const dueCount = (deck, today) => dueCards(deck, today).length;
export const totalDue = (decks, today) => decks.reduce((sum, deck) => sum + dueCount(deck, today), 0);

// Ответ на карточку. known — «Weiß ich». Возвращает новую карточку
export function answer(card, known, today) {
  if (!known) return { ...card, box: 1, due: addDays(today, 1) };
  if (card.box >= BOXES) return { ...card, box: BOXES, due: addDays(today, TOP_WAIT) };
  const box = card.box + 1;
  return { ...card, box, due: addDays(today, WAIT_DAYS[box]) };
}

// Сколько карточек в каждой коробке: [Neu, 2, 3, 4, Sicher]
export function boxCounts(deck) {
  const counts = Array(BOXES).fill(0);
  for (const card of deck?.cards ?? []) counts[Math.min(Math.max(card.box ?? 1, 1), BOXES) - 1] += 1;
  return counts;
}

export const safeCount = (deck) => (deck?.cards ?? []).filter((card) => card.box >= SAFE_BOX).length;
// «alles sicher»: карточки есть, ни одной fällig, все в коробках 4–5
export const allSafe = (deck, today) => deck.cards.length > 0 && dueCount(deck, today) === 0 && safeCount(deck) === deck.cards.length;

// Lernstand на нуле: все карточки снова «Neu»
export const resetCards = (cards) => cards.map((card) => ({ ...card, box: 1, due: null }));

// ── Lernen ──

// Перемешать (Fisher–Yates); random — для тестов
export function shuffle(list, random = Math.random) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Очередь: fällige (или все при «Alle üben»), сначала меньшая коробка, внутри — вперемешку
export function learnQueue(deck, today, { all = false, random = Math.random } = {}) {
  const cards = all ? deck.cards : dueCards(deck, today);
  const byBox = new Map();
  for (const card of shuffle(cards, random)) byBox.set(card.box, [...(byBox.get(card.box) ?? []), card]);
  return [...byBox.keys()].sort((x, y) => x - y).flatMap((box) => byBox.get(box));
}

// Какую сторону показать первой: «a», «b» или случайно («mix»)
export const frontSide = (first, random = Math.random) => (first === "mix" ? (random() < 0.5 ? "a" : "b") : first === "b" ? "b" : "a");

// Итог: сколько знал, сколько нет, как сдвинулись коробки (до → после)
export function sessionResult(before, after, answers) {
  const known = answers.filter((a) => a.known).length;
  const counts = boxCounts(after);
  const old = boxCounts(before);
  return { known, unknown: answers.length - known, counts, moved: counts.map((n, i) => n - old[i]) };
}

// Следующая порция: ближайший день, когда что-то станет fällig, и сколько карточек
export function nextRound(decks, today) {
  const dates = decks.flatMap((deck) => deck.cards.map((card) => card.due)).filter((due) => due && due > today);
  if (dates.length === 0) return null;
  const date = dates.sort()[0];
  return { date, count: dates.filter((due) => due === date).length };
}

// ── «Liste»: строки «Wort – Übersetzung» ──

// Разделители по очереди: Tab, « – », « - », «=», «;», «:». Первый найденный делит строку на две стороны
const SEPARATORS = [/\t/, /\s+[–—]\s+/, /\s+-\s+/, /\s*=\s*/, /\s*;\s*/, /\s*:\s*/, /\s*[–—]\s*/];

function splitLine(line) {
  for (const sep of SEPARATORS) {
    const match = line.match(sep);
    if (match) return [line.slice(0, match.index).trim(), line.slice(match.index + match[0].length).trim()];
  }
  return null;
}

// Текст → { cards: [{ a, b }], errors: [номер строки, начиная с 1] }. Пустые строки и повторы пропускаем
export function parseList(text) {
  const cards = [];
  const errors = [];
  const seen = new Set();
  (text ?? "").split(/\r?\n/).forEach((raw, index) => {
    const line = raw.trim();
    if (!line) return;
    const parts = splitLine(line);
    if (!parts || !parts[0] || !parts[1]) return errors.push(index + 1);
    const card = { a: parts[0].slice(0, TEXT_MAX), b: parts[1].slice(0, TEXT_MAX) };
    const key = `${card.a.toLowerCase()}\n${card.b.toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);
    cards.push(card);
  });
  return { cards, errors };
}

// ── Списки ──

// Стопки по предметам: [{ subject, decks }] — группы по Kürzel, без предмета — последней
export function groupDecks(decks) {
  const groups = new Map();
  for (const deck of decks) groups.set(deck.subject ?? null, [...(groups.get(deck.subject ?? null) ?? []), deck]);
  return [...groups.entries()]
    .sort(([a], [b]) => (a === null) - (b === null) || String(a).localeCompare(String(b)))
    .map(([subject, list]) => ({ subject, decks: list.sort((x, y) => x.name.localeCompare(y.name)) }));
}

export const liveDecks = (decks) => (decks ?? []).filter((deck) => !deck.deleted);

// Тест стопки — по свежему списку тестов этого класса (могли перенести). Нет в списке — null
export function deckExam(deck, exams, cls) {
  if (!deck.exam) return null;
  if (deck.exam.cls != null && cls != null && String(deck.exam.cls) !== String(cls)) return null;
  return (exams ?? []).find((exam) => String(exam.id) === String(deck.exam.id)) ?? null;
}

// Снимок теста для стопки
export const examRef = (exam, cls) => (exam ? { id: String(exam.id), cls: cls ?? null, date: exam.date, type: exam.type ?? null, title: exam.topic ?? null } : null);

// Стопки, привязанные к тесту
export const decksForExam = (decks, examId, cls) =>
  liveDecks(decks).filter((deck) => deck.exam && String(deck.exam.id) === String(examId) && (deck.exam.cls == null || cls == null || String(deck.exam.cls) === String(cls)));

// Тесты для поля «Für Test»: только будущие (сегодня и позже), ближайшие сначала
export const upcomingExams = (exams, today) => (exams ?? []).filter((exam) => exam.date >= today).sort((a, b) => a.date.localeCompare(b.date));

// ── Сессия «Lernen» (несколько стопок подряд) ──

// Очередь сессии: [{ deckId, card, side }]. all — «Alle üben» (все карточки, коробки не двигаем)
export function sessionQueue(decks, today, { all = false, random = Math.random } = {}) {
  return decks.flatMap((deck) => learnQueue(deck, today, { all, random }).map((card) => ({ deckId: deck.id, card, side: frontSide(deck.first, random) })));
}

// Все карточки стопок сессии одной «стопкой» — для итога (коробки до и после)
export const pooled = (decks, ids) => ({ cards: decks.filter((deck) => ids.includes(deck.id)).flatMap((deck) => deck.cards) });
