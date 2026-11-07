import { describe, expect, it } from "vitest";
import { accessValidChoices, accessValidUntil, accessValidValue, audienceChip, choiceFromDevices, devicesFromChoice, devicesShort, devicesText, halfYearEnd, isFull, signedOutText, summaryText } from "./accessCodes";
import { loginErrorText, signedOutNotice } from "./authErrors";

describe("devicesText", () => {
  it("с лимитом и без, единственное число", () => {
    expect(devicesText(9, 30)).toBe("9 von 30 Geräten");
    expect(devicesText(1, 1)).toBe("1 von 1 Gerät");
    expect(devicesText(21, null)).toBe("21 Geräte · unbegrenzt");
    expect(devicesText(1, null)).toBe("1 Gerät · unbegrenzt");
    expect(devicesText(null, 5)).toBe("0 von 5 Geräten"); // devices может не прийти
    expect(devicesShort(4, null)).toBe("4 · unbegrenzt");
  });
});

describe("лимит устройств", () => {
  it("выбор ↔ число", () => {
    expect(devicesFromChoice("none")).toBeNull();
    expect(devicesFromChoice("30")).toBe(30);
    expect(choiceFromDevices(null)).toBe("none");
    expect(choiceFromDevices(2)).toBe("2");
  });
  it("VOLL только у рабочего кода с полным лимитом", () => {
    expect(isFull({ status: "ok", maxDevices: 1, devices: 1 })).toBe(true);
    expect(isFull({ status: "ok", maxDevices: null, devices: 50 })).toBe(false);
    expect(isFull({ status: "locked", maxDevices: 1, devices: 1 })).toBe(false);
  });
});

describe("Gültig bis", () => {
  it("Halbjahr = 31. Januar, после — конец учебного года", () => {
    expect(halfYearEnd("2026-11-07", "07-31")).toBe("2027-01-31");
    expect(halfYearEnd("2027-01-31", "07-31")).toBe("2027-01-31");
    expect(halfYearEnd("2027-03-01", "07-31")).toBe("2027-07-31");
    expect(halfYearEnd("2027-03-01", null)).toBe("2028-01-31");
  });
  it("варианты и значение для сервера", () => {
    expect(accessValidChoices("07-31").map((c) => c.value)).toEqual(["30d", "halbjahr", "schuljahresende"]);
    expect(accessValidChoices(null).map((c) => c.value)).toEqual(["30d", "halbjahr"]);
    expect(accessValidValue("halbjahr", "2026-11-07", "07-31")).toBe("2027-01-31");
    expect(accessValidValue("30d", "2026-11-07", "07-31")).toBe("30d");
    expect(accessValidUntil("schuljahresende", "2026-11-07", "07-31")).toBe("2027-07-31");
    expect(accessValidUntil("30d", "2026-11-07", null)).toBe("2026-12-07");
  });
});

describe("тексты", () => {
  it("чип, тост, итог", () => {
    expect(audienceChip("person")).toBe("Persönlich");
    expect(signedOutText("»Eltern« gesperrt", 9)).toBe("»Eltern« gesperrt · 9 Geräte abgemeldet");
    expect(signedOutText("»Eltern« gesperrt", 0)).toBe("»Eltern« gesperrt");
    expect(signedOutText("Abgemeldet", 1)).toBe("Abgemeldet · 1 Gerät abgemeldet");
    const codes = [{ devices: 21 }, { devices: 9 }, { devices: null }];
    expect(summaryText(codes, { devices: 4 })).toBe("4 Zugänge · 34 Geräte angemeldet");
    expect(summaryText([], null)).toBe("0 Zugänge · 0 Geräte angemeldet");
  });
});

describe("ошибки входа по коду", () => {
  it("code_full с числами и без", () => {
    const full = { code: "code_full", message: "Mit diesem Code sind schon 2 von 2 Geräten angemeldet.", details: { devices: 2, maxDevices: 2 } };
    expect(loginErrorText(full)).toBe("Schon auf 2 von 2 Geräten angemeldet. Admin fragen: Gerät abmelden oder Limit erhöhen.");
    expect(loginErrorText({ ...full, details: {} })).toContain(full.message);
  });
  it("выключенный код и пароль", () => {
    expect(loginErrorText({ code: "code_locked", message: "Dieser Code wurde gesperrt." })).toBe("Dieser Code wurde gesperrt. Bitte beim Admin nachfragen.");
    const off = { code: "password_disabled", message: "Das Klassenpasswort gilt nicht mehr. Bitte nach einem Zugangscode fragen." };
    expect(loginErrorText(off)).toBe(off.message);
  });
  it("плашка «abgemeldet»", () => {
    expect(signedOutNotice({ message: "Dein Zugang gilt nicht mehr. Bitte beim Admin nachfragen." }).text).toBe("Dein Zugang gilt nicht mehr. Bitte beim Admin nachfragen.");
    expect(signedOutNotice({ message: "Bitte zuerst anmelden." }).text).toBe("Bitte neu anmelden.");
    expect(signedOutNotice(undefined).title).toBe("Du wurdest abgemeldet");
  });
});
