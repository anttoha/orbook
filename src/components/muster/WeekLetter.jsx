import Badge from "../ui/Badge";

// Бейдж тижня циклу школи: «WOCHE A» / «WOCHE B» (частина 19). Без букви — нічого
const WeekLetter = ({ letter, className }) =>
  letter ? (
    <Badge variant="soft" className={className}>
      Woche {letter}
    </Badge>
  ) : null;

export default WeekLetter;
