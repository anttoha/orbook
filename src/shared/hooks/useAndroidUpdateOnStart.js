import { useEffect } from "react";
import { androidApp } from "../api/android";
import { useAndroidStore } from "../store/androidStore";
import { isCheckDue, isNewer } from "../utils/android";
import { useSheet } from "./useSheet";

// Часть 31a: только внутри APK и раз в день — есть ли на сайте APK новее. Есть → окно «Update ist da».
// Если сейчас открыто другое окно («Was ist neu»), не перебиваем его — спросим завтра снова.
export const useAndroidUpdateOnStart = (ready) => {
  const { openSheet } = useSheet();
  useEffect(() => {
    const app = androidApp();
    if (!ready || !app || !isCheckDue(useAndroidStore.getState().checkedOn, new Date())) return;
    let alive = true;
    useAndroidStore
      .getState()
      .check()
      .then((release) => {
        const busy = new URLSearchParams(window.location.search).has("sheet");
        if (alive && !busy && isNewer(app, release)) openSheet("update");
      })
      .catch(() => {}); // нет сети — не мешаем, попробуем при следующем запуске
    return () => {
      alive = false;
    };
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps -- один раз, когда приложение готово
};
