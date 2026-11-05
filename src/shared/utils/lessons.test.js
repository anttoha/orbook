// Тест на null в уроке: сервер может прислать урок без Kurs и без Klausur.
import { describe, expect, it } from "vitest";
import { fachClasses, findLesson, isWeekEmpty, lessonExam, lessonKey, weekStandSource } from "./lessons";

const lesson = { period: 4, status: "normal", subject: { code: "En", name: "Englisch" }, course: null, examId: null };

describe("урок с null-полями", () => {
  it("lessonKey не падает, когда course = null", () => {
    expect(lessonKey(lesson)).toBe("4-En-");
  });

  it("lessonExam даёт null, когда examId = null или дня ещё нет", () => {
    expect(lessonExam({ exams: [{ id: 7 }] }, lesson)).toBeNull();
    expect(lessonExam(null, { ...lesson, examId: 7 })).toBeNull();
  });

  it("findLesson находит урок по номеру и коду, а если нет — null", () => {
    expect(findLesson([lesson], "4", "En")).toBe(lesson);
    expect(findLesson([lesson], "5", "En")).toBeNull();
  });
});

describe("weekStandSource", () => {
  const mon = { date: "2026-10-05", publishedAt: "2026-10-05T07:12:00+02:00", fetchedAt: "2026-10-05T09:00:00+02:00", stale: false };
  const tue = { date: "2026-10-06", publishedAt: "2026-10-06T11:26:00+02:00", fetchedAt: "2026-10-05T09:30:00+02:00", stale: false };

  it("берёт план сегодняшнего дня и самую свежую проверку", () => {
    expect(weekStandSource([mon, tue], "2026-10-06")).toEqual({ publishedAt: tue.publishedAt, fetchedAt: tue.fetchedAt, stale: false });
  });

  it("сегодня плана нет: первый день, где он есть", () => {
    expect(weekStandSource([{ ...mon, publishedAt: null }, tue], "2026-10-05").publishedAt).toBe(tue.publishedAt);
  });

  it("publishedAt = null у всех дней: только проверка", () => {
    expect(weekStandSource([{ ...mon, publishedAt: null }], "2026-10-05")).toEqual({ publishedAt: null, fetchedAt: mon.fetchedAt, stale: false });
  });

  it("нечего показать", () => {
    expect(weekStandSource([{ date: "2026-10-05", publishedAt: null, fetchedAt: null }], "2026-10-05")).toBeNull();
    expect(weekStandSource(null, "2026-10-05")).toBeNull();
  });

  it("замечает устаревший план", () => {
    expect(weekStandSource([mon, { ...tue, stale: true }], "2026-10-05").stale).toBe(true);
  });
});

describe("isWeekEmpty", () => {
  it("пусто только когда уроков нет во всех днях", () => {
    expect(isWeekEmpty([{ lessons: [] }, { lessons: null }])).toBe(true);
    expect(isWeekEmpty([{ lessons: [] }, { lessons: [lesson] }])).toBe(false);
  });

  it("пока данных нет, подсказку не показываем", () => {
    expect(isWeekEmpty(null)).toBe(false);
    expect(isWeekEmpty([])).toBe(false);
  });
});

describe("урок без предмета (subject: null, так бывает в настоящем плане)", () => {
  const noSubject = { period: 2, status: "substitution", subject: null, course: null, teacher: "T26", room: "305", examId: null };
  const normal = { period: 2, status: "normal", subject: { code: "Ma", name: "Mathe" }, course: { nr: "1", label: "Ma" }, examId: null };

  it("lessonKey не падает", () => {
    expect(lessonKey(noSubject)).toBe("2--");
  });

  it("fachClasses даёт нейтральный цвет", () => {
    expect(fachClasses(undefined, {})).toContain("bg-sport-tint");
  });

  it("findLesson находит его без кода, даже если рядом есть обычный урок", () => {
    expect(findLesson([normal, noSubject], "2", undefined)).toBe(noSubject);
  });

  it("findLesson по коду находит обычный урок и не падает на subject: null", () => {
    expect(findLesson([noSubject, normal], "2", "Ma")).toBe(normal);
  });

  it("без кода и без такого урока берёт первый в этом часу", () => {
    expect(findLesson([normal], "2", undefined)).toBe(normal);
  });
});
