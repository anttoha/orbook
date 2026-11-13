import { describe, expect, it } from "vitest";
import { botUrl, sentWhere, telegramCourses, telegramState } from "./telegram";

describe("telegram", () => {
  it("telegramState: нет ответа или бот недоступен — карточку не показываем", () => {
    expect(telegramState(null)).toBe("hidden");
    expect(telegramState({ available: false, connected: true })).toBe("hidden");
    expect(telegramState({ available: true, connected: false })).toBe("off");
    expect(telegramState({ available: true, connected: true })).toBe("on");
  });

  it("telegramCourses: все Wahl-курсы → весь класс, «keine» отбрасываем", () => {
    expect(telegramCourses([])).toBeNull();
    expect(telegramCourses(undefined)).toBeNull();
    expect(telegramCourses(["142", "150"])).toEqual(["142", "150"]);
  });

  it("botUrl без имени не ломается", () => {
    expect(botUrl("ORBookBot")).toBe("https://t.me/ORBookBot");
    expect(botUrl(null)).toBe("https://t.me/");
  });

  it("sentWhere: чаты бота, группа, ошибка, chats = null", () => {
    expect(sentWhere({ kind: "bot", ok: true, chats: 18 })).toBe("18 Chats");
    expect(sentWhere({ kind: "bot", ok: true, chats: 1 })).toBe("1 Chat");
    expect(sentWhere({ kind: "bot", ok: true, chats: null })).toBe("0 Chats");
    expect(sentWhere({ kind: "plan", ok: true })).toBe("Telegram");
    expect(sentWhere({ kind: "plan", ok: false })).toBe("nicht angekommen");
  });
});
