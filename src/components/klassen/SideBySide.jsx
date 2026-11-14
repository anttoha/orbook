import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { ChevronRight } from "lucide-react";
import { useClassDays } from "../../shared/hooks/useClassToday";
import { useT } from "../../shared/hooks/useT";
import { useClasses } from "../../shared/store/classesStore";
import { usePlanStore } from "../../shared/store/planStore";
import { useUserStore } from "../../shared/store/userStore";
import { classPrefs, classTitle, myLessons, mySubjectCodes, nextExamAcross, sideBySideRows } from "../../shared/utils/classes";
import { cn } from "../../shared/utils/cn";
import { addDays, subjectName, weekdayShort } from "../../shared/utils/format";
import { fachClasses } from "../../shared/utils/lessons";
import Badge from "../ui/Badge";
import ClassBadge from "../ui/ClassBadge";
import { FlagIcon } from "../ui/icons";
import Liquid from "../ui/Liquid";

// Дни недели сверху: Mo–Fr той недели, где выбранный день; выбранный — фиолетовый
const DayPicker = ({ monday, date, onPick }) => {
  return (
    <div className="grid grid-cols-5 gap-1.5">
      {[0, 1, 2, 3, 4].map((offset) => {
        const iso = addDays(monday, offset);
        const active = iso === date;
        return (
          <button key={iso} type="button" aria-pressed={active} onClick={() => onPick(iso)} className={cn("flex flex-col items-center rounded-field py-1.5", active ? "bg-accent text-on-accent" : "text-ink")}>
            <span className={cn("text-micro font-extrabold uppercase", active ? "text-on-accent/80" : "text-faint")}>{weekdayShort(iso)}</span>
            <span className="text-subhead">{Number(iso.slice(8))}</span>
          </button>
        );
      })}
    </div>
  );
};

// Урок в клетке: цвет предмета, «Web · 102»; отменён — пунктир и «fällt aus»; замена — плашка «Vertretung»
const LessonTile = ({ lesson, overrides, onOpen }) => {
  const t = useT();
  const cancelled = lesson.status === "cancelled";
  const changed = !cancelled && lesson.status !== "normal";
  const where = [lesson.teacher, lesson.room].filter(Boolean).join(" · ");
  return (
    <button type="button" onClick={onOpen} className={cn("flex min-h-13 w-full flex-col justify-center rounded-field px-2.5 py-1.5 text-left", cancelled ? "border border-dashed border-danger bg-danger-tint text-danger" : fachClasses(lesson.subject?.code, overrides))}>
      <span className="flex min-w-0 items-center gap-1.5">
        <span className={cn("min-w-0 flex-1 truncate text-row font-extrabold", cancelled && "line-through")}>{subjectName(lesson.subject)}</span>
        {changed && (
          <Badge variant="exam" className="px-1.5 tracking-normal">
            {t("Vertretung")}
          </Badge>
        )}
      </span>
      <span className={cn("truncate text-label", cancelled ? "font-extrabold" : "opacity-80")}>{cancelled ? t("fällt aus") : where || "\u00a0"}</span>
    </button>
  );
};

// Клетка урока у одного класса: пусто, загрузка, один или несколько уроков (параллельные курсы)
const Cell = ({ lessons, status, overrides, onOpen }) => {
  if (status === "loading") return <div className="h-13 animate-pulse rounded-field bg-skeleton" />;
  if (lessons.length === 0) return <div className="h-13 rounded-field bg-sand/60" />;
  return (
    <div className="flex flex-col gap-1">
      {lessons.map((lesson) => (
        <LessonTile key={`${lesson.period}-${lesson.course?.nr ?? lesson.subject?.code}`} lesson={lesson} overrides={overrides} onOpen={onOpen} />
      ))}
    </div>
  );
};

