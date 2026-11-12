# Собирает index.html — страницу-обзор макетов части 19b со встроенными SVG (для артефакта «ок дизайн?»).
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
    ("mehr", "1 · Mehr: «Seiten» und «Einstellungen» getrennt, Statistik zieht um", "В «Mehr» теперь два чётких блока: «Seiten» (Statistik, Datenschutz — просто страницы) и «Einstellungen» (всё, что настраивается). Statistik уходит из нижней панели: там остаются Woche · Klausuren · Mehr. Внутри Statistik — кнопка «назад» и строка «Mehr» над заголовком, как у остальных подстраниц. На ПК кнопка слева внизу называется «Mehr», у левого меню те же два раздела.",
     [("handy-01-mehr", "Mehr"), ("handy-02-statistik", "Statistik (unter Mehr)")], [("pc-01-mehr", "Computer · Mehr · Übersicht")]),
    ("darstellung", "2 · Darstellung: Änderung unter dem Tag", "Новая карточка «Änderung unter dem Tag». Три формата: «Mi 15:15» (как сейчас), «15.09.» (твой вариант) и «15.09. 15:15». Сами подписи сегмента — уже пример, а ниже живое превью недели меняется сразу. В тот же день всегда только время («07:08»), поэтому у «Mi 17» везде одно и то же.",
     [("handy-03-darstellung", "Darstellung · «15.09.» gewählt"), ("handy-04-darstellung-datum-zeit", "Darstellung · «15.09. 15:15»")], [("pc-02-darstellung", "Computer · Darstellung")]),
    ("alle", "3 · Mein Plan / Alle Kurse", "Без плашки. В неделе — пункт «Alle Kurse zeigen» с переключателем в меню ⋮ (шапка не растёт, на узких экранах ничего не налезает); когда включено, на ⋮ горит фиолетовая точка и под сеткой стоит подсказка. В дне — круглая кнопка со значком стопки справа от «Liste / Zeitleiste» (там места хватает): белая — мои курсы, фиолетовая — все. Подсказка-легенда «Gestrichelt …» появляется только когда включено. Чужие курсы — пунктиром и серым, с пометкой «nicht dein Kurs»; параллельные курсы в одной клетке делят её пополам. Выбор запоминается. На ПК — кнопка с текстом «Alle Kurse» в шапке недели, список дня справа показывает то же.",
     [("handy-05-woche-mein-plan", "Woche · nur meine Kurse"), ("handy-06-woche-alle-kurse", "Woche · Alle Kurse an (Punkt am ⋮)"), ("handy-09-woche-menue", "Woche · Menü ⋮"), ("handy-07-tag-alle-kurse", "Tag · Alle Kurse")], [("pc-03-woche-alle-kurse", "Computer · Woche · Taste an (Alle Kurse)")]),
    ("sport", "4 · Sport Mädchen / Sport Jungen", "Sport различается в названии: «Sport · Mädchen» (в клетке недели «SpMä») и «Sport · Jungen» («SpJu»). Если выбраны обе группы — показываются обе. В «Meine Kurse» это два отдельных переключателя.",
     [("handy-08-meine-kurse", "Meine Kurse · Sport")], []),
]
OLD = [(("1 Handy Hell", "2 Handy Dunkel", "22 Mehr"), "Soft 22 · Mehr (было)", "phone"),
       (("1 Handy Hell", "2 Handy Dunkel", "24 Darstellung"), "Soft 24 · Darstellung (было)", "phone"),
       (("1 Handy Hell", "2 Handy Dunkel", "04 Woche"), "Soft 04 · Woche (было)", "phone"),
       (("1 Handy Hell", "2 Handy Dunkel", "05 Tag · Liste"), "Soft 05 · Tag · Liste (было)", "phone"),
       (("3 PC Hell", "4 PC Dunkel", "22 Einstellungen · Übersicht"), "Soft PC 22 · Einstellungen (было)", "pc")]

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
btns.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===v)));try{localStorage.setItem('orb22-theme',v)}catch(e){}}
let start='hell';try{start=localStorage.getItem('orb22-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dunkel':'hell')}catch(e){}
btns.forEach(b=>b.addEventListener('click',()=>show(b.dataset.v)));show(start);
"""

def page():
    out = ['<title>ORBook Kleinigkeiten</title><meta name="claude:viewport-fit-sides" content="cover">',
           '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
           '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap">',
           f'<style>{CSS}</style><div class="wrap"><header><div><div class="eyebrow">Часть 22 · мелочи одной пачкой</div><h1>Kleinigkeiten</h1></div>',
           '<div class="seg" role="group" aria-label="Тема макетов"><button data-v="hell">Hell</button><button data-v="dunkel">Dunkel</button><button data-v="beide">Beide</button></div></header>',
           '<p>Четыре небольшие правки, один лист. Всё нарисовано теми же токенами Soft; ниже, в конце, — старые экраны для сравнения.</p>',
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
<li><b>Формат даты по умолчанию:</b> <span>«Mi 15:15» (как сейчас) или «15.09.»? Я поставил «Mi 15:15», ты меняешь в Darstellung.</span></li>
<li><b>«Alle Kurse»:</b> <span>запоминается на устройстве; в Info zum Tag и в списках Klausuren ничего не меняется.</span></li>
<li><b>ПК:</b> <span>кнопка «Einstellungen» слева внизу переименована в «Mehr» — чтобы было как на телефоне.</span></li>
</ol></div>''')
    out.append(f'</div><script>{JS}</script>')
    return "\n".join(out)

open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(page())
print("index.html", os.path.getsize(os.path.join(HERE, "index.html")) // 1024, "KB")
