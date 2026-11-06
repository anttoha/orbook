import { describe, expect, it } from "vitest";
import { ApiError } from "../api/api";
import { adminLoginErrorText, lockDuration, loginErrorText, teacherLoginErrorText } from "./authErrors";

const wrong = (details) => new ApiError(401, "wrong_password", "Passwort stimmt nicht.", details);

describe("loginErrorText", () => {
  it("показывает текст как в дизайне", () => {
    expect(loginErrorText(wrong({ attemptsLeft: 2 }))).toBe("Passwort stimmt nicht. Noch 2 Versuche, dann 10 Minuten Pause.");
  });

  it("одна попытка: единственное число", () => {
    expect(loginErrorText(wrong({ attemptsLeft: 1 }))).toContain("Noch 1 Versuch,");
  });

  it("не пишет «Noch 0», и не падает без details", () => {
    expect(loginErrorText(wrong({ attemptsLeft: 0 }))).toBe("Passwort stimmt nicht.");
    expect(loginErrorText(wrong(null))).toBe("Passwort stimmt nicht.");
  });

  it("блокировка: минуты из ответа сервера", () => {
    expect(loginErrorText(new ApiError(429, "locked", "Gesperrt", {}, 600))).toBe("Bitte in 10 Minuten erneut versuchen.");
  });

  it("сервер не настроен и нет сети", () => {
    expect(loginErrorText(new ApiError(503, "not_configured", "x"))).toBe("ORBook ist noch nicht eingerichtet.");
    expect(loginErrorText(new ApiError(0, "offline", "Keine Verbindung."))).toBe("Keine Verbindung.");
  });
});

describe("lockDuration", () => {
  it("берёт время из заголовка, потом из details", () => {
    expect(lockDuration(new ApiError(429, "locked", "x", {}, 30))).toBe(30_000);
    expect(lockDuration(new ApiError(429, "locked", "x", { retryAfter: 40 }))).toBe(40_000);
  });

  it("запасной вариант, когда сервер время не прислал", () => {
    expect(lockDuration(new ApiError(429, "locked", "x"))).toBe(600_000);
  });

  it("другие ошибки кнопку не отключают", () => {
    expect(lockDuration(wrong({ attemptsLeft: 2 }))).toBe(0);
    expect(lockDuration(new ApiError(429, "rate_limited", "x", {}, 30))).toBe(0);
  });
});

describe("adminLoginErrorText", () => {
  it("Versuche, Sperre, nicht eingerichtet", () => {
    expect(adminLoginErrorText(wrong({ attemptsLeft: 2 }))).toBe("Passwort stimmt nicht. Noch 2 Versuche.");
    expect(adminLoginErrorText(wrong({}))).toBe("Passwort stimmt nicht.");
    expect(adminLoginErrorText(new ApiError(429, "locked", "x", {}, 1800))).toBe("Bitte in 30 Minuten erneut versuchen.");
    expect(adminLoginErrorText(new ApiError(503, "not_configured", "x"))).toBe("Das Admin-Passwort ist noch nicht gesetzt.");
  });
});

describe("teacherLoginErrorText", () => {
  it("unbekannter Code mit Versuchen", () => {
    const error = new ApiError(403, "code_invalid", "Dieser Code ist ungültig.", { attemptsLeft: 2 });
    expect(teacherLoginErrorText(error)).toBe("Code unbekannt oder gesperrt. Bitte beim Admin der Klasse nachfragen. Noch 2 Versuche.");
  });
  it("gesperrt und abgelaufen: Text vom Server", () => {
    expect(teacherLoginErrorText(new ApiError(403, "code_locked", "Dieser Code wurde gesperrt."))).toBe("Dieser Code wurde gesperrt. Bitte beim Admin der Klasse nachfragen.");
  });
  it("zu viele Versuche", () => {
    expect(teacherLoginErrorText(new ApiError(429, "locked", "Zu viele Fehlversuche.", {}, 600))).toBe("Bitte in 10 Minuten erneut versuchen.");
  });
});
