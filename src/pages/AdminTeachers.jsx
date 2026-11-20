import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import AdminHeader from "../components/admin/AdminHeader";
import { AdminEmpty, AdminError, AdminSkeleton } from "../components/admin/AdminState";
import SearchField from "../components/admin/SearchField";
import TeacherCard from "../components/admin/teachers/TeacherCard";
import { TeacherActionsSheet, TeacherDeleteDialog } from "../components/admin/teachers/TeacherDialogs";
import TeacherFormSheet from "../components/admin/teachers/TeacherFormSheet";
import TeacherTable from "../components/admin/teachers/TeacherTable";
import Button from "../components/ui/Button";
import Liquid from "../components/ui/Liquid";
import RoundButton from "../components/ui/RoundButton";
import * as admin from "../shared/api/admin";
import { useAdminLoad } from "../shared/hooks/useAdminLoad";
import { DESKTOP_QUERY, useMediaQuery } from "../shared/hooks/useMediaQuery";
import { useT } from "../shared/hooks/useT";
import { translate } from "../shared/i18n/translate";
import { useAdminStore } from "../shared/store/adminStore";
import { shownName } from "../shared/utils/admin";
import { matchesTeacher, teacherCount, teacherTitle } from "../shared/utils/teachers";

// ─────────────────────────────────────────────────────────────
// «Lehrkräfte» (часть 34, design/neu/34-lehrkraefte-verwalten, «ок дизайн» 2026-11-20):
// учителя из плана плюс те, кого админ добавил или поправил — имя, Kürzel, Fächer.
// Список — GET /api/admin/teachers; Fächer класса для выбора — GET /api/admin/courses.
// ─────────────────────────────────────────────────────────────
const AdminTeachers = () => {
  const t = useT();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const teachers = useAdminStore((s) => s.teachers);
  const reloadTeachers = useAdminStore((s) => s.reloadTeachers);
  const codes = useAdminStore((s) => s.codes.data?.codes);
  const reloadCodes = useAdminStore((s) => s.reloadCodes);
  const courses = useAdminLoad("courses", admin.loadAdminCourses);
  const [query, setQuery] = useState("");
  const [dialog, setDialog] = useState(null); // { kind: "form" | "menu" | "delete", teacher }

  useEffect(() => {
    reloadTeachers();
    reloadCodes(); // Ende des Lehrer-Codes in der Liste
  }, [reloadTeachers, reloadCodes]);

  const subjects = (courses.data?.subjects ?? []).map((subject) => ({ code: subject.code, name: shownName(subject) }));
  const names = Object.fromEntries(subjects.map((subject) => [subject.code, subject.name]));
  const all = teachers.data?.teachers ?? [];
  const list = all.filter((teacher) => matchesTeacher(teacher, query));
  const codeText = (teacher) => {
    if (!teacher.codeId) return null;
    const masked = codes?.find((code) => code.id === teacher.codeId)?.masked;
    return masked ? `${masked} · ${t("aktiv")}` : t("Lehrer-Code aktiv");
  };

  const patch = async (teacher, body, message) => {
    try {
      await admin.updateTeacher(teacher.short, body);
      await reloadTeachers();
      toast.success(message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Eine Aktion aus dem Menü (Handy-Blatt oder PC-Dropdown)
  const choose = async (kind, teacher) => {
    setDialog(null);
    if (kind === "edit") setDialog({ kind: "form", teacher });
    else if (kind === "delete") setDialog({ kind: "delete", teacher });
    else if (kind === "code") navigate(teacher.codeId ? "/admin/lehrer" : "/admin/lehrer?neu=1");
    else if (kind === "hide") await patch(teacher, { hidden: !teacher.hidden }, teacher.hidden ? translate("„{name}“ eingeblendet", { name: teacherTitle(teacher) }) : translate("„{name}“ ausgeblendet", { name: teacherTitle(teacher) }));
    else if (kind === "reset") {
      try {
        await admin.deleteTeacher(teacher.short);
        await reloadTeachers();
        toast.success(translate("„{name}“ zurückgesetzt", { name: teacherTitle(teacher) }));
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const openNew = () => setDialog({ kind: "form", teacher: null });
  const addButton = isDesktop ? (
    <Button variant="primary" className="flex-none px-5" onClick={openNew}>
      <Plus className="size-4.5" /> {t("Neue Lehrkraft")}
    </Button>
  ) : (
    <RoundButton aria-label={t("Neue Lehrkraft")} onClick={openNew} look="grid size-9.5 place-items-center rounded-full bg-accent text-on-accent">
      <Plus className="size-5" />
    </RoundButton>
  );

  const renderList = () => {
    if (teachers.status === "loading") return <AdminSkeleton rows={5} />;
    if (teachers.status === "error") return <AdminError error={teachers.error} onRetry={reloadTeachers} />;
    if (!all.length) {
      return (
        <AdminEmpty text={t("Keine Lehrkräfte")}>
          <p className="text-caption text-faint">{t("Im Plan stehen noch keine. Sobald er da ist, erscheinen sie hier — oder trag selbst eine ein.")}</p>
          <Button variant="primary" className="flex-none px-5" onClick={openNew}>
            <Plus className="size-4.5" /> {t("Lehrkraft hinzufügen")}
          </Button>
        </AdminEmpty>
      );
    }
    if (!list.length) return <AdminEmpty text={t("Keine Lehrkraft passt zur Suche.")} />;
    if (!isDesktop) {
      return (
        <>
          <p className="mb-2.5 text-hint font-extrabold text-faint">{teacherCount(all)}</p>
          <ul className="flex flex-col gap-2.5">
            {list.map((teacher) => (
              <TeacherCard key={teacher.short} teacher={teacher} names={names} codeText={codeText(teacher)} onOpenSheet={() => setDialog({ kind: "menu", teacher })} />
            ))}
          </ul>
        </>
      );
    }
    return (
      <Liquid as="div" refract press={false} className="rounded-card bg-card px-5 pt-4.5 pb-1">
        <TeacherTable teachers={list} names={names} codeText={codeText} onAction={choose} />
      </Liquid>
    );
  };

  return (
    <section className="flex flex-col gap-4 lg:gap-5">
      <AdminHeader title={t("Lehrkräfte")} backTo="/admin/einstellungen" actions={[isDesktop && <SearchField key="search" value={query} onChange={setQuery} placeholder={t("Lehrkraft suchen")} className="w-50" />, <span key="add">{addButton}</span>]} />
      <div>{renderList()}</div>

      {dialog?.kind === "form" && <TeacherFormSheet key={dialog.teacher?.short ?? "neu"} teacher={dialog.teacher} classSubjects={subjects} onClose={() => setDialog(null)} />}
      {dialog?.kind === "menu" && <TeacherActionsSheet teacher={dialog.teacher} names={names} onChoose={choose} onClose={() => setDialog(null)} />}
      {dialog?.kind === "delete" && <TeacherDeleteDialog teacher={dialog.teacher} names={names} onClose={() => setDialog(null)} />}
    </section>
  );
};

export default AdminTeachers;
