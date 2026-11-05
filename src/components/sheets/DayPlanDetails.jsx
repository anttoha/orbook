import { useNow } from "../../shared/hooks/useNow";
import { cn } from "../../shared/utils/cn";
import { planMomentText } from "../../shared/utils/format";

const Row = ({ label, children, warning = false }) => (
  <div className="flex py-3">
    <dt className="w-32 shrink-0 text-row text-faint">{label}</dt>
    <dd className={cn("min-w-0 flex-1 text-row", warning ? "text-danger" : "text-ink")}>{children}</dd>
  </div>
);

// Подробиці у вікні «Info zum Tag»: три різні моменти життя плану цього дня.
// Plan geändert — змінився зміст, Veröffentlicht — школа випустила файл,
// Zuletzt geprüft — наш сервер востаннє його перевіряв (червоним, якщо перевірка давно не вдавалась).
const DayPlanDetails = ({ day }) => {
  const { today } = useNow();

  return (
    <dl className="divide-y divide-hair">
      <Row label="Plan geändert">{planMomentText(day.changedAt, today)}</Row>
      <Row label="Veröffentlicht">{planMomentText(day.publishedAt, today)}</Row>
      <Row label="Zuletzt geprüft" warning={day.stale}>
        {planMomentText(day.fetchedAt, today)}
      </Row>
    </dl>
  );
};

export default DayPlanDetails;
