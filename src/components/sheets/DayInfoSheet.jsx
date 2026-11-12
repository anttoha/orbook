import { Info, Share } from "lucide-react";
import { useDay } from "../../shared/hooks/usePlan";
import { useSheet } from "../../shared/hooks/useSheet";
import { usePlanStore } from "../../shared/store/planStore";
import { cn } from "../../shared/utils/cn";
import { infoParagraphs, longDate, weekdayLong } from "../../shared/utils/format";
import { DESKTOP_QUERY, useMediaQuery } from "../../shared/hooks/useMediaQuery";
import { useTicker } from "../../shared/hooks/useTicker";
import { agoText } from "../../shared/utils/liveText";
import DayHistory from "../history/DayHistory";
import DayHistoryCard from "../history/DayHistoryCard";
import LiveDot from "../live/LiveDot";
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
  const isDesktop = useMediaQuery(DESKTOP_QUERY); // ПК: лента «Verlauf» сразу в панели (часть 26, макет pc-01)

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
      {isDesktop && day.status === "ok" ? <InlineHistory day={day} /> : <DayHistoryCard day={day} />}
    </Sheet>
  );
};

// ПК: заголовок «Verlauf des Tages» с «● Live · geprüft vor 20 Sek.» и лента под ним
const InlineHistory = ({ day }) => {
  const now = useTicker();
  const live = usePlanStore((s) => s.live) === "live";
  const ago = agoText(day.checkedAt ?? day.fetchedAt, now);
  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <h3 className="flex-1 text-label font-extrabold text-faint">Verlauf des Tages</h3>
        <LiveDot on={live && !day.stale} />
        <span className="text-caption text-faint">
          <span className={live ? "font-extrabold text-ok" : "font-extrabold text-muted"}>{live ? "Live" : "Nicht live"}</span>
          {ago && ` · geprüft ${ago}`}
        </span>
      </div>
      <DayHistory date={day.date} withIntro={false} />
    </section>
  );
};

export default DayInfoSheet;
