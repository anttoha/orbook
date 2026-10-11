import { Info, Share } from "lucide-react";
import { useDay } from "../../shared/hooks/usePlan";
import { useSheet } from "../../shared/hooks/useSheet";
import { cn } from "../../shared/utils/cn";
import { infoParagraphs, longDate, weekdayLong } from "../../shared/utils/format";
import Button from "../ui/Button";
import Sheet from "../ui/Sheet";

// ─────────────────────────────────────────────────────────────
// Шторка «Info zum Tag». Адреса: ?sheet=info&datum=2026-10-07
// Текст школи (day.info) — для ВСІЄЇ школи, показуємо як є.
// ─────────────────────────────────────────────────────────────
const DayInfoSheet = ({ open, onClose, sheet }) => {
  const { openSheet } = useSheet(); // «Teilen» відкриває шторку Teilen
  const { day } = useDay(sheet.datum); // день із тижня

  if (!day?.info.length) return null; // інформації немає — нічого показувати
  const paragraphs = infoParagraphs(day.info); // абзаци (порожній рядок = новий абзац)

  return (
    <Sheet
      open={open}
      onClose={onClose}
      panelLabel="Info zum Tag"
      eyebrow={`${weekdayLong(day.date)}, ${longDate(day.date)}`}
      title="Info zum Tag"
      footer={
        // replace — «Назад» із Teilen не повертає сюди
        <Button onClick={() => openSheet("teilen", { bereich: "heute", datum: day.date }, { replace: true })}>
          <Share className="size-4.5" /> Teilen
        </Button>
      }
    >
      {/* абзаци; останній — сірим на ПК, як на макеті */}
      <div className="flex flex-col gap-3 text-body font-bold text-ink lg:font-medium">
        {paragraphs.map((p, i) => (
          <p key={p} className={cn(i === paragraphs.length - 1 && i > 0 && "lg:text-muted")}>
            {p}
          </p>
        ))}
      </div>
      {/* звідки інформація: «Stand 11:26» — коли школа опублікувала план */}
      <p className="flex items-center gap-2 rounded-2xl bg-sand px-3.5 py-3 text-caption font-bold text-muted lg:text-label lg:font-medium">
        <Info className="size-4 shrink-0" /> Aus dem Vertretungsplan der Schule{day.publishedAt && `, Stand ${day.publishedAt.slice(11, 16)}`}.
      </p>
    </Sheet>
  );
};

export default DayInfoSheet;
