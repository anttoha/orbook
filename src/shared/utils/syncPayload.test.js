import { describe, expect, it } from "vitest";
import { applyInfo, classPatch, darstellungOf, fitsInBlock, kurseOf, localKlassen, mergeBlock, mergeKlassen, newerSetting, readBlock, syncBlock } from "./syncPayload";

const at = (iso) => new Date(iso);
const now = at("2026-11-06T12:00:00Z");
const note = (id, updatedAt, extra = {}) => ({ id, text: id, date: "2026-11-06", subject: null, period: null, updatedAt, ...extra });
const empty = readBlock(null);
// «Шифрование» для теста: блок — это просто JSON
const box = { encryptNotes: async (_k, v) => JSON.stringify(v), decryptNotes: async (_k, b) => JSON.parse(b) };

describe("readBlock", () => {
  it("старый блок только с заметками → остальное пустое", () => {
    expect(readBlock({ notes: [note("a", "x")] })).toEqual({ notes: [note("a", "x")], tasks: [], marks: [], kurse: null, darstellung: null, klassen: null });
  });
});

describe("newerSetting", () => {
  const a = { value: { picked: [1] }, updatedAt: "2026-11-06T08:00:00Z" };
  const b = { value: { picked: [2] }, updatedAt: "2026-11-06T09:00:00Z" };
  it("побеждает более новое", () => {
    expect(newerSetting(a, b)).toBe(b);
    expect(newerSetting(b, a)).toBe(b);
  });
  it("здесь ни разу не меняли → берём с кода; на коде нет → своё", () => {
    expect(newerSetting({ value: {}, updatedAt: null }, a)).toBe(a);
    expect(newerSetting(a, null)).toBe(a);
  });
});

describe("mergeBlock", () => {
  const kurse = (picked, updatedAt) => ({ value: { picked, hiddenRequired: [], coursesChosen: true }, updatedAt });

  it("сливает заметки, задачи и галочки; настройки — новее", () => {
    const local = { ...empty, notes: [note("a", "2026-11-06T08:00:00Z")], tasks: [note("t1", "2026-11-06T08:00:00Z")], kurse: kurse([1], "2026-11-06T10:00:00Z") };
    const remote = { ...empty, notes: [note("b", "2026-11-06T08:00:00Z")], marks: [{ id: "17", done: true, updatedAt: "2026-11-05T08:00:00Z" }], kurse: kurse([2], "2026-11-06T09:00:00Z") };
    const merged = mergeBlock(local, remote, undefined, now);
    expect(merged.notes.map((n) => n.id)).toEqual(["a", "b"]);
    expect(merged.tasks.map((n) => n.id)).toEqual(["t1"]);
    expect(merged.marks).toHaveLength(1);
    expect(merged.kurse.value.picked).toEqual([1]);
  });

  it("выключенная часть: своё не отправляем, чужое не стираем", () => {
    const local = { ...empty, notes: [note("a", "2026-11-06T08:00:00Z")], kurse: kurse([1], "2026-11-06T10:00:00Z") };
    const remote = { ...empty, notes: [note("b", "2026-11-06T08:00:00Z")], kurse: kurse([2], "2026-11-06T09:00:00Z") };
    const merged = mergeBlock(local, remote, { notes: false, aufgaben: true, kurse: false, darstellung: true }, now);
    expect(merged.notes.map((n) => n.id)).toEqual(["b"]);
    expect(merged.kurse.value.picked).toEqual([2]);
  });

  it("галочки старше 60 дней удаляются", () => {
    const remote = { ...empty, marks: [{ id: "1", done: true, updatedAt: "2026-08-01T00:00:00Z" }, { id: "2", done: true, updatedAt: "2026-10-30T00:00:00Z" }] };
    expect(mergeBlock(empty, remote, undefined, now).marks.map((m) => m.id)).toEqual(["2"]);
  });
});

describe("снимки настроек", () => {
  it("kurseOf и darstellungOf берут только нужные поля", () => {
    const user = { picked: [3], hiddenRequired: [], coursesChosen: true, notes: [1], startView: "heute", dayView: "liste", compactWeek: true, fontScale: 2, changedFormat: "date", showWeekend: false, colorOverrides: { Ma: "kunst" } };
    expect(kurseOf(user)).toEqual({ picked: [3], hiddenRequired: [], coursesChosen: true });
    expect(darstellungOf(user, "dark")).toMatchObject({ theme: "dark", startView: "heute", colorOverrides: { Ma: "kunst" } });
    expect(darstellungOf(user, "dark").notes).toBeUndefined();
  });
});

