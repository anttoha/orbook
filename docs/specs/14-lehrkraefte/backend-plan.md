# Часть 14 · план бэкенда (ждёт «ок» владельца)

Делается только в `/opt/orbook-be` по его `CLAUDE.md`: маленькие коммиты, `make lint test`, обновление `docs/API.md`, `docs/FRONTEND.md`, `docs/openapi.json`, выкладка — `scripts/update.sh` (сначала демо, прод — только по слову «на прод»).

Решения владельца (2026-11-06) — см. `docs/PROGRESS.md`, часть 14. Макеты — `design/neu/14-lehrkraefte/`.

## Шаг 1. Коды учителей (миграция 0006)
Не новая таблица, а расширение `editor_codes` — коды учителей живут так же (хеш, срок, блокировка, «Code-Aktionen»):
- `kind`: `editor` | `teacher`; формат кода учителя `ORB-L-XXXX-XXXX`.
- `teacher`: Kürzel учителя (из плана или введённый вручную), только у `teacher`.
- новые права: `can_homework` (Hausaufgaben eintragen), `can_edit_teacher` (Lehrer-Einträge ändern, только у `editor`).
- По умолчанию: у Editor-Code обе новые галочки выкл.; у Lehrer-Code `can_create` и `can_homework` вкл. (админ может снять), «менять только свои» — всегда.
- Один Kürzel — один активный код. Код работает на нескольких устройствах.

## Шаг 2. Вход учителя
- `POST /api/auth/teacher {code}` — вход **без пароля класса**. Сессия `kind=teacher`, ссылка на код. Те же лимиты попыток и блокировка, что у Editor-Code.
- Каждый запрос проверяет код: заблокирован или истёк → `401 teacher_code_invalid` (фронт показывает экран входа).
- Смена пароля класса учителей **не** выкидывает (их доступ — только код).
- `GET /api/me` → `role: "class" | "teacher"`, у учителя `teacher: {short: "Mü", rights: {...}}`.

## Шаг 3. Автор и «Schüler dürfen ändern» у Klausuren
Новые поля в `exams`: `author_teacher` (Kürzel-снимок, `null` у записей учеников), `students_may_edit` (bool, по умолчанию `false`, ставит только учитель).
В ответе: `author: {kind: "teacher", short: "Mü"} | null`, `studentsMayEdit`, `lastChange: {by: "teacher"|"student"|"admin", short, at} | null`.

Права (`exams/rules.py`, проверка на каждый запрос):
| кто | запись ученика | запись учителя |
|---|---|---|
| учитель | нет | только свою: менять, удалять |
| Editor-Code | как сейчас (own / all) | менять — только `can_edit_teacher` **и** `studentsMayEdit`; удалять — нет |
| админ | всё | всё |

## Шаг 4. Hausaufgaben
Новая таблица `homework`: предмет (код + снимок названия), `due` (дата сдачи), `text` (до 300 знаков, те же проверки, что у темы: без e-mail, ссылок, телефонов), автор, `students_may_edit`, `version`, `created_at/updated_at/deleted_at`.
API как у Klausuren: `GET/POST /api/homework`, `GET/PATCH/DELETE /api/homework/{id}` с `If-Match` (409/428 как у Klausuren), `POST …/restore` для «Rückgängig».
Создавать: учитель с `can_homework` или Editor-Code с `can_homework`. Видят все в классе (фронт фильтрует по «Meine Kurse», как Klausuren).

## Шаг 5. Verlauf (история изменений)
Таблица `entry_changes`: `entry_kind` (exam|homework), `entry_id`, `at`, `by` (teacher|student|admin), `short` (Kürzel только у учителя), `action` (created|updated|deleted|restored), `changes` (поле: было → стало).
`GET /api/exams/{id}/history`, `GET /api/homework/{id}/history`. Имён учеников и ярлыков Editor-Code там нет; кто именно — только в админском Protokoll (как сейчас).
История удаляется вместе с записью.

## Шаг 6. Админка
- `GET/POST/PATCH /api/admin/codes` понимают `kind=teacher`, `teacher`, `rights.homework`, `rights.editTeacher`.
- `GET /api/admin/teachers` — Kürzel из плана класса (с предметами) + у кого уже есть код.
- `/api/admin/exams` и новый `/api/admin/homework`: список, правка, удаление, «Alte löschen».
- Настройка `homework.deleteAfterDays` (7 / 14 / 30 / 90 / `yearEnd`, по умолчанию 30) в `PATCH /api/admin/settings`; ночная чистка `cleanup.py` удаляет Hausaufgaben и их историю.
- Protokoll: события «Lehrer-Code erstellt/gesperrt», «Hausaufgabe eingetragen/geändert/gelöscht» с ярлыком кода.

## Шаг 7. Проверка и выкладка
Тесты на каждое правило из таблицы прав, на вход учителя (заблокирован, истёк, лимит попыток), на чистку по сроку. Документация API и openapi. Выкладка на демо, health ok.

## Потом фронт (этот репозиторий)
Spec `docs/specs/14-lehrkraefte/spec.md`, затем экраны по макетам: вход учителя, Hausaufgaben (список, окно, форма, день), автор и «Verlauf», переключатель в формах, админка (Lehrer-Codes, права Editor-Code, Einstellungen).
