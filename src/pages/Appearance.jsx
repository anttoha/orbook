import SettingRow from "../components/more/SettingRow";
import ThemePicker from "../components/more/ThemePicker";
import ListCard from "../components/ui/ListCard";
import PageHeader from "../components/ui/PageHeader";
import Segmented from "../components/ui/Segmented";
import Switch from "../components/ui/Switch";
import { useTheme } from "../shared/hooks/useTheme";
import { useUserStore } from "../shared/store/userStore";

const START_VIEWS = [
  { value: "woche", label: "Woche" },
  { value: "heute", label: "Heute" },
];
const DAY_VIEWS = [
  { value: "liste", label: "Liste" },
  { value: "zeitleiste", label: "Zeit" },
];
const FONT_SIZES = [
  { value: 1, label: "A" },
  { value: 2, label: "A+" },
  { value: 3, label: "A++" },
];

// «Darstellung» (макет 24). Запитів немає: усе живе на пристрої і діє одразу.
const Appearance = () => {
  const { theme, setTheme } = useTheme();
  const user = useUserStore();

  return (
    <section className="flex flex-col gap-4.5 lg:max-w-186">
      <PageHeader backTo="/mehr" eyebrow="Mehr" title="Darstellung" />

      <div>
        <h2 className="mb-2.5 text-hint font-extrabold text-faint">Thema</h2>
        <ThemePicker value={theme} onChange={setTheme} />
      </div>

      <ListCard title="Ansicht">
        <SettingRow label="Startansicht">
          <Segmented label="Startansicht" size="form" className="w-fit" options={START_VIEWS} value={user.startView} onChange={user.setStartView} />
        </SettingRow>
        <SettingRow label="Tag anzeigen als">
          <Segmented label="Tag anzeigen als" size="form" className="w-fit" options={DAY_VIEWS} value={user.dayView} onChange={user.setDayView} />
        </SettingRow>
        <SettingRow label="Wochenende zeigen">
          <Switch label="Wochenende zeigen" checked={user.showWeekend} onChange={user.toggleWeekend} />
        </SettingRow>
        <SettingRow label="Kompakte Woche" hint="Kleinere Zellen, mehr auf einen Blick">
          <Switch label="Kompakte Woche" checked={user.compactWeek} onChange={user.setCompactWeek} />
        </SettingRow>
        <SettingRow label="Schriftgröße">
          <Segmented label="Schriftgröße" size="form" className="w-fit" options={FONT_SIZES} value={user.fontScale} onChange={user.setFontScale} />
        </SettingRow>
      </ListCard>
    </section>
  );
};

export default Appearance;
