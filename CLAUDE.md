# ORBook — фронтенд (правила для Claude)

Рабочая копия `anttoha/orbook` (`/root/work/orbook`). Фронт лежит в корне репозитория (`src/`, `package.json`). Серверная копия `/opt/orbook` — только для автовыкладки (её обновляет таймер), там ничего не править.

## Главное
- **Дизайн не выдумывать.** Каждый экран — по файлам из `/opt/orbook-be/design/ORBook Soft/` (телефон и ПК, светлая и тёмная). Если экрана нет — сначала `/orb-design`, утверждение пользователя, потом код.
- **Пользователь учится по этому коду.** Простые имена, маленькие компоненты, короткие комментарии «зачем», а не «что». После каждого шага — 2–4 строки объяснения по-русски.
- Тексты интерфейса — **по-немецки**, как в дизайне. Общение с пользователем — по-русски.
- **Статус — в первой строке последнего сообщения**, когда работа над частью останавливается (одна из трёх):
  - `✅ ЧАСТЬ <№> ГОТОВА` — только если все проверки прошли, изменения на демо и открыты там; дальше: что проверить на демо.
  - `⏸ ЧАСТЬ <№> ЖДЁТ ТЕБЯ — <что нужно>` (например «ок дизайн?», вопрос, «на прод?»).
  - `❌ ЧАСТЬ <№> ОСТАНОВЛЕНА — <почему>` (ошибка, которую не удалось починить, или кончился контекст).
  Последняя строка сообщения: `Дальше: …` — точно, что сделать пользователю, **всегда с моделью и effort** из строки части в `docs/specs/README.md` (например «новый чат → модель Sonnet, effort medium → `/orb 22b`»). Если следующий шаг той же части идёт на другой модели (часть «Fable → Opus» после «ок дизайн»), так и написать: «ответь „ок“ и переключи на Opus, effort high — в этом же чате». Промежуточные сообщения так не помечать.

## Стек
Vite + React 19, **JavaScript (не TypeScript)**, **Tailwind CSS v4** (плагин `@tailwindcss/vite`), React Router, Zustand, Radix UI, Vitest. Новые зависимости — только с объяснением, зачем, и если без них правда сложно.

## Структура (оставляем как есть)
```
src/
  components/ui/   общие «кирпичики» (Button, Badge, Sheet, Section, Segmented …) — только они рисуют базовые элементы
  components/      week, day, lesson, sheets, navbar — составные части экранов
  pages/           экраны (Week, Day, Tests, Statistic, More, Admin, AuthPage …)
  shared/api/      api.js (за основу — /opt/orbook-be/docs/examples/api.js), offlineCache.js
  shared/utils/    чистые функции (lessons.js, format.js …) — их и тестируем
  shared/{hooks,store,router,constants}/
  index.css        Tailwind + ВСЕ токены Soft в @theme (см. ниже)
```
Новый экран — `pages/` + части в `components/<раздел>/`. Логику без React — в `shared/utils/` с тестом рядом (`*.test.js`).

## Токены (Tailwind v4: «конфиг» = блок `@theme` в `src/index.css`)
- **Цвета Soft** — переменные `--color-*` в `@theme` (светлая тема), а тёмные значения тех же имён — в `.dark { … }` в том же файле. Переключение темы = класс `dark` на корне, поэтому компонент пишет один класс (`bg-card text-ink`) и работает в обеих темах.
- В компонентах — **только классы токенов** (`bg-paper`, `text-muted`, `bg-mathe-tint`). Никаких hex (`#6C4DF6`), `rgb()`, `text-[#…]`, произвольных значений `bg-[…]` для цветов. Нужного цвета нет — сначала добавь токен в `@theme` **и** в `.dark`, взяв значение из дизайна.
- **Шрифт** Nunito — `font-sans` / `font-nunito` (`@font-face` в `index.css`). Размеры и жирность текста — готовые классы `text-display`, `text-title`, `text-body`, `text-caption` … (таблица в `index.css`), не `text-[13px]`.
- **Радиусы и отступы** — тоже токены `@theme` (`--radius-*`, `--spacing`/`--container-*`) и классы `rounded-*`, `p-*`, `gap-*` от них. Значения берём из дизайна Soft. Таблицы классов — в `index.css`: радиусы (`rounded-card`, `rounded-field` …), тени (`shadow-menu` …), ширины (`w-sidebar` …), край телефона `px-gutter`. Стандартные `rounded-xl`, `shadow-md` отключены. Правила стережёт `shared/utils/designTokens.test.js`.

