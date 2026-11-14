import { useState } from "react";
import { useBlocker } from "react-router-dom";
import { toast } from "sonner";
import { Layers } from "lucide-react";
import AdminHeader from "../components/admin/AdminHeader";
import { AdminError, AdminSkeleton } from "../components/admin/AdminState";
import AbChoice from "../components/admin/muster/AbChoice";
import AbSwitch from "../components/admin/muster/AbSwitch";
import LessonEditor from "../components/admin/muster/LessonEditor";
import MusterGrid from "../components/admin/muster/MusterGrid";
import SaveButton from "../components/admin/settings/SaveButton";
import Button from "../components/ui/Button";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { RenewIcon } from "../components/ui/icons";
import Segmented from "../components/ui/Segmented";
import Sheet from "../components/ui/Sheet";
import { loadAdminCourses, loadMuster, saveSettings } from "../shared/api/admin";
import { useAdminLoad } from "../shared/hooks/useAdminLoad";
import { DESKTOP_QUERY, useMediaQuery } from "../shared/hooks/useMediaQuery";
import { useMusterDraft } from "../shared/hooks/useMusterDraft";
import { useNow } from "../shared/hooks/useNow";
import { useAdminStore } from "../shared/store/adminStore";
import { isoWeek } from "../shared/utils/format";
import { isOwnChange, saveLabel, slotLessons, WEEKDAYS_LONG } from "../shared/utils/musterEditor";

const SOURCES = [
  { value: "auto", label: "Automatisch" },
  { value: "admin", label: "Vom Admin" },
];
const SOURCE_HINT = {
  auto: "Aus den echten Plänen der letzten Wochen, ohne Ausfälle.",
  admin: "Gilt für alle in der Klasse. Der echte Plan geht immer vor.",
};
const WEEK_TABS = [
  { value: "A", label: "Woche A" },
  { value: "B", label: "Woche B" },
];

// Пісочна підказка з «стосом» (як «Muster»-плашки частини 19)
const Note = ({ children }) => (
  <p className="flex gap-2.5 rounded-card bg-sand px-3.5 py-3 text-label leading-5 text-muted">
    <Layers className="mt-0.5 size-4 shrink-0" />
    <span>{children}</span>
  </p>
);

// «Gebaut aus KW 41–44» — з яких тижнів автоматика
function autoNote(data) {
  if (!data.autoFrom) return "Noch kein Plan da. Wähle „Vom Admin“ und fülle die Wochen selbst aus.";
  const from = isoWeek(data.autoFrom);
  const to = isoWeek(data.autoTo);
  return `Gebaut aus KW ${from === to ? from : `${from}–${to}`}. Falsch? „Vom Admin“ wählen und ändern.`;
}

