import { useEffect, useState } from "react";
import { CalendarDays, Plus } from "lucide-react";
import AppointmentRow from "../components/appointments/AppointmentRow";
import AppointmentsAside from "../components/appointments/AppointmentsAside";
import ExamSkeleton from "../components/exams/ExamSkeleton";
import ExamsToolbar from "../components/exams/ExamsToolbar";
import ListSwitch from "../components/homework/ListSwitch";
import { TrashIcon } from "../components/ui/icons";
import { PlanBanner, PlanError } from "../components/ui/PlanState";
import StateScreen from "../components/ui/StateScreen";
import { useAppointments } from "../shared/hooks/useAppointments";
import { DESKTOP_QUERY, useMediaQuery } from "../shared/hooks/useMediaQuery";
import { useNow } from "../shared/hooks/useNow";
import { useSheet } from "../shared/hooks/useSheet";
import { useAppointmentStore } from "../shared/store/appointmentsStore";
import { usePlanStore } from "../shared/store/planStore";
import { addAppointmentTarget, groupAppointments, kindInfo, upcomingAppointments } from "../shared/utils/appointments";
import { subjectName } from "../shared/utils/format";
import PillButton from "../components/ui/PillButton";

// Пошук на ПК: у назві, місці, виді, предметі й Kürzel
const matches = (item, query) => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [item.title, item.place, kindInfo(item.kind).label, item.subject && subjectName(item.subject), item.author?.short].some((value) => value?.toLowerCase().includes(q));
};

// ─────────────────────────────────────────────────────────────
// Termine — третя частина вкладки Klausuren (/testen?liste=termine, макети 18 handy-01, pc-01).
// Дані: GET /api/appointments (appointmentsStore); курсові терміни — лише з предметами учня.
// ─────────────────────────────────────────────────────────────
const Appointments = () => {
  const { today } = useNow();
  const { openSheet } = useSheet();
  const me = usePlanStore((s) => s.me);
  const { items: visible } = useAppointments();
  const resource = useAppointmentStore((s) => s);
  const load = useAppointmentStore((s) => s.load);
  const freshId = useAppointmentStore((s) => s.freshId);
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [query, setQuery] = useState("");

  // нове могли внести вчителі чи школа: при кожному вході питаємо сервер, старий список лишається
  useEffect(() => {
    load();
  }, [load]);

  const items = upcomingAppointments(visible, today);
  const shown = items.filter((item) => matches(item, query));
  const addTarget = addAppointmentTarget(me);

  const body = () => {
    if (resource.status === "error") return <PlanError resource={resource} onRetry={load} title="Termine konnten nicht geladen werden" />;
    if (items.length === 0 && (resource.status === "loading" || resource.status === "idle")) return <ExamSkeleton />;
    if (items.length === 0) return <StateScreen icon={CalendarDays} title="Keine Termine" text="Ausflüge, Elternabende und freie Tage stehen hier, sobald die Schule oder eine Lehrkraft sie einträgt." />;
    if (shown.length === 0) return <StateScreen icon={CalendarDays} title="Nichts gefunden" text="Kein Termin passt zur Suche." fill={false} />;
    return (
      <>
        {groupAppointments(shown, today).map((group) => (
          <section key={group.title} className="flex flex-col gap-2">
            <h2 className="mb-0.75 text-hint font-extrabold text-faint">{group.title}</h2>
            {group.items.map((item) => (
              <AppointmentRow key={item.id} item={item} today={today} highlight={item.id === shown[0].id && item.id !== freshId} fresh={item.id === freshId} onClick={() => openSheet("termin", { id: item.id })} />
            ))}
          </section>
        ))}
        <p className="flex items-center gap-1.5 text-caption text-faint">
          <TrashIcon className="size-3.5" /> Vergangene Termine verschwinden nach einiger Zeit automatisch.
        </p>
      </>
    );
  };

  return (
    <section className="flex flex-col gap-5.5">
      <header className="flex items-end justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-hint font-extrabold text-faint">{items.length > 0 ? `Ab heute · ${items.length} ${items.length === 1 ? "Termin" : "Termine"}` : "Ab heute · nichts geplant"}</p>
          <h1 className="text-title text-ink lg:text-hero">Termine</h1>
        </div>
        {isDesktop ? (
          <ExamsToolbar query={query} onQuery={setQuery} filter={null} addTarget={addTarget} placeholder="Titel oder Ort" addLabel="Termin eintragen" />
        ) : (
          addTarget && (
            <PillButton glass="filled" size="sm" to={addTarget} aria-label="Termin eintragen" className="grid size-9.5 shrink-0 place-items-center rounded-full bg-accent text-on-accent outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
              <Plus className="size-4.25" />
            </PillButton>
          )
        )}
      </header>

      <div className="flex items-start gap-9">
        <div className="flex min-w-0 flex-1 flex-col gap-5.5 lg:max-w-exams">
          <ListSwitch className="lg:w-112.5 lg:self-start" />
          <PlanBanner resource={resource} onRetry={load} />
          {body()}
        </div>
        <AppointmentsAside next={items[0] ?? null} items={visible} />
      </div>
    </section>
  );
};

export default Appointments;
