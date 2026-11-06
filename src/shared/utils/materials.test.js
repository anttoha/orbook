import { describe, expect, it } from "vitest";
import { addedText, addMaterialTarget, checkLink, groupMaterials, materialChips, materialMeta, materialSubjects, shortUrl, validateMaterialForm } from "./materials";

describe("checkLink", () => {
  it.each([
    ["https://drive.google.com/drive/folders/1aX9", "google", "folder"],
    ["drive.google.com/file/d/1abc/view", "google", "file"],
    ["https://docs.google.com/spreadsheets/d/1x/edit", "google", "sheet"],
    ["https://1drv.ms/b/s!AbC", "onedrive", "pdf"],
    ["https://schule.sharepoint.com/:p:/s/9b/Eab", "onedrive", "slides"],
    ["http://DRIVE.google.com/drive/folders/1", "google", "folder"],
  ])("%s → %s · %s", (url, provider, kind) => {
    const link = checkLink(url);
    expect(link).toMatchObject({ ok: true, provider, kind });
    expect(link.url.startsWith("https://")).toBe(true);
  });

  it.each([
    ["https://www.dropbox.com/scl/fo/8kq", "not_allowed"],
    ["https://drive.google.com.evil.example/x", "not_allowed"],
    ["https://user@drive.google.com/drive/folders/1", "not_allowed"],
    ["https://drive.google.com:8443/x", "not_allowed"],
    ["javascript:alert(1)", "not_allowed"],
    ["https://sharepoint.com/:f:/x", "not_allowed"],
    ["https://drive.google.com/", "incomplete"],
    ["https://drive.google.com/a b", "invalid"],
    ["  ", "required"],
    [null, "required"],
  ])("%s → %s", (url, error) => {
    expect(checkLink(url)).toEqual({ ok: false, error });
  });
});

describe("підписи", () => {
  it("автор тільки у вчителя; невідомий вид — Datei", () => {
    expect(materialMeta({ provider: "google", kind: "folder", author: { kind: "teacher", short: "Mü" } })).toBe("Google Drive · Ordner · von Mü");
    expect(materialMeta({ provider: "onedrive", kind: "zip", author: null })).toBe("OneDrive · Datei");
  });

  it("хто і коли додав", () => {
    expect(addedText({ author: { short: "Mü" }, createdAt: "2026-09-12T08:12:00+02:00" })).toBe("Eingetragen von Mü · 12. Sept");
    expect(addedText({ author: null, createdAt: "2026-09-12T08:12:00+02:00" })).toBe("Geteilt am 12. Sept");
    expect(addedText({ author: null, createdAt: null })).toBe("Geteilt");
  });

  it("коротка адреса", () => {
    expect(shortUrl("https://drive.google.com/drive/folders/1aX9bCdEfGhIjKlMn")).toBe("drive.google.com/drive/folders/1aX9…");
    expect(shortUrl(null)).toBe("");
  });
});

describe("групи і чипи", () => {
  const items = [
    { id: 1, subject: { code: "Ph", name: "Physik" } },
    { id: 2, subject: { code: "Ma", name: "Mathe" } },
    { id: 3, subject: { code: "Ma", name: "Mathe" } },
    { id: 4, subject: { code: "TW", name: null } },
  ];
  it("групи за назвою предмета, порядок усередині — як від сервера; без назви — код", () => {
    expect(groupMaterials(items).map((g) => [g.name, g.items.map((i) => i.id)])).toEqual([
      ["Mathe", [2, 3]],
      ["Physik", [1]],
      ["TW", [4]],
    ]);
    expect(materialChips(items)).toEqual(["Ma", "Ph", "TW"]);
  });
});

describe("права", () => {
  const subjects = [{ code: "Ma" }, { code: "De" }, { code: "Ph" }];
  it("куди веде «+»", () => {
    expect(addMaterialTarget({ role: "class", editor: null })).toBe("/editor-code?weiter=material");
    expect(addMaterialTarget({ role: "class", editor: { canMaterials: false } })).toBeNull();
    expect(addMaterialTarget({ role: "class", editor: { canMaterials: true } })).toBe("/materialien/neu");
    expect(addMaterialTarget({ role: "teacher", teacher: { canMaterials: false } })).toBeNull();
  });
  it("учителю — лише свої предмети; subjects може бракувати", () => {
    expect(materialSubjects({ role: "teacher", teacher: { subjects: ["Ma", "Ph"] } }, subjects).map((s) => s.code)).toEqual(["Ma", "Ph"]);
    expect(materialSubjects({ role: "teacher", teacher: {} }, subjects)).toEqual([]);
    expect(materialSubjects({ role: "class" }, subjects)).toBe(subjects);
  });
});

describe("validateMaterialForm", () => {
  it("помилки за полями", () => {
    expect(validateMaterialForm({ subject: null, title: " ", url: "https://dropbox.com/x" })).toEqual({
      subject: "Bitte ein Fach wählen.",
      title: "Bitte einen Titel eingeben.",
      url: "Nur Links von Google Drive oder OneDrive.",
    });
    expect(validateMaterialForm({ subject: "Ma", title: "Blätter", url: "https://1drv.ms/f/s!x" })).toEqual({});
  });
});
