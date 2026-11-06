# Прогресс

## Готово
- **01 Каркас** (2026-11-05): токены Soft (шрифты, радиусы, тени, отступы), `errorElement` на всех маршрутах, тесты `api.js`, линтер чистый, тема работает при CSP сервера.
- **02 Zugang** (2026-11-05): вход по макету на телефоне и ПК, ошибки пароля, блокировка, Datenschutz без входа.
- **03 Kurse wählen** (2026-11-05): экран первого запуска, все состояния, выбор хранится на устройстве.
- **04 Woche** (2026-11-05): телефон по макету, строка «Stand von … · aktualisiert …», свайп, подсказка о пустой неделе. Раскладка ПК — в части 12.

- **05 Tag** (2026-11-05): список, шкала времени, окно урока и «Info zum Tag» на телефоне по макету. В шапке (i) и время изменения плана, на ПК они тоже есть. Свайп по дням. Один вид карточки урока на телефоне и ПК.

- **06 Состояния** (2026-11-05): скелеты недели и дня, экран «Plan kommt gerade nicht an» с показом последнего плана, плашка Offline, плашка «Neuer Plan» с тем, что изменилось, экраны свободного дня и дня без плана, тосты по макету.

- **07 Klausuren: просмотр** (2026-11-05): список по неделям, чипы предметов, окно деталей с отсчётом дней, «Kalender» и «Teilen», фильтр, пустой экран, загрузка, ошибка и офлайн. Раскладка ПК по макету — в части 12.

- **08 Klausuren: запись** (2026-11-05): форма новой записи и правки, удаление с «Rückgängig», ввод Editor-Code страницей и окном поверх формы, все ответы сервера из таблицы в документации. Раскладка ПК — в части 12.

- **09 Mehr** (2026-11-05): меню «Mehr», Meine Kurse, Darstellung (тема, старт, вид дня, выходные, компактная неделя, шрифт), Fachfarben, «Klasse verlassen», Teilen по макету. Editor-Code теперь открывается из меню, кнопка «назад» возвращает туда, откуда пришли. Раскладка ПК — в части 12.

- **10 Statistik** (2026-11-05): карточки с «ggü.», столбики «Diese Woche nach Tag», «Fällt am häufigsten aus», «Klausuren nach Fach», экран «Noch zu wenig Daten», офлайн из кеша. Учитывает «Meine Kurse» (`courses=`). Вкладка прячется, если школа выключила статистику. ПК — в части 12.

- **Переключатели и значки** (2026-11-05): в «пилюлях» (`Segmented`, тема в сайдбаре) выбранная плашка плавно едет; чипы и кружки меняют фон и рамку плавно (общее правило в `index.css`). Fachfarben как в артефакте: «Farbe wählen · Orange», галочка в кружке, рамка цвета перетекает. Кружок переключателя плавно едет (`Switch.jsx`, `translate`). Значок предмета — общий `ui/SubjectBadge.jsx`, длинные коды («AGTan») режутся до 3 букв (`badgeCode`).
- **Бэкенд, вариант А** (2026-11-05, «ок» владельца): `GET /api/stats` понимает `hidden=<nr,…>` — скрытые курсы любого типа не считаются (коммит `20be54a` в `/opt/orbook-be`, тесты зелёные, docs и openapi обновлены). Выложен 2026-11-05 21:25 (`update.sh`, тег `pre-update-20261105-212503`), health ok на проде и демо.
- **11 Notizen + Sync** (2026-11-06): шторка «Notiz» по макету 20/21 (предмет, дата с «Ändern», «Löschen» с «Rückgängig»). Экран «Notizen synchronisieren» (`/mehr/sync`): код из 20 знаков, копирование, «Anderes Gerät verbinden» с окном «Trotzdem verwenden?», «Neuen Code erzeugen». В Datenschutz есть «Meine Sync-Notizen löschen». Синхронизация идёт после входа, при возвращении на вкладку и через 5 с после правки (`useNotesSync`). Шифрование — копия эталона (`syncCrypto.js`), тест по вектору бэкенда. Удалённые заметки — «надгробия» (`deleted`), экраны читают через `visibleNotes`/`findNote`.

