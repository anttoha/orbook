// ─────────────────────────────────────────────────────────────
// offlineCache.js — «letzter Stand» без мережі (з гайду, docs/frontend/08-zustaende.md).
// Остання вдала відповідь кожного запиту лежить у localStorage.
// Дані класу не секретні, але особисті: при виході (Klasse verlassen) — cache.clearAll().
// ─────────────────────────────────────────────────────────────
import { isUnavailable } from "./api";

const PREFIX = "orbook.cache."; // усі ключі кешу починаються так

export const cache = {
  // Зберегти відповідь разом із часом збереження
  save(key, data) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify({ data, savedAt: new Date().toISOString() }));
    } catch {
      // сховище переповнене або заборонене — працюємо без кешу
    }
  },
  // Прочитати { data, savedAt } або null
  load(key) {
    try {
      return JSON.parse(localStorage.getItem(PREFIX + key));
    } catch {
      return null;
    }
  },
  // Стерти весь кеш ORBook (при виході)
  clearAll() {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith(PREFIX)) localStorage.removeItem(key);
    }
  },
};

// Завантажити з сервера; якщо сервер недоступний (немає мережі, таймаут, 5xx) — віддати збережене.
// Результат: { data, fromCache, savedAt, status }
//   status "ready"       — свіжі дані з сервера
//   status "offline"     — немає мережі, показуємо збережене
//   status "unavailable" — сервер або школа не відповідає (5xx), показуємо збережене
// Якщо збереженого немає — кидає помилку далі (екран «Fehler»).
// Інші помилки (401, 403, 422, 429 …) теж летять далі: це не «немає мережі».
export async function loadWithCache(key, loader) {
  try {
    const data = await loader();
    if (data !== null) cache.save(key, data); // null = 304 «не змінилось» — лишаємо збережене
    const saved = data === null ? cache.load(key) : null;
    return { data: data ?? saved?.data ?? null, fromCache: false, savedAt: null, status: "ready" };
  } catch (error) {
    if (!isUnavailable(error)) throw error;
    const saved = cache.load(key);
    if (!saved) throw error; // нічого не збережено — справжня помилка
    return { data: saved.data, fromCache: true, savedAt: saved.savedAt, status: error.status === 0 ? "offline" : "unavailable", error };
  }
}
