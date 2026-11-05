import { useEffect } from "react";
import { Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ExamChips from "../components/exams/ExamChips";
import ExamRow from "../components/exams/ExamRow";
import ExamSkeleton from "../components/exams/ExamSkeleton";
import Button from "../components/ui/Button";
import { FilterIcon, FlagIcon, KeyIcon } from "../components/ui/icons";
import { PlanBanner, PlanError } from "../components/ui/PlanState";
import StateScreen from "../components/ui/StateScreen";
import { usePastExams } from "../shared/hooks/useExams";
import { useNow } from "../shared/hooks/useNow";
import { useSheet } from "../shared/hooks/useSheet";
import { useExamFilter } from "../shared/store/examFilterStore";
import { usePlanStore } from "../shared/store/planStore";
import { useUserStore } from "../shared/store/userStore";
import { addExamTarget } from "../shared/utils/examRules";
import { filterExams, groupExams, isFilterActive, subjectChips, toggleSubject } from "../shared/utils/exams";

// «Ab heute · 5 geplant». Поки записів немає — без числа
const eyebrowText = (past, count) => {
  if (past) return count > 0 ? `Vergangen · ${count}` : "Vergangen";
  return count > 0 ? `Ab heute · ${count} geplant` : "Ab heute";
};

// ─────────────────────────────────────────────────────────────
// Сторінка Klausuren. /testen
// Дані: GET /api/exams (planStore), минулі — лише з «Vergangene anzeigen».
// Фільтр рахується на пристрої (shared/utils/exams.js).
// ─────────────────────────────────────────────────────────────
const Tests = () => {
  const { today } = useNow();
  const { openSheet } = useSheet();
  const navigate = useNavigate();
  const me = usePlanStore((s) => s.me);
  const upcoming = usePlanStore((s) => s.exams);
  const examsState = usePlanStore((s) => s.examsState);
  const pastExams = usePlanStore((s) => s.pastExams);
  const loadExams = usePlanStore((s) => s.loadExams);
  const loadPastExams = usePlanStore((s) => s.loadPastExams);
  const overrides = useUserStore((s) => s.colorOverrides);
  const filter = useExamFilter((s) => s.filter);
  const setFilter = useExamFilter((s) => s.setFilter);
  const resetFilter = useExamFilter((s) => s.resetFilter);

  // Запис могли додати однокласники: при кожному вході питаємо сервер, старий список лишається на екрані
  useEffect(() => {
    loadExams();
  }, [loadExams]);
  usePastExams(filter.past);

  const list = filter.past ? pastExams.exams : upcoming; // що показуємо: минулі або майбутні
  const resource = filter.past ? pastExams : examsState; // стан цього списку
  const reload = filter.past ? loadPastExams : loadExams;
  const shown = filterExams(list, filter, today);
  const filterActive = isFilterActive(filter);
  const addTarget = addExamTarget(me); // куди веде «+»
  // минулі йдуть однією групою: поділ на тижні в них не працює
  const groups = filter.past ? [{ title: "Vergangen", exams: shown }] : groupExams(shown, today);

  const body = () => {
    if (resource.status === "error") return <PlanError resource={resource} onRetry={reload} title="Klausuren konnten nicht geladen werden" />;
    if (list.length === 0 && resource.status === "loading") return <ExamSkeleton />;
    if (list.length === 0 && !filterActive) {
      return (
        <StateScreen icon={FlagIcon} title="Keine Klausuren in Sicht" text="Sobald jemand mit Editor-Code eine Klausur einträgt, steht sie hier — mit Countdown.">
          {!me?.editor && (
            <Button onClick={() => navigate("/editor-code")} className="flex-none">
              <KeyIcon className="size-4" /> Editor-Code eingeben
            </Button>
          )}
        </StateScreen>
      );
    }
    if (shown.length === 0) {
      return (
        <StateScreen icon={FilterIcon} title="Nichts gefunden" text="Für diesen Filter gibt es keine Einträge." fill={false}>
          <Button onClick={resetFilter} className="flex-none">
            Filter zurücksetzen
          </Button>
        </StateScreen>
      );
    }
    return groups.map((group) => (
      <section key={group.title} className="flex flex-col gap-2">
        <h2 className="mb-0.75 text-hint font-extrabold text-faint">{group.title}</h2>
        {group.exams.map((exam) => (
          <ExamRow key={exam.id} exam={exam} overrides={overrides} highlight={!filter.past && exam.id === shown[0].id} onClick={() => openSheet("klausur", { id: exam.id })} />
        ))}
      </section>
    ));
  };

  return (
    <section className="flex flex-col gap-5.5 lg:max-w-186">
      <header className="flex flex-col gap-3.5">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="text-hint font-extrabold text-faint">{eyebrowText(filter.past, list.length)}</p>
            <h1 className="text-title text-ink lg:text-hero">Klausuren</h1>
          </div>
          {addTarget && (
            <Link to={addTarget} aria-label="Klausur eintragen" className="grid size-9.5 shrink-0 place-items-center rounded-full bg-accent text-on-accent outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
              <Plus className="size-4.25" />
            </Link>
          )}
        </div>
        {/* без записів і без фільтра чипам нічого показувати (макет «Klausuren · leer») */}
        {(list.length > 0 || filterActive) && (
          <ExamChips
            codes={subjectChips(list, filter.subjects)}
            selected={filter.subjects}
            filterActive={filterActive}
            onAll={() => setFilter({ ...filter, subjects: [] })}
            onToggle={(code) => setFilter({ ...filter, subjects: toggleSubject(filter.subjects, code) })}
            onOpenFilter={() => openSheet("klausurfilter")}
          />
        )}
      </header>

      <PlanBanner resource={resource} onRetry={reload} />
      {body()}
    </section>
  );
};

export default Tests;
