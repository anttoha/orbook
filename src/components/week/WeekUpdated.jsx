import { useNow } from "../../shared/hooks/useNow";
import { cn } from "../../shared/utils/cn";
import { updatedAgoText } from "../../shared/utils/format";
import { weekCheckSource } from "../../shared/utils/lessons";
import RefreshButton from "./RefreshButton";

// Дрібний рядок «aktualisiert vor 3 Min.» під заголовком тижня: коли сервер востаннє перевіряв план.
// Коли план реально змінився, видно під кожним днем («geändert 07:06»).
const WeekUpdated = ({ days }) => {
  const { now } = useNow();
  const source = weekCheckSource(days);
  if (!source) return null;

  // поруч — «Neu laden»: оновити план, не шукаючи в меню
  return (
    <div className="-mt-2 flex items-center gap-1">
      <p className={cn("text-caption", source.stale ? "text-danger" : "text-faint")}>{updatedAgoText(source.fetchedAt, now)}</p>
      <RefreshButton className="-my-1" />
    </div>
  );
};

export default WeekUpdated;
