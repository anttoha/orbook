import { describe, expect, it } from "vitest";
import { changeText, planChanges } from "./planDiff";

const lesson = (over) => ({ period: 1, status: "normal", subject: { code: "Ma", name: "Mathe" }, teacher: "T03", room: "102", ...over });
const week = (lessons, date = "2026-11-03") => ({ days: [{ date, weekday: "Di", status: "ok", lessons }] });

describe("planChanges", () => {
  it("первая загрузка: сравнивать не с чем", () => {
    expect(planChanges(null, week([lesson({ status: "cancelled" })]), "2026-11-02")).toEqual([]);
  });

  it("находит только новые особые уроки", () => {
    const sub = lesson({ period: 2, status: "substitution" });
    const changes = planChanges(week([sub]), week([sub, lesson({ period: 3, status: "cancelled" }), lesson({ period: 4 })]), "2026-11-02");
    expect(changes.map((c) => c.lesson.period)).toEqual([3]);
  });

  it("прошедшие дни и дни без плана не считаются", () => {
    const next = lesson({ status: "cancelled" });
    expect(planChanges(week([]), week([next], "2026-11-01"), "2026-11-02")).toEqual([]);
    const empty = { days: [{ date: "2026-11-03", weekday: "Di", status: "not_published", lessons: [next] }] };
    expect(planChanges(week([]), empty, "2026-11-02")).toEqual([]);
  });

  it("урок без предмета не ломает сравнение", () => {
    const changes = planChanges(week([]), week([lesson({ status: "added", subject: null })]), "2026-11-02");
    expect(changes).toHaveLength(1);
  });

  it("по порядку: сначала день, потом номер урока", () => {
    const next = { days: [
      { date: "2026-11-04", weekday: "Mi", status: "ok", lessons: [lesson({ period: 1, status: "cancelled" })] },
      { date: "2026-11-03", weekday: "Di", status: "ok", lessons: [lesson({ period: 10, status: "cancelled" }), lesson({ period: 2, status: "cancelled" })] },
    ] };
    expect(planChanges({ days: [] }, next, "2026-11-02").map((c) => `${c.date}#${c.lesson.period}`)).toEqual(["2026-11-03#2", "2026-11-03#10", "2026-11-04#1"]);
  });
});

describe("changeText", () => {
  const change = (date, over) => ({ date, weekday: "Do", lesson: lesson({ period: 4, ...over }) });

  it("сегодня, завтра, другой день", () => {
    expect(changeText(change("2026-11-02", { status: "cancelled" }), "2026-11-02")).toBe("Heute: 4. Std Mathe fällt aus");
    expect(changeText(change("2026-11-03", { status: "substitution" }), "2026-11-02")).toBe("Morgen: 4. Std Mathe → Vertretung");
    expect(changeText(change("2026-11-05", { status: "room_change", room: "204" }), "2026-11-02")).toBe("Do: 4. Std Mathe → Raum 204");
  });

  it("null в предмете и кабинете", () => {
    expect(changeText(change("2026-11-03", { status: "added", subject: null }), "2026-11-02")).toBe("Morgen: 4. Std Ohne Fach → Vertretung");
    expect(changeText(change("2026-11-03", { status: "room_change", room: null }), "2026-11-02")).toBe("Morgen: 4. Std Mathe → Raum ?");
  });
});
