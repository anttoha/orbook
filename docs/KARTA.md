# Карта проєкту ORBook (фронтенд)

Коротко: що де лежить, як дані йдуть від сервера до екрана і з чого почати читати.
Гайди бекенду: репозиторій `orbook-be`, папка `docs/frontend/` (01–10) і `docs/API.md`.

---

## 1. Як запустити

```bash
npm install
npm run dev            # http://localhost:5173 (саме 5173: цю адресу дозволяє сервер)
```

Запити `/api/...` Vite пересилає на сервер (`vite.config.js` → `proxy`).
За замовчуванням це **демо-сервер** `https://orbook-demo.orbitium.net` (вигадані дані, «сьогодні» зафіксоване).
Інший сервер (наприклад, локальний бекенд):

```bash
API_TARGET=http://127.0.0.1:8711 npm run dev
```

Пароль класу демо — у власника. У коді паролів **немає** і бути не повинно.

---

## 2. Шлях даних: сервер → екран

```
сервер (/api/...)
   │
   ▼
shared/api/api.js            fetch + помилки з німецьким текстом (ApiError), 401 → екран входу
   │
   ▼
shared/api/offlineCache.js   зберігає останню вдалу відповідь у localStorage («letzter Stand»)
   │
   ▼
shared/store/planStore.js    ОДНЕ місце для всіх даних сервера:
                             me, meta, courses, exams, status, weeks{понеділок: …}, now
   │
   ▼
shared/hooks/usePlan.js      useWeek(понеділок), useDay(дата), useLessonFilter()
shared/hooks/useNow.js       { now, today } — час ШКОЛИ (з meta.serverTime)
   │
   ▼
pages/Week.jsx, pages/Day.jsx → компоненти (components/…)
```

Що вантажиться коли:

| Коли | Запит | Де в коді |
|---|---|---|
| старт | `GET /api/auth/me` | `planStore.start()` |
| вхід | `POST /api/auth/login` | `planStore.login()` ← `pages/AuthPage.jsx` |
| після входу | `/meta`, `/courses`, `/exams`, `/plan/status` (паралельно) | `planStore.loadBasics()` |
| відкрили тиждень/день | `GET /api/week?date=<понеділок>` | `planStore.loadWeek()` ← `useWeek` / `useDay` |
| раз на хвилину | `GET /api/plan/status` → тост «Neuer Plan da» | `planStore.checkStatus()` ← таймер у `HomePage.jsx` |
| «Plan neu laden» (меню ⋮, клавіша R) | `POST /api/plan/refresh` | `planStore.refreshPlan()` |
| шторка «Teilen» | `GET /api/share?range=…` | `shared/utils/share.js` → `ShareSheet.jsx` |
| календар «Woche wählen» | `GET /api/exams?from=&to=` (крапки) | `components/week/WeekPicker.jsx` |
| вихід | `POST /api/auth/logout` + очистити кеш | `planStore.logout()` (кнопки ще немає — див. п. 6) |

День **окремо не вантажиться**: він береться з тижня (`useDay` шукає його в `week.days`).
Субота/неділя сервер у тижні не віддає — їх складає `weekendDay()` у `shared/utils/lessons.js`.

Стани (гайд 08): у тижня `status` = `loading` → скелет, `ready` → дані,
`offline` / `unavailable` → дані з кешу + плашка (`components/ui/PlanState.jsx`), `error` → «Erneut versuchen».

---

## 3. Що де лежить

```
src/
  main.jsx, App.jsx            старт React, роутер
  index.css                    шрифти, кольори (світла/темна тема), стилі тексту text-*
  pages/
    HomePage.jsx               оболонка: вхід? → сайдбар/нижнє меню + сторінка + шторки; таймер «раз на хвилину»
    AuthPage.jsx               екран «Zugang» (пароль класу)
    Week.jsx                   тиждень (телефон + ПК)
    Day.jsx                    день (телефон + ПК), стани «frei», «Plan fehlt noch»
    Admin.jsx, More.jsx, Tests.jsx, Statistic.jsx   заглушки
  components/
    week/                      сітка тижня (телефон), меню ⋮, календар; desktop/ — сітки й права колонка для ПК
    day/                       список/шкала уроків, картка «Jetzt», нотатки; desktop/ — права колонка дня на ПК
    sheets/                    шторки з адреси ?sheet=… (урок, Info, нотатка, колір, Teilen, календар)
    lesson/                    контекстне меню уроку і підказка
    navbar/                    сайдбар (ПК) і нижнє меню (телефон)
    ui/                        дрібні спільні деталі: кнопки, бейджі, Sheet, стани PlanState
  shared/
    api/api.js                 обгортка fetch (з гайду 01)
    api/offlineCache.js        кеш «letzter Stand» (з гайду 08)
    store/planStore.js         дані сервера
    store/userStore.js         те, що живе тільки на пристрої: нотатки, «Meine Kurse», кольори, вихідні
    hooks/                     useNow, usePlan, useSheet (шторки через адресу), useHotkeys, useMediaQuery, useTheme
    utils/format.js            німецькі підписи й дати (з гайду 03) — дата завжди рядок "YYYY-MM-DD"
    utils/lessonClock.js       «Jetzt», «noch 27 min», час Берліна (з гайду 03)
    utils/lessons.js           кольори предметів, рядки сітки, «вільний» день, підписи уроку
    utils/share.js             «Teilen» (з гайду 03)
    constants/fachColors.js    8 палітр і який код предмета яку бере (De, Ma, En, Ph, Ge, Ku, Sp, Bi)
```

