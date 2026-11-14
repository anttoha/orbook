import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Check, Plus, SlidersHorizontal, Undo2 } from "lucide-react";
import ClassSwitcher from "../components/klassen/ClassSwitcher";
import AddBlockList from "../components/start/AddBlockList";
import AddBlockSheet from "../components/start/AddBlockSheet";
import BlockSheet from "../components/start/BlockSheet";
import StartEmpty from "../components/start/StartEmpty";
import { EditGrid, StartGrid } from "../components/start/StartGrid";
import StartOffer from "../components/start/StartOffer";
import Button from "../components/ui/Button";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import PillButton from "../components/ui/PillButton";
import RoundButton from "../components/ui/RoundButton";
import { DESKTOP_QUERY, useMediaQuery } from "../shared/hooks/useMediaQuery";
import { useNow } from "../shared/hooks/useNow";
import { useT } from "../shared/hooks/useT";
import { usePlanStore } from "../shared/store/planStore";
import { useUserStore } from "../shared/store/userStore";
import { longDate, weekdayLong } from "../shared/utils/format";
import { addBlock, blockInfo, blocksOf, defaultBlocks, isBlockEnabled, moveBlock, nextSize, removeBlock, resizeBlock, setBlockOpt } from "../shared/utils/startBlocks";

// Кнопка-«таблетка» в шапке ПК: «Anpassen», «Zurücksetzen» (песочная) и «Fertig» (акцент)
const HeadButton = ({ primary = false, icon: Icon, onClick, children }) => (
  <PillButton
    glass={primary ? "filled" : "glass"}
    onClick={onClick}
    className={`flex h-11.5 items-center gap-2 rounded-full px-5.5 text-row font-bold transition-opacity active:opacity-80 ${primary ? "bg-accent text-on-accent" : "bg-sand text-ink"}`}
  >
    <Icon className="size-4.5" />
    {children}
  </PillButton>
);

