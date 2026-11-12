import OrbitMark from "../ui/OrbitMark";
import WeekPreview from "./WeekPreview";

// Ліва половина екрана входу на ПК: назва, заголовок і зразок тижня.
const AuthAside = ({ className: schoolClass }) => (
  <aside className="hidden min-h-dvh flex-col bg-tint px-15 pt-11 pb-11 lg:flex">
    <div className="flex items-center gap-3">
      <OrbitMark className="size-9.5" />
      <p className="text-brand text-ink">ORBook</p>
      <p className="text-hint text-ink">Teil von ORBitium</p>
    </div>

    <p className="mt-7 text-landing text-ink">
      Stundenplan,
      <br />
      Vertretungen und
      <br />
      Tests{schoolClass ? ` der ${schoolClass}` : ""}.
    </p>

    <div className="mt-8 mb-8">
      <WeekPreview />
    </div>

    <p className="mt-auto text-hint text-accent-ink">Keine offizielle App von Indiware · Plan von stundenplan24.de</p>
  </aside>
);

export default AuthAside;
