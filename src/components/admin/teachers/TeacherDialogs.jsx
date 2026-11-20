import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";
import * as admin from "../../../shared/api/admin";
import { useAdminStore } from "../../../shared/store/adminStore";
import { cn } from "../../../shared/utils/cn";
import { teacherTitle } from "../../../shared/utils/teachers";
import { translate } from "../../../shared/i18n/translate";
import { useT } from "../../../shared/hooks/useT";
import Button from "../../ui/Button";
import ConfirmDialog from "../../ui/ConfirmDialog";
import { TrashIcon } from "../../ui/icons";
import Liquid from "../../ui/Liquid";
import Sheet from "../../ui/Sheet";
import { teacherActions } from "./teacherActions";

// Handy: das Blatt mit den Aktionen einer Lehrkraft (Entwurf 34 handy-06)
export const TeacherActionsSheet = ({ teacher, names, onChoose, onClose }) => {
  const t = useT();
  const subjects = teacher.subjects.map((code) => names[code] || code).join(", ");
  return (
    <Sheet open onClose={onClose} desktop="dialog" eyebrow={teacher.name ? teacher.short : t("Lehrkraft")} title={teacherTitle(teacher)}>
      {subjects && <p className="-mt-2 text-body-sm text-muted">{subjects}</p>}
      <Liquid as="ul" refract press={false} className="divide-y divide-hair rounded-card bg-card px-3.5">
        {teacherActions(teacher).map((item) => (
          <li key={item.kind}>
            <button type="button" onClick={() => onChoose(item.kind, teacher)} className={cn("flex h-12.5 w-full items-center gap-3.25 text-left", item.danger ? "text-danger" : "text-ink")}>
              <item.icon className={cn("size-4.5 shrink-0", item.danger ? "text-danger" : "text-muted")} />
              <span className="flex-1 text-row font-medium">{item.label}</span>
              {!item.danger && <ChevronRight className="size-4 shrink-0 text-faint2" />}
            </button>
          </li>
        ))}
      </Liquid>
    </Sheet>
  );
};

// «Löschen?» — nur für eigene Lehrkräfte; die Einträge und der Lehrer-Code bleiben
export const TeacherDeleteDialog = ({ teacher, names, onClose }) => {
  const t = useT();
  const reloadTeachers = useAdminStore((s) => s.reloadTeachers);
  const [busy, setBusy] = useState(false);
  const title = teacherTitle(teacher);
  const subjects = teacher.subjects.map((code) => names[code] || code).join(", ");

  const remove = async () => {
    setBusy(true);
    try {
      await admin.deleteTeacher(teacher.short);
      await reloadTeachers();
      toast.success(translate("„{name}“ gelöscht", { name: title }));
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ConfirmDialog open onClose={onClose} icon={<TrashIcon className="size-6.5 text-danger" />} title={t("„{name}“ löschen?", { name: title })} text={t("{name} darf dann keine Materialien und Termine für {subjects} mehr eintragen. Bisherige Einträge und der Lehrer-Code bleiben.", { name: title, subjects })}>
      <Button onClick={onClose}>{t("Abbrechen")}</Button>
      <Button variant="danger" disabled={busy} onClick={remove}>
        <TrashIcon className="size-4" /> {t("Löschen")}
      </Button>
    </ConfirmDialog>
  );
};
