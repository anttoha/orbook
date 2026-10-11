import { createBrowserRouter } from "react-router-dom";
import App from "../../App";
import HomePage from "../../pages/HomePage";
import Tests from "../../pages/Tests";
import Statistic from "../../pages/Statistic";
import More from "../../pages/More";
import Week from "../../pages/Week";
import Day from "../../pages/Day";
import Admin from "../../pages/Admin";

export const router = createBrowserRouter([
    {
        path: "/",
        Component: App,
        children: [
            {
        Component: HomePage,
        children: [
          { index: true, Component: Week },
          { path: "woche", Component: Week },
          { path: "heute", Component: Day }, // сьогоднішній день
          { path: "tag/:datum", Component: Day }, // будь-який день: /tag/2026-10-07
          { path: "testen", Component: Tests },
          { path: "statistik", Component: Statistic },
          { path: "mehr", Component: More },
          { path: "admin", Component: Admin }, // поки заглушка
        ],
      },
        ]
    }
])
