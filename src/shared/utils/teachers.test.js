import { describe, expect, it } from "vitest";
import { canDelete, canReset, matchesTeacher, newTeacherBody, sourceBadge, subjectChoices, teacherCount, teacherErrors, teacherForm, teacherPatch, teacherTitle } from "./teachers";

const mue = { short: "Mü", name: "Anna Müller", subjects: ["Ma", "Ph"], source: "plan", hidden: false, codeId: 7 };
const lenz = { short: "Lenz", name: null, subjects: ["Sp"], source: "eigen", hidden: false, codeId: null };

describe("teacherTitle", () => {
  it("zeigt den Namen, sonst das Kürzel", () => {
    expect(teacherTitle(mue)).toBe("Anna Müller");
    expect(teacherTitle(lenz)).toBe("Lenz");
    expect(teacherTitle({ short: "Haas", name: "" })).toBe("Haas");
  });
});

describe("sourceBadge", () => {
  it("Ausgeblendet geht vor der Quelle", () => {
    expect(sourceBadge({ ...mue, hidden: true }).variant).toBe("off");
    expect(sourceBadge(mue).variant).toBe("soft");
    expect(sourceBadge({ ...mue, source: "angepasst" }).variant).toBe("changed");
    expect(sourceBadge(lenz).variant).toBe("exam");
  });
});

describe("matchesTeacher", () => {
  it("sucht in Name, Kürzel und Fächern, ohne Groß/Klein", () => {
    expect(matchesTeacher(mue, "anna")).toBe(true);
    expect(matchesTeacher(mue, " mü ")).toBe(true);
    expect(matchesTeacher(mue, "ph")).toBe(true);
    expect(matchesTeacher(lenz, "anna")).toBe(false);
    expect(matchesTeacher(lenz, "")).toBe(true);
  });
  it("kommt mit fehlendem Namen klar", () => {
    expect(matchesTeacher({ short: "X", name: null, subjects: [] }, "a")).toBe(false);
  });
});

describe("subjectChoices", () => {
  it("hängt gewählte Fächer außerhalb der Klasse hinten an", () => {
    expect(subjectChoices(["Ma", "De"], ["De", "Ge"])).toEqual(["Ma", "De", "Ge"]);
  });
});

describe("teacherCount", () => {
  it("zählt alle und die aus dem Plan", () => {
    expect(teacherCount([mue, lenz])).toBe("2 Lehrkräfte · 1 aus dem Plan");
  });
});

describe("teacherPatch", () => {
  it("sendet nur Geändertes", () => {
    expect(teacherPatch(mue, teacherForm(mue))).toEqual({});
    expect(teacherPatch(mue, { ...teacherForm(mue), name: "  Anna M.  " })).toEqual({ name: "Anna M." });
    expect(teacherPatch(mue, { ...teacherForm(mue), name: "" })).toEqual({ name: "" });
    expect(teacherPatch(mue, { ...teacherForm(mue), subjects: ["Ph", "Ma"] })).toEqual({});
    expect(teacherPatch(mue, { ...teacherForm(mue), subjects: ["Ma"] })).toEqual({ subjects: ["Ma"] });
  });
  it("Kürzel nur bei eigenen Lehrkräften", () => {
    expect(teacherPatch(mue, { ...teacherForm(mue), short: "Neu" })).toEqual({});
    expect(teacherPatch(lenz, { ...teacherForm(lenz), short: "Lenzi" })).toEqual({ short: "Lenzi" });
  });
});

describe("newTeacherBody", () => {
  it("trimmt und lässt einen leeren Namen weg", () => {
    expect(newTeacherBody({ short: " Lenz ", name: " ", subjects: ["Sp"] })).toEqual({ short: "Lenz", subjects: ["Sp"] });
    expect(newTeacherBody({ short: "Lenz", name: "Sabine Lenz", subjects: ["Sp"] })).toEqual({ short: "Lenz", name: "Sabine Lenz", subjects: ["Sp"] });
  });
});

describe("teacherErrors", () => {
  it("ordnet Serverfehler dem Feld zu", () => {
    expect(teacherErrors({ status: 409, code: "short_taken" }).short).toMatch(/gibt es schon/);
    expect(teacherErrors({ status: 409, code: "teacher_has_code" }).short).toMatch(/Lehrer-Code/);
    expect(teacherErrors({ status: 422, message: "Bitte keine Links im Namen.", details: { fields: [{ field: "name" }] } })).toEqual({ name: "Bitte keine Links im Namen." });
    expect(teacherErrors({ status: 500, message: "kaputt" })).toEqual({ message: "kaputt" });
    expect(teacherErrors(undefined)).toEqual({ message: undefined });
  });
});

describe("canReset / canDelete", () => {
  it("zurücksetzen nur, wenn eine Lehrkraft aus dem Plan geändert wurde", () => {
    expect(canReset({ ...mue, name: null })).toBe(false);
    expect(canReset(mue)).toBe(true); // hat einen Namen
    expect(canReset({ ...mue, name: null, hidden: true })).toBe(true);
    expect(canReset({ ...mue, name: null, source: "angepasst" })).toBe(true);
    expect(canReset(lenz)).toBe(false);
  });
  it("löschen nur eigene", () => {
    expect(canDelete(lenz)).toBe(true);
    expect(canDelete(mue)).toBe(false);
  });
});
