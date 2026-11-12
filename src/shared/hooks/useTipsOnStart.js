import { useEffect } from "react";
import { useUserStore } from "../store/userStore";
import { useSheet } from "./useSheet";

// «Kurz erklärt» (часть 25): один раз после первого входа на этом устройстве.
// tipsPending ставят выбор курсов и вход учителя; старым пользователям подсказки сами не показываются
export const useTipsOnStart = (ready) => {
  const { openSheet } = useSheet();
  useEffect(() => {
    if (!ready || !useUserStore.getState().tipsPending) return;
    useUserStore.getState().setTipsPending(false); // сразу: после перезагрузки окно не вернётся
    openSheet("tipps", {}, { replace: true });
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps -- нужно ровно один раз, когда приложение готово
};
