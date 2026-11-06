import { describe, expect, it } from "vitest";
import { authorLine, changeActor, changeText, changeTime, dueTitle, editRightsText, groupHomework, homeworkToForm, validateHomeworkText } from "./homework";

const item = (due, extra = {}) => ({ id: due, due, subject: { code: "Ma", name: "Mathe" }, text: "x", author: null, studentsMayEdit: false, lastChange: null, ...extra });

describe("validateHomeworkText", () => {
  it("erlaubt mehrere Zeilen", () => expect(validateHomeworkText("Buch S. 54\nRechenweg")).toBeNull());
  it("verlangt Text", () => expect(validateHomeworkText("  ")).toBe("Bitte die Aufgabe eintragen."));
  it("zu lang", () => expect(validateHomeworkText("a".repeat(301))).toMatch(/höchstens 300/));
  it("keine Links, Mails, Telefonnummern", () => {
    expect(validateHomeworkText("siehe www.test.de")).toMatch(/Links/);
    expect(validateHomeworkText("a@b.de")).toMatch(/E-Mail/);
    expect(validateHomeworkText("Ruf 0151 2345678 an")).toMatch(/Telefon/);
  });
  it("Datum ist keine Telefonnummer", () => expect(validateHomeworkText("bis 12.10.2026, Kap. 3–5")).toBeNull());
});

describe("groupHomework", () => {
  it("teilt nach morgen, Woche, nächster Woche, später", () => {
    // 2025-09-17 ist ein Mittwoch
    const groups = groupHomework([item("2025-09-18"), item("2025-09-19"), item("2025-09-23"), item("2025-10-01")], "2025-09-17");
    expect(groups.map((g) => [g.title, g.items.length])).toEqual([
      ["Bis morgen", 1],
      ["Diese Woche", 1],
      ["Nächste Woche", 1],
      ["Später", 1],
    ]);
  });
  it("morgen am Sonntag zählt nur einmal", () => {
    const groups = groupHomework([item("2025-09-22")], "2025-09-21");
    expect(groups).toEqual([{ title: "Bis morgen", items: [expect.any(Object)] }]);
  });
});

describe("Autor und Rechte", () => {
  const teacherEntry = item("2025-09-18", { author: { kind: "teacher", short: "Mü" } });
  it("Schülereintrag ohne Autor", () => {
    expect(editRightsText(item("2025-09-18"))).toBeNull();
    expect(authorLine(item("2025-09-18"), null)).toBeNull();
  });
  it("Lehrkraft ohne Freigabe", () => expect(editRightsText(teacherEntry)).toBe("Ändern dürfen nur Mü und der Admin."));
  it("Lehrkraft mit Freigabe", () => expect(editRightsText({ ...teacherEntry, studentsMayEdit: true })).toBe("Ändern: Mü, Admin und Schüler mit Freigabe."));
  it("eigener Eintrag der Lehrkraft", () => expect(authorLine(teacherEntry, { teacher: { short: "Mü" } })).toEqual({ name: "Ihnen (Mü)", role: null, changedByStudent: false }));
  it("geändert von Schüler", () => expect(authorLine({ ...teacherEntry, lastChange: { by: "student", short: null } }, null).changedByStudent).toBe(true));
  it("author ist null-sicher", () => expect(authorLine({ ...teacherEntry, author: { kind: "teacher", short: null } }, null)).toBeNull());
});

describe("dueTitle", () => {
  it("morgen / heute / später", () => {
    expect(dueTitle("2025-09-18", "2025-09-17")).toBe("Bis morgen, Do 18.9.");
    expect(dueTitle("2025-09-17", "2025-09-17")).toBe("Bis heute, Mi 17.9.");
    expect(dueTitle("2025-09-19", "2025-09-17")).toBe("Bis Fr 19.9.");
  });
});

describe("Verlauf", () => {
  it("wer", () => {
    expect(changeActor({ by: "teacher", short: "Mü" })).toBe("Mü");
    expect(changeActor({ by: "student", short: null })).toBe("Schüler mit Freigabe");
    expect(changeActor({ by: "admin" })).toBe("Admin");
  });
  it("wann", () => expect(changeTime("2025-09-17T15:15:00+02:00")).toBe("Mi 15:15"));
  it("was", () => {
    expect(changeText({ action: "created" })).toBe("Eingetragen");
    expect(changeText({ action: "updated", changes: { due: { old: "2025-09-18", new: "2025-09-19" } } })).toBe("Abgabe: Do 18.9. → Fr 19.9.");
    expect(changeText({ action: "updated", changes: { lesson: { old: null, new: 2 }, text: { old: "a", new: "b" } } })).toBe("Stunde: — → 2 · Text geändert");
    expect(changeText({ action: "updated", changes: null })).toBe("Geändert");
  });
});

describe("homeworkToForm", () => {
  it("leer und aus Eintrag", () => {
    expect(homeworkToForm(null)).toEqual({ subject: null, due: "", text: "", studentsMayEdit: false });
    expect(homeworkToForm(item("2025-09-18", { subject: null })).subject).toBeNull();
  });
});