// Ближайший тест всех классов: «Fr · Mathe-Test · 9b · Meine Klasse · in 2 Tagen ›»
const ExamCard = ({ exam, onOpen }) => {
  const t = useT();
  return (
    <Liquid as="button" refract type="button" onClick={onOpen} className="flex items-center gap-3.5 rounded-card bg-card px-4 py-3.5 text-left">
      <FlagIcon className="size-5 shrink-0 text-ink" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-row text-ink">{exam.text}</span>
        <span className="block truncate text-label text-faint">
          {exam.item.name} · {classTitle(exam.item, t)}
        </span>
      </span>
      <span className="shrink-0 text-label text-faint">{exam.when}</span>
      <ChevronRight className="size-4 shrink-0 text-faint2" />
    </Liquid>
  );
};

// ─────────────────────────────────────────────────────────────
// «Meine Klassen · Nebeneinander» (часть 29, макет handy-02): один день, классы колонками, уроки строками.
// Больше трёх классов — колонки листаются вбок. Нажатие на урок открывает этот день в его классе.
//   date — выбранный день, onPickDate(iso) — другой день недели
// ─────────────────────────────────────────────────────────────
const SideBySide = ({ date, monday, today, onPickDate }) => {
  const t = useT();
  const navigate = useNavigate();
  const list = useClasses(useShallow((s) => s.list.filter((item) => !item.gone)));
  const activeId = useClasses((s) => s.activeId);
  const openClass = usePlanStore((s) => s.openClass);
  const lessonTimes = usePlanStore((s) => s.meta?.lessonTimes);
  const overrides = useUserStore((s) => s.colorOverrides);
  // «Meine Kurse» каждого класса: берём из стора сами поля (новый объект в селекторе — лишние перерисовки)
  const prefsState = useUserStore(useShallow((s) => ({ picked: s.picked, hiddenRequired: s.hiddenRequired, byClass: s.byClass })));
  const days = useClassDays(
    list.map((item) => item.id),
    date,
  );

  const columns = list.map((item) => {
    const data = days[item.id];
    const prefs = classPrefs(prefsState, item.id, activeId);
    return { item, data, lessons: data.status === "loading" ? [] : myLessons(data.day, data.courses, prefs), subjects: mySubjectCodes(data.courses, prefs) };
  });
  const rows = sideBySideRows(
    columns.map((column) => column.lessons),
    lessonTimes,
  );
  const exam = nextExamAcross(
    columns.filter((column) => column.data.exams).map((column) => ({ item: column.item, exams: column.data.exams, subjects: column.subjects })),
    today,
    t,
  );
  const open = (id, path) => {
    navigate(path);
    openClass(id);
  };
  // Колонка ~ треть ширины: до трёх классов помещаются, остальные — свайпом вбок
  const grid = { gridTemplateColumns: `1.75rem repeat(${columns.length}, minmax(9rem, 1fr))` };

  return (
    <div className="flex flex-col gap-3.5">
      <DayPicker monday={monday} date={date} onPick={onPickDate} />
      <div className="-mx-gutter overflow-x-auto px-gutter">
        <div className="grid gap-x-1.5 gap-y-2" style={grid}>
          <span />
          {columns.map(({ item }) => (
            <span key={item.id} className="flex min-w-0 items-center gap-2 py-1">
              <ClassBadge name={item.name} color={item.color} size="sm" />
              <span className="truncate text-row text-ink">{item.label || `${t("Klasse")} ${item.name}`}</span>
            </span>
          ))}
          {rows.map((row) => [
            <span key={`p${row.period}`} className="flex flex-col items-center justify-center">
              <span className="text-subhead text-ink">{row.period}</span>
              <span className="text-micro text-faint">{row.start}</span>
            </span>,
            ...columns.map((column, index) => (
              <Cell key={`${row.period}-${column.item.id}`} lessons={row.cells[index]} status={column.data.status} overrides={overrides} onOpen={() => open(column.item.id, `/tag/${date}`)} />
            )),
          ])}
        </div>
      </div>
      {exam && <ExamCard exam={exam} onOpen={() => open(exam.item.id, "/testen")} />}
    </div>
  );
};

export default SideBySide;
