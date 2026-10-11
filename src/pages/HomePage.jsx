import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import * as Tooltip from "@radix-ui/react-tooltip";
import AuthPage from "./AuthPage";
import Container from "../components/ui/Container";
import SideNav from "../components/navbar/SideNav";
import BottomNav from "../components/navbar/BottomNav";
import { Toaster } from "sonner";
import SheetHost from "../components/sheets/SheetHost";

const CLASS_PASSWORD = "1234";

const HomePage = () => {
  const [isLogged, setIsLogged] = useState(
    () => localStorage.getItem("logged") === "1",
  );
  const [passwordValue, setPasswordValue] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [page, setPage] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordValue === CLASS_PASSWORD) {
      localStorage.setItem("logged", "1");
      setIsLogged(true);
    } else {
      setIsPasswordValid(false);
    }
  };

  useEffect(async () => {
    try {
      const me = await api("/auth/me");
      if (!me.authenticated) setPage("zugang");
      else setPage("app");
    } catch (error) {
      console.error(error);
    }
  }, []);

  if (page === 'zugang') {
    return (
      <AuthPage
        passwordValue={passwordValue}
        onChangePasswordValue={(e) => {
          setPasswordValue(e.target.value);
          setIsPasswordValid(true);
        }}
        isPasswordValid={isPasswordValid}
        onSubmit={handleLogin}
      />
    );
  }

  return (
    // Tooltip.Provider — общий «пульт» для всплывающих подсказок (задержка 300 мс)
    <Tooltip.Provider delayDuration={300}>
      {/* С 1024px (lg): сайдбар слева + контент. Отступы как на макете 1440:
          сайдбар 16px от края, между сайдбаром и контентом 36px, справа 36px */}
      <Container className="min-h-dvh lg:flex lg:gap-9">
        <SideNav />

        <main className="min-w-0 flex-1 pt-6 pb-28 lg:pt-6.5 lg:pr-5 lg:pb-8">
          <Outlet />
        </main>

        <BottomNav />
      </Container>

      {/* шторки из адреса (?sheet=…) — работают на любой странице.
          Лежат вне Container: иначе flex добавил бы им лишний отступ справа */}
      <SheetHost />
      {/* всплывающие уведомления (toast) */}
      <Toaster
        position="top-center"
        toastOptions={{ style: { fontFamily: "inherit" } }}
      />
    </Tooltip.Provider>
  );
};

export default HomePage;
