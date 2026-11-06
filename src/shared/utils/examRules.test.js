import { describe, expect, it } from "vitest";
import { addExamTarget, addHomeworkTarget, canCreateExam, canCreateHomework, formEyebrow, examLabel, examToForm, formSubjects, fullDate, TOPIC_MAX, unlockErrorText, validateExamDate, validateExamForm, validateTopic } from "./examRules";

const TODAY = "2026-09-17";

describe("validateTopic", () => {
  it("порожня і звичайна тема — гаразд", () => {
    expect(validateTopic("")).toBeNull();
    expect(validateTopic(null)).toBeNull();
    expect(validateTopic("Quadratische Funktionen")).toBeNull();
    expect(validateTopic("x".repeat(TOPIC_MAX))).toBeNull();
  });

  it.each([
    ["x".repeat(61), "too_long"],
    ["Zeile\neins", "control_chars"],
    ["frag max@schule.de", "contains_email"],
    ["siehe www.beispiel.org", "contains_link"],
    ["siehe https://a.b", "contains_link"],
    ["ruf an 0171 2345678", "contains_phone"],
  ])("%s → %s", (topic, type) => {
    expect(validateTopic(topic).type).toBe(type);
  });

  it("Unit 2 і рік — не телефон", () => {
    expect(validateTopic("Unit 2 — Vocabulary 2026")).toBeNull();
  });
});

describe("validateExamDate", () => {
  it("межі включно", () => {
    expect(validateExamDate("2027-09-17", TODAY)).toBeNull();
    expect(validateExamDate("2026-09-03", TODAY)).toBeNull();
  });

  it("поза межами і порожня", () => {
    expect(validateExamDate("2027-09-18", TODAY).type).toBe("too_far");
    expect(validateExamDate("2026-09-02", TODAY).type).toBe("too_old");
    expect(validateExamDate("", TODAY).type).toBe("invalid");
  });
});

describe("validateExamForm", () => {
  const form = { type: "Klausur", subject: "Ma", date: "2026-09-19", lesson: null, topic: "" };

  it("правильна форма", () => {
    expect(validateExamForm(form, TODAY)).toEqual({});
  });

  it("без предмета і дати", () => {
    expect(Object.keys(validateExamForm({ ...form, subject: null, date: "" }, TODAY))).toEqual(["subject", "date"]);
  });

  it("стара дата при правці проходить, змінена на стару — ні", () => {
    const old = { ...form, date: "2026-01-01" };
    expect(validateExamForm(old, TODAY, "2026-01-01")).toEqual({});
    expect(validateExamForm(old, TODAY, "2026-01-02").date).toBeTruthy();
  });
});

describe("examToForm", () => {
  it("нова форма порожня", () => {
    expect(examToForm(null)).toEqual({ type: null, subject: null, date: "", lesson: null, topic: "" });
  });

  it("запис без уроку і предмета", () => {
    expect(examToForm({ type: "Test", subject: null, date: "2026-09-19", lesson: null, topic: "T" })).toEqual({ type: "Test", subject: null, date: "2026-09-19", lesson: null, topic: "T" });
  });
});

describe("examLabel", () => {
  it("як у діалозі", () => {
    expect(examLabel({ subject: { code: "Ma", name: "Mathe" }, date: "2025-09-19" })).toBe("Mathe · Fr 19.09.");
  });
});

describe("formSubjects", () => {
  const course = (nr, code, optional = false) => ({ nr, optional, subject: code ? { code, name: code } : null });

  it("курси, meta і предмет запису без повторів", () => {
    const codes = formSubjects([course("1", "De"), course("2", null)], [], { De: "Deutsch", Ma: "Mathe" }, { code: "Xy", name: "Xy" }).map((s) => s.code);
    expect(codes).toEqual(["De", "Ma", "Xy"]);
  });

  it("обходиться без meta і предмета запису", () => {
    expect(formSubjects([course("1", "De")], [], null, null).map((s) => s.code)).toEqual(["De"]);
  });

  it("невибрані курси не беремо", () => {
    expect(formSubjects([course("1", "Ku", true), course("2", "Sp", true)], ["2"], null, null).map((s) => s.code)).toEqual(["Sp"]);
  });
});

