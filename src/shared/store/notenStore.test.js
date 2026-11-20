import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../api/api";

vi.mock("../api/noten", () => ({ fetchNoten: vi.fn() }));
const { fetchNoten } = await import("../api/noten");
const { useNotenStore } = await import("./notenStore");

const DATA = { updatedAt: "2026-11-16", fetchedAt: "2026-11-20T07:41:00Z", subjects: [], absences: null };

describe("notenStore", () => {
  beforeEach(() => {
    useNotenStore.setState({ data: null, stamp: null, fresh: [], username: "", password: "", remember: true, busy: false, error: null, loginOpen: false });
    fetchNoten.mockReset();
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
});
