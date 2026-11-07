import { describe, expect, it } from "vitest";
import { classTitle, inviteMessage, inviteUrl, joinProblem, shortUrl } from "./invite";

describe("invite", () => {
  it("адреса з домену сайту, коротка — без https", () => {
    const url = inviteUrl("K7MQ-2XPA", "https://orbook-demo.orbitium.net");
    expect(url).toBe("https://orbook-demo.orbitium.net/i/K7MQ-2XPA");
    expect(shortUrl(url)).toBe("orbook-demo.orbitium.net/i/K7MQ-2XPA");
  });

  it("текст для WhatsApp — з класом і без", () => {
    expect(inviteMessage("u", "9b")).toBe("Hier ist der ORBook-Link für die 9b: Stundenplan, Vertretungen und Klausuren.\nu");
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
