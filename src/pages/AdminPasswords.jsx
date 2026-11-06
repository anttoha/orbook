import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import AdminHeader from "../components/admin/AdminHeader";
import { AdminError, AdminNote, AdminSkeleton } from "../components/admin/AdminState";
import AdminPasswordForm from "../components/admin/passwords/AdminPasswordForm";
import ClassPasswordForm from "../components/admin/passwords/ClassPasswordForm";
import { useNow } from "../shared/hooks/useNow";
import { useAdminStore } from "../shared/store/adminStore";
import { classPasswordText } from "../shared/utils/admin";

// ─────────────────────────────────────────────────────────────
// «Passwörter» (частина 14b): пароль класу і пароль адміна в одному місці.
// Із сервера потрібна тільки дата останньої зміни пароля класу (GET /admin/settings).
// ─────────────────────────────────────────────────────────────
const AdminPasswords = () => {
  const { schoolClass } = useOutletContext() ?? {};
  const { today } = useNow();
  const settings = useAdminStore((s) => s.settings);
  const reloadSettings = useAdminStore((s) => s.reloadSettings);
  const reloadOverview = useAdminStore((s) => s.reloadOverview);

  // Щоразу при відкритті — свіжа дата (пароль міг змінити інший пристрій)
  useEffect(() => {
    reloadSettings();
  }, [reloadSettings]);

  // «Seit 10. Sept · vor 12 Tagen»; дата невідома (null) — без підпису
  const text = classPasswordText(settings.data?.classPasswordChangedAt, today);
  const since = text && [text.since, text.ago].join(" · ");
  const afterClassChange = () => {
    reloadSettings();
    reloadOverview(); // «Übersicht → Schnell» теж показує дату
  };

  const renderBody = () => {
    if (settings.status === "loading") return <AdminSkeleton rows={4} />;
    if (settings.status === "error") return <AdminError error={settings.error} onRetry={reloadSettings} />;
    return (
      <>
        <AdminNote>Gespeichert wird nur ein Hash. Auch du kannst ein Passwort später nicht mehr ansehen.</AdminNote>
        <div className="flex flex-col gap-7 lg:grid lg:grid-cols-2 lg:items-start lg:gap-5">
          <ClassPasswordForm since={since} schoolClass={schoolClass} onChanged={afterClassChange} />
          <AdminPasswordForm />
        </div>
      </>
    );
  };

  return (
    <section className="flex flex-col gap-5">
      <AdminHeader title="Passwörter" backTo="/admin/einstellungen" />
      {renderBody()}
    </section>
  );
};

export default AdminPasswords;
