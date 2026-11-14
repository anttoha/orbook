import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import * as Tooltip from "@radix-ui/react-tooltip";
import { TriangleAlert } from "lucide-react";
import AuthPage from "./AuthPage";
import CourseStart from "./CourseStart";
import SyncConnect from "./SyncConnect";
import { useLinkCode } from "../shared/store/linkCodeStore";
import { isTeacher } from "../shared/utils/examRules";
import AppToaster from "../components/ui/AppToaster";
import Container from "../components/ui/Container";
import SideNav from "../components/navbar/SideNav";
import BottomNav from "../components/navbar/BottomNav";
import SheetHost from "../components/sheets/SheetHost";
import PageScrollHint from "../components/ui/PageScrollHint";
import { usePageAnimation } from "../shared/hooks/usePageAnimation";
import { useNotesSync } from "../shared/hooks/useNotesSync";
import { useAppHotkeys } from "../shared/hooks/useAppHotkeys";
import { useNewsOnStart } from "../shared/hooks/useNewsOnStart";
import { useTipsOnStart } from "../shared/hooks/useTipsOnStart";
import { usePlanLive } from "../shared/hooks/usePlanLive";
import { usePushOnStart } from "../shared/hooks/usePushOnStart";
import { useActiveClass } from "../shared/store/classesStore";
import { usePlanStore } from "../shared/store/planStore";
import { useUserStore } from "../shared/store/userStore";
import { cn } from "../shared/utils/cn";
import { isFullScreenPage } from "../shared/utils/isTabActive";

// ─────────────────────────────────────────────────────────────
// Оболонка застосунку. Вирішує, що показати:
//   me === undefined → ще питаємо сервер «хто я» (порожній екран)
//   startError       → немає мережі і нічого не збережено → «Erneut versuchen»
//   me === null      → екран входу (AuthPage)
//   курси не вибрані → перший запуск (CourseStart)
//   інакше           → сайдбар / нижнє меню + сторінка (Outlet) + шторки
// ─────────────────────────────────────────────────────────────
const HomePage = () => {
  const me = usePlanStore((s) => s.me); // хто я
  const startError = usePlanStore((s) => s.startError); // помилка старту
  const start = usePlanStore((s) => s.start); // GET /api/auth/me (+ решта даних)
  const tick = usePlanStore((s) => s.tick); // оновити «зараз»
  const demo = usePlanStore((s) => s.meta?.demo); // демо-сервер?
  // чи пройдено вибір курсів. Учителю він не потрібен: бачить увесь план класу (змінити можна в «Meine Kurse»)
  const coursesChosen = useUserStore((s) => s.coursesChosen) || isTeacher(me);
  const { pathname } = useLocation();
  const fullScreen = isFullScreenPage(pathname); // форма: без меню, кнопки притиснуті донизу
  const page = usePageAnimation(); // перехід між сторінками: справа, зліва або плавно
  const link = useLinkCode((s) => s.link); // код із посилання (QR), частина 25
  const syncAllowed = me?.features?.notesSync !== false;
  const activeGone = useActiveClass()?.gone; // код відкритого класу вимкнули (частина 29)

  // Один раз при відкритті: дізнатись, чи ми увійшли
  useEffect(() => {
    start();
  }, [start]);

  useAppHotkeys(Boolean(me) && coursesChosen); // W, D, N, K, R, «?» — на будь-якій сторінці
  useNewsOnStart(Boolean(me) && coursesChosen); // «Was ist neu» — один раз после новой версии (часть 22b)
  useTipsOnStart(Boolean(me) && coursesChosen && !link); // «Kurz erklärt» — один раз новичку (часть 25)
  usePushOnStart(Boolean(me) && me.features?.push !== false); // часть 17: Mitteilungen — курсы и «я ещё здесь»
  usePlanLive(Boolean(me)); // часть 26: новый план приходит сам (поток), без потока — опрос раз в минуту
  useNotesSync(Boolean(me) && me.features?.notesSync !== false); // нотатки на інших пристроях (якщо є Sync-Code)

  // Раз на хвилину: оновити час школи (рядок «зараз» і «noch 27 min»)
  useEffect(() => {
    if (!me) return undefined; // не увійшли — нічого не робимо
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [me, tick]);

  if (me === undefined && !startError) return <div className="min-h-dvh bg-paper" />; // перевіряємо…

  if (startError) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-7 text-center">
        <TriangleAlert className="size-8 text-danger" />
        <p className="text-subhead text-ink">ORBook ist gerade nicht erreichbar</p>
        <p className="text-label font-semibold text-muted">{startError.message}</p>
        <button type="button" onClick={start} className="rounded-full bg-accent px-5 py-3 text-body font-extrabold text-on-accent">
          Erneut versuchen
        </button>
      </div>
    );
  }

  if (!me) return <AuthPage />; // не увійшли — екран входу
  // відкрили QR зі Sync-Code (частина 25): спершу «Gerät verbinden?» — курси, найімовірніше, прийдуть з коду
  if (link?.kind === "sync" && syncAllowed) return <SyncConnect code={link.code} />;
  // відкритий клас більше не працює — на «Meine Klassen»: там картка «Zugang beendet», інші класи працюють
  if (activeGone && pathname !== "/klassen") return <Navigate to="/klassen" replace />;
  if (!coursesChosen && pathname !== "/klassen") return <CourseStart />; // перший запуск на цьому пристрої (або в новому класі)

  return (
    // Tooltip.Provider — спільний «пульт» для спливаючих підказок (затримка 300 мс)
    <Tooltip.Provider delayDuration={300}>
      {/* З 1024px (lg): сайдбар зліва + контент. Відступи як на макеті 1440:
          сайдбар 16px від краю, між сайдбаром і контентом 36px, праворуч 36px */}
      <Container className="min-h-dvh lg:flex lg:gap-9">
        <SideNav />

        <main className={cn("min-w-0 flex-1 pt-6 pb-28 lg:pt-6.5 lg:pr-5 lg:pb-8", fullScreen && "flex min-h-dvh flex-col pb-7.5")}>
          {/* Демо-сервер: плашка, щоб не сплутати зі справжнім планом (на ПК — у сайдбарі) */}
          {demo && <p className="mb-3 w-fit rounded-full bg-tint px-2.5 py-1 text-micro font-extrabold text-accent-ink uppercase lg:hidden">Demo · ausgedachte Daten</p>}
          {/* key: нова сторінка — новий блок, і анімація появи грає знову */}
          <div key={page.key} className={cn("flex flex-1 flex-col", page.className)}>
            <Outlet />
          </div>
        </main>

        <BottomNav />
      </Container>

      {/* телефон: «ниже есть ещё» — над нижним меню, пока страницу не начали листать; новая страница — заново */}
      {!fullScreen && <PageScrollHint key={pathname} onlyAtTop className="bottom-[calc(6.5rem+env(safe-area-inset-bottom))] lg:hidden" />}

      {/* шторки з адреси (?sheet=…) — працюють на будь-якій сторінці.
          Лежать поза Container: інакше flex додав би їм зайвий відступ праворуч */}
      <SheetHost />
      {/* спливаючі сповіщення (toast) */}
      <AppToaster />
    </Tooltip.Provider>
  );
};

export default HomePage;
