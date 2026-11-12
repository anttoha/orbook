import { useEffect, useState } from "react";
import { toast } from "sonner";
import AdminHeader from "../components/admin/AdminHeader";
import { AdminError, AdminSkeleton } from "../components/admin/AdminState";
import PasswordLinks from "../components/admin/settings/PasswordLinks";
import ExamTypesLink from "../components/admin/settings/ExamTypesLink";
import DangerZone from "../components/admin/settings/DangerZone";
import { AppointmentsCard, FeaturesCard, HomeworkCard, MusterCard, SecurityCard, UpdateCard } from "../components/admin/settings/OptionCards";
import { purgeHomework } from "../shared/api/admin";
import MaterialSitesCard from "../components/admin/settings/MaterialSitesCard";
import PrivacyCard from "../components/admin/settings/PrivacyCard";
import SaveButton from "../components/admin/settings/SaveButton";
import SchoolCard from "../components/admin/settings/SchoolCard";
import { DESKTOP_QUERY, useMediaQuery } from "../shared/hooks/useMediaQuery";
import { useSettingsForm } from "../shared/hooks/useSettingsForm";
import { useAdminStore } from "../shared/store/adminStore";
import { usePlanStore } from "../shared/store/planStore";

// Колонки ПК: ліва (пароль, школа, контакт) і права (оновлення, функції, безпека).
// На телефоні колонок немає (max-lg:contents), і блоки стають в один ряд у порядку order-* з макета 45
const column = "flex flex-col gap-4 max-lg:contents";

// Форма. Сторінка створює її заново (key), коли приходять свіжі налаштування
const SettingsForm = ({ data }) => {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const demo = useAdminStore((s) => s.overview.data?.demo ?? false);
  const reloadOverview = useAdminStore((s) => s.reloadOverview);
  const abWeek = usePlanStore((s) => s.meta?.abWeek ?? null); // тиждень A/B (є, якщо цей браузер увійшов і в клас)
  const draft = useSettingsForm(data.settings);
  const { form, set, bad } = draft;
  const rows = { form, set, bad }; // для рядків з перемикачами і списками
  const [purging, setPurging] = useState(false);

  // «Hausaufgaben jetzt aufräumen»: за ЗБЕРЕЖЕНИМ правилом keepDays (незбережену зміну сервер ще не знає)
  const purge = async () => {
    setPurging(true);
    try {
      const { removed } = await purgeHomework();
      toast.success(removed === 1 ? "1 Hausaufgabe gelöscht" : `${removed} Hausaufgaben gelöscht`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setPurging(false);
    }
  };

  return (
    <section className="flex flex-col gap-4 lg:gap-5">
      <AdminHeader title="Einstellungen" actions={isDesktop && <SaveButton {...draft} onSave={draft.save} />} />
      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-2 lg:items-start lg:gap-4">
        <div className={column}>
          <PasswordLinks className="order-1" />
          <ExamTypesLink className="order-1" count={form.exams?.types?.length} />
          <SchoolCard
            className="order-2"
            school={form.school}
            onChange={(field, value) => set("school", field, value)}
            schoolPassword={draft.schoolPassword}
            onSchoolPassword={draft.setSchoolPassword}
            passwordSet={data.schoolPasswordSet}
            demo={demo}
            bad={bad}
          />
          <PrivacyCard className="order-6" privacy={form.privacy} onChange={(field, value) => set("privacy", field, value)} bad={bad} />
        </div>
        <div className={column}>
          <UpdateCard className="order-3" {...rows} />
          <MaterialSitesCard className="order-4" />
          <FeaturesCard className="order-4" {...rows} />
          <SecurityCard className="order-5" {...rows} />
          <HomeworkCard className="order-5" {...rows} onPurge={purge} purging={purging} />
          <AppointmentsCard className="order-5" {...rows} />
          <MusterCard className="order-5" abWeek={abWeek} saved={data.settings.muster} {...rows} />
        </div>
      </div>
      <DangerZone onDone={reloadOverview} />
      {/* місце під плаваючою кнопкою телефона */}
      {draft.dirty && <div className="h-14 lg:hidden" />}
      <SaveButton {...draft} onSave={draft.save} floating />
    </section>
  );
};

// ─────────────────────────────────────────────────────────────
// «Einstellungen» адмінки (макети 45 телефон, 47 ПК)
// ─────────────────────────────────────────────────────────────
const AdminSettings = () => {
  const settings = useAdminStore((s) => s.settings);
  const reloadSettings = useAdminStore((s) => s.reloadSettings);

  // Щоразу при відкритті — свіжі налаштування (їх міг змінити інший пристрій)
  useEffect(() => {
    reloadSettings();
  }, [reloadSettings]);

  if (settings.status === "loading" || settings.status === "error") {
    return (
      <section className="flex flex-col gap-4">
        <AdminHeader title="Einstellungen" />
        {settings.status === "loading" ? <AdminSkeleton rows={5} /> : <AdminError error={settings.error} onRetry={reloadSettings} />}
      </section>
    );
  }
  return <SettingsForm key={JSON.stringify(settings.data)} data={settings.data} />;
};

export default AdminSettings;
