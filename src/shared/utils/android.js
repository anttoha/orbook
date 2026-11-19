import { translate } from "../i18n/translate";

// Часть 31a: чистые функции для Android-App (APK). Мост и запросы — в shared/api/android.js.

// Ответ ORBookAndroid.version() — строка JSON. Что-то не то → null (ведём себя как браузер)
export function parseAppInfo(json) {
  try {
    const info = typeof json === "string" ? JSON.parse(json) : null;
    if (typeof info?.versionName !== "string" || !Number.isInteger(info?.versionCode)) return null;
    return { versionName: info.versionName, versionCode: info.versionCode, site: info.site ?? null };
  } catch {
    return null;
  }
}

// Есть ли на сайте APK новее установленного. release может быть null (APK на сервере нет)
export const isNewer = (app, release) => Boolean(app && Number.isInteger(release?.versionCode) && release.versionCode > app.versionCode);

// День по часам телефона: "2026-11-19" — сравниваем, была ли сегодня проверка обновления
export const dayKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

// Проверяем обновление раз в день: сегодня ещё не проверяли?
export const isCheckDue = (checkedOn, now) => checkedOn !== dayKey(now);

// 4300000 байт → "4,1" (в en — "4.1")
export const megabytes = (bytes, lang = "de") =>
  new Intl.NumberFormat(lang, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format((bytes ?? 0) / 1048576);

// Сколько процентов скачано (0…100)
export const percentOf = (loaded, total) => (total > 0 ? Math.min(100, Math.round(((loaded ?? 0) / total) * 100)) : 0);

// Текст тоста, если загрузка не удалась. permission — Android сам открыл экран разрешения, тост не нужен
export function updateErrorText(reason) {
  if (reason === "permission") return null;
  if (reason === "network") return translate("Download fehlgeschlagen – keine Verbindung");
  return translate("Download fehlgeschlagen");
}

// ── Часть 31c: страница «Android-App» на сайте (скачать APK) ──

// Адрес файла APK — относительный, как все /api (QR на ПК берёт полный адрес из origin)
export const APK_PATH = "/api/public/android/apk";

// Открыт ли сайт в браузере на Android (карточка «ORBook für Android» нужна только там)
export const isAndroidBrowser = (ua = globalThis.navigator?.userAgent ?? "") => /Android/i.test(ua);

// «Version 0.18.0 · 6,4 MB»; нет размера — только версия
export function releaseLabel(release, lang = "de") {
  if (!release?.versionName) return "";
  const size = release.size > 0 ? ` · ${megabytes(release.size, lang)} MB` : "";
  return `${translate("Version {version}", { version: release.versionName })}${size}`;
}
