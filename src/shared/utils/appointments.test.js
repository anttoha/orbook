import { describe, expect, it } from "vitest";
import {
  addAppointmentTarget,
  appointmentIcs,
  appointmentSubjects,
  appointmentsOn,
  countdown,
  dateText,
  formToBody,
  freeOn,
  groupAppointments,
  markFreeLessons,
  metaText,
  mySubjects,
  periodsText,
  sourceText,
  timeText,
  upcomingAppointments,
  validateAppointmentForm,
  visibleAppointments,
  whenText,
} from "./appointments";

const TODAY = "2026-09-16"; // середа
const item = (over = {}) => ({ id: 1, kind: "trip", title: "Exkursion", subject: null, dateFrom: "2026-09-28", dateTo: null, timeFrom: null, timeTo: null, place: null, note: null, source: "code", author: null, ...over });
const form = (over = {}) => ({ kind: "trip", subject: null, title: "Exkursion", dateFrom: "2026-09-28", dateTo: "", timeFrom: "", timeTo: "", place: "", note: "", ...over });

describe("хто бачить", () => {
  const courses = [
    { nr: 1, optional: false, subject: { code: "Ma" } },
    { nr: 2, optional: true, subject: { code: "Ph" } },
    { nr: 3, optional: true, subject: { code: "Bio" } },
  ];
  it("курсовий термін — лише з цим предметом, для всього класу — усім", () => {
    const subjects = mySubjects({ role: "class" }, courses, [2]);
    expect([...subjects].sort()).toEqual(["Ma", "Ph"]);
    const items = [item({ id: 1 }), item({ id: 2, subject: { code: "Bio", name: null } }), item({ id: 3, subject: { code: "Ph", name: "Physik" } })];
    expect(visibleAppointments(items, subjects).map((x) => x.id)).toEqual([1, 3]);
  });
  it("нічого не вибрано — видно всі курси; учитель і без курсів — усе", () => {
    expect(mySubjects({ role: "class" }, courses, []).has("Bio")).toBe(true);
    expect(mySubjects({ role: "teacher" }, courses, [2])).toBeNull();
    expect(mySubjects({ role: "class" }, [], [])).toBeNull();
    expect(mySubjects({ role: "class" }, courses, [], [1]).has("Ma")).toBe(false); // прихований обов'язковий
  });
  it("дні: багатоденний термін видно в кожен день, минулі зникають зі списку", () => {
    const ferien = item({ kind: "free", dateFrom: "2026-10-13", dateTo: "2026-10-24" });
    expect(appointmentsOn([ferien], "2026-10-20")).toHaveLength(1);
    expect(appointmentsOn([ferien], "2026-10-25")).toHaveLength(0);
    expect(upcomingAppointments([item({ dateFrom: "2026-09-15" }), ferien], TODAY)).toEqual([ferien]);
  });
});

