// src/api.js — единая обёртка над fetch (JSON, cookies, ошибки с немецким текстом).
// Запросы всегда на относительный путь /api/... (в разработке их пересылает Vite-прокси).

export class ApiError extends Error {
  constructor(status, code, message, details = {}, retryAfter = null) {
    super(message);
    this.status = status; // HTTP-статус (0 — запрос не дошёл)
    this.code = code; // 'wrong_password', 'conflict', 'offline', 'timeout' …
    this.details = details; // например { attemptsLeft: 2 } или { current: {...} }
    this.retryAfter = retryAfter; // секунды (для 429)
  }
}

const TIMEOUT_MS = 20000;
let onUnauthorized = () => {};
let onAdminUnauthorized = () => {};

// Один раз при старте приложения: setUnauthorizedHandler(() => navigate('/zugang'))
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}
// 401 в админке значит «показать Admin · Login», а не экран входа класса
export function setAdminUnauthorizedHandler(fn) {
  onAdminUnauthorized = fn;
}

// Заголовок для PATCH/DELETE Klausur: версия из последнего ответа (поле version)
export const ifMatch = (version) => ({ 'If-Match': `"v${version}"` });

export async function api(path, { method = 'GET', body, signal, headers = {}, timeout = TIMEOUT_MS } = {}) {
  const timer = new AbortController();
  const timeoutId = setTimeout(() => timer.abort(), timeout);
  const onAbort = () => timer.abort();
  signal?.addEventListener('abort', onAbort);

  let res;
  try {
    res = await fetch(`/api${path}`, {
      method,
      signal: timer.signal,
      credentials: 'same-origin',
      headers: { ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    if (signal?.aborted) throw e; // отмена самим приложением (например, при смене экрана)
    if (timer.signal.aborted) throw new ApiError(0, 'timeout', 'Die Anfrage hat zu lange gedauert.');
    throw new ApiError(0, 'offline', 'Keine Verbindung. Bitte später erneut versuchen.');
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', onAbort);
  }

  if (res.status === 204 || res.status === 304) return null;

  const data = await res.json().catch(() => null);
  if (res.ok) return data;

  const err = data?.error ?? {};
  const retryAfter = Number(res.headers.get('Retry-After')) || null;
  const apiError = new ApiError(
    res.status,
    err.code ?? 'http_error',
    err.message ?? 'Anfrage fehlgeschlagen.',
    err.details ?? {},
    retryAfter,
  );
  if (res.status === 401 && err.code === 'not_authenticated') {
    (path.startsWith('/admin') ? onAdminUnauthorized : onUnauthorized)();
  }
  throw apiError;
}

// 429 / locked: «Bitte in 10 Minuten erneut versuchen.»
export function retryText(error) {
  if (!error.retryAfter) return error.message;
  const min = Math.ceil(error.retryAfter / 60);
  return `Bitte in ${min} ${min === 1 ? 'Minute' : 'Minuten'} erneut versuchen.`;
}

// Ответ с 5xx, сетевая ошибка или таймаут: можно показать сохранённый «letzter Stand»
export const isUnavailable = (e) => e instanceof ApiError && (e.status === 0 || e.status >= 500);