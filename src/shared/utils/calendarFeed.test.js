import { describe, expect, it } from "vitest";
import { calendarLinks, feedBody, fetchedLabel } from "./calendarFeed";

describe("feedBody", () => {
  it("Meine Kurse: курсы и скрытые как у виджета, пустые пункты включены", () => {
    expect(feedBody({ exams: false }, true, ["12", "keine"], ["3"])).toEqual({
      items: { lessons: true, exams: false, appointments: true },
      courses: ["12", "keine"],
      hidden: ["3"],
    });
    expect(feedBody({}, true, undefined, null)).toMatchObject({ courses: [], hidden: [] });
  });

  it("Ganze Klasse — оба null", () => {
    expect(feedBody({}, false, ["12"], ["3"])).toMatchObject({ courses: null, hidden: null });
  });
});

describe("calendarLinks", () => {
  const feed = { url: "https://orbook.orbitium.net/api/public/calendar/abc.ics", webcalUrl: "webcal://orbook.orbitium.net/api/public/calendar/abc.ics" };

  it("Google — webcal в cid, Outlook — https в url, Apple — сам webcal", () => {
    const links = calendarLinks(feed);
    expect(links.google).toBe("https://calendar.google.com/calendar/r?cid=webcal%3A%2F%2Forbook.orbitium.net%2Fapi%2Fpublic%2Fcalendar%2Fabc.ics");
    expect(links.outlook).toContain("addfromweb?url=https%3A%2F%2Forbook.orbitium.net");
    expect(links.apple).toBe(feed.webcalUrl);
    expect(links.copy).toBe(feed.url);
  });

  it("ссылки нет (url null) → null", () => {
    expect(calendarLinks({ url: null, webcalUrl: null })).toBeNull();
    expect(calendarLinks(null)).toBeNull();
  });
});

describe("fetchedLabel", () => {
  const now = new Date(2026, 10, 21, 12, 0);
  it("сегодня, вчера, на этой неделе, раньше", () => {
    expect(fetchedLabel(new Date(2026, 10, 21, 6, 40).toISOString(), now)).toBe("Vom Kalender abgerufen: heute 06:40");
    expect(fetchedLabel(new Date(2026, 10, 20, 18, 0).toISOString(), now)).toBe("Vom Kalender abgerufen: gestern 18:00");
    expect(fetchedLabel(new Date(2026, 10, 17, 7, 5).toISOString(), now)).toBe("Vom Kalender abgerufen: Di 07:05");
    expect(fetchedLabel(new Date(2026, 10, 2, 7, 5).toISOString(), now)).toBe("Vom Kalender abgerufen: 02.11.");
  });
  it("null или мусор → «Noch nicht abgerufen»", () => {
    expect(fetchedLabel(null, now)).toBe("Noch nicht abgerufen");
    expect(fetchedLabel("kaputt", now)).toBe("Noch nicht abgerufen");
  });
});
