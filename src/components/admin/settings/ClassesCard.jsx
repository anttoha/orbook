import { CLASS_LIMITS } from "../../../shared/utils/adminClasses";
import MenuRow from "../../more/MenuRow";
import { SchoolIcon } from "../../ui/icons";
import SelectPill from "../../ui/SelectPill";
import OptionRow from "./OptionRow";
import SettingsCard from "./SettingsCard";

// ─────────────────────────────────────────────────────────────
// «Klassen» в Einstellungen (часть 29, макет handy-17): сколько классов можно на одном устройстве
// и ссылка на «Schulen & Klassen». Настройка сервера — для всех школ сразу.
// Старый сервер без классов (нет form.classes) — только ссылки нет смысла показывать: блока нет
// ─────────────────────────────────────────────────────────────
const ClassesCard = ({ className, form, set, bad }) => {
  if (!form.classes) return null;
  return (
    <SettingsCard title="Klassen" className={className}>
      <ul className="divide-y divide-hair">
        <li>
          <OptionRow label="Klassen pro Gerät" hint="So viele Klassen darf ein Gerät haben" invalid={bad.has("classes.maxPerDevice")}>
            <SelectPill label="Klassen pro Gerät" value={form.classes.maxPerDevice ?? 0} options={CLASS_LIMITS} onChange={(value) => set("classes", "maxPerDevice", Number(value) || null)} />
          </OptionRow>
        </li>
        <MenuRow to="/admin/schulen" icon={SchoolIcon} label="Schulen & Klassen" />
      </ul>
      <p className="mt-2 mb-2 text-caption text-faint">Gilt für alle Schulen. Wer schon mehr Klassen hat, behält sie.</p>
    </SettingsCard>
  );
};

export default ClassesCard;
