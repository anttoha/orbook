import { describe, expect, it } from "vitest";
import {
  breakAfter, clockText, countedMinutes, durationShort, durationText, endsAt, isOver, lernzeit, nextRound, pauseRun, progressOf,
  rangeOf, remainingMs, resumeRun, sessionOf, sessionsOn, startRun, stepValue, timesOf, trimSessions, weekDays,
} from "./lerntimer";

const MIN = 60000;
const T0 = new Date(2026, 8, 17, 16, 5).getTime(); // Mi 17.09., 16:05 по часам устройства
const S = (code, day, min, at = "10:00") => ({ id: `l-${code}-${day}-${at}`, code, day, at, min, updatedAt: "2026-09-17T10:00:00Z" });

describe("Lerntimer · Zeit", () => {
  it("считает от старта, пауза не съедает время", () => {
    let run = startRun("focus", { code: "Ma", minutes: 25 }, T0);
    expect(remainingMs(run, T0 + 10 * MIN)).toBe(15 * MIN);
    run = pauseRun(run, T0 + 10 * MIN);
    expect(remainingMs(run, T0 + 20 * MIN)).toBe(15 * MIN); // на паузе стоит
    run = resumeRun(run, T0 + 20 * MIN);
    expect(remainingMs(run, T0 + 25 * MIN)).toBe(10 * MIN);
    expect(endsAt(run, T0 + 25 * MIN)).toBe(T0 + 35 * MIN);
    expect(isOver(run, T0 + 35 * MIN)).toBe(true);
    expect(progressOf(run, T0 + 25 * MIN)).toBeCloseTo(0.4);
  });

  it("засчитывает только целые минуты и не больше длины фазы", () => {
    const run = startRun("focus", { code: "Ma", minutes: 25 }, T0);
    expect(countedMinutes(run, T0 + 7.9 * MIN)).toBe(7);
    expect(countedMinutes(run, T0 + 90 * MIN)).toBe(25);
    expect(sessionOf(run, T0 + 30 * 1000)).toBeNull(); // меньше минуты — не считаем
    expect(sessionOf(run, T0 + 25 * MIN)).toMatchObject({ code: "Ma", day: "2026-09-17", at: "16:05", min: 25 });
  });

  it("после последнего раунда — длинная пауза и снова раунд 1", () => {
    const times = timesOf({ preset: "25" });
    expect(breakAfter(2, times)).toEqual({ minutes: 5, long: false });
    expect(breakAfter(4, times)).toEqual({ minutes: 15, long: true });
    expect(nextRound(4, times)).toBe(1);
    expect(nextRound(2, times)).toBe(3);
  });

  it("свои минуты и границы шагов", () => {
    expect(timesOf({ preset: "eigene", focus: 40, pause: 8, long: 20, rounds: 3 })).toEqual({ focus: 40, pause: 8, long: 20, rounds: 3 });
    expect(timesOf({ preset: "eigene" })).toEqual({ focus: 25, pause: 5, long: 15, rounds: 4 });
    expect(timesOf(null).focus).toBe(25);
    expect(stepValue("focus", 90, 1)).toBe(90);
    expect(stepValue("pause", 1, -1)).toBe(1);
    expect(stepValue("focus", 25, 1)).toBe(30);
  });

  it("тексты времени", () => {
    expect(clockText(17 * MIN + 42000)).toBe("17:42");
    expect(clockText(500)).toBe("0:01");
    expect(clockText(65 * MIN)).toBe("1:05:00");
    expect(durationText(75)).toBe("1 h 15 min");
    expect(durationText(45)).toBe("45 min");
    expect(durationText(120)).toBe("2 h");
    expect(durationShort(200)).toBe("3 h 20");
    expect(durationShort(30)).toBe("30 min");
  });
});

describe("Lerntimer · Statistik", () => {
  const sessions = [
    S("Ma", "2026-09-17", 25, "16:05"), S("En", "2026-09-17", 25, "14:50"), S("Ma", "2026-09-15", 50),
    S(null, "2026-09-10", 30), S("Ma", "2026-08-30", 20), { ...S("Ph", "2026-09-16", 25), deleted: true },
  ];

  it("периоды: неделя, месяц, полугодие", () => {
    expect(rangeOf("week", "2026-09-17")).toEqual({ from: "2026-09-14", to: "2026-09-20", prevFrom: "2026-09-07", prevTo: "2026-09-13" });
    expect(rangeOf("month", "2026-09-17")).toEqual({ from: "2026-09-01", to: "2026-09-30", prevFrom: "2026-08-01", prevTo: "2026-08-31" });
    expect(rangeOf("month", "2026-01-05").prevFrom).toBe("2025-12-01");
    expect(rangeOf("halfyear", "2026-09-17")).toMatchObject({ from: "2026-08-01", to: "2027-01-31" });
    expect(rangeOf("halfyear", "2027-01-10")).toMatchObject({ from: "2026-08-01", to: "2027-01-31" });
    expect(rangeOf("halfyear", "2027-03-10")).toMatchObject({ from: "2027-02-01", to: "2027-07-31", prevFrom: "2026-08-01" });
  });

  it("Lernzeit за неделю: минуты, раунды, разница, по предметам (без удалённых, без предмета — null)", () => {
    const week = lernzeit(sessions, "week", "2026-09-17");
    expect(week).toMatchObject({ minutes: 100, rounds: 3, diff: 70 });
    expect(week.bySubject).toEqual([{ code: "Ma", min: 75 }, { code: "En", min: 25 }]);
    expect(lernzeit(sessions, "month", "2026-09-17").bySubject).toContainEqual({ code: null, min: 30 });
    expect(lernzeit([], "week", "2026-09-17")).toMatchObject({ minutes: 0, rounds: 0, diff: 0, bySubject: [] });
  });

  it("сегодня — новые сверху; неделя по дням", () => {
    expect(sessionsOn(sessions, "2026-09-17").map((s) => s.at)).toEqual(["16:05", "14:50"]);
    expect(weekDays(sessions, "2026-09-17").map((d) => d.min)).toEqual([0, 50, 0, 50, 0, 0, 0]);
  });

  it("Sync: старое выкидываем, не влезает — сначала самые старые", () => {
    expect(trimSessions(sessions, "2027-10-15").map((s) => s.day)).toEqual(["2026-09-10", "2026-09-15", "2026-09-16", "2026-09-17", "2026-09-17"]);
    const two = trimSessions(sessions, "2026-09-17", (list) => list.length <= 2);
    expect(two.every((s) => s.day === "2026-09-17")).toBe(true);
  });
});
