import { api } from "./api";
import { parseAppInfo } from "../utils/android";

// ─────────────────────────────────────────────────────────────
// Часть 31a: Android-App. Внутри APK у страницы есть window.ORBookAndroid
// (android/app/src/main/java/net/orbitium/orbook/AndroidBridge.kt). В браузере его нет —
// тогда функции возвращают null и всё работает как раньше.
// ─────────────────────────────────────────────────────────────

export const androidBridge = () => globalThis.window?.ORBookAndroid ?? null;

// Установленное APK: { versionName, versionCode, site } или null (мы в браузере)
export function androidApp() {
  const bridge = androidBridge();
  if (!bridge) return null;
  try {
    return parseAppInfo(bridge.version());
  } catch {
    return null;
  }
}

// Скачать новое APK и открыть установщик Android. Ход загрузки — onAndroidEvent
export const installUpdate = () => androidBridge()?.installUpdate();
export const cancelUpdate = () => androidBridge()?.cancelUpdate();

// События приложения: {type: "download", loaded, total} | {type: "done"} | {type: "error", reason}.
// Возвращает функцию «отписаться» — для очистки в useEffect
export function onAndroidEvent(handler) {
  const listener = (event) => handler(event.detail ?? {});
  window.addEventListener("orbook-android", listener);
  return () => window.removeEventListener("orbook-android", listener);
}

// Последнее APK на сервере (без входа) или null, если его там нет
export const getAndroidRelease = () => api("/public/android");
