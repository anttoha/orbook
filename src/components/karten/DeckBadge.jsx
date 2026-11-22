import SubjectBadge from "../ui/SubjectBadge";
import { KartenIcon } from "../ui/icons";

// Кружок стопки: предмет («En» цветом предмета) или — без предмета — песочный со значком карточек
const DeckBadge = ({ subject, size = "lg" }) =>
  subject ? (
    <SubjectBadge subject={{ code: subject }} size={size} />
  ) : (
    <span className={size === "lg" ? "grid size-11 shrink-0 place-items-center rounded-full bg-sand text-muted" : "grid size-8 shrink-0 place-items-center rounded-full bg-sand text-muted"}>
      <KartenIcon className="size-4.5" />
    </span>
  );

export default DeckBadge;
