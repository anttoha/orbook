import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CARDS_MAX, answer, editDeck, newCard, newDeck, removeDeck, resetCards } from "../utils/karten";

// ─────────────────────────────────────────────────────────────
// kartenStore — Karteikarten (часть 43): стопки и Lernstand.
// Только на устройстве (localStorage «orbook.karten»); с Sync-Code — ещё во втором зашифрованном блоке (kartenSync.js).
// Удалённые стопки — «надгробки» (deleted), чтобы удаление дошло до других устройств; экраны берут liveDecks().
// Любая правка стопки (и ответ в «Lernen») меняет её updatedAt — по нему Sync понимает, что новее.
// ─────────────────────────────────────────────────────────────
export const useKartenStore = create(
  persist(
    (set, get) => {
      // Поменять одну стопку: change(deck) → поля, которые меняются
      const change = (id, fn) => set({ decks: get().decks.map((deck) => (deck.id === id && !deck.deleted ? editDeck(deck, fn(deck)) : deck)) });

      return {
        decks: [],

        addDeck: (fields) => {
          const deck = newDeck(fields);
          set({ decks: [...get().decks, deck] });
          return deck.id;
        },
        updateDeck: (id, patch) => change(id, () => patch),
        deleteDeck: (id) => set({ decks: get().decks.map((deck) => (deck.id === id ? removeDeck(deck) : deck)) }),
        resetDeck: (id) => change(id, (deck) => ({ cards: resetCards(deck.cards) })),

        addCards: (id, cards) => change(id, (deck) => ({ cards: [...deck.cards, ...cards.map(newCard)].slice(0, CARDS_MAX) })),
        updateCard: (id, cardId, { a, b }) => change(id, (deck) => ({ cards: deck.cards.map((card) => (card.id === cardId ? { ...card, a: a.trim(), b: b.trim() } : card)) })),
        deleteCard: (id, cardId) => change(id, (deck) => ({ cards: deck.cards.filter((card) => card.id !== cardId) })),

        // Ответ в «Lernen»: карточка уходит в другую коробку (karten.answer)
        answerCard: (id, cardId, known, today) => change(id, (deck) => ({ cards: deck.cards.map((card) => (card.id === cardId ? answer(card, known, today) : card)) })),

        // Результат синхронизации: слитый список
        setSynced: (decks) => set({ decks }),
      };
    },
    { name: "orbook.karten" },
  ),
);
