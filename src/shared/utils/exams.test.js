import { describe, expect, it } from "vitest";
import { EMPTY_FILTER, examCountdown, nextExamCard, searchExams, filterExams, filterSubjects, freshenExams, groupExams, isExamId, isFilterActive, subjectChips, toggleSubject, withDaysLeft } from "./exams";
import { examWhen } from "./format";
import { examText } from "./share";

const exam = (date, over = {}) => ({ id: date, type: "Klausur", subject: { code: "Ma", name: "Mathe" }, lesson: 1, topic: "", date, daysLeft: 0, ...over });
const TODAY = "2026-09-17"; // четвер

describe("groupExams", () => {
  it("ділить за тижнями від сьогодні", () => {
    const groups = groupExams([exam("2026-09-18"), exam("2026-09-20"), exam("2026-09-21"), exam("2026-09-27"), exam("2026-09-28")], TODAY);
    expect(groups.map((g) => [g.title, g.exams.length])).toEqual([["Diese Woche", 2], ["Nächste Woche", 2], ["Später", 1]]);
  });

  it("порожні групи не показує", () => {
    expect(groupExams([exam("2026-10-20")], TODAY).map((g) => g.title)).toEqual(["Später"]);
    expect(groupExams([], TODAY)).toEqual([]);
  });
});

describe("filterExams", () => {
  const list = [exam("2026-09-18"), exam("2026-09-25", { type: "Test", subject: { code: "De", name: "Deutsch" } }), exam("2026-12-01", { subject: null }), exam("2027-04-01")];

  it("без фільтра віддає все", () => {
    expect(filterExams(list, EMPTY_FILTER, TODAY)).toHaveLength(4);
  });

  it("за видом і кількома предметами", () => {
    expect(filterExams(list, { ...EMPTY_FILTER, type: "Test" }, TODAY)).toHaveLength(1);
    expect(filterExams(list, { ...EMPTY_FILTER, subjects: ["Ma", "De"] }, TODAY)).toHaveLength(3);
  });

  it("за періодом, межа входить", () => {
    expect(filterExams([exam("2026-10-01"), exam("2026-10-02")], { ...EMPTY_FILTER, range: "2w" }, TODAY)).toHaveLength(1);
    expect(filterExams(list, { ...EMPTY_FILTER, range: "half" }, TODAY)).toHaveLength(3);
  });

  it("період не діє на минулі", () => {
    expect(filterExams([exam("2026-01-01")], { ...EMPTY_FILTER, range: "2w", past: true }, TODAY)).toHaveLength(1);
  });
});

describe("isFilterActive", () => {
  it("видно будь-який вибір", () => {
    expect(isFilterActive(EMPTY_FILTER)).toBe(false);
    expect(isFilterActive({ ...EMPTY_FILTER, subjects: ["Ma"] })).toBe(true);
    expect(isFilterActive({ ...EMPTY_FILTER, past: true })).toBe(true);
  });
});

describe("toggleSubject", () => {
  it("додає і прибирає", () => {
    expect(toggleSubject(["Ma"], "De")).toEqual(["Ma", "De"]);
    expect(toggleSubject(["Ma", "De"], "Ma")).toEqual(["De"]);
  });
});

describe("subjectChips", () => {
  it("без повторів і без null, вибраний лишається", () => {
    const list = [exam("2026-09-18"), exam("2026-09-19"), exam("2026-09-20", { subject: null })];
    expect(subjectChips(list, ["Ge"])).toEqual(["Ma", "Ge"]);
  });
});

describe("filterSubjects", () => {
  const course = (nr, code, optional = false) => ({ nr, optional, subject: code ? { code, name: code } : null });

  it("збирає курси і Klausuren, subject: null пропускає", () => {
    const courses = [course("1", "De"), course("2", null), course("3", "De")];
    expect(filterSubjects(courses, [], [exam("2026-09-18")]).map((s) => s.code)).toEqual(["De", "Ma"]);
  });

  it("з вибіркових курсів бере лише вибрані", () => {
    const courses = [course("1", "De"), course("2", "Ku", true), course("3", "Sp", true)];
    expect(filterSubjects(courses, ["3"], []).map((s) => s.code)).toEqual(["De", "Sp"]);
  });

  it("нічого не вибрано: усі курси, як у плані", () => {
    expect(filterSubjects([course("1", "De"), course("2", "Ku", true)], [], []).map((s) => s.code)).toEqual(["De", "Ku"]);
  });
});

describe("freshenExams", () => {
  it("віднімає минулі дні і прибирає те, що вже минуло", () => {
    const saved = [exam("2026-09-16", { daysLeft: 1 }), exam("2026-09-17", { daysLeft: 2 }), exam("2026-09-19", { daysLeft: 4 })];
    expect(freshenExams(saved, 2).map((e) => [e.date, e.daysLeft])).toEqual([["2026-09-17", 0], ["2026-09-19", 2]]);
  });

  it("збережене сьогодні лишається як є", () => {
    expect(freshenExams([exam("2026-09-19", { daysLeft: 2 })], 0)[0].daysLeft).toBe(2);
  });
});

