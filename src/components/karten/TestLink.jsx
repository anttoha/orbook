import { Link } from "react-router-dom";
import { useT } from "../../shared/hooks/useT";
import { daysBetween, daysLeftText } from "../../shared/utils/format";
import { shortDay } from "../../shared/utils/lernplan";
import { FlagIcon } from "../ui/icons";

// Тест стопки (макет 43 handy-02): «Vokabeltest · Do 25.09.  in 8 Tagen» → шторка теста
const TestLink = ({ exam, today, compact = false }) => {
  const t = useT();
  const title = exam.topic || exam.type || t("Test");
  return (
    <Link
      to={`/testen?sheet=klausur&id=${exam.id}`}
      className="flex h-14 items-center gap-3 rounded-card bg-card px-4 outline-none transition-[scale] focus-visible:ring-2 focus-visible:ring-accent/50 active:scale-99"
    >
      <FlagIcon className="size-5 shrink-0 text-accent-ink" />
      <span className="min-w-0 flex-1 truncate text-row font-extrabold text-ink">
        {title} · {shortDay(exam.date)}
      </span>
      {!compact && <span className="shrink-0 text-label font-extrabold text-accent-ink">{daysLeftText(daysBetween(today, exam.date))}</span>}
    </Link>
  );
};

export default TestLink;
