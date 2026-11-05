import { createBrowserRouter } from "react-router-dom";
import App from "../../App";
import HomePage from "../../pages/HomePage";
import Tests from "../../pages/Tests";
import Statistic from "../../pages/Statistic";
import More from "../../pages/More";
import Week from "../../pages/Week";
import Day from "../../pages/Day";
import Admin from "../../pages/Admin";
import RouteError from "../../pages/RouteError";
import Datenschutz from "../../pages/Datenschutz";

// Помилка спрацьовує на найближчому errorElement. Тому він є на кожній сторінці:
// падає тільки контент, а меню лишається. Той, що вгорі, ловить решту,
// наприклад неіснуючу адресу або збій у самій оболонці.
const page = (route) => ({ ...route, errorElement: <RouteError inline /> });

export const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    errorElement: <RouteError />,
    children: [
      // поза HomePage: цю сторінку можна відкрити без входу, з екрана «Zugang»
      page({ path: "datenschutz", Component: Datenschutz }),
      {
        Component: HomePage,
        errorElement: <RouteError />,
        children: [
          page({ index: true, Component: Week }),
          page({ path: "woche", Component: Week }),
          page({ path: "heute", Component: Day }), // сьогоднішній день
          page({ path: "tag/:datum", Component: Day }), // будь-який день: /tag/2026-10-07
          page({ path: "testen", Component: Tests }),
          page({ path: "statistik", Component: Statistic }),
          page({ path: "mehr", Component: More }),
          page({ path: "admin", Component: Admin }), // поки заглушка
        ],
      },
    ],
  },
]);
