import { describe, expect, it } from "vitest";
import { responsibleText } from "./privacy";

describe("responsibleText", () => {
  it("имя и e-mail", () => {
    expect(responsibleText({ responsibleName: "A. B.", responsibleEmail: "a@b.de" })).toBe("A. B. · a@b.de. Server in Deutschland.");
  });

  it("только одно поле", () => {
    expect(responsibleText({ responsibleName: "", responsibleEmail: "a@b.de" })).toBe("a@b.de. Server in Deutschland.");
  });

  it("пусто или данных нет", () => {
    const empty = "Noch nicht eingetragen. Bis dahin hilft der Admin deiner Klasse. Server in Deutschland.";
    expect(responsibleText({ responsibleName: "", responsibleEmail: "" })).toBe(empty);
    expect(responsibleText(null)).toBe(empty);
  });
});
