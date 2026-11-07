# 19 · Muster-Stundenplan

**Статус:** готово (2026-11-07; дизайн ок и ответы владельца 2026-11-07)
**Источники:** `design/neu/19-muster/` (артефакт https://claude.ai/artifact/GfeBJpXgwd96118856UhSr), `/opt/orbook-be/docs/API.md` (`expectedLessons`, `meta.musterUntil`, `muster.until`), код `/opt/orbook-be/src/orbook/plan/view.py` (`expected_lessons`, `week_number`, `muster_until`).

## Зачем
Будущие недели видно заранее по обычному расписанию: можно смотреть уроки, писать заметки и вносить Tests/Klausuren на конкретный урок. Когда школа выкладывает настоящий план, Muster исчезает, а записи, которые больше не подходят, ORBook предлагает проверить.

## Решения владельца (2026-11-07)
- **Как далеко:** по умолчанию до конца учебного года, админ меняет (`muster.until`: `yearEnd`, `2w`, `4w`, `8w`, `off`).
- **Кто вносит Klausuren в Muster-уроки:** те же, что сейчас (Editor-Codes, учителя).
- **План изменился:** Test/Klausur сам не переносится; заметки ученик переносит сам.
- **Откуда Muster:** только автоматически, с учётом недели A/B; **буква недели видна везде** (её раньше не было).

## Экраны
| Экран | Макет | Что на нём |
|---|---|---|
| Woche · Muster | handy-01, pc-01 | штриховка уроков и дней, метка MUSTER (на телефоне «MUSTER · WOCHE A» в строке KW), плашка «Muster-Stundenplan: …» |
| Diese Woche · часть дней Muster | handy-02 | заштрихованы только дни без плана, строка «Fr · noch Muster» в карточке |
| Tag · Muster | handy-03, pc-01 (панель) | плашка «Muster: so ist der Montag normalerweise…», уроки заштрихованы, подсказка внизу |
| Stunde · Muster | handy-04, pc-02 | метка MUSTER, «aus dem Muster – kann sich noch ändern», «Test oder Klausur eintragen» (только с правом) |
| Test eintragen | handy-05 | `/testen/neu?datum=…&stunde=…&fach=…&muster=1`: поля заполнены, плашка «Stunde aus dem Muster» |
| Plan ist da · Einträge prüfen | handy-06…08, pc-03 | плашка в дне → шторка `?sheet=pruefen&datum=`: «In die N. Stunde» / «Test ändern» / «So lassen», тост |
| Woche wählen | handy-09, pc-04 | буква A/B рядом с номером KW |
| Noch kein Muster | handy-10 | пустой экран, «Zur aktuellen Woche» |
| Admin · Einstellungen | handy-11 | карточка «Muster-Stundenplan»: «Muster zeigen bis», «Wochen A und B» |

## Данные
| На экране | Откуда | Пусто? |
|---|---|---|
| уроки Muster | `day.expectedLessons` при `not_published`/`unavailable` | `[]` → обычное «Plan fehlt noch» или «Noch kein Muster» |
| буква недели | `week.abWeek`, `day.week`, `meta.abWeek` (1 = A, 2 = B) | `null` → буквы нет |
| предел Muster | `meta.musterUntil` | `null` → Muster выключен |
| сверка | `day.lessons`, `day.exams` (`lesson`, `subject` бывают `null` → не проверяем), свои заметки `userStore.notes` | — |

Как устроено: `useWeek` превращает день с Muster в обычный (`status: "ok"`, `muster: true`, уроки с `muster: true`) — `shared/utils/muster.js` `musterWeek`. В сторе лежит ответ сервера как есть, поэтому «Neuer Plan» сравнивает настоящие данные. «So lassen» — `userStore.checkedPlan` (на устройстве).

## Состояния
- Загрузка, офлайн, ошибка — как у недели и дня.
- Muster выключен админом — как раньше: «Plan fehlt noch».
- Прошедшие дни не сверяем: там уже ничего не изменить.

## Бэкенд (сделано, выложено 2026-11-07)
`expectedLessons` до `muster.until` (раньше — 14 дней), `meta.musterUntil`, настройка `muster.until`. Миграции нет.

## Отличия от дизайна
- В «Woche wählen» недели Muster не заштрихованы: фронт не знает, на какие недели план уже вышел, не загрузив их. Буква A/B есть.
- В плашке «Plan ist da» текст «N Einträge prüfen» без «aus dem Muster»: сверка ловит и записи на уроках, которые отменили уже после настоящего плана — это тоже полезно.
- В строках урока нет красной строки «prüfen» — всё в плашке и шторке.
- В админке нет строки «Muster gebaut aus KW …»: такого поля в API нет. Буква недели в админке видна, только если этот браузер вошёл и в класс.
- На телефоне в дне буква недели — под датой (в строке дня недели обрезала бы «morgen»).

## Слова
- **Muster** — обычное расписание дня недели (той же недели A/B) из последних недель с настоящим планом, без отмен и замен.
- **Woche A/B** — двухнедельный цикл школы: в неделю A и B разные уроки.
- **Einträge prüfen** — сверка Klausuren и заметок с вышедшим планом.
