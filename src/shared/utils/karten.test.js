import { describe, expect, it } from "vitest";
import { allSafe, answer, boxCounts, cleanSides, deckExam, decksForExam, dueCount, examRef, frontSide, groupDecks, learnQueue, newDeck, nextRound, parseList, removeDeck, resetCards, sessionResult, validateDeckName } from "./karten";

const TODAY = "2025-09-17";
const card = (box, due = null, id = `c${box}${due}`) => ({ id, a: "a", b: "b", box, due });
const deck = (cards, extra = {}) => ({ id: "k-1", name: "Unit 3", subject: "En", sides: ["Englisch", "Deutsch"], first: "a", exam: null, cards, updatedAt: "x", ...extra });

describe("Leitner", () => {
  it("«Weiß ich» двигает в следующую коробку: 1, 2, 4, 8 дней, в 5-й ещё раз — 16", () => {
    expect(answer(card(1), true, TODAY)).toMatchObject({ box: 2, due: "2025-09-18" });
    expect(answer(card(2), true, TODAY)).toMatchObject({ box: 3, due: "2025-09-19" });
    expect(answer(card(3), true, TODAY)).toMatchObject({ box: 4, due: "2025-09-21" });
    expect(answer(card(4), true, TODAY)).toMatchObject({ box: 5, due: "2025-09-25" });
    expect(answer(card(5), true, TODAY)).toMatchObject({ box: 5, due: "2025-10-03" });
  });
  it("«Weiß ich nicht» — в первую, снова завтра", () => {
    expect(answer(card(4, "2025-09-17"), false, TODAY)).toMatchObject({ box: 1, due: "2025-09-18" });
  });
  it("fällig: без даты или дата ≤ сегодня", () => {
    expect(dueCount(deck([card(1), card(2, "2025-09-17"), card(3, "2025-09-18")]), TODAY)).toBe(2);
    expect(dueCount(null, TODAY)).toBe(0);
  });
  it("коробки и «alles sicher»", () => {
    const d = deck([card(1, "2025-09-30"), card(5, "2025-09-30"), card(5, "2025-10-01"), card(9, "2025-09-30")]);
    expect(boxCounts(d)).toEqual([1, 0, 0, 0, 3]);
    expect(allSafe(d, TODAY)).toBe(false);
    expect(allSafe(deck([card(4, "2025-09-30"), card(5, "2025-10-01")]), TODAY)).toBe(true);
    expect(allSafe(deck([]), TODAY)).toBe(false);
  });
  it("сброс — все снова «Neu»", () => {
    expect(resetCards([card(4, "2025-09-30")])[0]).toMatchObject({ box: 1, due: null });
  });
});

describe("Lernen", () => {
  it("очередь: только fällige, меньшая коробка раньше", () => {
    const d = deck([card(3, null, "x3"), card(1, null, "x1"), card(2, "2025-09-30", "later"), card(2, null, "x2")]);
    expect(learnQueue(d, TODAY, { random: () => 0 }).map((c) => c.id)).toEqual(["x1", "x2", "x3"]);
    expect(learnQueue(d, TODAY, { all: true, random: () => 0 })).toHaveLength(4);
  });
  it("сторона: a, b или случайно", () => {
    expect(frontSide("a")).toBe("a");
    expect(frontSide("b")).toBe("b");
    expect(frontSide("mix", () => 0.1)).toBe("a");
    expect(frontSide("mix", () => 0.9)).toBe("b");
  });
  it("итог и следующая порция", () => {
    const before = deck([card(1, null, "p"), card(2, null, "q")]);
    const after = deck([card(2, "2025-09-18", "p"), card(1, "2025-09-18", "q")]);
    expect(sessionResult(before, after, [{ known: true }, { known: false }])).toEqual({ known: 1, unknown: 1, counts: [1, 1, 0, 0, 0], moved: [0, 0, 0, 0, 0] });
    expect(nextRound([after, deck([card(3, "2025-09-20")])], TODAY)).toEqual({ date: "2025-09-18", count: 2 });
    expect(nextRound([deck([card(1)])], TODAY)).toBeNull();
  });
});

