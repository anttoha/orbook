import { describe, expect, it } from "vitest";
import { decryptNotes, deriveSync, encryptNotes, generateSyncCode, normalizeSyncCode } from "./syncCrypto";

// Тестовий вектор із docs/frontend/06-notizen.md і tests/test_sync.py бекенду: так ми знаємо, що ключі збігаються з сервером
const CODE = "0123-4567-89AB-CDEF-GHJK";
const SYNC_ID = "97d4eef8b6f76af2f9ce06b2e42cbccd3972d95f065018ef6bab005cfbf875cd";
const BLOCK =
  "v1.AAECAwQFBgcICQoLzGE4GMpMrMeo7btTMl8Cza0y49fzfyyKa8oSYxoq+FvdzisgqIbS5LhvmtzNeEH5S6rNBAU6szKR2m" +
  "aYcUM5UBtnt84GoKE1cR1GkgnM/TfJcFE+BcOqymeev59PSBiGvkJDEWC/rD2D";

describe("syncCrypto (еталон)", () => {
  it("код → відомий syncId, вектор розшифровується", async () => {
    const keys = await deriveSync(CODE);
    expect(keys.syncId).toBe(SYNC_ID);
    expect(await decryptNotes(keys, BLOCK)).toEqual({ notes: [{ id: "n1", updatedAt: "2026-10-10T10:00:00Z", text: "Mathe: Seite 12 üben" }] });
  });

  it("зашифрувати й розшифрувати; чужий код не підходить", async () => {
    const keys = await deriveSync(generateSyncCode());
    const block = await encryptNotes(keys, { notes: [] });
    expect(await decryptNotes(keys, block)).toEqual({ notes: [] });
    await expect(decryptNotes(await deriveSync(CODE), block)).rejects.toThrow();
  });

  it("новий код: 5 груп по 4; ручне введення прощає регістр і O/I/L", () => {
    expect(generateSyncCode()).toMatch(/^[0-9A-HJKMNP-TV-Z]{4}(-[0-9A-HJKMNP-TV-Z]{4}){4}$/);
    expect(normalizeSyncCode("o123 4567 89ab cdef ghjk")).toBe("0123456789ABCDEFGHJK");
    expect(() => normalizeSyncCode("K7QM-4TXP-R2")).toThrow();
  });
});
