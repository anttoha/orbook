import { describe, expect, it } from "vitest";
import { deleteNote, editNote, findNote, mergeNotes, newNote, noteMeta, noteSubjects, syncedText, syncErrorText, upgradeNote, visibleNotes } from "./notes";

const at = (iso) => new Date(iso);
const note = (id, updatedAt, extra = {}) => ({ id, text: id, date: "2026-11-06", subject: null, period: null, updatedAt, ...extra });

describe("модель нотатки", () => {
  it("нотатка до уроку має сталий id, на день — випадковий", () => {
    expect(newNote("x", { date: "2026-11-06", period: 2 }).id).toBe("2026-11-06#2");
    const a = newNote("x", { date: "2026-11-06" }).id;
    expect(a.startsWith("2026-11-06#")).toBe(true);
    expect(a).not.toBe(newNote("x", { date: "2026-11-06" }).id);
  });

  it("видалення — надгробок без тексту, його не видно", () => {
    const n = newNote("Atlas", { date: "2026-11-06" }, at("2026-11-06T08:00:00Z"));
    const gone = deleteNote(n, at("2026-11-06T09:00:00Z"));
    expect(gone).toMatchObject({ deleted: true, text: "", updatedAt: "2026-11-06T09:00:00.000Z" });
    expect(visibleNotes([gone])).toEqual([]);
    expect(findNote([gone], n.id)).toBeUndefined();
  });

  it("editNote оновлює час", () => {
    expect(editNote(note("a", "2026-11-01T00:00:00.000Z"), { text: "neu" }, at("2026-11-06T00:00:00Z")).updatedAt).toBe("2026-11-06T00:00:00.000Z");
  });

  it("стара нотатка (число в updatedAt, без предмета) стає новою", () => {
    expect(upgradeNote({ id: "2026-10-07#2", date: "2026-10-07", period: 2, text: "x", updatedAt: 0 })).toEqual({
      id: "2026-10-07#2",
      date: "2026-10-07",
      period: 2,
      text: "x",
      subject: null,
      updatedAt: "1970-01-01T00:00:00.000Z",
    });
  });
});

describe("mergeNotes", () => {
  const now = at("2026-11-06T12:00:00Z");

  it("перемагає новіша версія, порядок за id", () => {
    const merged = mergeNotes([note("b", "2026-11-05T00:00:00Z", { text: "lokal" })], [note("b", "2026-11-04T00:00:00Z"), note("a", "2026-11-01T00:00:00Z")], now);
    expect(merged.map((n) => n.id)).toEqual(["a", "b"]);
    expect(merged[1].text).toBe("lokal");
  });

  it("при рівному часі перемагає видалення", () => {
    const t = "2026-11-05T00:00:00Z";
    expect(mergeNotes([note("a", t)], [note("a", t, { deleted: true })], now)[0].deleted).toBe(true);
  });

  it("надгробки старші за 30 днів зникають", () => {
    expect(mergeNotes([note("a", "2026-09-01T00:00:00Z", { deleted: true })], [], now)).toEqual([]);
    expect(mergeNotes([note("a", "2026-11-01T00:00:00Z", { deleted: true })], [], now)).toHaveLength(1);
  });
});

describe("підписи", () => {
  it("чіпи предметів: без повторів і без уроків без предмета", () => {
    const lessons = [{ subject: { code: "Ma" } }, { subject: null }, { subject: { code: "Ma" } }, { subject: { code: "De" } }];
    expect(noteSubjects(lessons)).toEqual(["Ma", "De"]);
    expect(noteSubjects([], "Ph")).toEqual(["Ph"]);
  });

  it("підпис під нотаткою", () => {
    expect(noteMeta("Sport", 6)).toBe("Sport · 6. Std · nur für dich");
    expect(noteMeta("Mathe", null)).toBe("Mathe · nur für dich");
    expect(noteMeta(null, null)).toBe("nur für dich");
  });

  it("тексти помилок", () => {
    expect(syncErrorText(new Error("wrong_code"))).toBe("Code passt nicht zu den Daten");
    expect(syncErrorText({ code: "offline" })).toBe("Nicht synchronisiert — keine Verbindung");
    expect(syncErrorText({ code: "sync_full", message: "x" })).toBe("Der Sync-Speicher ist voll.");
  });
});

describe("syncedText", () => {
  it("сьогодні — тільки час, ще не було — «Noch nicht»", () => {
    const now = new Date(2026, 10, 6, 9, 0);
    expect(syncedText(new Date(2026, 10, 6, 7, 40).toISOString(), now)).toBe("Zuletzt synchronisiert heute 07:40 · alles aktuell");
    expect(syncedText(new Date(2026, 10, 5, 18, 5).toISOString(), now)).toBe("Zuletzt synchronisiert gestern 18:05 · alles aktuell");
    expect(syncedText(null, now)).toBe("Noch nicht synchronisiert");
  });
});
