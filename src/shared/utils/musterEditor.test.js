import { describe, expect, it } from "vitest";
import { autoText, badSlot, changeCount, gridPeriods, isOwnChange, kwStrip, lessonFromCourse, saveLabel, setSlot, slotLessons, weekForMode } from "./musterEditor";

const ma = { weekday: 0, period: 1, subject: "Ma", course: { nr: "131", label: "Ma" }, teacher: "T03", room: "305" };
const de = { weekday: 0, period: 2, subject: "De", course: null, teacher: null, room: "Aula" };
const ku = { weekday: 4, period: 6, subject: "Ku", course: { nr: "143", label: "Ku" }, teacher: "T09", room: "012" };
const bi = { ...ku, subject: "Bi", course: { nr: "134", label: "Bi" }, teacher: "T17", room: "305" };

describe("Zellen", () => {
  it("slotLessons nimmt nur Tag + Stunde, Parallelkurse in fester Reihenfolge", () => {
    expect(slotLessons([ma, de, ku, bi], 4, 6).map((l) => l.subject)).toEqual(["Bi", "Ku"]);
    expect(slotLessons(null, 0, 1)).toEqual([]);
  });

  it("setSlot ersetzt nur diese Zelle (auch leeren)", () => {
    const out = setSlot([ma, de], 0, 1, [{ subject: "Ph", course: null, teacher: "T10", room: "301" }]);
    expect(out).toContainEqual(de);
    expect(slotLessons(out, 0, 1)).toEqual([{ subject: "Ph", course: null, teacher: "T10", room: "301", weekday: 0, period: 1 }]);
    expect(setSlot([ma, de], 0, 1, [])).toEqual([de]);
  });

  it("eigene Änderung = anders als automatisch; Reihenfolge der Kurse egal", () => {
    expect(isOwnChange([ma], [ma], 0, 1)).toBe(false);
    expect(isOwnChange([{ ...ma, room: "108" }], [ma], 0, 1)).toBe(true);
    expect(isOwnChange([bi, ku], [ku, bi], 4, 6)).toBe(false);
    expect(isOwnChange([], [ma], 0, 1)).toBe(true);
  });
});

describe("changeCount / saveLabel", () => {
  it("zählt geänderte Zellen in beiden Wochen", () => {
    const base = { A: [ma, de], B: [ku] };
    expect(changeCount(base, base)).toBe(0);
    expect(changeCount(base, { A: [{ ...ma, room: "1" }], B: [ku, bi] })).toBe(3); // Mo 1 anders, Mo 2 leer, Fr 6 + Bio
    expect(changeCount(null, { A: [ma], B: [] })).toBe(1);
  });

  it("Text der Taste", () => {
    expect([saveLabel(0), saveLabel(1), saveLabel(2)]).toEqual(["Speichern", "Speichern · 1 Änderung", "Speichern · 2 Änderungen"]);
  });
});

describe("gridPeriods", () => {
  const times = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((p) => ({ period: p, start: `0${p}:00`, end: `0${p}:45` }));
  it("immer 1–6, 0 und spätere Stunden nur, wenn belegt", () => {
    expect(gridPeriods(times, [ma]).map((r) => r.period)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(gridPeriods(times, [{ ...ma, period: 8 }], [{ ...de, period: 0 }]).map((r) => r.period)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });
  it("ohne Zeiten: start/end null", () => {
    expect(gridPeriods(null, [])[0]).toEqual({ period: 1, start: null, end: null });
  });
});

describe("Kurse", () => {
  const sport = { nr: "141", label: "SpJu", group: "SpJu", subject: { code: "Sp", name: "Sport" }, teacher: null };
  it("Stunde aus Kurs: Lehrer kann null sein", () => {
    expect(lessonFromCourse(sport, "TH")).toEqual({ subject: "Sp", course: { nr: "141", label: "SpJu" }, teacher: null, room: "TH" });
  });
  it("autoText", () => {
    expect(autoText([ma], { Ma: "Mathe" })).toBe("Mathe · T03 · Raum 305");
    expect(autoText([de])).toBe("De · Raum Aula");
    expect(autoText([])).toBe("frei");
  });
});

describe("Wochen A/B", () => {
  it("weekForMode", () => {
    expect([weekForMode("school", 1), weekForMode("swap", 1), weekForMode("none", 1), weekForMode("swap", null)]).toEqual([1, 2, null, null]);
  });
  it("kwStrip: diese und nächste Wochen abwechselnd", () => {
    expect(kwStrip("2026-11-04", 1, 3)).toEqual([
      { kw: 45, letter: "A" },
      { kw: 46, letter: "B" },
      { kw: 47, letter: "A" },
    ]);
    expect(kwStrip("2026-11-04", null, 1)).toEqual([{ kw: 45, letter: null }]);
  });
});

describe("badSlot", () => {
  it("Feld weeks.A.1 → Zelle der gesendeten Stunde", () => {
    const error = { details: { fields: [{ field: "weeks.A.1", type: "duplicate" }] } };
    expect(badSlot(error, { A: [ma, de], B: [] })).toEqual({ letter: "A", weekday: 0, period: 2 });
    expect(badSlot({}, { A: [] })).toBe(null);
  });
});