describe("групи і підписи", () => {
  it("Diese Woche / Nächste Woche / Später; те, що вже йде, — у цьому тижні", () => {
    const groups = groupAppointments([item({ id: 1, dateFrom: "2026-09-14", dateTo: "2026-09-18" }), item({ id: 2, dateFrom: "2026-09-22" }), item({ id: 3, dateFrom: "2026-10-13" })], TODAY);
    expect(groups.map((g) => [g.title, g.items.map((x) => x.id)])).toEqual([
      ["Diese Woche", [1]],
      ["Nächste Woche", [2]],
      ["Später", [3]],
    ]);
  });
  it("час, мета-рядок, «коли»", () => {
    expect(timeText(item())).toBeNull();
    expect(timeText(item({ timeFrom: "19:00" }))).toBe("ab 19:00");
    expect(metaText(item({ subject: { code: "Ph", name: "Physik" }, timeFrom: "07:45", timeTo: "15:00", author: { kind: "teacher", short: "Ric" } }))).toBe("Physik · 07:45–15:00 · von Ric");
    expect(metaText(item({ dateTo: "2026-10-24" }))).toBe("bis Sa, 24. Okt");
    expect(whenText(item({ dateFrom: TODAY }), TODAY)).toBe("heute");
    expect(whenText(item({ dateFrom: "2026-09-28" }), TODAY)).toBe("in 12 Tagen");
    expect(whenText(item({ dateFrom: "2026-10-13" }), TODAY)).toBe("13. Okt");
    expect(whenText(item({ dateFrom: "2026-09-14", dateTo: "2026-09-18" }), TODAY)).toBe("läuft");
  });
  it("дата і відлік у вікні", () => {
    expect(dateText(item())).toBe("Montag, 28. September");
    expect(dateText(item({ dateFrom: "2026-10-13", dateTo: "2026-10-24" }))).toBe("Di, 13. Okt – Sa, 24. Okt");
    expect(countdown(item({ dateFrom: "2026-09-17", kind: "parents" }), TODAY)).toEqual({ number: 1, label: "Tag bis zum Elternabend" });
    expect(countdown(item({ dateFrom: TODAY }), TODAY).label).toBe("Heute");
    expect(countdown(item({ dateFrom: "2026-09-14", dateTo: "2026-09-18" }), TODAY).label).toBe("Läuft · noch 2 Tage");
  });
  it("хто вніс: школа, учитель (сам або інший), код без імені", () => {
    expect(sourceText(item({ source: "admin" }), null).name).toBe("der Schule");
    const ric = item({ source: "teacher", author: { kind: "teacher", short: "Ric" } });
    expect(sourceText(ric, { teacher: { short: "Ric" } })).toEqual({ name: "Ihnen (Ric)", role: null });
    expect(sourceText(ric, null)).toEqual({ name: "Ric", role: "Lehrkraft" });
    expect(sourceText(item(), null).name).toBeNull();
  });
});

describe("права і форма", () => {
  it("«+»: з правом — форма, учень без коду — Editor-Code, з кодом без права — немає", () => {
    expect(addAppointmentTarget({ editor: { canAppointments: true } })).toBe("/testen/termine/neu");
    expect(addAppointmentTarget({ role: "class", editor: null })).toBe("/editor-code?weiter=termin");
    expect(addAppointmentTarget({ editor: { canAppointments: false } })).toBeNull();
    expect(addAppointmentTarget({ role: "teacher", teacher: { canAppointments: false } })).toBeNull();
    expect(appointmentSubjects({ role: "teacher", teacher: { subjects: ["Ph"] } }, [{ code: "Ma" }, { code: "Ph" }])).toEqual([{ code: "Ph" }]);
  });
  it("перевірка дат і часу", () => {
    expect(validateAppointmentForm(form(), TODAY)).toEqual({});
    expect(validateAppointmentForm(form({ dateTo: "2026-09-25" }), TODAY).dateTo).toBe("Das Ende liegt vor dem Anfang.");
    expect(validateAppointmentForm(form({ dateFrom: "2026-09-01" }), TODAY).dateFrom).toBe("Der Termin liegt in der Vergangenheit.");
    // у правці старі дати не заважають
    expect(validateAppointmentForm(form({ dateFrom: "2026-09-01" }), TODAY, { from: "2026-09-01", to: null })).toEqual({});
    expect(validateAppointmentForm(form({ timeTo: "15:00" }), TODAY).timeTo).toBe("Bitte zuerst die Anfangszeit eingeben.");
    expect(validateAppointmentForm(form({ timeFrom: "15:00", timeTo: "07:45" }), TODAY).timeTo).toBe("Das Ende liegt vor dem Anfang.");
    expect(validateAppointmentForm(form({ timeFrom: "7:45" }), TODAY).timeFrom).toMatch("HH:MM");
    expect(validateAppointmentForm(form({ title: " " }), TODAY).title).toBeDefined();
    expect(validateAppointmentForm(form({ note: "Anrufen: 0151 2345678" }), TODAY).note).toBe("Bitte keine Telefonnummern im Hinweis.");
  });
  it("порожні поля йдуть як null", () => {
    expect(formToBody(form({ title: " Exkursion ", place: " ", timeFrom: "07:45" }))).toEqual({
      kind: "trip",
      subject: null,
      title: "Exkursion",
      dateFrom: "2026-09-28",
      dateTo: null,
      timeFrom: "07:45",
      timeTo: null,
      place: null,
      note: null,
    });
  });
});

