import { useState } from "react";
import { useExamFilter } from "../store/examFilterStore";
import { usePlanStore } from "../store/planStore";
import { filterExams } from "../utils/exams";
import { usePastExams } from "./useExams";
import { useNow } from "./useNow";

// ─────────────────────────────────────────────────────────────
// Чернетка фільтра Klausuren: вибір застосовується лише кнопкою «3 anzeigen».
// Спільна для шторки (телефон) і випадного вікна (ПК).
// open — вікно відкрите: при кожному відкритті починаємо з того, що застосовано зараз
// ─────────────────────────────────────────────────────────────
export const useExamFilterDraft = (open) => {
  const { today } = useNow();
  const applied = useExamFilter((s) => s.filter);
  const setFilter = useExamFilter((s) => s.setFilter);
  const exams = usePlanStore((s) => s.exams);
  const past = usePlanStore((s) => s.pastExams);

  // Закрите вікно ще видно до кінця анімації, тому стан не зникає сам — скидаємо його при відкритті
  const [draft, setDraft] = useState(applied);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDraft(applied);
  }

  usePastExams(open && draft.past); // число на кнопці рахується і для минулих

  return {
    draft,
    change: (part) => setDraft({ ...draft, ...part }), // поміняти частину чернетки
    setDraft,
    apply: () => setFilter(draft), // «3 anzeigen»
    count: filterExams(draft.past ? past.exams : exams, draft, today).length,
    pastLoading: draft.past && past.status === "loading",
  };
};
