import { afterEach, describe, expect, it, vi } from "vitest";
import { loadAdminExams, loadEvents, runDanger } from "./admin";

// Підміняємо fetch: сервер відповідає тим, що задав тест
const reply = (status, body, headers = {}) => vi.stubGlobal("fetch", vi.fn(async () => new Response(body === undefined ? null : JSON.stringify(body), { status, headers })));
const errorBody = (code, message, details) => ({ error: { code, message, details } });

afterEach(() => vi.unstubAllGlobals());

describe("runDanger", () => {
  it("ohne LÖSCHEN geht nichts an den Server", async () => {
    reply(200, {});
    await expect(runDanger("deleteExams", { word: "Löschen", currentPassword: "x" })).resolves.toEqual({ status: "confirm_missing" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("schickt Wort, Passwort und bei purge das Datum", async () => {
    reply(200, { deleted: 12, backup: "orbook-before-purge.db" });
    const result = await runDanger("purge", { word: "LÖSCHEN", currentPassword: "geheim", before: "2026-09-01" });
    expect(result).toEqual({ status: "done", deleted: 12, backup: "orbook-before-purge.db" });
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe("/api/admin/exams/purge");
    expect(JSON.parse(options.body)).toEqual({ confirm: "LÖSCHEN", currentPassword: "geheim", before: "2026-09-01" });
  });

  it("falsches Passwort, Sperre, Backup fehlgeschlagen", async () => {
    reply(403, errorBody("wrong_password", "Passwort stimmt nicht.", { attemptsLeft: 2 }));
    await expect(runDanger("deleteSync", { word: "LÖSCHEN", currentPassword: "x" })).resolves.toEqual({ status: "wrong_password", attemptsLeft: 2 });
    reply(429, errorBody("locked", "Zu viele Fehlversuche.", { retryAfter: 1800 }), { "Retry-After": "1800" });
    await expect(runDanger("deleteSync", { word: "LÖSCHEN", currentPassword: "x" })).resolves.toEqual({ status: "locked", retryAfter: 1800 });
    reply(503, errorBody("backup_failed", "Das Backup ist fehlgeschlagen. Es wurde nichts verändert."));
    await expect(runDanger("resetStats", { word: "LÖSCHEN", currentPassword: "x" })).resolves.toMatchObject({ status: "backup_failed" });
  });
});

describe("Adressen", () => {
  it("leere Suche fehlt in der Adresse", async () => {
    reply(200, { exams: [] });
    await loadAdminExams({ scope: "past", q: "  " });
    expect(fetch.mock.calls[0][0]).toBe("/api/admin/exams?scope=past");
    reply(200, { events: [], nextBefore: null });
    await loadEvents({ kind: "error", q: "Abruf", before: 118 });
    expect(fetch.mock.calls[0][0]).toBe("/api/admin/events?kind=error&q=Abruf&before=118");
  });
});
