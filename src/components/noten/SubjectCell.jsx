import { cn } from "../../shared/utils/cn";
import { fachClasses } from "../../shared/utils/lessons";
import { badgeOf } from "../../shared/utils/noten";
import { useUserStore } from "../../shared/store/userStore";

// Квадратик предмета цветом предмета: «Ma». Код InfoPoint («ma») — с большой буквы, как коды плана
const SubjectCell = ({ code, className }) => {
  const overrides = useUserStore((s) => s.colorOverrides);
  const badge = badgeOf(code);
  return <span className={cn("grid size-10 shrink-0 place-items-center rounded-tile font-black", badge.length > 2 ? "text-small" : "text-label", fachClasses(badge, overrides), className)}>{badge}</span>;
};

export default SubjectCell;
