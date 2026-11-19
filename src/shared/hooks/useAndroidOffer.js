import { useEffect, useState } from "react";
import { androidApp } from "../api/android";
import { useAndroidStore } from "../store/androidStore";

// Есть ли что предложить: на сервере лежит APK, а мы в браузере (внутри APK страница другая).
// Спрашиваем сервер один раз за сессию; нет сети или APK нет — ничего не показываем
export function useAndroidOffer() {
  const [app] = useState(androidApp);
  const release = useAndroidStore((s) => s.release);
  const check = useAndroidStore((s) => s.check);
  useEffect(() => {
    if (!app && useAndroidStore.getState().release === undefined) check().catch(() => {});
  }, [app, check]);
  return { app, release: release ?? null, offer: !app && Boolean(release?.versionCode) };
}
