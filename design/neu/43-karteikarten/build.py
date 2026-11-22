# Собирает index.html — страницу-обзор макетов части 43 со встроенными SVG (для артефакта «ок дизайн?»).
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
            f'<div class="v v-hell">{inline(name + "-hell")}</div><div class="v v-dunkel">{inline(name + ("-dunkel" if os.path.exists(os.path.join(HERE, name + "-dunkel.svg")) else "-hell"))}</div></figure>')

SOFT = "/opt/orbook-be/design/ORBook Soft"

def soft(name, caption):
    """Похожий старый экран Soft для сравнения (светлый и тёмный)."""
    global n
    out = []
    for folder, cls in (("1 Handy Hell", "v-hell"), ("2 Handy Dunkel", "v-dunkel")):
        n += 1
        s = open(os.path.join(SOFT, folder, name + ".svg"), encoding="utf-8").read()
        p = f"s{n}-"
        s = re.sub(r'id="([^"]+)"', lambda m: f'id="{p}{m.group(1)}"', s)
        s = re.sub(r'url\(#([^)]+)\)', lambda m: f'url(#{p}{m.group(1)})', s)
        out.append(f'<div class="v {cls}">{s.replace("<svg ", '<svg role="img" ', 1)}</div>')
    return f'<figure class="shot phone"><figcaption>{caption}</figcaption>{"".join(out)}</figure>'

