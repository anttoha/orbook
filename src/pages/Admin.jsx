import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSideNav from "../components/admin/AdminSideNav";
import TabBar from "../components/navbar/TabBar";
import AppToaster from "../components/ui/AppToaster";
import Container from "../components/ui/Container";
import { adminTabs } from "../shared/constants/constants";
import { usePublicInfo } from "../shared/hooks/usePublicInfo";
import "../shared/hooks/useTheme"; // тема (світла/темна) з налаштувань застосунку діє і тут
import { useAdminStore } from "../shared/store/adminStore";
import AdminLogin from "./AdminLogin";

// На телефоні «Codes» світиться і на /admin/lehrer: там перемикач «Editor-Codes · Lehrer-Codes»
const MOBILE_TABS = adminTabs.filter((tab) => tab.mobile).map((tab) => (tab.to === "/admin/codes" ? { ...tab, activeOn: ["/admin/lehrer"] } : tab));
// Підсторінки з кнопкою «назад»: на телефоні без нижнього меню (макет 46)
const SUB_PAGES = ["/admin/protokoll", "/admin/kurse", "/admin/passwoerter"];

// ─────────────────────────────────────────────────────────────
// Оболонка адмінки (/admin/...). Окремо від застосунку класу: свій вхід, своє меню.
//   authed === undefined → питаємо сервер (порожній екран)
//   authed === false     → «Admin · Login»
//   інакше               → сайдбар (ПК) / нижнє меню (телефон) + сторінка
// ─────────────────────────────────────────────────────────────
const Admin = () => {
  const authed = useAdminStore((s) => s.authed);
  const start = useAdminStore((s) => s.start);
  const reloadOverview = useAdminStore((s) => s.reloadOverview);
  const reloadCodes = useAdminStore((s) => s.reloadCodes);
  const { pathname } = useLocation();
  const schoolClass = usePublicInfo()?.className ?? null; // «9b» у шапках; без входу теж відомо

  // Один раз: чи вже увійшли як адмін
  useEffect(() => {
    start();
  }, [start]);

  // Після входу: огляд і коди потрібні сайдбару (стан плану, лічильники) на будь-якій сторінці
  useEffect(() => {
    if (!authed) return;
    reloadOverview();
    reloadCodes();
  }, [authed, reloadOverview, reloadCodes]);

  if (authed === undefined) return <div className="min-h-dvh bg-paper" />;
  if (!authed) return <AdminLogin className={schoolClass} />;

  return (
    <>
      <Container className="min-h-dvh lg:flex lg:gap-9">
        <AdminSideNav />
        <main className="min-w-0 flex-1 pt-6 pb-28 lg:pt-6.5 lg:pr-5 lg:pb-8">
          <Outlet context={{ schoolClass }} />
        </main>
      </Container>
      {!SUB_PAGES.includes(pathname) && <TabBar tabs={MOBILE_TABS} />}
      <AppToaster />
    </>
  );
};

export default Admin;
