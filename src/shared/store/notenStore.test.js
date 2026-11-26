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

  describe("späte Antwort (Teil 47)", () => {
    // Anfrage, die erst auf «antworten()» fertig wird
    const slow = (mock) => {
      let answer;
      mock.mockImplementationOnce(() => new Promise((resolve, reject) => (answer = { resolve, reject })));
      return () => answer;
    };

    it("Abmelden während des Abrufs: Noten und Login kommen nicht zurück", async () => {
      const request = slow(fetchNoten);
      const running = useNotenStore.getState().login("max", "geheim", true);
      useNotenStore.getState().logout();
      request().resolve(DATA);
      expect(await running).toBeNull();
      expect(useNotenStore.getState()).toMatchObject({ data: null, username: "", password: "", busy: false });
    });

    it("später Fehler öffnet nach dem Abmelden nichts mehr", async () => {
      const request = slow(fetchNoten);
      const running = useNotenStore.getState().login("max", "alt", true);
      useNotenStore.getState().logout();
      request().reject(new ApiError(403, "infopoint_denied", "x"));
      await running;
      expect(useNotenStore.getState()).toMatchObject({ error: null, loginOpen: false });
    });

    it("alte Antwort stört den neuen Login nicht", async () => {
      const first = slow(fetchNoten);
      const old = useNotenStore.getState().login("max", "geheim", true);
      useNotenStore.getState().logout();
      const second = slow(fetchNoten);
      const next = useNotenStore.getState().login("mia", "neu", true);
      first().resolve(DATA);
      await old;
      expect(useNotenStore.getState()).toMatchObject({ data: null, busy: true, username: "mia" });
      second().resolve({ ...DATA, updatedAt: "2026-11-25" });
      await next;
      expect(useNotenStore.getState().data.updatedAt).toBe("2026-11-25");
    });

    it("Abmelden auf einem anderen Gerät (Sync) während des Abrufs", async () => {
      const request = slow(fetchNoten);
      const running = useNotenStore.getState().login("max", "geheim", true);
      useNotenStore.getState().setSynced(null, new Date().toISOString());
      request().resolve(DATA);
      await running;
      expect(useNotenStore.getState().data).toBeNull();
    });

    it("alte Android-App hat den Login gespeichert: er wird noch einmal gelöscht", async () => {
      hasAppNoten.mockReturnValue(true);
      const request = slow(fetchNotenApp);
      const running = useNotenStore.getState().login("max", "geheim", true);
      useNotenStore.getState().logout();
      appNotenLogout.mockClear();
      request().resolve(DATA);
      await running;
      expect(appNotenLogout).toHaveBeenCalledOnce();
      expect(useNotenStore.getState().data).toBeNull();
    });
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

    it("Teil 51: Abmelden auf einem anderen Gerät (Sync) löscht den Login auch hier und in der App", () => {
      useNotenStore.setState({ data: DATA, username: "max", password: "geheim", stamp: "2026-11-20T10:00:00Z" });
      appNotenLogout.mockClear();
      useNotenStore.getState().setSynced(null, "2026-11-26T10:00:00Z");
      const s = useNotenStore.getState();
      expect([s.data, s.username, s.password]).toEqual([null, "", ""]);
      expect(appNotenLogout).toHaveBeenCalledOnce();
    });

    it("Teil 51: Noten aus dem Hintergrund schieben die Sync-Marke nicht vor (ein Abmelden woanders gewinnt)", () => {
      useNotenStore.setState({ data: DATA, fresh: [], stamp: "2026-11-20T10:00:00Z" });
      appNotenData.mockReturnValue({ data: { ...DATA, fetchedAt: "2026-11-27T06:00:00Z" }, fetchedAt: 1 });
      useNotenStore.getState().pullApp();
      expect(useNotenStore.getState().stamp).toBe("2026-11-20T10:00:00Z");
    });

    it("Abmelden löscht auch in der App", () => {
      useNotenStore.getState().logout();
      expect(appNotenLogout).toHaveBeenCalled();
    });
  });
});