SECTIONS = [
    ("liste", "1 · Раздел «Karteikarten»",
     "Сверху — «Heute lernen»: сколько карточек пора повторить сегодня (из всех стопок) и одна кнопка «Lernen». Ниже стопки по предметам: сколько карточек, сколько «fällig», "
     "полоска «Lernstand» (чем ярче, тем лучше выучено), бейдж теста. Раздел живёт в группе «Leistung» (рядом с Tests, Noten, Aufgaben) и в «Mehr»; можно вынести в нижнюю панель (часть 35). "
     "Пусто — «Noch keine Stapel» и кнопка.",
     [("handy-01-karteikarten", "Karteikarten"), ("handy-13-leer", "Noch keine Stapel")], []),
    ("stapel", "2 · Стопка",
     "Тест, к которому учим (нажатие открывает тест). «Lernstand» — 5 коробок по Leitner: новая карточка в «Neu», «Weiß ich» — в следующую коробку, «Weiß ich nicht» — обратно в «Neu». "
     "Чем дальше коробка, тем реже карточка «fällig» (1, 2, 4, 8, 16 дней). «Zuerst zeigen» — какую сторону показывать первой или вперемешку. "
     "«12 fällige lernen» — только те, что пора; «Alle 42 üben» — все подряд, без влияния на коробки. ⋮ — Bearbeiten, Teilen, Lernstand zurücksetzen, Löschen (с вопросом).",
     [("handy-02-stapel", "Stapel"), ("handy-14-menue", "Menü ⋮"), ("handy-15-loeschen", "Stapel löschen?")], []),
    ("lernen", "3 · Учить",
     "Одна карточка на экране, сверху «5 / 12» и полоска. «Umdrehen» — переворот (с анимацией, если «Animationen» включены). "
     "На обороте — обе стороны и две кнопки. В конце — «Geschafft!»: сколько знал / не знал, как сдвинулись коробки и когда следующая порция. "
     "«Die 3 nochmal» — сразу ещё раз только ошибки. Без конфетти (правило 13.11).",
     [("handy-03-lernen", "Vorderseite"), ("handy-04-umgedreht", "Umgedreht"), ("handy-05-geschafft", "Geschafft")], []),
    ("neu", "4 · Новая стопка и карточки",
     "Имя, предмет (то же поле, что везде, часть 19c), как называются стороны (по умолчанию «Vorderseite / Rückseite»), тест — по желанию. "
     "Карточки: «Liste» — вставить строки «Wort – Übersetzung» (разделитель «–», «-», «=», «;» или Tab); сразу видно, сколько карточек получилось и какая строка без разделителя. "
     "«Einzeln» и «+ Karte» в стопке — шторка: две строки и «Nächste Karte», чтобы вбивать подряд.",
     [("handy-06-neuer-stapel", "Neuer Stapel · Liste"), ("handy-07-karte-hinzufuegen", "Karte hinzufügen")], []),
    ("start", "5 · Start, Aufgaben, тест (43b)",
     "На «Start» — новый блок «Karteikarten» (сколько fällig и ближайший тест). В «Aufgaben» под «Heute» — строка на каждую стопку, где есть fällig: нажал — сразу учишь; "
     "всё повторил — строка исчезает сама. В шторке теста — карточка привязанной стопки с «Jetzt lernen» (или «Stapel wählen»).",
     [("handy-08-start", "Start"), ("handy-09-aufgaben", "Aufgaben"), ("handy-10-test", "Test mit Karteikarten")], []),
    ("teilen", "6 · Поделиться стопкой (43b)",
     "QR и ссылка — как «Teilen» и Sync. Карточки лежат прямо в ссылке (после «#»), поэтому на сервер ORBook они не попадают. "
     "Друг открывает ссылку → «Stapel übernehmen»: видит карточки, выбирает свой курс, «Übernehmen» — у него своя копия с нуля (без чужого Lernstand).",
     [("handy-11-teilen", "Stapel teilen"), ("handy-12-uebernehmen", "Stapel übernehmen")], []),
    ("pc", "7 · Компьютер",
     "Слева стопки, справа выбранная: тест, Lernstand, кнопки и все карточки. Учить — карточка по центру, обе кнопки под ней.",
     [], [("pc-01-karteikarten", "Computer · Karteikarten"), ("pc-02-lernen", "Computer · Lernen")]),
]

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
btns.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===v)));try{localStorage.setItem('orb43-theme',v)}catch(e){}}
let start='hell';try{start=localStorage.getItem('orb43-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dunkel':'hell')}catch(e){}
btns.forEach(b=>b.addEventListener('click',()=>show(b.dataset.v)));show(start);
"""

def page():
    out = ['<title>ORBook Karteikarten</title><meta name="claude:viewport-fit-sides" content="cover">',
           '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
           '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap">',
           f'<style>{CSS}</style><div class="wrap"><header><div><div class="eyebrow">Часть 43 · новые экраны ORBook Soft</div><h1>Karteikarten</h1></div>',
           '<div class="seg" role="group" aria-label="Тема макетов"><button data-v="hell">Hell</button><button data-v="dunkel">Dunkel</button><button data-v="beide">Beide</button></div></header>',
           '<p>Шапка и карточки — как Soft 13/19, шторка теста — Soft 14 и часть 41, строки задач — «Aufgaben» (25), блоки «Start» — часть 30, поле курса — 19c, QR — часть 16. Где тёмной темы нет, показана светлая.</p>',
           '<div id="shots">']
    for sid, h, text, phones, pcs in SECTIONS:
        out.append(f'<section id="{sid}"><h2>{h}</h2><p>{text}</p><div class="row">')
        out += [shot(nm, cap) for nm, cap in phones]
        out += [shot(nm, cap, "pc") for nm, cap in pcs]
        out.append('</div></section>')
    out.append('</div>')
    out.append('<section id="vergleich"><h2>Для сравнения · старые экраны Soft</h2><p>Похожие по смыслу экраны, с которых взяты шапка, карточки и шторка.</p><div class="row">'
               + soft("13 Klausuren", "Soft 13 · Klausuren") + soft("19 Statistik", "Soft 19 · Statistik") + soft("14 Klausur · Details (Blatt)", "Soft 14 · Klausur · Details") + '</div></section>')
    out.append('''<div class="box"><h2>Что я решил сам (можно поменять)</h2><ul style="margin:0;padding-left:20px">
<li>стопки и Lernstand — только на устройстве и через Sync (зашифровано, как Aufgaben); сервер про них не знает. В Datenschutz — одна строка;</li>
<li>коробки Leitner: 5 штук, «fällig» через 1 / 2 / 4 / 8 / 16 дней; «Weiß ich nicht» — обратно в первую;</li>
<li>«Alle üben» не двигает коробки — это просто прогон;</li>
<li>поделиться — карточки прямо в ссылке, без сервера; очень большая стопка (больше ~150 карточек) — только ссылкой, без QR;</li>
<li>учитель стопки классу не раздаёт (только ученик ученику ссылкой) — если нужно, это отдельная часть.</li>
</ul></div>''')
    out.append(f'</div><script>{JS}</script>')
    return "\n".join(out)

open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(page())
print("index.html", os.path.getsize(os.path.join(HERE, "index.html")) // 1024, "KB")
