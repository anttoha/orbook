// ─────────────────────────────────────────────────────────────
// noten.js — оценки из Home.InfoPoint (docs/API.md «Noten», часть 36).
// На сайте: сервер ORBook только передаёт запрос в школу и ничего не хранит.
// В Android-App (часть 36c): приложение ходит в InfoPoint само, с телефона (ORBookAndroid.notenFetch),
// и отдаёт тот же JSON. Ошибки (ApiError.code) одинаковые: infopoint_denied, too_often (retryAfter),
// rate_limited, infopoint_unreachable, infopoint_changed; у приложения ещё no_login (сохранённого пароля нет).
// ─────────────────────────────────────────────────────────────
import { ApiError, api } from "./api";
import { androidBridge, onAndroidEvent } from "./android";

// InfoPoint бывает медленным: сервер ждёт школу до 15 с, мы — чуть дольше
export const fetchNoten = (username, password) => api("/noten/abrufen", { method: "POST", body: { username, password }, timeout: 25000 });

// Часть 37: оригинальная страница InfoPoint для печати → { html } (сервер её чистит, не хранит).
// mode: "summary" («Zusammenfassung») | "detail» («Detailansicht»)
export const fetchOriginal = (username, password, mode) => api("/noten/original", { method: "POST", body: { username, password, mode }, timeout: 25000 });

// ── Android-App ──

// Умеет ли приложение Noten само (APK с частью 36c). В браузере и в старом APK — false
export const hasAppNoten = () => typeof androidBridge()?.notenFetch === "function";

const parse = (json) => {
  try {
    const value = typeof json === "string" ? JSON.parse(json) : null;
    return value && typeof value === "object" ? value : null;
  } catch {
    return null;
  }
};

// { saved, username } — сохранён ли в приложении логин («Angemeldet bleiben»). Пароль сайт не видит
export const appNotenState = () => parse(androidBridge()?.notenState?.() ?? null);

// Оценки, которые приложение забрало в фоне: { data, fetchedAt } или null
export const appNotenData = () => parse(androidBridge()?.notenData?.() ?? null);

export const appNotenLogout = () => androidBridge()?.notenLogout?.();

const APP_TIMEOUT_MS = 70000; // четыре запроса к школе по 15 с + запас
let nextId = 1;

// Запрос к приложению: вызвать метод моста с { id, …payload } и дождаться события { type, id, ok, data|error }
function askApp(method, type, payload) {
  return new Promise((resolve, reject) => {
    const id = nextId++;
    let stop = () => {};
    const timer = setTimeout(() => {
      stop();
      reject(new ApiError(0, "timeout", "Zeitüberschreitung"));
    }, APP_TIMEOUT_MS);
    stop = onAndroidEvent((detail) => {
      if (detail.type !== type || detail.id !== id) return;
      clearTimeout(timer);
      stop();
      if (detail.ok) resolve(detail.data);
      else reject(new ApiError(0, detail.error?.code ?? "infopoint_unreachable", "", { retryAfter: detail.error?.retryAfter ?? null }, detail.error?.retryAfter ?? null));
    });
    androidBridge()[method](JSON.stringify({ id, ...payload }));
  });
}

// url — адрес InfoPoint из /api/meta; null (демо) — приложение спросит сервер ORBook.
// password null — приложение возьмёт сохранённый
export const fetchNotenApp = ({ url, username, password, remember }) =>
  askApp("notenFetch", "noten", { url: url ?? null, username, password: password || null, remember });

// Часть 37: умеет ли приложение «Original» (забрать страницу InfoPoint и сразу напечатать)
export const hasAppOriginal = () => typeof androidBridge()?.notenOriginal === "function";

// Приложение забирает оригинал (из InfoPoint, в демо — с сервера) и открывает системную печать
export const printOriginalApp = ({ url, username, password, mode }) =>
  askApp("notenOriginal", "notenOriginal", { url: url ?? null, username, password: password || null, mode });
