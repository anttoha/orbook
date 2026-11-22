import { describe, expect, it } from "vitest";
import { lerntimerKeys, mergeTimerBlocks, readTimerBlock, syncTimer } from "./lerntimerSync";
import { kartenKeys } from "./kartenSync";

const BOX = { encryptNotes: async (_k, v) => JSON.stringify(v), decryptNotes: async (_k, s) => JSON.parse(s) };
const ses = (id, day, updatedAt = "2026-09-17T10:00:00Z") => ({ id, code: "Ma", day, at: "10:00", min: 25, updatedAt });
const set = (focus, updatedAt) => ({ value: { preset: "eigene", focus }, updatedAt });

function server(start = null) {
  let stored = start;
  const request = async (method, body) => {
    if (method === "GET") return stored ? { status: 200, data: stored } : { status: 404 };
    stored = { data: body.data, version: (stored?.version ?? 0) + 1 };
    return { status: 200, data: { version: stored.version } };
  };
  return { request, get: () => stored };
}

describe("lerntimerSync", () => {
  it("свой syncId — не тот, что у Karteikarten", async () => {
    const keys = { syncId: "b".repeat(64), key: "KEY" };
    expect((await lerntimerKeys(keys)).syncId).not.toBe((await kartenKeys(keys)).syncId);
  });

  it("старый или чужой блок читается без ошибок", () => {
    expect(readTimerBlock(null)).toEqual({ sessions: [], settings: null });
    expect(readTimerBlock({ settings: { value: {} } })).toEqual({ sessions: [], settings: null });
  });

  it("сессии с двух устройств складываются, настройки — новее", () => {
    const a = { sessions: [ses("l-1", "2026-09-16")], settings: set(40, "2026-09-17T09:00:00Z") };
    const b = { sessions: [ses("l-2", "2026-09-17")], settings: set(30, "2026-09-17T08:00:00Z") };
    const m = mergeTimerBlocks(a, b, "2026-09-17");
    expect(m.sessions.map((s) => s.id)).toEqual(["l-1", "l-2"]);
    expect(m.settings.value.focus).toBe(40);
  });

  it("таймером не пользовались — блок не заводим; есть сессия — PUT", async () => {
    const empty = server();
    expect((await syncTimer({ keys: {}, local: { sessions: [], settings: null }, today: "2026-09-17", request: empty.request, crypto: BOX })).changed).toBe(false);
    expect(empty.get()).toBeNull();
    const s = server({ data: JSON.stringify({ sessions: [ses("l-2", "2026-09-17")] }), version: 1 });
    const res = await syncTimer({ keys: {}, local: { sessions: [ses("l-1", "2026-09-16")], settings: null }, today: "2026-09-17", request: s.request, crypto: BOX });
    expect(res.changed).toBe(true);
    expect(res.block.sessions).toHaveLength(2);
    expect(s.get().version).toBe(2);
  });
});
