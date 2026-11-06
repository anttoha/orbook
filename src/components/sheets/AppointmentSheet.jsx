import { Calendar, CalendarDays, Share } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppointment } from "../../shared/hooks/useAppointments";
import { useNow } from "../../shared/hooks/useNow";
import { usePlanStore } from "../../shared/store/planStore";
import { cn } from "../../shared/utils/cn";
import { appointmentIcs, appointmentText, countdown, dateText, isFree, timeText } from "../../shared/utils/appointments";
import { subjectName } from "../../shared/utils/format";
import { shareText } from "../../shared/utils/share";
import AppointmentBadge from "../appointments/AppointmentBadge";
import { PlaceAndNote, SourceNote } from "../appointments/AppointmentDetails";
import Button from "../ui/Button";
import { PencilIcon } from "../ui/icons";
import { Skeleton } from "../ui/PlanState";
import Sheet from "../ui/Sheet";
import SubjectBadge from "../ui/SubjectBadge";

// «12 · Tage bis zum Ausflug / Montag, 29. September · 07:45–15:00» (як картка у вікні Klausur)
const Countdown = ({ item, today }) => {
  const { number, label } = countdown(item, today);
  return (
    <div className="flex h-19 items-center gap-3.5 rounded-card border border-accent bg-card px-3.75">
      {number !== null && <span className="text-countdown text-accent-ink">{number}</span>}
      <div className="min-w-0">
        <p className="text-body font-bold text-ink">{label}</p>
        <p className="mt-0.5 truncate text-hint text-muted">
          {dateText(item)}
          {timeText(item) && ` · ${timeText(item)}`}
        </p>
      </div>
    </div>
  );
};

// Кружечок ліворуч: курсовий — предмет, для всього класу — календар (зелений для вільного дня)
const Icon = ({ item }) =>
  item.subject ? (
    <SubjectBadge subject={item.subject} size="lg" />
  ) : (
    <span className={cn("grid size-11 shrink-0 place-items-center rounded-full", isFree(item) ? "bg-ok-tint text-ok" : "bg-tint text-accent-ink")}>
      <CalendarDays className="size-5" />
    </span>
  );

// «Kalender»: файл .ics збираємо на пристрої (у API для термінів його немає)
const saveIcs = (item) => {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const url = URL.createObjectURL(new Blob([appointmentIcs(item, stamp)], { type: "text/calendar" }));
  const link = Object.assign(document.createElement("a"), { href: url, download: `termin-${item.id}.ics` });
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// ─────────────────────────────────────────────────────────────
// Вікно терміну (макети 18 handy-02, pc-02). Адреса: ?sheet=termin&id=4.
// «Bearbeiten» — лише автору (canEdit); видалення — у формі, як у Klausur.
// ─────────────────────────────────────────────────────────────
const AppointmentSheet = ({ open, onClose, sheet }) => {
  const { item, status } = useAppointment(sheet.id);
  const { today } = useNow();
  const navigate = useNavigate();
  const shareEnabled = usePlanStore((s) => s.me?.features?.share !== false);

  if (!item) {
    return (
      <Sheet open={open} onClose={onClose} panelLabel="Termin" title="Termin">
        {status === "loading" ? <Skeleton className="h-19 rounded-card" /> : <p className="text-body-sm text-muted">Diesen Termin gibt es nicht (mehr).</p>}
      </Sheet>
    );
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      panelLabel="Termin"
      eyebrow={
        <span className="flex items-center gap-2">
          <AppointmentBadge item={item} />
          <span className="truncate text-hint font-normal">{item.subject ? subjectName(item.subject) : "Ganze Klasse"}</span>
        </span>
      }
      title={item.title}
      titleClassName="text-brand"
      hideClose
      icon={<Icon item={item} />}
      footer={
        <div className="flex w-full flex-col gap-3.5">
          <div className="flex gap-2">
            <Button onClick={() => saveIcs(item)}>
              <Calendar className="size-4" /> Kalender
            </Button>
            {shareEnabled && (
              <Button onClick={() => shareText(appointmentText(item))}>
                <Share className="size-4" /> Teilen
              </Button>
            )}
          </div>
          {item.canEdit && (
            <Button variant="primary" className="flex-none" onClick={() => navigate(`/testen/termine/${item.id}/bearbeiten`)}>
              <PencilIcon className="size-4" /> Bearbeiten
            </Button>
          )}
        </div>
      }
    >
      <Countdown item={item} today={today} />
      <PlaceAndNote item={item} />
      <SourceNote item={item} />
    </Sheet>
  );
};

export default AppointmentSheet;
