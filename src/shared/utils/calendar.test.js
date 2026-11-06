import { describe, expect, it } from "vitest";
import { firstOfMonth, lastOfMonth, monthWeeks, shiftMonth } from "./calendar";

describe("calendar", () => {
  it("перше і останнє число", () => {
    expect(firstOfMonth("2026-09-17")).toBe("2026-09-01");
    expect(lastOfMonth("2026-09-01")).toBe("2026-09-30");
    expect(lastOfMonth("2028-02-01")).toBe("2028-02-29"); // високосний
  });

  it("гортає місяці через рік", () => {
    expect(shiftMonth("2026-12-01", 1)).toBe("2027-01-01");
    expect(shiftMonth("2026-01-01", -1)).toBe("2025-12-01");
  });

  it("рядки місяця з понеділка (1 вересня 2026 — вівторок)", () => {
    expect(monthWeeks("2026-09-01")).toEqual(["2026-08-31", "2026-09-07", "2026-09-14", "2026-09-21", "2026-09-28"]);
  });

  it("місяць, що починається в понеділок", () => {
    expect(monthWeeks("2027-02-01")).toEqual(["2027-02-01", "2027-02-08", "2027-02-15", "2027-02-22"]);
  });
});
