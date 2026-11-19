import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getAndroidRelease } from "../api/android";
import { dayKey } from "../utils/android";

// ─────────────────────────────────────────────────────────────
// androidStore — обновление Android-App (часть 31a).
// В localStorage ("orbook.android"): день последней проверки (раз в день), закрыта ли карточка в Mehr (31c), открывали ли страницу (метка «Neu»).
// release — ответ GET /api/public/android: undefined — ещё не спрашивали, null — APK на сервере нет. download — ход загрузки нового APK.
// ─────────────────────────────────────────────────────────────
export const useAndroidStore = create(
  persist(
    (set) => ({
      checkedOn: null,
      cardDismissed: false, // карточку «ORBook für Android» в Mehr закрыли ✕
      seen: false, // страницу «Android-App» уже открывали — «Neu» гаснет
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
      dismissCard: () => set({ cardDismissed: true }),
      markSeen: () => set({ seen: true }),
    }),
    { name: "orbook.android", partialize: ({ checkedOn, cardDismissed, seen }) => ({ checkedOn, cardDismissed, seen }) },
  ),
);
