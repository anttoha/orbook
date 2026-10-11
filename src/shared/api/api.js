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

// Один раз при старті: setUnauthorizedHandler(() => показати «Zugang»)
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

// Головна функція: await api("/week?date=2026-10-05")
//                  await api("/auth/login", { method: "POST", body: { password } })
export async function api(path, { method = "GET", body, signal, headers = {}, timeout = TIMEOUT_MS } = {}) {
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
      headers: { ...(body !== undefined ? { "Content-Type": "application/json" } : {}), ...headers },
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
  if (res.ok) return data; // успіх

  // Помилка: сервер завжди відповідає { error: { code, message, details } }
  const err = data?.error ?? {};
  const retryAfter = Number(res.headers.get("Retry-After")) || null;
  const apiError = new ApiError(res.status, err.code ?? "http_error", err.message ?? "Anfrage fehlgeschlagen.", err.details ?? {}, retryAfter);
  if (res.status === 401 && err.code === "not_authenticated") onUnauthorized(); // сесія закінчилась
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
