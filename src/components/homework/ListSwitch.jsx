import { useSearchParams } from "react-router-dom";
import { useListMode } from "../../shared/hooks/useListMode";
import { usePlanStore } from "../../shared/store/planStore";
import { cn } from "../../shared/utils/cn";
import Segmented from "../ui/Segmented";

// «Klausuren · 5 | Hausaufgaben · 4» (макет handy-04). Режим живе в адресі: «назад» і посилання працюють
const ListSwitch = ({ className }) => {
  const mode = useListMode();
  const [, setParams] = useSearchParams();
  const examCount = usePlanStore((s) => s.exams.length);
  const homeworkCount = usePlanStore((s) => s.homework.length);

  return (
    <Segmented
      label="Liste"
      className={cn("shrink-0", className)}
      value={mode}
      options={[
        { value: "exams", label: `Klausuren · ${examCount}` },
        { value: "homework", label: `Hausaufgaben · ${homeworkCount}` },
      ]}
      onChange={(value) => setParams(value === "homework" ? { liste: "hausaufgaben" } : {}, { replace: true })}
    />
  );
};

export default ListSwitch;
