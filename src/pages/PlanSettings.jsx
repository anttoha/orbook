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

const LABELS = [
  { value: "kuerzel", label: "Kürzel" },
  { value: "name", label: "Name" },
];
const STYLES = [
  { value: "flaeche", label: "Fläche" },
  { value: "streifen", label: "Streifen" },
  { value: "aus", label: "Aus" },
];
const CANCELLED = [
  { value: "durchstreichen", label: "Durchstreichen" },
  { value: "ausblenden", label: "Ausblenden" },
];
const DAY_VIEWS = [
  { value: "liste", label: "Liste" },
  { value: "zeitleiste", label: "Zeit" },
];

// ─────────────────────────────────────────────────────────────
// «Darstellung → Stundenplan» (частина 30b, макет 30 · handy-13): що видно в клітинці уроку,
// кольори, тиждень і день. Усе діє одразу і видно в «Vorschau»; значення — userStore.plan (planView.js).
// «Wochenende», «Kompakte Woche», «Anzeigen als» і «Änderung unter dem Tag» — старі поля userStore, тут лише нове місце.
// ─────────────────────────────────────────────────────────────
const PlanSettings = () => {
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
      <PageHeader backTo="/mehr/darstellung" eyebrow="Darstellung" title="Stundenplan" subpage />

      <PlanPreview plan={plan} />

      <ListCard title="In der Stunde">
        <SettingRow label="Fach">
          <Segmented label="Fach" size="form" className="w-fit" options={LABELS} value={plan.lessonLabel} onChange={(v) => user.setPlan("lessonLabel", v)} />
        </SettingRow>
        {toggle("Raum", "showRoom")}
        {toggle("Lehrkraft", "showTeacher")}
        {toggle("Uhrzeit links", "showTimes")}
      </ListCard>

      <ListCard title="Farben">
        <SettingRow label="Fachfarbe">
          <Segmented label="Fachfarbe" size="form" className="w-fit" options={STYLES} value={plan.subjectStyle} onChange={(v) => user.setPlan("subjectStyle", v)} />
        </SettingRow>
      </ListCard>

      <ListCard title="Woche">
        <SettingRow label="Wochenende zeigen">
          <Switch label="Wochenende zeigen" checked={user.showWeekend} onChange={user.toggleWeekend} />
        </SettingRow>
        <SettingRow label="Kompakte Woche">
          <Switch label="Kompakte Woche" checked={user.compactWeek} onChange={user.setCompactWeek} />
        </SettingRow>
        {toggle("Freie Stunden zeigen", "showFree")}
        <SettingRow label="Ausfall">
          <Segmented label="Ausfall" size="form" className="w-fit" options={CANCELLED} value={plan.cancelled} onChange={(v) => user.setPlan("cancelled", v)} />
        </SettingRow>
      </ListCard>

      <ListCard title="Tag">
        <SettingRow label="Anzeigen als">
          <Segmented label="Anzeigen als" size="form" className="w-fit" options={DAY_VIEWS} value={user.dayView} onChange={user.setDayView} />
        </SettingRow>
        {toggle("Pausen zeigen", "showBreaks")}
        <MenuRow onClick={() => setFormatOpen(true)} icon={CalendarClock} label="Änderung unter dem Tag" value={changedFormatLabel(user.changedFormat)} />
      </ListCard>

      <ChangedFormatSheet open={formatOpen} onClose={() => setFormatOpen(false)} />
    </section>
  );
};

export default PlanSettings;
