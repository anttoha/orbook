import { useEffect } from "react";
import { useT } from "../../shared/hooks/useT";
import { useMaterials } from "../../shared/store/materialsStore";
import { subjectName } from "../../shared/utils/format";
import { latestMaterials } from "../../shared/utils/startData";
import BlockCard from "./BlockCard";
import BlockEmpty from "./BlockEmpty";
import BlockSkeleton from "./BlockSkeleton";

// ─────────────────────────────────────────────────────────────
// Блок «Materialien»: две новые ссылки класса — название и предмет
// ─────────────────────────────────────────────────────────────
const MaterialienBlock = ({ editing }) => {
  const t = useT();
  const items = useMaterials((s) => s.items);
  const status = useMaterials((s) => s.status);
  const load = useMaterials((s) => s.load);
  const list = latestMaterials(items, 2);

  // список грузится только когда нужен: первый показ блока — первый запрос
  useEffect(() => {
    if (useMaterials.getState().status === "idle") load();
  }, [load]);

  const body = () => {
    if (!list.length) return status === "loading" || status === "idle" ? <BlockSkeleton /> : <BlockEmpty text="Noch keine Links" />;
    return (
      <ul className="flex flex-col gap-2">
        {list.map((item) => (
          <li key={item.id} className="min-w-0">
            <p className="truncate text-body-sm font-extrabold text-ink">{item.title}</p>
            <p className="truncate text-caption text-faint">{subjectName(item.subject)}</p>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <BlockCard kind="materialien" title={t("Materialien")} to="/materialien" editing={editing}>
      {body()}
    </BlockCard>
  );
};

export default MaterialienBlock;
