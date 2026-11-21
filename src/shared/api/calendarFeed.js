// ─────────────────────────────────────────────────────────────
// calendarFeed.js — Kalender-Abo (часть 40, /opt/orbook-be/docs/API.md «Kalender-Abo»).
// Класс запроса — открытый (api.js сам ставит X-ORBook-Class).
// ─────────────────────────────────────────────────────────────
import { api } from "./api";

// → feed или null (абонемента нет)
export const loadFeed = () => api("/calendar-feed").then((r) => r?.feed ?? null);
// Создать или поменять: { items, courses, hidden } → feed
export const saveFeed = (body) => api("/calendar-feed", { method: "PUT", body }).then((r) => r.feed);
// Новая ссылка, старая сразу не работает → feed
export const renewFeed = () => api("/calendar-feed/renew", { method: "POST" }).then((r) => r.feed);
export const deleteFeed = () => api("/calendar-feed", { method: "DELETE" });
