import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ExamChips from "../components/exams/ExamChips";
import ExamRow from "../components/exams/ExamRow";
import ExamSkeleton from "../components/exams/ExamSkeleton";
import ExamsAside from "../components/exams/ExamsAside";
import ExamsToolbar from "../components/exams/ExamsToolbar";
import ListSwitch from "../components/homework/ListSwitch";
import Button from "../components/ui/Button";
import { FilterIcon, FlagIcon, KeyIcon } from "../components/ui/icons";
import { PlanBanner, PlanError } from "../components/ui/PlanState";
import Segmented from "../components/ui/Segmented";
import StateScreen from "../components/ui/StateScreen";
import { usePastExams } from "../shared/hooks/useExams";
import { useHotkeys } from "../shared/hooks/useHotkeys";
import { useListMode } from "../shared/hooks/useListMode";
import { DESKTOP_QUERY, useMediaQuery } from "../shared/hooks/useMediaQuery";
import { useNow } from "../shared/hooks/useNow";
import { useSheet } from "../shared/hooks/useSheet";
import { useExamFilter } from "../shared/store/examFilterStore";
import { usePlanStore } from "../shared/store/planStore";
import { useUserStore } from "../shared/store/userStore";
import { addExamTarget } from "../shared/utils/examRules";
import Appointments from "./Appointments";
import Aufgaben from "./Aufgaben";
import { filterExams, groupExams, isFilterActive, searchExams, subjectChips, toggleSubject } from "../shared/utils/exams";
import PillButton from "../components/ui/PillButton";

// «Ab heute · 5 geplant». Поки записів немає — без числа
const eyebrowText = (past, count) => {
  if (past) return count > 0 ? `Vergangen · ${count}` : "Vergangen";
  return count > 0 ? `Ab heute · ${count} geplant` : "Ab heute";
};

// «Kommend · 5» — число, тільки коли список уже прийшов
const withCount = (label, count) => (count > 0 ? `${label} · ${count}` : label);

// ─────────────────────────────────────────────────────────────
// Сторінка Klausuren. /testen
// Дані: GET /api/exams (planStore), минулі — з «Vergangene anzeigen» (на ПК одразу: для числа «Vergangen · 12»).
// Фільтр і пошук рахуються на пристрої (shared/utils/exams.js).
// ПК (макет 14): пошук, фільтр під кнопкою і «Klausur eintragen» у шапці, «Kommend | Vergangen»,
// а на ширині від 1440px праворуч картка «2 Tage bis» і календар.
// ─────────────────────────────────────────────────────────────
const ExamList = () => {
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
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [query, setQuery] = useState(""); // пошук (ПК)
  const [filterOpen, setFilterOpen] = useState(false); // випадне вікно фільтра (ПК)

  // Запис могли додати однокласники: при кожному вході питаємо сервер, старий список лишається на екрані
  useEffect(() => {
    loadExams();
  }, [loadExams]);
  usePastExams(filter.past || isDesktop);
  useHotkeys({ f: () => setFilterOpen(true) }, isDesktop); // F — фільтр (на ПК)

  const list = filter.past ? pastExams.exams : upcoming; // що показуємо: минулі або майбутні
  const resource = filter.past ? pastExams : examsState; // стан цього списку
  const reload = filter.past ? loadPastExams : loadExams;
  const shown = searchExams(filterExams(list, filter, today), query);
  const filterActive = isFilterActive(filter) || query.trim() !== "";
  const addTarget = addExamTarget(me); // куди веде «+»
  // минулі йдуть однією групою: поділ на тижні в них не працює
  const groups = filter.past ? [{ title: "Vergangen", exams: shown }] : groupExams(shown, today);

  const body = () => {
    if (resource.status === "error") return <PlanError resource={resource} onRetry={reload} title="Tests konnten nicht geladen werden" />;
    if (list.length === 0 && resource.status === "loading") return <ExamSkeleton />;
    if (list.length === 0 && !filterActive) {
      return (
        <StateScreen icon={FlagIcon} title="Keine Tests in Sicht" text="Sobald jemand mit Editor-Code einen Test einträgt, steht er hier — mit Countdown.">
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
          <Button
            onClick={() => {
              resetFilter();
              setQuery("");
            }}
            className="flex-none"
          >
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

  // «Kommend | Vergangen» праворуч від чипів (ПК)
  const scope = (
    <Segmented
      label="Zeitraum"
      size="form"
      className="shrink-0"
      value={filter.past ? "past" : "upcoming"}
      options={[
        { value: "upcoming", label: withCount("Kommend", upcoming.length) },
        { value: "past", label: withCount("Vergangen", pastExams.exams.length) },
      ]}
      onChange={(value) => setFilter({ ...filter, past: value === "past" })}
    />
  );

  return (
    <section className="flex flex-col gap-5.5">
      <header className="flex items-end justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-hint font-extrabold text-faint">{eyebrowText(filter.past, list.length)}</p>
          <h1 className="text-title text-ink lg:text-hero">Tests</h1>
        </div>
        {isDesktop ? (
          <ExamsToolbar query={query} onQuery={setQuery} filter={{ open: filterOpen, onOpenChange: setFilterOpen, active: isFilterActive(filter) }} addTarget={addTarget} />
        ) : (
          addTarget && (
            <PillButton glass="filled" size="sm" to={addTarget} aria-label="Test eintragen" className="grid size-9.5 shrink-0 place-items-center rounded-full bg-accent text-on-accent outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
              <Plus className="size-4.25" />
            </PillButton>
          )
        )}
      </header>

      <div className="flex items-start gap-9">
        <div className="flex min-w-0 flex-1 flex-col gap-5.5 lg:max-w-exams">
          <ListSwitch className="lg:w-112.5 lg:self-start" />
          {/* без записів і без фільтра чипам нічого показувати (макет «Klausuren · leer») */}
          <div className="flex items-center gap-3">
            {(list.length > 0 || filterActive) && (
              <ExamChips
                codes={subjectChips(list, filter.subjects)}
                selected={filter.subjects}
                filterActive={isFilterActive(filter)}
                onAll={() => setFilter({ ...filter, subjects: [] })}
                onToggle={(code) => setFilter({ ...filter, subjects: toggleSubject(filter.subjects, code) })}
                onOpenFilter={isDesktop ? null : () => openSheet("klausurfilter")}
              />
            )}
            {/* ПК: «Kommend | Vergangen» праворуч від чипів */}
            {(list.length > 0 || filterActive) && <div className="ml-auto hidden lg:block">{scope}</div>}
          </div>

          <PlanBanner resource={resource} onRetry={reload} />
          {body()}
        </div>

        <ExamsAside next={upcoming[0] ?? null} all={[...upcoming, ...pastExams.exams]} />
      </div>
    </section>
  );
};

// Вкладка Klausuren: три списки під одним перемикачем (частини 14 і 18). Окремі компоненти — у них різні хуки
const LISTS = { exams: ExamList, homework: Aufgaben, appointments: Appointments };
const Tests = () => {
  const List = LISTS[useListMode()];
  return <List />;
};

export default Tests;
