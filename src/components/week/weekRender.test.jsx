// Рисуем настоящие компоненты в строку HTML, без браузера: падение в .map уроков видно сразу.
// Так упал старый фронт на проде: "Cannot read properties of null (reading 'code')".
//
// Настоящий план в репозитории не лежит. Чтобы проверить его, укажите папку с ответами API:
//   ORBOOK_REAL_DATA=/путь NODE_ENV=development npx vitest run weekRender
import { existsSync, readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import * as Tooltip from "@radix-ui/react-tooltip";
import { describe, expect, it, vi } from "vitest";
import process from "node:process";
import WeekGrid from "./WeekGrid";
import WeekUpdated from "./WeekUpdated";
import PeriodGrid from "./desktop/PeriodGrid";
import TimeGrid from "./desktop/TimeGrid";
import WeekAside from "./desktop/WeekAside";
import DayPlanDetails from "../sheets/DayPlanDetails";
import DayPageHeader from "../day/DayPageHeader";
import LessonList from "../day/LessonList";
import Timeline from "../day/Timeline";
import { hardLessons, hardWeek } from "./weekFixture";
import { lessonState } from "../../shared/utils/lessonClock";
import { lessonText } from "../../shared/utils/share";
import { visibleLessons } from "../../shared/utils/format";

// Без браузера Zustand всегда отдаёт начальное состояние стора, setState в рисунок не попадает.
// Поэтому «сейчас» задаём здесь: понедельник из weekFixture, идёт урок (рисуется и линия времени).
const NOW = new Date("2026-11-02T09:00:00+01:00");
vi.mock("../../shared/hooks/useNow", () => ({
  useNow: () => ({ now: new Date("2026-11-02T09:00:00+01:00"), today: "2026-11-02" }),
}));

const draw = (element) => renderToStaticMarkup(
  <MemoryRouter>
    <Tooltip.Provider>{element}</Tooltip.Provider>
  </MemoryRouter>,
);

const noop = () => {};

// Все виды сетки недели, телефон и ПК
const drawWeek = (days) => [
  draw(<WeekGrid days={days} onLessonClick={noop} />),
  draw(<PeriodGrid days={days} selectedDay={days[0].date} onSelectDay={noop} onLessonClick={noop} />),
  draw(<TimeGrid days={days} onLessonClick={noop} />),
  draw(<WeekAside days={days} />),
  draw(<WeekUpdated days={days} />),
].join("");

// Все виды дня
const drawDay = (day) => {
  const lessons = day.status === "ok" ? day.lessons : [];
  return [
    draw(<LessonList day={day} lessons={lessons} onOpen={noop} />),
    draw(<LessonList day={day} lessons={day.expectedLessons} preliminary />),
    draw(<Timeline day={day} lessons={lessons} onOpen={noop} />),
  ].join("");
};

describe("неделя и день со сложными уроками", () => {
  it("неделя рисуется на телефоне и на ПК", () => {
    const html = drawWeek(hardWeek.days);
    expect(html).toContain("fällt aus"); // cancelled
    expect(html).toContain("–"); // код урока без предмета
    expect(html).toContain("AGTan"); // subject.name = null
    expect(html).toContain("07:08"); // когда изменился план: тот же день
    expect(html).toContain("Mo 07:08"); // …и другой день
  });

  it("день рисуется списком и временной шкалой", () => {
    for (const day of hardWeek.days) expect(drawDay(day)).toBeTypeOf("string");
  });

  it("учитель и кабинет бывают null: без лишней точки", () => {
    const base = hardLessons[1];
    const day = hardWeek.days[1]; // не сегодня: урок не идёт, значка «Läuft · 15 min» с такой же точкой нет
    const row = (lesson) => draw(<LessonList day={day} lessons={[lesson]} onOpen={noop} />);
    expect(row({ ...base, teacher: null, room: "301" })).not.toContain("·");
    expect(row({ ...base, teacher: null, room: "301" })).toContain("301");
    expect(row({ ...base, teacher: "T03", room: null })).not.toContain("Raum");
    expect(row({ ...base, teacher: null, room: null })).not.toContain("Raum");
  });

  it("шапка дня: время изменения плана; пока дня нет, кнопки (i) нет", () => {
    const day = hardWeek.days[0];
    const header = draw(<DayPageHeader date={day.date} today={day.date} day={day} onInfo={noop} />);
    expect(header).toContain("07:08");
    expect(header).toContain("Info zum Tag");
    expect(draw(<DayPageHeader date={day.date} today={day.date} day={null} onInfo={noop} />)).not.toContain("Info zum Tag");
  });

  it("подробности плана: три строки, у пустых прочерк", () => {
    const html = draw(<DayPlanDetails day={hardWeek.days[0]} />);
    for (const label of ["Plan geändert", "Veröffentlicht", "Zuletzt geprüft", "heute 07:08", "heute 07:06", "heute 13:00"]) expect(html).toContain(label);
    expect(draw(<DayPlanDetails day={{ ...hardWeek.days[0], changedAt: null, publishedAt: null, fetchedAt: null }} />).match(/—/g)).toHaveLength(3);
  });

  it("логика вокруг уроков не падает на null", () => {
    expect(lessonState(hardLessons, NOW)).toBeTruthy();
    expect(visibleLessons(hardLessons, [{ nr: "141", optional: true }], new Set(["999"])).length).toBeGreaterThan(0);
    for (const lesson of hardLessons) expect(lessonText(lesson, "2026-11-02")).toContain("Std");
  });
});

// Настоящие ответы /api/week и /api/day. В обычном запуске теста пропускается
const realDir = process.env.ORBOOK_REAL_DATA;
const realFile = (name) => JSON.parse(readFileSync(`${realDir}/${name}`, "utf8"));

describe.skipIf(!realDir || !existsSync(`${realDir}/weeks.json`))("настоящие данные прода", () => {
  it("все недели и дни рисуются без ошибок", () => {
    for (const week of Object.values(realFile("weeks.json"))) expect(drawWeek(week.days)).toContain("<");
    for (const day of Object.values(realFile("days.json"))) {
      expect(drawDay(day)).toBeTypeOf("string");
      for (const lesson of [...day.lessons, ...day.expectedLessons]) expect(lessonText(lesson, day.date)).toContain("Std");
      lessonState(day.lessons, NOW);
    }
  });
});
