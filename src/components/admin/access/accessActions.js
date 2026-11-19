import { Clock, Eye, QrCode, Smartphone } from "lucide-react";
import { LockIcon, PencilIcon, RenewIcon, TrashIcon } from "../../ui/icons";
import { translate } from "../../../shared/i18n/translate";

// Пункти меню Zugangscode (макети 14c handy-04, pc-04). kind — яке вікно відкрити.
// sheetLabel / hint — підпис і сірий текст праворуч у шторці телефона; label — у меню ПК
// Перший пункт «Einladen» (частина 16) — у будь-якого коду (власник 07.11: і в особистого — посилання замість коду)
export const accessActions = (code) => [
  { kind: "invite", label: translate("Einladen · Link und QR"), sheetLabel: translate("Einladen"), hint: translate("Link + QR"), icon: QrCode, accent: true },
  { kind: "show", label: translate("Code anzeigen"), icon: Eye }, // повний код ще раз (власник 07.11)
  { kind: "rename", label: translate("Umbenennen"), icon: PencilIcon },
  { kind: "limit", label: translate("Geräte-Limit ändern"), sheetLabel: translate("Geräte-Limit"), icon: Smartphone },
  { kind: "validity", label: translate("Gültigkeit ändern"), sheetLabel: translate("Gültigkeit"), icon: Clock },
  { kind: "signout", label: code.devices ? translate("Alle {devices} Geräte abmelden", { devices: code.devices }) : translate("Geräte abmelden"), sheetLabel: translate("Geräte abmelden"), icon: Smartphone },
  { kind: "regenerate", label: translate("Neu erzeugen"), icon: RenewIcon, hint: translate("neuer Code") },
  { kind: "lock", label: code.active ? translate("Sperren") : translate("Entsperren"), icon: LockIcon },
  { kind: "delete", label: translate("Löschen"), icon: TrashIcon, danger: true },
];

// Рядок «Klassenpasswort»: змінити пароль (сторінка 14b), вийти всім, увімкнути/вимкнути
export const passwordActions = (password) => [
  { kind: "password-change", label: translate("Passwort ändern"), icon: PencilIcon },
  { kind: "password-signout", label: translate("Geräte abmelden"), icon: Smartphone },
  { kind: "password-toggle", label: password.enabled ? "Ausschalten" : translate("Einschalten"), icon: LockIcon },
];
