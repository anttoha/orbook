// ─────────────────────────────────────────────────────────────
// Lerntimer в Sync (часть 44): свой зашифрованный блок рядом с основным (sideBlock.js).
// Блок: { sessions: [...], settings: { value, updatedAt } | null }.
// Сессии сливаются по id (как заметки), настройки — побеждает более новое изменение.
// Идущий таймер в блок не кладём — он только на этом устройстве.
// ─────────────────────────────────────────────────────────────
import { mergeNotes } from "./notes";
import { trimSessions } from "./lerntimer";
import { fitsSide, sideKeys, syncSide } from "./sideBlock";

export const lerntimerKeys = (keys) => sideKeys(keys, "orbook-lerntimer-v1");

export const readTimerBlock = (plain) => ({
  sessions: Array.isArray(plain?.sessions) ? plain.sessions : [],
  settings: plain?.settings?.updatedAt ? plain.settings : null,
});

const newer = (a, b) => (!a ? b : !b ? a : a.updatedAt >= b.updatedAt ? a : b);

// today — "YYYY-MM-DD": по нему выкидываем старые сессии
export function mergeTimerBlocks(local, remote, today, now = new Date()) {
  const sessions = trimSessions(mergeNotes(local.sessions, remote.sessions, now), today, (list) => fitsSide({ sessions: list, settings: local.settings }));
  return { sessions, settings: newer(local.settings, remote.settings) };
}

// Возвращает { block, changed }
export const syncTimer = ({ keys, local, today, request, crypto, now = new Date() }) =>
  syncSide({
    keys,
    local,
    read: readTimerBlock,
    merge: (a, b) => mergeTimerBlocks(a, b, today, now),
    isEmpty: (b) => b.sessions.length === 0, // таймером не пользовались — блок не заводим
    tooBig: "lerntimer_too_big",
    request,
    crypto,
  });
