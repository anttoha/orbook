import { useEffect } from "react";
import { androidBridge, refreshWidgets, saveSnapshot } from "../api/android";
import { useClasses } from "../store/classesStore";
import { useLanguage } from "../store/languageStore";
import { usePlanStore } from "../store/planStore";
import { useTasksStore } from "../store/tasksStore";
import { useUserStore } from "../store/userStore";
import { buildSnapshot } from "../utils/widgetSnapshot";
import { useTheme } from "./useTheme";

const DELAY_MS = 800; // пишем заметку — снимок уходит после паузы, а не на каждую букву

// ─────────────────────────────────────────────────────────────
// Часть 31b: внутри Android-App держим виджет в курсе того, что живёт только на телефоне
// (классы, «Meine Kurse», заметки, галочки, тема, язык), и просим освежить его после нового плана.
// В браузере моста нет — хук ничего не делает.
// ─────────────────────────────────────────────────────────────
export const useAndroidWidgetSync = (enabled) => {
  useEffect(() => {
    if (!enabled || !androidBridge()?.saveSnapshot) return undefined;
    let timer = null;
    let last = null;

    const send = () => {
      const snapshot = buildSnapshot({
        classes: useClasses.getState().list,
        activeId: useClasses.getState().activeId,
        user: useUserStore.getState(),
        marks: useTasksStore.getState().marks,
        theme: useTheme.getState().theme,
        lang: useLanguage.getState().lang,
        fallbackName: usePlanStore.getState().me?.className ?? "",
      });
      const json = JSON.stringify(snapshot);
      if (json === last) return; // ничего нового — не будим виджет
      last = json;
      saveSnapshot(snapshot);
    };
    const later = () => {
      clearTimeout(timer);
      timer = setTimeout(send, DELAY_MS);
    };

    // Новый план (поток или опрос раз в минуту) — виджет пусть спросит сервер сразу
    const onPlan = (state, before) => {
      if (state.planStamp !== before.planStamp || state.status?.lastChangeAt !== before.status?.lastChangeAt) refreshWidgets();
    };

    send();
    const stops = [
      useUserStore.subscribe(later),
      useClasses.subscribe(later),
      useTasksStore.subscribe(later),
      useTheme.subscribe(later),
      useLanguage.subscribe(later),
      usePlanStore.subscribe(onPlan),
    ];
    return () => {
      clearTimeout(timer);
      stops.forEach((stop) => stop());
    };
  }, [enabled]);
};
