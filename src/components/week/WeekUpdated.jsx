import { useNow } from "../../shared/hooks/useNow";
import { cn } from "../../shared/utils/cn";
import { updatedAgoText } from "../../shared/utils/format";
import { weekCheckSource } from "../../shared/utils/lessons";

// Дрібний рядок «aktualisiert vor 3 Min.» під заголовком тижня: коли сервер востаннє перевіряв план.
// Коли план реально змінився, видно під кожним днем («geändert 07:06»).
const WeekUpdated = ({ days }) => {
  const { now } = useNow();
  const source = weekCheckSource(days);
  if (!source) return null;

  return <p className={cn("-mt-2 text-caption", source.stale ? "text-danger" : "text-faint")}>{updatedAgoText(source.fetchedAt, now)}</p>;
};

export default WeekUpdated;
