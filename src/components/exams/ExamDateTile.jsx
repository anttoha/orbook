import { cn } from "../../shared/utils/cn";
import { dayNumber, weekdayShort } from "../../shared/utils/format";
import { fachClasses } from "../../shared/utils/lessons";

// Плашка дати в кольорі предмета: «19 FR». Одноцифрове число як на макеті: «01»
const ExamDateTile = ({ exam, overrides }) => (
  <span className={cn("flex h-11 w-9.5 shrink-0 flex-col items-center justify-center rounded-tile", fachClasses(exam.subject?.code, overrides))}>
    <span className="text-cell leading-none">{dayNumber(exam.date).padStart(2, "0")}</span>
    <span className="mt-0.5 text-tiny font-bold tracking-badge uppercase">{weekdayShort(exam.date)}</span>
  </span>
);

export default ExamDateTile;
