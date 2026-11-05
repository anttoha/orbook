import { useNow } from "../../shared/hooks/useNow";
import { cn } from "../../shared/utils/cn";
import { planMomentText } from "../../shared/utils/format";

const Row = ({ label, children, warning = false }) => (
  <div className="flex items-center justify-between gap-4 py-3">
    <dt className="text-body-sm font-bold text-faint">{label}</dt>
    <dd className={cn("text-body-sm font-bold", warning ? "text-danger" : "text-ink")}>{children}</dd>
  </div>
);

// Подробиці у вікні «Info zum Tag»: три різні моменти життя плану цього дня.
// Plan geändert — змінився зміст, Veröffentlicht — школа випустила файл,
// Zuletzt geprüft — наш сервер востаннє його перевіряв (червоним, якщо перевірка давно не вдавалась).
const DayPlanDetails = ({ day }) => {
  const { today } = useNow();

  return (
    <dl className="divide-y divide-hair rounded-card bg-card px-3.5">
      <Row label="Plan geändert">{planMomentText(day.changedAt, today)}</Row>
      <Row label="Veröffentlicht">{planMomentText(day.publishedAt, today)}</Row>
      <Row label="Zuletzt geprüft" warning={day.stale}>
        {planMomentText(day.fetchedAt, today)}
      </Row>
    </dl>
  );
};

export default DayPlanDetails;
