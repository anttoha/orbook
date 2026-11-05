import { describe, expect, it } from "vitest";
import { changedLabel, lastStandLabel, planMomentText, standText, subjectCode, subjectName, updatedAgoText, visibleLessons } from "./format";

describe("standText", () => {
  it("сегодня, вчера и другой день", () => {
    expect(standText("2026-10-05T07:12:00+02:00", "2026-10-05")).toBe("Stand von heute 07:12");
    expect(standText("2026-10-04T18:30:00+02:00", "2026-10-05")).toBe("Stand von gestern 18:30");
    expect(standText("2026-10-01T07:12:00+02:00", "2026-10-05")).toBe("Stand von 1.10. 07:12");
  });

  it("publishedAt = null", () => {
    expect(standText(null, "2026-10-05")).toBeNull();
  });
});

describe("updatedAgoText", () => {
  const now = new Date("2026-10-05T10:00:00+02:00");

  it("минуты, часы и дни", () => {
    expect(updatedAgoText("2026-10-05T09:57:00+02:00", now)).toBe("aktualisiert vor 3 Min.");
    expect(updatedAgoText("2026-10-05T07:30:00+02:00", now)).toBe("aktualisiert vor 2 Std.");
    expect(updatedAgoText("2026-10-04T09:00:00+02:00", now)).toBe("aktualisiert vor 1 Tag");
    expect(updatedAgoText("2026-10-01T09:00:00+02:00", now)).toBe("aktualisiert vor 4 Tagen");
  });

  it("только что и время из будущего (демо)", () => {
    expect(updatedAgoText("2026-10-05T09:59:50+02:00", now)).toBe("aktualisiert gerade eben");
    expect(updatedAgoText("2026-11-05T14:00:00+01:00", now)).toBe("aktualisiert gerade eben");
  });

  it("null и мусор не ломают экран", () => {
    expect(updatedAgoText(null, now)).toBeNull();
    expect(updatedAgoText("kaputt", now)).toBeNull();
  });
});

describe("предмет может быть null", () => {
  it("subjectName: название, код, запасной текст", () => {
    expect(subjectName({ code: "Ma", name: "Mathe" })).toBe("Mathe");
    expect(subjectName({ code: "Sk", name: null })).toBe("Sk");
    expect(subjectName(null)).toBe("Ohne Fach");
  });

  it("subjectCode: код или прочерк", () => {
    expect(subjectCode({ code: "Ma", name: "Mathe" })).toBe("Ma");
    expect(subjectCode(null)).toBe("–");
  });
});

describe("changedLabel", () => {
  const day = { date: "2026-11-05", status: "ok", changedAt: "2026-11-05T07:08:00+01:00", publishedAt: "2026-11-04T20:01:00+01:00" };

  it("в тот же день: только время", () => {
    expect(changedLabel(day)).toBe("07:08");
  });

  it("раньше: день недели и время", () => {
    expect(changedLabel({ ...day, changedAt: "2026-11-04T15:15:00+01:00" })).toBe("Mi 15:15");
  });

  it("changedAt = null: берём publishedAt", () => {
    expect(changedLabel({ ...day, changedAt: null })).toBe("Mi 20:01");
  });

  it("нет времени или плана: строки нет", () => {
    expect(changedLabel({ ...day, changedAt: null, publishedAt: null })).toBeNull();
    expect(changedLabel({ ...day, status: "not_published" })).toBeNull();
    expect(changedLabel(null)).toBeNull();
  });
});

describe("planMomentText", () => {
  const today = "2026-11-05";

  it("сегодня, вчера и другой день", () => {
    expect(planMomentText("2026-11-05T07:08:00+01:00", today)).toBe("heute 07:08");
    expect(planMomentText("2026-11-04T18:30:00+01:00", today)).toBe("gestern 18:30");
    expect(planMomentText("2026-11-02T15:15:00+01:00", today)).toBe("Mo, 2.11. 15:15");
  });

  it("null: прочерк", () => {
    expect(planMomentText(null, today)).toBe("—");
  });
});

describe("lastStandLabel", () => {
  it("сегодня только время, другой день с названием, пусто — прочерк", () => {
    expect(lastStandLabel("2026-11-05T07:12", "2026-11-05")).toBe("07:12");
    expect(lastStandLabel("2026-11-04T07:12", "2026-11-05")).toBe("gestern 07:12");
    expect(lastStandLabel(null, "2026-11-05")).toBe("—");
  });
});

describe("visibleLessons", () => {
  const courses = [{ nr: "131", optional: false }, { nr: "141", optional: true }];
  const lessons = [{ course: { nr: "131" } }, { course: { nr: "141" } }, { course: null }];
  it("нічого не сховано — усі уроки", () => expect(visibleLessons(lessons, courses, new Set())).toHaveLength(3));
  it("схований обов'язковий курс зникає, урок без курсу лишається", () => {
    expect(visibleLessons(lessons, courses, new Set(), new Set(["131"]))).toEqual([lessons[1], lessons[2]]);
  });
  it("вибір за вибором і схований обов'язковий разом", () => {
    expect(visibleLessons(lessons, courses, new Set(["keine"]), new Set(["131"]))).toEqual([lessons[2]]);
  });
});
