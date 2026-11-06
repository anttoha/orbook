import { useEffect, useState } from "react";
import { BookOpen, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import ExamChips from "../components/exams/ExamChips";
import ExamSkeleton from "../components/exams/ExamSkeleton";
import ExamsToolbar from "../components/exams/ExamsToolbar";
import HomeworkRow from "../components/homework/HomeworkRow";
import ListSwitch from "../components/homework/ListSwitch";
import Button from "../components/ui/Button";
import { FilterIcon, TrashIcon } from "../components/ui/icons";
import { PlanBanner, PlanError } from "../components/ui/PlanState";
import StateScreen from "../components/ui/StateScreen";
import { DESKTOP_QUERY, useMediaQuery } from "../shared/hooks/useMediaQuery";
import { useNow } from "../shared/hooks/useNow";
import { useSheet } from "../shared/hooks/useSheet";
import { useExamFilter } from "../shared/store/examFilterStore";
import { usePlanStore } from "../shared/store/planStore";
import { useUserStore } from "../shared/store/userStore";
import { addHomeworkTarget } from "../shared/utils/examRules";
import { subjectChips, toggleSubject } from "../shared/utils/exams";
import { subjectName } from "../shared/utils/format";
import { groupHomework } from "../shared/utils/homework";

// Пошук на ПК: у тексті завдання, предметі й Kürzel
const matches = (item, query) => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [item.text, subjectName(item.subject), item.subject?.code, item.author?.short].some((value) => value?.toLowerCase().includes(q));
};

// ─────────────────────────────────────────────────────────────
// Hausaufgaben — друга половина вкладки Klausuren (/testen?liste=hausaufgaben, макети handy-04, 09, pc-02).
// Дані: GET /api/homework (planStore). Чипи предметів спільні з Klausuren (examFilterStore).
// ─────────────────────────────────────────────────────────────
const Homework = () => {
  const { today } = useNow();
  const { openSheet } = useSheet();
  const me = usePlanStore((s) => s.me);
  const items = usePlanStore((s) => s.homework);
  const resource = usePlanStore((s) => s.homeworkState);
  const loadHomework = usePlanStore((s) => s.loadHomework);
  const overrides = useUserStore((s) => s.colorOverrides);
  const filter = useExamFilter((s) => s.filter);
  const setFilter = useExamFilter((s) => s.setFilter);
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [query, setQuery] = useState("");

  // нове могли записати вчителі: при кожному вході питаємо сервер, старий список лишається
  useEffect(() => {
    loadHomework();
  }, [loadHomework]);

  const shown = items.filter((item) => (filter.subjects.length === 0 || filter.subjects.includes(item.subject?.code)) && matches(item, query));
  const filterActive = filter.subjects.length > 0 || query.trim() !== "";
  const addTarget = addHomeworkTarget(me);

  const body = () => {
    if (resource.status === "error") return <PlanError resource={resource} onRetry={loadHomework} title="Hausaufgaben konnten nicht geladen werden" />;
    if (items.length === 0 && resource.status === "loading") return <ExamSkeleton />;
    if (items.length === 0) return <StateScreen icon={BookOpen} title="Keine Hausaufgaben" text="Wenn eine Lehrkraft etwas einträgt, steht es hier — bis zur Abgabe." />;
    if (shown.length === 0) {
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
        {groupHomework(shown, today).map((group) => (
          <section key={group.title} className="flex flex-col gap-2">
            <h2 className="mb-0.75 text-hint font-extrabold text-faint">{group.title}</h2>
            {group.items.map((item) => (
              <HomeworkRow key={item.id} item={item} overrides={overrides} highlight={item.id === shown[0].id} onClick={() => openSheet("hausaufgabe", { id: item.id })} />
            ))}
          </section>
        ))}
        <p className="flex items-center gap-1.5 text-caption text-faint">
          <TrashIcon className="size-3.5" /> Hausaufgaben verschwinden nach der Abgabe automatisch.
        </p>
      </>
    );
  };

  return (
    <section className="flex flex-col gap-5.5">
      <header className="flex items-end justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-hint font-extrabold text-faint">{items.length > 0 ? `Ab heute · ${items.length} offen` : "Ab heute · nichts offen"}</p>
          <h1 className="text-title text-ink lg:text-hero">Hausaufgaben</h1>
        </div>
        {isDesktop ? (
          <ExamsToolbar query={query} onQuery={setQuery} filter={null} addTarget={addTarget} placeholder="Aufgabe oder Fach" addLabel="Hausaufgabe eintragen" />
        ) : (
          addTarget && (
            <Link to={addTarget} aria-label="Hausaufgabe eintragen" className="grid size-9.5 shrink-0 place-items-center rounded-full bg-accent text-on-accent outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
              <Plus className="size-4.25" />
            </Link>
          )
        )}
      </header>

      <div className="flex min-w-0 flex-col gap-5.5 lg:max-w-exams">
        <ListSwitch className="lg:hidden" />
        <div className="flex items-center gap-3">
          {(items.length > 0 || filterActive) && (
            <ExamChips
              codes={subjectChips(items, filter.subjects)}
              selected={filter.subjects}
              filterActive={false}
              onAll={() => setFilter({ ...filter, subjects: [] })}
              onToggle={(code) => setFilter({ ...filter, subjects: toggleSubject(filter.subjects, code) })}
              onOpenFilter={null}
            />
          )}
          <ListSwitch className="ml-auto hidden lg:grid" />
        </div>

        <PlanBanner resource={resource} onRetry={loadHomework} />
        {body()}
      </div>
    </section>
  );
};

export default Homework;