// ─────────────────────────────────────────────────────────────
// Редактор: джерело, тиждень A/B, сітка, вікно уроку, збереження.
// Сторінка створює його заново (key), коли приходять свіжі дані з сервера
// ─────────────────────────────────────────────────────────────
const MusterEditor = ({ data, courses, onReload }) => {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const { today } = useNow();
  const reloadSettings = useAdminStore((s) => s.reloadSettings);
  const draft = useMusterDraft(data, onReload);
  const [letter, setLetter] = useState("A"); // вкладка «Woche A / B»
  const [picked, setPicked] = useState(null); // { weekday, period } — відкрита клітинка
  const [confirmTake, setConfirmTake] = useState(false);
  const [busy, setBusy] = useState(false); // зберігаємо джерело або режим A/B

  const editing = data.source === "admin";
  const week = data.abMode === "none" ? "A" : letter; // без A/B — одна сітка (A)
  const names = Object.fromEntries(courses.map((c) => [c.subject.code, c.subject.name ?? c.subject.code]));
  const selected = draft.bad?.letter === week ? draft.bad : picked;
  // Незбережені зміни: перед виходом зі сторінки питаємо
  const blocker = useBlocker(({ currentLocation, nextLocation }) => editing && draft.dirty && currentLocation.pathname !== nextLocation.pathname);

  // Джерело і режим A/B зберігаються одразу (PATCH /admin/settings), сітка — лише кнопкою
  const saveSetting = async (changes) => {
    setBusy(true);
    try {
      await saveSettings({ muster: changes });
      reloadSettings();
      onReload();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  // «Aus dem Plan übernehmen»: якщо в тижні є свої правки — спершу питаємо
  const askTake = () => {
    const own = draft.weeks[week].some((l) => isOwnChange(draft.weeks[week], data.auto[week], l.weekday, l.period));
    if (own || draft.weeks[week].length < data.auto[week].length) setConfirmTake(true);
    else draft.takeAuto(week);
  };

  const cellEditor = picked && (
    <LessonEditor
      key={`${week}-${picked.weekday}-${picked.period}`} // інша клітинка → нова чернетка уроку
      entries={slotLessons(draft.weeks[week], picked.weekday, picked.period)}
      autoEntries={slotLessons(data.auto[week], picked.weekday, picked.period)}
      courses={courses}
      names={names}
      onApply={(entries) => {
        draft.setCell(week, picked, entries);
        if (!isDesktop) setPicked(null);
      }}
    />
  );
  const cellTitle = picked && `Woche ${week} · ${WEEKDAYS_LONG[picked.weekday]} · ${picked.period}. Stunde`;
  const save = { busy: draft.busy, dirty: draft.dirty, onSave: draft.save, label: saveLabel(draft.count) };

  return (
    <section className="flex flex-col gap-4 lg:gap-5">
      <AdminHeader title={isDesktop ? "Muster-Stundenplan" : "Muster"} backTo="/admin/einstellungen" actions={isDesktop && editing && <SaveButton {...save} />} />

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2">
        {/* «Woher kommt das Muster?» */}
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-5 lg:rounded-card lg:bg-card lg:px-5 lg:py-4.5">
          <div className="flex flex-col gap-2 lg:w-65 lg:shrink-0">
            <p className="text-hint font-extrabold text-faint">Woher kommt das Muster?</p>
            <Segmented label="Woher kommt das Muster?" options={SOURCES} value={data.source} onChange={(source) => !busy && saveSetting({ source })} />
          </div>
          <p className="text-caption text-faint">{SOURCE_HINT[data.source]}</p>
        </div>
        <AbSwitch kw={isoWeek(today)} data={data}>
          <AbChoice mode={data.abMode} schoolWeek={data.schoolAbWeek} today={today} busy={busy} onCard={isDesktop} onChange={(abMode) => saveSetting({ abMode })} />
        </AbSwitch>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {data.abMode !== "none" && <Segmented label="Woche" options={WEEK_TABS} value={letter} onChange={setLetter} className="w-full lg:w-60" />}
        {editing && (
          <p className="flex items-center gap-2 text-label text-muted">
            <span className="size-2 rounded-full bg-accent" /> eigene Änderung
          </p>
        )}
        {editing && isDesktop && (
          <Button className="ml-auto flex-none px-5" onClick={askTake}>
            <RenewIcon className="size-4" /> Aus dem Plan übernehmen
          </Button>
        )}
        {!editing && isDesktop && <p className="ml-auto text-label text-faint">Nur ansehen · zum Ändern „Vom Admin“ wählen</p>}
      </div>

      <div className="flex items-start gap-5">
        <div className="min-w-0 flex-1">
          <MusterGrid
            lessons={editing ? draft.weeks[week] : data.auto[week]}
            auto={data.auto[week]}
            mode={editing ? "admin" : "auto"}
            lessonTimes={data.lessonTimes}
            names={names}
            selected={editing ? selected : null}
            onPick={setPicked}
            desktop={isDesktop}
          />
        </div>
        {/* ПК: урок правиться в колонці праворуч (як «Tag» у PC 05) */}
        {isDesktop && editing && (
          <aside className="sticky top-4 w-sheet shrink-0 rounded-card bg-card p-5">
            {picked ? (
              <>
                <p className="text-caption font-extrabold text-accent-ink">{cellTitle}</p>
                <h2 className="mt-1 mb-4 text-heading text-ink">Stunde bearbeiten</h2>
                {cellEditor}
              </>
            ) : (
              <p className="text-body-sm text-muted">Stunde in der Tabelle wählen, um sie zu ändern.</p>
            )}
          </aside>
        )}
      </div>

      {!editing && <Note>{autoNote(data)}</Note>}
      {editing && draft.weeks[week].length === 0 && <Note>Woche {week} ist noch leer. Tippe eine Stunde an — oder übernimm sie aus dem Plan.</Note>}
      {editing && !isDesktop && (
        <Button onClick={askTake} className="w-full flex-none">
          <RenewIcon className="size-4" /> Aus dem Plan übernehmen
        </Button>
      )}
      {editing && !isDesktop && <SaveButton {...save} floating />}
      {editing && draft.dirty && <div aria-hidden className="h-14 lg:hidden" /> /* місце під плаваючою кнопкою */}

      {/* Телефон: урок — у шторці знизу */}
      {!isDesktop && (
        <Sheet open={Boolean(picked)} onClose={() => setPicked(null)} eyebrow={cellTitle} title="Stunde bearbeiten">
          {cellEditor}
        </Sheet>
      )}

      <ConfirmDialog
        open={confirmTake}
        onClose={() => setConfirmTake(false)}
        icon={<RenewIcon className="size-6.5 text-accent" />}
        title="Aus dem Plan übernehmen?"
        text={`Woche ${week} wird mit dem automatischen Muster überschrieben. Eigene Änderungen in dieser Woche gehen verloren.`}
      >
        <Button onClick={() => setConfirmTake(false)}>Abbrechen</Button>
        <Button
          variant="primary"
          onClick={() => {
            draft.takeAuto(week);
            setConfirmTake(false);
          }}
        >
          <RenewIcon className="size-4" /> Übernehmen
        </Button>
      </ConfirmDialog>

      <ConfirmDialog open={blocker.state === "blocked"} onClose={() => blocker.reset?.()} title="Änderungen verwerfen?" text="Das Muster ist noch nicht gespeichert.">
        <Button onClick={() => blocker.reset?.()}>Weiter bearbeiten</Button>
        <Button variant="danger" onClick={() => blocker.proceed?.()}>
          Verwerfen
        </Button>
      </ConfirmDialog>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────
// «Muster-Stundenplan» (частина 19b, design/neu/19b-muster-editor, затверджено 2026-11-07).
// GET /api/admin/muster — своя сітка й автоматика; курси для чипів — GET /api/admin/courses.
// ─────────────────────────────────────────────────────────────
const AdminMuster = () => {
  const muster = useAdminLoad("muster", loadMuster);
  const courses = useAdminLoad("courses", loadAdminCourses);
  const failed = muster.status === "error" ? muster : courses.status === "error" ? courses : null;

  if (muster.status === "loading" || courses.status === "loading" || failed) {
    return (
      <section className="flex flex-col gap-4">
        <AdminHeader title="Muster" backTo="/admin/einstellungen" />
        {failed ? <AdminError error={failed.error} onRetry={failed.reload} /> : <AdminSkeleton rows={6} />}
      </section>
    );
  }
  // key: нові дані з сервера (збережено, змінили джерело) → свіжа чернетка
  return <MusterEditor key={`${muster.data.updatedAt}|${muster.data.source}`} data={muster.data} courses={courses.data.courses} onReload={muster.reload} />;
};

export default AdminMuster;
