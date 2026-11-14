import { useUserStore } from "../../shared/store/userStore";
import { useT } from "../../shared/hooks/useT";
import { cn } from "../../shared/utils/cn";
import LessonCell from "../week/LessonCell";

// Приклад: два уроки Mo–Mi (сьогодні — Mi), як на макеті 30 · handy-13
const lesson = (code, name, teacher, room) => ({ status: "normal", subject: { code, name }, teacher, room, course: null, examId: null });
const DE = lesson("De", "Deutsch", "Web", "102");
const MA = lesson("Ma", "Mathe", "Mü", "108");
const PH = lesson("Ph", "Physik", "Ric", "301");
const DAYS = ["Mo", "Di", "Mi"];
const ROWS = [
  { period: 1, start: "07:30", lessons: [DE, MA, DE] },
  { period: 2, start: "08:20", lessons: [MA, PH, MA] },
];

// ─────────────────────────────────────────────────────────────
// «Vorschau» на сторінці «Stundenplan» (частина 30b): справжні клітинки тижня (LessonCell)
// з поточними налаштуваннями — тому прев'ю завжди таке, як у тижні.
// ─────────────────────────────────────────────────────────────
const PlanPreview = ({ plan }) => {
  const t = useT();
  const overrides = useUserStore((s) => s.colorOverrides); // свої кольори предметів
  return (
    <section className="rounded-card bg-card p-3.5">
      <h2 className="mb-2 text-hint font-extrabold text-faint">{t("Vorschau")}</h2>
      <div aria-hidden="true" className="grid grid-cols-[1.75rem_repeat(3,minmax(0,1fr))] gap-1">
        <span />
        {DAYS.map((day, i) => (
          <span key={day} className={cn("text-center text-micro font-extrabold uppercase", i === 2 ? "text-accent-ink" : "text-faint")}>
            {t(day)}
          </span>
        ))}
        {ROWS.map((row) => (
          <div key={row.period} className="contents">
            <span className="flex flex-col items-center justify-center gap-0.5">
              <span className="text-hint leading-none font-bold text-ink">{row.period}</span>
              {plan.showTimes && <span className="text-nano leading-none text-faint">{row.start}</span>}
            </span>
            {row.lessons.map((item, i) => (
              <div key={i} className="flex min-h-13 flex-col">
                <LessonCell lesson={item} plan={plan} overrides={overrides} tabIndex={-1} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};

export default PlanPreview;