describe("syncBlock", () => {
  const local = { ...empty, notes: [note("a", "2026-11-06T00:00:00Z")] };

  it("на сервере пусто → PUT с baseVersion 0", async () => {
    const calls = [];
    const request = async (method, body) => {
      calls.push([method, body?.baseVersion]);
      return method === "GET" ? { status: 404 } : { status: 200, data: { version: 1 } };
    };
    const res = await syncBlock({ keys: {}, local, request, crypto: box, now });
    expect(calls).toEqual([["GET", undefined], ["PUT", 0]]);
    expect(res).toMatchObject({ version: 1, changed: true });
  });

  it("ничего не изменилось → без PUT", async () => {
    const block = mergeBlock(local, empty, undefined, now);
    const request = async (method) => (method === "GET" ? { status: 200, data: { data: JSON.stringify(block), version: 4 } } : { status: 500 });
    expect(await syncBlock({ keys: {}, local, request, crypto: box, now })).toMatchObject({ version: 4, changed: false });
  });

  it("старый блок { notes } дополняется остальными частями", async () => {
    let sent = null;
    const request = async (method, body) => {
      if (method === "GET") return { status: 200, data: { data: JSON.stringify({ notes: [] }), version: 2 } };
      sent = JSON.parse(body.data);
      return { status: 200, data: { version: 3 } };
    };
    await syncBlock({ keys: {}, local: { ...local, kurse: { value: { picked: [1] }, updatedAt: null } }, request, crypto: box, now });
    expect(sent).toMatchObject({ notes: [{ id: "a" }], tasks: [], marks: [], kurse: { value: { picked: [1] } } });
  });

  it("409 → повтор с новой версией", async () => {
    let puts = 0;
    const request = async (method, body) => {
      if (method === "GET") return { status: 200, data: { data: JSON.stringify({ notes: [] }), version: 2 + puts } };
      puts += 1;
      return puts === 1 ? { status: 409 } : { status: 200, data: { version: body.baseVersion + 1 } };
    };
    expect(await syncBlock({ keys: {}, local, request, crypto: box, now })).toMatchObject({ version: 4, changed: true });
  });

  it("постоянный 409 → conflict; нерасшифрованный блок → wrong_code", async () => {
    const busy = async (method) => (method === "GET" ? { status: 404 } : { status: 409 });
    await expect(syncBlock({ keys: {}, local: empty, request: busy, crypto: box, now })).rejects.toThrow("conflict");
    const broken = async () => ({ status: 200, data: { data: "kaputt", version: 1 } });
    await expect(syncBlock({ keys: {}, local: empty, request: broken, crypto: box, now })).rejects.toThrow("wrong_code");
  });

  it("слишком много текста → too_big", async () => {
    const big = { ...empty, notes: [note("a", "2026-11-06T00:00:00Z", { text: "x".repeat(50 * 1024) })] };
    expect(fitsInBlock(big)).toBe(false);
    await expect(syncBlock({ keys: {}, local: big, request: async () => ({ status: 404 }), crypto: box, now })).rejects.toThrow("too_big");
  });
});

