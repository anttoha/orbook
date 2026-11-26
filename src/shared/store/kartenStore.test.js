import { beforeEach, describe, expect, it } from "vitest";
import { useKartenStore } from "./kartenStore";
import { CARDS_MAX, DECKS_MAX, cardsLimitError, deckLimitError } from "../utils/karten";

const cards = (n) => Array.from({ length: n }, (_, i) => ({ a: `a${i}`, b: `b${i}` }));
const store = () => useKartenStore.getState();

describe("Karteikarten: лимиты (часть 48)", () => {
  beforeEach(() => useKartenStore.setState({ decks: [] }));

  it("501-я карточка не добавляется, и об этом сказано", () => {
    const id = store().addDeck({ name: "Voll", cards: cards(CARDS_MAX - 1) });
    expect(store().addCards(id, cards(1))).toBe(true);
    expect(store().addCards(id, cards(1))).toBe(false);
    expect(store().decks[0].cards).toHaveLength(CARDS_MAX);
    expect(cardsLimitError(CARDS_MAX, 1)).toBe("Höchstens 500 Karten pro Stapel.");
  });

  it("слишком длинный список не обрезается молча", () => {
    expect(store().addDeck({ name: "Zu lang", cards: cards(CARDS_MAX + 1) })).toBeNull();
    expect(store().decks).toHaveLength(0);
    expect(deckLimitError([], CARDS_MAX + 1)).toBe("Höchstens 500 Karten pro Stapel.");
  });

  it("61-я стопка не создаётся; удалённые не считаются", () => {
    const ids = Array.from({ length: DECKS_MAX }, (_, i) => store().addDeck({ name: `S${i}` }));
    expect(store().addDeck({ name: "zu viel" })).toBeNull();
    expect(deckLimitError(store().decks)).toBe("Höchstens 60 Stapel. Lösch zuerst einen alten.");
    store().deleteDeck(ids[0]);
    expect(store().addDeck({ name: "passt" })).not.toBeNull();
  });
});
