import { describe, expect, it } from "vitest";
import { dayKey, isCheckDue, isNewer, megabytes, parseAppInfo, percentOf, updateErrorText } from "./android";

describe("parseAppInfo", () => {
  it("читает ответ моста", () => {
    expect(parseAppInfo('{"versionName":"0.18.0","versionCode":3,"site":"orbook"}')).toEqual({ versionName: "0.18.0", versionCode: 3, site: "orbook" });
  });
  it("без моста или с мусором — null", () => {
    expect(parseAppInfo(null)).toBeNull();
    expect(parseAppInfo(undefined)).toBeNull();
    expect(parseAppInfo("{kaputt")).toBeNull();
    expect(parseAppInfo('{"versionName":"0.18.0"}')).toBeNull();
    expect(parseAppInfo('{"versionName":1,"versionCode":3}')).toBeNull();
  });
  it("нет site — null вместо undefined", () => {
    expect(parseAppInfo('{"versionName":"1","versionCode":1}').site).toBeNull();
  });
});

describe("isNewer", () => {
  const app = { versionName: "0.18.0", versionCode: 3 };
  it("сравнивает versionCode, не versionName", () => {
    expect(isNewer(app, { versionName: "0.18.0", versionCode: 4 })).toBe(true);
    expect(isNewer(app, { versionName: "0.19.0", versionCode: 3 })).toBe(false);
    expect(isNewer(app, { versionCode: 2 })).toBe(false);
  });
  it("APK на сервере нет (null) или не APK — false", () => {
    expect(isNewer(app, null)).toBe(false);
    expect(isNewer(null, { versionCode: 9 })).toBe(false);
    expect(isNewer(app, {})).toBe(false);
  });
});

describe("isCheckDue", () => {
  const now = new Date(2026, 10, 19, 7, 30);
  it("раз в день", () => {
    expect(dayKey(now)).toBe("2026-11-19");
    expect(isCheckDue(null, now)).toBe(true);
    expect(isCheckDue("2026-11-18", now)).toBe(true);
    expect(isCheckDue("2026-11-19", now)).toBe(false);
  });
});

describe("megabytes и percentOf", () => {
  it("как на макете: 4,1 von 6,4 MB", () => {
    expect(megabytes(4.1 * 1048576)).toBe("4,1");
    expect(megabytes(6.4 * 1048576, "en")).toBe("6.4");
    expect(megabytes(null)).toBe("0,0");
  });
  it("проценты не выходят за 0…100", () => {
    expect(percentOf(50, 200)).toBe(25);
    expect(percentOf(300, 200)).toBe(100);
    expect(percentOf(10, 0)).toBe(0);
    expect(percentOf(null, 10)).toBe(0);
  });
});

describe("updateErrorText", () => {
  it("нет сети — текст с макета", () => {
    expect(updateErrorText("network")).toBe("Download fehlgeschlagen – keine Verbindung");
    expect(updateErrorText("checksum")).toBe("Download fehlgeschlagen");
    expect(updateErrorText("permission")).toBeNull();
  });
});