describe("parseList", () => {
  it("разные разделители, пустые строки и повторы", () => {
    const text = "the journey – die Reise\nsuitcase - der Koffer\n\nto arrive\tankommen\nabroad = im Ausland\nthe journey – die Reise\nluggage";
    expect(parseList(text)).toEqual({
      cards: [{ a: "the journey", b: "die Reise" }, { a: "suitcase", b: "der Koffer" }, { a: "to arrive", b: "ankommen" }, { a: "abroad", b: "im Ausland" }],
      errors: [7],
    });
  });
  it("слово с дефисом внутри не режется, пустая сторона — ошибка", () => {
    expect(parseList("well-known - bekannt\nfoo -")).toEqual({ cards: [{ a: "well-known", b: "bekannt" }], errors: [2] });
    expect(parseList(null)).toEqual({ cards: [], errors: [] });
  });
});

describe("стопки", () => {
  it("новая стопка: стороны по умолчанию, карточки в «Neu»", () => {
    const d = newDeck({ name: "  Zelle  ", sides: ["", "Erklärung"], cards: [{ a: "Kern", b: "Zentrale" }] });
    expect(d).toMatchObject({ name: "Zelle", sides: ["Vorderseite", "Erklärung"], subject: null });
    expect(d.cards[0]).toMatchObject({ a: "Kern", b: "Zentrale", box: 1, due: null });
    expect(cleanSides(null)).toEqual(["Vorderseite", "Rückseite"]);
  });
  it("удаление — надгробок", () => {
    expect(removeDeck(deck([card(1)]))).toMatchObject({ deleted: true, cards: [], name: "" });
  });
  it("имя", () => {
    expect(validateDeckName(" ")).toBeTruthy();
    expect(validateDeckName("x".repeat(61))).toBeTruthy();
    expect(validateDeckName("Unit 3")).toBeNull();
  });
  it("группы по предмету, без предмета — последней", () => {
    const g = groupDecks([deck([], { id: "1", name: "B", subject: null }), deck([], { id: "2", name: "Z", subject: "En" }), deck([], { id: "3", name: "A", subject: "En" }), deck([], { id: "4", name: "C", subject: "Bio" })]);
    expect(g.map((x) => [x.subject, x.decks.map((d) => d.name)])).toEqual([["Bio", ["C"]], ["En", ["A", "Z"]], [null, ["B"]]]);
  });
  it("тест стопки: по свежему списку, другой класс или удалён — null", () => {
    const exams = [{ id: 7, date: "2025-09-26", topic: "Vokabeltest", type: "Test" }];
    const d = deck([], { exam: examRef({ id: 7, date: "2025-09-25", topic: "Vokabeltest", type: "Test" }, 3) });
    expect(deckExam(d, exams, 3)).toBe(exams[0]);
    expect(deckExam(d, exams, 4)).toBeNull();
    expect(deckExam(d, [], 3)).toBeNull();
    expect(deckExam(deck([]), exams, 3)).toBeNull();
    expect(decksForExam([d, { ...d, id: "x", deleted: true }], "7", 3)).toHaveLength(1);
    expect(examRef(null)).toBeNull();
  });
});

describe("сессия", async () => {
  const { sessionQueue, pooled } = await import("./karten");
  it("очередь по стопкам, сторона по настройке стопки", () => {
    const d1 = deck([card(1, null, "a1")], { id: "k1", first: "b" });
    const d2 = deck([card(2, null, "b1"), card(2, "2025-09-30", "b2")], { id: "k2" });
    expect(sessionQueue([d1, d2], TODAY).map((q) => [q.deckId, q.card.id, q.side])).toEqual([["k1", "a1", "b"], ["k2", "b1", "a"]]);
    expect(sessionQueue([d2], TODAY, { all: true })).toHaveLength(2);
    expect(pooled([d1, d2], ["k2"]).cards).toHaveLength(2);
  });
});
