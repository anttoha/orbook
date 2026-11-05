import { describe, expect, it } from "vitest";
import { NO_OPTIONAL, courseCount, courseTitle, isCourseOn, isCourseVisible, splitCourses, toggleCourse, togglePicked, visibleSubjects } from "./courses";

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

describe("toggleCourse", () => {
  const all = ["1", "2", "3"];

  it("пустой выбор значит «видно всё»: выключаем один, остальные остаются", () => {
    expect(toggleCourse([], "2", all)).toEqual(["1", "3"]);
  });

  it("выключить последний: это не пустой список, иначе план покажет всё", () => {
    const none = toggleCourse(["2"], "2", all);
    expect(none).toEqual(NO_OPTIONAL);
    expect(isCourseOn(none, "2")).toBe(false);
  });

  it("из «ничего не выбрано» можно снова включить курс", () => {
    expect(toggleCourse(NO_OPTIONAL, "1", all)).toEqual(["1"]);
  });

  it("все включены: снова пустой список", () => {
    expect(toggleCourse(["1", "2"], "3", all)).toEqual([]);
  });
});

describe("courseCount", () => {
  const list = [course({ nr: "1" }), course({ nr: "2", optional: true }), course({ nr: "3", optional: true })];

  it("обязательные считаются всегда", () => {
    expect(courseCount(list, ["2"])).toEqual({ on: 2, all: 3 });
    expect(courseCount(list, NO_OPTIONAL)).toEqual({ on: 1, all: 3 });
  });

  it("пустой выбор: видны все, без данных не падает", () => {
    expect(courseCount(list, [])).toEqual({ on: 3, all: 3 });
    expect(courseCount(null, [])).toEqual({ on: 0, all: 0 });
  });
});

describe("visibleSubjects", () => {
  it("каждый предмет один раз, скрытые курсы не считаются", () => {
    const list = [
      course({ nr: "1" }),
      course({ nr: "2", subject: { code: "Ma", name: "Mathe" } }),
      course({ nr: "3", optional: true, subject: { code: "Ku", name: "Kunst" } }),
    ];
    expect(visibleSubjects(list, NO_OPTIONAL).map((s) => s.code)).toEqual(["Ma"]);
    expect(visibleSubjects(list, []).map((s) => s.code)).toEqual(["Ma", "Ku"]);
  });

  it("subject и name бывают null", () => {
    const list = [course({ nr: "1", subject: null }), course({ nr: "2", subject: { code: "Sw", name: null } }), course({ nr: "3", subject: { code: "Eg", name: null } })];
    expect(visibleSubjects(list, [], { Sw: "Schwimmen" })).toEqual([
      { code: "Sw", name: "Schwimmen" },
      { code: "Eg", name: "Eg" },
    ]);
    expect(visibleSubjects(null, [])).toEqual([]);
  });
});

describe("isCourseVisible — обов'язкові теж можна сховати", () => {
  const required = { nr: "131", optional: false };
  const optional = { nr: "141", optional: true };
  it("обов'язковий видно, поки його не сховали", () => {
    expect(isCourseVisible(required, [], [])).toBe(true);
    expect(isCourseVisible(required, [], ["131"])).toBe(false);
  });
  it("за вибором — як раніше", () => {
    expect(isCourseVisible(optional, [], ["131"])).toBe(true);
    expect(isCourseVisible(optional, ["keine"], [])).toBe(false);
  });
});
