# Собирает index.html — страницу-обзор макетов части 15 со встроенными SVG (для артефакта «ок дизайн?»).
import os, re

HERE = os.path.dirname(os.path.abspath(__file__))
n = 0

def inline(name):
    """SVG без пересечения id: в одной странице много макетов, а у оригиналов одинаковые clipPath id."""
    global n
    n += 1
    s = open(os.path.join(HERE, name + ".svg"), encoding="utf-8").read()
    p = f"s{n}-"
    s = re.sub(r'id="([^"]+)"', lambda m: f'id="{p}{m.group(1)}"', s)
    s = re.sub(r'url\(#([^)]+)\)', lambda m: f'url(#{p}{m.group(1)})', s)
    return s.replace("<svg ", '<svg role="img" ', 1)

def shot(name, caption, kind="phone"):
    return (f'<figure class="shot {kind}"><figcaption>{caption}</figcaption>'
            f'<div class="v v-hell">{inline(name + "-hell")}</div><div class="v v-dunkel">{inline(name + "-dunkel")}</div></figure>')

SOFT = "/opt/orbook-be/design/ORBook Soft"

def orig(path, caption, kind="phone"):
    """Старый экран Soft (светлая/тёмная) — для сравнения рядом с новыми."""
    global n
    out = []
    for folder, cls in ((path[0], "v-hell"), (path[1], "v-dunkel")):
        n += 1
        s = open(os.path.join(SOFT, folder, path[2] + ".svg"), encoding="utf-8").read()
        p = f"s{n}-"
        s = re.sub(r'id="([^"]+)"', lambda m: f'id="{p}{m.group(1)}"', s)
        s = re.sub(r'url\(#([^)]+)\)', lambda m: f'url(#{p}{m.group(1)})', s)
        out.append(f'<div class="v {cls}">{s.replace("<svg ", '<svg role="img" ', 1)}</div>')
    return f'<figure class="shot {kind} old"><figcaption>{caption}</figcaption>{"".join(out)}</figure>'

SECTIONS = [
    ("liste", "Список «Termine»", "Третья вкладка рядом с «Klausuren» и «Hausaufgaben» (нижняя кнопка с флажком; на компьютере — тот же раздел). Термины по неделям: «Diese Woche», «Später». Слева — дата (фиолетовая, а свободные дни — зелёные), метка вида (AUSFLUG, ELTERNABEND, FREI, TERMIN), время и место, кто внёс. Нажатие открывает окно термина: сколько дней осталось, место, подсказка, кто внёс, «Kalender» и «Teilen». У автора — ещё «Bearbeiten» и «Löschen».",
     [("handy-01-termine", "Termine"), ("handy-02-details", "Termin · Details (Blatt)")],
     [("pc-01-termine", "Computer · Termine + Monat"), ("pc-02-details", "Computer · Details (Panel, eigener Termin)")]),
    ("neu", "Новый термин", "Кнопка «+» / «Termin eintragen». Вид (Ausflug, Elternabend, Frei, Sonstiges), для кого (весь класс или курс учителя — тогда видят только ученики с этим курсом), название, дата «von» и необязательная «bis» (для каникул и поездок на несколько дней), время (пусто = весь день), место и подсказка. Ошибка показывается под полем: «Das Ende liegt vor dem Anfang.»",
     [("handy-03-neu", "Neuer Termin"), ("handy-04-datum-falsch", "Datum falsch")],
     [("pc-03-neu", "Computer · Neuer Termin (Fenster)"), ("pc-04-datum-falsch", "Computer · Datum falsch")]),
    ("zustaende", "Сохранено, удаление, пусто, загрузка", "После сохранения — тост и метка «NEU». Удаление — с вопросом. Пустой список объясняет, что сюда попадёт. Загрузка — серые полоски, как везде.",
     [("handy-05-gespeichert", "Gespeichert (Toast)"), ("handy-06-loeschen", "Löschen?"), ("handy-07-leer", "Leer"), ("handy-08-laden", "Laden (Skeleton)")],
     [("pc-05-gespeichert", "Computer · Gespeichert"), ("pc-06-loeschen", "Computer · Löschen?"), ("pc-07-leer", "Computer · Leer")]),
    ("woche", "В неделе и в дне", "Неделя: под заголовками дней — узкая полоска с терминами этого дня (как «весь день» в календаре телефона), нажатие открывает окно термина. В карточке под неделей — новая строка «Do · Elternabend 19:00 · morgen». День: под «Info zum Tag» — фиолетовая плашка «Termin: …». На компьютере — то же: полоска над сеткой и плашка в панели дня справа.",
     [("handy-09-woche", "Woche + Termine"), ("handy-10-tag", "Tag + Termin")],
     [("pc-08-woche", "Computer · Woche + Termine")]),
    ("rechte", "Право для Editor-Codes", "Если вы разрешите ученикам с Editor-Code вносить термины — в админке у кода появится право «Termine eintragen» (по умолчанию выключено). У Lehrer-Codes право есть всегда.",
     [("handy-11-code-recht", "Admin · neues Recht (Vorschlag)")], []),
]
OLD = [(("1 Handy Hell", "2 Handy Dunkel", "04 Woche"), "Soft 04 · Woche", "phone"),
       (("1 Handy Hell", "2 Handy Dunkel", "13 Klausuren"), "Soft 13 · Klausuren", "phone"),
       (("1 Handy Hell", "2 Handy Dunkel", "14 Klausur · Details (Blatt)"), "Soft 14 · Klausur · Details", "phone"),
       (("1 Handy Hell", "2 Handy Dunkel", "16 Klausur eintragen (Editor)"), "Soft 16 · Klausur eintragen", "phone"),
       (("3 PC Hell", "4 PC Dunkel", "05 Woche · Stunden + gewählter Tag"), "Soft PC 05 · Woche", "pc")]