describe("withDaysLeft", () => {
  it("минулі лишає", () => {
    expect(withDaysLeft([exam("2026-09-14", { daysLeft: -1 })], 2)[0].daysLeft).toBe(-3);
  });
});

describe("examText", () => {
  it("повний текст", () => {
    expect(examText(exam("2026-09-19", { lesson: 2, topic: "Bruchrechnung" }))).toBe("Klausur Mathe am 19.09., 2. Std\nBruchrechnung\n\nvia ORBook");
  });

  it("без уроку, теми і предмета", () => {
    expect(examText(exam("2026-09-19", { lesson: null, subject: null }))).toBe("Klausur Ohne Fach am 19.09.\n\nvia ORBook");
  });
});

describe("examCountdown", () => {
  it("число і вид запису", () => {
    expect(examCountdown(exam(TODAY, { daysLeft: 2 }))).toEqual({ number: 2, label: "Tage bis zur Klausur" });
    expect(examCountdown(exam(TODAY, { daysLeft: 1, type: "Test" }))).toEqual({ number: 1, label: "Tag bis zum Test" });
    expect(examCountdown(exam(TODAY, { daysLeft: 3, type: "Abgabe" })).label).toBe("Tage bis zur Abgabe");
  });

  it("незнайомий вид від адміна", () => {
    expect(examCountdown(exam(TODAY, { daysLeft: 3, type: "Referat" })).label).toBe("Tage bis zum Termin");
  });

  it("сьогодні і минуле без числа", () => {
    expect(examCountdown(exam(TODAY, { daysLeft: 0 }))).toEqual({ number: null, label: "Heute" });
    expect(examCountdown(exam(TODAY, { daysLeft: -1 })).label).toBe("vor 1 Tag");
    expect(examCountdown(exam(TODAY, { daysLeft: -5 })).label).toBe("vor 5 Tagen");
  });
});

describe("examWhen", () => {
  it("далекі дати, і майбутні, і минулі, показує числом", () => {
    expect(examWhen(exam("2026-09-19", { daysLeft: 2 }))).toBe("in 2 Tagen");
    expect(examWhen(exam("2026-10-01", { daysLeft: 15 }))).toBe("1. Okt");
    expect(examWhen(exam("2026-09-14", { daysLeft: -3 }))).toBe("vor 3 Tagen");
    expect(examWhen(exam("2026-08-01", { daysLeft: -47 }))).toBe("1. Aug");
  });
});

describe("isExamId", () => {
  it("пропускає лише додатні числа", () => {
    expect(isExamId("12")).toBe(true);
    for (const bad of ["0", "-1", "../admin", "1a", "", null, undefined]) expect(isExamId(bad)).toBe(false);
  });
});

describe("nextExamCard", () => {
  it("як на макеті 14", () => {
    expect(nextExamCard(exam("2026-09-18", { daysLeft: 2 }))).toEqual({ number: 2, eyebrow: "Tage bis", title: "Klausur Mathe", when: "Fr, 18. Sept · 1. Stunde" });
  });

  it("один день, сьогодні, без уроку і без предмета", () => {
    expect(nextExamCard(exam(TODAY, { daysLeft: 1 })).eyebrow).toBe("Tag bis");
    expect(nextExamCard(exam(TODAY, { daysLeft: 0 }))).toMatchObject({ number: null, eyebrow: "Heute" });
    const card = nextExamCard(exam(TODAY, { daysLeft: 3, lesson: null, subject: null, type: "Test" }));
    expect(card.title).toBe("Test Ohne Fach");
    expect(card.when).toBe("Do, 17. Sept");
  });
});

describe("searchExams", () => {
  const list = [exam("2026-09-18", { id: 1, topic: "Quadratische Funktionen" }), exam("2026-09-23", { id: 2, topic: "Weimarer Republik", subject: { code: "Ge", name: "Geschichte" }, type: "Test" }), exam("2026-09-24", { id: 3, topic: null, subject: null })];

  it("порожній запит — усе", () => {
    expect(searchExams(list, "  ")).toBe(list);
  });

  it("тема, предмет, код і вид, без різниці регістру", () => {
    expect(searchExams(list, "funktion").map((e) => e.id)).toEqual([1]);
    expect(searchExams(list, "geschichte").map((e) => e.id)).toEqual([2]);
    expect(searchExams(list, "ge test").map((e) => e.id)).toEqual([2]);
    expect(searchExams(list, "mathe").map((e) => e.id)).toEqual([1]);
  });

  it("без теми і предмета не падає", () => {
    expect(searchExams(list, "klausur").map((e) => e.id)).toEqual([1, 3]);
  });
});
