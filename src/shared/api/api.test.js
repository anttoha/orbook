import { afterEach, describe, expect, it, vi } from "vitest";
import { api, ApiError, ifMatch, isUnavailable, retryText, setAdminUnauthorizedHandler, setUnauthorizedHandler } from "./api";

// Подменяем fetch: сервер отвечает тем, что задал тест
const reply = (status, body, headers = {}) => vi.stubGlobal("fetch", vi.fn(async () => new Response(body === undefined ? null : JSON.stringify(body), { status, headers })));
const errorBody = (code, message, details) => ({ error: { code, message, details } });

afterEach(() => {
  vi.unstubAllGlobals();
  setUnauthorizedHandler(() => {});
  setAdminUnauthorizedHandler(() => {});
});

describe("api: успех", () => {
  it("ходит на относительный путь /api и передаёт cookies", async () => {
    reply(200, { status: "ok" });
    await expect(api("/health")).resolves.toEqual({ status: "ok" });
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe("/api/health");
    expect(options.credentials).toBe("same-origin");
  });

  it("отправляет тело как JSON", async () => {
    reply(200, {});
    await api("/auth/login", { method: "POST", body: { password: "x" } });
    const options = fetch.mock.calls[0][1];
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(options.body).toBe('{"password":"x"}');
  });

  it("204 и 304 дают null", async () => {
    reply(204);
    await expect(api("/x")).resolves.toBeNull();
    reply(304);
    await expect(api("/x")).resolves.toBeNull();
  });
});

describe("api: ошибки", () => {
  it("превращает ответ сервера в ApiError с немецким текстом", async () => {
    reply(401, errorBody("wrong_password", "Falsches Passwort.", { attemptsLeft: 2 }));
    const error = await api("/auth/login").catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 401, code: "wrong_password", message: "Falsches Passwort.", details: { attemptsLeft: 2 } });
  });

  it("даёт запасной текст, когда тело не JSON (например, 502 от nginx)", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("<html>Bad Gateway</html>", { status: 502 })));
    const error = await api("/week").catch((e) => e);
    expect(error).toMatchObject({ status: 502, code: "http_error", message: "Anfrage fehlgeschlagen." });
    expect(isUnavailable(error)).toBe(true);
  });

  it("нет сети: code offline, status 0", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("Failed to fetch"); }));
    const error = await api("/week").catch((e) => e);
    expect(error).toMatchObject({ status: 0, code: "offline" });
    expect(isUnavailable(error)).toBe(true);
  });

  it("долгий ответ: code timeout", async () => {
    vi.stubGlobal("fetch", vi.fn((_, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
    })));
    const error = await api("/week", { timeout: 1 }).catch((e) => e);
    expect(error).toMatchObject({ status: 0, code: "timeout" });
  });

  it("отмена самим приложением не считается ошибкой сети", async () => {
    vi.stubGlobal("fetch", vi.fn((_, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
    })));
    const controller = new AbortController();
    const request = api("/week", { signal: controller.signal });
    controller.abort();
    await expect(request).rejects.toMatchObject({ name: "AbortError" });
  });

  it("4xx нельзя заменять сохранёнными данными", () => {
    expect(isUnavailable(new ApiError(422, "invalid", "x"))).toBe(false);
    expect(isUnavailable(new Error("x"))).toBe(false);
  });
});

describe("api: 401", () => {
  it("обычный запрос ведёт на вход класса, /admin — на вход админа", async () => {
    const onClass = vi.fn();
    const onAdmin = vi.fn();
    setUnauthorizedHandler(onClass);
    setAdminUnauthorizedHandler(onAdmin);

    reply(401, errorBody("not_authenticated", "Bitte anmelden."));
    await api("/week").catch(() => {});
    expect(onClass).toHaveBeenCalledOnce();
    expect(onAdmin).not.toHaveBeenCalled();

    reply(401, errorBody("not_authenticated", "Bitte anmelden."));
    await api("/admin/codes").catch(() => {});
    expect(onAdmin).toHaveBeenCalledOnce();
  });

  it("неверный пароль не выбрасывает на экран входа", async () => {
    const onClass = vi.fn();
    setUnauthorizedHandler(onClass);
    reply(401, errorBody("wrong_password", "Falsch."));
    await api("/auth/login").catch(() => {});
    expect(onClass).not.toHaveBeenCalled();
  });
});

describe("помощники", () => {
  it("ifMatch: заголовок версии Klausur", () => {
    expect(ifMatch(3)).toEqual({ "If-Match": '"v3"' });
  });

  it("retryText: минуты при 429, иначе текст сервера", () => {
    expect(retryText(new ApiError(429, "locked", "Gesperrt", {}, 600))).toBe("Bitte in 10 Minuten erneut versuchen.");
    expect(retryText(new ApiError(429, "locked", "Gesperrt", {}, 45))).toBe("Bitte in 1 Minute erneut versuchen.");
    expect(retryText(new ApiError(429, "locked", "Gesperrt"))).toBe("Gesperrt");
  });
});
