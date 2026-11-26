import { describe, expect, it } from "vitest";
import { DEFAULT_FUER_DICH } from "./fuerDich";
import { keyLessons, nowFocus, packList } from "./nowFocus";

// Среда 2026-09-16 (СЕТ: +02:00), завтра четверг
const TODAY = "2026-09-16";
const at = (time, date = TODAY) => new Date(`${date}T${time}:00+02:00`);
const lesson = (period, start, end, code, extra = {}) => ({ period, start, end, status: "normal", subject: { code, name: code }, room: "102", teacher: "Web", ...extra });
const DAY = {
  date: TODAY,
  status: "ok",
  lessons: [
    lesson(1, "07:30", "08:15", "De"),
    lesson(2, "08:20", "09:05", "Ma", { status: "substitution", teacher: "Kle" }),
    lesson(3, "09:25", "10:10", "En", { status: "cancelled" }),
    lesson(4, "10:30", "11:15", "Ph"),
    lesson(5, "11:35", "12:20", "Ge", { status: "room_change", room: "108", changes: { room: { old: "110", new: "108" } } }),
    lesson(6, "12:25", "13:10", "Sp"),
  ],
};
const TOMORROW = { date: "2026-09-17", status: "ok", lessons: [lesson(1, "07:30", "08:15", "De"), lesson(4, "10:30", "11:15", "Ge", { status: "substitution" })] };
const WEATHER = {
  days: [
    { date: TODAY, code: 2, tMax: 17, tMin: 8, rainMax: 60, rainFrom: 13, uvMax: 3, hours: [{ hour: 7, temp: 9, code: 2, rain: 10 }] },
    { date: "2026-09-17", code: 3, tMax: 15, tMin: 8, rainMax: 10, rainFrom: null, uvMax: 2, hours: [] },
  ],
};
const base = (over = {}) => ({
  today: TODAY,
  days: { [TODAY]: DAY, "2026-09-17": TOMORROW },
  weather: WEATHER,
  homework: [{ key: "hw-1", due: "2026-09-17", text: "S. 54", subject: "Ma" }, { key: "hw-2", due: "2026-09-25", text: "Referat", subject: "De" }],
  exams: [{ id: 7, date: "2026-09-17", subject: { code: "Bio", name: "Bio" } }],
  appointments: [],
  holidays: [],
  settings: DEFAULT_FUER_DICH,
  ...over,
});

