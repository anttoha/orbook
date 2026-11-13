// ─────────────────────────────────────────────────────────────
// telegram.js — личный чат с ботом (docs/API.md → «Telegram-Bot», часть 27b).
// ─────────────────────────────────────────────────────────────
import { api } from "./api";

export const getTelegram = () => api("/telegram"); // → { available, botUsername, connected, connectedAt }
export const telegramLink = (courses) => api("/telegram/link", { method: "POST", body: { courses } }); // → { link, expiresAt }
export const deleteTelegram = () => api("/telegram", { method: "DELETE" });
