import { describe, expect, it } from "vitest";
import { HIDDEN, notenWidget, widgetStand } from "./notenWidget";

const g = (date, grade, value, half = 1, extra = {}) => ({ date, grade, value, note: null, weight: 1, half, ...extra });
const DATA = {
  updatedAt: "2026-09-16",
  fetchedAt: "2026-09-17T05:41:00Z",
  subjects: [
    { code: "de", name: "Deutsch", grades: [g("2026-09-12", "2", 2, 1, { note: "Aufsatz" })] },
    { code: "ma", name: "Mathematik", grades: [g("2026-09-16", "3+", 2.7, 1, { note: "Klassenarbeit 1", weight: 2 }), g("2026-09-10", "2", 2)] },
    { code: "ku", name: "Kunst", grades: [g("2026-09-08", "m.E.", null)] },
  ],
  absences: { days: [{ date: "2026-09-15", reason: null, excused: true, half: 1 }], hours: [{ date: "2026-09-02", hours: 1, amount: "1 Stunde", excused: false, half: 1 }] },
};

describe("notenWidget", () => {
  it("Schnitt полугодия и предметы; новые — первыми с «neu»", () => {
    const w = notenWidget(DATA, ["ma|2026-09-16|3+|Klassenarbeit 1"]);
    expect(w.half).toBe(1);
    expect(w.subjects.map((s) => [s.code, s.fresh])).toEqual([["ma", true], ["de", false], ["ku", false]]);
    expect(w.subjects[0].average).toBeCloseTo((2.7 * 2 + 2) / 3);
    expect(w.subjects[2].average).toBeNull(); // «m.E.» не считается
    expect(w.average).toBeCloseTo(((2.7 * 2 + 2) / 3 + 2) / 2);
  });

  it("последние оценки: новые сверху, без пустых, Art из замечания", () => {
    const w = notenWidget(DATA, ["ma|2026-09-16|3+|Klassenarbeit 1"]);
    expect(w.latest.map((x) => x.grade)).toEqual(["3+", "2", "2", "m.E."]);
    expect(w.latest[0]).toMatchObject({ subject: "Mathematik", what: "Klassenarbeit 1", fresh: true });
    expect(w.latest[1].what).toBe("Aufsatz");
    expect(w.latest[2].what).toBeNull();
  });

  it("Fehlzeiten полугодия", () => {
    expect(notenWidget(DATA).absences).toEqual({ days: 1, hours: 1, unexcused: 1 });
    expect(notenWidget(DATA).entries).toHaveLength(2);
  });

  it("есть оценки 2. полугодия — показываем второе", () => {
    const data = { subjects: [{ code: "ma", name: "Mathematik", grades: [g("2026-09-10", "2", 2), g("2027-02-10", "1", 1, 2)] }] };
    expect(notenWidget(data).half).toBe(2);
    expect(notenWidget(data).latest.map((x) => x.grade)).toEqual(["1"]);
  });

  it("нет данных или пустые поля — без ошибок", () => {
    const w = notenWidget(null);
    expect(w).toMatchObject({ average: null, subjects: [], latest: [], absences: { days: 0, hours: 0, unexcused: 0 }, stand: null });
    expect(notenWidget({ subjects: [{ code: "ma", name: "Mathematik", grades: null }], absences: null }).subjects).toEqual([]);
  });

  it("Stand: дата школы, иначе дата загрузки", () => {
    expect(widgetStand(DATA)).toBe("2026-09-16");
    expect(widgetStand({ updatedAt: null, fetchedAt: "2026-09-17T05:41:00Z" })).toBe("2026-09-17");
    expect(HIDDEN).toBe("•••");
  });
});
