import Badge from "../ui/Badge";
import { useT } from "../../shared/hooks/useT";

// Бейдж тижня циклу школи: «WOCHE A» / «WOCHE B» (частина 19). Без букви — нічого
const WeekLetter = ({ letter, className }) =>
  {
  const t = useT();
  return letter ? (
    <Badge variant="soft" className={className}>
      {t("Woche")} {letter}
    </Badge>
  ) : null;
};

export default WeekLetter;
