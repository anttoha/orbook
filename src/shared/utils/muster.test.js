import { describe, expect, it } from "vitest";
import { abForMonday, abLetter, checkKey, checkReason, isMusterWeek, musterDays, musterWeek, noMusterYet, planChecks, withMuster } from "./muster";

const lesson = (period, code, status = "normal") => ({ period, status, subject: code ? { code, name: null } : null });
const day = (date, over = {}) => ({ date, weekday: "Mo", status: "ok", lessons: [], expectedLessons: [], exams: [], ...over });

describe("abLetter", () => {
  it("1 → A, 2 → B, sonst null", () => {
    expect([abLetter(1), abLetter(2), abLetter(null), abLetter(3)]).toEqual(["A", "B", null, null]);
  });
});

describe("withMuster", () => {
  it("Tag ohne Plan mit expectedLessons wird zum Muster-Tag", () => {
    const out = withMuster(day("2026-10-05", { status: "not_published", expectedLessons: [lesson(1, "Ma")] }));
    expect(out.status).toBe("ok");
    expect(out.muster).toBe(true);
    expect(out.lessons).toEqual([{ ...lesson(1, "Ma"), muster: true }]);
  });

  it("echter Plan, Ferien und leere Tage bleiben, wie sie sind", () => {
    const ok = day("2026-10-05", { lessons: [lesson(1, "Ma")] });
    const empty = day("2026-10-06", { status: "not_published" });
    expect(withMuster(ok)).toBe(ok);
    expect(withMuster(empty)).toBe(empty);
    expect(musterWeek(null)).toBe(null);
  });
});

describe("Muster-Woche", () => {
  const muster = { ...day("2026-10-05"), muster: true };
  const free = day("2026-10-06", { status: "holiday" });
  it("ganze Woche Muster (Ferien zählen nicht) / gemischt", () => {
    expect(isMusterWeek([muster, free])).toBe(true);
    expect(isMusterWeek([muster, day("2026-10-07")])).toBe(false);
    expect(isMusterWeek([free])).toBe(false);
    expect(musterDays([day("2026-10-07"), { ...muster, weekday: "Fr" }])).toEqual(["Fr"]);
    expect(musterDays([muster])).toEqual([]);
  });
});

describe("abForMonday", () => {
  it("Wochen wechseln sich ab", () => {
    expect(abForMonday("2026-09-14", "2026-09-14", 1)).toBe("A");
    expect(abForMonday("2026-09-21", "2026-09-14", 1)).toBe("B");
    expect(abForMonday("2026-10-05", "2026-09-14", 1)).toBe("B");
    expect(abForMonday("2026-09-07", "2026-09-14", 2)).toBe("A");
    expect(abForMonday("2026-09-07", "2026-09-14", null)).toBe(null);
  });
});

describe("noMusterYet", () => {
  const open = day("2026-09-07", { status: "not_published" });
  it("nur wenn Muster an ist und noch nichts da ist", () => {
    expect(noMusterYet([open], "2027-07-31", "2026-09-01")).toBe(true);
    expect(noMusterYet([open], null, "2026-09-01")).toBe(false);
    expect(noMusterYet([open], "2026-09-03", "2026-09-01")).toBe(false);
    expect(noMusterYet([{ ...open, expectedLessons: [lesson(1, "Ma")] }], "2027-07-31", "2026-09-01")).toBe(false);
  });
});

describe("planChecks", () => {
  const real = day("2026-10-05", { lessons: [lesson(1, "De"), lesson(2, "Ma", "cancelled"), lesson(3, "En", "cancelled"), lesson(6, "En", "moved")] });
  const test = { id: 7, date: "2026-10-05", lesson: 2, subject: { code: "Ma", name: "Mathe" } };
  const note = { id: "2026-10-05#3", date: "2026-10-05", period: 3, subject: "En", text: "Vokabeln" };

  it("findet Test und Notiz an Stunden, die nicht stattfinden", () => {
    const items = planChecks({ ...real, exams: [test] }, [note], [], "2026-10-04");
    expect(items).toEqual([
      { kind: "note", note, target: 6 },
      { kind: "exam", exam: test },
    ]);
    expect(checkReason(items[0], real.lessons, "Englisch")).toBe("Englisch in der 6. Stunde.");
    expect(checkReason(items[1], real.lessons, "Mathe")).toBe("Mathe fällt aus.");
  });

  it("Muster-Tage, vergangene Tage, passende Einträge und «So lassen» — nichts zu prüfen", () => {
    expect(planChecks({ ...real, muster: true, exams: [test] }, [note], [], "2026-10-04")).toEqual([]);
    expect(planChecks({ ...real, exams: [test] }, [note], [], "2026-10-06")).toEqual([]);
    const fine = { ...note, period: 1, subject: "De", id: "2026-10-05#1" };
    expect(planChecks(real, [fine, { ...note, deleted: true }], [], "2026-10-04")).toEqual([]);
    const dismissed = [checkKey({ kind: "exam", exam: test }), checkKey({ kind: "note", note })];
    expect(planChecks({ ...real, exams: [test] }, [note], dismissed, "2026-10-04")).toEqual([]);
  });

  it("Test ohne Stunde oder ohne Fach (null) wird nicht geprüft", () => {
    const loose = [{ ...test, lesson: null }, { ...test, id: 8, subject: null }];
    expect(planChecks({ ...real, exams: loose }, [], [], "2026-10-04")).toEqual([]);
  });

  it("Stunde fehlt ganz: eigener Text", () => {
    const item = { kind: "exam", exam: { ...test, lesson: 5 } };
    expect(checkReason(item, real.lessons, "Mathe")).toBe("Mathe steht nicht mehr in der 5. Stunde.");
  });
});
