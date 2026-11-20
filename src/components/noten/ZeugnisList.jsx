import { useT } from "../../shared/hooks/useT";
import { finalsLine } from "../../shared/utils/noten";
import GradePill from "./GradePill";
import { SubjectRow } from "./SubjectList";

// «Zeugnis»: только оценки, которые выставила школа (finals). ORBook их не считает
const ZeugnisList = ({ subjects, selected }) => {
  const t = useT();
  return (
    <section>
      <h2 className="mb-2.5 text-hint font-extrabold text-faint">{t("Fächer")}</h2>
      <ul className="divide-y divide-hair rounded-card bg-card px-3.5 py-1">
        {subjects.map((s) => (
          <SubjectRow
            key={s.code}
            to={`/noten/${s.code}?hj=zeugnis`}
            code={s.code}
            name={s.name}
            sub={[finalsLine(s.finals), s.last.note].filter(Boolean).join(" · ")}
            pill={<GradePill text={s.last.grade} value={s.last.value} />}
            selected={selected === s.code}
          />
        ))}
      </ul>
    </section>
  );
};

export default ZeugnisList;
