import ChangedLine from "../week/ChangedLine";
import Segmented from "../ui/Segmented";
import { useUserStore } from "../../shared/store/userStore";
import { useT } from "../../shared/hooks/useT";
import { cn } from "../../shared/utils/cn";

// Підписи сегмента — самі вже приклад формату
const FORMATS = [
  { value: "weekday", label: "Mi 15:15" },
  { value: "date", label: "15.09." },
  { value: "datetime", label: "15.09. 15:15" },
];

// Приклад тижня для прев'ю (сьогодні — Mi 17.): дні з тими самими полями, що й з сервера.
// Малюємо їх справжнім ChangedLine — тож прев'ю завжди таке, як у тижні
const SAMPLE = [
  { weekday: "Mo", n: "15", date: "2026-09-15", changedAt: "2026-09-12T16:40:00+02:00" },
  { weekday: "Di", n: "16", date: "2026-09-16", changedAt: "2026-09-15T15:15:00+02:00" },
  { weekday: "Mi", n: "17", date: "2026-09-17", changedAt: "2026-09-17T07:08:00+02:00", today: true },
  { weekday: "Do", n: "18", date: "2026-09-18", changedAt: "2026-09-17T06:50:00+02:00" },
  { weekday: "Fr", n: "19", date: "2026-09-19", changedAt: null },
].map((day) => ({ ...day, status: day.changedAt ? "ok" : "not_published", publishedAt: null }));

// Одна плашка дня в прев'ю: «MO / 15 / ⟳ 12.09.» (як DayHeader у тижні, але без посилання)
const PreviewDay = ({ day }) => (
  <div className={cn("flex h-15.5 min-w-0 flex-1 flex-col items-center justify-center rounded-cell", day.today ? "bg-accent text-on-accent" : "bg-paper text-ink")}>
    <span className={cn("text-micro font-bold uppercase", day.today ? "text-today-sub" : "text-faint")}>{day.weekday}</span>
    <span className="text-cell-sm">{day.n}</span>
    <ChangedLine day={day} isToday={day.today} className="h-2.5 max-w-full px-0.5 text-nano leading-none" />
  </div>
);

// ─────────────────────────────────────────────────────────────
// Картка «Plan → Änderung unter dem Tag» у «Darstellung» (частина 22, макет handy-03 / pc-02).
// Вибір діє одразу; прев'ю тижня під сегментом показує, як це виглядатиме.
// ─────────────────────────────────────────────────────────────
const ChangedFormatCard = () => {
  const t = useT();
  const format = useUserStore((s) => s.changedFormat);
  const setFormat = useUserStore((s) => s.setChangedFormat);

  return (
    <section>
      <h2 className="mb-2.5 text-hint font-extrabold text-faint">{t("Plan")}</h2>
      <div className="flex flex-col gap-3 rounded-card bg-card p-3.5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-row text-ink">{t("Änderung unter dem Tag")}</p>
            <p className="mt-0.5 text-caption text-faint">{t("So steht es unter jedem Tag in der Woche.")}</p>
          </div>
          <Segmented label={t("Änderung unter dem Tag")} size="form" options={FORMATS} value={format} onChange={setFormat} className="lg:w-fit" />
        </div>

        <p className="text-caption font-extrabold text-faint">{t("Vorschau")}</p>
        <div aria-hidden="true" className="flex gap-1 lg:gap-2">
          {SAMPLE.map((day) => (
            <PreviewDay key={day.date} day={day} />
          ))}
        </div>
        <p className="text-caption text-faint">{t("Am selben Tag steht nur die Uhrzeit, z. B. 07:08.")}</p>
      </div>
    </section>
  );
};

export default ChangedFormatCard;
