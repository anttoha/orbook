import { describe, expect, it } from "vitest";
import { classTitle, inviteForDevice, inviteMessage, inviteUrl, joinProblem, shortUrl } from "./invite";

describe("invite", () => {
  it("адреса з домену сайту, коротка — без https", () => {
    const url = inviteUrl("K7MQ-2XPA", "https://orbook-demo.orbitium.net");
    expect(url).toBe("https://orbook-demo.orbitium.net/i/K7MQ-2XPA");
    expect(shortUrl(url)).toBe("orbook-demo.orbitium.net/i/K7MQ-2XPA");
  });

  it("текст для WhatsApp — з класом і без", () => {
    expect(inviteMessage("u", "9b")).toBe("Hier ist der ORBook-Link für die 9b: Stundenplan, Vertretungen und Tests.\nu");
    expect(inviteMessage("u", null)).toMatch(/^Hier ist der ORBook-Link: /);
  });

  it("помилки входу за посиланням", () => {
    expect(joinProblem(null)).toBeNull();
    expect(joinProblem({ code: "invite_invalid" })).toEqual({ kind: "invalid" });
    expect(joinProblem({ code: "code_expired" })).toEqual({ kind: "invalid" });
    expect(joinProblem({ code: "code_full", details: { devices: 30, maxDevices: 30 } }).text).toBe("Kein Platz mehr: 30 von 30 Geräten.");
    expect(joinProblem({ code: "code_full" }).text).toBe("Kein Platz mehr für neue Geräte.");
    expect(joinProblem({ code: "offline", status: 0 }).kind).toBe("retry");
    expect(joinProblem({ code: "locked", status: 429, message: "Zu viele" })).toEqual({ kind: "retry", text: "Zu viele" });
  });

  it("назва класу може бути порожньою", () => {
    expect(classTitle("9b")).toBe("Klasse 9b");
    expect(classTitle(null)).toBe("Deine Klasse");
  });
});

describe("inviteForDevice", () => {
  const list = [{ id: 1, name: "8a" }, { id: 3, name: "5a", gone: true }];
  it("класс ссылки уже есть — открыть, другой — добавить", () => {
    expect(inviteForDevice({ id: 1, name: "8a" }, list)).toBe("known");
    expect(inviteForDevice({ id: 2, name: "07B" }, list)).toBe("add");
  });
  it("класс с «Zugang beendet» и старый сервер без class — добавить", () => {
    expect(inviteForDevice({ id: 3, name: "5a" }, list)).toBe("add");
    expect(inviteForDevice(undefined, list)).toBe("add");
    expect(inviteForDevice({ id: 1 }, null)).toBe("add");
  });
});
