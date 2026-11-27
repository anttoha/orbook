# Часть 53 — Frei: ganzer Tag oder nur bestimmte Stunden

Дизайн: `design/neu/53-frei-stunden/` (ок владельца 2026-11-27): handy-01…03 форма, handy-04 Woche, handy-05/06 Tag.

## Что видит пользователь
- **Форма Termin, вид «Frei»:** поле «Unterricht» — «Ganzer Tag» или «Nur einzelne Stunden» + кнопки-номера уроков (из `meta.lessonTimes` без 0-го, иначе 1…8). Ничего не выбрано → «Bitte mindestens eine Stunde wählen.». Для «Frei» нет «Uhrzeit» и «Ort» (при сохранении уходят `null`).
- **Woche (телефон и ПК):** уроки не прячем. Свободные — зелёные, пунктир, «frei» вместо кабинета (ПК — метка FREI).
- **Tag (Liste, Zeitleiste, панель дня на ПК):** зелёная плашка «Frei: Titel · 5.–6. Stunde. Eingetragen von …»; уроки зачёркнуты зелёным, метка FREI.
- Окно термина, строка в списке Termine, «Teilen»: вместо времени — «5.–6. Stunde» / «ganzer Tag».

## API
- Бэкенд: новое поле `periods` у Appointment (схема 0018): только у `free`, `null` — весь день, иначе `[5, 6]` (1…15). Пустой список → `422 periods/required`. У других видов всегда `null`.
- Фронт шлёт `periods` только при `kind = free` (другим видам сервер сам сбрасывает).

## Как устроено
- `shared/utils/appointments.js`: `freeOn(items, date)` — что свободно в день; `markFreeLessons(lessons, free)` — помечает уроки `free: true`; `periodsText()`.
- `useFreeMarker()` в `shared/hooks/useAppointments.js` — один раз на экран (WeekGrid, PeriodGrid, TimeGrid, DayPanel, Day).
- Рисуют `free`: LessonCell, LessonRow, DesktopLessonCard, Timeline; плашка — AppointmentBanner.

## Чего нет
- Статистика и Start-блоки не меняются (уроки в плане школы обычные — в «Ausfall» и так не попадают).
- Курсовой «Frei» (только для одного предмета) помечает уроки всех предметов в эти часы — как и раньше термин виден только ученикам с этим курсом.
