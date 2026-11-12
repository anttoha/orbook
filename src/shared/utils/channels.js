// ─────────────────────────────────────────────────────────────
// channels.js — подписи для «Admin → Kanäle» (часть 27). Чистые функции, без React.
// Все поля группы с сервера могут быть null (docs/API.md «Kanäle»).
// ─────────────────────────────────────────────────────────────

// Какое сообщение показать: новый план или «Für morgen»
export const KINDS = [
  { value: "plan", label: "Neuer Plan" },
  { value: "tomorrow", label: "Für morgen" },
];

// Через сколько минут после уроков уходит «Für morgen» (сервер принимает только эти)
export const MINUTES = [15, 30, 45, 60, 90];
export const minutesOptions = MINUTES.map((m) => ({ value: m, label: `${m} Min.` }));

// «„9b Klasse“ · 27 Mitglieder»; без числа — только название
export function groupLine(group) {
  const title = group?.title ? `„${group.title}“` : "Telegram-Gruppe";
  return group?.members ? `${title} · ${group.members} Mitglieder` : title;
}

// Подпись под «„Für morgen“ nach Schulschluss»
export const tomorrowHint = (tomorrowAt) => (tomorrowAt ? `Heute um ${tomorrowAt}` : "Heute keine Stunden");

// Когда отправлено: «Heute 13:35», «Gestern 13:50», «Di 10.11. 07:14»
const DAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
export function sentLabel(iso, now = new Date()) {
  const at = iso ? new Date(iso) : null;
  if (!at || Number.isNaN(at.getTime())) return "";
  const time = at.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  const dayStart = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((dayStart(now) - dayStart(at)) / 86400000);
  if (days === 0) return `Heute ${time}`;
  if (days === 1) return `Gestern ${time}`;
  const date = at.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
  return `${DAYS[at.getDay()]} ${date} ${time}`;
}

// Красная карточка: почему не дошло
export const errorLine = (error) => (error === "removed" ? "Bot wurde aus der Gruppe entfernt" : "Letzte Nachricht kam nicht an");
