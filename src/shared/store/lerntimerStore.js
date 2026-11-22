import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_SETTINGS, breakAfter, isOver, nextRound, pauseRun, phaseEnd, resumeRun, sessionOf, startRun, timesOf } from "../utils/lerntimer";

// ─────────────────────────────────────────────────────────────
// lerntimerStore — Lerntimer (часть 44). Только на устройстве (localStorage «orbook.lerntimer»);
// с Sync-Code сессии и настройки ещё и в своём зашифрованном блоке (lerntimerSync.js). Идущий таймер — только здесь.
//   run     — идёт фокус или перерыв (utils/lerntimer: startRun) или null;
//   round   — какой раунд следующий/текущий (1…rounds);
//   done    — только что закончился фокус: { min, code, round } — для шторки «Runde geschafft!»;
//   code    — выбранный предмет (null — «Ohne Fach»).
// Время приходит снаружи (now), чтобы переходы можно было проверить тестом.
// ─────────────────────────────────────────────────────────────
export const useLerntimerStore = create(
  persist(
    (set, get) => {
      const times = () => timesOf(get().settings);
      const addSession = (session) => session && set({ sessions: [...get().sessions, session] });

      // Фокус кончился (или остановлен): засчитать минуты
      const closeFocus = (now) => {
        const { run } = get();
        const session = sessionOf(run, now);
        addSession(session);
        return session;
      };

      // Начать перерыв после раунда round
      const startBreak = (round, now) => set({ run: startRun("pause", { code: get().code, round, minutes: breakAfter(round, times()).minutes }, now) });

      return {
        settings: DEFAULT_SETTINGS,
        settingsStamp: null, // когда настройки меняли здесь (для Sync)
        sessions: [],
        run: null,
        round: 1,
        done: null,
        code: null,

        setCode: (code) => set({ code }),
        // Готовый режим «25», «50» или «eigene»; patch — свои минуты и Ton/Vibration
        setSettings: (patch) => set({ settings: { ...get().settings, ...patch }, settingsStamp: new Date().toISOString() }),

        start: (now) => set({ run: startRun("focus", { code: get().code, round: get().round, minutes: times().focus }, now), done: null }),
        pause: (now) => get().run && set({ run: pauseRun(get().run, now) }),
        resume: (now) => get().run && set({ run: resumeRun(get().run, now) }),

        // «Stopp» посреди фокуса: прошедшие минуты засчитываются, раунды — сначала
        stop: (now) => {
          if (get().run?.phase === "focus") closeFocus(now);
          set({ run: null, round: 1, done: null });
        },

        // Проверка раз в секунду (и при открытии): фаза кончилась?
        // Возвращает, что случилось: "focus" (раунд готов), "pause" (перерыв кончился) или null
        settle: (now) => {
          const { run } = get();
          if (!isOver(run, now)) return null;
          const end = phaseEnd(run); // когда фаза кончилась на самом деле (вкладку могли открыть позже)
          if (run.phase === "pause") {
            set({ run: null, round: nextRound(run.round, times()) });
            return "pause";
          }
          const session = closeFocus(end);
          // «Pause von selbst starten» — шторки нет, перерыв сразу (с конца раунда); иначе шторка «Runde geschafft!»
          if (get().settings.autoPause) startBreak(run.round, end);
          else set({ run: null, done: { min: session?.min ?? 0, code: run.code, round: run.round } });
          return "focus";
        },

        // Шторка «Runde geschafft!»: перерыв или «Fertig für heute»
        takeBreak: (now) => {
          const { done } = get();
          if (!done) return;
          set({ done: null });
          startBreak(done.round, now);
        },
        finishDay: () => set({ run: null, round: 1, done: null }),
        // Шторку закрыли без выбора — как «Pause überspringen»: следующий раунд
        closeDone: () => get().done && set({ done: null, round: nextRound(get().done.round, times()) }),

        // «Pause überspringen»
        skipBreak: () => {
          const { run } = get();
          if (run?.phase !== "pause") return;
          set({ run: null, round: nextRound(run.round, times()) });
        },

        // Результат синхронизации
        setSynced: ({ sessions, settings }) => {
          const patch = { sessions };
          if (settings && settings.updatedAt !== get().settingsStamp) Object.assign(patch, { settings: { ...DEFAULT_SETTINGS, ...settings.value }, settingsStamp: settings.updatedAt });
          set(patch);
        },
      };
    },
    {
      name: "orbook.lerntimer",
      partialize: (s) => ({ settings: s.settings, settingsStamp: s.settingsStamp, sessions: s.sessions, run: s.run, round: s.round, code: s.code, done: s.done }),
    },
  ),
);

// Блок для Sync: сессии и настройки (если их здесь меняли)
export const timerBlockOf = () => {
  const { sessions, settings, settingsStamp } = useLerntimerStore.getState();
  return { sessions, settings: settingsStamp ? { value: settings, updatedAt: settingsStamp } : null };
};
