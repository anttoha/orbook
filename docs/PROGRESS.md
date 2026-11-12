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

## Часть 14b — готово (2026-11-06)
Spec: `docs/specs/14b-passwoerter/spec.md`, макеты `design/neu/14b-passwoerter/` (артефакт https://claude.ai/artifact/Fv6TA6PNVUuUL3d9ULCCGp).
Сделано: страница `/admin/passwoerter` (`pages/AdminPasswords.jsx`, `components/admin/passwords/`): пароль класса — свой или «Erzeugen» (пароль один раз в `CodeReveal`, «Für die Klassengruppe kopieren»), пароль админа (текущий + новый, ошибки под полями, пауза после 429 — `useLockTimer`). Поле с «глазом» — `ui/PasswordField` (у `TextField` новый слот `trailing`). В Einstellungen вместо карточки пароля — `PasswordLinks`, в Übersicht → Schnell строка «Passwörter», на ПК пункт меню.
Скриншоты: `/root/work/orbook-compare/14b-passwoerter/` (`cmp-*.png`, `shots/`), скрипт `_tools/pw.mjs`.
На демо смену паролей руками не проверяли: нужен пароль админа (есть только у владельца). Осторожно: «Erzeugen» на демо выкинет всех из демо-класса.

**Дальше (`/orb-auto`):** часть 15 «Материалы» — экранов нет, сначала `/orb-design` и «ок дизайн» владельца.

## Часть 15 «Materialien» — ждёт «ок дизайн» (2026-11-06)
Макеты: `design/neu/15-materialien/` (`gen.py` рисует SVG, `build.py` собирает `index.html`), артефакт https://claude.ai/artifact/CCAw6FL8CbAZu82V7ehoxa.
Экраны: список по предметам (из Mehr → «Klasse» и из левого меню ПК), действия (долгое нажатие / правая кнопка), «Neuer Link» (распознаёт Google Drive / OneDrive, другие сайты — ошибка), тост, удаление, пусто, skeleton, блок «Materialien · Fach» в окне урока, право «Materialien teilen» у кодов.
Вопросы владельцу: кто добавляет (предложено: учителя по своим предметам, админ, Editor-Codes с правом), кто удаляет (автор, админ, учитель предмета), какие сайты (только Google Drive/Docs и OneDrive/SharePoint).
Дизайн ок, права решены (2026-11-06). Spec: `docs/specs/15-materialien/spec.md`.
**Дальше:** ждём «ок» плана бэкенда (миграция 0007 `materials` + `can_materials`, `/api/materials`, admin, `teacher.subjects`), затем бэкенд в `/opt/orbook-be` и `/orb-build`.
Новые части по пожеланию владельца: 18 «Termine», 19 «Muster-Stundenplan» (в README сразу после 15).

## Часть 15 — готово (2026-11-06)
Spec: `docs/specs/15-materialien/spec.md`. Бэкенд выложен (миграция 0007, `/api/materials`, `/api/admin/materials`, `teacher.subjects`).
Фронт: `/materialien` (`pages/Materials.jsx`, `components/materials/`), шторка действий `?sheet=material&id=` (долгое нажатие, `useLongPress`), меню правой кнопки на ПК (`MaterialMenu`), форма `/materialien/neu` и `…/:id/bearbeiten` (`MaterialForm`, общий `useExamSave` с `onChanged`), блок в окне урока (`LessonMaterials`), строка «Klasse → Materialien» в Mehr, пункт меню ПК, админ: `/admin/materialien`, право «Materialien teilen», карточка «Erlaubte Seiten». Список — `materialsStore` (кеш офлайн). Проверка ссылки — `shared/utils/materials.js` (как на сервере, с тестами).
Скриншоты: `/root/work/orbook-compare/15-materialien/shots/`, скрипт `_tools/mat.mjs`.
На демо руками не проверяли запись: нужен Lehrer-Code или Editor-Code с правом (создаёт админ, пароль есть только у владельца).

**Дальше (`/orb-auto`):** часть 18 «Termine» — экранов нет, сначала `/orb-design` и «ок дизайн».

## Часть 18 «Termine» — ждёт «ок дизайн» (2026-11-06)
Макеты: `design/neu/18-termine/` (`gen.py` рисует SVG поверх оригиналов Soft, `build.py` собирает `index.html`), артефакт https://claude.ai/artifact/VcujzZsAG1zYmZmTKm11tW.
Экраны: третья вкладка «Termine» в разделе Klausuren (список, окно термина, «Neuer Termin», ошибка даты, тост, удаление, пусто, skeleton), полоска терминов над сеткой недели + строка в карточке недели, плашка «Termin: …» в дне, на ПК — список с месяцем, панель, окно формы, неделя. Право «Termine eintragen» у Editor-Codes (предложение).
Примеры дат — по календарю Soft (1 Sept = Mo, 3. Okt = Feiertag).
Вопросы владельцу: (1) учителя — свои курсы + вся класс, «Frei» только админ? (2) Editor-Codes с правом — да/нет? (3) менять/удалять — автор и админ? (4) прошедшие удалять через 30 дней?
**Дальше:** после «ок» — `/orb-spec` (бэкенд: таблица `events`, `/api/events`, admin, право), затем бэкенд в `/opt/orbook-be` и `/orb-build`.

## Часть 18 «Termine» — готово (2026-11-06)
Решения владельца: учителя и Editor-Codes (право «Termine eintragen», включает админ) вносят все виды, включая «Frei»; менять/удалять — автор и админ; срок хранения — настройка админа (`appointments.keepDays`).
Бэкенд выложен (миграция 0008 на проде; демо было на 0006 — домигрировано до 0008 вручную). Spec: `docs/specs/18-termine/spec.md`.
Фронт: вкладка `/testen?liste=termine` (`pages/Appointments.jsx`, `components/appointments/`), окно `?sheet=termin&id=` (.ics на устройстве), форма `/testen/termine/neu` и `…/:id/bearbeiten` (`AppointmentForm`, общий `useExamSave`), полоска под днями недели (`DayAppointmentPills` в `WeekGrid` и `GridDayHeader`), строка в карточке недели, плашка «Termin: …» в дне/панели дня (`AppointmentBanner`), админ: `/admin/termine` (+ «Termin eintragen» от школы и правка любого), право в кодах, карточка «Termine» в Einstellungen. Логика — `shared/utils/appointments.js` (11 тестов), список — `appointmentsStore` (офлайн-кеш), курсовые термины — только при выбранном предмете (`mySubjects`).
Скриншоты: `/root/work/orbook-compare/18-termine/shots/`, скрипт `_tools/termine.mjs`.
На демо запись руками не проверяли: нужен Lehrer-Code или Editor-Code с правом (создаёт админ).

**Дальше (`/orb-auto`):** часть 19 «Muster-Stundenplan» — экранов нет, сначала `/orb-design` и «ок дизайн».

## Часть 19 «Muster-Stundenplan» — ждёт «ок дизайн» (2026-11-07)
Макеты: `design/neu/19-muster/` (`gen.py` рисует SVG поверх оригиналов Soft, `build.py` собирает `index.html`), артефакт https://claude.ai/artifact/GfeBJpXgwd96118856UhSr.
Экраны: неделя целиком из Muster (штриховка, метка MUSTER), текущая неделя с пятницей из Muster, день и окно урока из Muster («Test oder Klausur eintragen»), форма Test с датой и уроком, «Plan ist da · Einträge prüfen» (окно сверки: перенести заметку / «Test ändern»), тост, «Woche wählen» с Muster-неделями, «Noch kein Muster»; ПК — неделя + день, окно урока, окно сверки, выбор недели.
Что есть на бэкенде сейчас: `expectedLessons` только при `not_published` и не дальше 14 дней (`plan/view.py`, `EXPECTED_HORIZON_DAYS`), A/B учитывается через `week_number`.
Вопросы владельцу: (1) как далеко вперёд (предложено: до конца учебного года); (2) кто вносит Tests в Muster-уроки (предложено: как сейчас); (3) при изменении плана Test сам не переносится, заметки ученик переносит сам; (4) Muster только автоматически, без ручной правки админом?
**Дальше:** после «ок» — `/orb-spec` (бэкенд: горизонт Muster, флаг/поле для Muster-дней), бэкенд в `/opt/orbook-be` по плану с «ок», затем `/orb-build`.
Дизайн v2 (07.11): буква недели A/B везде + карточка админа «Muster zeigen bis». Владелец: «ок дизайн», бэкенд разрешён.

## Часть 19 «Muster-Stundenplan» — готово (2026-11-07)
Spec: `docs/specs/19-muster/spec.md`. Бэкенд выложен (`expectedLessons` до `muster.until`, `meta.musterUntil`; без миграции).
Фронт: `shared/utils/muster.js` (12 тестов: `withMuster`, `abForMonday`, `planChecks` …); `useWeek` отдаёт Muster-дни как обычные с `muster: true`; штриховка — `hatch-muster`/`hatch-line` в `index.css` (токены `--color-muster-*`); метки `components/muster/` (MusterBadge, WeekLetter, MusterNote, NoMusterState), сверка «Einträge prüfen» (`PlanCheckBanner`, шторка `?sheet=pruefen`, `userStore.moveNote`/`dismissCheck`); окно урока с «Test oder Klausur eintragen» → `/testen/neu?datum&stunde&fach&muster=1` (`examPreset`); буква A/B в шапках недели/дня, в «Woche wählen», карточка «Muster-Stundenplan» в админке.
Скриншоты: `/root/work/orbook-compare/19-muster/shots/`, скрипт `_tools/muster.mjs`.

**Дальше (`/orb-auto`):** часть 16 «Einladen: ссылка + QR» — экранов нет, сначала `/orb-design` и «ок дизайн».

## Часть 19b «Muster-Editor» — новая, следующая (2026-11-07)
Пожелание владельца после части 19: «в админ-панели ставить недели по умолчанию, сейчас может быть багано; редактор недель A и B, чтобы можно было и так и так».
Понимание: у Muster два источника — **automatisch** (из последних недель, как сейчас) и **vom Admin** (своя сетка для недели A и для недели B; «Aus dem Plan übernehmen» заполняет из автоматики, дальше правка клетки: предмет/курс из `/api/courses`, учитель, кабинет). Плюс ручная поправка «Diese Woche ist A / B» (сдвиг цикла), если `week_number` ошибается — буква и выбор Muster везде следуют ей.
Предложения для дизайна (показать владельцу): переключатель источника в карточке «Muster-Stundenplan» → страница `/admin/muster` с вкладками «Woche A / Woche B», сетка как неделя, клетка → шторка/окно правки; ПК — сетка + панель справа.
**Дальше (новый чат, `/orb-auto`):** 19b — сначала `/orb-design` (новые экраны) и «ок дизайн», потом план бэкенда; затем 16 «Einladen».

## Часть 19b «Muster-Editor» — ждёт «ок дизайн» (2026-11-07)
Макеты: `design/neu/19b-muster-editor/` (`gen.py` рисует SVG на помощниках частей 14/19, `build.py` собирает `index.html`), артефакт https://claude.ai/artifact/HLj5RCmDhDciv64gpoZCnV.
Экраны: Einstellungen (строки «Muster bearbeiten» и «Wochen A und B»), страница `/admin/muster` — «Woher kommt das Muster?» (Automatisch / Vom Admin), строка «Diese Woche · KW 45 · WOCHE A», вкладки Woche A/B, сетка Mo–Fr × 1–6; Automatisch — только просмотр (штриховка); Vom Admin — сетка в цветах предметов, точка = своя правка, «+» = пустой урок; шторка «Stunde bearbeiten» (Kurs-чипы, Lehrer, Raum, Parallelkurs, Leeren/Übernehmen, «Automatisch war …»); шторка «Woche A oder B?» (Laut Plan / A und B tauschen / Keine Wochen A und B + полоска KW); диалог «Aus dem Plan übernehmen?»; тост, ошибка, пусто, загрузка. ПК: пункт меню «Muster», две карточки сверху, сетка + панель справа, выпадающее меню A/B, диалог, тост.
Вопросы владельцу: (1) при возврате на «Automatisch» своя сетка сохраняется, но не показывается — ок? (2) нужен ли вариант «Keine Wochen A und B»? (3) правит только админ.
**Дальше:** после «ок» — `/orb-spec` (бэкенд: настройки `muster.source`, `muster.abShift`/`abMode`, хранение сетки A/B, `GET/PUT /api/admin/muster`, учёт в `expected_lessons`/`week_number`), план бэкенда → «ок» владельца → бэкенд в `/opt/orbook-be`, затем `/orb-build`. Потом часть 16 «Einladen».
Ответы владельца (07.11): своя сетка при «Automatisch» сохраняется; «Keine Wochen A und B» — оставить вариантом; правит только админ. Дизайн ок.
Spec: `docs/specs/19b-muster-editor/spec.md` (там же план бэкенда). **Ждём «ок» плана бэкенда**, затем бэкенд в `/opt/orbook-be` и `/orb-build`.

## Часть 19b «Muster-Editor» — готово (2026-11-07)
Spec: `docs/specs/19b-muster-editor/spec.md`. Бэкенд выложен (`muster.source`, `muster.abMode`, `GET/PUT /api/admin/muster`, поправка `week`/`abWeek`; без миграции).
Фронт: `/admin/muster` (`pages/AdminMuster.jsx`, `components/admin/muster/`), черновик `useMusterDraft`, логика `shared/utils/musterEditor.js` (13 тестов); пункт меню ПК «Muster», строка в Übersicht → Schnell, в Einstellungen строки «Muster bearbeiten» и «Wochen A und B». Уход с несохранёнными правками — «Änderungen verwerfen?» (`useBlocker`).
Скриншоты: `/root/work/orbook-compare/19b-muster-editor/shots/`, скрипт `_tools/mustered.mjs`.
На демо руками не сохраняли: нужен пароль админа (есть только у владельца).

**Дальше (`/orb-auto`):** часть 16 «Einladen: ссылка + QR» — экранов нет, сначала `/orb-design` и «ок дизайн».

## Улучшение «Kurs wählen» (19c) — ждёт «ок дизайн» (2026-11-07)
Пожелание владельца: стена чипов курсов/предметов неудобна (30+ пилюль, дубли без различий) — «списком или посовременней, и так везде».
Макеты: `design/neu/19c-kurs-auswahl/` (`gen.py` на помощниках 19b, `build.py`), артефакт https://claude.ai/artifact/TREHpKPdQCBQSC88rMjwAU.
Предложение: одно поле «Kurs»/«Fach» (кружок предмета, название, «учитель · Kurs 145») → список с поиском (телефон — шторка, ПК — выпадающее окно как Soft 51 ⌘K), сверху «Vorschlag»/«Deine Fächer». Без новой библиотеки (Sheet + Radix Popover). Заменить в формах: Muster, Klausur, Hausaufgabe, Material, Termin, Notiz.
Вопрос владельцу: фильтры над списками (3–6 чипов) оставить чипами?
**Дальше:** после «ок» — общий компонент `ui/SubjectPicker` + утилита поиска с тестами, замена во всех формах; затем часть 16 «Einladen».
Владелец: «ок дизайн, везде так делай» (07.11). Сделано: `ui/ListPicker` + `ui/PickerList`, `shared/utils/picker.js` (9 тестов); заменены чипы в Muster, Klausur, Hausaufgabe, Material, Termin, Notiz и в фильтре Klausuren (несколько). Полоска чипов над списками оставлена. `SubjectToggle` удалён. Spec: `docs/specs/19c-kurs-auswahl/spec.md`. Скриншоты: `/root/work/orbook-compare/19b-muster-editor/shots/*-1[0-2]-*`.
**Дальше (`/orb-auto`, новый чат):** часть 16 «Einladen» — сначала `/orb-design`.

## Релиз v0.6.0 — тег готов (2026-11-07)
Тег `v0.6.0` и текст `docs/releases/v0.6.0.md` на GitHub; владелец опубликовал Release 07.11. Проверено: прод отдаёт новую сборку (строки Muster-Editor и выбора курса есть), `/api/health` 200.

## Часть 14c «Zugangscodes» — новая, следующая (2026-11-07)
Пожелание владельца: «пароли для входа в сервис — почти такая же панель с многими кодами, как Editor-Codes».
Понимание: вместо (или вместе с) одного пароля класса — список кодов входа: у каждого название (без имён учеников), срок, вкл/выкл, удалить, «zuletzt benutzt», число устройств; новый код виден один раз (как Editor-Code). Выключенный/удалённый код сразу выкидывает устройства, вошедшие с ним.
Вопросы владельцу (до дизайна): (1) коды по одному на ученика или по группам («Klasse», «Eltern», «Vertretung»)? (2) старый общий пароль оставить рядом или заменить кодами? (3) лимит устройств на код нужен? (4) срок по умолчанию — Schuljahresende?
**Дальше (новый чат, `/orb-auto`):** ответы владельца → `/orb-design` 14c → «ок» → план бэкенда (миграция, вход по коду) → «ок» → бэкенд, фронт. Потом 16 «Einladen».
Ответы владельца по 14c (07.11):
1. Коды — и личные (один на ученика), и групповые («Klasse», «Eltern», «Vertretung»): админ сам выбирает при создании.
2. Старый общий пароль — «как хочешь». Решение: не ломать вошедшие устройства — общий пароль остаётся одной строкой «Klassenpasswort» в том же списке, его можно выключить; новые входы — по кодам.
3. Лимит устройств задаётся при создании кода, можно «unbegrenzt».
4. Срок по умолчанию — Schuljahresende.
Названия кодов — без настоящих имён (подсказка «keine echten Namen», как у Editor-Codes).
**Дальше (новый чат, `/orb-auto`):** `/orb-design` 14c → «ок дизайн» → план бэкенда (миграция `access_codes`, вход по коду, лимит устройств, выход при выключении) → «ок» → бэкенд, фронт.

## Часть 14c «Zugangscodes» — ждёт «ок дизайн» (2026-11-07)
Макеты: `design/neu/14c-zugangscodes/` (`gen.py` на помощниках 14/14b, `build.py` → `index.html`), артефакт https://claude.ai/artifact/XAGNk7XMFFWjz4Wtr3pDFM.
Экраны: список кодов (карточки как Editor-Codes: Gruppe/Persönlich, ••••-M4, «9 von 30 Geräten», срок, zuletzt, переключатель; строка «Klassenpasswort · ALT»), пусто, загрузка; «Neuer Code» (Bezeichnung, Person/Gruppe, Geräte 1/2/30/Unbegrenzt, Gültig bis 30 Tage/Halbjahr/Schuljahresende) и показ кода `ORB-Z-…` один раз; шторка/меню действий (Umbenennen, Geräte-Limit, Gültigkeit, Geräte abmelden, Neu erzeugen, Sperren, Löschen), «Sperren?» и тост; вход «Zugangscode oder Klassenpasswort», ошибка «Limit voll», «Du wurdest abgemeldet»; Einstellungen → карточка «Zugang». ПК: пункт меню «Zugangscodes» вместо «Passwörter», таблица, окно, меню, диалог.
**Дальше:** после «ок» — `/orb-spec` (план бэкенда: таблица `access_codes`, миграция, вход по коду с лимитом устройств, выход устройств при выключении/удалении/сроке, `/api/admin/access-codes`) → «ок» владельца на план → бэкенд в `/opt/orbook-be` → `/orb-build`. Потом 16 «Einladen».
Владелец 07.11: «ок дизайн», но буква после ORB — не Z. Решение: `ORB-A-…` (A = Anmeldung; рядом E = Editor, L = Lehrer). Макеты перерисованы.
Spec: `docs/specs/14c-zugangscodes/spec.md` (там план бэкенда: таблица `access_codes` + `auth_sessions.access_code_id`, вход по коду в `/api/auth/login`, `code_full`/`password_disabled`, `/api/admin/access-codes`). **Ждём «ок» плана бэкенда**, затем бэкенд в `/opt/orbook-be`, потом `/orb-build`.

## Часть 14c «Zugangscodes» — готово (2026-11-07)
Бэкенд (`/opt/orbook-be`, коммит ecaac70): таблица `access_codes`, `sessions.access_code_id`, вход кодом `ORB-A-…` в `/api/auth/login` (`code_full`, `password_disabled`), `/api/admin/access-codes` (+ `class-password` вкл/выкл), смена пароля класса выкидывает только вошедших по паролю. Выложен `update.sh` (прод 0008 → 0009) + демо вручную (`orbook-demo migrate`).
Фронт: страница `/admin/zugang` (меню ПК «Zugangscodes» вместо «Passwörter»; телефон — Einstellungen → «Zugang», Übersicht → Schnell), вход «Zugangscode oder Klassenpasswort», плашка «Du wurdest abgemeldet».
На демо руками не проверено сохранение: нужен пароль админа (только у владельца). Проверено на подменённом API (скриншоты `orbook-compare/14c-zugangscodes/shots/`).
**Дальше (`/orb-auto`):** часть 16 «Einladen: ссылка + QR» — сначала `/orb-design`.

## Релиз v0.7.0 — тег готов (2026-11-07)
Тег `v0.7.0` и текст `docs/releases/v0.7.0.md` на GitHub. Ждём, когда владелец опубликует Release (gh на сервере не авторизован). Бэкенд на проде уже со схемой 0009.

## Новые пункты плана от владельца (2026-11-07)
- **20a баг «Wahl»:** на старте выбрал только NT → в «Meine Kurse» включены все. Код: `pages/CourseStart.jsx` (`withNumbers`) против `pages/MyCourses.jsx` (`switchCourses`, пустой `picked` = все), `shared/utils/courses.js`. Начать с падающего теста.
- **20b Sport Mädchen / Jungen:** различать в названии (как SpMä / SpJu) — сначала посмотреть, что в плане и в `/api/courses` (группа курса).
- **21 Hausaufgaben/Tests ↔ Materialien + описание:** новые экраны → `/orb-design`, бэкенд нужен.
Порядок (предложение): 20a и 20b — сразу (маленькие), потом 16 «Einladen», потом 21.

## Часть 16 «Einladen: ссылка + QR» — ждёт «ок дизайн» (2026-11-07)
Макеты: `design/neu/16-einladen/` (`gen.py` на помощниках 14/14b/14c, `build.py` → `index.html`), артефакт https://claude.ai/artifact/PLW1E3weRWKFopnAKVMWmN.
Экраны: админ — Zugangscodes → ⋮ у группового кода → «Einladen» (QR, ссылка `orbook.orbitium.net/i/K7MQ-2XPA`, Kopieren/WhatsApp, «QR groß zeigen», «Link aktiv», «Mitschüler dürfen teilen», «Neuen Link erzeugen» с вопросом), тост, загрузка, «Link ist aus»; ученик — Mehr → «Klasse einladen» (ПК: Einstellungen, карточка + пункт меню), «Einladen ist aus»; кто открыл ссылку — «Beitreten», загрузка, «Link gilt nicht mehr» (поле кода), «Kein Platz mehr».
Решения (ждут подтверждения): ссылка = отдельный токен у группового Zugangscode (не сам код, можно показывать снова); вход по ссылке = устройство этого кода; новый токен гасит старую ссылку, никого не выкидывая; QR тёмный на белом в обеих темах (`--color-qr-bg/ink`); во фронте нужна маленькая QR-библиотека.
**Дальше:** «ок» → `/orb-spec` (план бэкенда: `invite_links`, `GET /api/invite/{token}`, вход по ссылке, `/api/admin/access-codes/{id}/invite`) → «ок» плана → бэкенд → `/orb-build`.
Владелец 07.11: «ок дизайн», QR — «красивее»: точки, фиолетовые «глаза», логотип ORBook в центре (уровень Q; проверено декодером OpenCV). Артефакт обновлён.
Spec: `docs/specs/16-einladen/spec.md` (план бэкенда: колонки `invite_*` в `access_codes`, `GET /api/public/invite/{token}`, `POST /api/auth/join`, `GET /api/invite`, `POST/PATCH /api/admin/access-codes/{id}/invite`). **Ждём «ок» плана бэкенда**, затем бэкенд в `/opt/orbook-be`, потом `/orb-build`.

## Часть 16 «Einladen» — готово (2026-11-07)
Владелец: «ок, делай всё». Бэкенд `/opt/orbook-be` 675ccfa (миграция 0010, `/api/public/invite/{token}`, `/api/auth/join`, `/api/invite`, `/api/admin/access-codes/{id}/invite`) — выложен на прод и демо, 888 тестов. Фронт: QR в стиле ORBook (`uqr`, своя отрисовка), «Einladen» у групповых кодов в админке, «Klasse einladen» для учеников, страница `/i/:token`. Проверено на подменённом API (скриншоты `orbook-compare/16-einladen/shots/`).
**Открыто:** владельцу — отсканировать QR настоящим телефоном на демо (создать ссылку может только админ: пароль у владельца).
**Дальше (`/orb-auto`):** 20a баг «Wahl», 20b Sport Mädchen/Jungen, потом 21.

## Релиз v0.8.0 — тег готов (2026-11-07)
Владелец проверил на демо: «на прод, работает». Тег `v0.8.0` и текст `docs/releases/v0.8.0.md` на GitHub. Ждём, когда владелец опубликует Release (gh на сервере не авторизован). Бэкенд на проде уже со схемой 0010.

## v0.8.1 — Einladen и для личных кодов (2026-11-07)
Владелец: «да, тоже… сразу на прод». Бэкенд 26b0972 (ссылка у любого кода, `shared` только у групп) выложен `update.sh` на прод + перезапуск демо; фронт: пункт «Einladen» у всех кодов, у личного нет «Mitschüler dürfen teilen». Тег `v0.8.1`, текст `docs/releases/v0.8.1.md` — ждём публикации Release владельцем.

## v0.8.2 — Zugangscode wieder anzeigen (2026-11-07)
Владелец: «сделай, сразу на прод». Бэкенд (схема 0011: `access_codes.code_secret`, Fernet `access-code-view`; `GET /api/admin/access-codes/{id}/code`, `409 code_hidden` для старых) — выложен на прод и демо, 891 тест. Фронт: пункт «Code anzeigen», `ShowCodeSheet`. Тег `v0.8.2` — ждём публикации Release.


## v0.8.3 — загрузка недели и значок вкладки (2026-11-08)

Владелец разрешил временную загрузку всей недели, постановку постоянного исправления в план и выкладку на прод.
- Бэкенд: полные циклы и ручное обновление запрашивают пять ближайших учебных дней; быстрые проверки двух дней и интервалы сохранены. Постоянная работа с выбранной календарной неделей и свежестью по дням добавлена в план как 20c.
- `public/favicon.svg`: знак Orbit из существующего логотипа ORBook, цвета светлой/тёмной темы. В `index.html` новая версия URL и `sizes="any"`, чтобы браузер обновил старый значок Vite.
- Проверки: `npm run lint`, `npm test` (384 passed, 1 skipped), `npm run build`; SVG проверен Chromium в двух цветовых схемах, размеры 16/32/64 px. Результат выкладки будет записан после проверки сайта.

Выложено на прод 08.11.2026 21:34: тег `v0.8.3`, коммит `6dea88f`, штатный `scripts/deploy-frontend.sh dist --site orbook`, версия `20261108-213440` (предыдущая `20261107-133434` сохранена для отката). GitHub Release не опубликован: gh на сервере не авторизован; по явному разрешению владельца применена ручная атомарная выкладка. Метки авто-синхронизации прода не переписывались; повторный успешный запуск `orbook-fe-sync` сохранил новую сборку. Следующий новый GitHub Release снова обновит прод штатно.
Проверки продакшена в Chromium: главная и favicon — HTTP 200, SVG совпадает с исходником, JavaScript без ошибок в светлой и тёмной теме. Бэкенд — 893 теста, health prod/demo ok, все 09–13.11 теперь `ok`. При диагностике от root был пересоздан `/opt/orbook/.git/index`: владелец возвращён `orbook-fe`, автовыкладка проверена (Result=success). Артефакты и точные данные отката: `/root/work/orbook-compare/deployments/20261108-week-refresh/`.


## Roth — учитель английского (2026-11-09)

Владелец: добавить Roth, сразу на прод, способ реализации записать и перепроверить позже. В бэкенде `teachers.py::subjects_by_teacher` дополнительно читаются обычные совместные уроки своего класса: школьное `Göbe Roth` + `En` теперь добавляет отдельного Roth с английским. Имя в коде не зашито; курс и учитель Göbe сохраняются, код входа Roth не создавался. Фронтенд берёт обновлённый список из `/api/admin/teachers`, правка интерфейса не нужна.
В план добавлен **20d**: перепроверить написание и предмет, разделение двух учителей, будущие публикации, права только на свой предмет и актуальность старых совместных уроков. Результат проверок и выкладки будет записан после завершения.

Выложено на прод 09.11.2026 12:19: бэкенд `9095061`, `make lint test` — 903 passed. Бэкап `orbook-before-update-20261109-121907.db`, тег отката `pre-update-20261109-121906`; миграций и пересборки фронта нет. В текущем API-представлении продовой базы Roth доступен как отдельный учитель с `subjects: ["En"]`; Göbe и английский курс сохранены, код Roth не выдавался. Health prod/demo ok. **20d остаётся открытым для повторной проверки** способа разбора совместного урока.

## План по идеям владельца (2026-11-12)
Идеи 08–11.11.2026 и скрины VpMobil — `docs/ideas/2026-11-11/`. Владелец согласовал порядок частей: 22 → 22b → 23 → 24 → 25 → 26 → 17 → 27 → 28 → 29 → 30 → 31 (таблица в `docs/specs/README.md`; 20a/20b входят в 22, 21 — в 24, 20c — в 26).
**Дальше:** `/orb 22` (модель Sonnet).
