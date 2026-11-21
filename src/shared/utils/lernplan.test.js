import { describe, expect, it } from "vitest";
import { buildPlanTasks, checkPlans, formTopics, planDoneToast, distribute, learnDays, maxDays, planSettings, planTasksOf, preview, shiftPlan, topicsFrom } from "./lernplan";

const TODAY = "2025-09-17"; // Mi
const EXAM = { id: 7, date: "2025-09-25", subject: { code: "Ph", name: "Physik" }, topic: "Federpendel", details: "Schwingungsdauer\nFederkonstante bestimmen\nProtokoll auswerten" };

describe("topicsFrom", () => {
  it("делит по строкам, запятым и ; и чистит пункты списков", () => {
    expect(topicsFrom("- Scheitelpunktform, Nullstellen;\n2. Textaufgaben.\n\n• nullstellen")).toEqual(["Scheitelpunktform", "Nullstellen", "Textaufgaben"]);
  });
  it("null и пустое → []", () => {
    expect(topicsFrom(null)).toEqual([]);
    expect(topicsFrom("  ")).toEqual([]);
  });
});

describe("дни", () => {
  it("без выходных до дня перед тестом", () => {
    expect(learnDays(TODAY, "2025-09-25")).toEqual(["2025-09-17", "2025-09-18", "2025-09-19", "2025-09-22", "2025-09-23", "2025-09-24"]);
    expect(maxDays(TODAY, "2025-09-25", false)).toBe(6);
    expect(maxDays(TODAY, "2025-09-25", true)).toBe(7);
    expect(maxDays(TODAY, TODAY, false)).toBe(0);
  });
  it("предпросмотр — последние 4 дня, последний «Alles wiederholen»", () => {
    const rows = preview({ today: TODAY, examDate: EXAM.date, weekend: false, n: 4, topics: topicsFrom(EXAM.details), subjectLabel: "Physik" });
    expect(rows.map((r) => [r.date, r.text])).toEqual([
      ["2025-09-19", "Schwingungsdauer"],
      ["2025-09-22", "Federkonstante bestimmen"],
      ["2025-09-23", "Protokoll auswerten"],
      ["2025-09-24", "Alles wiederholen"],
    ]);
  });
});

describe("distribute", () => {
  it("тем меньше дней — по кругу", () => {
    expect(distribute(["A", "B"], 5).map((d) => d.topics.join())).toEqual(["A", "B", "A", "B", "A,B"]);
  });
  it("тем больше — по несколько за день", () => {
    expect(distribute(["A", "B", "C", "D", "E"], 3).map((d) => d.topics.join())).toEqual(["A,B", "C,D,E", "A,B,C,D,E"]);
  });
  it("без тем — «Fach lernen»", () => {
    const rows = preview({ today: TODAY, examDate: EXAM.date, weekend: false, n: 2, topics: [], subjectLabel: "Physik" });
    expect(rows.map((r) => r.text)).toEqual(["Physik lernen", "Alles wiederholen"]);
  });
  it("один день — только повторение", () => {
    expect(distribute(["A"], 1)).toEqual([{ topics: ["A"], review: true }]);
  });
});

describe("задачи плана", () => {
  const base = { exam: EXAM, cls: 3, today: TODAY, weekend: false, n: 4, topics: ["A", "B", "C"], subjectLabel: "Physik" };
  it("строит задачи с планом и предметом", () => {
    const tasks = buildPlanTasks(base);
    expect(tasks).toHaveLength(4);
    expect(tasks[0]).toMatchObject({ text: "A", subject: "Ph", done: false, plan: { exam: "7", cls: 3, examDate: "2025-09-25", review: false } });
    expect(planSettings(tasks)).toEqual({ n: 4, weekend: false, topics: ["A", "B", "C"] });
  });
  it("при правке сделанный день с той же темой остаётся сделанным", () => {
    const old = buildPlanTasks(base).map((task, i) => ({ ...task, done: i === 0 }));
    const next = buildPlanTasks({ ...base, n: 3, old });
    expect(next.map((task) => [task.text, task.done])).toEqual([["A", true], ["B · C", false], ["Alles wiederholen", false]]);
  });
  it("planTasksOf пропускает удалённые", () => {
    const tasks = buildPlanTasks(base);
    tasks[1] = { ...tasks[1], deleted: true };
    expect(planTasksOf(tasks, 7)).toHaveLength(3);
  });
});

describe("перенос и удаление теста", () => {
  const tasks = buildPlanTasks({ exam: EXAM, cls: 3, today: TODAY, weekend: false, n: 4, topics: ["A", "B", "C"], subjectLabel: "Physik" }).map((task, i) => ({ ...task, done: i === 0 }));

  it("тест перенесли — несделанные дни переезжают, сделанный остаётся", () => {
    const { moved, gone } = checkPlans(tasks, [{ ...EXAM, date: "2025-09-30" }], 3, TODAY);
    expect(gone).toEqual([]);
    const shifted = shiftPlan(moved[0].tasks, "2025-09-30", TODAY);
    expect(shifted.map((task) => task.due)).toEqual(["2025-09-19", "2025-09-25", "2025-09-26", "2025-09-29"]);
    expect(shifted.every((task) => task.plan.examDate === "2025-09-30")).toBe(true);
  });
  it("тест на сегодня — двигать некуда", () => {
    expect(shiftPlan(tasks, TODAY, TODAY)).toEqual([]);
  });
  it("тест пропал — только для своего класса и не «Behalten»", () => {
    expect(checkPlans(tasks, [], 3, TODAY).gone).toHaveLength(1);
    expect(checkPlans(tasks, [], 4, TODAY).gone).toHaveLength(0);
    const kept = tasks.map((task) => ({ ...task, plan: { ...task.plan, kept: true } }));
    expect(checkPlans(kept, [], 3, TODAY).gone).toHaveLength(0);
  });
});

describe("planDoneToast", () => {
  const tasks = [{ id: "a", done: true }, { id: "b", done: false }, { id: "c", done: false }];
  it("считает, сколько осталось", () => {
    expect(planDoneToast(tasks, "b")).toBe("Erledigt · noch 1");
    expect(planDoneToast(tasks.slice(0, 2), "b")).toBe("Alles gelernt – viel Erfolg!");
  });
});

describe("formTopics", () => {
  it("новый план — все темы из описания включены", () => {
    expect(formTopics("A, B")).toEqual([{ text: "A", on: true, own: false }, { text: "B", on: true, own: false }]);
  });
  it("правка — выключенные темы описания и свои темы", () => {
    expect(formTopics("A, B", ["B", "X"])).toEqual([{ text: "A", on: false, own: false }, { text: "B", on: true, own: false }, { text: "X", on: true, own: true }]);
  });
});
