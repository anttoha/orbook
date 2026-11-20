import { create } from "zustand";
import { persist } from "zustand/middleware";
import { appNotenData, appNotenLogout, appNotenState, fetchNoten, fetchNotenApp, hasAppNoten } from "../api/noten";
import { freshKeys, newerAppData } from "../utils/noten";
import { usePlanStore } from "./planStore";

// ─────────────────────────────────────────────────────────────
// notenStore — Noten aus Home.InfoPoint (часть 36b).
// data — последний ответ школы (это и есть кеш: видно без сети); stamp — когда data здесь поменялась
// (загрузка или «Abmelden») — по нему Sync понимает, что новее.
// Логин InfoPoint: «Angemeldet bleiben» — имя и пароль в localStorage этого устройства, иначе — только
// в памяти до перезагрузки. В Sync логин никогда не попадает (решение владельца 2026-11-20).
// Android-App (часть 36c): запрос идёт из приложения прямо в InfoPoint, пароль с «Angemeldet bleiben»
// приложение хранит само (зашифрованно) — здесь он только в памяти.
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
        const { username, password, remember, busy } = get();
        if (busy) return null;
        const app = hasAppNoten();
        if (!username || (!password && !(app && appNotenState()?.saved))) {
          set({ loginOpen: true });
          return "no_login";
        }
        set({ busy: true });
        try {
          const data = app ? await fetchNotenApp({ url: usePlanStore.getState().meta?.infopointUrl, username, password, remember }) : await fetchNoten(username, password);
          get().take(data);
          set({ error: null, loginOpen: false });
          return null;
        } catch (error) {
          const code = errorCode(error);
          const loginAgain = code === "denied" || code === "no_login";
          const shown = code === "no_login" ? null : { code, retryAfter: error?.retryAfter ?? error?.details?.retryAfter ?? null };
          set({ error: shown, ...(loginAgain ? { password: "", loginOpen: true } : {}) });
          return code;
        } finally {
          set({ busy: false });
        }
      },

      // Новый ответ InfoPoint: «neu» — оценки, которых раньше не было
      take: (data) => set({ data, stamp: new Date().toISOString(), fresh: [...new Set([...get().fresh, ...freshKeys(get().data, data)])] }),

      // Android-App проверяла InfoPoint в фоне (часть 36c) — взять её оценки, если они новее наших
      pullApp: () => {
        if (!hasAppNoten()) return;
        const fresh = newerAppData(get().data, appNotenData());
        if (fresh) get().take(fresh);
        const saved = appNotenState();
        if (saved?.saved && !get().username && saved.username) set({ username: saved.username });
      },

      // «Abmelden»: логин и оценки стираются здесь, а через Sync — и на других устройствах
      logout: () => {
        appNotenLogout();
        set({ data: null, stamp: new Date().toISOString(), fresh: [], username: "", password: "", error: null, loginOpen: false });
      },

      closeLogin: () => set({ loginOpen: false, error: null }),
      clearError: () => set({ error: null }),

      // Предмет открыли — его «neu» больше не «neu»
      markSeen: (code) => set({ fresh: get().fresh.filter((key) => !key.startsWith(`${code}|`)) }),

      // Пришло через Sync с другого устройства
      setSynced: (value, stamp) => set({ data: value, stamp, fresh: value ? get().fresh : [] }),
    }),
    {
      name: "orbook.noten",
      // пароль и имя — только с «Angemeldet bleiben»; в приложении пароль хранит само приложение
      partialize: (s) => ({ data: s.data, stamp: s.stamp, fresh: s.fresh, remember: s.remember, username: s.remember ? s.username : "", password: s.remember && !hasAppNoten() ? s.password : "" }),
      onRehydrateStorage: () => (state) => state?.pullApp(),
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
    case "no_login":
      return "no_login"; // в приложении нет сохранённого пароля — снова вход
    default:
      return "unreachable"; // 502, сеть, таймаут, офлайн
  }
}

// Вернулись в открытое приложение — может, фон уже принёс новые оценки
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => document.visibilityState === "visible" && useNotenStore.getState().pullApp());
}
