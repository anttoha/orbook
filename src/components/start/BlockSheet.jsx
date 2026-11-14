import { useT } from "../../shared/hooks/useT";
import SizeTile from "./SizeTile";
import { blockInfo, COUNTS, SIZES } from "../../shared/utils/startBlocks";
import SettingRow from "../more/SettingRow";
import Button from "../ui/Button";
import { TrashIcon } from "../ui/icons";
import ListCard from "../ui/ListCard";
import Segmented from "../ui/Segmented";
import Sheet from "../ui/Sheet";
import Switch from "../ui/Switch";

const COUNT_OPTIONS = COUNTS.map((n) => ({ value: n, label: String(n) }));

// ─────────────────────────────────────────────────────────────
// Шторка блока в «Anpassen» (макет handy-03): Größe, настройки блока, «Vom Start entfernen».
// Размеры, которых у блока нет, — бледные. Всё действует сразу
// ─────────────────────────────────────────────────────────────
const BlockSheet = ({ block, onClose, onSize, onOpt, onRemove }) => {
  const t = useT();
  const info = block ? blockInfo(block.kind) : null;
  const hasCount = block?.opts.count != null;
  const hasMine = block?.opts.mine != null;

  return (
    <Sheet open={Boolean(block)} onClose={onClose} desktop="dialog" eyebrow={t("Block")} title={info ? t(info.label) : ""}>
      {info && (
        <div className="flex flex-col gap-4.5">
          <div>
            <h3 className="mb-2.5 text-hint font-extrabold text-faint">{t("Größe")}</h3>
            <div className="flex gap-2.5">
              {SIZES.map((size) => (
                <SizeTile key={size} size={size} selected={block.size === size} disabled={!info.sizes.includes(size)} onSelect={onSize} />
              ))}
            </div>
          </div>

          {(hasCount || hasMine) && (
            <ListCard>
              {hasCount && (
                <SettingRow label="Einträge">
                  <Segmented label="Einträge" size="form" className="w-fit" options={COUNT_OPTIONS} value={block.opts.count} onChange={(n) => onOpt("count", n)} />
                </SettingRow>
              )}
              {hasMine && (
                <SettingRow label="Nur meine Kurse">
                  <Switch label="Nur meine Kurse" checked={block.opts.mine} onChange={(on) => onOpt("mine", on)} />
                </SettingRow>
              )}
            </ListCard>
          )}

          <Button variant="danger" onClick={onRemove} className="flex-none">
            <TrashIcon className="size-4.5" />
            {t("Vom Start entfernen")}
          </Button>
        </div>
      )}
    </Sheet>
  );
};

export default BlockSheet;
