import { afterEach, describe, expect, it, vi } from "vitest";
import { deleteExam, saveExam, undoDelete } from "./exams";

const reply = (status, body) => vi.stubGlobal("fetch", vi.fn(async () => new Response(body === undefined ? null : JSON.stringify(body), { status })));
const errorBody = (code, details) => ({ error: { code, message: "Text", details } });
const FORM = { type: "Klausur", subject: "Ma", date: "2026-09-19", lesson: null, topic: "" };
const EXAM = { id: 12, version: 3 };

afterEach(() => vi.unstubAllGlobals());

describe("saveExam", () => {
  it("нова запис — POST без If-Match", async () => {
    reply(201, EXAM);
    await expect(saveExam(FORM)).resolves.toEqual({ status: "saved", exam: EXAM });
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe("/api/exams");
    expect(options.method).toBe("POST");
    expect(options.headers["If-Match"]).toBeUndefined();
  });

  it("правка — PATCH з версією", async () => {
    reply(200, EXAM);
    await saveExam(FORM, EXAM);
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe("/api/exams/12");
    expect(options.method).toBe("PATCH");
    expect(options.headers["If-Match"]).toBe('"v3"');
  });

  it("force іде в тілі", async () => {
    reply(201, EXAM);
    await saveExam(FORM, null, { force: true });
    expect(JSON.parse(fetch.mock.calls[0][1].body).force).toBe(true);
  });

  it("дублікат і конфлікт — результат, а не помилка", async () => {
    reply(409, errorBody("duplicate", { existing: EXAM }));
    await expect(saveExam(FORM)).resolves.toEqual({ status: "duplicate", existing: EXAM });
    reply(409, errorBody("conflict", { current: EXAM }));
    await expect(saveExam(FORM, EXAM)).resolves.toEqual({ status: "conflict", current: EXAM });
  });

  it("решта помилок летить далі", async () => {
    reply(403, errorBody("code_expired", {}));
    await expect(saveExam(FORM)).rejects.toMatchObject({ code: "code_expired" });
  });
});

describe("видалення", () => {
  it("DELETE з версією", async () => {
    reply(204);
    await deleteExam(EXAM);
    expect(fetch.mock.calls[0][1].headers["If-Match"]).toBe('"v3"');
  });

  it("повернення", async () => {
    reply(200, EXAM);
    await undoDelete(EXAM);
    expect(fetch.mock.calls[0][0]).toBe("/api/exams/12/restore");
  });
});