- **13 Admin** (2026-11-06): отдельная ветка `/admin` со своим входом и меню (телефон — 4 вкладки снизу, ПК — свой сайдбар). Übersicht (карточка плана с 24 столбиками, плитки, Speicher, последние события), Editor-Codes (таблица/карточки, «Neuer Code» с кодом один раз, меню «⋮»), Alle Klausuren (правка с `If-Match`, удаление с «Rückgängig», «Alte löschen»), Kurse und Fächer (через `GET /api/admin/courses`), Protokoll с фильтрами и «Mehr laden», Einstellungen (сохраняется только изменённое, Gefahrenzone со словом LÖSCHEN и паролем). При проверке исправлены: бесконечная перерисовка Übersicht (новый `[]` в селекторе Zustand) и срок «30 Tage» вместо «Schuljahresende» в новом коде (форма открывалась раньше, чем приходили настройки).

- **12 ПК-раскладка** (2026-11-06): Einstellungen с левым меню разделов и плитками «Übersicht», окно Tastenkürzel (`?`) и общие клавиши `W D N K R` и `⌘B` (`useAppHotkeys`). Klausuren ПК: поиск, фильтр под кнопкой (`F`), «Kommend | Vergangen», справа «N Tage bis» и календарь месяца (общий `ui/MonthGrid`, им же пользуется «Woche wählen»). Statistik ПК: «Halbjahr», «Ausfallquote», «<Monat> nach Woche», «Ausfall nach Stunde», раскладка 4 + 2 + 3. Suche ⌘K — окно посередине (`SearchPalette`, отбор в `utils/search.js`). Прямой флажок из макета везде. Сверка: `/root/work/orbook-compare/12-pc/`.

