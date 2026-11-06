import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Toaster } from "sonner";
import { Check, TriangleAlert } from "lucide-react";
import AuthPage from "./AuthPage";
import CourseStart from "./CourseStart";
import Container from "../components/ui/Container";
import SideNav from "../components/navbar/SideNav";
import BottomNav from "../components/navbar/BottomNav";
import SheetHost from "../components/sheets/SheetHost";
import { DESKTOP_QUERY, useMediaQuery } from "../shared/hooks/useMediaQuery";
import { usePageAnimation } from "../shared/hooks/usePageAnimation";
import { useNotesSync } from "../shared/hooks/useNotesSync";
import { usePlanPolling } from "../shared/hooks/usePlanPolling";
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
  const coursesChosen = useUserStore((s) => s.coursesChosen); // чи пройдено вибір курсів
  const fullScreen = isFullScreenPage(useLocation().pathname); // форма: без меню, кнопки притиснуті донизу
  const page = usePageAnimation(); // перехід між сторінками: справа, зліва або плавно
  const isDesktop = useMediaQuery(DESKTOP_QUERY); // сповіщення: на телефоні над меню, на ПК внизу праворуч

  // Один раз при відкритті: дізнатись, чи ми увійшли
  useEffect(() => {
    start();
  }, [start]);

  usePlanPolling(Boolean(me)); // кожні 10 секунд питаємо, чи змінився план
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
  if (!coursesChosen) return <CourseStart />; // перший запуск на цьому пристрої

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

      {/* шторки з адреси (?sheet=…) — працюють на будь-якій сторінці.
          Лежать поза Container: інакше flex додав би їм зайвий відступ праворуч */}
      <SheetHost />
      {/* спливаючі сповіщення (toast) */}
      <Toaster
        position={isDesktop ? "bottom-right" : "bottom-center"}
        offset={isDesktop ? { bottom: 28, right: 28 } : { bottom: 96 }}
        mobileOffset={{ bottom: 96, left: 16, right: 16 }}
        style={{ "--width": "400px" }}
        visibleToasts={1} // один тост за раз: новий замінює старий
        icons={{ success: <Check className="size-4" />, error: <TriangleAlert className="size-4" /> }}
        toastOptions={{
          unstyled: true,
          classNames: {
            // колір помилки через data-type: окремий клас програв би bg-ink за порядком у CSS
            toast: "flex w-full items-center gap-2.5 rounded-field bg-ink px-3.5 py-3 font-sans text-nav font-semibold text-paper shadow-menu data-[type=error]:bg-danger data-[type=error]:text-white",
            title: "min-w-0",
            icon: "shrink-0",
            actionButton: "ml-auto shrink-0 text-label font-bold underline",
          },
        }}
      />
    </Tooltip.Provider>
  );
};

export default HomePage;
