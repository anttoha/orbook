import { create } from "zustand";

// ─────────────────────────────────────────────────────────────
// Подсветка вкладок после правки на странице «Untere Leiste» (часть 38).
// Не сохраняется и не едет в Sync: это только мгновенный отклик на свою правку.
// stamp меняется при каждой правке — подсветка той же вкладки запускается заново
// ─────────────────────────────────────────────────────────────
export const useNavFlashStore = create((set) => ({
  device: null, // "phone" | "pc"
  keys: [], // ключи разделов, id групп и "mehr"
  stamp: 0,
  flash: (device, keys) => set((s) => (keys.length ? { device, keys, stamp: s.stamp + 1 } : s)),
  clear: () => set({ device: null, keys: [] }),
}));

// Номер подсветки для этой вкладки или 0 — для key у <NavFlash>
export const useNavFlash = (device, key) => useNavFlashStore((s) => (s.device === device && s.keys.includes(key) ? s.stamp : 0));
