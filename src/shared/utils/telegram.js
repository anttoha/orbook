// ─────────────────────────────────────────────────────────────
// telegram.js — личный бот (часть 27b): чистые функции, без React.
// Поля ответа /api/telegram могут прийти null — всё с запасным значением.
// ─────────────────────────────────────────────────────────────
import { coursesForPush } from "./push";

// Что показать в «Mitteilungen»: hidden — бота нет/выключен, off — подключить, on — подключён
export function telegramState(status) {
  if (!status?.available) return "hidden";
  return status.connected ? "on" : "off";
}

// Курсы для ссылки — как у Mitteilungen: «Meine Kurse» на устройстве → номера, иначе весь класс (null)
export const telegramCourses = (picked) => coursesForPush(true, picked);

// Ссылка «Bot öffnen»: t.me/<имя>; без имени — просто Telegram
export const botUrl = (username) => (username ? `https://t.me/${username}` : "https://t.me/");

// «Zuletzt gesendet» в админке: для личных чатов — «18 Chats», для группы — «Telegram»
export function sentWhere(item) {
  if (!item?.ok) return "nicht angekommen";
  if (item.kind === "bot") return item.chats === 1 ? "1 Chat" : `${item.chats ?? 0} Chats`;
  return "Telegram";
}
