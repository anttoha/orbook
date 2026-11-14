import { describe, expect, it } from "vitest";
import { APPEARANCE_DEFAULTS, appearanceAttrs, appearanceOf, effectiveMotion } from "./appearance";

describe("appearanceAttrs", () => {
  it("без настроек — как раньше: Soft, фиолетовый, полное движение", () => {
    expect(appearanceAttrs(undefined)).toEqual({ design: "soft", accent: "violett", glassBg: "aurora", glass: "voll", motion: "voll" });
  });

  it("берёт выбор пользователя", () => {
    expect(appearanceAttrs({ design: "glas", accent: "gruen", glassBg: "meer", glassMode: "einfach", motion: "aus" })).toEqual({
      design: "glas",
      accent: "gruen",
      glassBg: "meer",
      glass: "einfach",
      motion: "aus",
    });
  });

  it("незнакомые значения (например, из Sync новой версии) — по умолчанию", () => {
    expect(appearanceAttrs({ design: "neon", accent: "gold", glassBg: "x", glassMode: 3, motion: "turbo" })).toEqual(appearanceAttrs({}));
  });
});

describe("effectiveMotion", () => {
  it("не выбрано: система «меньше движения» → weniger, иначе voll", () => {
    expect(effectiveMotion(null, true)).toBe("weniger");
    expect(effectiveMotion(null, false)).toBe("voll");
  });

  it("выбор пользователя важнее системы", () => {
    expect(effectiveMotion("voll", true)).toBe("voll");
    expect(effectiveMotion("aus", false)).toBe("aus");
  });
});

describe("appearanceOf", () => {
  it("старое устройство без новых полей — значения по умолчанию", () => {
    expect(appearanceOf({ fontScale: 2 })).toEqual(APPEARANCE_DEFAULTS);
  });
});
