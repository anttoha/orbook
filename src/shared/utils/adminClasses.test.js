import { describe, expect, it } from "vitest";
import { adminClassColor, adminClassList, classStats, codeTarget, otherClassOf, pickAdminClass, targetBody, schoolClassOptions, schoolLine, schoolStatus } from "./adminClasses";

const SCHOOLS = [
  { id: 2, name: "Schiller-Schule", number: null, passwordSet: true, classesInPlan: 0, classes: [{ id: 3, name: "7c" }] },
  { id: 1, name: "Goethe", number: "10245678", passwordSet: true, classesInPlan: 42, classes: [{ id: 2, name: "5a" }, { id: 1, name: "9b" }] },
];

describe("adminClassList", () => {
  it("все классы по номеру, со школой и постоянным цветом", () => {
    const list = adminClassList(SCHOOLS);
    expect(list.map((item) => item.id)).toEqual([1, 2, 3]);
    expect(list[2].school).toEqual({ id: 2, name: "Schiller-Schule" });
    expect(new Set(list.map((item) => item.color)).size).toBe(3);
    expect(adminClassColor(list, 3)).toBe(list[2].color);
    expect(adminClassColor(list, 99)).toBe("accent");
  });
  it("пустой ответ и школа без classes — пустой список", () => {
    expect(adminClassList(null)).toEqual([]);
    expect(adminClassList([{ id: 1, name: "X" }])).toEqual([]);
  });
});

describe("pickAdminClass", () => {
  const list = adminClassList(SCHOOLS);
  it("выбранный класс или первый", () => {
    expect(pickAdminClass(list, 2).name).toBe("5a");
    expect(pickAdminClass(list, null).name).toBe("9b");
    expect(pickAdminClass(list, 42).name).toBe("9b"); // класс удалили
    expect(pickAdminClass([], 1)).toBeNull();
  });
});

describe("schoolClassOptions", () => {
  it("классы плана и уже созданные, новые помечены", () => {
    const options = schoolClassOptions(SCHOOLS[1], { classes: [{ name: "10a" }, { name: "5a" }, { name: "8a" }] });
    expect(options.map((o) => o.value)).toEqual(["5a", "8a", "9b", "10a"]);
    expect(options.find((o) => o.value === "8a")).toEqual({ value: "8a", id: null, isNew: true });
    expect(options.find((o) => o.value === "9b")).toEqual({ value: "9b", id: 1, isNew: false });
  });
  it("плана нет — только созданные классы", () => {
    expect(schoolClassOptions(SCHOOLS[0], null)).toEqual([{ value: "7c", id: 3, isNew: false }]);
  });
});

describe("школа", () => {
  it("плашка и строка под названием", () => {
    expect(schoolStatus(SCHOOLS[1]).label).toBe("Plan ok");
    expect(schoolStatus(SCHOOLS[0]).label).toBe("Nicht getestet");
    expect(schoolStatus({ passwordSet: false }).tone).toBe("danger");
    expect(schoolLine(SCHOOLS[1])).toBe("Nr. 10245678 · 42 Klassen im Plan");
    expect(schoolLine(SCHOOLS[0])).toBe("");
  });
  it("числа класса с единственным числом", () => {
    expect(classStats({ devices: 27, codes: 4, exams: 5 })).toBe("27 Geräte · 4 Codes · 5 Tests");
    expect(classStats({ devices: 1, codes: 1, exams: 1 })).toBe("1 Gerät · 1 Code · 1 Test");
    expect(classStats({})).toBe("0 Geräte · 0 Codes · 0 Tests");
  });
});

describe("класс нового кода", () => {
  const list = adminClassList(SCHOOLS);
  const current = pickAdminClass(list, 2); // 5a в Goethe
  it("по умолчанию — класс из чипа; «Code für neue Klasse» другой школы — класс выбрать самому", () => {
    expect(codeTarget(current, null)).toEqual({ schoolId: 1, className: "5a", id: 2, isNew: false });
    expect(codeTarget(current, 1)).toEqual({ schoolId: 1, className: "5a", id: 2, isNew: false });
    expect(codeTarget(current, 2)).toEqual({ schoolId: 2, className: null, id: null, isNew: false });
    expect(codeTarget(null, null)).toBeNull();
  });
  it("тело запроса: свой класс — без полей, другой или новый — schoolId + className", () => {
    expect(targetBody({ schoolId: 1, className: "5a", id: 2 }, current)).toEqual({});
    expect(targetBody({ schoolId: 1, className: "8a", id: null, isNew: true }, current)).toEqual({ schoolId: 1, className: "8a" });
    expect(targetBody(null, current)).toEqual({});
  });
});

describe("otherClassOf", () => {
  it("код для другого класса — переключиться на него; для своего или старый сервер без class — нет", () => {
    const current = { id: 1, name: "8a" };
    expect(otherClassOf({ class: { id: 2, name: "07B" } }, current)).toBe(2);
    expect(otherClassOf({ class: { id: 1, name: "8a" } }, current)).toBeNull();
    expect(otherClassOf({ code: "X" }, current)).toBeNull();
    expect(otherClassOf(null, current)).toBeNull();
  });
});
