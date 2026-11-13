import { create } from "zustand";
import { deleteTelegram, getTelegram } from "../api/telegram";

// ─────────────────────────────────────────────────────────────
// telegramStore — подключён ли личный чат с ботом на этом устройстве (часть 27b).
// Ничего не хранит в localStorage: правду знает только сервер (GET /api/telegram).
// Общий для карточки в «Mitteilungen» и шторки «Mit Telegram verbinden».
// ─────────────────────────────────────────────────────────────
export const useTelegramStore = create((set) => ({
  status: null, // ответ /api/telegram или null, пока не знаем
  load: async () => {
    try {
      const status = await getTelegram();
      set({ status });
      return status;
    } catch {
      return null; // нет сети — карточку просто не показываем
    }
  },
  disconnect: async () => {
    await deleteTelegram();
    set((s) => ({ status: s.status && { ...s.status, connected: false, connectedAt: null } }));
  },
}));
