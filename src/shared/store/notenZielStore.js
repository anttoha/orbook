import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─────────────────────────────────────────────────────────────
// notenZielStore — цели по оценкам (часть 42): только на этом устройстве и в Sync (зашифрованно, с частью «Noten»).
// ziele: { "1:ma": { ziel: 2, k: 2 }, "1:*": { ziel: 2 } } (ключи — zielKey из utils/notenZiel).
// stamp — когда цели здесь менялись: по нему Sync понимает, что новее. «Abmelden» цели не трогает.
// ─────────────────────────────────────────────────────────────
export const useNotenZielStore = create(
  persist(
    (set, get) => ({
      ziele: {},
      stamp: null,

      // goal = null — убрать цель
      setZiel: (key, goal) => {
        const ziele = { ...get().ziele };
        if (goal) ziele[key] = goal;
        else delete ziele[key];
        set({ ziele, stamp: new Date().toISOString() });
      },

      // Пришло через Sync с другого устройства
      setSynced: (value, stamp) => set({ ziele: value ?? {}, stamp }),
    }),
    { name: "orbook.notenziel" },
  ),
);
