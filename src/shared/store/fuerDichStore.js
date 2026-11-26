import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cleanFuerDich, DEFAULT_FUER_DICH } from "../utils/fuerDich";

// ─────────────────────────────────────────────────────────────
// fuerDichStore — настройки «Für dich jetzt» (часть 50b): одни для блока на Start и виджета.
// localStorage «orbook.fuerDich»; с Sync-Code — ещё и свой зашифрованный блок (fuerDichSync.js).
// stamp — когда меняли на этом устройстве: при слиянии побеждает более новое
// ─────────────────────────────────────────────────────────────
export const useFuerDichStore = create(
  persist(
    (set, get) => ({
      settings: DEFAULT_FUER_DICH,
      stamp: null,

      // patch — часть настроек: { leaveMinutes: 30 } или { show: {...} }
      update: (patch) => set({ settings: cleanFuerDich({ ...get().settings, ...patch }), stamp: new Date().toISOString() }),
      setShow: (key, on) => get().update({ show: { ...get().settings.show, [key]: on } }),
      setTip: (key, value) => get().update({ tips: { ...get().settings.tips, [key]: value } }),
      setItems: (items) => get().update({ items }),

      // Пришло из Sync — без новой отметки (это не правка пользователя)
      setSynced: (block) => set({ settings: cleanFuerDich(block.value), stamp: block.updatedAt }),
    }),
    {
      name: "orbook.fuerDich",
      partialize: (s) => ({ settings: s.settings, stamp: s.stamp }),
      // другая версия приложения могла сохранить иначе — проверяем при чтении
      merge: (saved, current) => ({ ...current, settings: cleanFuerDich(saved?.settings), stamp: saved?.stamp ?? null }),
    },
  ),
);

// Блок для Sync: ни разу не меняли здесь — null (тогда берётся пришедшее)
export const fuerDichBlockOf = () => {
  const { settings, stamp } = useFuerDichStore.getState();
  return stamp ? { value: settings, updatedAt: stamp } : null;
};