## Правила кода
- Иконки — контурные SVG как в дизайне (lucide-react подходит, если вид совпадает с дизайном).
- API — только через `src/shared/api/`, пути относительные (`/api/...`), **без домена**.
- Любое поле, которое в `/opt/orbook-be/docs/API.md` может быть `null`, обрабатывать (`?.` и запасной текст). Для таких случаев — тест в `shared/utils`.
- Правка Klausur — с `If-Match`, ответы 409/428 — как в `/opt/orbook-be/docs/frontend/`.
- Sync-шифрование — только эталон `/opt/orbook-be/docs/examples/sync-crypto.mjs`, не переписывать.
- `useEffect` — только когда правда нужно, с очисткой.
- На каждом маршруте `errorElement` с немецким текстом «Etwas ist schiefgelaufen».
- В плашке дня второй строкой под датой, с маленькой иконкой обновления: время из `changedAt` (иначе `publishedAt`), в тот же день «07:08», раньше «Mi 15:15» (`changedLabel`). Цвет `text-faint`, на сегодняшнем дне `text-on-accent/70`. Место под строку зарезервировано, высота плашки фиксированная. Под заголовком недели — «● Live · geprüft vor N Sek.» (`LiveLine`, `status.lastOkAt`). Подробности — в окне «Info zum Tag»: «Verlauf des Tages» (Fassungen дня) и «Zuletzt geprüft»; под неделей — строка «Live».
- Changelog «Was ist neu» (часть 22b): при каждом релизе дописывай запись **сверху** в `src/shared/changelog.js` вместе с `docs/releases/vX.Y.Z.md`. Тексты — по-немецки, коротко, по-человечески (как одноклассник, не как пресс-релиз); группы `neu` / `behoben` / `entfernt`.
- Новый план приходит потоком `GET /api/plan/stream` (часть 26, `usePlanLive` + `shared/api/planStream.js`), только пока вкладка видима. Без потока (503, сеть) — опрос `/api/plan/status` раз в минуту (`conditional: true` в `api`: при 304 ничего не перерисовываем).

## Проверки
`npm run lint`, `npm test` (Vitest), `npm run build`. В окружении сервера стоит `NODE_ENV=production`, из-за чего `npm install` пропускает dev-зависимости: ставь `npm install --include=dev`, а тесты/линтер запускай с `NODE_ENV=development`. Разработка — против демо (`vite.config.js`: proxy `/api` → `https://orbook-demo.orbitium.net`).
Выкладка: `git push` в `main` → таймер на сервере сам выкладывает демо (до ~2 минут). Прод — только по слову пользователя «на прод» (публикуется GitHub Release).

## Где что лежит (источники правды лежат в репозитории бэкенда)
- Дизайн: `/opt/orbook-be/design/ORBook Soft/` (1 Handy Hell, 2 Handy Dunkel, 3 PC Hell, 4 PC Dunkel). Новые экраны (`/orb-design`) — в `design/neu/` этого репозитория.
- Документация API и примеры: `/opt/orbook-be/docs/` (`API.md`, `FRONTEND.md`, `frontend/`, `examples/`, `openapi.json`).
- **Бэкенд** (новые эндпоинты, поля, миграции) делается только в `/opt/orbook-be` по его `CLAUDE.md` (план → «ок» владельца, `make lint test`, обновление `docs/API.md`, `docs/FRONTEND.md`, `docs/openapi.json`), выкладка — `scripts/update.sh`. Не правь бэкенд отсюда.
- Прогресс: `docs/PROGRESS.md`, части: `docs/specs/README.md`, команды: `.claude/commands/`.

## Состояние репозитория
Решение владельца: **остаёмся на Tailwind и текущих папках**, структуру не переделываем. Токены Soft (цвета, шрифты, радиусы, тени, отступы) лежат в `index.css`. `npm run lint` чистый: новых ошибок не оставляем.
