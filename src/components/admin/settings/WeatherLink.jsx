import { CloudSun } from "lucide-react";
import MenuRow from "../../more/MenuRow";
import SettingsCard from "./SettingsCard";
import { useT } from "../../../shared/hooks/useT";

// «Wetter» в Einstellungen (часть 50a): место школы и вкл/выкл — на отдельной странице.
// weather — settings.weather: справа город или «Aus»
const WeatherLink = ({ weather, className }) => {
  const t = useT();
  const value = weather?.enabled && weather?.place ? weather.place.name : t("Aus");
  return (
    <SettingsCard title={t("Wetter")} className={className}>
      <ul className="divide-y divide-hair">
        <MenuRow to="/admin/wetter" icon={CloudSun} label={t("Wetter")} value={value} />
      </ul>
    </SettingsCard>
  );
};

export default WeatherLink;
