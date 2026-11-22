// ─────────────────────────────────────────────────────────────
// Karteikarten в Sync (часть 43): отдельный зашифрованный блок (sideBlock.js).
// Блок: { decks: [стопки и «надгробки»] }. Слияние — по стопкам: побеждает более новый updatedAt.
// ─────────────────────────────────────────────────────────────
import { mergeNotes } from "./notes";
import { fitsSide, sideKeys, syncSide } from "./sideBlock";

export const kartenKeys = (keys) => sideKeys(keys, "orbook-karten-v1");

export const readDecks = (plain) => (Array.isArray(plain?.decks) ? plain.decks : []);
export const mergeDecks = (local, remote, now = new Date()) => mergeNotes(local, remote, now);
export const fitsDecks = fitsSide;

// Возвращает { decks, changed }
export async function syncDecks({ keys, local, request, crypto, now = new Date(), maxTries = 5 }) {
  const { block, changed } = await syncSide({
    keys,
    local: { decks: local },
    read: (plain) => ({ decks: readDecks(plain) }),
    merge: (a, b) => ({ decks: mergeDecks(a.decks, b.decks, now) }),
    isEmpty: (b) => b.decks.length === 0, // карточками не пользуются — блок не заводим
    tooBig: "karten_too_big",
    request,
    crypto,
    maxTries,
  });
  return { decks: block.decks, changed };
}