CSS = """
:root{--paper:#FBF7F2;--card:#FFFFFF;--ink:#2A2433;--muted:#6A6275;--faint:#978FA1;--accent:#6C4DF6;--accent-ink:#4A31C9;--tint:#EEE9FF;--sand:#F3EDE5;--rule:#EAE2D8;--stage:#F0EAE2;
--display:'Nunito',ui-rounded,system-ui,sans-serif}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--paper:#16131C;--card:#221E2A;--ink:#F4F0F8;--muted:#B5ACC1;--faint:#877E94;--accent:#A58BFF;--accent-ink:#CFC2FF;--tint:#2C2548;--sand:#2A2533;--rule:#352F40;--stage:#0F0D14;color-scheme:dark}}
:root[data-theme="dark"]{--paper:#16131C;--card:#221E2A;--ink:#F4F0F8;--muted:#B5ACC1;--faint:#877E94;--accent:#A58BFF;--accent-ink:#CFC2FF;--tint:#2C2548;--sand:#2A2533;--rule:#352F40;--stage:#0F0D14;color-scheme:dark}
body{background:var(--paper);color:var(--ink);font-family:var(--display);font-size:15px;line-height:1.55}
.wrap{max-width:1240px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:28px 64px}
header{display:flex;flex-wrap:wrap;gap:16px 24px;align-items:end;justify-content:space-between;margin-bottom:8px}
.eyebrow{font-size:12.5px;font-weight:800;color:var(--accent-ink);letter-spacing:.02em}
h1{font-size:clamp(28px,4vw,40px);font-weight:900;letter-spacing:-.015em;margin:2px 0 0;text-wrap:balance}
h2{font-size:22px;font-weight:900;letter-spacing:-.01em;margin:44px 0 6px}
p{max-width:68ch;color:var(--muted);margin:0 0 14px}
.seg{display:inline-flex;background:var(--sand);border-radius:18px;padding:3px}
.seg button{font:800 12.5px var(--display);color:var(--muted);background:none;border:0;border-radius:15px;padding:8px 16px;cursor:pointer}
.seg button[aria-pressed="true"]{background:var(--card);color:var(--ink)}
.seg button:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.row{display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start}
.shot{margin:0;background:var(--stage);border-radius:22px;padding:14px;min-width:0}
.shot figcaption{font-size:12.5px;font-weight:800;color:var(--faint);margin:0 4px 10px}
.shot svg{display:block;width:100%;height:auto;border-radius:14px}
.phone{flex:0 1 300px}
.pc{flex:1 1 100%}
.pc .v{overflow-x:auto}
.both .v{margin-bottom:12px}
.v-dunkel{display:none}
.old figcaption{color:var(--accent-ink)}
.show-dunkel .v-hell{display:none}.show-dunkel .v-dunkel{display:block}
.show-beide .v-dunkel{display:block}
.box{background:var(--card);border-radius:22px;padding:18px 22px;margin-top:44px;max-width:780px}
.box h2{margin-top:0}
.box ol{margin:0;padding-left:20px;color:var(--ink)}.box li{margin:6px 0}
.box li span{color:var(--muted)}
code{font-family:ui-monospace,monospace;font-size:13px;background:var(--sand);border-radius:6px;padding:1px 5px}
"""

