import { useLocation } from "react-router-dom";
import { EyeOff, FileText, Server, Shield, Users } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import { usePublicInfo } from "../shared/hooks/usePublicInfo";
import { responsibleText } from "../shared/utils/privacy";

const FACTS = [
  { Icon: Users, title: "Keine Konten", text: "Keine Namen, keine E-Mails. Die Klasse öffnet die App mit einem gemeinsamen Passwort." },
  { Icon: Server, title: "Was auf dem Server liegt", text: "Der Stundenplan der Klasse und die Klausurenliste: Fach, Datum, Art, Thema — ohne Autor." },
  { Icon: FileText, title: "Deine Notizen", text: "Bleiben auf deinem Gerät. Beim Synchronisieren liegen sie unter einem zufälligen Code, der nicht mit dir verknüpft ist." },
  // Текст точніший за макет: сервер ставить ще cookie, що рахує неправильні паролі (docs/frontend/07-einstellungen.md)
  { Icon: EyeOff, title: "Kein Tracking", text: "Keine Werbung, keine Analyse, keine Cookies außer Anmeldung und Schutz vor Fehlversuchen." },
];

const Fact = ({ Icon, title, text }) => (
  <li className="flex gap-3">
    <Icon className="mt-0.5 size-4.5 shrink-0 text-accent" />
    <div>
      <h2 className="text-body font-bold text-ink">{title}</h2>
      <p className="mt-1 text-nav leading-5.25 text-muted">{text}</p>
    </div>
  </li>
);

// Екран «Datenschutz» (макет 27). Відкривається і без входу: посилання є на екрані «Zugang».
// Кнопка «Meine Sync-Notizen löschen» з'явиться разом із синхронізацією нотаток (частина 11).
const Datenschutz = () => {
  const info = usePublicInfo();
  const from = useLocation().state?.from;

  return (
    <main className="mx-auto min-h-dvh w-full max-w-110 bg-paper px-gutter py-5">
      {/* З «Mehr» повертаємось туди, з екрана входу — на нього */}
      <PageHeader backTo={from ?? "/"} eyebrow="Kurz und ehrlich" title="Datenschutz" />

      <ul className="mt-5 flex flex-col gap-5">
        {FACTS.map((fact) => (
          <Fact key={fact.title} {...fact} />
        ))}
        <Fact Icon={Shield} title="Verantwortlich" text={responsibleText(info?.privacy)} />
      </ul>
    </main>
  );
};

export default Datenschutz;
