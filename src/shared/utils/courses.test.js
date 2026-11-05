import { describe, expect, it } from "vitest";
import { courseTitle, splitCourses, togglePicked } from "./courses";

const course = (over) => ({ nr: "1", subject: { code: "Ma", name: "Mathe" }, teacher: "T03", group: null, label: "Ma", optional: false, ...over });

describe("splitCourses", () => {
  it("делит на обязательные и выборные", () => {
    const { required, optional } = splitCourses([course({ nr: "1" }), course({ nr: "2", optional: true })]);
    expect(required.map((c) => c.nr)).toEqual(["1"]);
    expect(optional.map((c) => c.nr)).toEqual(["2"]);
  });

  it("не падает без данных", () => {
    expect(splitCourses(null)).toEqual({ required: [], optional: [] });
  });
});

describe("courseTitle", () => {
  it("обычный курс: только название", () => {
    expect(courseTitle(course())).toBe("Mathe");
  });

  it("группа различает курсы одного предмета", () => {
    expect(courseTitle(course({ subject: { code: "Sp", name: "Sport" }, group: "SpJu", label: "SpJu" }))).toBe("Sport · SpJu");
  });

  it("group = null, но label другой", () => {
    expect(courseTitle(course({ subject: { code: "Sp", name: "Sport" }, label: "SpMä" }))).toBe("Sport · SpMä");
  });

  it("subject.name = null: показываем код и не повторяем его", () => {
    expect(courseTitle(course({ subject: { code: "Sw", name: null }, label: "Sw" }))).toBe("Sw");
  });
});

describe("togglePicked", () => {
  it("добавляет и убирает номер", () => {
    expect(togglePicked(["1"], "2")).toEqual(["1", "2"]);
    expect(togglePicked(["1", "2"], "1")).toEqual(["2"]);
  });
});
