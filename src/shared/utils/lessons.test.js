// Тест на null в уроке: сервер может прислать урок без Kurs и без Klausur.
import { describe, expect, it } from "vitest";
import { findLesson, lessonExam, lessonKey } from "./lessons";

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
