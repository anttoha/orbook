import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useListMode } from "../../shared/hooks/useListMode";
import { usePlanStore } from "../../shared/store/planStore";
import { cn } from "../../shared/utils/cn";
import Segmented from "../ui/Segmented";

// Який список був відкритий востаннє. Два списки — різні сторінки, тож перемикач створюється заново,
// і «пігулка» з'явилась би одразу на місці. Тому спершу малюємо її там, де вона була, а в наступному кадрі
// ставимо на нове місце — і CSS-перехід у Segmented плавно її пересуває
let lastMode = null;

// «Klausuren · 5 | Hausaufgaben · 4» (макет handy-04). Режим живе в адресі: «назад» і посилання працюють
const ListSwitch = ({ className }) => {
  const mode = useListMode();
  const [shown, setShown] = useState(lastMode ?? mode);
  useEffect(() => {
    lastMode = mode;
    if (shown === mode) return undefined;
    const frame = requestAnimationFrame(() => setShown(mode));
    return () => cancelAnimationFrame(frame);
  }, [mode, shown]);
  const [, setParams] = useSearchParams();
  const examCount = usePlanStore((s) => s.exams.length);
  const homeworkCount = usePlanStore((s) => s.homework.length);

  return (
    <Segmented
      label="Liste"
      className={cn("shrink-0", className)}
      value={shown}
      options={[
        { value: "exams", label: `Klausuren · ${examCount}` },
        { value: "homework", label: `Hausaufgaben · ${homeworkCount}` },
      ]}
      onChange={(value) => setParams(value === "homework" ? { liste: "hausaufgaben" } : {}, { replace: true })}
    />
  );
};

export default ListSwitch;
