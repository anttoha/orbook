import { useNow } from "../../shared/hooks/useNow";
import { cn } from "../../shared/utils/cn";
import { standText, updatedAgoText } from "../../shared/utils/format";
import { weekStandSource } from "../../shared/utils/lessons";

// Дрібний рядок «Stand von heute 07:12 · aktualisiert vor 3 Min.» під заголовком тижня.
// Stand — коли школа випустила план, aktualisiert — коли сервер востаннє його перевіряв.
const WeekStand = ({ days }) => {
  const { now, today } = useNow();
  const source = weekStandSource(days, today);
  if (!source) return null;

  const text = [standText(source.publishedAt, today), updatedAgoText(source.fetchedAt, now)].filter(Boolean).join(" · ");
  return <p className={cn("-mt-2 text-caption", source.stale ? "text-danger" : "text-faint")}>{text}</p>;
};

export default WeekStand;
