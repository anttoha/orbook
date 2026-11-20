import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../api/api";

vi.mock("../api/noten", () => ({
  fetchNoten: vi.fn(),
  fetchNotenApp: vi.fn(),
  hasAppNoten: vi.fn(() => false),
  appNotenState: vi.fn(() => null),
  appNotenData: vi.fn(() => null),
  appNotenLogout: vi.fn(),
}));
const { fetchNoten, fetchNotenApp, hasAppNoten, appNotenState, appNotenData, appNotenLogout } = await import("../api/noten");
const { useNotenStore } = await import("./notenStore");

const DATA = { updatedAt: "2026-11-16", fetchedAt: "2026-11-20T07:41:00Z", subjects: [], absences: null };

describe("notenStore", () => {
  beforeEach(() => {
    useNotenStore.setState({ data: null, stamp: null, fresh: [], username: "", password: "", remember: true, busy: false, error: null, loginOpen: false });
    fetchNoten.mockReset();
    fetchNotenApp.mockReset();
    hasAppNoten.mockReturnValue(false);
    appNotenState.mockReturnValue(null);
    appNotenData.mockReturnValue(null);
  });

  it("Abmelden und gleich wieder anmelden: «too_often» kommt als Fehler mit Wartezeit an", async () => {
    fetchNoten.mockResolvedValueOnce(DATA);
    await useNotenStore.getState().login("max", "geheim", true);
    useNotenStore.getState().logout();
    expect(useNotenStore.getState().data).toBeNull();

    fetchNoten.mockRejectedValueOnce(new ApiError(429, "too_often", "x", { retryAfter: 240 }, 240));
    const code = await useNotenStore.getState().login("max", "geheim", true);
    expect(code).toBe("too_often");
    expect(useNotenStore.getState().error).toEqual({ code: "too_often", retryAfter: 240 });
    expect(useNotenStore.getState().busy).toBe(false);
  });

  it("falsches Passwort: Passwort weg, Anmeldung offen", async () => {
    useNotenStore.setState({ data: DATA, username: "max", password: "alt" });
    fetchNoten.mockRejectedValueOnce(new ApiError(403, "infopoint_denied", "x"));
    expect(await useNotenStore.getState().refresh()).toBe("denied");
    expect(useNotenStore.getState()).toMatchObject({ password: "", loginOpen: true, data: DATA });
  });

  it("ohne Passwort fragt refresh nicht den Server, sondern öffnet die Anmeldung", async () => {
    useNotenStore.setState({ data: DATA, username: "max", password: "" });
    expect(await useNotenStore.getState().refresh()).toBe("no_login");
    expect(fetchNoten).not.toHaveBeenCalled();
    expect(useNotenStore.getState().loginOpen).toBe(true);
  });

  describe("Android-App (Teil 36c)", () => {
    beforeEach(() => hasAppNoten.mockReturnValue(true));

    it("gespeichertes Passwort liegt in der App: refresh ohne Passwort geht an die App, nicht an den Server", async () => {
      useNotenStore.setState({ data: null, username: "max", password: "" });
      appNotenState.mockReturnValue({ saved: true, username: "max" });
      fetchNotenApp.mockResolvedValueOnce(DATA);
      expect(await useNotenStore.getState().refresh()).toBeNull();
      expect(fetchNoten).not.toHaveBeenCalled();
      expect(fetchNotenApp).toHaveBeenCalledWith(expect.objectContaining({ username: "max", password: "", remember: true }));
      expect(useNotenStore.getState().data).toEqual(DATA);
    });

    it("App hat kein Passwort mehr (no_login): Anmeldung öffnen, ohne Fehlertext", async () => {
      useNotenStore.setState({ data: DATA, username: "max", password: "" });
      appNotenState.mockReturnValue({ saved: true, username: "max" });
      fetchNotenApp.mockRejectedValueOnce(new ApiError(0, "no_login", ""));
      expect(await useNotenStore.getState().refresh()).toBe("no_login");
      expect(useNotenStore.getState()).toMatchObject({ loginOpen: true, error: null });
    });

    it("Noten aus dem Hintergrund übernehmen, wenn sie neuer sind; neue Note wird «neu»", () => {
      useNotenStore.setState({ data: DATA, fresh: [] });
      const later = { ...DATA, fetchedAt: "2026-11-20T10:00:00Z", subjects: [{ code: "ma", name: "Mathematik", grades: [{ date: "2026-11-20", grade: "2", note: null }], finals: [] }] };
      appNotenData.mockReturnValue({ data: later, fetchedAt: 1 });
      useNotenStore.getState().pullApp();
      expect(useNotenStore.getState().data).toEqual(later);
      expect(useNotenStore.getState().fresh).toEqual(["ma|2026-11-20|2|"]);
    });

    it("Abmelden löscht auch in der App", () => {
      useNotenStore.getState().logout();
      expect(appNotenLogout).toHaveBeenCalled();
    });
  });
});
