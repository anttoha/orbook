import { describe, expect, it } from "vitest";
import { addClassErrorText, classesOfSchool, classPrefs, classTitle, daySummary, inDaysText, isTeacherCode, mergeClasses, myLessons, nextClassColor, nextClassExam, nextExamAcross, otherSchool, schoolGroups, sideBySideRows, startTarget, swapClassData, todayCells } from "./classes";

const lesson = (period, code, status = "normal", extra = {}) => ({ period, start: `0${period + 6}:00`, end: `0${period + 6}:45`, status, subject: { code, name: { De: "Deutsch", Ma: "Mathe", En: "Englisch", Ku: "Kunst" }[code] ?? code }, course: null, ...extra });

describe("mergeClasses", () => {
  it("keeps device order, name and color; new server classes go last", () => {
    const local = [{ id: 2, name: "5a", label: "Geschwister", color: "englisch", startOpen: false, gone: false }];
    const server = [
      { id: 1, name: "9b", school: { id: 1, name: "Goethe" }, role: "class" },
      { id: 2, name: "5a", school: { id: 1, name: "Goethe" }, role: "class" },
    ];
    const merged = mergeClasses(local, server);
    expect(merged.map((c) => c.id)).toEqual([2, 1]);
    expect(merged[0]).toMatchObject({ label: "Geschwister", color: "englisch", school: { name: "Goethe" } });
    expect(merged[1].color).not.toBe("englisch");
  });

  it("marks a class gone when the server no longer has it", () => {
    const merged = mergeClasses([{ id: 3, name: "7c", color: "accent" }], [{ id: 1, name: "9b" }]);
    expect(merged[0]).toMatchObject({ id: 3, gone: true });
  });

  it("server without classes field (old backend) adds nothing", () => {
    expect(mergeClasses([], undefined)).toEqual([]);
  });
});

describe("nextClassColor", () => {
  it("takes the first free color", () => {
    expect(nextClassColor([])).toBe("accent");
    expect(nextClassColor([{ color: "accent" }])).toBe("englisch");
  });
});

describe("classTitle", () => {
  it("falls back to «Klasse 9b» without a device name", () => {
    expect(classTitle({ name: "9b", label: "" })).toBe("Klasse 9b");
    expect(classTitle({ name: "9b", label: "Meine Klasse" })).toBe("Meine Klasse");
    expect(classTitle(null)).toBe("Klasse");
  });
});

describe("swapClassData (migration and switching)", () => {
  const state = { notes: [{ id: "a" }], picked: ["101"], hiddenRequired: [], coursesChosen: true, checkedPlan: [], allCourses: false, colorOverrides: { Ma: "kunst" }, byClass: {} };

  it("first switch keeps old data under the old class and starts the new one empty", () => {
    const next = swapClassData(state, 1, 2);
    expect(next.byClass[1]).toMatchObject({ notes: [{ id: "a" }], picked: ["101"], coursesChosen: true });
    expect(next).toMatchObject({ notes: [], picked: [], coursesChosen: false });
    expect(next.colorOverrides).toBeUndefined(); // device settings are not touched
  });

  it("switching back restores the class", () => {
    const there = { ...state, ...swapClassData(state, 1, 2) };
    const back = swapClassData(there, 2, 1);
    expect(back).toMatchObject({ notes: [{ id: "a" }], picked: ["101"], coursesChosen: true });
    expect(back.byClass[1]).toBeUndefined();
    expect(back.byClass[2]).toMatchObject({ coursesChosen: false });
  });

  it("same class — nothing changes", () => {
    expect(swapClassData(state, 1, 1)).toEqual({});
  });

  it("classPrefs reads active from top, others from byClass", () => {
    const s = { picked: ["1"], hiddenRequired: [], byClass: { 2: { picked: ["9"], hiddenRequired: ["3"] } } };
    expect(classPrefs(s, 1, 1).picked).toEqual(["1"]);
    expect(classPrefs(s, 2, 1)).toEqual({ picked: ["9"], hiddenRequired: ["3"] });
    expect(classPrefs(s, 5, 1)).toEqual({ picked: [], hiddenRequired: [] });
  });
});

describe("daySummary", () => {
  it("all as planned", () => {
    const lessons = [lesson(1, "De"), lesson(2, "Ma")];
    expect(daySummary({ status: "ok" }, lessons)).toEqual({ tone: "ok", lead: "Alles wie geplant", rest: "Schluss 08:45" });
  });

  it("cancelled + substitution", () => {
    const lessons = [lesson(1, "De"), lesson(2, "Ma", "substitution"), lesson(3, "En", "cancelled")];
    expect(daySummary({ status: "ok" }, lessons)).toEqual({ tone: "danger", lead: "Englisch fällt aus", rest: "Mathe vertreten" });
  });

  it("first lesson cancelled → start time", () => {
    const lessons = [lesson(1, "Bi", "cancelled"), lesson(2, "Ma")];
    expect(daySummary({ status: "ok" }, lessons)).toEqual({ tone: "danger", lead: "1. Stunde fällt aus", rest: "Beginn 08:00" });
  });

  it("free day and no plan", () => {
    expect(daySummary({ status: "holiday" }, []).lead).toBe("Heute frei");
    expect(daySummary({ status: "not_published" }, []).lead).toBe("Noch kein Plan für heute");
    expect(daySummary(null, [])).toBeNull();
  });

  it("subject null is safe", () => {
    const lessons = [lesson(1, "De"), { period: 2, status: "cancelled", subject: null, course: null }];
    expect(daySummary({ status: "ok" }, lessons).lead).toBe("Ohne Fach fällt aus");
  });
});

