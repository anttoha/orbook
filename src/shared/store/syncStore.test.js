import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSyncStore } from "./syncStore";
import { useTasksStore } from "./tasksStore";
import { migrateUser, useUserStore } from "./userStore";
import { ALL_PARTS } from "../utils/syncPayload";

// Підставний сервер /api/sync: один блок на syncId, перевіряє baseVersion як справжній
function fakeServer() {
  const blocks = new Map();
  const reply = (status, body) => ({ status, ok: status < 300, headers: new Headers(), json: async () => body });
  const fetch = vi.fn(async (url, { method, headers, body }) => {
    const id = headers["X-Sync-Id"];
    expect(url).toBe("/api/sync"); // syncId — ніколи не в адресі
    const have = blocks.get(id);
    if (method === "GET") return have ? reply(200, have) : reply(404, { error: { code: "not_found" } });
    if (method === "DELETE") return blocks.delete(id), reply(204);
    const { data, baseVersion } = JSON.parse(body);
    if ((have?.version ?? 0) !== baseVersion) return reply(409, { error: { code: "conflict" } });
    blocks.set(id, { data, version: baseVersion + 1 });
    return reply(200, { version: baseVersion + 1 });
  });
  return { fetch, blocks };
}

const note = (id, text) => ({ id, text, date: "2026-11-06", subject: null, period: null, updatedAt: "2026-11-06T08:00:00.000Z" });

describe("syncStore", () => {
  let server;
  beforeEach(() => {
    server = fakeServer();
    vi.stubGlobal("fetch", server.fetch);
    useSyncStore.setState({ code: null, version: 0, lastSyncAt: null, status: "idle", error: null, disabled: false, parts: ALL_PARTS, stamps: { kurse: null, darstellung: null } });
    useUserStore.setState({ notes: [], picked: [], coursesChosen: false });
    useTasksStore.setState({ tasks: [], marks: [] });
  });

  it("часть 25: задачи, галочки и Meine Kurse переходят на второе устройство", async () => {
    useTasksStore.getState().addTask({ text: "Referat" });
    useTasksStore.getState().markHomework(17, true);
    useUserStore.setState({ picked: [3, 5], coursesChosen: true });
    await useSyncStore.getState().enable();
    const { code } = useSyncStore.getState();

    // второе устройство: курсы ещё не выбраны — после «Verbinden» берутся с кода
    useTasksStore.setState({ tasks: [], marks: [] });
    useUserStore.setState({ picked: [], coursesChosen: false });
    useSyncStore.setState({ code: null, version: 0 });
    await useSyncStore.getState().connect(code);
    expect(useTasksStore.getState().tasks.map((t) => t.text)).toEqual(["Referat"]);
    expect(useTasksStore.getState().marks).toMatchObject([{ id: "17", done: true }]);
    expect(useUserStore.getState()).toMatchObject({ picked: [3, 5], coursesChosen: true });
  });

  it("выключенная часть не приходит и не стирается", async () => {
    useUserStore.setState({ picked: [3], coursesChosen: true });
    await useSyncStore.getState().enable();
    const { code } = useSyncStore.getState();
    useUserStore.setState({ picked: [9], coursesChosen: true });
    useSyncStore.setState({ code: null, version: 0, parts: { ...ALL_PARTS, kurse: false } });
    await useSyncStore.getState().connect(code);
    expect(useUserStore.getState().picked).toEqual([9]); // своё осталось
    // а первое устройство при следующей синхронизации по-прежнему видит [3]
    useSyncStore.setState({ parts: ALL_PARTS });
    useUserStore.setState({ picked: [] });
    await useSyncStore.getState().runSync();
    expect(useUserStore.getState().picked).toEqual([3]);
  });

  it("два пристрої з одним кодом отримують однакові нотатки", async () => {
    useUserStore.setState({ notes: [note("a", "Atlas")] });
    await useSyncStore.getState().enable(); // пристрій 1: новий код
    const { code } = useSyncStore.getState();
    expect(useSyncStore.getState()).toMatchObject({ version: 1, status: "idle" });

    // пристрій 2: своя нотатка, вводить код
    useUserStore.setState({ notes: [note("b", "Sport")] });
    useSyncStore.setState({ code: null, version: 0 });
    expect(await useSyncStore.getState().connect(code.toLowerCase())).toEqual({ status: "ok" });
    expect(useUserStore.getState().notes.map((n) => n.text)).toEqual(["Atlas", "Sport"]);
    expect(useSyncStore.getState().version).toBe(2);
  });

  it("код без нотаток на сервері → питаємо; новий код видаляє старий блок; forget видаляє все", async () => {
    await useSyncStore.getState().enable();
    const first = useSyncStore.getState().code;
    expect(server.blocks.size).toBe(1);

    expect((await useSyncStore.getState().connect("0123-4567-89AB-CDEF-GHJK")).status).toBe("empty");
    expect(useSyncStore.getState().code).toBe(first); // поки не підтвердили — нічого не змінюємо

    await useSyncStore.getState().renewCode();
    expect(useSyncStore.getState().code).not.toBe(first);
    expect(server.blocks.size).toBe(1); // старий видалено

    await useSyncStore.getState().forget();
    expect(server.blocks.size).toBe(0);
    expect(useSyncStore.getState().code).toBeNull();
  });

  it("без мережі — текст помилки, нотатки на місці", async () => {
    useUserStore.setState({ notes: [note("a", "Atlas")] });
    useSyncStore.setState({ code: "0123-4567-89AB-CDEF-GHJK" });
    server.fetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    await useSyncStore.getState().runSync();
    expect(useSyncStore.getState()).toMatchObject({ status: "error", error: "Nicht synchronisiert — keine Verbindung" });
    expect(useUserStore.getState().notes).toHaveLength(1);
  });
});

describe("userStore: нотатки", () => {
  it("стара версія сховища (2) переходить на нову модель", () => {
    const old = { notes: [{ id: "2026-10-07#2", date: "2026-10-07", period: 2, text: "x", updatedAt: 1000 }], picked: [5], showWeekend: true };
    const next = migrateUser(old, 2);
    expect(next.picked).toEqual([5]);
    expect(next.notes[0]).toMatchObject({ subject: null, updatedAt: "1970-01-01T00:00:01.000Z" });
  });

  it("видалення лишає надгробок, «Rückgängig» повертає нотатку", () => {
    useUserStore.setState({ notes: [] });
    const id = useUserStore.getState().saveNote({ date: "2026-11-06", period: 3, subject: "Ma", text: "S. 54" });
    const saved = useUserStore.getState().notes[0];
    useUserStore.getState().deleteNote(id);
    expect(useUserStore.getState().notes[0]).toMatchObject({ id, deleted: true, text: "" });
    useUserStore.getState().restoreNote(saved);
    expect(useUserStore.getState().notes[0]).toMatchObject({ id, text: "S. 54", subject: "Ma" });
    expect(useUserStore.getState().notes[0].deleted).toBeUndefined();
  });
});
