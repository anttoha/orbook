# 19c · Kurs/Fach wählen (поле со списком)

**Статус:** готово (2026-11-07; «ок дизайн» владельца: «нормальный, везде так делай»)
**Источники:** `design/neu/19c-kurs-auswahl/` (артефакт https://claude.ai/artifact/TREHpKPdQCBQSC88rMjwAU), Soft PC 51 «Suche ⌘K».

## Зачем
Стена из 20–30 одинаковых чипов неудобна, одинаковые курсы («Französisch» ×2) не различить. Теперь одно поле → список с поиском.

## Где
| Место | Что выбираем | Особенности |
|---|---|---|
| Admin · Muster · Stunde bearbeiten | курс (`/api/admin/courses`) | «Vorschlag · stand hier im Plan», подпись «T13 · Kurs 145»; в шторке телефона — раскрывается на месте |
| Klausur, Hausaufgabe | предмет | «Deine Fächer» сверху, подпись — учителя |
| Material | предмет | учитель видит только свои предметы |
| Termin | предмет (необязательно) | «Ganze Klasse» снимает выбор |
| Notiz | предмет (необязательно) | «Ohne Fach» снимает; раскрывается на месте |
| Фильтр Klausuren | несколько предметов | «Alle Fächer» сбрасывает; «Fertig» на телефоне |

Полоска чипов над списками (Klausuren, Hausaufgaben, Materialien) осталась: там 3–6 предметов с записями, один тап быстрее.

## Как устроено
- `components/ui/ListPicker.jsx` — поле; телефон: шторка (или на месте, `inline`), ПК: Radix Popover под полем.
- `components/ui/PickerList.jsx` — поиск + группы + строки, ↑↓ / Enter.
- `shared/utils/picker.js` (+9 тестов) — `courseItems`, `subjectItems`, `filterItems` (без регистра и умлаутов), `groupItems`, `summaryText`.
- Новых библиотек нет. `SubjectToggle` (чип) удалён — больше нигде не нужен.

## Отличия от дизайна
- В форме Klausur вторая строка — учителя предмета (в макете «dein Kurs · T03»).
