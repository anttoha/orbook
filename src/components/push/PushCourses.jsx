import { toast } from "sonner";
import { pushErrorText, usePushStore } from "../../shared/store/pushStore";
import { cn } from "../../shared/utils/cn";
import Segmented from "../ui/Segmented";

// «Für welche Kurse»: как в «Meine Kurse» или всё, что есть в классе
const PushCourses = ({ courseCount, disabled = false }) => {
  const mine = usePushStore((s) => s.mine);
  const update = usePushStore((s) => s.update);
  const options = [
    { value: "mine", label: courseCount ? `Meine Kurse · ${courseCount}` : "Meine Kurse" },
    { value: "all", label: "Ganze Klasse" },
  ];

  const change = (value) => update({ mine: value === "mine" }).catch((error) => toast.error(pushErrorText(error)));

  return (
    <section className={cn("flex flex-col gap-2.5", disabled && "pointer-events-none opacity-55")} aria-disabled={disabled || undefined}>
      <h2 className="text-hint font-extrabold text-faint">Für welche Kurse</h2>
      <Segmented label="Für welche Kurse" options={options} value={mine ? "mine" : "all"} onChange={change} />
      <p className="text-caption text-faint">
        {mine ? "So wie unter „Meine Kurse“. Änderst du dort was, gilt es hier auch." : "Alles aus der Klasse, auch Kurse, die du nicht hast."}
      </p>
    </section>
  );
};

export default PushCourses;
