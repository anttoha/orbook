import { create } from "zustand";
import { EMPTY_FILTER } from "../utils/exams";

// Фільтр Klausuren. Окреме сховище, бо вікно фільтра малює SheetHost поза сторінкою,
// а бачити вибір потрібно обом. На пристрої не зберігається: новий запуск показує все
export const useExamFilter = create((set) => ({
  filter: EMPTY_FILTER,
  setFilter: (filter) => set({ filter }),
  resetFilter: () => set({ filter: EMPTY_FILTER }),
}));
