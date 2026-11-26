import { describe, expect, it } from "vitest";
import { DEFAULT_FUER_DICH } from "./fuerDich";
import { fuerDichKeys, syncFuerDich } from "./fuerDichSync";

// «Шифрование» для теста: просто JSON (настоящее — syncCrypto.js)
const BOX = { encryptNotes: async (_k, v) => JSON.stringify(v), decryptNotes: async (_k, s) => JSON.parse(s) };
const block = (leaveMinutes, updatedAt) => ({ value: { ...DEFAULT_FUER_DICH, leaveMinutes }, updatedAt });

function server(start = null) {
  let stored = start;
  const calls = [];
  const request = async (method, body) => {
    calls.push(method);
    if (method === "GET") return stored ? { status: 200, data: stored } : { status: 404 };
    stored = { data: body.data, version: (stored?.version ?? 0) + 1 };
    return { status: 200, data: { version: stored.version } };
  };
  return { request, calls };
}

describe("fuerDichSync", () => {
  it("свой syncId, тот же ключ", async () => {
    const k = await fuerDichKeys({ syncId: "a".repeat(64), key: "KEY" });
    expect(k.syncId).toMatch(/^[0-9a-f]{64}$/);
    expect(k.key).toBe("KEY");
  });

  it("не меняли и на сервере пусто — блок не заводим", async () => {
    const s = server();
    const res = await syncFuerDich({ keys: {}, local: null, request: s.request, crypto: BOX });
    expect(res).toEqual({ block: null, changed: false });
    expect(s.calls).toEqual(["GET"]);
  });

  it("побеждает более новое изменение", async () => {
    const s = server({ data: JSON.stringify(block(30, "2026-11-20T10:00:00Z")), version: 2 });
    const older = await syncFuerDich({ keys: {}, local: block(60, "2026-11-19T10:00:00Z"), request: s.request, crypto: BOX });
    expect(older.block.value.leaveMinutes).toBe(30);
    expect(older.changed).toBe(false);
    const newer = await syncFuerDich({ keys: {}, local: block(60, "2026-11-21T10:00:00Z"), request: s.request, crypto: BOX });
    expect(newer.block.value.leaveMinutes).toBe(60);
    expect(newer.changed).toBe(true);
  });
});
