# Собирает index.html — страницу-обзор макетов части 24 со встроенными SVG (для артефакта «ок дизайн?»).
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
    ("menue", "1 · Меню урока: «Hausaufgabe geben» и «Test eintragen»",
     "Долгое нажатие на урок (на ПК — правый клик) — в меню два новых пункта, выделены фиолетовым. Дата, урок и предмет подставляются сами из нажатого урока. Если у тебя нет Editor-Code, пункты всё равно видны, но с замком и подсказкой «Editor-Code nötig» — нажатие ведёт на ввод кода. На ПК — клавиши H и T.",
     [("handy-01-menue", "Menü der Stunde"), ("handy-02-menue-ohne-code", "Ohne Editor-Code")], [("pc-01-menue", "Computer · Rechtsklick-Menü")]),
    ("stunde", "2 · Детали урока: всё, что задано на эту Stunde",
     "В шторке урока новый блок «Für diese Stunde»: тест и домашка именно на этот урок. Ниже две кнопки «+ Hausaufgabe» и «+ Test» — тот же путь, что из меню.",
     [("handy-03-stunde", "Stunde · Details")], []),
    ("test", "3 · Test eintragen: вид из списка админа, описание и материалы (часть 21)",
     "Вверху карточка «Für die Stunde» — к какому уроку запись (можно «Ändern»). «Art» — уже не Klausur/Test/Abgabe, а список из админки: Klassenarbeit, Leistungskontrolle, Test, Abgabe… Новое поле «Was lernen, was mitbringen» (до 300 знаков, без ссылок) и «Materialien» — прикрепить ссылки Drive/OneDrive этого предмета (из части 15) или сразу поделиться новой.",
     [("handy-04-test-eintragen", "Test eintragen"), ("handy-05-material-anhaengen", "Material anhängen")], [("pc-02-test-eintragen", "Computer · Test eintragen (Fenster)")]),
    ("hausaufgabe", "4 · Hausaufgabe из урока: «bis wann?» одной кнопкой",
     "Нажал на урок, где задали домашку, — ORBook сам предлагает «Nächste Mathe-Stunde» (Fr 19.09., 1. Stunde). Можно выбрать урок после неё или любую дату. Тоже с материалами.",
     [("handy-06-hausaufgabe", "Hausaufgabe geben")], []),
    ("verschoben", "5 · Урок выпал — тест переезжает сам",
     "Если урок с тестом «fällt aus», тест автоматически переезжает на следующий урок этого предмета. Видно, откуда: «VERSCHOBEN» и строка «von Mi 17.09., 3. Std – fiel aus»; в дне у выпавшего урока — куда уехал тест. Вкладка внизу называется «Tests» вместо «Klausuren».",
     [("handy-07-tag", "Tag · Liste"), ("handy-08-tests", "Tests"), ("handy-09-test-details", "Test · Details (verschoben)")], []),
    ("admin", "6 · Админка: «Arten von Tests»",
     "Админ сам ведёт список видов: имя, короткое Kürzel для недели (KA, LK, T…), порядок перетаскиванием. Удалить вид, у которого уже есть записи, — только указав, каким видом они станут. Там же два переключателя: переносить ли тесты и домашки при «fällt aus».",
     [("handy-10-admin-arten", "Admin · Arten von Tests"), ("handy-11-art-bearbeiten", "Art bearbeiten"), ("handy-12-art-loeschen", "Art löschen")],
     [("pc-03-admin-arten", "Computer · Admin · Arten von Tests")]),
]
OLD = [(("1 Handy Hell", "2 Handy Dunkel", "09 Stunde · Menü (lange drücken)"), "Soft 09 · Stunde · Menü (было)", "phone"),
       (("1 Handy Hell", "2 Handy Dunkel", "16 Klausur eintragen (Editor)"), "Soft 16 · Klausur eintragen (было)", "phone"),
       (("1 Handy Hell", "2 Handy Dunkel", "14 Klausur · Details (Blatt)"), "Soft 14 · Klausur · Details (было)", "phone"),
       (("3 PC Hell", "4 PC Dunkel", "17 Klausur eintragen (Fenster)"), "Soft PC 17 · Klausur eintragen (было)", "pc")]

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
btns.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===v)));try{localStorage.setItem('orb24-theme',v)}catch(e){}}
let start='hell';try{start=localStorage.getItem('orb24-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dunkel':'hell')}catch(e){}
btns.forEach(b=>b.addEventListener('click',()=>show(b.dataset.v)));show(start);
"""

def page():
    out = ['<title>ORBook Einträge zur Stunde</title><meta name="claude:viewport-fit-sides" content="cover">',
           '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
           '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap">',
           f'<style>{CSS}</style><div class="wrap"><header><div><div class="eyebrow">Часть 24 · записи на урок</div><h1>Einträge zur Stunde</h1></div>',
           '<div class="seg" role="group" aria-label="Тема макетов"><button data-v="hell">Hell</button><button data-v="dunkel">Dunkel</button><button data-v="beide">Beide</button></div></header>',
           '<p>Домашка и тест прямо на урок, понятные виды вместо «Klausur», автоматический перенос при «fällt aus», описание и материалы к записи. Всё — токены Soft; в конце — старые экраны для сравнения.</p>',
           '<div id="shots">']
    for sid, h, text, phones, pcs in SECTIONS:
        out.append(f'<section id="{sid}"><h2>{h}</h2><p>{text}</p><div class="row">')
        out += [shot(nm, cap) for nm, cap in phones]
        out += [shot(nm, cap, "pc") for nm, cap in pcs]
        out.append('</div></section>')
    out.append('<section id="vergleich"><h2>Для сравнения: старые экраны Soft</h2><p>Какие экраны менялись.</p><div class="row">')
    out += [orig(pth, cap, kind) for pth, cap, kind in OLD]
    out.append('</div></section></div>')
    out.append('''<div class="box"><h2>Что нужно решить</h2><ol>
<li><b>Название вкладки:</b> <span>«Tests» вместо «Klausuren» (коротко, влезает в нижнюю панель). Другой вариант — «Arbeiten».</span></li>
<li><b>Виды по умолчанию:</b> <span>Klassenarbeit (KA), Leistungskontrolle (LK), Test (T), Abgabe (AB). Старые записи «Klausur» станут «Klassenarbeit». Админ потом меняет как хочет.</span></li>
<li><b>Перенос:</b> <span>тест — на следующий урок того же предмета (по плану, а если плана ещё нет — по Muster). Домашку, привязанную к уроку, — тоже. Оба переключателя у админа, по умолчанию включены.</span></li>
<li><b>Без Editor-Code:</b> <span>пункты в меню видны с замком (чтобы все знали, что так можно), а не прячутся.</span></li>
</ol></div>''')
    out.append(f'</div><script>{JS}</script>')
    return "\n".join(out)

open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(page())
print("index.html", os.path.getsize(os.path.join(HERE, "index.html")) // 1024, "KB")
