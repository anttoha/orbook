// ─────────────────────────────────────────────────────────────
// «Für dich jetzt» в Sync (часть 50b): свой зашифрованный блок рядом с основным (sideBlock.js).
// Блок: { value: настройки, updatedAt } — побеждает более новое изменение (как у Lerntimer).
// ─────────────────────────────────────────────────────────────
import { cleanFuerDich } from "./fuerDich";
import { sideKeys, syncSide } from "./sideBlock";

export const fuerDichKeys = (keys) => sideKeys(keys, "orbook-fuerdich-v1");

export const readFuerDichBlock = (plain) => (plain?.updatedAt ? { value: cleanFuerDich(plain.value), updatedAt: plain.updatedAt } : null);

export const newerBlock = (a, b) => (!a ? b : !b ? a : a.updatedAt >= b.updatedAt ? a : b);

// Возвращает { block, changed }; block — null, если настройки нигде не меняли
export const syncFuerDich = ({ keys, local, request, crypto }) =>
  syncSide({
    keys,
    local,
    read: readFuerDichBlock,
    merge: newerBlock,
    isEmpty: (b) => !b, // не меняли — блок на сервере не заводим
    tooBig: "fuerdich_too_big",
    request,
    crypto,
  });
