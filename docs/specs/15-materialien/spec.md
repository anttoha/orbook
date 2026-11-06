# 15 · Materialien (ссылки Google Drive / OneDrive)

**Статус:** в работе (дизайн ок 2026-11-06, ответы владельца на права — 2026-11-06)
**Источники:** `design/neu/15-materialien/` (артефакт https://claude.ai/artifact/CCAw6FL8CbAZu82V7ehoxa), `/opt/orbook-be/docs/API.md` (Hausaufgaben, Editor-Codes, Lehrkraft), код `/opt/orbook-be/src/orbook/homework/`, `exams/rules.py`, `api/admin_homework.py` (`list_teachers`).

## Зачем
Учитель кладёт ссылку на папку или файл (рабочие листы, решения, формулы) — класс находит её по предмету, в том числе прямо из окна урока. ORBook хранит только ссылку и название, файлы остаются в Drive.

## Экраны
| Экран | Файлы дизайна | Что на нём |
|---|---|---|
| Materialien | `handy-01-materialien`, `pc-01-materialien` | список по предметам, фильтр по предмету, «+» / «Link teilen» |
| Aktionen | `handy-02-aktionen`, `pc-02-menue` | Öffnen, Link kopieren, Teilen, Bearbeiten, Löschen |
| Neuer Link | `handy-03-neu`, `pc-03-neu` | Fach, Link (распознаётся), Titel, «Erlaubt: Google Drive · OneDrive» |
| Link nicht erlaubt | `handy-04-link-falsch`, `pc-04-link-falsch` | красная рамка, «Nur Links von Google Drive oder OneDrive.» |
| Gespeichert / Löschen? / Leer / Laden | `handy-05…08`, `pc-05…07` | тост, вопрос, пусто, skeleton |
| Stunde · Details | `handy-09-stunde`, `pc-08-stunde` | блок «Materialien · Mathe» под «Info» |
| Mehr | `handy-10-mehr` | секция «Klasse» → «Materialien · 6 Links» |
| Admin · Codes | `handy-11-code-recht` | право «Materialien teilen» (NEU) |
| Admin · Einstellungen | `handy-12-admin-seiten`, `pc-09-admin-seiten` | карточка «Materialien»: разрешённые сайты (только просмотр) |

## Что куда нажимать
- Телефон: Mehr → Klasse → Materialien (`/materialien`). ПК: пункт меню «Materialien» после «Statistik».
- Чипы сверху (Alle, Ma, De …) — фильтр, в адресе `?fach=Ma`. Чипы — только предметы, у которых есть ссылки.
- Нажатие на строку — ссылка открывается в новой вкладке (`target="_blank" rel="noopener noreferrer"`).
- Долгое нажатие (телефон) / правая кнопка или Shift+F10 (ПК) — действия. «Bearbeiten» и «Löschen» видны, только если `canEdit` / `canDelete`.
- «+» / «Link teilen» → `/materialien/neu` (на ПК — окно поверх списка, как «Klausur eintragen»). Без права — как у Klausuren: просит Editor-Code (`/mehr/editor-code`).
- Окно урока: блок «Materialien · <Fach>» — до 3 ссылок предмета, «Alle» → `/materialien?fach=<код>`. Нет ссылок — блока нет.

## Данные
| На экране | Откуда (запрос → поле) | Может быть пустым? |
|---|---|---|
| список | `GET /api/materials` → `materials[]` | пустой список → экран «Leer» |
| название предмета | `material.subject.name` | `name` может быть `null` → код предмета |
| «Google Drive · Ordner» | `material.provider`, `material.kind` | всегда есть |
| «von Mü» | `material.author` (`{kind: "teacher", short}`) | `null` или не учитель → без «von …» |
| «Eingetragen … 12. Sept» | `material.createdAt` | всегда |
| мои предметы (форма учителя) | `GET /api/auth/me` → `teacher.subjects` | пусто → «Für Ihre Fächer gibt es im Plan keine Kurse.» и «Speichern» выключен |
| право добавлять | `editor.canMaterials` / `teacher.canMaterials` | `editor: null` → просить код |
| число в Mehr «6 Links» | длина списка (кеш) | нет данных → без числа |

## Состояния
- Загрузка: skeleton (`handy-08`).
- Офлайн: список из `offlineCache` (последний ответ), запись выключена — как у Klausuren.
- Ошибка: «Etwas ist schiefgelaufen» + «Erneut versuchen»; ошибки полей формы — под полем (`details.fields`).
- Пусто: «Noch keine Materialien» + «Link teilen» (кнопка только с правом).
- Особые случаи: `409 conflict` при правке → «Der Link wurde inzwischen geändert» и свежие данные; `428` — не должно случаться (всегда шлём `If-Match`); предмет без названия — код.

## Бэкенд (нужно — делается в `/opt/orbook-be` после «ок» плана владельцем)
- Таблица `materials`: `id`, `subject_code`, `subject_name`, `title` (≤ 80), `url` (≤ 500), `provider` (`google` | `onedrive`), `kind` (`folder` | `document` | `sheet` | `slides` | `pdf` | `file`), `created_by_code_id`, `author_teacher`, `version`, `created_at`, `updated_at`. Миграция `0007`.
- `editor_codes.can_materials` (новое право; у уже выданных Lehrer-Codes включается миграцией, у Editor-Codes — выключено).
- `GET /api/materials?subject=` (`ETag`/`304`), `POST /api/materials`, `PATCH /api/materials/{id}` (`If-Match`, `409`/`428`), `DELETE /api/materials/{id}` (`204`, удаляется сразу — это только ссылка).
- Admin: `GET /api/admin/materials`, `DELETE /api/admin/materials/{id}`; `rights.materials` в `/api/admin/codes`.
- `GET /api/auth/me` / `POST /api/auth/teacher`: `teacher.canMaterials`, `teacher.subjects` (предметы из курсов плана, как в `/api/admin/teachers`); `editor.canMaterials`.
- Проверка ссылки на сервере: только `https`, без логина в адресе и порта; хост: `drive.google.com`, `docs.google.com`, `onedrive.live.com`, `1drv.ms`, `*.sharepoint.com`. Иначе `422` (`url`, `type: not_allowed`). `title` — 1…80, без e-mail, телефонов и ссылок.
- Права (решение владельца 2026-11-06):
  - **создать**: учитель с правом — **только свои предметы** (иначе `403 forbidden` «Nur für Ihre Fächer.»); Editor-Code с правом — любой предмет;
  - **менять**: автор (тот же код / тот же учитель) и админ;
  - **удалять**: автор, учитель этого предмета, админ.
- Не больше 300 ссылок на класс (`409 limit_reached`). Протокол: «Link geteilt / geändert / gelöscht» (без URL).

## Чего здесь НЕТ
- Загрузки файлов, предпросмотра и миниатюр (в приложение не грузится ни одна чужая страница).
- Других сайтов (Dropbox, YouTube …) — список в карточке админа пока только для просмотра.
- Привязки ссылки к конкретному уроку или дате — только к предмету.
- Поиска по ссылкам в ⌘K (позже).

## Отличия от дизайна
- Admin: отдельного экрана в дизайне нет — у админа тот же список (`pc-01`) в его разделе `/admin/materialien`, действия «Öffnen», «Link kopieren», «Löschen». Так ответ «админ удаляет» работает без нового макета.
- Чипы фильтра — коды предметов (как в Klausuren), а не полные названия: на телефоне иначе не помещаются.

## Слова
- **Material / Link** — ссылка на файл или папку в Google Drive / OneDrive с названием и предметом.
- **provider** — чей сайт: Google Drive или OneDrive.
- **kind** — что за ссылка: папка, документ, таблица, презентация, PDF, файл (узнаём по адресу).
- **Freigabe „Jeder mit dem Link“** — настройка доступа в Drive, без неё ученики увидят «Zugriff anfordern».
- **If-Match** — заголовок с версией записи: сервер не даст перезаписать чужую свежую правку.

## Открытые вопросы
- нет (права и сайты решены владельцем 2026-11-06).
