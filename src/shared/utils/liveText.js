// Тексты «Live» и «Plan-Status» (часть 26). Чистые функции: время приходит строкой ISO с сервера,
// «сейчас» — числом миллисекунд по часам школы (clock.now()).
import { addDays, weekdayShort } from "./format";

const SECOND = 1000;
const MINUTE = 60 * SECOND;

// «gerade eben», «vor 20 Sek.», «vor 3 Min.», «vor 2 Std.», «vor 3 Tagen»; null — времени нет
export function agoText(moment, nowMs) {
  const at = Date.parse(moment ?? "");
  if (Number.isNaN(at)) return null;
  const diff = nowMs - at;
  if (diff < 10 * SECOND) return "gerade eben"; // и если часы немного спешат (демо)
  if (diff < MINUTE) return `vor ${Math.floor(diff / SECOND)} Sek.`;
  const minutes = Math.floor(diff / MINUTE);
  if (minutes < 60) return `vor ${minutes} Min.`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `vor ${hours} Std.`;
  const days = Math.floor(hours / 24);
  return `vor ${days} ${days === 1 ? "Tag" : "Tagen"}`;
}

// «in 40 Sek.», «in 4 Min.»; null — время прошло или неизвестно
export function inText(moment, nowMs) {
  const at = Date.parse(moment ?? "");
  if (Number.isNaN(at) || at <= nowMs) return null;
  const diff = at - nowMs;
  if (diff < MINUTE) return `in ${Math.max(1, Math.round(diff / SECOND))} Sek.`;
  const minutes = Math.round(diff / MINUTE);
  return minutes < 60 ? `in ${minutes} Min.` : `in ${Math.round(minutes / 60)} Std.`;
}

// «heute 07:12», «gestern 15:40», «Mo 14:02»
const momentText = (moment, today) => {
  const date = moment.slice(0, 10);
  const time = moment.slice(11, 16);
  if (date === today) return `heute ${time}`;
  if (date === addDays(today, -1)) return `gestern ${time}`;
  return `${weekdayShort(date)} ${time}`;
};

// Строка дня в «Plan-Status»: { text, kind }; kind — значок справа:
//   ok — план есть · none — проверили, плана ещё нет · unknown — ещё не проверяли · free — свободный день
export function dayCheck(day, today, nowMs) {
  if (day.status === "holiday") return { text: day.freeReason === "weekend" ? "Wochenende" : "Schulfrei", kind: "free" };
  if (day.status === "ok") {
    const stand = day.publishedAt ?? day.changedAt;
    return { text: stand ? `Plan da · Stand ${momentText(stand, today)}` : "Plan da", kind: "ok" };
  }
  const checked = agoText(day.checkedAt, nowMs);
  if (!checked) return { text: "Noch nicht geprüft", kind: "unknown" };
  return { text: `Noch kein Plan · geprüft ${checked}`, kind: "none" };
}

// Подпись под списком: «Schule zuletzt gefragt vor 20 Sek. · wieder in 40 Sek.»
export function askedText(status, nowMs) {
  const last = agoText(status?.lastOkAt, nowMs);
  if (!last) return "Die Schule wurde noch nicht gefragt.";
  const next = inText(status?.nextFetchAt, nowMs);
  return next ? `Schule zuletzt gefragt ${last} · wieder ${next}` : `Schule zuletzt gefragt ${last}`;
}
