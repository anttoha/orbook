import { Link, useLocation } from "react-router-dom";
import { LogOut, Table2 } from "lucide-react";
import { adminTabs } from "../../shared/constants/constants";
import { useAdminStore } from "../../shared/store/adminStore";
import { clock, HEALTH, isTeacherCode, planHealth } from "../../shared/utils/admin";
import { isTabActive } from "../../shared/utils/isTabActive";
import NavigationLink from "../navbar/NavigationLink";
import Logo from "../ui/Logo";

// Карточка «Plan läuft · 16:40 · nächster Abruf 16:45» під меню
const PlanCard = ({ plan }) => {
  const health = HEALTH[planHealth(plan)];
  const last = clock(plan.status?.lastOkAt) ?? "noch nie";
  const next = clock(plan.status?.nextFetchAt);

  return (
    <div className="mt-5 rounded-card bg-sand px-3.5 py-3">
      <p className="flex items-center gap-2 text-label font-extrabold text-ink">
        <span className={`size-2 rounded-full ${health.dot}`} />
        {planHealth(plan) === "ok" ? "Plan läuft" : health.title}
      </p>
      <p className="mt-1 text-caption text-muted">{next ? `${last} · nächster Abruf ${next}` : last}</p>
    </div>
  );
};

// Рядок унизу сайдбара: «Zur App», «Abmelden»
const footerItem = "flex h-10 items-center gap-3 rounded-full px-3 text-body-sm font-bold text-muted transition-colors hover:bg-sand hover:text-ink";

// ─────────────────────────────────────────────────────────────
// Сайдбар адмінки на ПК (макети 42–49): логотип з «ADMIN», меню з лічильниками,
// стан плану, внизу «Zur App» і «Abmelden».
// ─────────────────────────────────────────────────────────────
const AdminSideNav = () => {
  const { pathname } = useLocation();
  const overview = useAdminStore((s) => s.overview.data);
  const codes = useAdminStore((s) => s.codes.data?.codes);
  const logout = useAdminStore((s) => s.logout);
  // Editor-Codes і Lehrer-Codes лежать в одному списку /admin/codes (поле kind)
  const counts = {
    codes: codes ? codes.filter((code) => !isTeacherCode(code)).length : null,
    teachers: codes ? codes.filter(isTeacherCode).length : null,
    exams: overview?.counts.examsUpcoming ?? null,
  };

  return (
    <aside className="sticky top-4 my-4 hidden h-[calc(100dvh-2rem)] w-sidebar shrink-0 flex-col rounded-panel bg-card px-3.5 pt-4 pb-3.5 lg:flex print:hidden">
      <div className="flex h-10.75 items-center gap-1.5 px-1">
        <Logo className="items-center gap-2" titleClassName="text-logo" withIcon />
        <span className="rounded-full bg-accent px-2 py-0.75 text-micro leading-none font-extrabold text-on-accent uppercase">Admin</span>
      </div>

      <nav className="mt-5 space-y-1">
        {adminTabs
          .filter((tab) => tab.desktop)
          .map((tab) => (
            <NavigationLink key={tab.to} tab={tab} active={isTabActive(tab, pathname)} badge={tab.count ? counts[tab.count] : null} />
          ))}
      </nav>

      {overview && <PlanCard plan={overview.plan} />}

      <div className="mt-auto border-t border-hair pt-3">
        <Link to="/" className={footerItem}>
          <Table2 className="size-4.5" /> Zur App
        </Link>
        <button type="button" onClick={logout} className={`w-full ${footerItem}`}>
          <LogOut className="size-4.5" /> Abmelden
        </button>
      </div>
    </aside>
  );
};

export default AdminSideNav;