describe(".ics", () => {
  it("увесь день — дати, з часом — Europe/Berlin, коми екрануються", () => {
    const allDay = appointmentIcs(item({ dateTo: "2026-10-24", title: "Ferien, Herbst" }), "20260916T080000Z");
    expect(allDay).toContain("DTSTART;VALUE=DATE:20260928");
    expect(allDay).toContain("DTEND;VALUE=DATE:20261025");
    expect(allDay).toContain("SUMMARY:Ferien\\, Herbst");
    const timed = appointmentIcs(item({ timeFrom: "07:45", timeTo: "15:00", place: "Lüdenscheid" }), "20260916T080000Z");
    expect(timed).toContain("DTSTART;TZID=Europe/Berlin:20260928T074500");
    expect(timed).toContain("DTEND;TZID=Europe/Berlin:20260928T150000");
    expect(timed).toContain("LOCATION:Lüdenscheid");
  });
});

describe("Frei nach Stunden (частина 53)", () => {
  it("уроки — діапазонами, без уроків — весь день", () => {
    expect(periodsText([6, 5])).toBe("5.–6. Stunde");
    expect(periodsText([1, 3, 4])).toBe("1., 3.–4. Stunde");
    expect(periodsText(null)).toBe("ganzer Tag");
  });
  it("що вільне в день: весь день перемагає, уроки об'єднуються", () => {
    const sport = item({ kind: "free", dateFrom: "2026-09-18", periods: [5, 6] });
    const fest = item({ id: 2, kind: "free", dateFrom: "2026-09-18", periods: [1] });
    const trip = item({ id: 3, dateFrom: "2026-09-18", periods: null });
    expect(freeOn([trip], "2026-09-18")).toBeNull(); // Ausflug нічого не звільняє
    expect([...freeOn([sport, fest], "2026-09-18").periods].sort()).toEqual([1, 5, 6]);
    expect(freeOn([sport, item({ id: 4, kind: "free", dateFrom: "2026-09-17", dateTo: "2026-09-19", periods: null })], "2026-09-18").all).toBe(true);
    expect(freeOn([sport], "2026-09-19")).toBeNull();
  });
  it("уроки не зникають — лише позначка free", () => {
    const lessons = [{ period: 4 }, { period: 5 }];
    expect(markFreeLessons(lessons, null)).toBe(lessons);
    expect(markFreeLessons(lessons, { all: false, periods: new Set([5]) })).toEqual([{ period: 4 }, { period: 5, free: true }]);
    expect(markFreeLessons(lessons, { all: true, periods: new Set() }).every((l) => l.free)).toBe(true);
  });
  it("форма: без уроку не зберегти, у «Frei» немає часу й місця", () => {
    const frei = form({ kind: "free", periods: [], timeFrom: "07:45", place: "Aula" });
    expect(validateAppointmentForm(frei, TODAY).periods).toBe("Bitte mindestens eine Stunde wählen.");
    expect(validateAppointmentForm({ ...frei, periods: null, timeFrom: "7:4" }, TODAY)).toEqual({});
    expect(formToBody({ ...frei, periods: [5, 6] })).toMatchObject({ periods: [5, 6], timeFrom: null, place: null });
    expect(metaText(item({ kind: "free", periods: [5, 6] }))).toBe("5.–6. Stunde");
  });
});
