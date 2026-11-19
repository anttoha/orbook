import { useState } from "react";
import ChangedFormatSheet from "../components/more/ChangedFormatSheet";
import MenuRow from "../components/more/MenuRow";
import PlanPreview from "../components/more/PlanPreview";
import SettingRow from "../components/more/SettingRow";
import ListCard from "../components/ui/ListCard";
import PageHeader from "../components/ui/PageHeader";
import Segmented from "../components/ui/Segmented";
import Switch from "../components/ui/Switch";
import { usePlanView } from "../shared/hooks/usePlanView";
import { useUserStore } from "../shared/store/userStore";
import { changedFormatLabel } from "../shared/utils/planView";
import { CalendarClock } from "lucide-react";
import { useT } from "../shared/hooks/useT";
import { translate } from "../shared/i18n/translate";

const LABELS = [
  { value: "kuerzel", get label() { return translate("Kürzel"); } },
  { value: "name", get label() { return translate("Name"); } },
];
const STYLES = [
  { value: "flaeche", get label() { return translate("Fläche"); } },
  { value: "streifen", get label() { return translate("Streifen"); } },
  { value: "aus", get label() { return translate("Aus"); } },
];
const CANCELLED = [
  { value: "durchstreichen", get label() { return translate("Durchstreichen"); } },
  { value: "ausblenden", get label() { return translate("Ausblenden"); } },
];
const DAY_VIEWS = [
  { value: "liste", get label() { return translate("Liste"); } },
  { value: "zeitleiste", get label() { return translate("Zeit"); } },
];

// ─────────────────────────────────────────────────────────────
// «Darstellung → Stundenplan» (частина 30b, макет 30 · handy-13): що видно в клітинці уроку,
// кольори, тиждень і день. Усе діє одразу і видно в «Vorschau»; значення — userStore.plan (planView.js).
// «Wochenende», «Kompakte Woche», «Anzeigen als» і «Änderung unter dem Tag» — старі поля userStore, тут лише нове місце.
// ─────────────────────────────────────────────────────────────
const PlanSettings = () => {
  const t = useT();
  const plan = usePlanView();
  const user = useUserStore();
  const [formatOpen, setFormatOpen] = useState(false); // шторка «Änderung unter dem Tag»

  // Перемикач рядка: label — і підпис, і назва для скрінрідера
  const toggle = (label, key) => (
    <SettingRow label={label}>
      <Switch label={label} checked={plan[key]} onChange={(on) => user.setPlan(key, on)} />
    </SettingRow>
  );

  return (
    <section className="flex flex-col gap-4.5 lg:max-w-186">
      <PageHeader backTo="/mehr/darstellung" eyebrow={t("Darstellung")} title={t("Stundenplan")} subpage />

      <PlanPreview plan={plan} />

      <ListCard title={t("In der Stunde")}>
        <SettingRow label={t("Fach")}>
          <Segmented label={t("Fach")} size="form" className="w-fit" options={LABELS} value={plan.lessonLabel} onChange={(v) => user.setPlan("lessonLabel", v)} />
        </SettingRow>
        {toggle(t("Raum"), "showRoom")}
        {toggle(t("Lehrkraft"), "showTeacher")}
        {toggle(t("Uhrzeit links"), "showTimes")}
      </ListCard>

      <ListCard title={t("Farben")}>
        <SettingRow label={t("Fachfarbe")}>
          <Segmented label={t("Fachfarbe")} size="form" className="w-fit" options={STYLES} value={plan.subjectStyle} onChange={(v) => user.setPlan("subjectStyle", v)} />
        </SettingRow>
      </ListCard>

      <ListCard title={t("Woche")}>
        <SettingRow label={t("Wochenende zeigen")}>
          <Switch label={t("Wochenende zeigen")} checked={user.showWeekend} onChange={user.toggleWeekend} />
        </SettingRow>
        <SettingRow label={t("Kompakte Woche")}>
          <Switch label={t("Kompakte Woche")} checked={user.compactWeek} onChange={user.setCompactWeek} />
        </SettingRow>
        {toggle(t("Freie Stunden zeigen"), "showFree")}
        <SettingRow label={t("Ausfall")}>
          <Segmented label={t("Ausfall")} size="form" className="w-fit" options={CANCELLED} value={plan.cancelled} onChange={(v) => user.setPlan("cancelled", v)} />
        </SettingRow>
      </ListCard>

      <ListCard title={t("Tag")}>
        <SettingRow label={t("Anzeigen als")}>
          <Segmented label={t("Anzeigen als")} size="form" className="w-fit" options={DAY_VIEWS} value={user.dayView} onChange={user.setDayView} />
        </SettingRow>
        {toggle(t("Pausen zeigen"), "showBreaks")}
        <MenuRow onClick={() => setFormatOpen(true)} icon={CalendarClock} label={t("Änderung unter dem Tag")} value={changedFormatLabel(user.changedFormat)} />
      </ListCard>

      <ChangedFormatSheet open={formatOpen} onClose={() => setFormatOpen(false)} />
    </section>
  );
};

export default PlanSettings;
