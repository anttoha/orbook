import { useEffect, useState } from "react";
import { changelog } from "../shared/changelog";
import { hasNews } from "../shared/utils/changelog";
import EntryCard from "../components/changelog/EntryCard";
import PageHeader from "../components/ui/PageHeader";
import { useUserStore } from "../shared/store/userStore";

// «Neuigkeiten» (часть 22b): все версии, новейшая открыта. Открыл страницу — значит, увидел: метка NEU в «Mehr» гаснет.
const Neuigkeiten = () => {
  const markNewsRead = useUserStore((s) => s.markNewsRead);
  const [openVersion, setOpenVersion] = useState(changelog[0]?.version);
  // «NEU» на самой версии остаётся, пока страница открыта: считаем один раз при входе
  const [wasNew] = useState(() => hasNews(useUserStore.getState().readNews, changelog));

  useEffect(() => {
    markNewsRead();
  }, [markNewsRead]);

  return (
    <div className="flex flex-col gap-4.5">
      <PageHeader backTo="/mehr" eyebrow="Mehr" title="Neuigkeiten" />
      <p className="hidden text-label text-muted lg:block">Was sich geändert hat. Das Neueste steht oben.</p>
      <ul className="flex flex-col gap-2.5">
        {changelog.map((entry, i) => (
          <EntryCard key={entry.version} index={i} entry={entry} open={openVersion === entry.version} isNew={wasNew && i === 0} onToggle={() => setOpenVersion(openVersion === entry.version ? null : entry.version)} />
        ))}
      </ul>
    </div>
  );
};

export default Neuigkeiten;
