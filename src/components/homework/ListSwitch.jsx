import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppointments } from "../../shared/hooks/useAppointments";
import { LIST_PARAM, useListMode } from "../../shared/hooks/useListMode";
import { DESKTOP_QUERY, useMediaQuery } from "../../shared/hooks/useMediaQuery";
import { useNow } from "../../shared/hooks/useNow";
import { upcomingAppointments } from "../../shared/utils/appointments";
import { usePlanStore } from "../../shared/store/planStore";
import { cn } from "../../shared/utils/cn";
import Segmented from "../ui/Segmented";

// Який список був відкритий востаннє. Два списки — різні сторінки, тож перемикач створюється заново,
// і «пігулка» з'явилась би одразу на місці. Тому спершу малюємо її там, де вона була, а в наступному кадрі
// ставимо на нове місце — і CSS-перехід у Segmented плавно її пересуває
let lastMode = null;

// «Klausuren · 5 | Hausaufgaben · 4 | Termine · 5» (макети handy-04, частина 18). Режим живе в адресі.
// На телефоні три частини без чисел (макет 18 handy-01): з числами не влазять
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
  const { today } = useNow();
  const appointmentCount = upcomingAppointments(useAppointments().items, today).length;
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const label = (text, count) => (isDesktop ? `${text} · ${count}` : text);

  return (
    <Segmented
      label="Liste"
      className={cn("shrink-0", className)}
      value={shown}
      options={[
        { value: "exams", label: label("Tests", examCount) },
        { value: "homework", label: label("Hausaufgaben", homeworkCount) },
        { value: "appointments", label: label("Termine", appointmentCount) },
      ]}
      onChange={(value) => setParams(LIST_PARAM[value] ? { liste: LIST_PARAM[value] } : {}, { replace: true })}
    />
  );
};

export default ListSwitch;
