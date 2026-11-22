import { useState } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import AccountRow from "../components/noten/AccountRow";
import FachView from "../components/noten/FachView";
import NotenHeader, { RefreshButton } from "../components/noten/NotenHeader";
import NotenLogin from "../components/noten/NotenLogin";
import NotenSkeleton from "../components/noten/NotenSkeleton";
import NotenTiles from "../components/noten/NotenTiles";
import SchnittView from "../components/noten/SchnittView";
import OfflineBanner from "../components/noten/OfflineBanner";
import PdfDialog, { PdfButton } from "../components/noten/PdfDialog";
import StandLine from "../components/noten/StandLine";
import SubjectList from "../components/noten/SubjectList";
import ZeugnisList from "../components/noten/ZeugnisList";
import Segmented from "../components/ui/Segmented";
import StateScreen from "../components/ui/StateScreen";
import { DESKTOP_QUERY, useMediaQuery } from "../shared/hooks/useMediaQuery";
import { useNotenRefresh } from "../shared/hooks/useNotenRefresh";
import { useT } from "../shared/hooks/useT";
import { translate } from "../shared/i18n/translate";
import { useNotenStore } from "../shared/store/notenStore";
import { usePlanStore } from "../shared/store/planStore";
import { absenceStats, defaultHalf, gradesOf, averageOf, overviewOf, zeugnisOf } from "../shared/utils/noten";
import { hasSheet } from "../shared/utils/notenSheet";

// /noten/schnitt — экран «Schnitt» (часть 42), а не предмет
const SCHNITT = "schnitt";

const TABS = [
  { value: "1", get label() { return translate("1. Halbjahr"); } },
  { value: "2", get label() { return translate("2. Halbjahr"); } },
  { value: "zeugnis", get label() { return translate("Zeugnis"); } },
];

// Предмет из адреса (/noten/ma) с оценками полугодия. В «Zeugnis» — полугодие, где есть оценки
function subjectFor(data, code, half) {
  const subject = data?.subjects?.find((s) => s.code === code);
  if (!subject) return null;
  const list = gradesOf(subject, half);
  return { ...subject, list, average: averageOf(list) };
}

// Обзор: плитки и список предметов (или Zeugnis), внизу логин. selected — выбранный предмет на ПК
const Overview = ({ data, tab, half, fresh, selected }) => {
  const t = useT();
  const zeugnis = tab === "zeugnis";
  const overview = overviewOf(data, half);
  const finals = zeugnisOf(data);
  const empty = zeugnis ? finals.length === 0 : overview.subjects.length === 0;
  return (
    <>
      {!zeugnis && <NotenTiles overview={overview} absences={absenceStats(data.absences, half)} half={half} />}
      {empty && <p className="rounded-card bg-card px-4 py-4 text-body-sm text-muted">{zeugnis ? t("Noch keine Zeugnisnoten") : t("Noch keine Noten")}</p>}
      {!empty && (zeugnis ? <ZeugnisList subjects={finals} selected={selected} /> : <SubjectList subjects={overview.subjects} fresh={fresh} half={half} selected={selected} />)}
      <AccountRow />
    </>
  );
};

// Вход в InfoPoint (нет оценок или пароль неверный). Первая загрузка после входа — серые плашки
const LoginPage = ({ data, busy, error }) => {
  const t = useT();
  const refresh = useNotenRefresh();
  return (
    <section className="flex flex-col gap-5.5">
      <NotenHeader eyebrow={t("Leistung")} title={t("Noten")} />
      {!data && busy ? (
        <NotenSkeleton />
      ) : (
        <>
          {error?.code === "unreachable" && <OfflineBanner data={data} busy={busy} onRetry={refresh} />}
          <NotenLogin canCancel={Boolean(data)} />
        </>
      )}
    </section>
  );
};

