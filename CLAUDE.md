# ORBook — фронтенд (правила для Claude)

Рабочая копия `anttoha/orbook` (`/root/work/orbook`). Фронт лежит в корне репозитория (`src/`, `package.json`). Серверная копия `/opt/orbook` — только для автовыкладки (её обновляет таймер), там ничего не править.

## Главное
- **Дизайн не выдумывать.** Каждый экран — по файлам из `/opt/orbook-be/design/ORBook Soft/` (телефон и ПК, светлая и тёмная). Если экрана нет — сначала `/orb-design`, утверждение пользователя, потом код.
- **Пользователь учится по этому коду.** Простые имена, маленькие компоненты, короткие комментарии «зачем», а не «что». После каждого шага — 2–4 строки объяснения по-русски.
- Тексты интерфейса — **по-немецки**, как в дизайне. Общение с пользователем — по-русски.

## Стек
Vite + React, **JavaScript (не TypeScript)**, React Router, CSS-модули или обычный CSS с переменными. Новые зависимости — только с объяснением, зачем, и если без них правда сложно.

## Структура
```
src/
  ui/        общие компоненты (Button, Card, Chip, Sheet, Toast, Icon) — только они рисуют «кирпичики»
  styles/    tokens.css (все цвета Soft как CSS-переменные, светлая+тёмная), fonts
  api/       api.js из /opt/orbook-be/docs/examples, по файлу на раздел API
  features/  zugang, woche, tag, klausuren, notizen, mehr, statistik, admin, lehrkraft …
  app/       роутер, errorElement, провайдеры
```

## Правила кода
- Цвета, радиусы, отступы — **только** через переменные из `tokens.css`. Никаких `#6C4DF6` в компонентах.
- Шрифт Nunito, иконки — контурные SVG как в дизайне.
- API — только через `src/api/`, пути относительные (`/api/...`), **без домена**.
- Любое поле, которое в `/opt/orbook-be/docs/API.md` может быть `null`, обрабатывать (`?.` и запасной текст).
- Правка Klausur — с `If-Match`, ответы 409/428 — как в `/opt/orbook-be/docs/frontend/`.
- Sync-шифрование — только эталон `/opt/orbook-be/docs/examples/sync-crypto.mjs`, не переписывать.
- `useEffect` — только когда правда нужно, с очисткой.
- На каждом маршруте `errorElement` с немецким текстом «Etwas ist schiefgelaufen».
- «Stand von …»: под названием дня мелкая серая строка из `publishedAt` дня; в шапке «aktualisiert vor N Min.» из `fetchedAt`. Ненавязчиво.

## Проверки
`npm run lint`, `npm test` (Vitest на логику), `npm run build`. Разработка — против демо (`vite.config.js`: proxy `/api` → `https://orbook-demo.orbitium.net`).
Выкладка: `git push` в `main` → таймер на сервере сам выкладывает демо (до ~2 минут). Прод — только по слову пользователя «на прод» (публикуется GitHub Release).

## Где что лежит (источники правды лежат в репозитории бэкенда)
- Дизайн: `/opt/orbook-be/design/ORBook Soft/` (1 Handy Hell, 2 Handy Dunkel, 3 PC Hell, 4 PC Dunkel). Новые экраны (`/orb-design`) — в `design/neu/` этого репозитория.
- Документация API и примеры: `/opt/orbook-be/docs/` (`API.md`, `FRONTEND.md`, `frontend/`, `examples/`, `openapi.json`).
- **Бэкенд** (новые эндпоинты, поля, миграции) делается только в `/opt/orbook-be` по его `CLAUDE.md` (план → «ок» владельца, `make lint test`, обновление `docs/API.md`, `docs/FRONTEND.md`, `docs/openapi.json`), выкладка — `scripts/update.sh`. Не правь бэкенд отсюда.
- Прогресс: `docs/PROGRESS.md`, части: `docs/specs/README.md`, команды: `.claude/commands/`.

## Состояние репозитория (расхождение, решить в части 01)
Сейчас в коде Tailwind и другая структура (`src/components/ui`, `src/shared/api`, `src/pages`), а правила выше описывают `src/ui`, `src/api`, `src/features`, `tokens.css`. Часть 01 («Каркас») должна сначала согласовать это с владельцем, а не молча переписывать.
