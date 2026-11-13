import { describe, expect, it } from "vitest";
import { addClassErrorText, adminClassItems, classPrefs, classTitle, daySummary, isTeacherCode, mergeClasses, myLessons, nextClassColor, nextClassExam, startTarget, swapClassData, todayCells } from "./classes";

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

describe("adminClassItems", () => {
  it("lists plan classes, marks new ones, sorts naturally", () => {
    const schools = [{ id: 1, name: "Goethe", classes: [{ id: 1, name: "8a" }] }];
    const plan = { 1: { classes: [{ name: "10a", id: null }, { name: "8b", id: null }, { name: "8a", id: 1 }] } };
    const items = adminClassItems(schools, plan);
    expect(items.map((i) => i.value)).toEqual(["1:8a", "1:8b", "1:10a"]);
    expect(items[1]).toMatchObject({ isNew: true, subtitle: "neu", schoolId: 1, className: "8b" });
    expect(items[0].subtitle).toBeNull();
  });
  it("without a plan list shows the existing classes", () => {
    expect(adminClassItems([{ id: 1, name: "G", classes: [{ id: 2, name: "8b" }] }], {}).map((i) => i.code)).toEqual(["8b"]);
    expect(adminClassItems(null)).toEqual([]);
  });
});
