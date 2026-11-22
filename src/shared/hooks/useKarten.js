import { useMemo } from "react";
import { translate } from "../i18n/translate";
import { useClasses } from "../store/classesStore";
import { useKartenStore } from "../store/kartenStore";
import { usePlanStore } from "../store/planStore";
import { deckExam, liveDecks } from "../utils/karten";

// ─────────────────────────────────────────────────────────────
// Karteikarten (часть 43): стопки без «надгробков», одна стопка, её тест, имя предмета.
// ─────────────────────────────────────────────────────────────
export function useDecks() {
  const decks = useKartenStore((s) => s.decks);
  return useMemo(() => liveDecks(decks), [decks]);
}

export const useDeck = (id) => useKartenStore((s) => s.decks.find((deck) => deck.id === id && !deck.deleted)) ?? null;

// Тест стопки по свежему списку тестов открытого класса (могли перенести или удалить)
export function useDeckExam(deck) {
  const exams = usePlanStore((s) => s.exams);
  const cls = useClasses((s) => s.activeId);
  return deck ? deckExam(deck, exams, cls) : null;
}

// Код предмета → имя («En» → «Englisch»); без предмета — «Ohne Fach»
export function useSubjectName() {
  const names = usePlanStore((s) => s.meta?.subjects);
  return (code) => (code ? (names?.[code] ?? code) : translate("Ohne Fach"));
}
