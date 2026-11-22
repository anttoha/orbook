import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { toast } from "sonner";
import DeckBadge from "../components/karten/DeckBadge";
import Button from "../components/ui/Button";
import Field from "../components/ui/Field";
import { CheckIcon } from "../components/ui/icons";
import ListPicker from "../components/ui/ListPicker";
import RoundButton from "../components/ui/RoundButton";
import { Skeleton } from "../components/ui/PlanState";
import StateScreen from "../components/ui/StateScreen";
import { useT } from "../shared/hooks/useT";
import { translate } from "../shared/i18n/translate";
import { useKartenStore } from "../shared/store/kartenStore";
import { usePlanStore } from "../shared/store/planStore";
import { useUserStore } from "../shared/store/userStore";
import { formSubjects } from "../shared/utils/examRules";
import { decodeDeck } from "../shared/utils/kartenShare";
import { mySubjectCodes, subjectItems } from "../shared/utils/picker";

const PREVIEW = 5;

// ─────────────────────────────────────────────────────────────
// «Stapel übernehmen» (часть 43, макет handy-12): ссылка …/karten#k1.… от друга.
// Карточки — в части после «#» (на сервер не уходит). Своя копия с нуля: без чужого Lernstand и теста.
// ─────────────────────────────────────────────────────────────
const KartenImport = () => {
  const t = useT();
  const { hash } = useLocation();
  const shared = useSharedDeck(hash);
  if (shared === undefined) return <Skeleton className="h-60 rounded-card" />;
  if (!shared) return <StateScreen title={t("Dieser Link ist kaputt.")} text={t("Bitte den Link noch einmal schicken lassen.")} />;
  return <ImportForm key={hash} shared={shared} />;
};

// Разбор ссылки (асинхронно: распаковка в браузере). undefined — ещё считаем, null — битая
function useSharedDeck(hash) {
  const [state, setState] = useState({ hash: null, deck: undefined });
  useEffect(() => {
    let alive = true;
    decodeDeck(hash).then((deck) => alive && setState({ hash, deck }));
    return () => {
      alive = false;
    };
  }, [hash]);
  return state.hash === hash ? state.deck : undefined;
}

const ImportForm = ({ shared }) => {
  const t = useT();
  const navigate = useNavigate();
  const courses = usePlanStore((s) => s.courses);
  const metaSubjects = usePlanStore((s) => s.meta?.subjects);
  const picked = useUserStore((s) => s.picked);
  const addDeck = useKartenStore((s) => s.addDeck);
  const [subject, setSubject] = useState(null);
  const rest = shared.cards.length - PREVIEW;

  const take = () => {
    const id = addDeck({ ...shared, subject });
    toast.success(translate("Stapel übernommen"));
    navigate(`/karteikarten/${id}`, { replace: true });
  };

  return (
    <section className="flex flex-col gap-6 lg:max-w-140">
      <header className="flex items-end gap-2.5">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-hint font-extrabold text-accent-ink">{t("Geteilter Stapel")}</p>
          <h1 className="truncate text-title text-ink">{t("Stapel übernehmen")}</h1>
        </div>
        <RoundButton to="/karteikarten" aria-label={t("Schließen")}>
          <X className="size-4.5" />
        </RoundButton>
      </header>
      <div className="flex items-center gap-3.5 rounded-card bg-card px-3.5 py-4 motion-safe:animate-pop-in">
        <DeckBadge subject={subject} />
        <div className="min-w-0">
          <p className="truncate text-subhead font-extrabold text-ink">{shared.name}</p>
          <p className="text-label text-faint">{t("{n} Karten · {a} – {b}", { n: shared.cards.length, a: shared.sides[0], b: shared.sides[1] })}</p>
        </div>
      </div>
      <Field label={t("Fach")}>
        <ListPicker id="import-fach" label={t("Fach")} clearable clearLabel={t("Ohne Fach")} items={subjectItems(formSubjects(courses, picked, metaSubjects, null), mySubjectCodes(courses, picked))} value={subject} onChange={setSubject} />
      </Field>
      <Field label={t("Karten")}>
        <ul className="overflow-hidden rounded-card bg-card">
          {shared.cards.slice(0, PREVIEW).map((card, i) => (
            <li key={i} className="mx-4 flex min-h-12.5 items-center gap-3 border-hair py-2.5 not-first:border-t motion-safe:animate-item-rise" style={{ animationDelay: `${i * 40}ms` }}>
              <span className="min-w-0 flex-1 truncate text-row font-bold text-ink">{card.a}</span>
              <span className="min-w-0 max-w-1/2 truncate text-body-sm text-muted">{card.b}</span>
            </li>
          ))}
        </ul>
        {rest > 0 && <p className="mt-3 text-center text-label font-bold text-faint">{t("und {rest} weitere", { rest })}</p>}
      </Field>
      <Button variant="primary" onClick={take} className="flex-none">
        <CheckIcon className="size-4" /> {t("Übernehmen")}
      </Button>
    </section>
  );
};

export default KartenImport;
