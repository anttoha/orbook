import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronRight, ScanLine } from "lucide-react";
import { useT } from "../../shared/hooks/useT";
import { useClasses } from "../../shared/store/classesStore";
import { usePlanStore } from "../../shared/store/planStore";
import { addClassErrorText, otherSchool } from "../../shared/utils/classes";
import Button from "../ui/Button";
import ClassBadge from "../ui/ClassBadge";
import Sheet from "../ui/Sheet";
import TextField from "../ui/TextField";

// ─────────────────────────────────────────────────────────────
// «Klasse hinzufügen» (макеты 29 handy-03, -04, -05). Адрес: ?sheet=klasseneu
// 1) Zugangscode (или Lehrer-Code) → «Weiter»: сервер добавляет класс к этому устройству (вход остаётся)
// 2) «Gefunden»: имя на устройстве → «Hinzufügen und Kurse wählen» открывает класс, дальше обычный выбор курсов
// Часть 29d: со страницы школы (?schule=id) сверху имя школы; код другой школы тоже подходит —
// класс встаёт к своей школе, плашка «Gefunden» это говорит (макет handy-22)
// ─────────────────────────────────────────────────────────────
const AddClassSheet = ({ open, onClose, sheet }) => {
  const t = useT();
  // Каждое открытие — с пустой формы: шторка после закрытия остаётся в DOM (анимация), поэтому новый key
  const [round, setRound] = useState({ open, n: 0 });
  if (open !== round.open) setRound({ open, n: open ? round.n + 1 : round.n });
  const schoolId = sheet?.schule ?? null;
  const school = useClasses((s) => s.list.find((c) => String(c.school?.id) === String(schoolId))?.school);
  return (
    <Sheet open={open} onClose={onClose} desktop="dialog" eyebrow={school?.name ?? t("Meine Klassen")} title={t("Klasse hinzufügen")}>
      <AddClassForm key={round.n} onClose={onClose} schoolId={school ? schoolId : null} />
    </Sheet>
  );
};

const AddClassForm = ({ onClose, schoolId }) => {
  const t = useT();
  const navigate = useNavigate();
  const addClass = usePlanStore((s) => s.addClass);
  const openClass = usePlanStore((s) => s.openClass);
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [found, setFound] = useState(null); // class { id, name, school } после «Weiter»
  const [label, setLabel] = useState("");
  const [qrHelp, setQrHelp] = useState(false);
  const item = useClasses((s) => s.list.find((c) => c.id === found?.id)) ?? found;

  const check = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      setFound(await addClass(code));
    } catch (e) {
      setError(addClassErrorText(e, t));
    } finally {
      setBusy(false);
    }
  };

  const finish = () => {
    useClasses.getState().update(found.id, { label: label.trim() });
    onClose();
    navigate("/", { replace: true });
    openClass(found.id); // курсы этого класса ещё не выбраны → «Welche Kurse hast du?»
  };

  return (
    <form onSubmit={check} className="space-y-3.5">
        <TextField
          id="add-class-code"
          label={t("Zugangscode")}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          readOnly={Boolean(found)}
          placeholder="ORB-A-XXXX-XXXX"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          error={error}
          hint={found ? null : t("Der Code sagt ORBook, welche Schule und Klasse es ist.")}
          inputClassName={found ? "border-ok font-bold tracking-code read-only:opacity-100" : "font-bold tracking-code"}
          trailing={found && <Check className="mr-2.5 size-5 text-ok" />}
        />

        {found ? (
          <>
            <div className="flex items-center gap-3 rounded-field bg-ok-tint px-3.5 py-3 motion-safe:animate-rise-in">
              <ClassBadge name={item.name} color={item.color} size="md" />
              <div className="min-w-0">
                {/* сначала школа, потом класс */}
                <p className="truncate text-row font-extrabold text-ink">{[item.school?.name, item.name].filter(Boolean).join(" · ")}</p>
                {otherSchool(item, schoolId) ? (
                  <p className="text-label text-muted">
                    {t("Gefunden – gehört zu einer anderen Schule.")} {t("Die Klasse kommt zu ihrer Schule.")}
                  </p>
                ) : (
                  <p className="text-label text-muted">{t("Gefunden")}</p>
                )}
              </div>
            </div>
            <TextField id="add-class-label" label={t("Name auf diesem Gerät")} value={label} onChange={(e) => setLabel(e.target.value)} maxLength={30} placeholder={`${t("Klasse")} ${item.name}`} hint={t("Nur du siehst den Namen. Kann leer bleiben.")} />
            <Button variant="primary" onClick={finish} className="w-full flex-none">
              <ChevronRight className="size-4.5" /> {t("Hinzufügen und Kurse wählen")}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => setQrHelp((v) => !v)} className="w-full flex-none">
              <ScanLine className="size-4.5" /> {t("QR-Code scannen")}
            </Button>
            {qrHelp && <p className="rounded-field bg-sand px-3.5 py-3 text-label text-muted">{t("Mit der Handy-Kamera scannen: der Link öffnet ORBook und fügt die Klasse hinzu.")}</p>}
            <button type="submit" disabled={busy || !code.trim()} className="flex h-12 w-full items-center justify-center rounded-full bg-accent text-row font-bold text-on-accent disabled:opacity-40">
              {t("Weiter")}
            </button>
            <p className="text-center text-caption text-faint">{t("Einladungslink bekommen? Antippen genügt.")}</p>
          </>
        )}
    </form>
  );
};

export default AddClassSheet;
