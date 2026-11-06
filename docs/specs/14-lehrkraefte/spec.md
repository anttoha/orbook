# 14 · Lehrkräfte und Hausaufgaben

**Статус:** в работе (дизайн ок 2026-11-06, бэкенд выложен 2026-11-06)
**Источники:** `design/neu/14-lehrkraefte/` (handy-01…15, pc-01…05), `/opt/orbook-be/docs/API.md` («Lehrkraft», «Klausuren», «Hausaufgaben», «Admin»), `/opt/orbook-be/docs/FRONTEND.md` (часть 14), решения владельца в `docs/PROGRESS.md`.

## Зачем
Учитель входит своим кодом (без пароля класса), видит план класса и сам записывает Klausuren/Tests и новые **Hausaufgaben**. Класс видит, кто записал («von Mü»), и кто может менять запись. Админ раздаёт Lehrer-Codes и решает, когда старые Hausaufgaben удаляются.

## Экраны
| Экран | Файлы дизайна | Что на нём |
|---|---|---|
| Zugang + ссылка «Lehrkraft? Mit Lehrer-Code anmelden» | handy-01, pc-01 | под кнопкой «Öffnen» |
| Lehrkraft · Code | handy-02, 03, pc-01 | поле `ORB-L-XXXX-XX`, «Anmelden», ошибка под полем, «Sie» |
| Hausaufgaben (список) | handy-04, 09 (пусто), pc-02 | вкладка Klausuren, переключатель «Klausuren · N / Hausaufgaben · N», чипы предметов, группы «Bis morgen / Diese Woche / Nächste Woche / Später» |
| Hausaufgabe (окно) | handy-05, handy-15 (Verlauf), pc-02 | текст, «Eingetragen von Mü · Lehrkraft», «Ändern: …», «Verlauf» |
| Neue Hausaufgabe / Neue Klausur учителя | handy-06, handy-14, pc-03 | «Lehrkraft · Mü», «Abgabe bis» + «Nächste Stunde · Do», «In 1 Woche», текст до 300, «Schüler dürfen ändern» |
| Tag: «Hausaufgaben · fällig heute» | handy-07 | под уроками, над «Meine Notizen» |
| Klausur с автором | handy-08 | «Eingetragen von Mü · Lehrkraft / Ändern: …» |
| Admin · Lehrer-Codes | handy-10, pc-04 | телефон — переключатель «Editor-Codes · Lehrer-Codes» на странице Codes; ПК — пункт меню |
| Admin · Neuer Lehrer-Code | handy-11 | чипы Kürzel из плана, две галочки, «Gültig bis», код один раз |
| Admin · Neuer Editor-Code | handy-13, pc-05 | новые галочки «Hausaufgaben eintragen», «Lehrer-Einträge ändern» |
| Admin · Einstellungen · Hausaufgaben | handy-12 | «Automatisch löschen nach …», «Hausaufgaben jetzt aufräumen» |

## Что куда нажимать
- Zugang → «Mit Lehrer-Code anmelden» → `/lehrkraft` → код → «Anmelden» → Woche (как ученик). Выход — «Abmelden» в Mehr (тот же `logout`).
- Klausuren → переключатель «Hausaufgaben» → список (`/testen?liste=hausaufgaben`). Строка → окно (`?sheet=hausaufgabe&id=4`). «+» → `/hausaufgaben/neu` (у кого есть право) или `/editor-code?weiter=hausaufgabe` (у ученика без кода).
- Окно Hausaufgabe → «Bearbeiten» (если `canEdit`) → `/hausaufgaben/4/bearbeiten`; там «Löschen» (если `canDelete`) с «Rückgängig».
- Tag → строка в «Hausaufgaben · fällig heute» → окно Hausaufgabe.
- Admin → Codes → «Lehrer-Codes» (телефон) / пункт «Lehrer-Codes» (ПК, `/admin/lehrer`) → «+» → Kürzel → «Code erstellen» → код показан один раз → «Fertig».

