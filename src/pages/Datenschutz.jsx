import { useState } from "react";
import { useLocation } from "react-router-dom";
import { EyeOff, FileText, Server, Shield, Users } from "lucide-react";
import PrivacySection from "../components/datenschutz/PrivacySection";
import DeleteSyncNotes from "../components/sync/DeleteSyncNotes";
import PageHeader from "../components/ui/PageHeader";
import { FACTS, SECTIONS, STAND } from "../shared/datenschutz";
import { usePublicInfo } from "../shared/hooks/usePublicInfo";
import { longDate } from "../shared/utils/format";
import { responsibleText } from "../shared/utils/privacy";

const ICONS = { konten: Users, server: Server, notizen: FileText, tracking: EyeOff };

const Fact = ({ Icon, title, text }) => (
  <li className="flex gap-3">
    <Icon className="mt-0.5 size-4.5 shrink-0 text-accent" />
    <div>
      <h2 className="text-body font-bold text-ink">{title}</h2>
      <p className="mt-1 text-nav leading-5.25 text-muted">{text}</p>
    </div>
  </li>
);

// Экран «Datenschutz» (макет 27, часть 23). Сверху — коротко, как в макете; ниже «Genauer» — всё подробно, по разделам.
// Открывается и без входа: ссылка есть на экране «Zugang». Тексты — в shared/datenschutz.js.
// Внизу «Meine Sync-Notizen löschen» — только после входа и когда на устройстве есть Sync-Code.
const Datenschutz = () => {
  const info = usePublicInfo();
  const { pathname } = useLocation();
  const [openId, setOpenId] = useState(null); // открыт один раздел за раз — страница не превращается в простыню
  // /mehr/datenschutz — внутри приложения (меню и отступы даёт HomePage),
  // /datenschutz — отдельная страница с экрана входа
  const inApp = pathname.startsWith("/mehr");
  const Wrapper = inApp ? "div" : "main";

  return (
    <Wrapper className={inApp ? undefined : "mx-auto min-h-dvh w-full max-w-110 bg-paper px-gutter py-5"}>
      <PageHeader backTo={inApp ? "/mehr" : "/"} eyebrow="Kurz und ehrlich" title="Datenschutz" />

      <ul className="mt-5 flex flex-col gap-5">
        {FACTS.map((fact) => (
          <Fact key={fact.id} Icon={ICONS[fact.id]} title={fact.title} text={fact.text} />
        ))}
        <Fact Icon={Shield} title="Verantwortlich" text={responsibleText(info?.privacy)} />
      </ul>

      <h2 className="mt-7 text-hint font-extrabold text-faint">Genauer</h2>
      <ul className="mt-2.5 flex flex-col gap-2.5">
        {SECTIONS.map((section) => (
          <PrivacySection key={section.id} section={section} open={openId === section.id} onToggle={() => setOpenId(openId === section.id ? null : section.id)} />
        ))}
      </ul>
      <p className="mt-3 text-caption text-faint">
        Stand: {longDate(STAND)} {STAND.slice(0, 4)}
      </p>

      <DeleteSyncNotes />
    </Wrapper>
  );
};

export default Datenschutz;
