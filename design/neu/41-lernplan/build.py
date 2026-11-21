# Собирает index.html — страницу-обзор макетов части 41 со встроенными SVG (для артефакта «ок дизайн?»).
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
    ("test", "1 · Тест → «Lernplan erstellen»",
     "В шторке теста/Klausur под счётчиком дней — новая кнопка «Lernplan erstellen». Темы для плана берутся из «Was lernen, was mitbringen» (часть 24).",
     [("handy-01-test", "Test ohne Lernplan")], []),
    ("editor", "2 · Экран «Lernplan»",
     "Сколько дней учить: 1–7, но не больше, чем учебных дней до теста (тут 6, поэтому «7» бледная). Под кнопками — какие это дни. "
     "«Auch am Wochenende» — считать ли субботу и воскресенье. «Themen» — строки из описания теста (галочкой можно убрать) и свои через «Thema hinzufügen». "
     "«So lernst du» — сразу видно, как темы лягут по дням: план заканчивается накануне теста, последний день — «Alles wiederholen». "
     "Тем больше, чем дней, — на день по две; тем нет — каждый день «Physik lernen».",
     [("handy-02-lernplan", "Lernplan erstellen")], []),
    ("plan", "3 · План идёт",
     "В шторке теста вместо кнопки — карточка «Lernplan»: «2 von 4 erledigt», полоска и дни с кружками. Сегодня — фиолетовым, сделанное зачёркнуто. "
     "«Ändern» открывает тот же экран (там же «Lernplan löschen»).",
     [("handy-03-test-mit-plan", "Test mit Lernplan")], []),
    ("aufgaben", "4 · Aufgaben и Start",
     "Каждый день плана — задача в «Aufgaben» с подписью «Lernplan · Fach» (как «Eigene»). Галочка здесь и в шторке теста — одна и та же. "
     "Нажатие на строку открывает тест. На «Start» в блоке «Tests» под ближайшим тестом — полоска плана «2/4».",
     [("handy-04-aufgaben", "Aufgaben"), ("handy-05-start", "Start · Block Tests")], []),
    ("aenderung", "5 · Тест перенесли или удалили",
     "Перенесли — план сам сдвигается к новой дате (сделанное остаётся сделанным, несделанное раскладывается по новым дням), короткий тост. "
     "Удалили — один раз спрашиваем в «Aufgaben»: удалить план или оставить задачи. Удаление плана — всегда с вопросом.",
     [("handy-06-verschoben", "Verschoben"), ("handy-07-test-geloescht", "Test gelöscht"), ("handy-08-loeschen", "Lernplan löschen?")], []),
    ("pc", "6 · Компьютер",
     "Карточка «Lernplan» — в панели теста справа (как Soft PC 15). Экран плана — окно: слева настройки, справа «So lernst du».",
     [], [("pc-01-test-mit-plan", "Computer · Test mit Lernplan"), ("pc-02-lernplan", "Computer · Lernplan")]),
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
btns.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===v)));try{localStorage.setItem('orb41-theme',v)}catch(e){}}
let start='hell';try{start=localStorage.getItem('orb41-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dunkel':'hell')}catch(e){}
btns.forEach(b=>b.addEventListener('click',()=>show(b.dataset.v)));show(start);
"""

def page():
    out = ['<title>ORBook Lernplan</title><meta name="claude:viewport-fit-sides" content="cover">',
           '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
           '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap">',
           f'<style>{CSS}</style><div class="wrap"><header><div><div class="eyebrow">Часть 41 · новые экраны ORBook Soft</div><h1>Lernplan zum Test</h1></div>',
           '<div class="seg" role="group" aria-label="Тема макетов"><button data-v="hell">Hell</button><button data-v="dunkel">Dunkel</button><button data-v="beide">Beide</button></div></header>',
           '<p>Шторка теста — как Soft 14 и часть 24, строки задач — как «Aufgaben» (часть 25), блоки «Start» — часть 30, окно с вопросом — часть 40. Где тёмной темы нет, показана светлая.</p>',
           '<div id="shots">']
    for sid, h, text, phones, pcs in SECTIONS:
        out.append(f'<section id="{sid}"><h2>{h}</h2><p>{text}</p><div class="row">')
        out += [shot(nm, cap) for nm, cap in phones]
        out += [shot(nm, cap, "pc") for nm, cap in pcs]
        out.append('</div></section>')
    out.append('</div>')
    out.append('<section id="vergleich"><h2>Для сравнения · старые экраны Soft</h2><p>Похожие по смыслу экраны, с которых взяты шапка, карточки и шторка.</p><div class="row">'
               + soft("14 Klausur · Details (Blatt)", "Soft 14 · Klausur · Details") + soft("16 Klausur eintragen (Editor)", "Soft 16 · Klausur eintragen") + '</div></section>')
    out.append('''<div class="box"><h2>Что я решил сам (можно поменять)</h2><ul style="margin:0;padding-left:20px">
<li>план хранится только на устройстве и едет через Sync (как Aufgaben) — сервер про него ничего не знает, Datenschutz не меняется;</li>
<li>план кончается накануне теста; по умолчанию — 4 дня (или меньше, если до теста меньше), выходные не считаются;</li>
<li>задача плана = тема как она есть, последний день — «Alles wiederholen»;</li>
<li>прогресс — в шторке теста и в блоке «Tests» на «Start» (блок «Countdown» на «Start» считает дни до каникул, туда не лезем).</li>
</ul></div>''')
    out.append(f'</div><script>{JS}</script>')
    return "\n".join(out)

open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(page())
print("index.html", os.path.getsize(os.path.join(HERE, "index.html")) // 1024, "KB")
