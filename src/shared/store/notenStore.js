import { create } from "zustand";
import { persist } from "zustand/middleware";
import { fetchNoten } from "../api/noten";
import { freshKeys } from "../utils/noten";

// ─────────────────────────────────────────────────────────────
// notenStore — Noten aus Home.InfoPoint (часть 36b).
// data — последний ответ школы (это и есть кеш: видно без сети); stamp — когда data здесь поменялась
// (загрузка или «Abmelden») — по нему Sync понимает, что новее.
// Логин InfoPoint: «Angemeldet bleiben» — имя и пароль в localStorage этого устройства, иначе — только
// в памяти до перезагрузки. В Sync логин никогда не попадает (решение владельца 2026-11-20).
// ─────────────────────────────────────────────────────────────
export const useNotenStore = create(
  persist(
    (set, get) => ({
      data: null,
      stamp: null,
      fresh: [], // ключи «neu»-оценок (gradeKey)
      username: "",
      password: "",
      remember: true,
      busy: false, // идёт запрос к InfoPoint
      error: null, // { code, retryAfter } последней неудачи — в localStorage не храним
      loginOpen: false, // показать вход поверх кеша (пароль неверный или его нет)

      // «Anmelden»: проверить логин запросом и запомнить его
      login: async (username, password, remember) => {
        set({ username, password, remember });
        return get().refresh();
      },

      // Обновить. Нет пароля — открываем вход. Возвращает код ошибки или null
      refresh: async () => {
        const { username, password, busy } = get();
        if (busy) return null;
        if (!username || !password) {
          set({ loginOpen: true });
          return "no_login";
        }
        set({ busy: true });
        try {
          const data = await fetchNoten(username, password);
          set({ data, stamp: new Date().toISOString(), fresh: [...new Set([...get().fresh, ...freshKeys(get().data, data)])], error: null, loginOpen: false });
          return null;
        } catch (error) {
          const code = errorCode(error);
          set({ error: { code, retryAfter: error?.retryAfter ?? error?.details?.retryAfter ?? null }, ...(code === "denied" ? { password: "", loginOpen: true } : {}) });
          return code;
        } finally {
          set({ busy: false });
        }
      },

      // «Abmelden»: логин и оценки стираются здесь, а через Sync — и на других устройствах
      logout: () => set({ data: null, stamp: new Date().toISOString(), fresh: [], username: "", password: "", error: null, loginOpen: false }),

      closeLogin: () => set({ loginOpen: false, error: null }),
      clearError: () => set({ error: null }),

      // Предмет открыли — его «neu» больше не «neu»
      markSeen: (code) => set({ fresh: get().fresh.filter((key) => !key.startsWith(`${code}|`)) }),

      // Пришло через Sync с другого устройства
      setSynced: (value, stamp) => set({ data: value, stamp, fresh: value ? get().fresh : [] }),
    }),
    {
      name: "orbook.noten",
      // пароль и имя — только с «Angemeldet bleiben»
      partialize: (s) => ({ data: s.data, stamp: s.stamp, fresh: s.fresh, remember: s.remember, username: s.remember ? s.username : "", password: s.remember ? s.password : "" }),
    },
  ),
);

// Ошибка сервера → короткий код для экрана
function errorCode(error) {
  switch (error?.code) {
    case "infopoint_denied":
      return "denied";
    case "too_often":
      return "too_often";
    case "rate_limited":
      return "rate_limited";
    case "feature_disabled":
      return "disabled";
    default:
      return "unreachable"; // 502, сеть, таймаут, офлайн
  }
}
