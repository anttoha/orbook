// ─────────────────────────────────────────────────────────────
// Karteikarten в Sync (часть 43): ОТДЕЛЬНЫЙ зашифрованный блок рядом с основным.
// Зачем отдельно: у блока лимит ~48 КБ, а стопки бывают большими — так они не мешают заметкам и оценкам.
// syncId блока = SHA-256("orbook-karten-v1|" + основной syncId); ключ и шифрование — эталон syncCrypto.js без изменений.
// По хэшу сервер не может понять, что два блока — одного человека.
// Блок: { decks: [стопки и «надгробки»] }. Слияние — по стопкам: побеждает более новый updatedAt.
// ─────────────────────────────────────────────────────────────
import { mergeNotes } from "./notes";

const MAX_PLAIN_BYTES = 48 * 1024; // как у основного блока: на сервере ≤ 64 КБ в base64

const hex = (buffer) => Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, "0")).join("");

// Ключи второго блока из ключей основного: другой syncId, тот же ключ AES
export async function kartenKeys(keys) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`orbook-karten-v1|${keys.syncId}`));
  return { syncId: hex(digest), key: keys.key };
}

export const readDecks = (plain) => (Array.isArray(plain?.decks) ? plain.decks : []);
export const mergeDecks = (local, remote, now = new Date()) => mergeNotes(local, remote, now);
export const fitsDecks = (block) => new TextEncoder().encode(JSON.stringify(block)).length <= MAX_PLAIN_BYTES;

// GET → слить → (если изменилось) PUT с baseVersion; на 409 — сначала. Как syncBlock в syncPayload.js.
// request(method, body) → { status, data }. Возвращает { decks, changed }
export async function syncDecks({ keys, local, request, crypto: box, now = new Date(), maxTries = 5 }) {
  for (let attempt = 0; attempt < maxTries; attempt++) {
    const got = await request("GET");
    let remote = [];
    let version = 0;
    if (got.status === 200) {
      try {
        remote = readDecks(await box.decryptNotes(keys, got.data.data));
      } catch {
        throw new Error("wrong_code");
      }
      version = got.data.version;
    }
    // Карточками не пользуются (нет ни здесь, ни на сервере) — блок не заводим: на сервере место на всех одно
    if (got.status !== 200 && local.length === 0) return { decks: [], changed: false };
    const decks = mergeDecks(local, remote, now);
    if (version > 0 && JSON.stringify(decks) === JSON.stringify(remote)) return { decks, changed: false };
    if (!fitsDecks({ decks })) throw new Error("karten_too_big");
    const put = await request("PUT", { data: await box.encryptNotes(keys, { decks }), baseVersion: version });
    if (put.status === 200) return { decks, changed: true };
  }
  throw new Error("conflict");
}
