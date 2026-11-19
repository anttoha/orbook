import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { androidApp, cancelUpdate, installUpdate, onAndroidEvent } from "./android";

// Тесты идут в Node: «окно» — простой EventTarget, мост кладём в него сами
beforeEach(() => {
  vi.stubGlobal("window", new EventTarget());
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe("android.js без моста (браузер)", () => {
  it("androidApp — null, вызовы ничего не ломают", () => {
    expect(androidApp()).toBeNull();
    expect(() => installUpdate()).not.toThrow();
    expect(() => cancelUpdate()).not.toThrow();
  });
});

describe("android.js с мостом (APK)", () => {
  it("читает версию и вызывает методы приложения", () => {
    window.ORBookAndroid = {
      version: () => '{"versionName":"0.18.0","versionCode":3,"site":"orbook-demo"}',
      installUpdate: vi.fn(),
      cancelUpdate: vi.fn(),
    };
    expect(androidApp()).toEqual({ versionName: "0.18.0", versionCode: 3, site: "orbook-demo" });
    installUpdate();
    cancelUpdate();
    expect(window.ORBookAndroid.installUpdate).toHaveBeenCalledOnce();
    expect(window.ORBookAndroid.cancelUpdate).toHaveBeenCalledOnce();
  });

  it("мост на чужой странице отвечает null — значит, браузер", () => {
    window.ORBookAndroid = { version: () => null };
    expect(androidApp()).toBeNull();
  });

  it("мост бросил ошибку — null", () => {
    window.ORBookAndroid = { version: () => { throw new Error("weg"); } };
    expect(androidApp()).toBeNull();
  });

  it("события загрузки приходят и отписка работает", () => {
    const seen = [];
    const off = onAndroidEvent((detail) => seen.push(detail));
    window.dispatchEvent(new CustomEvent("orbook-android", { detail: { type: "download", loaded: 1, total: 2 } }));
    off();
    window.dispatchEvent(new CustomEvent("orbook-android", { detail: { type: "done" } }));
    expect(seen).toEqual([{ type: "download", loaded: 1, total: 2 }]);
  });
});
