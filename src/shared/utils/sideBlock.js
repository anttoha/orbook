// ─────────────────────────────────────────────────────────────
// Отдельный зашифрованный Sync-блок рядом с основным (Karteikarten — часть 43, Lerntimer — часть 44).
// Зачем отдельно: у блока лимит ~48 КБ — большие стопки или год сессий не мешают заметкам и оценкам.
// syncId = SHA-256("<name>|" + основной syncId); ключ и шифрование — эталон syncCrypto.js без изменений.
// По хэшу сервер не может понять, что блоки — одного человека.
// ─────────────────────────────────────────────────────────────
const MAX_PLAIN_BYTES = 48 * 1024; // как у основного блока: на сервере ≤ 64 КБ в base64

const hex = (buffer) => Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, "0")).join("");

// Ключи блока из ключей основного: другой syncId, тот же ключ AES. name — например "orbook-karten-v1"
export async function sideKeys(keys, name) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${name}|${keys.syncId}`));
  return { syncId: hex(digest), key: keys.key };
}

export const fitsSide = (block) => new TextEncoder().encode(JSON.stringify(block)).length <= MAX_PLAIN_BYTES;

// GET → слить → (если изменилось) PUT с baseVersion; на 409 — сначала. Как syncBlock в syncPayload.js.
// read(plain) — расшифрованное → блок; merge(local, remote) → слитый блок; isEmpty(block) — пользоваться не начинали
// (тогда блок на сервере не заводим: место там на всех одно); tooBig — текст ошибки, если не влезло.
// request(method, body) → { status, data }. Возвращает { block, changed }
export async function syncSide({ keys, local, read, merge, isEmpty, tooBig, request, crypto: box, maxTries = 5 }) {
  for (let attempt = 0; attempt < maxTries; attempt++) {
    const got = await request("GET");
    let remote = read(null);
    let version = 0;
    if (got.status === 200) {
      try {
        remote = read(await box.decryptNotes(keys, got.data.data));
      } catch {
        throw new Error("wrong_code");
      }
      version = got.data.version;
    }
    if (got.status !== 200 && isEmpty(local)) return { block: remote, changed: false };
    const block = merge(local, remote);
    if (version > 0 && JSON.stringify(block) === JSON.stringify(remote)) return { block, changed: false };
    if (!fitsSide(block)) throw new Error(tooBig);
    const put = await request("PUT", { data: await box.encryptNotes(keys, block), baseVersion: version });
    if (put.status === 200) return { block, changed: true };
  }
  throw new Error("conflict");
}