Урок із сервера (поля, які використовуються найчастіше):

```js
{ period: 4, start: "10:20", end: "11:05", status: "substitution",   // normal | cancelled | substitution | room_change | moved | added
  subject: { code: "En", name: "Englisch" }, teacher: "T26", room: "305",
  course: { nr: "133", label: "En" }, changes: { teacher: { old: "T25", new: "T26" } },
  moved: null, info: "für En (T25)", examId: null }
```

У одного `period` буває **кілька** уроків (паралельні курси) — тому всюди `lessons.filter(l => l.period === …)`.

---

## 4. З чого почати читати

1. `shared/api/api.js` — як іде будь-який запит.
2. `shared/store/planStore.js` — які дані є і як вони вантажаться.
3. `shared/hooks/usePlan.js` — як сторінка бере тиждень/день.
4. `pages/Week.jsx` (частина «Телефон» внизу) → `components/week/WeekGrid.jsx` → `LessonCell.jsx`.
5. `pages/Day.jsx` → `components/day/LessonList.jsx` → `LessonRow.jsx`.
6. `shared/utils/format.js` і `lessonClock.js` — коли треба зрозуміти конкретний підпис.

---

## 5. Що замінити, щоб вийшла структура з гайду (робиш сам)

Гайд (`docs/frontend/01-start.md`, розділ 2) радить таку структуру. Код уже написаний за гайдом —
лишається тільки **перенести файли** і поправити шляхи в `import`:

| Зараз | За гайдом | Примітка |
|---|---|---|
| `src/shared/api/api.js` | `src/api.js` | той самий код |
| `src/shared/api/offlineCache.js` | `src/offline-cache.js` | у гайді `createCache(storage)`; у нас одразу готовий об'єкт `cache` |
| `src/shared/utils/format.js` | `src/format.js` | + кілька помічників для дат |
| `src/shared/utils/lessonClock.js` | `src/lesson-clock.js` | + `lessonProgress`, `isLessonPast`, `isLessonNow` |
| `src/shared/utils/share.js` | `src/share.js` | + `copyText` з тостом, `lessonText` |
| `src/shared/store/planStore.js` + `src/shared/hooks/usePlan.js` | `src/use-resource.js` | у гайді — хук на кожен екран; у нас — один store (ті самі 6 станів) |
| `src/shared/store/userStore.js` | `src/state/` | налаштування на пристрої |
| `src/pages/*.jsx` | `src/screens/*.jsx` | «по екрану дизайну на файл» |
| — | `src/exam-rules.js`, `src/sync-crypto.js`, `src/notes-sync.js` | ще не потрібні (див. п. 6); приклади — `orbook-be/docs/examples/` |

Порада: переносити по одному файлу, після кожного — `npm run build`. Помилка «Failed to resolve import» скаже, який шлях ще старий.

Що вже **прибрано**: тестові дані (`shared/data/timetable.js`), заглушки сервера в старому `api.js`,
`shared/utils/dates.js`, `shared/utils/time.js`, бібліотека `date-fns` (дати тепер у `format.js` без бібліотек),
пароль «1234» у `HomePage.jsx`.

---

## 6. Що ще не зроблено (за гайдами)

- **Erster Start · Kurse / Meine Kurse** (гайд 02, 07): вибір курсів. Поки нічого не вибрано — видно всі уроки;
  «Kurs ausblenden» у меню уроку вже працює (`userStore.picked`).
- **Klasse verlassen** (гайд 02): функція `planStore.logout()` готова, кнопки ще немає (місце — сторінка «Mehr»).
- **Klausuren** (гайд 04): список, додавання з Editor-Code (`exam-rules.js`, `ifMatch`).
- **Statistik** (гайд 05), **Notizen-Sync** (гайд 06: нотатки зараз тільки на пристрої), **Einstellungen** (07), **Admin** (09).
- Банер «Neuer Plan da» з текстом змін (`plan-diff.js` з гайду 08) — зараз простий тост «Neuer Plan da · Ansehen».
- PWA: `manifest` і `sw.js` (гайд 08, кінець).

Відмінності дизайну від даних (з `orbook-be/docs/FRONTEND.md`): старого кабінету школа не повідомляє
(тому закреслюється тільки вчитель), назв свят немає (пишемо «frei» / «Schulfrei»), код біології — `Bi`.
