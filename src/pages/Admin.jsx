import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSideNav from "../components/admin/AdminSideNav";
import TabBar from "../components/navbar/TabBar";
import AppToaster from "../components/ui/AppToaster";
import Container from "../components/ui/Container";
import { adminTabs } from "../shared/constants/constants";
import { useAdminClasses } from "../shared/hooks/useAdminClasses";
import { usePublicInfo } from "../shared/hooks/usePublicInfo";
import "../shared/hooks/useTheme"; // тема (світла/темна) з налаштувань застосунку діє і тут
import { useAdminStore } from "../shared/store/adminStore";
import AdminLogin from "./AdminLogin";

// На телефоні «Codes» світиться і на /admin/lehrer: там перемикач «Editor-Codes · Lehrer-Codes»
const MOBILE_TABS = adminTabs.filter((tab) => tab.mobile).map((tab) => (tab.to === "/admin/codes" ? { ...tab, activeOn: ["/admin/lehrer"] } : tab));
// Підсторінки з кнопкою «назад»: на телефоні без нижнього меню (макет 46)
const SUB_PAGES = ["/admin/protokoll", "/admin/kurse", "/admin/passwoerter", "/admin/zugang", "/admin/schulen"];

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
  const reloadSchools = useAdminStore((s) => s.reloadSchools);
  const classId = useAdminStore((s) => s.classId); // часть 29c: какой класс настраивает админ
  const { pathname } = useLocation();
  const loginClass = usePublicInfo()?.className ?? null; // «9b» на екрані входу
  const schoolClass = useAdminClasses().current?.name ?? loginClass; // клас, який зараз налаштовується

  // Один раз: чи вже увійшли як адмін
  useEffect(() => {
    start();
  }, [start]);

  // Після входу: школи і класи — для чипа класу в шапці
  useEffect(() => {
    if (authed) reloadSchools();
  }, [authed, reloadSchools]);

  // Після входу і при зміні класу: огляд і коди потрібні сайдбару (стан плану, лічильники) на будь-якій сторінці
  useEffect(() => {
    if (!authed) return;
    reloadOverview();
    reloadCodes();
  }, [authed, classId, reloadOverview, reloadCodes]);

  if (authed === undefined) return <div className="min-h-dvh bg-paper" />;
  if (!authed) return <AdminLogin className={loginClass} />;

  return (
    <>
      <Container className="min-h-dvh lg:flex lg:gap-9">
        <AdminSideNav />
        <main className="min-w-0 flex-1 pt-6 pb-28 lg:pt-6.5 lg:pr-5 lg:pb-8">
          {/* key: другой класс — страница создаётся заново и грузит данные этого класса */}
          <Outlet key={classId ?? 0} context={{ schoolClass }} />
        </main>
      </Container>
      {!SUB_PAGES.includes(pathname) && <TabBar tabs={MOBILE_TABS} />}
      <AppToaster />
    </>
  );
};

export default Admin;
