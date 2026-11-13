// ─────────────────────────────────────────────────────────────
// api.js — єдина обгортка над fetch (з гайду orbook-be, docs/frontend/01-start.md).
// • надсилає і приймає JSON, передає cookies (вхід класу живе в cookie);
// • помилку сервера перетворює на ApiError з НІМЕЦЬКИМ текстом (message),
//   який можна показати користувачу як є;
// • «немає мережі» → code "offline", «довго чекали» → code "timeout" (status 0);
// • на 401 not_authenticated викликає обробник (показати екран входу).
// Запити завжди на відносний шлях /api/... — у розробці їх пересилає Vite-проксі
// (vite.config.js), на сервері — nginx на тому ж домені.
// ─────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(status, code, message, details = {}, retryAfter = null) {
    super(message); // німецький текст для людини
    this.status = status; // HTTP-статус (0 — запит не дійшов)
    this.code = code; // "wrong_password", "locked", "offline", "timeout" …
    this.details = details; // наприклад { attemptsLeft: 2 }
    this.retryAfter = retryAfter; // секунди (для 429)
  }
}

const TIMEOUT_MS = 20000; // 20 секунд чекаємо відповідь
let onUnauthorized = () => {}; // що робити, коли сесія закінчилась
let onAdminUnauthorized = () => {}; // те саме для адмінки (/admin/...)

// Один раз при старті: setUnauthorizedHandler((error) => показати «Zugang»); error — відповідь сервера (401)
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}
// 401 в адмінці означає «показати Admin · Login», а не екран входу класу
export function setAdminUnauthorizedHandler(fn) {
  onAdminUnauthorized = fn;
}

// Часть 29: какой класс открыт. classesStore регистрирует себя здесь (api.js не знает про сторы)
let classHandlers = { current: () => null, gone: () => {} };
export function setClassHandlers(handlers) {
  classHandlers = handlers;
}
export const currentClassId = () => classHandlers.current();

// Часть 29c: у админки свой выбор класса (чип «Admin · 9b ⌄»), он не зависит от класса приложения
let adminClass = () => null;
export function setAdminClassHandler(fn) {
  adminClass = fn;
}

// Запросы без класса: вход, вход админа, Sync (код устройства, не класса)
const NO_CLASS = ["/admin/auth", "/auth/login", "/auth/teacher", "/auth/join", "/auth/logout", "/auth/leave", "/public", "/sync", "/health"];
const classHeader = (path, classId) => (classId != null && !NO_CLASS.some((prefix) => path.startsWith(prefix)) ? { "X-ORBook-Class": String(classId) } : {});
// Класс по умолчанию: в админке — выбранный админом, в приложении — открытый
const defaultClass = (path) => (path.startsWith("/admin") ? adminClass() : currentClassId());

// Заголовок для PATCH/DELETE Klausur: версія з останньої відповіді (поле version)
export const ifMatch = (version) => ({ "If-Match": `"v${version}"` });

// Файл календаря для однієї Klausur: кнопка-посилання, cookie браузер надішле сам
export const examIcsUrl = (id) => `/api/exams/${id}.ics`;

// Головна функція: await api("/week?date=2026-10-05")
//                  classId — запит від імені іншого класу (карточки «Meine Klassen»); null — без класу
//                  await api("/auth/login", { method: "POST", body: { password } })
// conditional: true — частий опит. Самі шлемо If-None-Match і вимикаємо кеш браузера:
// інакше браузер сам отримує 304 і віддає коду стару відповідь як 200, і екран перемальовується.
// Сервер відповів 304 → api повертає null.
const savedEtags = new Map(); // «клас:шлях» → останній ETag

export async function api(path, { method = "GET", body, signal, headers = {}, timeout = TIMEOUT_MS, conditional = false, classId = defaultClass(path) } = {}) {
  const etagKey = `${classId ?? ""}:${path}`; // у кожного класу свій ETag
  const etagHeader = conditional && savedEtags.has(etagKey) ? { "If-None-Match": savedEtags.get(etagKey) } : {};
  const timer = new AbortController(); // щоб обірвати запит по таймауту
  const timeoutId = setTimeout(() => timer.abort(), timeout);
  const onAbort = () => timer.abort(); // скасування ззовні (наприклад, екран закрили)
  signal?.addEventListener("abort", onAbort);

  let res;
  try {
    res = await fetch(`/api${path}`, {
      method,
      signal: timer.signal,
      credentials: "same-origin", // надсилати cookies
      ...(conditional ? { cache: "no-store" } : {}),
      headers: { ...(body !== undefined ? { "Content-Type": "application/json" } : {}), ...classHeader(path, classId), ...etagHeader, ...headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    if (signal?.aborted) throw e; // скасували ми самі — це не помилка мережі
    if (timer.signal.aborted) throw new ApiError(0, "timeout", "Die Anfrage hat zu lange gedauert.");
    throw new ApiError(0, "offline", "Keine Verbindung. Bitte später erneut versuchen.");
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener("abort", onAbort);
  }

  if (res.status === 204 || res.status === 304) return null; // відповідь без тіла

  const data = await res.json().catch(() => null); // тіло (або null, якщо не JSON)
  if (res.ok) {
    if (conditional && res.headers.get("ETag")) savedEtags.set(etagKey, res.headers.get("ETag"));
    return data; // успіх
  }

  // Помилка: сервер завжди відповідає { error: { code, message, details } }
  const err = data?.error ?? {};
  const retryAfter = Number(res.headers.get("Retry-After")) || null;
  const apiError = new ApiError(res.status, err.code ?? "http_error", err.message ?? "Anfrage fehlgeschlagen.", err.details ?? {}, retryAfter);
  if (res.status === 403 && err.code === "class_gone") classHandlers.gone(classId); // код цього класу вимкнули — інші класи працюють
  if (res.status === 401 && err.code === "not_authenticated") {
    (path.startsWith("/admin") ? onAdminUnauthorized : onUnauthorized)(apiError); // сесія закінчилась; текст сервера — для плашки
  }
  throw apiError;
}

// 429 (забагато спроб/запитів): «Bitte in 10 Minuten erneut versuchen.»
export function retryText(error) {
  if (!error.retryAfter) return error.message;
  const min = Math.ceil(error.retryAfter / 60);
  return `Bitte in ${min} ${min === 1 ? "Minute" : "Minuten"} erneut versuchen.`;
}

// Немає мережі, таймаут або 5xx — можна показати збережений «letzter Stand»
export const isUnavailable = (e) => e instanceof ApiError && (e.status === 0 || e.status >= 500);
