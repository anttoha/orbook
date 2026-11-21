import { describe, expect, it } from "vitest";
import { fehlzeitenSheet, halbjahrSheet, hasSheet, isOriginal, pageCount, paperStand, pdfName, schoolYear, sheetFor, weightTag, zeugnisSheet } from "./notenSheet";

const DATA = {
  updatedAt: "2026-09-16",
  fetchedAt: "2026-09-17T07:41:00Z",
  subjects: [
    {
      code: "ma",
      name: "Mathematik",
      grades: [
        { date: "2026-09-10", grade: "2", value: 2, weight: 1, half: 1 },
        { date: "2026-09-16", grade: "3+", value: 2.7, weight: 2, half: 1 },
        { date: "2027-03-01", grade: "1", value: 1, weight: null, half: 2 },
      ],
      finals: [{ half: 1, grade: "2", value: 2, note: null }, { half: 2, grade: null, value: null, note: null }],
    },
    { code: "ku", name: "Kunst", grades: [{ date: null, grade: "m.E.", value: null, weight: null, half: 1 }], finals: [] },
    { code: "ph", name: "Physik", grades: [], finals: null },
  ],
  absences: {
    days: [{ date: "2026-09-15", reason: "Krankheit", excused: true, half: 1 }],
    hours: [{ date: "2026-09-02", subject: "Mathematik", amount: "1 Stunde", hours: 1, reason: null, excused: false, half: 1 }],
    summary: { days: 1, daysUnexcused: 0, hours: 1, hoursUnexcused: 1 },
  },
};

describe("notenSheet", () => {
  it("Schuljahr ab August", () => {
    expect(schoolYear("2026-09-10")).toBe("2026/27");
    expect(schoolYear("2027-03-01")).toBe("2026/27");
    expect(schoolYear(null)).toBeNull();
  });

  it("Stand mit Jahr, sonst Ladedatum", () => {
    expect(paperStand(DATA)).toBe("Stand 16.09.2026 · aus Home.InfoPoint");
    expect(paperStand({ updatedAt: null, fetchedAt: "2026-11-20T07:41:00Z" })).toBe("Stand 20.11.2026 · aus Home.InfoPoint");
    expect(paperStand(null)).toBe("aus Home.InfoPoint");
  });

  it("Gewicht nur wenn nicht einfach", () => {
    expect(weightTag(2)).toBe("×2");
    expect(weightTag(0.5)).toBe("×0,5");
    expect(weightTag(1)).toBeNull();
    expect(weightTag(null)).toBeNull();
  });

  it("Halbjahr: Fächer mit Noten, neueste zuerst, Schnitt mit Gewicht", () => {
    const sheet = halbjahrSheet(DATA, 1);
    expect(sheet.year).toBe("2026/27");
    expect(sheet.subjects.map((s) => s.code)).toEqual(["ma", "ku"]);
    expect(sheet.subjects[0].grades.map((g) => g.grade)).toEqual(["3+", "2"]);
    expect(sheet.subjects[0].average).toBeCloseTo((2.7 * 2 + 2) / 3);
    expect(sheet.subjects[1].average).toBeNull(); // «m.E.» не считается
    expect(sheet.average).toBeCloseTo(sheet.subjects[0].average);
    expect(sheet.count).toBe(3);
    expect(sheet.absences.stats).toEqual({ days: 1, hours: 1, unexcused: 1 });
  });

  it("Zeugnis: nur Fächer mit Endnote, beide Halbjahre", () => {
    const sheet = sheetFor(DATA, "zeugnis");
    expect(sheet.kind).toBe("zeugnis");
    expect(sheet.subjects).toHaveLength(1);
    expect(sheet.subjects[0].finals.map((f) => f?.grade ?? null)).toEqual(["2", null]);
    expect(zeugnisSheet({}).subjects).toEqual([]);
  });

  it("Fehlzeiten und leere Daten", () => {
    expect(fehlzeitenSheet(DATA, 1).absences.entries).toHaveLength(2);
    expect(fehlzeitenSheet(DATA, 2).absences.entries).toHaveLength(0);
    expect(hasSheet(DATA)).toBe(true);
    expect(hasSheet(null)).toBe(false);
    expect(hasSheet({ subjects: [{ grades: [], finals: null }], absences: null })).toBe(false);
    expect(halbjahrSheet(null, 1)).toMatchObject({ subjects: [], average: null, count: 0, year: null });
  });

  it("Varianten, Schuljahr, Dateiname und Seiten", () => {
    const year = sheetFor(DATA, "jahr");
    expect(year.half).toBeNull();
    expect(year.subjects[0].grades.map((g) => g.grade)).toEqual(["1", "3+", "2"]);
    expect(sheetFor(DATA, "fehlzeiten").absences.entries).toHaveLength(2);
    expect(sheetFor(DATA, "2").subjects.map((s) => s.code)).toEqual(["ma"]);
    expect(isOriginal("summary")).toBe(true);
    expect(isOriginal("1")).toBe(false);
    expect(pdfName(DATA, "1")).toBe("Noten-1-Halbjahr-2026-27.pdf");
    expect(pdfName(DATA, "detail")).toBe("InfoPoint-Alle-Noten-2026-09-16.pdf");
    expect(pdfName({}, "zeugnis")).toBe("Zeugnis.pdf");
    expect(pageCount(900)).toBe(1);
    expect(pageCount(1017)).toBe(1);
    expect(pageCount(1500)).toBe(2);
    expect(pageCount(0)).toBe(1);
  });
});
