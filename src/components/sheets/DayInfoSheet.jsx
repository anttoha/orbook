import { Info, Share } from "lucide-react";
import { useDay } from "../../shared/hooks/usePlan";
import { useSheet } from "../../shared/hooks/useSheet";
import { usePlanStore } from "../../shared/store/planStore";
import { cn } from "../../shared/utils/cn";
import { infoParagraphs, longDate, weekdayLong } from "../../shared/utils/format";
import DayPlanDetails from "./DayPlanDetails";
import Button from "../ui/Button";
import Sheet from "../ui/Sheet";

// ─────────────────────────────────────────────────────────────
// Шторка «Info zum Tag». Адреса: ?sheet=info&datum=2026-10-07
// Текст школи (day.info) — для ВСІЄЇ школи, показуємо як є.
// ─────────────────────────────────────────────────────────────
const DayInfoSheet = ({ open, onClose, sheet }) => {
  const { openSheet } = useSheet(); // «Teilen» відкриває шторку Teilen
  const { day } = useDay(sheet.datum); // день із тижня
  const shareEnabled = usePlanStore((s) => s.me?.features?.share !== false); // адмін міг вимкнути «Teilen»

  if (!day) return null; // день ще не завантажено
  const paragraphs = infoParagraphs(day.info); // абзаци (порожній рядок = новий абзац)

  return (
    <Sheet
      open={open}
      onClose={onClose}
      panelLabel="Info zum Tag"
      eyebrow={`${weekdayLong(day.date)}, ${longDate(day.date)}`}
      title="Info zum Tag"
      footer={
        shareEnabled && (
          // replace — «Назад» із Teilen не повертає сюди
          <Button onClick={() => openSheet("teilen", { bereich: "heute", datum: day.date }, { replace: true })}>
            <Share className="size-4.5" /> Teilen
          </Button>
        )
      }
    >
      {/* абзаци; останній сірим, як на макеті. Тексту школи може не бути: тоді лишаються тільки подробиці */}
      {paragraphs.length > 0 && (
        <div className="flex flex-col gap-3.5 text-body text-ink">
          {paragraphs.map((p, i) => (
            <p key={p} className={cn(i === paragraphs.length - 1 && i > 0 && "text-muted")}>
              {p}
            </p>
          ))}
        </div>
      )}
      {/* звідки інформація: «Stand 11:26» — коли школа опублікувала план */}
      <p className="flex items-center gap-2.5 rounded-field bg-sand px-3.25 py-3 text-label text-muted">
        <Info className="size-4 shrink-0" /> Aus dem Vertretungsplan der Schule{day.publishedAt && `, Stand ${day.publishedAt.slice(11, 16)}`}.
      </p>
      <DayPlanDetails day={day} />
    </Sheet>
  );
};

export default DayInfoSheet;
