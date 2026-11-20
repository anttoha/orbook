import { Eye, EyeOff } from "lucide-react";
import { KeyIcon, PencilIcon, RenewIcon, TrashIcon } from "../../ui/icons";
import { canDelete, canReset } from "../../../shared/utils/teachers";
import { translate } from "../../../shared/i18n/translate";

// Punkte im Menü «⋮» einer Lehrkraft (Handy: Blatt, PC: Dropdown). kind sagt, was passiert
export const teacherActions = (teacher) => [
  { kind: "edit", label: translate("Bearbeiten"), icon: PencilIcon },
  { kind: "code", label: translate("Lehrer-Code"), icon: KeyIcon },
  ...(canReset(teacher) ? [{ kind: "reset", label: translate("Auf Plan zurücksetzen"), icon: RenewIcon }] : []),
  ...(canDelete(teacher) ? [] : [{ kind: "hide", label: teacher.hidden ? translate("Einblenden") : translate("Ausblenden"), icon: teacher.hidden ? Eye : EyeOff }]),
  ...(canDelete(teacher) ? [{ kind: "delete", label: translate("Löschen"), icon: TrashIcon, danger: true }] : []),
];
