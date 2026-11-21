import Segmented from "../ui/Segmented";
import { useT } from "../../shared/hooks/useT";
import { translate } from "../../shared/i18n/translate";

// «Für welche Kurse»: как в «Meine Kurse» или весь класс (тот же вид, что в Mitteilungen)
const FeedCourses = ({ mine, courseCount, onChange, disabled = false }) => {
  const t = useT();
  const options = [
    { value: "mine", label: courseCount ? translate("Meine Kurse · {courseCount}", { courseCount }) : translate("Meine Kurse") },
    { value: "all", label: translate("Ganze Klasse") },
  ];
  return (
    <section className="flex flex-col gap-2.5" aria-disabled={disabled || undefined}>
      <h2 className="text-hint font-extrabold text-faint">{t("Für welche Kurse")}</h2>
      <Segmented label={t("Für welche Kurse")} options={options} value={mine ? "mine" : "all"} onChange={(value) => !disabled && onChange(value === "mine")} />
      <p className="text-caption text-faint">
        {mine ? t("So wie unter „Meine Kurse“. Änderst du dort was, gilt es hier auch.") : t("Alles aus der Klasse, auch Kurse, die du nicht hast.")}
      </p>
    </section>
  );
};

export default FeedCourses;
