// ─────────────────────────────────────────────────────────────
// materialsStore.js — список Materialien (GET /api/materials) для сторінки і вікна уроку.
// Окремо від planStore: список потрібен рідко, вантажимо, коли його вперше показують.
// Без мережі — останній збережений список (offlineCache), як у Klausuren.
// ─────────────────────────────────────────────────────────────
import { create } from "zustand";
import { api } from "../api/api";
import { loadWithCache } from "../api/offlineCache";

const EMPTY = { items: [], status: "idle", savedAt: null, error: null, freshId: null };
let request = null; // один запит одночасно

export const useMaterials = create((set, get) => ({
  ...EMPTY,

  // status: idle → loading → ready | offline | unavailable | error
  load: async () => {
    if (request) return request;
    if (get().status === "idle" || get().status === "error") set({ status: "loading", error: null });
    request = (async () => {
      try {
        const { data, status, savedAt, error } = await loadWithCache("materials", () => api("/materials"));
        set({ items: data?.materials ?? [], status, savedAt, error: error ?? null });
      } catch (error) {
        set({ status: "error", error });
      } finally {
        request = null;
      }
    })();
    return request;
  },

  // Щойно збережене посилання (мітка «Neu» у списку); null — прибрати
  markFresh: (id) => set({ freshId: id }),

  // Після запису: перечитати список і позначити збережене
  saved: (item) => {
    set({ freshId: item?.id ?? null });
    return get().load();
  },

  // Перший показ: вантажимо, лише якщо ще не вантажили
  ensure: () => (get().status === "idle" ? get().load() : null),

  // Після виходу з класу
  reset: () => set(EMPTY),
}));
