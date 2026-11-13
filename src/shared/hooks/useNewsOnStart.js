import { useEffect } from "react";
import { changelog } from "../changelog";
import { useUserStore } from "../store/userStore";
import { shouldAutoShow } from "../utils/changelog";
import { useSheet } from "./useSheet";

// Один раз после входа: если в changelog есть версия, которую человек не видел, открываем «Was ist neu».
// Версию помечаем показанной сразу, чтобы окно не вернулось после обновления страницы.
export const useNewsOnStart = (ready) => {
  const { openSheet } = useSheet();
  useEffect(() => {
    if (!ready) return;
    const { seenNews, coursesChosen, markNewsShown } = useUserStore.getState();
    if (!shouldAutoShow({ seen: seenNews, entries: changelog, isNewUser: !coursesChosen })) return;
    markNewsShown();
    openSheet("news", { id: seenNews }, { replace: true }); // id — какую версию видел: окно покажет все новее
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps -- нужно ровно один раз, когда приложение готово
};