## Данные
| На экране | Откуда | Может быть пустым? |
|---|---|---|
| учитель или класс | `GET /api/auth/me` → `role`, `teacher {short, canCreate, canHomework}` | `teacher` — `null` у класса; `role` нет у старого ответа → считаем `class` |
| вход учителя | `POST /api/auth/teacher {code}` | ошибки как у Editor-Code |
| список Hausaufgaben | `GET /api/homework` → `homework[]` (`subject`, `due`, `text`, `daysLeft`, `author`, `canEdit`, `canDelete`, `studentsMayEdit`, `lastChange`, `version`) | `subject.name` → `subjectName`; `author`, `lastChange` — `null` |
| «fällig heute» | тот же список, фильтр `due === день` (сервер отдаёт с сегодня; на прошлые/будущие дни делаем `GET /api/homework?from=D&to=D`) | пусто → блока нет |
| «von Mü» | `author?.short` | `null` → без «von …» |
| «Verlauf» | `GET /api/homework/{id}/history`, `GET /api/exams/{id}/history` → `changes[]` | `short` у ученика `null` → «Schüler mit Freigabe» |
| права формы | `me.teacher` или `me.editor.canHomework`, `canEditTeacher` | |
| Lehrer-Codes | `GET /api/admin/codes` (`kind=teacher`), `GET /api/admin/teachers` | `subjects` пустой |
| срок удаления | `GET/PATCH /api/admin/settings` → `homework.keepDays` (7/14/30/90/0) | |
| «aufräumen» | `POST /api/admin/homework/purge` → `removed` | |

## Состояния
- Загрузка: скелет строк (как у Klausuren).
- Офлайн: сохранённый список (`offlineCache`, ключ `homework`) + плашка «Stand von …».
- Ошибка: `PlanError` с «Erneut versuchen».
- Пусто: «Keine Hausaufgaben · Wenn eine Lehrkraft etwas einträgt, steht es hier — bis zur Abgabe.»
- Особые случаи: учитель после блокировки кода получает `401` → экран входа с «Bitte erneut anmelden.»; `409 conflict` при правке → «Die Hausaufgabe wurde inzwischen geändert» и новые данные; `403 teacher_session` на Editor-Code → у учителя пункта Editor-Code нет вообще.

## Решения (технические, принял сам)
- **Переключатель Klausuren/Hausaufgaben** — в адресе (`?liste=hausaufgaben`), чтобы «назад» и ссылки работали. Чипы предметов — общие с Klausuren (тот же `examFilterStore`).
- **Hausaufgaben в planStore** рядом с `exams` (`homework`, `homeworkState`, `loadHomework`, `homeworkChanged`), так же кешируются.
- **Форма учителя:** Klausur — та же `ExamForm` + переключатель «Schüler dürfen ändern» только при `role=teacher`; Hausaufgabe — новая `HomeworkForm` по тем же правилам (`If-Match`, 409/428).
- **«Ändern: …»** — текст из `author`, `studentsMayEdit`: «Ändern dürfen nur Mü und der Admin.» / «Ändern: Mü, Admin und Schüler mit Freigabe.»; у записи ученика — старая плашка «Nur Fach, Datum…».
- У учителя в Mehr нет «Klausuren eintragen · Editor-Code» и Sync-кода нет изменений; «Klasse verlassen» → «Abmelden».

## Бэкенд
Не нужно — всё выложено 2026-11-06.

## Чего здесь НЕТ
- Push о новых Hausaufgaben (часть 17).
- Hausaufgaben в «Teilen»-тексте недели и в статистике.
- ICS для Hausaufgaben (в API нет).

## Отличия от дизайна
- **«Kalender» в окне Hausaufgabe** — нет: у API нет `.ics` для Hausaufgaben. Остаётся «Teilen» на всю ширину.
- **«Gültig bis · Immer»** у кодов — нет: бессрочных кодов API не даёт (как в части 13): «30 Tage · Schuljahresende · Datum».
- **«30 Tage nach der Abgabe»** (handy-04, 06) и **«Wird am 18. Oktober automatisch gelöscht»** (pc-02) — срок `homework.keepDays` знает только админка, в `/api/meta` его нет. Классу и учителю пишем без числа: «Hausaufgaben verschwinden nach der Abgabe automatisch.»
- **«Nächste Stunde · Do»** — ближайший будущий урок этого предмета из загруженных недель; нет данных — чип не показываем.

## Слова
- **Lehrer-Code** — код учителя `ORB-L-…`, даёт вход без пароля класса.
- **Kürzel** — сокращение учителя из плана школы («Mü»).
- **Schüler dürfen ändern** (`studentsMayEdit`) — учитель разрешил менять свою запись ученикам с правом «Lehrer-Einträge ändern».
- **Verlauf** — история изменений записи без имён учеников.
- **keepDays** — через сколько дней после срока сдачи Hausaufgabe удаляется (0 — в конце учебного года).

## Открытые вопросы
нет
