import { Clock } from "lucide-react";
import { KeyIcon, LockIcon, PencilIcon, RenewIcon, TrashIcon } from "../ui/icons";

// Пункти меню «Code-Aktionen» (макети 43 і 45). kind — яке вікно відкрити.
// hint — сірий підпис праворуч у шторці телефона
export const codeActions = (code) => [
  { kind: "rename", label: "Umbenennen", icon: PencilIcon },
  { kind: "rights", label: "Rechte ändern", icon: KeyIcon },
  { kind: "validity", label: "Gültigkeit", icon: Clock },
  { kind: "regenerate", label: "Neu erzeugen", icon: RenewIcon, hint: "alter Code geht nicht mehr" },
  { kind: "lock", label: code.active ? "Sperren" : "Entsperren", icon: LockIcon },
  { kind: "delete", label: "Löschen", icon: TrashIcon, danger: true },
];
