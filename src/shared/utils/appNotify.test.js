import { describe, expect, it } from "vitest";
import { DEFAULT_PUSH } from "./push";
import { appSettingsOf, appSupport, lastCheckLabel, parseAppNotify } from "./appNotify";

describe("parseAppNotify", () => {
  it("читает ответ приложения", () => {
    const s = parseAppNotify(JSON.stringify({ permission: "granted", on: true, prefs: { newExam: true }, quiet: { on: false, start: "22:00", end: "07:00" }, before: { on: true, minutes: 5 }, reminderTime: "19:30", lastCheckAt: 1700000000000 }));
    expect(s).toMatchObject({ permission: "granted", on: true, quiet: { on: false, start: "22:00", end: "07:00" }, before: { on: true, minutes: 5 }, reminderTime: "19:30", lastCheckAt: 1700000000000 });
    expect(s.prefs).toEqual({ ...DEFAULT_PUSH.prefs, newExam: true, newGrade: false }); // «Neue Note» (36c) по умолчанию выкл.
  });

  it("по умолчанию: «Vor der Stunde» выключено, 10 минут; ещё не спрашивали", () => {
    const s = parseAppNotify("{}");
    expect(s.before).toEqual({ on: false, minutes: 10 });
    expect(s.permission).toBe("ask");
    expect(s.on).toBe(false);
    expect(s.lastCheckAt).toBeNull();
  });

  it("чужие значения → по умолчанию, мусор → null", () => {
    const s = parseAppNotify(JSON.stringify({ permission: "maybe", before: { on: "ja", minutes: 7 }, quiet: { start: "25:00" }, reminderTime: "x" }));
    expect(s).toMatchObject({ permission: "ask", before: { on: false, minutes: 10 }, quiet: { start: "21:00" }, reminderTime: "18:00" });
    expect(parseAppNotify("kaputt")).toBeNull();
    expect(parseAppNotify(null)).toBeNull();
  });
});

it("запрещено в Android → app-denied, иначе app", () => {
  expect(appSupport({ permission: "denied" })).toBe("app-denied");
  expect(appSupport({ permission: "ask" })).toBe("app");
  expect(appSupport(null)).toBe("app");
});

it("настройки для приложения — полные, даже если в сторе чего-то нет", () => {
  const out = appSettingsOf({ enabled: true, prefs: { reminder: false }, quiet: { on: false }, before: { on: true } });
  expect(out).toEqual({ on: true, prefs: { ...DEFAULT_PUSH.prefs, newGrade: false, reminder: false }, quiet: { ...DEFAULT_PUSH.quiet, on: false }, before: { on: true, minutes: 10 }, reminderTime: "18:00" });
});

it("«Zuletzt geprüft»: сегодня — время, раньше — дата и время, нет — null", () => {
  const now = new Date(2026, 10, 20, 9, 0);
  expect(lastCheckLabel(new Date(2026, 10, 20, 7, 14).getTime(), now)).toBe("07:14");
  expect(lastCheckLabel(new Date(2026, 10, 19, 18, 5).getTime(), now)).toBe("19.11. 18:05");
  expect(lastCheckLabel(null, now)).toBeNull();
});