describe("права", () => {
  const editor = (canCreate) => ({ label: "Code A", canCreate });

  it("створювати можна з кодом або за дозволом адміна", () => {
    expect(canCreateExam({ editor: editor(true) })).toBe(true);
    expect(canCreateExam({ editor: null, features: { examsWithoutCode: true } })).toBe(true);
    expect(canCreateExam({ editor: null, features: { examsWithoutCode: false } })).toBe(false);
    expect(canCreateExam(null)).toBe(false);
  });

  it("куди веде плюс", () => {
    expect(addExamTarget({ editor: editor(true) })).toBe("/testen/neu");
    expect(addExamTarget({ editor: null })).toBe("/editor-code?weiter=neu");
    expect(addExamTarget({ editor: editor(false) })).toBeNull();
    expect(addExamTarget({ editor: editor(false), features: { examsWithoutCode: true } })).toBe("/testen/neu");
  });

  it("Lehrkraft: Rechte aus me.teacher, nie zum Editor-Code", () => {
    const teacher = (canCreate, canHomework) => ({ role: "teacher", editor: null, teacher: { short: "Mü", canCreate, canHomework }, features: { examsWithoutCode: true } });
    expect(canCreateExam(teacher(true, false))).toBe(true);
    expect(canCreateExam(teacher(false, true))).toBe(false); // examsWithoutCode gilt nur für die Klasse
    expect(addExamTarget(teacher(false, true))).toBeNull();
    expect(canCreateHomework(teacher(false, true))).toBe(true);
    expect(addHomeworkTarget(teacher(true, false))).toBeNull();
  });

  it("Hausaufgaben: nur mit canHomework", () => {
    expect(canCreateHomework({ editor: { canHomework: true } })).toBe(true);
    expect(canCreateHomework({ editor: null, features: { examsWithoutCode: true } })).toBe(false);
    expect(addHomeworkTarget({ editor: null })).toBe("/editor-code?weiter=hausaufgabe");
    expect(addHomeworkTarget({ editor: { canHomework: false } })).toBeNull();
    expect(addHomeworkTarget({ editor: { canHomework: true } })).toBe("/testen/hausaufgaben/neu");
  });
});

describe("unlockErrorText", () => {
  const retry = () => "Bitte in 10 Minuten erneut versuchen.";

  it("спроби і блокування", () => {
    expect(unlockErrorText({ code: "code_invalid", message: "Dieser Code ist ungültig.", details: { attemptsLeft: 4 } }, retry)).toBe("Dieser Code ist ungültig. Noch 4 Versuche.");
    expect(unlockErrorText({ code: "code_invalid", message: "Dieser Code ist ungültig.", details: { attemptsLeft: 1 } }, retry)).toBe("Dieser Code ist ungültig. Noch 1 Versuch.");
    expect(unlockErrorText({ code: "locked", message: "x" }, retry)).toBe("Bitte in 10 Minuten erneut versuchen.");
  });

  it("решта як є, details може не бути", () => {
    expect(unlockErrorText({ code: "code_locked", message: "Gesperrt." }, retry)).toBe("Gesperrt.");
    expect(unlockErrorText({ code: "code_invalid", message: "Ungültig.", details: {} }, retry)).toBe("Ungültig.");
  });
});

describe("fullDate", () => {
  it("німецький запис", () => {
    expect(fullDate("2027-07-31")).toBe("31.07.2027");
  });
});

describe("formEyebrow", () => {
  it("Lehrkraft, Editor oder Standard", () => {
    expect(formEyebrow({ teacher: { short: "Mü" }, editor: null }, "X")).toBe("Lehrkraft · Mü");
    expect(formEyebrow({ editor: { label: "Code A" } }, "X")).toBe("Editor · Code A");
    expect(formEyebrow(null, "Klausur eintragen")).toBe("Klausur eintragen");
  });
});
