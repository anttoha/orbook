// Fixtures shaped per /opt/orbook-be/docs/API.md; used only for local screenshots.
import { chromium } from "playwright-core";
import fs from "node:fs";
import os from "node:os";
const CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; worker-src 'self'; manifest-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'";
const T = [["07:30","08:15"],["08:20","09:05"],["09:25","10:10"],["10:15","11:00"],["11:20","12:05"],["12:10","12:55"]];
export const lesson = (period, code, name, teacher, room, status = "normal", extra = {}) => ({ period, start: T[period-1]?.[0] ?? null, end: T[period-1]?.[1] ?? null, status, subject: { code, name }, teacher, room, course: { nr: "1" + period + code, label: code }, changes: {}, moved: null, info: null, examId: null, ...extra });
export const exam = { id: 12, type: "Klausur", subject: { code: "Ma", name: "Mathe" }, lesson: 2, topic: "Quadratische Funktionen", date: "2026-10-09", daysLeft: 4, canEdit: true, version: 3, updatedAt: "2026-10-01T10:00:00+02:00" };
const dayOf = (date, weekday, isToday, lessons, over = {}) => ({ date, weekday, status: "ok", freeReason: null, isToday, week: 2, publishedAt: "2026-10-05T07:12:00+02:00", fetchedAt: "2026-10-05T09:55:00+02:00", changedAt: "2026-10-05T07:12:00+02:00", stale: false, info: [], lessons, expectedLessons: [], exams: [], ...over });
const base = [["De","Deutsch","T11","204"],["Ma","Mathe","T03","102"],["En","Englisch","T25","305"],["Ph","Physik","T07","301"],["Ge","Geschichte","T14","108"],["Sp","Sport","T18","TH"]];
const rot = (n) => base.map((_, i) => base[(i + n) % base.length]);
const lessonsFor = (n) => rot(n).map(([c, s, t, r], i) => lesson(i + 1, c, s, t, r));
const withSpecial = (list) => { const out = [...list]; out[1] = { ...out[1], status: "substitution", room: "204" }; out[2] = { ...out[2], status: "cancelled", room: null, teacher: null }; return out; };
export const week = { week: "2026-W41", from: "2026-10-05", to: "2026-10-09", abWeek: 2, summary: { cancelled: 1, substitutions: 1, roomChanges: 1, moved: 0, added: 0, exams: 1 },
  days: [dayOf("2026-10-05","Mo",true,lessonsFor(0),{ info: ["Elternabend der 9b heute um 18:00 in Raum 102."] }), dayOf("2026-10-06","Di",false,withSpecial(lessonsFor(1))), dayOf("2026-10-07","Mi",false,lessonsFor(2)), dayOf("2026-10-08","Do",false,lessonsFor(3)), dayOf("2026-10-09","Fr",false,lessonsFor(4).map((l,i)=>i===0?{...l,examId:12}:l),{ exams: [exam] })] };
const FEATURES = { statistics: true, notesSync: true, share: true, push: true, examsWithoutCode: false };
export const me = { authenticated: true, className: "9b", schoolName: "Meine Schule", editor: null, features: FEATURES, sessionExpiresAt: "2026-11-07T18:16:58+01:00" };
export const anon = { authenticated: false, className: null, schoolName: null, editor: null, features: null, sessionExpiresAt: null };
const courses = { courses: base.map(([code, name, teacher], i) => ({ nr: `${130 + i}`, subject: { code, name }, teacher, group: null, label: code, optional: false })) };
const meta = { className: "9b", schoolName: "Meine Schule", lessonTimes: T.map(([start, end], i) => ({ period: i + 1, start, end })), subjects: Object.fromEntries(base.map(([c, n]) => [c, n])), examTypes: ["Klausur","Test","Abgabe"], holidays: [], features: FEATURES, serverTime: "2026-10-05T09:40:00+02:00", abWeek: 2, demo: true };
const status = { lastFetchAt: "2026-10-05T09:55:03+02:00", lastOkAt: "2026-10-05T09:55:03+02:00", nextFetchAt: "2026-10-05T10:00:03+02:00", lastChangeAt: "2026-10-05T07:12:40+02:00", stale: false, source: "fixtures" };
export const defaults = { "/auth/me": me, "/meta": meta, "/courses": courses, "/exams": { exams: [exam] }, "/plan/status": status, "/week": week, "/public/info": { className: "9b" } };

export const chosen = { "orbook-user": JSON.stringify({ state: { coursesChosen: true, notes: [], picked: [], colorOverrides: {}, showWeekend: false }, version: 2 }) };
export const launch = () => {
  const dir = `${os.homedir()}/.cache/ms-playwright/chromium-1243`;
  const sub = fs.readdirSync(dir).find((n) => n.startsWith("chrome-"));
  return chromium.launch({ executablePath: `${dir}/${sub}/chrome`, args: ["--no-sandbox"] });
};
export async function open(browser, { width = 390, height = 844, theme = "light", storage = {}, api = {}, base: origin = "http://localhost:4173" } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, colorScheme: "light", timezoneId: "Europe/Berlin", locale: "de-DE" });
  await ctx.addInitScript(({ theme, storage }) => {
    if (theme) localStorage.setItem("theme", theme);
    for (const [k, v] of Object.entries(storage)) localStorage.setItem(k, v);
  }, { theme, storage });
  const page = await ctx.newPage();
  const problems = [];
  page.on("console", (m) => { if (m.type() === "error" || /Content Security/.test(m.text())) problems.push(m.text().slice(0, 200)); });
  page.on("pageerror", (e) => problems.push("pageerror: " + e.message.slice(0, 200)));
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.startsWith("/api/")) {
      const path = url.pathname.slice(4);
      const key = Object.keys({ ...defaults, ...api }).find((k) => path === k || path.startsWith(k + "/") || path.startsWith(k + "?"));
      const hit = { ...defaults, ...api }[key];
      if (typeof hit === "function") return hit(route, url);
      if (hit === undefined) return route.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ error: { code: "not_found", message: "Nicht gefunden." } }) });
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(hit) });
    }
    const res = await route.fetch();
    const headers = res.headers();
    if ((headers["content-type"] || "").includes("text/html")) headers["content-security-policy"] = CSP; // same CSP as the real server
    return route.fulfill({ response: res, headers });
  });
  return { page, ctx, problems };
}
