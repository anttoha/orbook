import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import ExamChips from "../components/exams/ExamChips";
import ExamSkeleton from "../components/exams/ExamSkeleton";
import ExamsToolbar from "../components/exams/ExamsToolbar";
import ListSwitch from "../components/homework/ListSwitch";
import AddTaskButton from "../components/tasks/AddTaskButton";
import AufgabeRow from "../components/tasks/AufgabeRow";
import WeekProgress from "../components/tasks/WeekProgress";
import Button from "../components/ui/Button";
import { CheckIcon, FilterIcon, LockIcon } from "../components/ui/icons";
import { PlanBanner, PlanError } from "../components/ui/PlanState";
import StateScreen from "../components/ui/StateScreen";
import { DESKTOP_QUERY, useMediaQuery } from "../shared/hooks/useMediaQuery";
import { useNow } from "../shared/hooks/useNow";
import { useSheet } from "../shared/hooks/useSheet";
import { useExamFilter } from "../shared/store/examFilterStore";
import { usePlanStore } from "../shared/store/planStore";
import { useTasksStore } from "../shared/store/tasksStore";
import { useUserStore } from "../shared/store/userStore";
import { cn } from "../shared/utils/cn";
import { addHomeworkTarget } from "../shared/utils/examRules";
import { subjectChips, toggleSubject } from "../shared/utils/exams";
import { aufgabenList } from "../shared/utils/tasks";

// Фильтр: чипы предметов и поиск на ПК (по тексту и предмету)
function matches(row, subjects, query, names) {
  if (subjects.length > 0 && !subjects.includes(row.subject)) return false;
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [row.text, row.subject, names?.[row.subject], row.item?.author?.short].some((value) => value?.toLowerCase().includes(q));
}

// ─────────────────────────────────────────────────────────────
// «Aufgaben» — вторая часть вкладки Tests (/testen?liste=hausaufgaben, макеты 25 handy-01…04, pc-01).
// Домашки класса (GET /api/homework, planStore) + свои задачи (tasksStore). Галочки — только на устройстве.
// ─────────────────────────────────────────────────────────────
const Aufgaben = () => {
  const { today } = useNow();
  const me = usePlanStore((s) => s.me);
  const homework = usePlanStore((s) => s.homework);
  const resource = usePlanStore((s) => s.homeworkState);
  const loadHomework = usePlanStore((s) => s.loadHomework);
  const names = usePlanStore((s) => s.meta?.subjects);
  const tasks = useTasksStore((s) => s.tasks);
  const marks = useTasksStore((s) => s.marks);
  const overrides = useUserStore((s) => s.colorOverrides);
  const filter = useExamFilter((s) => s.filter);
  const setFilter = useExamFilter((s) => s.setFilter);
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [query, setQuery] = useState("");

  // новое могли записать учителя: при каждом входе спрашиваем сервер, старый список остаётся
  useEffect(() => {
    loadHomework();
  }, [loadHomework]);

  const list = aufgabenList({ homework, tasks, marks, today });
  const all = [...list.open, ...list.done];
  const keep = (row) => matches(row, filter.subjects, query, names);
  const groups = list.groups.map((group) => ({ ...group, items: group.items.filter(keep) })).filter((group) => group.items.length > 0);
  const done = list.done.filter(keep);
  const filterActive = filter.subjects.length > 0 || query.trim() !== "";
  const classTarget = addHomeworkTarget(me);
  const first = groups[0]?.items[0]?.key;
  const rowProps = { today, overrides, subjectNames: names };

  const body = () => {
    if (all.length === 0 && resource.status === "error") return <PlanError resource={resource} onRetry={loadHomework} title="Hausaufgaben konnten nicht geladen werden" />;
    if (all.length === 0 && resource.status === "loading") return <ExamSkeleton />;
    if (list.open.length === 0 && !filterActive) {
      return (
        <>
          <StateScreen icon={CheckIcon} title="Alles erledigt" text="Neue Hausaufgaben der Klasse erscheinen hier von selbst. Eigene Aufgaben: +" fill={done.length === 0} />
          {done.length > 0 && <DoneSection rows={done} rowProps={rowProps} />}
        </>
      );
    }
    if (groups.length === 0 && done.length === 0) {
      return (
        <StateScreen icon={FilterIcon} title="Nichts gefunden" text="Für diesen Filter gibt es keine Einträge." fill={false}>
          <Button
            onClick={() => {
              setFilter({ ...filter, subjects: [] });
              setQuery("");
            }}
            className="flex-none"
          >
            Filter zurücksetzen
          </Button>
        </StateScreen>
      );
    }
    return (
      <>
        {groups.map((group) => (
          <section key={group.title} className="flex flex-col gap-2">
            <h2 className="mb-0.75 text-hint font-extrabold text-faint">{group.title}</h2>
            {group.items.map((row) => (
              <OpenRow key={row.key} row={row} highlight={row.key === first} {...rowProps} />
            ))}
          </section>
        ))}
        {done.length > 0 && <DoneSection rows={done} rowProps={rowProps} />}
        <p className="flex items-start gap-1.5 text-caption text-faint lg:hidden">
          <LockIcon className="mt-0.5 size-3.25 shrink-0" /> Abhaken merkt sich nur dein Gerät — mit Sync-Code auch deine anderen. Die Klasse sieht davon nichts.
        </p>
      </>
    );
  };

  return (
    <section className="flex flex-col gap-5.5">
      <header className="flex items-end justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-hint font-extrabold text-faint">{eyebrowText(list.open.length, list.done.length, isDesktop)}</p>
          <h1 className="text-title text-ink lg:text-hero">Aufgaben</h1>
        </div>
        {isDesktop ? (
          <ExamsToolbar query={query} onQuery={setQuery} filter={null} placeholder="Aufgabe oder Fach suchen">
            <AddTaskButton classTarget={classTarget} wide />
          </ExamsToolbar>
        ) : (
          <AddTaskButton classTarget={classTarget} />
        )}
      </header>

      <div className="flex items-start gap-9">
        <div className="flex min-w-0 flex-1 flex-col gap-5.5 lg:max-w-exams">
          <ListSwitch className="lg:w-112.5 lg:self-start" />
          {(all.length > 0 || filterActive) && (
            <ExamChips
              codes={subjectChips(all.map((row) => ({ subject: { code: row.subject } })).filter((row) => row.subject.code), filter.subjects)}
              selected={filter.subjects}
              filterActive={false}
              onAll={() => setFilter({ ...filter, subjects: [] })}
              onToggle={(code) => setFilter({ ...filter, subjects: toggleSubject(filter.subjects, code) })}
              onOpenFilter={null}
            />
          )}
          <PlanBanner resource={resource} onRetry={loadHomework} />
          {body()}
        </div>
        <WeekProgress list={list} today={today} />
      </div>
    </section>
  );
};

