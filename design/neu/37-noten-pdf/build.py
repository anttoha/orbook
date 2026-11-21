# Собирает index.html — страницу-обзор макетов части 37 со встроенными SVG (для артефакта «ок дизайн?»).
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
    kind = "a4" if name.startswith("a4") else kind
    return (f'<figure class="shot {kind}"><figcaption>{caption}</figcaption>'
            f'<div class="v v-hell">{inline(name + "-hell")}</div><div class="v v-dunkel">{inline(name + ("-dunkel" if os.path.exists(os.path.join(HERE, name + "-dunkel.svg")) else "-hell"))}</div></figure>')

SECTIONS = [
    ("knopf", "1 · Кнопка «PDF»",
     "В шапке «Noten» рядом с ↻ — новая круглая кнопка (лист со стрелкой вниз). Нажал — открывается окно печати: на сайте браузерное, в Android-приложении системное, там выбираешь «Als PDF speichern» (или принтер). "
     "В PDF попадает то, что выбрано сверху: 1. Halbjahr, 2. Halbjahr или Zeugnis. На «Fehlzeiten» такая же кнопка — лист только с пропусками. Пока оценок нет — кнопки нет.",
     [("handy-01-noten", "Noten · Knopf PDF"), ("handy-02-fehlzeiten", "Fehlzeiten · Knopf PDF"), ("handy-03-app-alt", "Alte Android-App")], []),
    ("auswahl", "1b · Своё или оригинал",
     "Кнопка «PDF» открывает шторку (как «Blatt drucken» из части 25). «ORBook-Blatt» — наш лист ниже. «Original · Übersicht» и «Original · Alle Noten» — настоящие страницы InfoPoint («Zusammenfassung» и «Detailansicht», с именем и учителями), напечатанные как есть: ORBook входит в InfoPoint твоим логином, забирает страницу и сразу открывает печать, ничего не сохраняя. "
     "Пока страница грузится — «Hole Original …». Неверный пароль — снова вход, InfoPoint не отвечает — тот же тост, что в «Noten».",
     [("handy-04-auswahl", "Als PDF · Auswahl"), ("handy-05-original-laden", "Hole Original")], []),
    ("blatt", "2 · Лист A4",
     "Бумага всегда белая, в любой теме. Шапка как у листов «Einladen» (часть 25): ORBook, класс и школа. Полугодие: итоги, все предметы с каждой оценкой (дата, ×2 у двойных) и Schnitt в тех же цветах, ниже — Fehlzeiten. "
     "Zeugnis: только Endnoten, которые выставила школа, по полугодиям («–» — ещё нет). Внизу строка, откуда данные и когда лист сделан. Не поместилось — продолжается на второй странице.",
     [], [("a4-01-halbjahr", "A4 · 1. Halbjahr"), ("a4-02-zeugnis", "A4 · Zeugnis"), ("a4-03-fehlzeiten", "A4 · Fehlzeiten")]),
    ("pc", "3 · Компьютер",
     "На ПК кнопка с подписью «Als PDF» — слева от выбора полугодия.",
     [], [("pc-01-noten", "Computer · Noten")]),
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
.a4{flex:0 1 380px}
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
btns.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===v)));try{localStorage.setItem('orb37-theme',v)}catch(e){}}
let start='hell';try{start=localStorage.getItem('orb37-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dunkel':'hell')}catch(e){}
btns.forEach(b=>b.addEventListener('click',()=>show(b.dataset.v)));show(start);
"""

def page():
    out = ['<title>ORBook Noten als PDF</title><meta name="claude:viewport-fit-sides" content="cover">',
           '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
           '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap">',
           f'<style>{CSS}</style><div class="wrap"><header><div><div class="eyebrow">Часть 37 · новые экраны ORBook Soft</div><h1>Noten als PDF</h1></div>',
           '<div class="seg" role="group" aria-label="Тема макетов"><button data-v="hell">Hell</button><button data-v="dunkel">Dunkel</button><button data-v="beide">Beide</button></div></header>',
           '<p>Экраны — из части 36, лист A4 — в стиле листов части 25. Где тёмной темы нет, показана светлая (лист A4 всегда светлый).</p>',
           '<div id="shots">']
    for sid, h, text, phones, pcs in SECTIONS:
        out.append(f'<section id="{sid}"><h2>{h}</h2><p>{text}</p><div class="row">')
        out += [shot(nm, cap) for nm, cap in phones]
        out += [shot(nm, cap, "pc") for nm, cap in pcs]
        out.append('</div></section>')
    out.append('</div>')
    out.append('''<div class="box"><h2>Что решил сам (можно поменять)</h2><ul style="margin:0;padding-left:20px">
<li>ORBook-лист печатает выбранную вкладку (полугодие / Zeugnis); оригинал — всегда весь документ InfoPoint, как он есть;</li>
<li>на листе нет имени и логина ученика (сервер имя не знает, а логин на бумаге не нужен) — только класс и школа;</li>
<li>строка «Schnitt: von ORBook … berechnet, keine Zeugnisnote» внизу листа — чтобы родители не приняли средний за оценку в Zeugnis;</li>
<li>лист собирается на устройстве из уже забранных оценок — на сервер ничего не уходит, Datenschutz не меняется;</li>
<li>старое Android-приложение печатать не умеет — тост «Für PDF bitte die App aktualisieren»; в новом APK — системное окно печати.</li>
</ul></div>''')
    out.append(f'</div><script>{JS}</script>')
    return "\n".join(out)

open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(page())
print("index.html", os.path.getsize(os.path.join(HERE, "index.html")) // 1024, "KB")