## Дальше
1. Проверить на демо руками: «Meine Kurse» → скрыть Mathe → Statistik меньше. Sync на двух устройствах: Mehr → Notizen synchronisieren → Code erzeugen → на втором устройстве ввести код.
2. **Дизайн «Admin · Kurse und Fächer» утверждён владельцем (2026-11-06, «ок»).** Макет: `design/neu/13-admin-kurse/` (`index.html`, генератор `gen.py`), он же в артефакте https://claude.ai/artifact/Re2LjgRyZCgcLynq57YKCM. `courses.optional` может только добавить Wahl, поэтому у групп и параллельных курсов плашка «Immer Wahl». На ПК новый пункт меню «Kurse & Fächer» между «Klausuren» и «Protokoll».
3. **Следующая часть — 14 Lehrkräfte** (новые экраны: сначала `/orb-design` и «ок дизайн» владельца, бэкенд тоже нужен).
   **Решения владельца (2026-11-06), до макетов:**
   - Код учителя создаёт **админ** (как Editor-Codes: имя/Kürzel учителя, срок, блокировка, «Code-Aktionen»).
   - Учитель может: **Tests/Klausuren** и новый вид записи **Hausaufgaben** (предмет, дата сдачи, текст). Менять и удалять — **только свои записи**. После входа видит **план класса** (Woche, Tag), как ученики.
   - Ученики **видят автора**-учителя: «eingetragen von Mü» (Kürzel из плана). Записи учеников с Editor-Code — по-прежнему без автора.
   - Hausaufgaben удаляются сами **через 30 дней после срока сдачи**; срок **настраивается в админке** (Einstellungen).
   **Макеты готовы, ждут «ок дизайн» (2026-11-06):** `design/neu/14-lehrkraefte/` (`gen.py` рисует SVG поверх оригиналов Soft, `build.py` собирает `index.html`), артефакт https://claude.ai/artifact/1Gand6CuQ9SLx8C8K6pYMX, PNG в `/root/work/orbook-compare/14-lehrkraefte/png/` (рендер с Nunito: `_tools/svgpng.mjs`). Hausaufgaben — во вкладке Klausuren переключателем; на ПК в админке отдельный пункт «Lehrer-Codes». Ответы владельца (2026-11-06): Hausaufgaben с Editor-Code — галочка «Hausaufgaben eintragen» у кода (по умолчанию выкл., напр. для старосты), права Lehrer-Code тоже галочками; учитель входит только по коду, без пароля класса. Макеты обновлены (`handy-13`, `pc-05` — Neuer Editor-Code). Ещё решено: у Lehrer-Code обе галочки включены сразу, админ может снять. Записи учителя меняют учитель и админ; ученик — только при двух галочках: право «Lehrer-Einträge ändern» у Editor-Code (по умолчанию выкл.) и переключатель «Schüler dürfen ändern» в самой записи (по умолчанию выкл.). В окне записи написано, кто может менять. Макеты `handy-14` (Klausur учителя), `pc-05` (два новых права).
   Решено дальше: ученик с Freigabe запись учителя только меняет, не удаляет; классу видно «geändert von Schüler» без имени и «Verlauf» изменений (`handy-15`). План бэкенда — `docs/specs/14-lehrkraefte/backend-plan.md`. **«ок дизайн, ок план» — 2026-11-06.**
   **Бэкенд сделан (2026-11-06):** коммиты `48aa74b`, `d02a503` в `/opt/orbook-be` (808 тестов, ruff чистый, миграция 0006). API — `docs/API.md` бэкенда: разделы «Lehrkraft», «Hausaufgaben», таблица прав в «Klausuren», «Admin · Hausaufgaben», `GET /api/admin/teachers`. **Выложен 2026-11-06 17:17** на прод и демо (схема 0006 на обеих базах; демо мигрировали отдельно — `update.sh` его не мигрирует).
   **Дальше (новый чат, `/orb-auto`):** после выкладки бэкенда — `docs/specs/14-lehrkraefte/spec.md`, затем фронт по макетам `design/neu/14-lehrkraefte/` (артефакт https://claude.ai/artifact/1Gand6CuQ9SLx8C8K6pYMX):
   1. вход учителя (`POST /api/auth/teacher`, `me.role`, `me.teacher`), ссылка на Zugang, «Sie»;
   2. Hausaufgaben: переключатель «Klausuren · Hausaufgaben» во вкладке Klausuren, список, окно с «Verlauf» (`/history`), форма, пусто, блок «fällig heute» в Tag, фильтр «Meine Kurse»;
   3. автор/«Ändern: …»/«geändert von Schüler» в Klausur и Hausaufgabe (`author`, `studentsMayEdit`, `lastChange`, `canDelete`), переключатель «Schüler dürfen ändern» в формах учителя;
   4. админка: «Lehrer-Codes» (телефон — переключатель во вкладке Codes, ПК — пункт меню), новые галочки у Editor-Code, Einstellungen «Hausaufgaben» (`homework.keepDays`), Hausaufgaben в «Alle Klausuren».
   Нюанс API: у кодов «Immer» нет (бессрочных кодов не бывает), в макетах 42/44 так и было. Артефакт не обновлён (публикация была выключена) — свежая страница в `design/neu/14-lehrkraefte/index.html`.
   Экраны для `/orb-design` (`design/neu/14-lehrkraefte/`): вход учителя по коду (рядом с Zugang/Editor-Code), Hausaufgaben в дне и в списке, форма «Hausaufgabe eintragen», подпись автора в Klausur/Hausaufgabe, админка «Lehrer-Codes» и настройка срока удаления. Показ — артефактом (память `design-review-artifact`). Бэкенд — только после «ок дизайн» и «ок» плана в `/opt/orbook-be`.
   Коммитить только свои файлы явными путями (`git add <файлы>`), не `git add -A`: в этой папке иногда работают две сессии сразу (одно сообщение, отправленное в два окна CloudCLI, запускает две копии чата).
   Ловушка Zustand 5: селектор не должен возвращать новый `[]`/`{}` — брать постоянную пустую константу.
4. Проверить админку на демо руками: нужен пароль админа (есть только у владельца).

В части 17 вернуть в Mehr (и в меню Einstellungen на ПК, `settingsSections`) строку «Mitteilungen».

Замечено на A++: заголовок «Diese Woche» на телефоне обрезается до «Diese Woc…» рядом с тремя кнопками.

Запись Klausuren проверена на подставном сервере, поля сверены с кодом бэкенда (`exams/schemas.py`). На настоящем демо запись ещё не пробовали: нужны пароль класса и Editor-Code, они есть только у владельца.

Браузер на горизонтальный свайп сам уходит «назад» в истории. Теперь это отключено для всего приложения (`overscroll-behavior-x` в `index.css`). Проверять свайп надо настоящими касаниями (CDP `Input.dispatchTouchEvent`): подставные `TouchEvent` этого не показывают.

## Скриншоты
Сравнения с макетом сохранять в `/root/work/orbook-compare/<часть>/` (например `05-tag`), а не во временную папку: она исчезает вместе с сессией.

## Как проверять экраны за входом
Пароль класса демо есть только у владельца, поэтому экраны за входом проверяются локально, на подставных ответах API. На самом демо без пароля виден только экран входа и Datenschutz.

1. `npm run build`, затем `npx vite preview --port 4179 --strictPort`. Порт 4173 на `127.0.0.1` занят чужим сервисом другого проекта, его не трогать. Адрес страницы в скриптах: `http://localhost:4179`.
2. Скопировать `tools/screens/` в папку вне репозитория (уже лежит готовая: `/root/work/orbook-compare/_tools/`, там же `exams.mjs`, `search.mjs`) и там выполнить `npm init -y` и `NODE_ENV=development npm i playwright-core`. Браузер уже есть в `~/.cache/ms-playwright`, тяжёлый пакет не нужен.
3. `mock.mjs`: `open(browser, { width, height, theme, storage: chosen, api })` открывает страницу с той же CSP, что на сервере, и подставляет ответы по образцу `docs/API.md`. `side.mjs` ставит картинки рядом (PIL и ImageMagick на сервере нет).

Макеты в PNG: `rsvg-convert -w 780 "<файл>.svg" -o out.png`. `rsvg` рисует их другим шрифтом, поэтому длина текста в макете не сравнивается с точностью до пикселя.

## Опрос и время изменения плана (2026-11-05, решение владельца)
Фронт спрашивает `/api/plan/status` каждые 10 секунд, пока вкладка видима. Время изменения плана показывается внутри плашки дня (вариант A): «07:08» или «Mi 15:15» с иконкой, высота плашки фиксированная. Подробности в окне «Info zum Tag». На самой странице дня (часть 05) взять `changedLabel` и `DayPlanDetails`.

## Прод: уроки без предмета (2026-11-05)
В настоящем плане 13 уроков приходят с `subject: null` (замены и события вроде конференции), в `docs/API.md` этого случая нет. Весь фронт теперь это переносит: код «–», название «Ohne Fach», серый цвет. `src/components/week/weekRender.test.jsx` рисует настоящие компоненты без браузера и без новых зависимостей. Настоящие ответы API можно прогнать через него: `ORBOOK_REAL_DATA=<папка> npx vitest run weekRender`. Сами данные в репозиторий не кладём.

Как получить данные для такой проверки (только чтение, без пароля):
1. Сделать копию базы во временную папку с правами только для root: `sqlite3` backup из `file:/var/lib/orbook/orbook.db?mode=ro` в `<папка>/copy.db`.
2. `cd <папка> && PYTHONDONTWRITEBYTECODE=1 /opt/orbook-be/.venv/bin/python -I <путь>/tools/screens/dump_prod_plan.py <папка>`: создаст `weeks.json`, `days.json`, `base.json`.
3. После проверки удалить всю папку: в копии базы лежат хеши паролей.

## Подставные данные для Klausuren
Чтобы сравнивать с макетом 13, подставляйте `meta.serverTime` = `2025-09-17`: макет нарисован от этой даты (19 сентября там пятница). Ответ на `/exams/{id}` подставляйте отдельно: `mock.mjs` сравнивает путь по началу, и функция для `/exams` получит этот запрос тоже.

## Настройки (часть 09)
Размеры текста в `index.css` в `rem`, масштаб стоит на `<html data-font-scale>`. Новое значение в пикселях внутри шкал времени надо умножать на `FONT_SCALES`, иначе текст не влезет. В `picked` значение `NO_OPTIONAL` значит «все курсы по выбору выключены»: пустой список по документации значит «показать всё». Вид дня больше не в адресе: `userStore.dayView`.

В `mock.mjs` `addInitScript` заново кладёт `storage` при каждой загрузке. Чтобы проверить, что настройка переживает перезагрузку, открывайте с пустым `storage` и пишите в `localStorage` из страницы.

## Neuer Plan (2026-11-05)
Сравнение идёт с тем, что ученик видел последним: `seenWeeks` в `planStore.js` запоминается до первого запроса недели, потому что ответ перезаписывает и экран, и кеш. «Ansehen» и «Plan neu laden» переносят эту точку на свежие данные. В `localStorage` лежит только `orbook.seenChange`, при выходе он стирается.

## Часть 14 — фронт готов (2026-11-06)
Spec: `docs/specs/14-lehrkraefte/spec.md`. Сделано: вход учителя (`/?zugang=lehrkraft`, `POST /api/auth/teacher`, «Abmelden», без Editor-Code и без выбора курсов), Hausaufgaben (переключатель `?liste=hausaufgaben` во вкладке Klausuren, окно `?sheet=hausaufgabe`, форма `/testen/hausaufgaben/neu`, «fällig heute» в Tag), автор/«Ändern: …»/«Verlauf» в окнах Klausur и Hausaufgabe, «Schüler dürfen ändern» в формах учителя, админка: `/admin/lehrer` (телефон — переключатель на «Codes»), новые права Editor-Code, карточка «Hausaufgaben» в Einstellungen (`homework.keepDays`, «Aufräumen»).
Скриншоты: `/root/work/orbook-compare/14-lehrkraefte/` (`cmp-handy-*.png`, `shots/`), скрипт `_tools/teach.mjs`.
Не сделано (следующие шаги, не блокируют): список Hausaufgaben в админке (`/api/admin/homework`: правка/удаление админом) — сейчас админ меняет только Klausuren; предметы учителя в Lehrer-Codes показываются кодами («Ma, Ph»), а не названиями.
На настоящем демо вход учителя не проверяли: Lehrer-Code создаёт админ (пароль админа есть только у владельца).

**Дальше (новый чат, `/orb-auto`):** часть 15 «Материалы» — экранов нет, сначала `/orb-design` и «ок дизайн» владельца.

## Часть 14b — макеты ждут «ок дизайн» (2026-11-06)
Макеты: `design/neu/14b-passwoerter/` (`gen.py` берёт помощники из `14-lehrkraefte/gen.py`, `build.py` собирает `index.html`), артефакт https://claude.ai/artifact/Fv6TA6PNVUuUL3d9ULCCGp.
Решено в макетах: раздел `/admin/passwoerter` (ПК — пункт меню после «Lehrer-Codes», телефон — из Einstellungen и Übersicht → Schnell); карточка пароля класса в Einstellungen заменяется ссылками; «Erzeugen» с вопросом, пароль показывается один раз (как `CodeReveal`), «Für die Klassengruppe kopieren»; пароль админа: текущий + новый (мин. 12), ошибка `wrong_password` с `attemptsLeft`, тост `otherSessionsEnded`. Число устройств до смены API не даёт — показываем только после.
**Дальше (после «ок дизайн»):** `/orb-spec` → `/orb-build` → `/orb-check` для 14b, потом часть 15 (тоже сначала `/orb-design`).
