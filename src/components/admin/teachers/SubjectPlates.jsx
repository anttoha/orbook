import { useUserStore } from "../../../shared/store/userStore";
import { cn } from "../../../shared/utils/cn";
import { fachClasses } from "../../../shared/utils/lessons";

// Fächer einer Lehrkraft als farbige Plättchen (Farbe wie im Stundenplan). names: { Ma: "Mathe" }
const SubjectPlates = ({ codes, names, className }) => {
  const overrides = useUserStore((s) => s.colorOverrides);
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {codes.map((code) => (
        <li key={code} className={cn("rounded-full px-2.5 py-1 text-caption font-bold", fachClasses(code, overrides))}>
          {names[code] || code}
        </li>
      ))}
    </ul>
  );
};

export default SubjectPlates;
