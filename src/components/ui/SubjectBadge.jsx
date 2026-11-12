import { useUserStore } from "../../shared/store/userStore";
import { cn } from "../../shared/utils/cn";
import { badgeCode, subjectCode } from "../../shared/utils/format";
import { fachClasses } from "../../shared/utils/lessons";

// Кружечок предмета з кодом («Ma»). Коди шкіл бувають довгі («AGTan», «Nach»), а в кружечок
// влазить лише 2–3 літери: показуємо початок, повний код — у підказці (title).
// size: "sm" — 26px (лента «Verlauf», часть 26), "md" — 32px (списки), "lg" — 44px (шторки)
const SIZES = { sm: "size-6.5 text-tiny", md: "size-8", lg: "size-11" };

const SubjectBadge = ({ subject, size = "md", className }) => {
  const overrides = useUserStore((s) => s.colorOverrides);
  const code = subjectCode(subject);
  return (
    <span title={code} className={cn("grid shrink-0 place-items-center rounded-full text-note font-black transition-colors duration-300", SIZES[size], fachClasses(subject?.code, overrides), className)}>
      {badgeCode(code)}
    </span>
  );
};

export default SubjectBadge;
