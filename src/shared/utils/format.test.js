import { describe, expect, it } from "vitest";
import { standText, subjectCode, subjectName, updatedAgoText } from "./format";

describe("standText", () => {
  it("сегодня, вчера и другой день", () => {
    expect(standText("2026-10-05T07:12:00+02:00", "2026-10-05")).toBe("Stand von heute 07:12");
    expect(standText("2026-10-04T18:30:00+02:00", "2026-10-05")).toBe("Stand von gestern 18:30");
    expect(standText("2026-10-01T07:12:00+02:00", "2026-10-05")).toBe("Stand von 1.10. 07:12");
  });

  it("publishedAt = null", () => {
    expect(standText(null, "2026-10-05")).toBeNull();
  });
});

describe("updatedAgoText", () => {
  const now = new Date("2026-10-05T10:00:00+02:00");

  it("минуты, часы и дни", () => {
    expect(updatedAgoText("2026-10-05T09:57:00+02:00", now)).toBe("aktualisiert vor 3 Min.");
    expect(updatedAgoText("2026-10-05T07:30:00+02:00", now)).toBe("aktualisiert vor 2 Std.");
    expect(updatedAgoText("2026-10-04T09:00:00+02:00", now)).toBe("aktualisiert vor 1 Tag");
    expect(updatedAgoText("2026-10-01T09:00:00+02:00", now)).toBe("aktualisiert vor 4 Tagen");
  });

  it("только что и время из будущего (демо)", () => {
    expect(updatedAgoText("2026-10-05T09:59:50+02:00", now)).toBe("aktualisiert gerade eben");
    expect(updatedAgoText("2026-11-05T14:00:00+01:00", now)).toBe("aktualisiert gerade eben");
  });

  it("null и мусор не ломают экран", () => {
    expect(updatedAgoText(null, now)).toBeNull();
    expect(updatedAgoText("kaputt", now)).toBeNull();
  });
});

describe("предмет может быть null", () => {
  it("subjectName: название, код, запасной текст", () => {
    expect(subjectName({ code: "Ma", name: "Mathe" })).toBe("Mathe");
    expect(subjectName({ code: "Sk", name: null })).toBe("Sk");
    expect(subjectName(null)).toBe("Ohne Fach");
  });

  it("subjectCode: код или прочерк", () => {
    expect(subjectCode({ code: "Ma", name: "Mathe" })).toBe("Ma");
    expect(subjectCode(null)).toBe("–");
  });
});
