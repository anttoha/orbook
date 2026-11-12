# 22 · Kleinigkeiten (мелочи одной пачкой)

**Статус:** в работе (дизайн ок 12.11.2026)
**Источники:** `design/neu/22-kleinigkeiten/` (макеты), Soft 04/05/10/19/22/23/24, PC 05/22/24; `docs/ideas/2026-11-11/ideas.md`; `/opt/orbook-be/docs/API.md` (`/api/courses`, уроки `course`); код `src/` на 12.11.2026.

## Зачем
Пять мелких правок по просьбам владельца: баг выбора курсов (20a), понятный Sport (20b), формат даты изменения под днём, Statistik внутри «Mehr» с разделением «Seiten / Einstellungen», и быстрый просмотр всех курсов класса без потери своего выбора.

## Экраны
| Экран | Файлы дизайна | Что на нём |
|---|---|---|
| Mehr | `handy-01-mehr`, `pc-01-mehr` | блоки «Seiten» и «Einstellungen», внизу «Klasse verlassen» |
| Statistik | `handy-02-statistik` | «назад» в Mehr, строка «Mehr · …» над заголовком |
| Darstellung | `handy-03/04-darstellung…`, `pc-02-darstellung` | новая карточка «Änderung unter dem Tag» с превью |
| Woche | `handy-05/06/09-woche…`, `pc-03-woche-alle-kurse` | пункт ⋮ «Alle Kurse zeigen», точка на ⋮, легенда |
| Tag | `handy-07-tag-alle-kurse` | круглая кнопка справа от «Liste / Zeitleiste» |
| Meine Kurse | `handy-08-meine-kurse` | «Sport · Mädchen» / «Sport · Jungen» |

## Что куда нажимать
- **Нижняя панель (телефон):** Woche · Klausuren · Mehr. Statistik — Mehr → «Statistik». На ПК в левом меню «Statistik» больше нет, кнопка внизу называется «Mehr» (была «Einstellungen»).
- **Mehr → Darstellung → «Änderung unter dem Tag»:** «Mi 15:15» (по умолчанию, как было) / «15.09.» / «15.09. 15:15». Превью недели меняется сразу. В тот же день всегда только время.
- **Woche → ⋮ → «Alle Kurse zeigen»** (переключатель). Включено: видны все курсы класса, чужие — пунктиром и серым; на ⋮ фиолетовая точка; под сеткой «Gestrichelt: nicht in deinen Kursen». Выбор в «Meine Kurse» **не меняется**.
- **Tag:** круглая кнопка (стопка) справа от «Liste / Zeitleiste» — то же самое. Белая = мой план, фиолетовая = все курсы.
- **ПК, Woche:** кнопка «Alle Kurse» в шапке.

## Данные
| На экране | Откуда | Может быть пустым? |
|---|---|---|
| курс урока, «мой/не мой» | `lesson.course.nr` + `GET /api/courses` (`optional`) + выбор на устройстве | `course` = `null` у «лишних» уроков → всегда «мой» |
| «Sport · Mädchen» / «SpMä» | `course.label` / `course.group` (`SpMä`, `SpJu`) | `group`/`label` бывают `null` → обычное название предмета |
| время изменения под днём | `day.changedAt ?? day.publishedAt` | оба `null` → строка пустая (место зарезервировано) |

## Решения (технические, принял сам)
- **20a, причина бага:** выбор курсов стирали две кнопки — «Alle Kurse zeigen» в меню недели и «N Stunden ausgeblendet · einblenden» в дне (`showAllCourses` → `picked: []`). Вторая дыра: на старте можно не включить ни одного Wahl-курса, тогда сохранялось `[]` = «показывать все». Исправление: (1) на старте пустой выбор сохраняется как `NO_OPTIONAL`; (2) кнопки «показать всё» больше не трогают выбор, а включают режим просмотра `allCourses` (флаг в `userStore`). Тесты в `courses.test.js` / `format.test.js`.
- **Режим «Alle Kurse»** — только просмотр на этом устройстве (флаг `allCourses`, запоминается). Фильтр уроков в этом режиме не прячет, а помечает чужие уроки `notMine: true`; клетки и строки рисуют их пунктиром. Баннер «Neuer Plan», статистика, поиск — как раньше, по моим курсам.
- **Sport:** `groupName("SpMä") → "Mädchen"`, `"SpJu" → "Jungen"`. В клетке недели код — метка группы («SpMä»), в названии — «Sport · Mädchen». Остальные курсы — без изменений.
- **Формат даты:** `userStore.changedFormat`: `"weekday"` | `"date"` | `"datetime"`; `changedLabel(day, format)`.
- **Statistik** остаётся по адресу `/statistik` (во всю ширину на ПК), но открывается из Mehr; вкладка «Mehr» подсвечена на `/statistik`. Если школа выключила статистику (`features.statistics: false`) — строки в Mehr нет.

## Состояния
- Загрузка / офлайн / ошибка — как раньше на этих экранах (ничего нового не грузится).
- Пусто: день, где все мои курсы скрыты — кнопка «… ausgeblendet · alle zeigen» включает режим «Alle Kurse» (не стирает выбор).
- Курсы без группы, урок без курса (`course: null`) — считаются «моими».

## Бэкенд
Не нужно: `label`/`group` уже есть в `/api/courses` и `lesson.course`.

## Чего здесь НЕТ
- Настройки «Alle Kurse» по умолчанию в Darstellung — только кнопки.
- Синхронизации этих настроек между устройствами (часть 25).
- Mitteilungen в Mehr (часть 17).

## Отличия от дизайна
- В Mehr остаются уже существующие пункты, которых не было в макете: «Materialien» и «Klasse einladen» (в «Seiten»), «Tastenkürzel» на ПК. «Mitteilungen» пока нет.

## Слова
- **Wahl-курс (`optional`)** — курс по выбору; ученик сам решает, видеть ли его.
- **`NO_OPTIONAL`** — запись «ни одного Wahl-курса», потому что пустой список значит «все».
- **режим «Alle Kurse»** — временно показать весь план класса, не меняя «Meine Kurse».

## Открытые вопросы
- нет
