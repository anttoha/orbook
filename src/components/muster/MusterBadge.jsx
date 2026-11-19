import Badge from "../ui/Badge";
import { useT } from "../../shared/hooks/useT";

// Мітка «MUSTER» біля заголовка тижня і в окні уроку (частина 19). children — дописати («· Woche A»)
const MusterBadge = ({ className, children }) => {
  const t = useT();
  return (
  <Badge variant="changed" className={className}>
    {t("Muster")}{children}
  </Badge>
);
};

export default MusterBadge;