describe("todayCells / myLessons", () => {
  it("marks cancelled and changed lessons", () => {
    const cells = todayCells([lesson(1, "De"), lesson(2, "Ma", "substitution"), lesson(3, "En", "cancelled")]);
    expect(cells.map((c) => [c.code, c.cancelled, c.changed])).toEqual([["De", false, false], ["Ma", false, true], ["En", true, false]]);
  });

  it("filters by my courses and gives nothing on a free day", () => {
    const day = { status: "ok", lessons: [lesson(1, "De", "normal", { course: { nr: "1" } }), lesson(2, "Ku", "normal", { course: { nr: "2" } })] };
    const courses = [{ nr: "1", optional: false }, { nr: "2", optional: true }];
    expect(myLessons(day, courses, { picked: ["9"], hiddenRequired: [] }).map((l) => l.subject.code)).toEqual(["De"]);
    expect(myLessons({ status: "holiday", lessons: [] }, courses, { picked: [], hiddenRequired: [] })).toEqual([]);
  });
});

describe("nextClassExam", () => {
  const exams = [
    { id: 1, date: "2026-09-18", type: "Test", subject: { code: "Ma", name: "Mathe" } },
    { id: 2, date: "2026-09-17", type: "Test", subject: { code: "Ku", name: "Kunst" } },
  ];
  it("nearest exam of my subjects, weekday within a week", () => {
    expect(nextClassExam(exams, new Set(["Ma"]), "2026-09-16")).toEqual({ id: 1, text: "Fr · Mathe-Test" });
    expect(nextClassExam(exams, new Set(), "2026-09-16").id).toBe(2);
    expect(nextClassExam([], new Set(), "2026-09-17")).toBeNull();
  });
});

describe("startTarget", () => {
  it("pinned class wins, otherwise «Meine Klassen» from two classes", () => {
    expect(startTarget([{ id: 1 }])).toEqual({ classId: null, page: null });
    expect(startTarget([{ id: 1 }, { id: 2 }])).toEqual({ classId: null, page: "/klassen" });
    expect(startTarget([{ id: 1 }, { id: 2, startOpen: true }])).toEqual({ classId: 2, page: null });
  });
});

describe("add class helpers", () => {
  it("texts for errors", () => {
    expect(addClassErrorText({ code: "already_member" })).toBe("Diese Klasse hast du schon.");
    expect(addClassErrorText({ code: "too_many_classes", details: { maxClasses: 3 } })).toBe("Mehr als 3 Klassen gehen auf einem Gerät nicht.");
    expect(addClassErrorText({ code: "wrong_password" })).toBe("Diesen Code kennen wir nicht.");
  });
  it("detects teacher codes", () => {
    expect(isTeacherCode("ORB-L-AB12-CD")).toBe(true);
    expect(isTeacherCode("orb-a-1234")).toBe(false);
  });
});


describe("Nebeneinander", () => {
  it("строки по урокам, не меньше 7, время из Stundenzeiten или из урока", () => {
    const rows = sideBySideRows([[lesson(1, "De"), lesson(2, "Ma"), lesson(2, "En")], [lesson(1, "Ma"), lesson(8, "Ku")]], [{ period: 1, start: "07:30" }]);
    expect(rows).toHaveLength(8);
    expect(rows[0].start).toBe("07:30");
    expect(rows[1].start).toBe("08:00");
    expect(rows[1].cells.map((cell) => cell.length)).toEqual([2, 0]);
    expect(rows[6].cells).toEqual([[], []]);
    expect(sideBySideRows([[], []])).toHaveLength(7);
  });
  it("ближайший тест среди классов", () => {
    const a = { item: { id: 1 }, exams: [{ id: 1, date: "2026-09-18", type: "Test", subject: { code: "Ma", name: "Mathe" } }], subjects: new Set() };
    const b = { item: { id: 2 }, exams: [{ id: 9, date: "2026-09-17", type: "Test", subject: { code: "Ku", name: "Kunst" } }], subjects: new Set(["Ma"]) };
    expect(nextExamAcross([a, b], "2026-09-16")).toEqual({ item: { id: 1 }, text: "Fr · Mathe-Test", when: "in 2 Tagen" });
    expect(nextExamAcross([], "2026-09-16")).toBeNull();
    expect(inDaysText("2026-09-16", "2026-09-16")).toBe("heute");
    expect(inDaysText("2026-09-16", "2026-09-17")).toBe("morgen");
  });
});

describe("школы (часть 29d)", () => {
  const goethe = { id: 1, name: "Goethe" };
  const schiller = { id: 2, name: "Schiller" };
  const list = [
    { id: 1, name: "9b", school: goethe },
    { id: 3, name: "7c", school: schiller },
    { id: 2, name: "5a", school: goethe },
    { id: 4, name: "x", school: null },
  ];
  it("schoolGroups: школа там, где её первый класс; классы внутри по порядку", () => {
    const groups = schoolGroups(list);
    expect(groups.map((g) => g.key)).toEqual([1, 2, "none"]);
    expect(groups[0].items.map((c) => c.name)).toEqual(["9b", "5a"]);
    expect(groups[2].school).toBeNull();
  });
  it("classesOfSchool и otherSchool", () => {
    expect(classesOfSchool(list, "1").map((c) => c.id)).toEqual([1, 2]);
    expect(otherSchool({ school: schiller }, 1)).toBe(true);
    expect(otherSchool({ school: goethe }, "1")).toBe(false);
    expect(otherSchool({ school: schiller }, null)).toBe(false);
    expect(otherSchool({ school: null }, 1)).toBe(false);
  });
});

it("classPrefs: неполные данные класса → те же пустые массивы (стабильно для селектора)", () => {
  const state = { byClass: { 2: { coursesChosen: true } } };
  expect(classPrefs(state, 2, 1).picked).toBe(classPrefs(state, 2, 1).picked);
});
