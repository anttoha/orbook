import { describe, expect, it } from "vitest";
import { defaultShort, isMajorType, lessonEntries, movedAway, movedFromText, nextLessons, typeList, typeShort, validateDetails } from "./entries";

const ma = (period, status = "normal") => ({ period, status, subject: { code: "Ma" } });

describe("Arten und Kürzel", () => {
  it("nimmt examTypeList, sonst Namen vom alten Server, sonst Standard", () => {
    expect(typeList({ examTypeList: [{ name: "Quiz", short: "Q" }] })).toEqual([{ name: "Quiz", short: "Q" }]);
    expect(typeList({ examTypes: ["Klausur", "Mündliche Prüfung"] })).toEqual([
      { name: "Klausur", short: "Kl" },
      { name: "Mündliche Prüfung", short: "MP" },
    ]);
    expect(typeList(null).map((t) => t.short)).toEqual(["KA", "LK", "T", "AB"]);
  });

  it("Kürzel auch für gelöschte Arten", () => {
    expect(typeShort("Test", typeList(null))).toBe("T");
    expect(typeShort("Referat", typeList(null))).toBe("Re");
    expect(defaultShort("")).toBe("?");
    expect(isMajorType("Klausur") && isMajorType("Klassenarbeit") && !isMajorType("Test")).toBe(true);
  });
});

describe("verschoben", () => {
  it("Text nur mit movedFrom", () => {
    expect(movedFromText({ movedFrom: { date: "2026-09-17", lesson: 3 } })).toBe("von Do 17.9., 3. Std");
    expect(movedFromText({ movedFrom: { date: "2026-09-17", lesson: null } })).toBe("von Do 17.9.");
    expect(movedFromText({ movedFrom: null })).toBeNull();
    expect(movedFromText(undefined)).toBeNull();
  });

  it("findet Einträge, die vom ausgefallenen Urlaub weg sind", () => {
    const exams = [
      { id: 1, subject: { code: "En" }, movedFrom: { date: "2026-09-17", lesson: 3 } },
      { id: 2, subject: { code: "En" }, movedFrom: null },
    ];
    expect(movedAway(exams, "2026-09-17", { period: 3, subject: { code: "En" } }).map((e) => e.id)).toEqual([1]);
    expect(movedAway(exams, "2026-09-17", { period: 3, subject: null })).toEqual([]);
  });
});

describe("Beschreibung", () => {
  it("prüft wie der Server", () => {
    expect(validateDetails("")).toBeNull();
    expect(validateDetails("Buch S. 40–58\nTaschenrechner")).toBeNull();
    expect(validateDetails("siehe www.example.de")).toBe("Links bitte als Material anhängen.");
    expect(validateDetails("x".repeat(301))).toMatch(/höchstens 300/);
    expect(validateDetails("Ruf an: 0151 2345678")).toMatch(/Telefonnummern/);
  });
});

describe("nächste Stunde", () => {
  const days = [
    { date: "2026-09-19", lessons: [ma(1), ma(2)] },
    { date: "2026-09-17", lessons: [ma(2), { ...ma(5), status: "cancelled" }] },
    { date: "2026-09-22", lessons: [], expectedLessons: [ma(3)] },
    { date: "2026-09-18", lessons: [{ period: 1, status: "normal", subject: null }] },
  ];

  it("Doppelstunde zählt einmal, Ausfall nicht, Muster zählt", () => {
    expect(nextLessons(days, "Ma", { date: "2026-09-17", period: 2 })).toEqual([
      { date: "2026-09-19", period: 1 },
      { date: "2026-09-22", period: 3 },
    ]);
  });

  it("derselbe Tag zweimal zählt einmal", () => {
    const twice = [{ date: "2026-09-19", lessons: [ma(1)] }, { date: "2026-09-19", lessons: [ma(1)] }];
    expect(nextLessons(twice, "Ma", { date: "2026-09-17", period: 2 })).toEqual([{ date: "2026-09-19", period: 1 }]);
  });

  it("nichts gefunden oder ohne Fach", () => {
    expect(nextLessons(days, "De", { date: "2026-09-17", period: 1 })).toEqual([]);
    expect(nextLessons(days, null, { date: "2026-09-17", period: 1 })).toEqual([]);
  });
});

describe("Einträge der Stunde", () => {
  it("Test mit oder ohne Stunde, Hausaufgabe nur mit Stunde", () => {
    const lesson = { period: 2, subject: { code: "Ma" } };
    const exams = [
      { id: 1, date: "2026-09-19", lesson: 2, subject: { code: "Ma" } },
      { id: 2, date: "2026-09-19", lesson: null, subject: { code: "Ma" } },
      { id: 3, date: "2026-09-19", lesson: 3, subject: { code: "Ma" } },
    ];
    const homework = [
      { id: 7, due: "2026-09-19", lesson: 2, subject: { code: "Ma" } },
      { id: 8, due: "2026-09-19", lesson: null, subject: { code: "Ma" } },
    ];
    const found = lessonEntries(exams, homework, "2026-09-19", lesson);
    expect(found.exams.map((e) => e.id)).toEqual([1, 2]);
    expect(found.homework.map((e) => e.id)).toEqual([7]);
    expect(lessonEntries(exams, homework, "2026-09-19", { period: 2, subject: null })).toEqual({ exams: [], homework: [] });
  });
});
