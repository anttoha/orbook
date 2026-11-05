// Рисуем настоящие компоненты в строку HTML, без браузера: падение в .map уроков видно сразу.
// Так упал старый фронт на проде: "Cannot read properties of null (reading 'code')".
//
// Настоящий план в репозитории не лежит. Чтобы проверить его, укажите папку с ответами API:
//   ORBOOK_REAL_DATA=/путь NODE_ENV=development npx vitest run weekRender
import { existsSync, readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import * as Tooltip from "@radix-ui/react-tooltip";
import { describe, expect, it } from "vitest";
import process from "node:process";
import WeekGrid from "./WeekGrid";
import WeekStand from "./WeekStand";
import PeriodGrid from "./desktop/PeriodGrid";
import TimeGrid from "./desktop/TimeGrid";
import WeekAside from "./desktop/WeekAside";
import LessonList from "../day/LessonList";
import Timeline from "../day/Timeline";
import { hardLessons, hardWeek } from "./weekFixture";
import { usePlanStore } from "../../shared/store/planStore";
import { createSchoolClock } from "../../shared/utils/lessonClock";
import { lessonState } from "../../shared/utils/lessonClock";
import { lessonText } from "../../shared/utils/share";
import { visibleLessons } from "../../shared/utils/format";

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
  draw(<WeekStand days={days} />),
].join("");

// Все виды дня
const drawDay = (day) => {
  const lessons = day.status === "ok" ? day.lessons : [];
  return [
    draw(<LessonList day={day} lessons={lessons} onOpen={noop} />),
    draw(<LessonList day={day} lessons={day.expectedLessons} preliminary variant="inline" />),
    draw(<Timeline day={day} lessons={lessons} onOpen={noop} />),
  ].join("");
};

const setNow = (iso) => {
  const clock = createSchoolClock(iso);
  usePlanStore.setState({ clock, now: clock.now(), courses: [], exams: [], meta: { lessonTimes: [], holidays: [], subjects: {} } });
};

describe("неделя и день со сложными уроками", () => {
  it("неделя рисуется на телефоне и на ПК", () => {
    setNow("2026-11-02T09:00:00+01:00");
    const html = drawWeek(hardWeek.days);
    expect(html).toContain("fällt aus"); // cancelled
    expect(html).toContain("–"); // код урока без предмета
    expect(html).toContain("AGTan"); // subject.name = null
  });

  it("день рисуется списком и временной шкалой", () => {
    setNow("2026-11-02T09:00:00+01:00");
    for (const day of hardWeek.days) expect(drawDay(day)).toBeTypeOf("string");
  });

  it("логика вокруг уроков не падает на null", () => {
    const now = new Date("2026-11-02T09:00:00+01:00");
    expect(lessonState(hardLessons, now)).toBeTruthy();
    expect(visibleLessons(hardLessons, [{ nr: "141", optional: true }], new Set(["999"])).length).toBeGreaterThan(0);
    for (const lesson of hardLessons) expect(lessonText(lesson, "2026-11-02")).toContain("Std");
  });
});

// Настоящие ответы /api/week и /api/day. В обычном запуске теста пропускается
const realDir = process.env.ORBOOK_REAL_DATA;
const realFile = (name) => JSON.parse(readFileSync(`${realDir}/${name}`, "utf8"));

describe.skipIf(!realDir || !existsSync(`${realDir}/weeks.json`))("настоящие данные прода", () => {
  it("все недели и дни рисуются без ошибок", () => {
    const { meta, courses } = realFile("base.json");
    const clock = createSchoolClock(meta.serverTime);
    usePlanStore.setState({ clock, now: clock.now(), meta, courses: courses.courses, exams: [] });

    for (const week of Object.values(realFile("weeks.json"))) expect(drawWeek(week.days)).toContain("<");
    for (const day of Object.values(realFile("days.json"))) {
      expect(drawDay(day)).toBeTypeOf("string");
      for (const lesson of [...day.lessons, ...day.expectedLessons]) expect(lessonText(lesson, day.date)).toContain("Std");
      lessonState(day.lessons, clock.now());
    }
  });
});
