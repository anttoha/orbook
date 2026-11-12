import { describe, expect, it } from "vitest";
import {
  NO_OPTIONAL,
  courseCount,
  courseTitle,
  groupName,
  isCourseOn,
  isCourseVisible,
  mergeCourses,
  splitCourses,
  startChoice,
  switchCourses,
  visibleSubjects,
  withNumbers,
} from "./courses";

const course = (over) => ({
  nr: "1",
  subject: { code: "Ma", name: "Mathe" },
  teacher: "T03",
  group: null,
  label: "Ma",
  optional: false,
  ...over,
});

describe("splitCourses", () => {
  it("делит на обязательные и выборные", () => {
    const { required, optional } = splitCourses([
      course({ nr: "1" }),
      course({ nr: "2", optional: true }),
    ]);
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

  it("группа различает курсы одного предмета (Sport — словами, 20b)", () => {
    expect(
      courseTitle(
        course({
          subject: { code: "Sp", name: "Sport" },
          group: "SpJu",
          label: "SpJu",
        }),
      ),
    ).toBe("Sport · Jungen");
  });

  it("group = null, но label другой", () => {
    expect(
      courseTitle(
        course({ subject: { code: "Sp", name: "Sport" }, label: "SpMä" }),
      ),
    ).toBe("Sport · Mädchen");
  });

  it("subject.name = null: показываем код и не повторяем его", () => {
    expect(
      courseTitle(course({ subject: { code: "Sw", name: null }, label: "Sw" })),
    ).toBe("Sw");
  });
});

describe("withNumbers", () => {
  it("добавляет и убирает номера без повторов", () => {
    expect(withNumbers(["1"], ["2", "1"], true)).toEqual(["1", "2"]);
    expect(withNumbers(["1", "2", "3"], ["1", "3"], false)).toEqual(["2"]);
  });
});

describe("mergeCourses", () => {
  it("тот же курс под разными номерами — одна строка", () => {
    const fr = (nr, extra = {}) => ({
      nr,
      label: "Fr",
      subject: { code: "Fr", name: "Französisch" },
      ...extra,
    });
    const merged = mergeCourses([
      fr("160"),
      { nr: "131", label: "Ma", subject: { code: "Ma" } },
      fr("167", { parallel: true }),
      { nr: "170", label: "KuAG", subject: { code: "Ku" } },
      { nr: "171", label: "Ku", subject: { code: "Ku" } },
    ]);
    expect(merged.map((c) => [c.label, c.nrs])).toEqual([
      ["Fr", ["160", "167"]],
      ["Ma", ["131"]],
      ["KuAG", ["170"]],
      ["Ku", ["171"]],
    ]);
  });
  it("subject = null и label = null не ломают", () =>
    expect(
      mergeCourses([{ nr: "1", label: null, subject: null }])[0].nrs,
    ).toEqual(["1"]));
});

describe("switchCourses", () => {
  const all = ["1", "2", "3"];

  it("пустой выбор значит «видно всё»: выключаем один, остальные остаются", () => {
    expect(switchCourses([], ["2"], false, all)).toEqual(["1", "3"]);
  });

  it("выключить последний: это не пустой список, иначе план покажет всё", () => {
    const none = switchCourses(["2"], ["2"], false, all);
    expect(none).toEqual(NO_OPTIONAL);
    expect(isCourseOn(none, "2")).toBe(false);
  });

  it("из «ничего не выбрано» можно снова включить курс", () => {
    expect(switchCourses(NO_OPTIONAL, ["1"], true, all)).toEqual(["1"]);
  });

  it("несколько номеров одного курса — вместе", () => {
    expect(switchCourses([], ["1", "3"], false, all)).toEqual(["2"]);
  });

  it("все включены: снова пустой список", () => {
    expect(switchCourses(["1", "2"], ["3"], true, all)).toEqual([]);
  });
});

describe("courseCount", () => {
  const list = [
    course({ nr: "1" }),
    course({ nr: "2", optional: true }),
    course({ nr: "3", optional: true }),
  ];

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
      course({
        nr: "3",
        optional: true,
        subject: { code: "Ku", name: "Kunst" },
      }),
    ];
    expect(visibleSubjects(list, NO_OPTIONAL).map((s) => s.code)).toEqual([
      "Ma",
    ]);
    expect(visibleSubjects(list, []).map((s) => s.code)).toEqual(["Ma", "Ku"]);
  });

  it("subject и name бывают null", () => {
    const list = [
      course({ nr: "1", subject: null }),
      course({ nr: "2", subject: { code: "Sw", name: null } }),
      course({ nr: "3", subject: { code: "Eg", name: null } }),
    ];
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

// Баг 20a (12.11.2026): на старте не включили ни одного Wahl-курса → сохранялось [], а [] значит «все».
describe("startChoice — выбор с экрана «Welche Kurse hast du?»", () => {
  it("ничего не выбрано — ни одного Wahl-курса, а не «все»", () => {
    expect(startChoice([])).toEqual(NO_OPTIONAL);
    expect(isCourseOn(startChoice([]), "141")).toBe(false);
  });

  it("выбран один курс — только он", () => {
    expect(startChoice(["150"])).toEqual(["150"]);
    expect(isCourseOn(startChoice(["150"]), "141")).toBe(false);
  });
});

describe("groupName — группы Sport словами", () => {
  it("SpMä / SpJu → Mädchen / Jungen, другое — null", () => {
    expect(groupName("SpMä")).toBe("Mädchen");
    expect(groupName("SpJu")).toBe("Jungen");
    expect(groupName("Fr2")).toBeNull();
    expect(groupName(null)).toBeNull();
  });
});

describe("courseTitle — другие группы как есть", () => {
  it("Französisch · Fr2", () => {
    expect(courseTitle(course({ subject: { code: "Fr", name: "Französisch" }, group: "Fr2", label: "Fr2" }))).toBe("Französisch · Fr2");
  });
});
