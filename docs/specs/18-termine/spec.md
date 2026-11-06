# 18 · Termine (Ausflug, Elternabend, freie Tage)

**Статус:** готово (2026-11-06; дизайн ок и ответы владельца 2026-11-06)
**Источники:** `design/neu/18-termine/` (артефакт https://claude.ai/artifact/VcujzZsAG1zYmZmTKm11tW), `/opt/orbook-be/docs/API.md` (Materialien, Hausaufgaben, Editor-Codes), код `/opt/orbook-be/src/orbook/materials/`, `homework/service.py` (`cutoff`).

## Зачем
Класс заранее видит Ausflug, Elternabend, свободные дни и другие события — в списке рядом с Klausuren, полоской в неделе и плашкой в дне. Вносят школа (админ), учителя и ученики с правом.

## Решения владельца (2026-11-06)
- **Вносить:** админ — всё; учитель с правом — всё (все виды, включая «Frei», для всего класса или своего предмета); Editor-Code — только если админ включил право «Termine eintragen» (по умолчанию выключено).
- **Менять и удалять:** автор (тот же код / тот же учитель) и админ.
- **Хранение:** настраивается админом (`appointments.keepDays`: 7, 14, 30, 90 или 0 = до конца учебного года; по умолчанию 30) — считается от последнего дня термина.

## Экраны
| Экран | Файлы дизайна | Что на нём |
|---|---|---|
| Termine | `handy-01`, `pc-01` | третья вкладка Klausuren · Hausaufgaben · **Termine**, группы «Diese Woche / Nächste Woche / Später» |
| Termin · Details | `handy-02`, `pc-02` | вид, для кого, «N Tage bis …», дата и время, Ort, Hinweis, автор, Kalender/Teilen; у автора Bearbeiten/Löschen |
| Neuer Termin | `handy-03/04`, `pc-03/04` | Art, Für, Titel, Von/Bis, Uhrzeit, Ort, Hinweis; ошибка «Das Ende liegt vor dem Anfang.» |
| Gespeichert / Löschen? / Leer / Laden | `handy-05…08`, `pc-05…07` | тост, вопрос, пусто, skeleton |
| Woche | `handy-09`, `pc-08` | полоска терминов под днями, строка «Do · Elternabend 19:00» в карточке недели |
| Tag | `handy-10`, `pc-08` (панель) | плашка «Termin: …» под «Info zum Tag» |
| Admin · Codes | `handy-11` | право «Termine eintragen» (NEU) |

## Что куда нажимать
- Вкладка: `/testen?liste=termine` (как `?liste=hausaufgaben`). Окно: `?sheet=termin&id=`.
- «+» / «Termin eintragen» → `/testen/termine/neu`; правка — `/testen/termine/:id/bearbeiten`. Без права — как Klausuren: просит Editor-Code.
- Полоска в неделе и плашка в дне открывают окно термина. Строка в карточке недели → список Termine.
- Админ: `/admin/termine` — тот же список, «Termin eintragen», правка и удаление любого термина; карточка «Termine» в Einstellungen (срок хранения).

## Данные
| На экране | Откуда | Может быть пустым? |
|---|---|---|
| список | `GET /api/appointments` → `appointments[]` | пусто → «Keine Termine» |
| вид | `kind`: `trip` · `parents` · `free` · `other` | всегда |
| для кого | `subject` (`{code, name}`) | `null` = вся класс; `name` может быть `null` → код |
| даты | `dateFrom`, `dateTo` | `dateTo` `null` = один день |
| время | `timeFrom`, `timeTo` («HH:MM») | `null` = весь день; `timeTo` без `timeFrom` не бывает |
| место, подсказка | `place`, `note` | `null` → строки нет |
| автор | `author` (`{kind:"teacher", short}`) | `null` → «Eingetragen von der Schule» (админ) или без имени (Editor-Code) — различаем по `source`: `admin` · `teacher` · `code` |
| права | `canEdit`, `canDelete` | всегда |
| право вносить | `editor.canAppointments` / `teacher.canAppointments` (`/api/auth/me`) | `editor: null` → просить код |

Курсовые термины (`subject` не `null`) показываем только тем, у кого этот предмет есть среди выбранных курсов (как уроки); учитель и админ видят всё.

## Состояния
- Загрузка — skeleton; офлайн — последний список из `offlineCache`, запись выключена.
- Ошибки полей — под полем (`details.fields`), `409 conflict` при правке — «Der Termin wurde inzwischen geändert» и свежие данные; `428` не должно случаться (шлём `If-Match`).
- Ошибка загрузки — «Etwas ist schiefgelaufen» + «Erneut versuchen».

## Бэкенд (`/opt/orbook-be`, разрешено владельцем)
- Миграция `0008`: таблица `appointments` (`kind`, `title` ≤ 60, `subject_code/name` null, `date_from`, `date_to` null, `time_from/time_to` null, `place` ≤ 80, `note` ≤ 300, `created_by_code_id`, `author_teacher`, `by_admin`, `version`, `created_at`, `updated_at`); `editor_codes.can_appointments` (у Lehrer-Codes включается миграцией).
- `GET/POST /api/appointments`, `PATCH/DELETE /api/appointments/{id}` (`If-Match`, `409`/`428`, ETag/304).
- Admin: `GET/POST /api/admin/appointments`, `PATCH/DELETE /api/admin/appointments/{id}`; `rights.appointments` в `/api/admin/codes`; настройка `appointments.keepDays`.
- Проверки: `dateTo ≥ dateFrom` (иначе `422 dateTo/before_start` «Das Ende liegt vor dem Anfang.»), не длиннее 100 дней; время «HH:MM», `timeTo` только с `timeFrom` и позже в один день; текст без e-mail, ссылок, телефонов; учитель — предмет только свой. Не больше 500 терминов. Протокол «Termin eingetragen / geändert / gelöscht» (без текста подсказки).
- Уборка (`orbook cleanup`): удаляются термины, чей последний день старше срока.

## Чего здесь НЕТ
- Уведомлений (часть 17), повторяющихся терминов, приглашений и ответов «приду / не приду».
- «Frei» не прячет уроки плана — только помечает день (план школы главнее).
- Точек в «Woche wählen» (можно позже).

## Отличия от дизайна
- Форма на ПК — страница, как уже сделанные формы Klausur/Hausaufgabe/Materialien (один код для телефона и ПК).
- Правка термина админом — та же форма в разделе админа.

## Сделано иначе, чем в макете
- «Kalender» в окне — файл .ics собирается на устройстве (в API для терминов его нет).
- Подпись внизу списка — «Vergangene Termine verschwinden nach einiger Zeit automatisch.»: срок задаёт админ, ученик его не знает.
- Админ правит любой термин нажатием на строку в `/admin/termine` (форма та же).

## Слова
- **Termin** — событие класса с датой: Ausflug, Elternabend, freier Tag, Sonstiges.
- **Kurs-Termin** — термин одного предмета: его видят только ученики с этим курсом.
- **keepDays** — через сколько дней после термина он удаляется.
