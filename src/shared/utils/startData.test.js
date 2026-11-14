import { describe, expect, it } from "vitest";
import { changesSoon, holidayCountdown, latestMaterials, latestNotes, nextCancelled, schoolDaysUntil } from "./startData";

const lesson = (period, start, status = "normal") => ({ period, start, end: "23:59", status, subject: { code: "Ma", name: "Mathe" } });

describe("startData", () => {
  it("ближайший выпавший урок после этой минуты", () => {
    const lessons = [lesson(1, "07:30", "cancelled"), lesson(3, "09:25", "cancelled"), lesson(4, "10:30")];
    expect(nextCancelled(lessons, 8 * 60).period).toBe(3);
    expect(nextCancelled(lessons, 10 * 60)).toBeNull();
  });

  it("изменения сегодня и в следующий учебный день", () => {
    const days = [
      { date: "2026-09-18", status: "ok", lessons: [lesson(1, "07:30", "substitution")] },
      { date: "2026-09-17", status: "ok", lessons: [lesson(2, "08:20"), lesson(3, "09:25", "cancelled")] },
      { date: "2026-09-21", status: "ok", lessons: [lesson(1, "07:30", "cancelled")] },
      { date: "2026-09-19", status: "free", lessons: [] },
    ];
    expect(changesSoon(days, "2026-09-17", "2026-09-18").map((c) => `${c.date}/${c.lesson.period}`)).toEqual(["2026-09-17/3", "2026-09-18/1"]);
  });

  it("учебные дни без выходных и свободных дней", () => {
    // Mi 17.09 → до Mo 29.09: Do, Fr, Mo–Fr = 7, минус свободный Fr 26.09
    expect(schoolDaysUntil("2026-09-17", "2026-09-29", ["2026-09-26"])).toBe(7);
    expect(schoolDaysUntil("2026-09-17", "2026-09-29", ["2026-09-25"])).toBe(6);
    expect(schoolDaysUntil("2026-09-17", "2026-09-18")).toBe(0);
  });

  it("Countdown до ближайших каникул", () => {
    const herbst = { id: 1, kind: "free", dateFrom: "2026-10-05", dateTo: "2026-10-16" };
    const sommer = { id: 2, kind: "free", dateFrom: "2026-07-01", dateTo: "2026-08-14" };
    const abend = { id: 3, kind: "event", dateFrom: "2026-09-23", dateTo: null };
    expect(holidayCountdown([abend], "2026-09-17")).toBeNull();
    const c = holidayCountdown([herbst, abend], "2026-09-17");
    expect(c).toMatchObject({ item: herbst, days: 11, progress: null });
    const withPast = holidayCountdown([herbst, sommer], "2026-09-17");
    expect(withPast.progress).toBeGreaterThan(0.6);
    expect(holidayCountdown([herbst], "2026-10-07")).toEqual({ item: herbst, running: true });
  });

  it("последние заметки и материалы", () => {
    const notes = [
      { id: "a", text: "alt", updatedAt: "2026-09-01T10:00:00Z" },
      { id: "b", text: "neu", updatedAt: "2026-09-10T10:00:00Z" },
      { id: "c", text: "", deleted: true, updatedAt: "2026-09-12T10:00:00Z" },
    ];
    expect(latestNotes(notes, 1).map((n) => n.id)).toEqual(["b"]);
    const mats = [{ id: 1, createdAt: null }, { id: 2, createdAt: "2026-09-10T08:00:00Z" }, { id: 3, createdAt: "2026-09-11T08:00:00Z" }];
    expect(latestMaterials(mats, 2).map((m) => m.id)).toEqual([3, 2]);
  });
});
