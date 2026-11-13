// ─────────────────────────────────────────────────────────────
// offlineCache.js — «letzter Stand» без мережі (з гайду, docs/frontend/08-zustaende.md).
// Остання вдала відповідь кожного запиту лежить у localStorage.
// Дані класу не секретні, але особисті: при виході (Klasse verlassen) — cache.clearAll().
// ─────────────────────────────────────────────────────────────
import { currentClassId, isUnavailable } from "./api";

const PREFIX = "orbook.cache."; // усі ключі кешу починаються так
// Частина 29: у кожного класу свій кеш — «orbook.cache.c2.week:…». Без класу (старий сервер) — як раніше
const scoped = (key, classId = currentClassId()) => (classId != null ? `c${classId}.${key}` : key);

export const cache = {
  // Зберегти відповідь разом із часом збереження
  save(key, data, classId) {
    try {
      localStorage.setItem(PREFIX + scoped(key, classId), JSON.stringify({ data, savedAt: new Date().toISOString() }));
    } catch {
      // сховище переповнене або заборонене — працюємо без кешу
    }
  },
  // Прочитати { data, savedAt } або null
  load(key, classId) {
    try {
      return JSON.parse(localStorage.getItem(PREFIX + scoped(key, classId)));
    } catch {
      return null;
    }
  },
  // Стерти весь кеш ORBook (при виході)
  clearAll() {
    removeKeys(PREFIX);
  },
  // Стерти кеш одного класу («Klasse entfernen»)
  clearClass(classId) {
    removeKeys(`${PREFIX}c${classId}.`);
  },
};

function removeKeys(prefix) {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) localStorage.removeItem(key);
    }
  } catch {
    // сховище заборонене — нічого стирати
  }
}

// Завантажити з сервера; якщо сервер недоступний (немає мережі, таймаут, 5xx) — віддати збережене.
// Результат: { data, fromCache, savedAt, status }
//   status "ready"       — свіжі дані з сервера
//   status "offline"     — немає мережі, показуємо збережене
//   status "unavailable" — сервер або школа не відповідає (5xx), показуємо збережене
// Якщо збереженого немає — кидає помилку далі (екран «Fehler»).
// Інші помилки (401, 403, 422, 429 …) теж летять далі: це не «немає мережі».
// classId — кеш іншого класу (карточки «Meine Klassen»); без нього — активний клас
export async function loadWithCache(key, loader, classId) {
  try {
    const data = await loader();
    if (data !== null) cache.save(key, data, classId); // null = 304 «не змінилось» — лишаємо збережене
    const saved = data === null ? cache.load(key, classId) : null;
    return { data: data ?? saved?.data ?? null, fromCache: false, savedAt: null, status: "ready" };
  } catch (error) {
    if (!isUnavailable(error)) throw error;
    const saved = cache.load(key, classId);
    if (!saved) throw error; // нічого не збережено — справжня помилка
    return { data: saved.data, fromCache: true, savedAt: saved.savedAt, status: error.status === 0 ? "offline" : "unavailable", error };
  }
}
