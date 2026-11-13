import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setClassHandlers } from "../api/api";
import { mergeClasses, newClassEntry } from "../utils/classes";

// ─────────────────────────────────────────────────────────────
// classesStore — классы этого устройства (часть 29, «Meine Klassen»).
// Сервер знает только членства (GET /api/auth/me → classes[]); имя на устройстве, цвет, порядок
// и «Beim Start öffnen» живут только здесь (localStorage «orbook-classes»).
//
//   list     — классы по порядку (shared/utils/classes.js: { id, name, school, role, label, color, startOpen, gone })
//   activeId — класс, который сейчас открыт: api.js добавляет его в каждый запрос (X-ORBook-Class)
//   homeId   — класс, который был на устройстве до части 29: только его заметки и курсы идут в Sync-блок (до 29d)
// null — сервер ещё старый (без классов): всё работает как раньше, без заголовка.
// ─────────────────────────────────────────────────────────────
export const useClasses = create(
  persist(
    (set, get) => ({
      list: [],
      activeId: null,
      homeId: null,

      // Ответ /auth/me: слить список, запомнить первый класс как «домашний»
      syncFromServer: (serverClasses, current) => {
        if (!Array.isArray(serverClasses)) return; // старый сервер — классов нет
        set({ list: mergeClasses(get().list, serverClasses), homeId: get().homeId ?? current?.id ?? null });
      },

      setActive: (activeId) => set({ activeId }),

      // Новый класс после «Klasse hinzufügen» (или тот же класс с новым кодом — «Zugang beendet»)
      addClass: (fresh, label = "") => {
        const list = get().list;
        const old = list.find((item) => item.id === fresh.id);
        if (old) return set({ list: list.map((item) => (item.id === fresh.id ? { ...item, gone: false, label: label.trim() || item.label } : item)) });
        set({ list: [...list, newClassEntry(fresh, list, label)] });
      },

      // Имя, цвет — что угодно из записи класса
      update: (id, patch) => set({ list: get().list.map((item) => (item.id === id ? { ...item, ...patch } : item)) }),

      // «Beim Start öffnen»: только у одного класса
      setStartOpen: (id, on) => set({ list: get().list.map((item) => ({ ...item, startOpen: item.id === id ? on : on ? false : item.startOpen })) }),

      // Код класса выключили (403 class_gone) — карточка «Zugang beendet»
      markGone: (id) => id != null && set({ list: get().list.map((item) => (item.id === id ? { ...item, gone: true } : item)) }),

      remove: (id) => set({ list: get().list.filter((item) => item.id !== id), homeId: get().homeId === id ? null : get().homeId }),

      // «Abmelden» из всех классов
      reset: () => set({ list: [], activeId: null }),
    }),
    { name: "orbook-classes", partialize: (s) => ({ list: s.list, activeId: s.activeId, homeId: s.homeId }) },
  ),
);

// Активный класс одной строкой (для компонентов)
export const useActiveClass = () => useClasses((s) => s.list.find((item) => item.id === s.activeId) ?? null);

// api.js спрашивает активный класс при каждом запросе; 403 class_gone — пометить класс
setClassHandlers({
  current: () => useClasses.getState().activeId,
  gone: (id) => useClasses.getState().markGone(id),
});
