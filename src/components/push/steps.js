import { Bell, Check, Lock, Share, SquarePlus } from "lucide-react";

// Шаги для InstallSteps (часть 17). icon: "app" — значок ORBook
// iPhone: Safari → Teilen → Zum Home-Bildschirm → открыть с рабочего стола
export const IOS_STEPS = [
  { text: [["Unten auf ", false], ["Teilen", true], [" tippen", false]], icon: Share },
  { text: [["„", false], ["Zum Home-Bildschirm", true], ["“ wählen", false]], icon: SquarePlus },
  { text: [["ORBook vom ", false], ["Home-Bildschirm", true], [" öffnen", false]], icon: "app" },
];

// Mitteilungen когда-то запретили: как разрешить снова (Chrome на Android)
export const BLOCKED_STEPS = [
  { text: [["Oben links auf das ", false], ["Schloss", true], [" tippen", false]], icon: Lock },
  { text: [["Berechtigungen", true], [" → ", false], ["Mitteilungen", true]], icon: Bell },
  { text: [["„", false], ["Zulassen", true], ["“ wählen", false]], icon: Check },
];
