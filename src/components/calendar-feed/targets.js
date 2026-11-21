import { CalendarDays, Mail, Smartphone } from "lucide-react";
import { CopyIcon } from "../ui/icons";

// Куда добавить абонемент (макеты handy-03 и pc-02). link — ключ из calendarLinks(); copy — копировать.
// Google обновляет подписки раз в несколько часов — это стоит знать заранее, поэтому так и написано
export const TARGETS = [
  { key: "google", icon: CalendarDays, title: "Google Kalender", hint: "Aktualisiert alle paar Stunden", external: true },
  { key: "apple", icon: Smartphone, title: "Apple Kalender", hint: "iPhone, iPad und Mac" },
  { key: "outlook", icon: Mail, title: "Outlook", hint: "Outlook.com und Microsoft 365", external: true },
  { key: "copy", icon: CopyIcon, title: "Anderer Kalender", hint: "Link kopieren und dort einfügen" },
];