describe("классы в блоке (часть 29d)", () => {
  const kurse = (picked, updatedAt) => ({ value: { picked, hiddenRequired: [], coursesChosen: true }, updatedAt });
  const list = [
    { id: 1, name: "8a", label: "Meine", color: "mathe" },
    { id: 2, name: "8b", label: "", color: "deutsch" },
  ];
  const user = {
    notes: [note("a1", "2026-11-06T08:00:00Z")],
    picked: [11],
    hiddenRequired: [],
    coursesChosen: true,
    byClass: { 2: { notes: [note("b1", "2026-11-06T08:00:00Z")], picked: [22], hiddenRequired: [], coursesChosen: true } },
  };

  it("localKlassen: открытый класс — сверху, остальные — из byClass; без byClass — пусто", () => {
    const k = localKlassen(user, 1, [...list, { id: 3, name: "5a" }], { 2: { kurse: "2026-11-06T09:00:00Z" } });
    expect(k["1"].notes.map((n) => n.id)).toEqual(["a1"]);
    expect(k["2"].kurse).toEqual(kurse([22], "2026-11-06T09:00:00Z"));
    expect(k["2"].info.value).toEqual({ label: "", color: "deutsch", order: 1 });
    expect(k["3"].notes).toEqual([]);
    expect(k["3"].kurse.updatedAt).toBeNull();
  });

  it("mergeKlassen: заметки каждого класса отдельно, чужой класс остаётся как есть", () => {
    const local = localKlassen(user, 1, list);
    const remote = { 1: { notes: [note("a2", "2026-11-06T08:00:00Z")] }, 9: { notes: [note("z", "x")], kurse: null, info: null } };
    const merged = mergeKlassen(local, remote, undefined, now);
    expect(merged["1"].notes.map((n) => n.id).sort()).toEqual(["a1", "a2"]);
    expect(merged["2"].notes.map((n) => n.id)).toEqual(["b1"]);
    expect(merged["9"].notes.map((n) => n.id)).toEqual(["z"]);
  });

  it("выключенная часть klassen: имя и цвет берём из блока", () => {
    const local = { 1: { notes: [], kurse: null, info: { value: { label: "Neu" }, updatedAt: "2026-11-06T10:00:00Z" } } };
    const remote = { 1: { notes: [], kurse: null, info: { value: { label: "Alt" }, updatedAt: "2026-11-06T09:00:00Z" } } };
    expect(mergeKlassen(local, remote, { klassen: false }, now)["1"].info.value.label).toBe("Alt");
    expect(mergeKlassen(local, remote, {}, now)["1"].info.value.label).toBe("Neu");
  });

  it("старый блок без klassen: его заметки и курсы — домашнего класса; сверху снова домашний", () => {
    const local = { ...empty, klassen: localKlassen(user, 2, list) };
    const remote = { ...empty, notes: [note("old", "2026-11-06T08:00:00Z")], kurse: kurse([5], "2026-11-06T07:00:00Z") };
    const merged = mergeBlock(local, remote, undefined, now, 1);
    expect(merged.klassen["1"].notes.map((n) => n.id)).toContain("old");
    expect(merged.klassen["2"].notes.map((n) => n.id)).not.toContain("old");
    expect(merged.notes).toBe(merged.klassen["1"].notes);
    expect(merged.kurse).toEqual(kurse([5], "2026-11-06T07:00:00Z"));
  });

  it("блок с klassen: верхние заметки уже не читаются как домашние", () => {
    const local = { ...empty, klassen: localKlassen(user, 1, list) };
    const remote = { ...empty, notes: [note("legacy", "x")], klassen: { 1: { notes: [] } } };
    expect(mergeBlock(local, remote, undefined, now, 1).klassen["1"].notes.map((n) => n.id)).toEqual(["a1"]);
  });

  it("устройство без классов: klassen из блока не трогаем", () => {
    const remote = { ...empty, klassen: { 7: { notes: [] } } };
    expect(mergeBlock({ ...empty }, remote, undefined, now).klassen).toEqual({ 7: { notes: [] } });
  });

  it("applyInfo: имя, цвет и порядок с другого устройства", () => {
    const klassen = { 1: { info: { value: { label: "", color: "kunst", order: 1 } } }, 2: { info: { value: { label: "Bruder", color: "deutsch", order: 0 } } } };
    const next = applyInfo(list, klassen);
    expect(next.map((c) => c.id)).toEqual([2, 1]);
    expect(next[0].label).toBe("Bruder");
    expect(next[1].color).toBe("kunst");
  });

  it("classPatch: открытый класс — наверх, другой — в byClass", () => {
    expect(classPatch(user, 1, 1, { picked: [1] })).toEqual({ picked: [1] });
    expect(classPatch(user, 2, 1, { picked: [1] }).byClass[2].picked).toEqual([1]);
    expect(classPatch(user, 3, 1, { picked: [3] }).byClass[3].notes).toEqual([]);
  });
});

describe("darstellungOf · часть 30a", () => {
  it("везёт оформление; у старого устройства без полей — значения по умолчанию", () => {
    expect(darstellungOf({ design: "glas", accent: "blau", glassBg: "meer", glassMode: "einfach", motion: "aus" }, "dark")).toMatchObject({
      theme: "dark", design: "glas", accent: "blau", glassBg: "meer", glassMode: "einfach", motion: "aus",
    });
    expect(darstellungOf({}, "light")).toMatchObject({ design: "soft", accent: "violett", glassBg: "aurora", glassMode: "voll", motion: null });
  });
});
