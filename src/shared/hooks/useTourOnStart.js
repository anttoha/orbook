import { useEffect } from "react";
import { useTourStore } from "../store/tourStore";
import { useUserStore } from "../store/userStore";

// Rundgang (часть 52): один раз после первого входа на этом устройстве — приветствие.
// tourPending ставят выбор курсов и вход учителя; флаг снимаем сразу, чтобы после перезагрузки тур не вернулся
export const useTourOnStart = (ready) => {
  useEffect(() => {
    if (!ready || !useUserStore.getState().tourPending) return;
    useUserStore.getState().setTourPending(false);
    useTourStore.getState().welcome();
  }, [ready]);
};
