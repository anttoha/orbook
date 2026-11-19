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

// ── Часть 31b: виджет на рабочем столе ──

// Виджеты на телефоне (строка JSON) — разбирает shared/utils/widgetSnapshot.js. Без моста — null
export const androidWidgets = () => androidBridge()?.widgets?.() ?? null;
export const androidWidget = (id) => androidBridge()?.widget?.(Number(id)) ?? null;

// «Fertig»: приложение сохраняет настройку и обновляет виджет
export const saveWidget = (id, config) => androidBridge()?.saveWidget?.(Number(id), JSON.stringify(config));
export const closeWidget = () => androidBridge()?.closeWidget?.();

// Снимок для виджета (классы, «Meine Kurse», заметки, галочки, тексты) и «освежить сейчас» после нового плана
export const saveSnapshot = (snapshot) => androidBridge()?.saveSnapshot?.(JSON.stringify(snapshot));
export const refreshWidgets = () => androidBridge()?.refreshWidgets?.();
