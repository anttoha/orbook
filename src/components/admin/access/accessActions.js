import { Clock, Eye, QrCode, Smartphone } from "lucide-react";
import { LockIcon, PencilIcon, RenewIcon, TrashIcon } from "../../ui/icons";

// Пункти меню Zugangscode (макети 14c handy-04, pc-04). kind — яке вікно відкрити.
// sheetLabel / hint — підпис і сірий текст праворуч у шторці телефона; label — у меню ПК
// Перший пункт «Einladen» (частина 16) — у будь-якого коду (власник 07.11: і в особистого — посилання замість коду)
export const accessActions = (code) => [
  { kind: "invite", label: "Einladen · Link und QR", sheetLabel: "Einladen", hint: "Link + QR", icon: QrCode, accent: true },
  { kind: "show", label: "Code anzeigen", icon: Eye }, // повний код ще раз (власник 07.11)
  { kind: "rename", label: "Umbenennen", icon: PencilIcon },
  { kind: "limit", label: "Geräte-Limit ändern", sheetLabel: "Geräte-Limit", icon: Smartphone },
  { kind: "validity", label: "Gültigkeit ändern", sheetLabel: "Gültigkeit", icon: Clock },
  { kind: "signout", label: code.devices ? `Alle ${code.devices} Geräte abmelden` : "Geräte abmelden", sheetLabel: "Geräte abmelden", icon: Smartphone },
  { kind: "regenerate", label: "Neu erzeugen", icon: RenewIcon, hint: "neuer Code" },
  { kind: "lock", label: code.active ? "Sperren" : "Entsperren", icon: LockIcon },
  { kind: "delete", label: "Löschen", icon: TrashIcon, danger: true },
];

// Рядок «Klassenpasswort»: змінити пароль (сторінка 14b), вийти всім, увімкнути/вимкнути
export const passwordActions = (password) => [
  { kind: "password-change", label: "Passwort ändern", icon: PencilIcon },
  { kind: "password-signout", label: "Geräte abmelden", icon: Smartphone },
  { kind: "password-toggle", label: password.enabled ? "Ausschalten" : "Einschalten", icon: LockIcon },
];
