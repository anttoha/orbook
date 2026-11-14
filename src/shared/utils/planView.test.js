import { describe, expect, it } from "vitest";
import { PLAN_DEFAULTS, cellPlace, cellTitle, planOf, planSummary, shownLessons, subjectLook } from "./planView";

const ma = { period: 1, status: "normal", subject: { code: "Ma", name: "Mathe" }, teacher: "Mü", room: "108", course: null };

describe("planOf", () => {
  it("без збережених налаштувань — як раніше", () => {
    expect(planOf(undefined)).toEqual(PLAN_DEFAULTS);
    expect(planOf(null)).toEqual(PLAN_DEFAULTS);
  });
  it("бере збережене і відкидає невідоме", () => {
    const plan = planOf({ lessonLabel: "name", showRoom: false, subjectStyle: "neon", cancelled: "ausblenden", extra: 1 });
    expect(plan.lessonLabel).toBe("name");
    expect(plan.showRoom).toBe(false);
    expect(plan.subjectStyle).toBe("flaeche");
    expect(plan.cancelled).toBe("ausblenden");
    expect(plan).not.toHaveProperty("extra");
  });
  it("не-boolean для перемикача ігнорується", () => {
    expect(planOf({ showTeacher: "ja" }).showTeacher).toBe(false);
  });
});

describe("клітинка", () => {
  it("назва: Kürzel або Name", () => {
    expect(cellTitle(ma, planOf({}))).toBe("Ma");
    expect(cellTitle(ma, planOf({ lessonLabel: "name" }))).toBe("Mathe");
  });
  it("рядок під назвою — лише увімкнене, null без зайвої крапки", () => {
    expect(cellPlace(ma, planOf({}))).toBe("108");
    expect(cellPlace(ma, planOf({ showTeacher: true }))).toBe("Mü · 108");
    expect(cellPlace({ ...ma, room: null }, planOf({ showTeacher: true }))).toBe("Mü");
    expect(cellPlace(ma, planOf({ showRoom: false }))).toBe("");
  });
  it("Fachfarbe: заливка, смужка, без кольору", () => {
    expect(subjectLook("Ma", {}, planOf({}))).toContain("bg-mathe-tint");
    expect(subjectLook("Ma", {}, planOf({ subjectStyle: "streifen" }))).toContain("border-mathe-solid");
    expect(subjectLook("Ma", {}, planOf({ subjectStyle: "aus" }))).toBe("bg-card text-ink");
    expect(subjectLook(null, {}, planOf({ subjectStyle: "streifen" }))).toContain("border-l-4");
  });
});

describe("shownLessons", () => {
  const list = [ma, { ...ma, period: 2, status: "cancelled" }];
  it("Durchstreichen лишає все, Ausblenden прибирає випалі", () => {
    expect(shownLessons(list, planOf({}))).toHaveLength(2);
    expect(shownLessons(list, planOf({ cancelled: "ausblenden" }))).toEqual([ma]);
  });
});

describe("planSummary", () => {
  it("слова увімкненого", () => {
    expect(planSummary(planOf({}))).toEqual(["Raum", "Uhrzeit"]);
    expect(planSummary(planOf({ showRoom: false, showTimes: false }))).toEqual(["Nur Fach"]);
  });
});
