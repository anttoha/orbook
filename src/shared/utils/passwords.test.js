import { describe, expect, it } from "vitest";
import { changedText, classShareText, devicesText, lengthError } from "./passwords";

describe("passwords", () => {
  it("lengthError: zu kurz → Text, lang genug → null", () => {
    expect(lengthError("kurz", 10)).toBe("Mindestens 10 Zeichen.");
    expect(lengthError("genau-zehn", 10)).toBeNull();
  });

  it("devicesText: Einzahl, Mehrzahl, 0 und unbekannt", () => {
    expect(devicesText(1)).toBe("1 Gerät abgemeldet");
    expect(devicesText(24)).toBe("24 Geräte abgemeldet");
    expect(devicesText(0)).toBeNull();
    expect(devicesText(undefined)).toBeNull();
  });

  it("changedText: ohne abgemeldete Geräte nur der Titel", () => {
    expect(changedText("Admin-Passwort geändert", 1)).toBe("Admin-Passwort geändert · 1 Gerät abgemeldet");
    expect(changedText("Admin-Passwort geändert", 0)).toBe("Admin-Passwort geändert");
  });

  it("classShareText: Klasse kann fehlen (null)", () => {
    const url = "https://orbook.example";
    expect(classShareText("k7mp-4rxa-92tc", { className: "9b", url })).toBe("Neues ORBook-Passwort für die 9b: k7mp-4rxa-92tc\nhttps://orbook.example");
    expect(classShareText("k7mp-4rxa-92tc", { className: null, url })).toContain("für die Klasse:");
  });
});