describe("nowFocus — отрезки дня", () => {
  it("утром до первого урока — morgen: выход, погода к выходу, что взять", () => {
    const f = nowFocus(base({ now: at("06:40") }));
    expect(f.kind).toBe("morgen");
    expect(f.leave).toBe("06:45");
    expect(f.leaveIn).toBe(5);
    expect(f.leaveHour.temp).toBe(9);
    expect(f.pack.map((p) => p.label)).toEqual(["Regenjacke", "Jacke", "Sportsachen"]);
    expect(f.lessons.map((l) => l.period)).toEqual([1, 2, 3]);
  });

  it("время выхода прошло — leaveIn ≤ 0 («los!»)", () => {
    expect(nowFocus(base({ now: at("07:00") })).leaveIn).toBeLessThanOrEqual(0);
  });

  it("идёт урок — stunde: сколько осталось, два следующих, дождь позже", () => {
    const f = nowFocus(base({ now: at("10:48") }));
    expect(f.kind).toBe("stunde");
    expect(f.lesson.period).toBe(4);
    expect(f.minutesLeft).toBe(27);
    expect(f.after.map((l) => l.period)).toEqual([5, 6]);
    expect(f.rain.rainFrom).toBe(13);
  });

  it("перемена — pause: следующий урок, старый кабинет, «Danach»", () => {
    const f = nowFocus(base({ now: at("11:20") }));
    expect(f.kind).toBe("pause");
    expect(f.lesson.period).toBe(5);
    expect(f.inMinutes).toBe(15);
    expect(f.oldRoom).toBe("110");
    expect(f.after.map((l) => l.period)).toEqual([6]);
  });

  it("после уроков до вечера — nachmittag про завтра: задания, тесты, уроки", () => {
    const f = nowFocus(base({ now: at("14:30") }));
    expect(f.kind).toBe("nachmittag");
    expect(f.date).toBe("2026-09-17");
    expect(f.homework.map((h) => h.key)).toEqual(["hw-1"]);
    expect(f.exams.map((e) => e.id)).toEqual([7]);
    expect(f.lessons.map((l) => l.period)).toEqual([1, 4]);
    expect(f.weatherDay.tMax).toBe(15);
  });

  it("вечером — abend (Abends ab 17:00)", () => {
    expect(nowFocus(base({ now: at("19:30") })).kind).toBe("abend");
    const later = { ...DEFAULT_FUER_DICH, eveningFrom: "20:00" };
    expect(nowFocus(base({ now: at("19:30"), settings: later })).kind).toBe("nachmittag");
  });

  it("пятница после уроков — сразу «Nächster Schultag» (понедельник)", () => {
    const fri = "2026-09-18";
    const f = nowFocus(base({ now: at("14:30", fri), today: fri, days: { [fri]: { ...DAY, date: fri } } }));
    expect(f.kind).toBe("abend");
    expect(f.date).toBe("2026-09-21");
    expect(f.loaded).toBe(false);
    expect(f.lessons).toEqual([]);
  });

  it("выходной — abend про следующий учебный день", () => {
    const sat = "2026-09-19";
    const f = nowFocus(base({ now: at("10:00", sat), today: sat, days: { [sat]: { date: sat, status: "holiday", lessons: [] } } }));
    expect(f.kind).toBe("abend");
    expect(f.date).toBe("2026-09-21");
  });

  it("каникулы — ferien: сколько дней свободно и когда снова школа", () => {
    const item = { id: 1, kind: "free", title: "Herbstferien", dateFrom: "2026-10-05", dateTo: "2026-10-17" };
    const f = nowFocus(base({ now: at("10:00", "2026-10-12"), today: "2026-10-12", appointments: [item], exams: [{ id: 9, date: "2026-10-23", subject: { code: "Ma" } }] }));
    expect(f.kind).toBe("ferien");
    expect(f.backOn).toBe("2026-10-19");
    expect(f.daysFree).toBe(7);
    expect(f.progress).toBe(0.5);
    expect(f.exams.map((e) => e.id)).toEqual([9]);
  });

  it("план дня ещё не загружен — loading; не вышел — утро без уроков", () => {
    expect(nowFocus(base({ now: at("07:00"), days: {} })).kind).toBe("loading");
    const f = nowFocus(base({ now: at("07:00"), days: { [TODAY]: { date: TODAY, status: "not_published", lessons: [] } } }));
    expect(f.kind).toBe("morgen");
    expect(f.lessons).toEqual([]);
    expect(f.leave).toBeNull();
  });

  it("выключенное в «Zeigen» не попадает в ответ", () => {
    const settings = { ...DEFAULT_FUER_DICH, show: { ...DEFAULT_FUER_DICH.show, hausaufgaben: false, tests: false, wetter: false } };
    const f = nowFocus(base({ now: at("14:30"), settings }));
    expect(f.homework).toEqual([]);
    expect(f.exams).toEqual([]);
    expect(f.weatherDay).toBeNull();
  });

  it("без погоды — всё равно работает (все поля могут быть null)", () => {
    const f = nowFocus(base({ now: at("06:40"), weather: null }));
    expect(f.weatherDay).toBeNull();
    expect(f.pack.map((p) => p.label)).toEqual(["Sportsachen"]);
  });
});

describe("packList и keyLessons", () => {
  it("тест в этот день и вещи без повторов; «Am Testtag erinnern» выкл — без теста", () => {
    const settings = { ...DEFAULT_FUER_DICH, items: { Sp: ["Sportsachen"], Ph: ["sportsachen", "Kittel"] } };
    const lessons = [lesson(1, "07:30", "08:15", "Sp"), lesson(2, "08:20", "09:05", "Ph")];
    const exams = [{ id: 1, subject: { code: "Ph", name: "Physik" } }];
    expect(packList({ lessons, exams, settings }).map((p) => p.label)).toEqual(["Test: Physik", "Sportsachen", "Kittel"]);
    expect(packList({ lessons, exams, settings: { ...settings, testReminder: false } }).map((p) => p.kind)).toEqual(["fach", "fach"]);
  });

  it("у выпавшего урока вещи не берём", () => {
    const lessons = [lesson(6, "12:25", "13:10", "Sp", { status: "cancelled" })];
    expect(packList({ lessons, settings: DEFAULT_FUER_DICH })).toEqual([]);
  });

  it("keyLessons: первый + изменённые, по времени", () => {
    expect(keyLessons(DAY.lessons, 3).map((l) => l.period)).toEqual([1, 2, 3]);
    expect(keyLessons(DAY.lessons, 4).map((l) => l.period)).toEqual([1, 2, 3, 5]);
    expect(keyLessons(DAY.lessons, 2, false).map((l) => l.period)).toEqual([1, 2]);
  });
});
