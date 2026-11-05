import { Palette, Sun, Table2 } from "lucide-react";
import { Link } from "react-router-dom";
import { version } from "../../package.json";
import LeaveClass from "../components/more/LeaveClass";
import MenuRow from "../components/more/MenuRow";
import { KeyIcon, ShieldIcon } from "../components/ui/icons";
import ListCard from "../components/ui/ListCard";
import { useTheme } from "../shared/hooks/useTheme";
import { usePlanStore } from "../shared/store/planStore";
import { useUserStore } from "../shared/store/userStore";
import { courseCount } from "../shared/utils/courses";

const THEME_LABELS = { light: "Hell", dark: "Dunkel", system: "System" };

// Звідси відкриваються сторінки, у яких є й інший шлях: кнопка «назад» має повернути сюди
const BACK_HERE = { from: "/mehr" };

// ─────────────────────────────────────────────────────────────
// Сторінка «Mehr» (макет 22). Своїх запитів немає: me і courses уже завантажені.
// Mitteilungen з'являться в частині 17, Notizen synchronisieren — у частині 11.
// ─────────────────────────────────────────────────────────────
const More = () => {
  const me = usePlanStore((s) => s.me);
  const courses = usePlanStore((s) => s.courses);
  const picked = useUserStore((s) => s.picked);
  const theme = useTheme((s) => s.theme);

  const school = [me?.className, me?.schoolName].filter(Boolean).join(" · "); // обидва поля бувають порожні
  const count = courseCount(courses, picked);

  return (
    <section className="flex flex-col gap-4.5 lg:max-w-186">
      <header className="space-y-1">
        <p className="min-h-4 text-hint font-extrabold text-faint">{school}</p>
        <h1 className="text-title text-ink">
          <span className="lg:hidden">Mehr</span>
          <span className="hidden lg:inline">Einstellungen</span>
        </h1>
      </header>

      <ListCard title="App">
        <MenuRow to="/mehr/kurse" icon={Table2} label="Meine Kurse" value={count.all > 0 ? `${count.on} von ${count.all}` : null} />
        <MenuRow to="/mehr/darstellung" icon={Sun} label="Darstellung" value={THEME_LABELS[theme]} />
        <MenuRow to="/mehr/fachfarben" icon={Palette} label="Fachfarben" />
      </ListCard>

      <ListCard title="Daten">
        <MenuRow to="/editor-code" state={BACK_HERE} icon={KeyIcon} label="Klausuren eintragen" value={me?.editor?.label ?? "Editor-Code"} />
      </ListCard>

      <ListCard>
        <MenuRow to="/datenschutz" state={BACK_HERE} icon={ShieldIcon} label="Datenschutz" />
        <LeaveClass />
      </ListCard>

      <footer className="flex items-center justify-between text-caption text-faint">
        <p>ORBook {version.split(".").slice(0, 2).join(".")} · Teil von ORBitium</p>
        <Link to="/admin">Admin</Link>
      </footer>
    </section>
  );
};

export default More;
