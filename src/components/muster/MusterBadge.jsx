import Badge from "../ui/Badge";

// Мітка «MUSTER» біля заголовка тижня і в окні уроку (частина 19). children — дописати («· Woche A»)
const MusterBadge = ({ className, children }) => (
  <Badge variant="changed" className={className}>
    Muster{children}
  </Badge>
);

export default MusterBadge;
