import { create } from "zustand";
import { TOUR_STEPS } from "../utils/tour";

// ─────────────────────────────────────────────────────────────
// Rundgang (часть 52): что сейчас на экране. Не сохраняется: перезагрузил страницу — тур закрыт
// (после первого входа флаг tourPending в userStore уже снят, повтор — из Mehr).
// phase: null — тура нет, "welcome" — приветствие, "tour" — шаг step
// ─────────────────────────────────────────────────────────────
export const useTourStore = create((set) => ({
  phase: null,
  step: 0,
  welcome: () => set({ phase: "welcome", step: 0 }),
  begin: () => set({ phase: "tour", step: 0 }),
  // Следующий шаг; после последнего тур закрывается (finished — показать тост)
  next: () => set((s) => (s.step + 1 < TOUR_STEPS.length ? { step: s.step + 1 } : { phase: null, step: 0 })),
  close: () => set({ phase: null, step: 0 }),
}));
