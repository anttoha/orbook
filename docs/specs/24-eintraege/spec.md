# 24 · Einträge zur Stunde (Hausaufgabe и Test на урок)

**Статус:** дизайн ок 2026-11-12; план бэкенда ок 2026-11-12; бэкенд и фронт на демо 2026-11-12; бэкенд на прод — ждёт владельца
**Источники:** `design/neu/24-eintraege/` (артефакт https://claude.ai/artifact/DSHTkfwYtzetzmLpWw1gwG), идеи 10.11 и 11.11 (`docs/ideas/2026-11-11/ideas.md`), часть 21 из `docs/specs/README.md`, `/opt/orbook-be/docs/API.md` (Klausuren, Hausaufgaben, Materialien), код `src/components/lesson/LessonContextMenu.jsx`, `src/components/sheets/LessonSheet.jsx`, `/opt/orbook-be/src/orbook/{db.py,appsettings.py,exams,homework,plan/store.py}`.

## Зачем
Домашку и тест удобно записывать прямо на урок, который нажал, — без выбора даты и предмета. Вместо непонятного «Klausur» — виды, как в школе (Klassenarbeit, Leistungskontrolle, Test …), список ведёт админ. Если урок выпал, тест сам переезжает на следующий урок предмета, и видно, откуда. К записи можно добавить «что учить / что взять» и ссылки из Materialien (часть 21).

## Решения владельца (12.11.2026, «ок дизайн» = согласие с предложениями)
- Вкладка внизу и на ПК: **«Tests»** вместо «Klausuren».
- Виды по умолчанию: Klassenarbeit (KA), Leistungskontrolle (LK), Test (T), Abgabe (AB). Старые записи «Klausur» → «Klassenarbeit».
- Перенос при «fällt aus»: тесты **и** домашки, привязанные к уроку; два переключателя у админа, по умолчанию включены.
- Без Editor-Code пункты меню видны с замком и ведут на ввод кода.

## Экраны
| Экран | Файлы дизайна | Что на нём |
|---|---|---|
| Меню урока | `handy-01-menue`, `handy-02-menue-ohne-code`, `pc-01-menue` | + «Hausaufgabe geben» (H), «Test eintragen» (T) |
| Stunde · Details | `handy-03-stunde` | блок «Für diese Stunde», кнопки «+ Hausaufgabe» / «+ Test» |
| Test eintragen | `handy-04-test-eintragen`, `handy-05-material-anhaengen`, `pc-02-test-eintragen` | карточка «Für die Stunde», Art из списка, Thema, «Was lernen, was mitbringen», Materialien |
| Hausaufgabe | `handy-06-hausaufgabe` | «Aufgegeben in», «Bis wann?» (nächste / übernächste Stunde / Datum), Aufgabe, Materialien |
| Tag · Liste | `handy-07-tag` | строки «Hausaufgabe: …», «Leistungskontrolle: …», у выпавшего урока «Test … → Fr …» |
| Tests | `handy-08-tests` | вкладка «Tests», фильтр по видам, VERSCHOBEN + «von …» |
| Test · Details | `handy-09-test-details` | VERSCHOBEN, подсказка откуда, описание, материалы |
| Admin · Arten von Tests | `handy-10…12`, `pc-03-admin-arten` | список видов (имя, Kürzel, порядок), правка, удаление с заменой, 2 переключателя |

## Что куда нажимать
- Долгое нажатие / правый клик по уроку → «Test eintragen» → `/testen/neu?datum=&stunde=&fach=` (как уже делает Muster-урок), форма с заполненной Stunde.
- «Hausaufgabe geben» → `/hausaufgaben/neu?datum=&stunde=&fach=`; по умолчанию срок «Nächste <Fach>-Stunde» (считается по плану недели, иначе Muster; не нашли — «Anderes Datum»).
- Без права (`canCreateExam` / `canHomework` = нет) → пункт с замком → `/mehr/editor-code`.
- «Material anhängen» → шторка со списком Materialien предмета (галочки) + «Neuen Link teilen» (форма части 15, после сохранения ссылка сразу отмечена).
- Admin → Einstellungen → «Arten von Tests»: ✎ — шторка «Art bearbeiten»; «Art hinzufügen»; ⋮⋮ — порядок; «Löschen» у используемого вида спрашивает замену.

## Данные
| На экране | Откуда | Может быть пустым? |
|---|---|---|
| Виды и Kürzel | `GET /api/meta` → `examTypes[]` (сейчас строки) → **новое** `examTypeList[] {name, short}` | старый сервер — только строки → Kürzel = первые буквы |
| Описание | Exam/Homework → **новое** `details` (≤ 300) | да → блок не показываем |
| Материалы записи | **новое** `materials[] {id, title, url, provider, kind}` | да; ссылка удалена → просто исчезает |
| Урок домашки | Homework → **новое** `lesson` (1…12) | да → «bis Fr» без урока |
| Перенос | Exam/Homework → **новое** `movedFrom {date, lesson}` | обычно `null` |

## Бэкенд (в `/opt/orbook-be`, план — «ок» владельца 12.11.2026; коммит 1dc7094)
1. **Миграция 0012** (с бэкапом): `exams.details`, `exams.moved_from_date`, `exams.moved_from_lesson`; `homework.lesson`, `homework.moved_from_*`; таблицы-связки `exam_materials`, `homework_materials` (`ON DELETE CASCADE` — удалили ссылку, она пропадает из записи). Данные: `type = 'Klausur'` → `'Klassenarbeit'`.
2. **Настройка видов:** `exams.types` → список `{name, short}` (старое значение-строки читается и переводится, по умолчанию KA/LK/T/AB); `exams.autoMove`, `homework.autoMove` (по умолчанию `true`). Админ: переименование вида меняет его у записей; удаление занятого вида — только с `replaceWith`. `meta.examTypes` остаётся списком имён (совместимость), рядом `meta.examTypeList`.
3. **API записей:** `POST/PATCH /api/exams` и `/api/homework` принимают `details` (≤ 300, многострочно, без e-mail/ссылок/телефонов — те же проверки, что у `text`), `materialIds` (≤ 5, только существующие; ссылка своего предмета не обязательна), у Homework — `lesson`. Ответ отдаёт `details`, `materials`, `movedFrom`. История: ключи `details`, `materials`, `lesson`, действие `moved` (by `system`).
4. **Авто-перенос** (`exams/automove.py`, вызывается после сохранения дня в `plan/store.save_parsed_day`, когда содержимое изменилось): запись с уроком, чей урок в этот день `cancelled` (и нет того же предмета в этом уроке без отмены) → следующий урок того же предмета (по курсу, иначе по коду): сначала `moved.to` школы, потом опубликованные дни, потом Muster, не дальше 21 дня. Нашли — меняем `date/lesson` (`due/lesson`), пишем `movedFrom` (только при первом переносе), `version + 1`, история `moved`, протокол «Test verschoben». Не нашли — не трогаем. Отмену школа сняла, а запись после переноса не меняли → возвращаем назад.
5. Тесты (`make lint test`), `docs/API.md`, `docs/FRONTEND.md`, `docs/openapi.json`, выкладка `scripts/update.sh` на демо и прод-бэкенд (поля новые, старый фронт их не замечает).

## Фронт
- `LessonContextMenu` + PC-клавиши H/T; `LessonSheet` → «Für diese Stunde» и две кнопки.
- `ExamForm`: Art — чипы из `examTypeList`, карточка «Für die Stunde», поле описания, `AttachMaterials` (+ шторка). `HomeworkForm`: «Aufgegeben in» + «Bis wann?» (`shared/utils/nextLesson.js` + тест), урок, описание = текст, материалы.
- Строки в Tag/Woche/Tests/Details: имя вида, Kürzel в клетке недели, VERSCHOBEN + «von …» (`shared/utils/moved.js` + тест на `null`).
- Переименование «Klausuren» → «Tests» во всех подписях (навигация, заголовки, ПК-меню, «Bald»); пути `/testen` уже такие.
- Admin: `AdminExamTypes` (страница/секция в Einstellungen) + шторка + диалог удаления.
- Changelog-запись (22b) и Datenschutz (23: новые поля описания и связи с материалами).

## Состояния
- Загрузка формы: как сейчас (skeleton формы). Список материалов в шторке — 3 строки-скелета.
- Офлайн: пункты меню работают, сохранение — ошибка «Keine Verbindung», введённое не теряется.
- Ошибка 409/428 — как у Klausuren (`If-Match`), 422 по `details` — текст под полем.
- Пусто: у предмета нет материалов → в шторке только «Neuen Link teilen» и подсказка.
- Особые случаи: урок без предмета (`subject: null`) — пунктов нет; урок из Muster — можно; следующий урок не найден — «Anderes Datum».

## Чего здесь НЕТ
- Уведомлений о переносе (часть 17), экрана «что сделано» (часть 25), переноса без урока (запись «на день»).

## Решения при сборке
- `exams.types` остаётся списком имён (старый фронт на проде читает его), Kürzel — отдельно в `exams.shorts`; наружу — `meta.examTypeList`.
- У Hausaufgabe нет отдельного `details`: описание — это и есть «Aufgabe» (`text`), как в макете handy-06.
- Авто-перенос запускается поллером после того, как план дня сохранён (отдельный commit: ошибка переноса не мешает плану).
- «Bis wann?» считает фронт по загруженным неделям (план, иначе Muster); неделю урока и следующую подгружает сам.

## Отличия от дизайна
- ПК «Test eintragen» (pc-02): форма — страница, как остальные формы, а не окно поверх недели.
- Перетаскивание в «Arten von Tests» — за «⋮⋮» (мышь и палец), отдельного режима сортировки нет.

## Слова
- **Art / вид** — Klassenarbeit, Leistungskontrolle, Test …; список задаёт админ.
- **Kürzel** — 1–4 буквы вида для клетки недели (KA, LK).
- **Авто-перенос** — сервер сам двигает запись на следующий урок предмета, если урок «fällt aus».
- **movedFrom** — откуда запись переехала (первое место), чтобы показать «verschoben von …».

## Открытые вопросы
- [x] «ок» плана бэкенда — владелец, 12.11.2026.
- [ ] Выложить бэкенд на прод (`/opt/orbook-be/scripts/update.sh`) — владелец (автоматический фильтр не дал Claude запустить выкладку на прод).
