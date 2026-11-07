import { Folder, Palette, Sun, Table2, UserPlus } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { version } from "../../package.json";
import LeaveClass from "../components/more/LeaveClass";
import SettingsTiles from "../components/settings/SettingsTiles";
import MenuRow from "../components/more/MenuRow";
import { KeyIcon, ShieldIcon, SyncIcon } from "../components/ui/icons";
import ListCard from "../components/ui/ListCard";
import { useSyncAllowed } from "../shared/hooks/useNotesSync";
import { useInSettingsPanel } from "../shared/hooks/useSettingsPanel";
import { useSheet } from "../shared/hooks/useSheet";
import { useTheme } from "../shared/hooks/useTheme";
import { useMaterials } from "../shared/store/materialsStore";
import { useSyncStore } from "../shared/store/syncStore";
import { usePlanStore } from "../shared/store/planStore";
import { useUserStore } from "../shared/store/userStore";
import { courseCount } from "../shared/utils/courses";
import { isTeacher } from "../shared/utils/examRules";

const THEME_LABELS = { light: "Hell", dark: "Dunkel", system: "System" };

// Рядок унизу: версія і вхід в адмінку
const Footer = () => (
  <footer className="flex items-center justify-between text-caption text-faint">
    <p>ORBook {version.split(".").slice(0, 2).join(".")} · Teil von ORBitium</p>
    <Link to="/admin">Admin</Link>
  </footer>
);

// На ПК «Übersicht» праворуч від меню розділів: плитки замість списку (макет 22)
const DesktopOverview = () => (
  <section className="flex flex-col gap-5">
    <h2 className="text-heading text-ink">Übersicht</h2>
    <SettingsTiles />
    <Footer />
  </section>
);

// ─────────────────────────────────────────────────────────────
// Сторінка «Mehr» (макет 22). Своїх запитів немає: me і courses уже завантажені.
// Mitteilungen з'являться в частині 17. «Notizen synchronisieren» ховаємо, якщо школа вимкнула синхронізацію.
// ─────────────────────────────────────────────────────────────
const More = () => {
  const inPanel = useInSettingsPanel(); // ПК: сторінка всередині «Einstellungen»
  if (inPanel) return <DesktopOverview />;
  return <PhoneMenu />;
};

// Телефон: список «Mehr» (макет 22 Handy)
const PhoneMenu = () => {
  const me = usePlanStore((s) => s.me);
  const courses = usePlanStore((s) => s.courses);
  const picked = useUserStore((s) => s.picked);
  const theme = useTheme((s) => s.theme);
  const syncCode = useSyncStore((s) => s.code);
  const syncAllowed = useSyncAllowed();

  const school = [me?.className, me?.schoolName].filter(Boolean).join(" · "); // обидва поля бувають порожні
  const hiddenRequired = useUserStore((s) => s.hiddenRequired);
  const count = courseCount(courses, picked, hiddenRequired);
  const links = useMaterials((s) => (s.status === "idle" ? null : s.items.length));
  const ensureMaterials = useMaterials((s) => s.ensure);
  const { openSheet } = useSheet();
  // «6 Links» праворуч: список питаємо один раз за сесію (далі його оновлює сторінка Materialien)
  useEffect(() => {
    ensureMaterials();
  }, [ensureMaterials]);

  return (
    <section className="flex flex-col gap-4.5">
      <header className="space-y-1">
        <p className="min-h-4 text-hint font-extrabold text-faint">{school}</p>
        <h1 className="text-title text-ink">Mehr</h1>
      </header>

      <ListCard title="App">
        <MenuRow to="/mehr/kurse" icon={Table2} label="Meine Kurse" value={count.all > 0 ? `${count.on} von ${count.all}` : null} />
        <MenuRow to="/mehr/darstellung" icon={Sun} label="Darstellung" value={THEME_LABELS[theme]} />
        <MenuRow to="/mehr/fachfarben" icon={Palette} label="Fachfarben" />
      </ListCard>

      <ListCard title="Klasse">
        <MenuRow to="/materialien" icon={Folder} label="Materialien" value={links ? `${links} ${links === 1 ? "Link" : "Links"}` : null} />
        {/* частина 16: посилання і QR для однокласників; вимкнене — шторка так і скаже */}
        <MenuRow onClick={() => openSheet("einladen")} icon={UserPlus} label="Klasse einladen" value="Link + QR" />
      </ListCard>

      <ListCard title="Daten">
        {/* праворуч — перша група коду, як у макеті: «K7QM-…» */}
        {syncAllowed && <MenuRow to="/mehr/sync" icon={SyncIcon} label="Notizen synchronisieren" value={syncCode ? `${syncCode.slice(0, 4)}-…` : "Aus"} />}
        {!isTeacher(me) && <MenuRow to="/mehr/editor-code" icon={KeyIcon} label="Klausuren eintragen" value={me?.editor?.label ?? "Editor-Code"} />}
      </ListCard>

      <ListCard>
        <MenuRow to="/mehr/datenschutz" icon={ShieldIcon} label="Datenschutz" />
        <LeaveClass />
      </ListCard>

      <Footer />
    </section>
  );
};

export default More;
