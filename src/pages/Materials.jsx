import { useEffect, useState } from "react";
import { Folder, Lock, Plus } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ExamChips from "../components/exams/ExamChips";
import ExamSkeleton from "../components/exams/ExamSkeleton";
import ExamsToolbar from "../components/exams/ExamsToolbar";
import MaterialGroups from "../components/materials/MaterialGroups";
import Button from "../components/ui/Button";
import { FilterIcon } from "../components/ui/icons";
import PageHeader from "../components/ui/PageHeader";
import { PlanBanner, PlanError } from "../components/ui/PlanState";
import StateScreen from "../components/ui/StateScreen";
import { DESKTOP_QUERY, useMediaQuery } from "../shared/hooks/useMediaQuery";
import { useMaterials } from "../shared/store/materialsStore";
import { usePlanStore } from "../shared/store/planStore";
import { subjectName } from "../shared/utils/format";
import { addMaterialTarget, materialChips } from "../shared/utils/materials";
import RoundButton from "../components/ui/RoundButton";

// Пошук на ПК: у назві, предметі й Kürzel
const matches = (item, query) => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [item.title, subjectName(item.subject), item.subject?.code, item.author?.short].some((value) => value?.toLowerCase().includes(q));
};

const linksText = (n) => (n === 1 ? "1 Link" : `${n} Links`);

// «+» на телефоні праворуч від заголовка
const AddButton = ({ to }) => (
  <RoundButton to={to} aria-label="Link teilen" look="grid size-9.5 place-items-center rounded-full bg-accent text-on-accent outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
    <Plus className="size-4.25" />
  </RoundButton>
);

// Порожньо (макет handy-07): що тут буде і хто може додавати
const Empty = ({ addTarget }) => {
  const navigate = useNavigate();
  return (
    <StateScreen icon={Folder} title="Noch keine Materialien" text="Hier landen Links zu Arbeitsblättern, Lösungen und Ordnern – aus Google Drive oder OneDrive, sortiert nach Fach.">
      {addTarget && (
        <Button onClick={() => navigate(addTarget)} className="flex-none">
          <Plus className="size-4" /> Link teilen
        </Button>
      )}
      <p className="text-caption text-faint">Teilen dürfen Lehrkräfte und Codes mit dem Recht „Materialien teilen“.</p>
    </StateScreen>
  );
};

// ─────────────────────────────────────────────────────────────
// Materialien (частина 15, макети handy-01…08, pc-01…07): посилання на Drive за предметами.
// Телефон: Mehr → Materialien; ПК: пункт меню. Фільтр предмета — в адресі: ?filter=Ma
// (не «fach»: цей параметр належить шторкам). Дані — materialsStore (GET /api/materials).
// ─────────────────────────────────────────────────────────────
const Materials = () => {
  const me = usePlanStore((s) => s.me);
  const { items, status, savedAt, error, load, freshId, markFresh } = useMaterials();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const filter = params.get("filter");

  // нове могли додати вчителі: при кожному вході питаємо сервер, старий список лишається.
  // Мітка «Neu» — лише до виходу зі сторінки
  useEffect(() => {
    load();
    return () => markFresh(null);
  }, [load, markFresh]);

  const setFilter = (code) =>
    setParams(
      (prev) => {
        if (code) prev.set("filter", code);
        else prev.delete("filter");
        return prev;
      },
      { replace: true },
    );

  const shown = items.filter((item) => (!filter || item.subject?.code === filter) && matches(item, query));
  const addTarget = addMaterialTarget(me);
  const resource = { status, savedAt, error };

  const body = () => {
    if (status === "error") return <PlanError resource={resource} onRetry={load} title="Materialien konnten nicht geladen werden" />;
    if (items.length === 0 && (status === "loading" || status === "idle")) return <ExamSkeleton />;
    if (items.length === 0) return <Empty addTarget={addTarget} />;
    if (shown.length === 0) {
      return (
        <StateScreen icon={FilterIcon} title="Nichts gefunden" text="Für diesen Filter gibt es keine Links." fill={false}>
          <Button
            onClick={() => {
              setFilter(null);
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
        <MaterialGroups items={shown} freshId={freshId} />
        <p className="flex items-center gap-1.5 text-caption text-faint">
          <Lock className="size-3.5 shrink-0" /> Links öffnen sich in Google Drive oder OneDrive. ORBook speichert nur den Link, keine Dateien.
        </p>
      </>
    );
  };

  const count = items.length > 0 ? linksText(items.length) : null;

  return (
    <section className="flex flex-col gap-5.5">
      {isDesktop ? (
        <header className="flex items-end justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="text-hint font-extrabold text-faint">{count ? `${count} · Google Drive und OneDrive` : "Google Drive und OneDrive"}</p>
            <h1 className="text-hero text-ink">Materialien</h1>
          </div>
          <ExamsToolbar query={query} onQuery={setQuery} filter={null} addTarget={addTarget} placeholder="Titel oder Fach" addLabel="Link teilen" />
        </header>
      ) : (
        <PageHeader backTo="/mehr" eyebrow={count ? `Mehr · ${count}` : "Mehr"} title="Materialien" aside={addTarget && <AddButton to={addTarget} />} />
      )}

      {items.length > 0 && (
        <ExamChips codes={materialChips(items)} selected={filter ? [filter] : []} filterActive={false} onAll={() => setFilter(null)} onToggle={(code) => setFilter(code === filter ? null : code)} onOpenFilter={null} />
      )}

      <PlanBanner resource={resource} onRetry={load} />
      {body()}
    </section>
  );
};

export default Materials;
