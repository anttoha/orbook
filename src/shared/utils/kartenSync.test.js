import { describe, expect, it } from "vitest";
import { kartenKeys, syncDecks } from "./kartenSync";

// «Шифрование» для теста: просто JSON (настоящее — syncCrypto.js)
const BOX = { encryptNotes: async (_k, v) => JSON.stringify(v), decryptNotes: async (_k, s) => JSON.parse(s) };
const deck = (id, updatedAt, extra = {}) => ({ id, name: id, cards: [], updatedAt, ...extra });

function server(start = null) {
  let stored = start;
  const calls = [];
  const request = async (method, body) => {
    calls.push(method);
    if (method === "GET") return stored ? { status: 200, data: stored } : { status: 404 };
    stored = { data: body.data, version: (stored?.version ?? 0) + 1 };
    return { status: 200, data: { version: stored.version } };
  };
  return { request, calls, get: () => stored };
}

describe("kartenSync", () => {
  it("другой syncId, тот же ключ", async () => {
    const keys = { syncId: "a".repeat(64), key: "KEY" };
    const k = await kartenKeys(keys);
    expect(k.syncId).toMatch(/^[0-9a-f]{64}$/);
    expect(k.syncId).not.toBe(keys.syncId);
    expect(k.key).toBe("KEY");
  });

  it("сливает по стопкам: новее побеждает, надгробок доезжает", async () => {
    const s = server({ data: JSON.stringify({ decks: [deck("k-1", "2025-09-01"), deck("k-2", "2025-09-05")] }), version: 3 });
    const local = [deck("k-1", "2025-09-10", { name: "neu" }), deck("k-2", "2025-09-06", { deleted: true })];
    const res = await syncDecks({ keys: {}, local, request: s.request, crypto: BOX, now: new Date("2025-09-10") });
    expect(res.changed).toBe(true);
    expect(res.decks.map((d) => [d.id, d.name, Boolean(d.deleted)])).toEqual([["k-1", "neu", false], ["k-2", "k-2", true]]);
    expect(s.get().version).toBe(4);
  });

  it("ничего не изменилось — без PUT", async () => {
    const decks = [deck("k-1", "2025-09-01")];
    const s = server({ data: JSON.stringify({ decks }), version: 2 });
    const res = await syncDecks({ keys: {}, local: decks, request: s.request, crypto: BOX });
    expect(res.changed).toBe(false);
    expect(s.calls).toEqual(["GET"]);
  });

  it("слишком много — ошибка, ничего не пишем", async () => {
    const s = server();
    const big = [deck("k-1", "2025-09-01", { cards: Array.from({ length: 900 }, (_, i) => ({ id: `c${i}`, a: "x".repeat(40), b: "y".repeat(40) })) })];
    await expect(syncDecks({ keys: {}, local: big, request: s.request, crypto: BOX })).rejects.toThrow("karten_too_big");
    expect(s.calls).toEqual(["GET"]);
  });

  it("нет карточек ни здесь, ни на сервере — блок не заводим", async () => {
    const s = server();
    expect(await syncDecks({ keys: {}, local: [], request: s.request, crypto: BOX })).toEqual({ decks: [], changed: false });
    expect(s.calls).toEqual(["GET"]);
  });

  it("чужой код — wrong_code", async () => {
    const s = server({ data: "kaputt", version: 1 });
    await expect(syncDecks({ keys: {}, local: [], request: s.request, crypto: BOX })).rejects.toThrow("wrong_code");
  });
});
