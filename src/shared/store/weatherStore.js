// ─────────────────────────────────────────────────────────────
// weatherStore.js — погода для «Woche», «Tag» и шторки (часть 50a).
// Сначала показываем сохранённый ответ (offlineCache), потом спрашиваем сервер.
// Сервер сам обновляет прогноз раз в 30 минут — чаще 15 минут не спрашиваем.
// 204 (погоды нет) — тоже ответ: сохраняем null, чтобы старый прогноз не всплыл.
// ─────────────────────────────────────────────────────────────
import { create } from "zustand";
import { isUnavailable } from "../api/api";
import { cache } from "../api/offlineCache";
import { loadWeather } from "../api/weather";

const KEY = "weather";
const FRESH_MS = 15 * 60 * 1000;
const EMPTY = { data: null, status: "idle", savedAt: null, loadedAt: 0 };
let request = null;
let generation = 0; // другой класс — ответ для прошлого выбрасываем (как в appointmentsStore)

export const useWeatherStore = create((set, get) => ({
  ...EMPTY,

  // status: idle → loading → ready | offline | error. savedAt — у сохранённого («Stand gestern 21:30»)
  load: () => {
    if (request) return request;
    const mine = generation;
    if (get().status === "idle") {
      const saved = cache.load(KEY);
      set(saved ? { data: saved.data, status: "loading", savedAt: saved.savedAt } : { status: "loading" });
    }
    const current = (async () => {
      try {
        const data = await loadWeather();
        if (mine !== generation) return;
        cache.save(KEY, data);
        set({ data, status: "ready", savedAt: null, loadedAt: Date.now() });
      } catch (error) {
        if (mine !== generation) return;
        const saved = isUnavailable(error) ? cache.load(KEY) : null;
        // нет сети — последний прогноз; другая ошибка — погоды просто нет (без текста)
        set(saved ? { data: saved.data, status: "offline", savedAt: saved.savedAt, loadedAt: Date.now() } : { data: null, status: "error", loadedAt: Date.now() });
      } finally {
        if (request === current) request = null;
      }
    })();
    request = current;
    return current;
  },

  // Показ экрана: грузим, если ещё не грузили или прошло 15 минут
  ensure: () => (Date.now() - get().loadedAt > FRESH_MS ? get().load() : null),

  // Другой класс / выход
  reset: () => {
    generation += 1;
    request = null;
    set(EMPTY);
  },
}));