// «Ab heute · 4 offen» (на ПК ещё «· 3 erledigt»)
function eyebrowText(open, done, wide) {
  const head = open > 0 ? `Ab heute · ${open} offen` : "Ab heute · nichts offen";
  return wide && done > 0 ? `${head} · ${done} erledigt` : head;
}

// Открытая строка: нажатие — детали домашки или правка своей задачи
const OpenRow = (props) => {
  const { openSheet } = useSheet();
  const open = () => (props.row.kind === "own" ? openSheet("aufgabe", { id: props.row.id }) : openSheet("hausaufgabe", { id: props.row.id }));
  return <AufgabeRow {...props} onOpen={open} />;
};

// «Erledigt · 3» внизу: на телефоне свёрнуто карточкой, на ПК сразу открыто
const DoneSection = ({ rows, rowProps }) => {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [opened, setOpened] = useState(false);
  const open = isDesktop || opened;

  if (!open) {
    return (
      <button type="button" onClick={() => setOpened(true)} className="flex h-12.5 items-center gap-3 rounded-card bg-card px-3.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
        <span className="grid size-6 place-items-center rounded-full bg-accent text-on-accent">
          <CheckIcon className="size-3.5" />
        </span>
        <span className="flex-1 text-row font-bold text-ink">Erledigt · {rows.length}</span>
        <span className="text-label text-faint">anzeigen</span>
        <ChevronDown className="size-4 text-faint2" />
      </button>
    );
  }
  return (
    <section className="flex flex-col gap-2">
      <div className="mb-0.75 flex items-center justify-between">
        <h2 className="text-hint font-extrabold text-faint">Erledigt · {rows.length}</h2>
        <button type="button" onClick={() => setOpened(false)} className={cn("text-hint font-bold text-accent-ink", isDesktop && "hidden")}>
          Zuklappen
        </button>
      </div>
      {rows.map((row) => (
        <OpenRow key={row.key} row={row} {...rowProps} />
      ))}
    </section>
  );
};

export default Aufgaben;
