import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getAndroidRelease } from "../api/android";
import { dayKey } from "../utils/android";

// ─────────────────────────────────────────────────────────────
// androidStore — обновление Android-App (часть 31a).
// В localStorage ("orbook.android") только день последней проверки: проверяем раз в день.
// release — ответ GET /api/public/android: undefined — ещё не спрашивали, null — APK на сервере нет. download — ход загрузки нового APK.
// ─────────────────────────────────────────────────────────────
export const useAndroidStore = create(
  persist(
    (set) => ({
      checkedOn: null,
      release: undefined,
      checking: false,
      download: null, // { loaded, total }, пока качается

      // Спросить сервер; ошибка (нет сети) — пробрасываем, день не отмечаем: проверим при следующем старте
      check: async () => {
        set({ checking: true });
        try {
          const release = await getAndroidRelease();
          set({ release, checkedOn: dayKey(new Date()) });
          return release;
        } finally {
          set({ checking: false });
        }
      },

      setDownload: (download) => set({ download }),
    }),
    { name: "orbook.android", partialize: (state) => ({ checkedOn: state.checkedOn }) },
  ),
);
