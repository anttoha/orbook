import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useClasses } from "./classesStore";

// ─────────────────────────────────────────────────────────────
// calendarFeedStore — что устройство помнит про Kalender-Abo (часть 40), отдельно для каждого класса:
// есть ли абонемент, «Meine Kurse» ли и что в нём. Нужно без запроса: строка «Mehr» пишет «an»,
// а смена «Meine Kurse» сразу отправляет новые курсы (useCalendarFeedCourses).
// Сама ссылка живёт на сервере — её здесь нет.
// ─────────────────────────────────────────────────────────────
export const classKey = (id) => String(id ?? "home");

export const useCalendarFeedStore = create(
  persist(
    (set, get) => ({
      byClass: {},
      // feed с сервера (или null — абонемента нет) → запомнить для открытого класса
      remember: (feed) => {
        const key = classKey(useClasses.getState().activeId);
        const entry = feed ? { on: true, mine: feed.mine, items: feed.items } : { on: false };
        set({ byClass: { ...get().byClass, [key]: entry } });
      },
    }),
    { name: "orbook.calendarFeed" },
  ),
);

// Запись открытого класса: { on, mine, items } или undefined (ещё не открывали «Kalender-Abo»)
export const useCalendarFeedOfClass = () => {
  const key = classKey(useClasses((s) => s.activeId));
  return useCalendarFeedStore((s) => s.byClass[key]);
};
