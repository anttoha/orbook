import { describe, expect, it } from "vitest";
import {
  absenceEntries,
  absenceStats,
  averageOf,
  badgeOf,
  defaultHalf,
  defaultTarget,
  examGrade,
  finalsLine,
  freshKeys,
  gradeKey,
  gradeTone,
  latestGrade,
  neededGrade,
  newerAppData,
  noteNumber,
  overviewOf,
  sameSubject,
  standLine,
  stepTarget,
  waitMinutes,
  zeugnisOf,
} from "./noten";

const g = (date, grade, value, weight = 1, half = 1) => ({ date, grade, value, weight, half, note: null });
// Mathe из макета: 3+ (×2), 2, 1, 2- → 2,14
const mathe = { code: "ma", name: "Mathematik", grades: [g("2026-09-16", "3+", 2.7, 2), g("2026-09-10", "2", 2), g("2026-09-03", "1", 1), g("2026-08-27", "2-", 2.3)], finals: [] };
const data = {
  updatedAt: "2026-09-16",
  fetchedAt: "2026-09-17T05:41:00Z",
  subjects: [
    mathe,
    { code: "de", name: "Deutsch", grades: [g("2026-09-12", "2", 2, 2), g("2026-09-01", "m.E.", null, null)], finals: [{ half: 1, grade: "2", value: 2, note: null }, { half: 2, grade: null, value: null, note: null }] },
    { code: "wpf", name: "Wahlpflichtfach", grades: [], finals: [] },
  ],
  absences: { days: [{ date: "2026-09-15", reason: null, excused: true, half: 1 }], hours: [{ date: "2026-09-02", subject: "Mathematik", amount: "1 Stunden", hours: 1, reason: null, excused: false, half: 1 }], summary: null },
};

describe("noten", () => {
  it("Schnitt mit Gewicht, «m.E.» zählt nicht", () => {
    expect(averageOf(mathe.grades)).toBeCloseTo(2.14, 2);
    expect(averageOf(data.subjects[1].grades)).toBe(2);
    expect(averageOf([g("x", "m.E.", null)])).toBeNull();
    expect(noteNumber(2.14)).toBe("2,1");
    expect(noteNumber(null)).toBe("–");
  });

  it("Farben: ≤ 2,5 gut, > 3,5 schlecht", () => {
    expect(gradeTone(2.5)).toBe("good");
    expect(gradeTone(2.6)).toBe("mid");
    expect(gradeTone(3.5)).toBe("mid");
    expect(gradeTone(3.6)).toBe("bad");
    expect(gradeTone(null)).toBe("none");
  });

  it("Übersicht: nur Fächer mit Noten im Halbjahr", () => {
    const o = overviewOf(data, 1);
    expect(o.subjects.map((s) => s.code)).toEqual(["ma", "de"]);
    expect(o.count).toBe(6);
    expect(o.average).toBeCloseTo((2.14 + 2) / 2, 2);
    expect(overviewOf(data, 2).subjects).toEqual([]);
    expect(overviewOf(null, 1).average).toBeNull();
    expect(defaultHalf(data)).toBe(1);
    expect(badgeOf("ma")).toBe("Ma");
    expect(badgeOf("wpf")).toBe("Wpf");
  });

  it("Zeugnis: nur Noten der Schule", () => {
    const z = zeugnisOf(data);
    expect(z.map((s) => s.code)).toEqual(["de"]);
    expect(z[0].last.grade).toBe("2");
    expect(finalsLine(z[0].finals)).toBe("1. Hj. 2 · 2. Hj. –");
  });

  it("Notenrechner wie im Entwurf: Ziel 2,0, ×2 → 1,6", () => {
    const r = neededGrade(mathe.grades, 2, 2);
    expect(r.status).toBe("need");
    expect(r.need).toBe(1.6);
    expect(noteNumber(r.after)).toBe("2,0");
    expect(neededGrade(mathe.grades, 1, 1).status).toBe("impossible");
    expect(neededGrade(mathe.grades, 6, 1).status).toBe("sure");
    expect(neededGrade([], 2, 1)).toEqual({ status: "need", need: 2, after: 2 });
    expect(defaultTarget(2.14)).toBeCloseTo(2.0);
    expect(defaultTarget(1.04)).toBe(1);
    expect(stepTarget(2, 0.1)).toBe(2.1);
    expect(stepTarget(1, -0.1)).toBe(1);
  });

  it("«neu»: nur was beim letzten Mal fehlte", () => {
    const before = { subjects: [{ ...mathe, grades: mathe.grades.slice(1) }] };
    expect(freshKeys(null, data)).toEqual([]);
    const fresh = freshKeys(before, { subjects: [mathe] });
    expect(fresh).toEqual([gradeKey("ma", mathe.grades[0])]);
    expect(latestGrade(data, fresh).grade.grade).toBe("3+");
    expect(latestGrade(data, []).grade.date).toBe("2026-09-16");
    expect(latestGrade(null)).toBeNull();
  });

  it("Fehlzeiten zählen und listen", () => {
    expect(absenceStats(data.absences, 1)).toEqual({ days: 1, hours: 1, unexcused: 1 });
    expect(absenceStats(data.absences, 2)).toEqual({ days: 0, hours: 0, unexcused: 0 });
    expect(absenceStats(null)).toEqual({ days: 0, hours: 0, unexcused: 0 });
    const list = absenceEntries(data.absences, 1);
    expect(list.map((e) => e.title)).toEqual(["Ganzer Tag", "1 Stunde"]);
    expect(list[1].sub).toBe("Mathematik");
  });

  it("Stand: ohne updatedAt kein «Stand»", () => {
    const now = new Date("2026-09-17T12:00:00Z");
    expect(standLine({ ...data, fetchedAt: null }, now)).toBe("Stand 16.09.");
    expect(standLine({ updatedAt: null, fetchedAt: null }, now)).toBe("");
    expect(standLine(data, now)).toMatch(/^Stand 16\.09\. · geholt \d\d:\d\d$/);
  });

  it("Note zur Klausur: gleicher Tag, gleiches Fach", () => {
    expect(sameSubject(mathe, { code: "Ma", name: "Mathe" })).toBe(true);
    expect(sameSubject(mathe, { code: "De", name: "Deutsch" })).toBe(false);
    expect(sameSubject(mathe, null)).toBe(false);
    expect(examGrade({ date: "2026-09-16", subject: { code: "Ma", name: "Mathe" } }, data).grade).toBe("3+");
    expect(examGrade({ date: "2026-09-17", subject: { code: "Ma", name: "Mathe" } }, data)).toBeNull();
    expect(examGrade({ date: "2026-09-16", subject: null }, data)).toBeNull();
    expect(waitMinutes(200)).toBe(4);
    expect(waitMinutes(null)).toBe(1);
  });

  it("newerAppData: оценки из фона приложения — только если они новее (и без мусора)", () => {
    const ours = { fetchedAt: "2026-11-20T07:00:00Z", subjects: [] };
    const later = { fetchedAt: "2026-11-20T10:00:00Z", subjects: [] };
    expect(newerAppData(ours, { data: later })).toBe(later);
    expect(newerAppData(later, { data: ours })).toBeNull();
    expect(newerAppData(null, { data: ours })).toBe(ours);
    expect(newerAppData(ours, null)).toBeNull();
    expect(newerAppData(ours, { data: { fetchedAt: "kaputt", subjects: [] } })).toBeNull();
    expect(newerAppData(ours, { data: { fetchedAt: "2026-11-21T00:00:00Z" } })).toBeNull();
  });
});
