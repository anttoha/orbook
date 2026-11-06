import { createBrowserRouter } from "react-router-dom";
import App from "../../App";
import HomePage from "../../pages/HomePage";
import Tests from "../../pages/Tests";
import ExamEdit from "../../pages/ExamEdit";
import HomeworkEdit from "../../pages/HomeworkEdit";
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
import AdminOverview from "../../pages/AdminOverview";
import AdminCodes from "../../pages/AdminCodes";
import AdminExams from "../../pages/AdminExams";
import AdminCourses from "../../pages/AdminCourses";
import AdminLog from "../../pages/AdminLog";
import AdminSettings from "../../pages/AdminSettings";
import RouteError from "../../pages/RouteError";
import Datenschutz from "../../pages/Datenschutz";
import SettingsLayout from "../../pages/SettingsLayout";

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
      // Адмінка: свій вхід і своє меню, вхід класу їй не потрібен (docs/frontend/09-admin.md)
      {
        path: "admin",
        Component: Admin,
        errorElement: <RouteError />,
        children: [
          page({ index: true, Component: AdminOverview }),
          page({ path: "codes", Component: AdminCodes }),
          page({ path: "klausuren", Component: AdminExams }),
          page({ path: "kurse", Component: AdminCourses }),
          page({ path: "protokoll", Component: AdminLog }),
          page({ path: "einstellungen", Component: AdminSettings }),
        ],
      },
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
          page({ path: "testen/hausaufgaben/neu", Component: HomeworkEdit }), // нова Hausaufgabe (частина 14)
          page({ path: "testen/hausaufgaben/:id/bearbeiten", Component: HomeworkEdit }),
          page({ path: "editor-code", Component: EditorCode }),
          page({ path: "statistik", Component: Statistic }),
          // «Mehr» / «Einstellungen»: на ПК спільна оболонка з меню розділів (SettingsLayout)
          {
            path: "mehr",
            Component: SettingsLayout,
            errorElement: <RouteError inline />,
            children: [
              page({ index: true, Component: More }),
              page({ path: "kurse", Component: MyCourses }),
              page({ path: "darstellung", Component: Appearance }),
              page({ path: "fachfarben", Component: SubjectColors }),
              page({ path: "sync", Component: NotesSync }), // Notizen synchronisieren
              page({ path: "editor-code", Component: EditorCode }),
              page({ path: "datenschutz", Component: Datenschutz }),
            ],
          },
        ],
      },
    ],
  },
]);
