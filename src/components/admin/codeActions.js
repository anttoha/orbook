import { Clock, Eye } from "lucide-react";
import { KeyIcon, LockIcon, PencilIcon, RenewIcon, TrashIcon } from "../ui/icons";
import { translate } from "../../shared/i18n/translate";

// Пункти меню «Code-Aktionen» (макети 43 і 45). kind — яке вікно відкрити.
// hint — сірий підпис праворуч у шторці телефона
export const codeActions = (code) => [
  { kind: "show", label: translate("Code anzeigen"), icon: Eye }, // полный код ещё раз (владелец 14.11)
  { kind: "rename", label: translate("Umbenennen"), icon: PencilIcon },
  { kind: "rights", label: translate("Rechte ändern"), icon: KeyIcon },
  { kind: "validity", label: translate("Gültigkeit"), icon: Clock },
  { kind: "regenerate", label: translate("Neu erzeugen"), icon: RenewIcon, hint: translate("alter Code geht nicht mehr") },
  { kind: "lock", label: code.active ? translate("Sperren") : translate("Entsperren"), icon: LockIcon },
  { kind: "delete", label: translate("Löschen"), icon: TrashIcon, danger: true },
];
