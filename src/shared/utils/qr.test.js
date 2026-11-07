import { describe, expect, it } from "vitest";
import { logoBox, qrFor, qrLayout } from "./qr";

describe("qrLayout", () => {
  it("лого стоїть точно по центру", () => {
    expect(logoBox(33)).toEqual({ from: 13, to: 19 });
    expect(logoBox(29)).toEqual({ from: 11, to: 17 });
  });

  it("у очах і під лого крапок немає, решта темних клітинок — крапки", () => {
    const size = 25;
    const full = Array.from({ length: size }, () => Array(size).fill(true));
    const { dots, eyes } = qrLayout(full);
    expect(eyes).toEqual([
      [0, 0],
      [18, 0],
      [0, 18],
    ]);
    // 625 клітинок − 3 очі по 49 − лого 49
    expect(dots).toHaveLength(625 - 3 * 49 - 49);
    expect(dots).not.toContainEqual([3, 3]); // око
    expect(dots).not.toContainEqual([12, 12]); // центр
    expect(dots).toContainEqual([8, 0]);
  });

  it("справжнє посилання дає код 33×33 (версія 4, рівень Q)", () => {
    const { size, dots } = qrFor("https://orbook.orbitium.net/i/K7MQ-2XPA");
    expect(size).toBe(33);
    expect(dots.length).toBeGreaterThan(300);
  });
});
