import { createBrowserRouter } from "react-router-dom";
import App from "../../App";
import HomePage from "../../pages/HomePage";
import Tests from "../../pages/Tests";
import ExamEdit from "../../pages/ExamEdit";
import EditorCode from "../../pages/EditorCode";
import Statistic from "../../pages/Statistic";
import More from "../../pages/More";
import MyCourses from "../../pages/MyCourses";
import Appearance from "../../pages/Appearance";
import SubjectColors from "../../pages/SubjectColors";
import NotesSync from "../../pages/NotesSync";
import StartPage from "../../pages/StartPage";
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
          page({ index: true, Component: StartPage }), // Woche або Heute: налаштування «Startansicht»
          page({ path: "woche", Component: Week }),
          page({ path: "heute", Component: Day }), // сьогоднішній день
          page({ path: "tag/:datum", Component: Day }), // будь-який день: /tag/2026-10-07
          page({ path: "testen", Component: Tests }),
          page({ path: "testen/neu", Component: ExamEdit }), // нова Klausur
          page({ path: "testen/:id/bearbeiten", Component: ExamEdit }), // правка
          page({ path: "editor-code", Component: EditorCode }),
          page({ path: "statistik", Component: Statistic }),
          page({ path: "mehr", Component: More }),
          page({ path: "mehr/kurse", Component: MyCourses }),
          page({ path: "mehr/darstellung", Component: Appearance }),
          page({ path: "mehr/fachfarben", Component: SubjectColors }),
          page({ path: "mehr/sync", Component: NotesSync }), // Notizen synchronisieren
          page({ path: "admin", Component: Admin }), // поки заглушка
        ],
      },
    ],
  },
]);
