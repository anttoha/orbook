import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Toaster } from "sonner";
import { TriangleAlert } from "lucide-react";
import AuthPage from "./AuthPage";
import Container from "../components/ui/Container";
import SideNav from "../components/navbar/SideNav";
import BottomNav from "../components/navbar/BottomNav";
import SheetHost from "../components/sheets/SheetHost";
import { usePlanStore } from "../shared/store/planStore";

// ─────────────────────────────────────────────────────────────
// Оболонка застосунку. Вирішує, що показати:
//   me === undefined → ще питаємо сервер «хто я» (порожній екран)
//   startError       → немає мережі і нічого не збережено → «Erneut versuchen»
//   me === null      → екран входу (AuthPage)
//   інакше           → сайдбар / нижнє меню + сторінка (Outlet) + шторки
// ─────────────────────────────────────────────────────────────
const HomePage = () => {
  const me = usePlanStore((s) => s.me); // хто я
  const startError = usePlanStore((s) => s.startError); // помилка старту
  const start = usePlanStore((s) => s.start); // GET /api/auth/me (+ решта даних)
  const tick = usePlanStore((s) => s.tick); // оновити «зараз»
  const checkStatus = usePlanStore((s) => s.checkStatus); // чи змінився план
  const demo = usePlanStore((s) => s.meta?.demo); // демо-сервер?

  // Один раз при відкритті: дізнатись, чи ми увійшли
  useEffect(() => {
    start();
  }, [start]);

  // Раз на хвилину: оновити час школи і (якщо вкладка видима) спитати стан плану
  useEffect(() => {
    if (!me) return undefined; // не увійшли — нічого не робимо
    const id = setInterval(() => {
      tick();
      if (document.visibilityState === "visible") checkStatus();
    }, 60_000);
    return () => clearInterval(id);
  }, [me, tick, checkStatus]);

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

  return (
    // Tooltip.Provider — спільний «пульт» для спливаючих підказок (затримка 300 мс)
    <Tooltip.Provider delayDuration={300}>
      {/* З 1024px (lg): сайдбар зліва + контент. Відступи як на макеті 1440:
          сайдбар 16px від краю, між сайдбаром і контентом 36px, праворуч 36px */}
      <Container className="min-h-dvh lg:flex lg:gap-9">
        <SideNav />

        <main className="min-w-0 flex-1 pt-6 pb-28 lg:pt-6.5 lg:pr-5 lg:pb-8">
          {/* Демо-сервер: плашка, щоб не сплутати зі справжнім планом (на ПК — у сайдбарі) */}
          {demo && <p className="mb-3 w-fit rounded-full bg-tint px-2.5 py-1 text-micro font-extrabold text-accent-ink uppercase lg:hidden">Demo · ausgedachte Daten</p>}
          <Outlet />
        </main>

        <BottomNav />
      </Container>

      {/* шторки з адреси (?sheet=…) — працюють на будь-якій сторінці.
          Лежать поза Container: інакше flex додав би їм зайвий відступ праворуч */}
      <SheetHost />
      {/* спливаючі сповіщення (toast) */}
      <Toaster position="top-center" toastOptions={{ style: { fontFamily: "inherit" } }} />
    </Tooltip.Provider>
  );
};

export default HomePage;