JS = """
const root=document.getElementById('shots');const btns=[...document.querySelectorAll('.seg button')];
function show(v){root.classList.remove('show-hell','show-dunkel','show-beide');root.classList.add('show-'+v);
btns.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===v)));try{localStorage.setItem('orb18-theme',v)}catch(e){}}
let start='hell';try{start=localStorage.getItem('orb18-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dunkel':'hell')}catch(e){}
btns.forEach(b=>b.addEventListener('click',()=>show(b.dataset.v)));show(start);
"""

def page():
    out = ['<title>ORBook Termine</title><meta name="claude:viewport-fit-sides" content="cover">',
           '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
           '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap">',
           f'<style>{CSS}</style><div class="wrap"><header><div><div class="eyebrow">Часть 18 · новые экраны ORBook Soft</div><h1>Termine</h1></div>',
           '<div class="seg" role="group" aria-label="Тема макетов"><button data-v="hell">Hell</button><button data-v="dunkel">Dunkel</button><button data-v="beide">Beide</button></div></header>',
           '<p>Ausflug, Elternabend, freie Tage и другие события заранее: их вносят школа (админ) и учителя, а класс видит в неделе, в дне и в списке рядом с Klausuren. Нарисовано поверх настоящих экранов Soft (04, 05, 13, 14, 16, 42, PC 05, PC 14), каждый — в светлой и тёмной теме.</p>',
           '<div id="shots">']
    for sid, h, text, phones, pcs in SECTIONS:
        out.append(f'<section id="{sid}"><h2>{h}</h2><p>{text}</p><div class="row">')
        out += [shot(nm, cap) for nm, cap in phones]
        out += [shot(nm, cap, "pc") for nm, cap in pcs]
        out.append('</div></section>')
    out.append('<section id="vergleich"><h2>Для сравнения: старые экраны Soft</h2><p>Откуда взяты шторка, строки меню, список и левое меню.</p><div class="row">')
    out += [orig(pth, cap, kind) for pth, cap, kind in OLD]
    out.append('</div></section></div>')
    out.append('''<div class="box"><h2>Вопросы к вам (решаете вы)</h2><ol>
<li><b>Учителя:</b> <span>предлагаю — учитель вносит термины для своих курсов <i>и</i> для всего класса (Elternabend, Wandertag), но «Frei» (свободные дни) — только админ. Так?</span></li>
<li><b>Ученики с Editor-Code:</b> <span>могут ли они вносить термины (с правом «Termine eintragen», по умолчанию выключено) — или только школа и учителя?</span></li>
<li><b>Менять и удалять:</b> <span>предлагаю — автор и админ (как Hausaufgaben). Так?</span></li>
<li><b>Хранение:</b> <span>прошедшие термины удаляются через 30 дней после даты (как Hausaufgaben). Так?</span></li>
</ol><h2 style="margin-top:20px">Решил сам (скажите, если не так)</h2><ul style="margin:0;padding-left:20px">
<li>«Termine» — третья вкладка в разделе Klausuren, а не новая кнопка внизу: там уже 4 кнопки;</li>
<li>термин на курс (например, Physik) видят только ученики с этим курсом — как уроки в «Meine Kurse»;</li>
<li>«Frei» только помечает день, уроки из плана школы не прячет: главный источник — план школы;</li>
<li>в термине нет имён учеников; учитель виден кратко («von Ric»), записи по Editor-Code — без имени.</li>
</ul><p style="margin-top:12px">Ответ: «ок дизайн» + ответы на 4 вопроса, или что поменять.</p></div>''')
    out.append(f'</div><script>{JS}</script>')
    return "\n".join(out)

open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(page())
print("index.html", os.path.getsize(os.path.join(HERE, "index.html")) // 1024, "KB")
