// ─────────────────────────────────────────────────────────────
// appointmentsStore.js — список Termine (GET /api/appointments) для вкладки, тижня і дня.
// Окремо від planStore, як Materialien: вантажимо, коли список уперше потрібен.
// Без мережі — останній збережений список (offlineCache).
// ─────────────────────────────────────────────────────────────
import { create } from "zustand";
import { api } from "../api/api";
import { loadWithCache } from "../api/offlineCache";

const EMPTY = { items: [], status: "idle", savedAt: null, error: null, freshId: null };
let request = null; // один запит одночасно
// Часть 29: номер «поколения». Другой класс (reset) — новое поколение: ответ, который ушёл
// ещё для прошлого класса, выбрасываем — иначе он запишет чужие записи в новый класс
let generation = 0;

export const useAppointmentStore = create((set, get) => ({
  ...EMPTY,

  // status: idle → loading → ready | offline | unavailable | error
  load: async () => {
    if (request) return request;
    if (get().status === "idle" || get().status === "error") set({ status: "loading", error: null });
    const mine = generation;
    const current = (async () => {
      try {
        const { data, status, savedAt, error } = await loadWithCache("appointments", () => api("/appointments"));
        if (mine === generation) set({ items: data?.appointments ?? [], status, savedAt, error: error ?? null });
      } catch (error) {
        if (mine === generation) set({ status: "error", error });
      } finally {
        if (request === current) request = null;
      }
    })();
    request = current;
    return current;
  },

  // Після запису: перечитати і позначити збережений («Neu» у списку)
  saved: (item) => {
    set({ freshId: item?.id ?? null });
    return get().load();
  },

  // Перший показ: вантажимо, лише якщо ще не вантажили
  ensure: () => (get().status === "idle" ? get().load() : null),

  // Після виходу з класу
  reset: () => {
    generation += 1;
    request = null; // запрос прошлого класса больше не ждём — следующий load пойдёт заново
    set(EMPTY);
  },
}));
