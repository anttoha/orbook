import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, Pencil, TriangleAlert } from "lucide-react";
import { useNow } from "../../shared/hooks/useNow";
import { useDay } from "../../shared/hooks/usePlan";
import { usePlanStore } from "../../shared/store/planStore";
import { useUserStore } from "../../shared/store/userStore";
import { cn } from "../../shared/utils/cn";
import { longDate, subjectName, weekdayShort } from "../../shared/utils/format";
import { checkKey, checkReason, planChecks } from "../../shared/utils/muster";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Sheet from "../ui/Sheet";
import SubjectBadge from "../ui/SubjectBadge";
import Liquid from "../ui/Liquid";

// Одна картка: що стояло в уроці → що каже справжній план → кнопки
const CheckCard = ({ item, lessons, onDone }) => {
  const navigate = useNavigate();
  const names = usePlanStore((s) => s.meta?.subjects);
  const moveNote = useUserStore((s) => s.moveNote);
  const dismiss = useUserStore((s) => s.dismissCheck);
  const isNote = item.kind === "note";
  // у нотатки предмет — лише код («En»), у Klausur — { code, name } (name буває null)
  const subject = isNote ? { code: item.note.subject, name: names?.[item.note.subject] ?? null } : item.exam.subject;
  const period = isNote ? item.note.period : item.exam.lesson;
  const reason = checkReason(item, lessons, subjectName(subject));
  const move = () => {
    moveNote(item.note.id, item.target);
    toast.success(`Notiz hängt jetzt an der ${item.target}. Stunde`);
    onDone();
  };
  const keep = () => {
    dismiss(checkKey(item));
    onDone();
  };

  return (
    <Liquid as="article" refract press={false} className="rounded-card bg-card p-3.5">
      <div className="flex items-start gap-3">
        <SubjectBadge subject={subject} size="lg" className="size-10" />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-caption text-faint">
            <Badge variant={isNote ? "changed" : "soft"}>{isNote ? "Notiz" : item.exam.type}</Badge>
            {subjectName(subject)} · {period}. Stunde
          </p>
          <h3 className="mt-1 truncate text-body font-extrabold text-ink">{isNote ? item.note.text : item.exam.topic || item.exam.type}</h3>
        </div>
      </div>

      {/* що каже справжній план */}
      <p className={cn("mt-3 flex items-center gap-2.5 rounded-field px-3 py-2.5 text-label", isNote && item.target ? "bg-tint" : "bg-danger-tint")}>
        {isNote && item.target ? <ArrowRight className="size-4 shrink-0 text-accent-ink" /> : <TriangleAlert className="size-4 shrink-0 text-danger" />}
        <span className="min-w-0 text-muted">
          <span className={cn("font-bold", isNote && item.target ? "text-accent-ink" : "text-danger")}>Echter Plan:</span> {reason}
        </span>
      </p>

      <div className="mt-3 flex gap-2">
        {isNote && item.target && (
          <Button variant="primary" className="h-10.5" onClick={move}>
            <ArrowRight className="size-4" /> In die {item.target}. Stunde
          </Button>
        )}
        {!isNote && item.exam.canEdit && (
          <Button className="h-10.5" onClick={() => navigate(`/testen/${item.exam.id}/bearbeiten`)}>
            <Pencil className="size-4" /> {item.exam.type} ändern
          </Button>
        )}
        <Button className="h-10.5" onClick={keep}>
          So lassen
        </Button>
      </div>
      {!isNote && !item.exam.canEdit && <p className="mt-2.5 text-caption text-faint">Ändern dürfen Lehrkräfte und Editor-Codes.</p>}
    </Liquid>
  );
};

// ─────────────────────────────────────────────────────────────
// Шторка «Einträge prüfen» (макет 19 handy-07, pc-03). Адреса: ?sheet=pruefen&datum=2026-10-05
// Нічого не змінюється без людини: нотатку переносить сам учень, Klausur — той, хто має право.
// ─────────────────────────────────────────────────────────────
const PlanCheckSheet = ({ open, onClose, sheet }) => {
  const { today } = useNow();
  const { day } = useDay(sheet.datum);
  const notes = useUserStore((s) => s.notes);
  const dismissed = useUserStore((s) => s.checkedPlan);
  const items = planChecks(day, notes, dismissed, today);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      desktop="dialog"
      eyebrow={sheet.datum ? `Plan für ${weekdayShort(sheet.datum)}, ${longDate(sheet.datum)}` : null}
      title="Einträge prüfen"
    >
      {items.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          <p className="text-body-sm text-muted">Diese Einträge hängen an Stunden, die sich geändert haben. Nichts passiert ohne dich.</p>
          {items.map((item) => (
            // остання картка сама закриває шторку
            <CheckCard key={checkKey(item)} item={item} lessons={day.lessons} onDone={() => items.length === 1 && onClose()} />
          ))}
        </div>
      ) : (
        <p className="text-body-sm text-muted">Alles passt zum Plan.</p>
      )}
    </Sheet>
  );
};

export default PlanCheckSheet;
