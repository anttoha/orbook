import { describe, expect, it } from "vitest";
import { agoText, askedText, dayCheck, inText } from "./liveText";

const NOW = Date.parse("2026-09-17T10:00:00+02:00");
const at = (seconds) => new Date(NOW + seconds * 1000).toISOString();

describe("agoText / inText", () => {
  it("секунды, минуты, часы, дни", () => {
    expect(agoText(at(-3), NOW)).toBe("gerade eben");
    expect(agoText(at(5), NOW)).toBe("gerade eben"); // часы сервера чуть впереди
    expect(agoText(at(-20), NOW)).toBe("vor 20 Sek.");
    expect(agoText(at(-180), NOW)).toBe("vor 3 Min.");
    expect(agoText(at(-7300), NOW)).toBe("vor 2 Std.");
    expect(agoText(at(-90000), NOW)).toBe("vor 1 Tag");
    expect(agoText(null, NOW)).toBeNull();
  });
  it("в будущем", () => {
    expect(inText(at(40), NOW)).toBe("in 40 Sek.");
    expect(inText(at(240), NOW)).toBe("in 4 Min.");
    expect(inText(at(-1), NOW)).toBeNull();
    expect(inText(undefined, NOW)).toBeNull();
  });
});

describe("dayCheck", () => {
  const today = "2026-09-17";
  it("план есть / нет / не проверяли / свободно", () => {
    expect(dayCheck({ status: "ok", publishedAt: "2026-09-17T07:12:00+02:00" }, today, NOW)).toEqual({ text: "Plan da · Stand heute 07:12", kind: "ok" });
    expect(dayCheck({ status: "ok", publishedAt: null, changedAt: "2026-09-14T14:02:00+02:00" }, today, NOW).text).toBe("Plan da · Stand Mo 14:02");
    expect(dayCheck({ status: "not_published", checkedAt: at(-20) }, today, NOW)).toEqual({ text: "Noch kein Plan · geprüft vor 20 Sek.", kind: "none" });
    expect(dayCheck({ status: "not_published", checkedAt: null }, today, NOW)).toEqual({ text: "Noch nicht geprüft", kind: "unknown" });
    expect(dayCheck({ status: "unavailable" }, today, NOW).kind).toBe("unknown"); // старый сервер без checkedAt
    expect(dayCheck({ status: "holiday", freeReason: "holiday" }, today, NOW)).toEqual({ text: "Schulfrei", kind: "free" });
  });
});

describe("askedText", () => {
  it("когда спрашивали и когда снова", () => {
    expect(askedText({ lastOkAt: at(-20), nextFetchAt: at(40) }, NOW)).toBe("Schule zuletzt gefragt vor 20 Sek. · wieder in 40 Sek.");
    expect(askedText({ lastOkAt: at(-20), nextFetchAt: null }, NOW)).toBe("Schule zuletzt gefragt vor 20 Sek.");
    expect(askedText(null, NOW)).toBe("Die Schule wurde noch nicht gefragt.");
  });
});
