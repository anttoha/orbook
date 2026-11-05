import { Calendar, Share } from "lucide-react";
import { examIcsUrl } from "../../shared/api/api";
import { useExam } from "../../shared/hooks/useExams";
import { usePlanStore } from "../../shared/store/planStore";
import { useUserStore } from "../../shared/store/userStore";
import { cn } from "../../shared/utils/cn";
import { examCountdown } from "../../shared/utils/exams";
import { longDate, subjectCode, subjectName, weekdayLong } from "../../shared/utils/format";
import { fachClasses } from "../../shared/utils/lessons";
import { examText, shareText } from "../../shared/utils/share";
import ExamBadge from "../exams/ExamBadge";
import Button from "../ui/Button";
import { ShieldIcon } from "../ui/icons";
import { Skeleton } from "../ui/PlanState";
import Sheet from "../ui/Sheet";

// Скільки днів лишилось. Минула запис без рамки: вона вже нічого не чекає
const Countdown = ({ exam }) => {
  const { number, label } = examCountdown(exam);
  return (
    <div className={cn("flex h-19 items-center gap-3.5 rounded-card bg-card px-3.75", exam.daysLeft >= 0 && "border border-accent")}>
      {number !== null && <span className="text-countdown text-accent-ink">{number}</span>}
      <div className="min-w-0">
        <p className="text-body font-bold text-ink">{label}</p>
        <p className="mt-0.5 text-hint text-muted">
          {weekdayLong(exam.date)}, {longDate(exam.date)}
          {exam.lesson && ` · ${exam.lesson}. Stunde`}
        </p>
      </div>
    </div>
  );
};

// Вікно без запису: вантажиться, не знайдена або помилка
const ExamPlaceholder = ({ open, onClose, status, error }) => (
  <Sheet open={open} onClose={onClose} panelLabel="Klausur" title="Klausur">
    {status === "loading" ? <Skeleton className="h-19 rounded-card" /> : <p className="text-body-sm text-muted">{status === "missing" ? "Diese Klausur gibt es nicht (mehr)." : error?.message}</p>}
  </Sheet>
);

// ─────────────────────────────────────────────────────────────
// Вікно Klausur. Адреса: ?sheet=klausur&id=12 (посилання можна переслати).
// «Bearbeiten» з'явиться разом із формою в частині 08.
// ─────────────────────────────────────────────────────────────
const ExamSheet = ({ open, onClose, sheet }) => {
  const { exam, status, error } = useExam(sheet.id);
  const overrides = useUserStore((s) => s.colorOverrides); // свої кольори предметів
  const shareEnabled = usePlanStore((s) => s.me?.features?.share !== false); // адмін міг вимкнути «Teilen»

  if (!exam) return <ExamPlaceholder open={open} onClose={onClose} status={status} error={error} />;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      panelLabel="Klausur"
      eyebrow={
        <span className="flex items-center gap-2">
          <ExamBadge type={exam.type} />
          <span className="truncate text-hint font-normal">{subjectName(exam.subject)}</span>
        </span>
      }
      title={exam.topic || subjectName(exam.subject)}
      titleClassName="text-brand"
      hideClose
      icon={<span className={cn("grid size-11 shrink-0 place-items-center rounded-full text-note font-black", fachClasses(exam.subject?.code, overrides))}>{subjectCode(exam.subject)}</span>}
      footer={
        <>
          <Button href={examIcsUrl(exam.id)} download>
            <Calendar className="size-4" /> Kalender
          </Button>
          {shareEnabled && (
            <Button onClick={() => shareText(examText(exam))}>
              <Share className="size-4" /> Teilen
            </Button>
          )}
        </>
      }
    >
      <Countdown exam={exam} />

      <div className="flex gap-2.5 rounded-field bg-sand px-3.25 py-3 text-label text-muted">
        <ShieldIcon className="size-4 shrink-0" />
        <p>Nur Fach, Datum, Stunde und Thema — ohne Namen.</p>
      </div>
    </Sheet>
  );
};

export default ExamSheet;
