import { useLocation } from "react-router-dom";
import { EyeOff, FileText, Server, Shield, Users } from "lucide-react";
import DeleteSyncNotes from "../components/sync/DeleteSyncNotes";
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
// Унизу «Meine Sync-Notizen löschen» — тільки після входу і коли на пристрої є Sync-Code.
const Datenschutz = () => {
  const info = usePublicInfo();
  const { pathname } = useLocation();
  // /mehr/datenschutz — усередині застосунку (меню і відступи дає HomePage),
  // /datenschutz — окрема сторінка з екрана входу
  const inApp = pathname.startsWith("/mehr");
  const Wrapper = inApp ? "div" : "main";

  return (
    <Wrapper className={inApp ? undefined : "mx-auto min-h-dvh w-full max-w-110 bg-paper px-gutter py-5"}>
      <PageHeader backTo={inApp ? "/mehr" : "/"} eyebrow="Kurz und ehrlich" title="Datenschutz" />

      <ul className="mt-5 flex flex-col gap-5">
        {FACTS.map((fact) => (
          <Fact key={fact.title} {...fact} />
        ))}
        <Fact Icon={Shield} title="Verantwortlich" text={responsibleText(info?.privacy)} />
      </ul>
      <DeleteSyncNotes />
    </Wrapper>
  );
};

export default Datenschutz;
