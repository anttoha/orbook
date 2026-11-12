import { cn } from "../../shared/utils/cn";
import { examWhen, subjectName } from "../../shared/utils/format";
import { movedFromText } from "../../shared/utils/entries";
import Badge from "../ui/Badge";
import MovedLine from "../entries/MovedLine";
import ExamBadge from "./ExamBadge";
import ExamDateTile from "./ExamDateTile";

// ─────────────────────────────────────────────────────────────
// Рядок списку Tests (часть 24: перенесённый — VERSCHOBEN и «von Mi 17.09., 3. Std – fiel aus»):
//   [19 FR]  KLAUSUR Mathe · 1. Std           in 2 Tagen
//            Quadratische Funktionen
// highlight — найближча: фіолетова рамка і фіолетове «in 2 Tagen»
// ─────────────────────────────────────────────────────────────
const ExamRow = ({ exam, overrides, highlight, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn("flex w-full items-center gap-3 rounded-card bg-card px-3 py-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent/50", highlight && "border border-accent")}
  >
    <ExamDateTile exam={exam} overrides={overrides} />

    <span className="min-w-0 flex-1">
      <span className="flex items-center gap-1.75">
        <ExamBadge type={exam.type} />
        {exam.movedFrom && <Badge variant="changed">Verschoben</Badge>}
        <span className="truncate text-note text-faint">
          {subjectName(exam.subject)}
          {exam.lesson && ` · ${exam.lesson}. Std`}
        </span>
      </span>
      {/* тема буває порожньою: тоді назва предмета */}
      <span className="mt-1 block truncate text-row font-extrabold text-ink">{exam.topic || subjectName(exam.subject)}</span>
      {movedFromText(exam) && <MovedLine>{movedFromText(exam)} – fiel aus</MovedLine>}
    </span>

    <span className={cn("shrink-0 text-caption font-bold", highlight ? "text-accent-ink" : "text-faint")}>{examWhen(exam)}</span>
  </button>
);

export default ExamRow;
