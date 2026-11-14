import { createBrowserRouter } from "react-router-dom";
import App from "../../App";
import HomePage from "../../pages/HomePage";
import Tests from "../../pages/Tests";
import ExamEdit from "../../pages/ExamEdit";
import HomeworkEdit from "../../pages/HomeworkEdit";
import EditorCode from "../../pages/EditorCode";
import Materials from "../../pages/Materials";
import MaterialEdit from "../../pages/MaterialEdit";
import AppointmentEdit from "../../pages/AppointmentEdit";
import Statistic from "../../pages/Statistic";
import More from "../../pages/More";
import MyCourses from "../../pages/MyCourses";
import Appearance from "../../pages/Appearance";
import PlanSettings from "../../pages/PlanSettings";
import SubjectColors from "../../pages/SubjectColors";
import NotesSync from "../../pages/NotesSync";
import Mitteilungen from "../../pages/Mitteilungen";
import StartPage from "../../pages/StartPage";
import Start from "../../pages/Start";
import Week from "../../pages/Week";
import Klassen from "../../pages/Klassen";
import Schule from "../../pages/Schule";
import Day from "../../pages/Day";
import Admin from "../../pages/Admin";
import AdminOverview from "../../pages/AdminOverview";
import AdminCodes from "../../pages/AdminCodes";
import AdminTeacherCodes from "../../pages/AdminTeacherCodes";
import AdminExamTypes from "../../pages/AdminExamTypes";
import AdminExams from "../../pages/AdminExams";
import AdminCourses from "../../pages/AdminCourses";
import AdminMuster from "../../pages/AdminMuster";
import AdminLog from "../../pages/AdminLog";
import AdminAccessCodes from "../../pages/AdminAccessCodes";
import AdminPasswords from "../../pages/AdminPasswords";
import AdminChannels from "../../pages/AdminChannels";
import AdminMaterials from "../../pages/AdminMaterials";
import AdminAppointments from "../../pages/AdminAppointments";
import AdminAppointmentEdit from "../../pages/AdminAppointmentEdit";
import AdminSchools from "../../pages/AdminSchools";
import ClassManage from "../../pages/ClassManage";
import AdminSettings from "../../pages/AdminSettings";
import RouteError from "../../pages/RouteError";
import Datenschutz from "../../pages/Datenschutz";
import JoinPage from "../../pages/JoinPage";
import Neuigkeiten from "../../pages/Neuigkeiten";
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
      // посилання-запрошення (частина 16): відкривається без входу
      page({ path: "i/:token", Component: JoinPage }),
      // Адмінка: свій вхід і своє меню, вхід класу їй не потрібен (docs/frontend/09-admin.md)
      {
        path: "admin",
        Component: Admin,
        errorElement: <RouteError />,
        children: [
          page({ index: true, Component: AdminOverview }),
          page({ path: "codes", Component: AdminCodes }),
          page({ path: "lehrer", Component: AdminTeacherCodes }), // Lehrer-Codes (частина 14)
          page({ path: "klausuren", Component: AdminExams }),
          page({ path: "arten", Component: AdminExamTypes }), // Arten von Tests mit Kürzel (часть 24)
          page({ path: "kurse", Component: AdminCourses }),
          page({ path: "muster", Component: AdminMuster }), // свій Muster тижнів A і B (частина 19b)
          page({ path: "protokoll", Component: AdminLog }),
          page({ path: "einstellungen", Component: AdminSettings }),
          page({ path: "zugang", Component: AdminAccessCodes }), // Zugangscodes (частина 14c)
          page({ path: "passwoerter", Component: AdminPasswords }), // пароль класу і адміна (частина 14b)
          page({ path: "materialien", Component: AdminMaterials }), // усі посилання, видалення (частина 15)
          page({ path: "termine", Component: AdminAppointments }), // усі терміни (частина 18)
          page({ path: "kanaele", Component: AdminChannels }), // Telegram-група класу (частина 27)
          page({ path: "schulen", Component: AdminSchools }), // школи і класи сервера (частина 29c)
          page({ path: "termine/neu", Component: AdminAppointmentEdit }),
          page({ path: "termine/:id/bearbeiten", Component: AdminAppointmentEdit }),
        ],
      },
      {
        Component: HomePage,
        errorElement: <RouteError />,
        children: [
          page({ index: true, Component: StartPage }), // Start, Woche або Heute: налаштування «Startansicht»
          page({ path: "start", Component: Start }), // блоки (частина 30c)
          page({ path: "start/anpassen", Component: Start }), // режим «Anpassen»: окремий адрес — «назад» виходить із нього
          page({ path: "woche", Component: Week }),
          page({ path: "klassen", Component: Klassen }), // «Meine Klassen» (частина 29)
          page({ path: "klassen/schule/:id", Component: Schule }), // страница школы (часть 29d)
          page({ path: "heute", Component: Day }), // сьогоднішній день
          page({ path: "tag/:datum", Component: Day }), // будь-який день: /tag/2026-10-07
          page({ path: "testen", Component: Tests }),
          page({ path: "testen/neu", Component: ExamEdit }), // нова Klausur
          page({ path: "testen/:id/bearbeiten", Component: ExamEdit }), // правка
          page({ path: "testen/hausaufgaben/neu", Component: HomeworkEdit }), // нова Hausaufgabe (частина 14)
          page({ path: "testen/hausaufgaben/:id/bearbeiten", Component: HomeworkEdit }),
          page({ path: "testen/termine/neu", Component: AppointmentEdit }), // новий Termin (частина 18)
          page({ path: "testen/termine/:id/bearbeiten", Component: AppointmentEdit }),
          page({ path: "editor-code", Component: EditorCode }),
          page({ path: "statistik", Component: Statistic }),
          page({ path: "materialien", Component: Materials }), // посилання на Drive за предметами (частина 15)
          page({ path: "materialien/neu", Component: MaterialEdit }),
          page({ path: "materialien/:id/bearbeiten", Component: MaterialEdit }),
          // «Mehr» / «Einstellungen»: на ПК спільна оболонка з меню розділів (SettingsLayout)
          {
            path: "mehr",
            Component: SettingsLayout,
            errorElement: <RouteError inline />,
            children: [
              page({ index: true, Component: More }),
              page({ path: "kurse", Component: MyCourses }),
              page({ path: "darstellung", Component: Appearance }),
              page({ path: "darstellung/stundenplan", Component: PlanSettings }), // що видно в клітинці уроку (частина 30b)
              page({ path: "fachfarben", Component: SubjectColors }),
              page({ path: "sync", Component: NotesSync }), // Notizen synchronisieren
              page({ path: "mitteilungen", Component: Mitteilungen }), // Web Push (частина 17)
              page({ path: "editor-code", Component: EditorCode }),
              page({ path: "klasse-verwalten", Component: ClassManage }), // Zugangscodes своего класса (часть 29c)
              page({ path: "neuigkeiten", Component: Neuigkeiten }), // «Was ist neu», все версии (часть 22b)
              page({ path: "datenschutz", Component: Datenschutz }),
            ],
          },
        ],
      },
    ],
  },
]);