// ─────────────────────────────────────────────────────────────
// «Start» (часть 30c, макеты handy-01…06, handy-15, pc-01, pc-02): блоки на сетке.
// /start — смотреть, /start/anpassen — «Anpassen» (отдельный адрес: «назад» выходит из режима,
// нижнее меню там прячется — вместо него «Block hinzufügen» и «Fertig»).
// Раскладка живёт в userStore.startBlocks; правят её чистые функции из shared/utils/startBlocks.js
// ─────────────────────────────────────────────────────────────
const Start = () => {
  const t = useT();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const editing = pathname === "/start/anpassen";
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const { today } = useNow();
  const features = usePlanStore((s) => s.me?.features);
  const saved = useUserStore((s) => s.startBlocks);
  const setBlocks = useUserStore((s) => s.setStartBlocks);
  const startView = useUserStore((s) => s.startView);
  const startOffer = useUserStore((s) => s.startOffer);
  const startSeen = useUserStore((s) => s.startSeen);
  const markStartSeen = useUserStore((s) => s.markStartSeen);
  const [sheetId, setSheetId] = useState(null); // шторка блока
  const [adding, setAdding] = useState(false); // шторка «Block hinzufügen»
  const [asking, setAsking] = useState(false); // вопрос «Start zurücksetzen?»

  // Start открыли — точка «neu» у «Start» в Darstellung гаснет (запись в стор, а не производное состояние)
  useEffect(() => {
    if (!startSeen) markStartSeen();
  }, [startSeen, markStartSeen]);

  const all = blocksOf(saved);
  const blocks = all.filter((b) => isBlockEnabled(blockInfo(b.kind), features)); // школа выключила раздел — блок не виден
  const sheetBlock = blocks.find((b) => b.id === sheetId) ?? null;

  // Убрать — сразу, с «Rückgängig» (как удаление заметки)
  const remove = (block) => {
    const before = saved;
    setSheetId(null);
    setBlocks(removeBlock(all, block.id));
    toast(t("{name} entfernt").replace("{name}", t(blockInfo(block.kind).label)), { duration: 6000, action: { label: t("Rückgängig"), onClick: () => setBlocks(before) } });
  };
  const add = (kind) => {
    setBlocks(addBlock(all, kind));
    if (!isDesktop) setAdding(false);
  };
  const reset = () => {
    setBlocks(defaultBlocks());
    setAsking(false);
  };
  const done = () => navigate("/start", { replace: true });

  const head = (
    <header className="flex items-end justify-between gap-3">
      <div className="min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          {!editing && <ClassSwitcher />}
          <p className="truncate text-hint font-extrabold text-faint">{editing ? t("Start") : `${weekdayLong(today)} · ${longDate(today)}`}</p>
        </div>
        <h1 className="truncate text-title text-ink lg:text-hero">{t(editing ? "Anpassen" : "Start")}</h1>
      </div>
      {isDesktop ? (
        <div className="flex shrink-0 gap-2.5">
          {editing ? (
            <>
              <HeadButton icon={Undo2} onClick={() => setAsking(true)}>
                {t("Zurücksetzen")}
              </HeadButton>
              <HeadButton primary icon={Check} onClick={done}>
                {t("Fertig")}
              </HeadButton>
            </>
          ) : (
            <HeadButton icon={SlidersHorizontal} onClick={() => navigate("/start/anpassen")}>
              {t("Anpassen")}
            </HeadButton>
          )}
        </div>
      ) : editing ? (
        <RoundButton aria-label={t("Zurücksetzen")} onClick={() => setAsking(true)}>
          <Undo2 className="size-4.5" />
        </RoundButton>
      ) : (
        <RoundButton aria-label={t("Anpassen")} to="/start/anpassen">
          <SlidersHorizontal className="size-4.5" />
        </RoundButton>
      )}
    </header>
  );

  const grid = editing ? (
    <EditGrid
      blocks={blocks}
      onMove={(id, overId) => setBlocks(moveBlock(all, id, overId))}
      onOpen={(block) => setSheetId(block.id)}
      onRemove={remove}
      onResize={(block) => setBlocks(resizeBlock(all, block.id, nextSize(block)))}
    />
  ) : (
    <StartGrid blocks={blocks} />
  );

  return (
    <section className="flex flex-1 flex-col gap-3.5 lg:gap-6">
      {head}
      {!editing && startView !== "start" && startOffer == null && <StartOffer />}

      {blocks.length === 0 && !(editing && isDesktop) ? (
        <StartEmpty onAdd={() => setAdding(true)} />
      ) : (
        <div className="lg:flex lg:items-start lg:gap-4">
          <div className="min-w-0 lg:flex-1">{grid}</div>
          {/* ПК, «Anpassen»: справа список всех блоков (макет pc-02) */}
          {editing && isDesktop && (
            <aside className="w-blocks shrink-0 rounded-card bg-card px-4.5 pt-4 pb-1">
              <h2 className="pb-2 text-subhead text-ink">{t("Blöcke")}</h2>
              <AddBlockList blocks={all} onAdd={add} />
            </aside>
          )}
        </div>
      )}

      {/* Телефон, «Anpassen»: вместо нижнего меню — «Block hinzufügen» и «Fertig» (макет handy-02) */}
      {editing && !isDesktop && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10 bg-linear-to-t from-paper to-transparent pt-10 pb-5.5">
          <div className="pointer-events-auto mx-4 flex gap-1.5 rounded-full border border-hair bg-card p-1.75 shadow-menu">
            <Button onClick={() => setAdding(true)} className="h-11 grow-[1.4]">
              <Plus className="size-4.5" />
              {t("Block hinzufügen")}
            </Button>
            <Button variant="primary" onClick={done} className="h-11">
              <Check className="size-4.5" />
              {t("Fertig")}
            </Button>
          </div>
        </div>
      )}

      <BlockSheet
        block={sheetBlock}
        onClose={() => setSheetId(null)}
        onSize={(size) => setBlocks(resizeBlock(all, sheetBlock.id, size))}
        onOpt={(key, value) => setBlocks(setBlockOpt(all, sheetBlock.id, key, value))}
        onRemove={() => remove(sheetBlock)}
      />
      <AddBlockSheet open={adding} onClose={() => setAdding(false)} blocks={all} onAdd={add} />
      <ConfirmDialog open={asking} onClose={() => setAsking(false)} title={t("Start zurücksetzen?")} text={t("Die Blöcke kommen so zurück, wie sie am Anfang waren.")}>
        <Button onClick={() => setAsking(false)}>{t("Abbrechen")}</Button>
        <Button variant="primary" onClick={reset}>
          {t("Zurücksetzen")}
        </Button>
      </ConfirmDialog>
    </section>
  );
};

export default Start;
