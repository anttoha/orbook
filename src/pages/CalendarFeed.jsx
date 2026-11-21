import { CalendarPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import FeedActions from "../components/calendar-feed/FeedActions";
import FeedCourses from "../components/calendar-feed/FeedCourses";
import FeedItems from "../components/calendar-feed/FeedItems";
import FeedManage from "../components/calendar-feed/FeedManage";
import FeedPreview from "../components/calendar-feed/FeedPreview";
import FeedQr from "../components/calendar-feed/FeedQr";
import FeedSkeleton from "../components/calendar-feed/FeedSkeleton";
import FeedStatus from "../components/calendar-feed/FeedStatus";
import TargetSheet from "../components/calendar-feed/TargetSheet";
import PushHero from "../components/push/PushHero";
import Button from "../components/ui/Button";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { RenewIcon, TrashIcon, WarningIcon } from "../components/ui/icons";
import PageHeader from "../components/ui/PageHeader";
import { deleteFeed, loadFeed, renewFeed, saveFeed } from "../shared/api/calendarFeed";
import { useClassEyebrow } from "../shared/hooks/useClassEyebrow";
import { DESKTOP_QUERY, useMediaQuery } from "../shared/hooks/useMediaQuery";
import { useT } from "../shared/hooks/useT";
import { translate } from "../shared/i18n/translate";
import { useCalendarFeedStore } from "../shared/store/calendarFeedStore";
import { usePlanStore } from "../shared/store/planStore";
import { useUserStore } from "../shared/store/userStore";
import { DEFAULT_ITEMS, calendarLinks, feedBody, feedErrorText } from "../shared/utils/calendarFeed";
import { courseCount } from "../shared/utils/courses";

// ─────────────────────────────────────────────────────────────
// «Kalender-Abo» (часть 40, макеты design/neu/40-kalender-abo). Одна личная ссылка: календарь
// сам забирает по ней план, тесты и Termine. Сервер — docs/API.md «Kalender-Abo».
//   нет абонемента → пример + выбор + «Abo erstellen»;  есть → «Abo aktiv», ссылка, тот же выбор,
//   «Link erneuern» / «Abo löschen». На ПК справа QR: телефоном добавить в календарь телефона.
// ─────────────────────────────────────────────────────────────
const CalendarFeed = () => {
  const t = useT();
  const eyebrow = useClassEyebrow(translate("Mehr"));
  const desktop = useMediaQuery(DESKTOP_QUERY);
  const remember = useCalendarFeedStore((s) => s.remember);
  const picked = useUserStore((s) => s.picked);
  const hidden = useUserStore((s) => s.hiddenRequired);
  const courses = usePlanStore((s) => s.courses);
  const count = courseCount(courses, picked, hidden);

  const [state, setState] = useState({ status: "loading", feed: null }); // loading | ready | error
  const [attempt, setAttempt] = useState(0); // «Nochmal» → запрос ещё раз
  const [draft, setDraft] = useState({ items: DEFAULT_ITEMS, mine: true }); // выбор до «Abo erstellen»
  const [busy, setBusy] = useState(false);
  const [sheet, setSheet] = useState(false); // шторка «In welchen Kalender?»
  const [ask, setAsk] = useState(null); // "renew" | "delete" — открытый вопрос

  // Абонемент спрашиваем у сервера при каждом открытии: ссылка могла умереть (устройство вышло
  // из класса) — тогда сервер скажет feed: null, и «Mehr» тоже перестанет писать «an»
  useEffect(() => {
    let cancelled = false;
    loadFeed()
      .then((feed) => {
        if (cancelled) return;
        remember(feed);
        setState({ status: "ready", feed });
      })
      .catch(() => !cancelled && setState({ status: "error", feed: null }));
    return () => {
      cancelled = true;
    };
  }, [attempt, remember]);

  const feed = state.feed;
  const links = calendarLinks(feed);
  const items = feed?.items ?? draft.items;
  const mine = feed ? feed.mine : draft.mine;

  // Любой запрос, который возвращает новый feed: показать, запомнить, ошибку — тостом
  const run = async (request, success) => {
    setBusy(true);
    try {
      const fresh = await request();
      remember(fresh);
      setState({ status: "ready", feed: fresh });
      if (success) toast.success(translate(success));
      return fresh;
    } catch (error) {
      toast.error(feedErrorText(error));
      return null;
    } finally {
      setBusy(false);
    }
  };

  const change = (patch) => {
    const next = { items, mine, ...patch };
    if (!feed) return setDraft(next); // ещё нет абонемента — только выбор на экране
    run(() => saveFeed(feedBody(next.items, next.mine, picked, hidden)));
  };
  const toggleItem = (key) => change({ items: { ...items, [key]: !items[key] } });

  const create = async () => {
    const fresh = await run(() => saveFeed(feedBody(items, mine, picked, hidden)), "Kalender-Abo ist an");
    if (fresh && !desktop) setSheet(true); // сразу предложить, куда добавить
  };

  const copy = async () => {
    setSheet(false);
    try {
      await navigator.clipboard.writeText(links.copy);
      toast.success(translate("Link kopiert"));
    } catch {
      toast.error(translate("Kopieren nicht möglich"));
    }
  };

  const renew = () => {
    setAsk(null);
    run(renewFeed, "Neuer Link ist da");
  };
  const remove = async () => {
    setAsk(null);
    setBusy(true);
    try {
      await deleteFeed();
      remember(null);
      setState({ status: "ready", feed: null });
      toast.success(translate("Kalender-Abo gelöscht"));
    } catch (error) {
      toast.error(feedErrorText(error));
    } finally {
      setBusy(false);
    }
  };

  const header = <PageHeader backTo="/mehr" eyebrow={eyebrow} title={t("Kalender-Abo")} />;
  if (state.status === "loading") {
    return (
      <section className="flex flex-col gap-6 lg:max-w-186">
        {header}
        <FeedSkeleton />
      </section>
    );
  }
  if (state.status === "error") {
    return (
      <section className="flex flex-col gap-6 lg:max-w-186">
        {header}
        <PushHero icon={WarningIcon} tone="sand" title={t("Gerade nicht erreichbar")} text={t("Der Server antwortet nicht. Dein Kalender-Abo läuft trotzdem weiter.")}>
          <Button variant="primary" onClick={() => setAttempt((a) => a + 1)} className="flex-none">
            <RenewIcon className="size-4" /> {t("Nochmal")}
          </Button>
        </PushHero>
      </section>
    );
  }

  const settings = (
    <>
      <FeedItems items={items} onToggle={toggleItem} disabled={busy} />
      <FeedCourses mine={mine} courseCount={count.all > 0 ? count.on : null} onChange={(value) => change({ mine: value })} disabled={busy} />
    </>
  );

  if (!feed) {
    return (
      <section className="flex flex-col gap-6 lg:max-w-120">
        {header}
        <FeedPreview />
        <div className="flex flex-col gap-1">
          <h2 className="text-subhead font-black text-ink">{t("Plan im eigenen Kalender")}</h2>
          <p className="text-body-sm text-muted">{t("Stunden, Tests und Termine landen in Google, Apple oder Outlook und bleiben aktuell.")}</p>
        </div>
        {settings}
        <Button variant="primary" onClick={create} disabled={busy} className="flex-none">
          <CalendarPlus className="size-4" aria-hidden="true" /> {t("Abo erstellen")}
        </Button>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      {header}
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,var(--container-feed))_minmax(0,var(--container-feed-side))] lg:items-start lg:gap-7">
        <div className="flex flex-col gap-6">
          <FeedStatus lastFetchedAt={feed.lastFetchedAt} />
          {!desktop && <FeedActions links={links} onChoose={() => setSheet(true)} onCopy={copy} />}
          {settings}
        </div>
        <div className="flex flex-col gap-4">
          {desktop && links && <FeedQr webcalUrl={feed.webcalUrl} />}
          {desktop && <FeedActions desktop links={links} onCopy={copy} />}
          <FeedManage onRenew={() => setAsk("renew")} onDelete={() => setAsk("delete")} />
        </div>
      </div>

      <TargetSheet open={sheet} onClose={() => setSheet(false)} links={links} onCopy={copy} />
      <ConfirmDialog
        open={ask === "renew"}
        onClose={() => setAsk(null)}
        icon={<RenewIcon className="size-5 text-accent-ink" />}
        title={t("Link erneuern?")}
        text={t("Der alte Link geht dann nicht mehr. Im Kalender musst du das Abo neu hinzufügen.")}
      >
        <Button onClick={() => setAsk(null)}>{t("Abbrechen")}</Button>
        <Button variant="primary" onClick={renew} disabled={busy}>
          <RenewIcon className="size-4" /> {t("Erneuern")}
        </Button>
      </ConfirmDialog>
      <ConfirmDialog
        open={ask === "delete"}
        onClose={() => setAsk(null)}
        icon={<TrashIcon className="size-5 text-danger" />}
        title={t("Abo löschen?")}
        text={t("Der Link geht dann nicht mehr. Das Abo im Kalender entfernst du dort selbst.")}
      >
        <Button onClick={() => setAsk(null)}>{t("Abbrechen")}</Button>
        <Button variant="danger" onClick={remove} disabled={busy}>
          <TrashIcon className="size-4" /> {t("Löschen")}
        </Button>
      </ConfirmDialog>
    </section>
  );
};

export default CalendarFeed;