// ─────────────────────────────────────────────────────────────
// Noten aus Home.InfoPoint (часть 36b). /noten и /noten/:fach (?hj=1|2|zeugnis).
// Телефон: /noten — обзор (handy-01), /noten/ma — предмет (handy-02) с шторкой «Mein Ziel» (часть 42),
// /noten/schnitt — общий ход и цели (42 handy-04).
// ПК (pc-01): слева обзор, справа предмет (выбранный или первый) или «Schnitt».
// Данные — notenStore (кеш последнего ответа InfoPoint); запрос — только по кнопке.
// ─────────────────────────────────────────────────────────────
const Noten = () => {
  const t = useT();
  const { fach } = useParams();
  const [params, setParams] = useSearchParams();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const enabled = usePlanStore((s) => s.me?.features?.noten !== false);
  const { data, busy, error, fresh, loginOpen } = useNotenStore();
  const refresh = useNotenRefresh();
  const [pdfOpen, setPdfOpen] = useState(false);

  if (!enabled) return <Navigate to="/" replace />;
  if (!data || loginOpen) return <LoginPage data={data} busy={busy} error={error} />;

  const tab = TABS.some((x) => x.value === params.get("hj")) ? params.get("hj") : String(defaultHalf(data));
  const half = tab === "zeugnis" ? defaultHalf(data) : Number(tab);
  const setTab = (value) => setParams((prev) => (prev.set("hj", value), prev), { replace: true });
  const offline = error?.code === "unreachable";
  const status = offline ? <OfflineBanner data={data} busy={busy} onRetry={refresh} /> : <StandLine data={data} />;
  // «Als PDF» (часть 37): кнопка — только если есть что печатать; окно открывается на выбранной вкладке
  const pdfButton = hasSheet(data) ? <PdfButton onClick={() => setPdfOpen(true)} wide={isDesktop} /> : null;
  const pdfSheet = pdfOpen && <PdfDialog open onClose={() => setPdfOpen(false)} data={data} start={tab} />;
  const tabs = <Segmented options={TABS} value={tab} onChange={setTab} label={t("Halbjahr")} size={isDesktop ? "sm" : "md"} className={isDesktop ? "w-75 shrink-0" : undefined} />;

  const schnitt = fach === SCHNITT;

  // Телефон, открыт «Schnitt» (часть 42)
  if (!isDesktop && schnitt) {
    return (
      <section className="flex flex-col gap-5.5">
        <NotenHeader backTo={`/noten?hj=${tab}`} eyebrow={`${t("Noten")} · ${t(`${half}. Halbjahr`)}`} title={t("Schnitt")} />
        <SchnittView overview={overviewOf(data, half)} half={half} />
      </section>
    );
  }

  // Телефон, открыт предмет
  if (!isDesktop && fach) {
    const subject = subjectFor(data, fach, half);
    if (!subject) return <StateScreen title={t("Fach nicht gefunden")} />;
    return (
      <section className="flex flex-col gap-5.5">
        <NotenHeader backTo={`/noten?hj=${tab}`} eyebrow={`${t("Noten")} · ${t(`${half}. Halbjahr`)}`} title={subject.name} />
        <FachView subject={subject} fresh={fresh} half={half} />
      </section>
    );
  }

  if (!isDesktop) {
    return (
      <section className="flex flex-col gap-4">
        <NotenHeader
          eyebrow={t("Leistung")}
          title={t("Noten")}
          aside={
            <div className="flex gap-2.5">
              {pdfButton}
              <RefreshButton />
            </div>
          }
        />
        <div className="mt-1.5 flex flex-col gap-3">
          {tabs}
          {status}
        </div>
        <div className="flex flex-col gap-6">
          <Overview data={data} tab={tab} half={half} fresh={fresh} />
        </div>
        {pdfSheet}
      </section>
    );
  }

  // ПК: справа «Schnitt» или выбранный предмет (или первый в списке)
  const shownCode = schnitt ? null : fach ?? (tab === "zeugnis" ? zeugnisOf(data)[0]?.code : overviewOf(data, half).subjects[0]?.code);
  const subject = shownCode ? subjectFor(data, shownCode, half) : null;
  return (
    <section className="grid grid-cols-2 items-start gap-9">
      <div className="flex min-w-0 flex-col gap-5">
        <div className="space-y-2">
          <NotenHeader eyebrow={t("Leistung")} title={t("Noten")} />
          {status}
        </div>
        <Overview data={data} tab={tab} half={half} fresh={fresh} selected={subject?.code} />
      </div>
      <div className="flex min-w-0 flex-col gap-5">
        <div className="flex items-center justify-end gap-3">
          {pdfButton}
          {tabs}
          <RefreshButton />
        </div>
        {schnitt && (
          <>
            <h2 className="truncate text-heading text-ink">{t("Schnitt")}</h2>
            <SchnittView overview={overviewOf(data, half)} half={half} wide />
          </>
        )}
        {subject && (
          <>
            <h2 className="truncate text-heading text-ink">{subject.name}</h2>
            <FachView key={`${subject.code}-${half}`} subject={subject} fresh={fresh} half={half} wide />
          </>
        )}
      </div>
      {pdfSheet}
    </section>
  );
};

export default Noten;
