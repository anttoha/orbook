import { describe, expect, it } from "vitest";
import {
  coursesForPush,
  DEFAULT_PUSH,
  keyToBytes,
  lastSentLabel,
  needsRefresh,
  prefsSummary,
  pushSupport,
  quietLabel,
  readEnvironment,
  subscriptionBody,
} from "./push";

const full = { hasServiceWorker: true, hasPushManager: true, hasNotification: true, permission: "default", isIos: false, standalone: false };

describe("pushSupport", () => {
  it("Android/Computer — ok", () => expect(pushSupport(full)).toBe("ok"));
  it("iPhone im Safari — erst installieren", () => expect(pushSupport({ ...full, isIos: true })).toBe("ios-install"));
  it("iPhone installiert — ok", () => expect(pushSupport({ ...full, isIos: true, standalone: true })).toBe("ok"));
  it("alter Browser", () => expect(pushSupport({ ...full, hasPushManager: false })).toBe("unsupported"));
  it("abgelehnt", () => expect(pushSupport({ ...full, permission: "denied" })).toBe("denied"));
});

describe("readEnvironment", () => {
  it("iPad gibt sich als Mac aus", () => {
    const win = { navigator: { userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X)", maxTouchPoints: 5 }, matchMedia: () => ({ matches: false }) };
    expect(readEnvironment(win)).toMatchObject({ isIos: true, standalone: false, hasPushManager: false, permission: "default" });
  });
  it("installiert und erlaubt", () => {
    const win = {
      navigator: { userAgent: "Android", serviceWorker: {} },
      PushManager: function PushManager() {},
      Notification: { permission: "granted" },
      matchMedia: () => ({ matches: true }),
    };
    expect(readEnvironment(win)).toEqual({ hasServiceWorker: true, hasPushManager: true, hasNotification: true, permission: "granted", isIos: false, standalone: true });
  });
  it("ohne navigator — nichts kaputt", () => expect(readEnvironment({}).hasServiceWorker).toBe(false));
});

describe("Texte", () => {
  it("Zusammenfassung in Mehr", () => {
    expect(prefsSummary(true, DEFAULT_PUSH.prefs)).toBe("3 von 4 an");
    expect(prefsSummary(false, DEFAULT_PUSH.prefs)).toBe("Aus");
    expect(prefsSummary(true, {})).toBe("nichts an");
    expect(prefsSummary(true, null)).toBe("nichts an");
  });
  it("Ruhezeit", () => {
    expect(quietLabel(DEFAULT_PUSH.quiet)).toBe("Zwischen 21:00 und 06:30 still");
    expect(quietLabel({ on: false })).toBe("Aus – Mitteilungen kommen immer");
    expect(quietLabel(null)).toBe("Aus – Mitteilungen kommen immer");
  });
  it("zuletzt angekommen", () => {
    const now = new Date(2026, 10, 12, 19, 0);
    expect(lastSentLabel(null, now)).toBe("Noch nichts angekommen");
    expect(lastSentLabel("kaputt", now)).toBe("Noch nichts angekommen");
    expect(lastSentLabel(new Date(2026, 10, 12, 7, 14).toISOString(), now)).toBe("Zuletzt: heute 07:14");
    expect(lastSentLabel(new Date(2026, 10, 11, 18, 0).toISOString(), now)).toBe("Zuletzt: gestern 18:00");
    expect(lastSentLabel(new Date(2026, 10, 9, 6, 30).toISOString(), now)).toBe("Zuletzt: Mo 06:30");
    expect(lastSentLabel(new Date(2026, 9, 1, 6, 30).toISOString(), now)).toBe("Zuletzt: 01.10.");
  });
});

describe("Kurse und Anfrage", () => {
  it("Meine Kurse → Nummern, sonst null", () => {
    expect(coursesForPush(true, ["141", "147"])).toEqual(["141", "147"]);
    expect(coursesForPush(true, [])).toBeNull(); // alle Wahlkurse sichtbar
    expect(coursesForPush(true, ["keine"])).toEqual([]); // kein Wahlkurs
    expect(coursesForPush(false, ["141"])).toBeNull();
    expect(coursesForPush(true, undefined)).toBeNull();
  });
  it("Body für PUT", () => {
    const sub = { endpoint: "https://fcm.googleapis.com/x", keys: { p256dh: "a", auth: "b" } };
    const body = subscriptionBody(sub, { prefs: { newExam: true }, mine: true, quiet: { on: false, start: "21:00", end: "06:30" } }, ["141"]);
    expect(body).toEqual({ subscription: sub, prefs: { ...DEFAULT_PUSH.prefs, newExam: true }, courses: ["141"], quiet: null });
    expect(subscriptionBody(sub, DEFAULT_PUSH, []).quiet).toEqual({ start: "21:00", end: "06:30" });
  });
  it("Schlüssel als Bytes", () => {
    expect([...keyToBytes("AQID_-8")]).toEqual([1, 2, 3, 255, 239]);
  });
  it("einmal am Tag neu senden", () => {
    expect(needsRefresh(null)).toBe(true);
    expect(needsRefresh(1000, 1000 + 3600 * 1000)).toBe(false);
    expect(needsRefresh(1000, 1000 + 25 * 3600 * 1000)).toBe(true);
  });
});
