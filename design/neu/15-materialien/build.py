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
    ("liste", "Список «Materialien»", "Открывается из «Mehr» (телефон) или из левого меню (компьютер). Ссылки сгруппированы по предметам, сверху фильтр по предмету. У каждой строки — плитка в цвете предмета (папка или файл), название, откуда ссылка и кто добавил. Нажатие сразу открывает Google Drive / OneDrive в новой вкладке (значок ↗ справа). Долгое нажатие (на ПК — правая кнопка или «⋯») открывает действия.",
     [("handy-01-materialien", "Materialien"), ("handy-02-aktionen", "Lange drücken → Aktionen")],
     [("pc-01-materialien", "Computer · Materialien (новый пункт меню)"), ("pc-02-menue", "Computer · Rechtsklick-Menü")]),
    ("neu", "Добавить ссылку", "Кнопка «+» / «Link teilen». Выбрать предмет (учитель видит только свои предметы из плана), вставить ссылку, написать название. Приложение само узнаёт, что это за ссылка («Erkannt: Google Drive · Ordner»). Ссылки других сайтов (Dropbox и т. п.) не принимаются — красная рамка и подсказка. Под полем всегда видно, какие сайты разрешены: «Erlaubt: Google Drive · OneDrive». Две подсказки: открыть доступ «Jeder mit dem Link» и не выкладывать файлы с именами и оценками.",
     [("handy-03-neu", "Neuer Link"), ("handy-04-link-falsch", "Link nicht erlaubt")],
     [("pc-03-neu", "Computer · Neuer Link (Fenster)"), ("pc-04-link-falsch", "Computer · Link nicht erlaubt")]),
    ("zustaende", "Сохранено, удаление, пусто, загрузка", "После сохранения — тост внизу и метка «NEU» у новой строки. Удаление — с вопросом: исчезает только ссылка, сами файлы в Drive не трогаем. Пустой список объясняет, что здесь будет и кто может добавлять. Загрузка — серые полоски (skeleton), как на других экранах.",
     [("handy-05-gespeichert", "Gespeichert (Toast)"), ("handy-06-loeschen", "Löschen?"), ("handy-07-leer", "Leer"), ("handy-08-laden", "Laden (Skeleton)")],
     [("pc-05-gespeichert", "Computer · Gespeichert"), ("pc-06-loeschen", "Computer · Löschen?"), ("pc-07-leer", "Computer · Leer")]),
    ("weg", "Где ещё видно", "Главное место в течение дня: в окне урока («Stunde · Details») под «Info» появляется блок «Materialien · Mathe» — ссылки этого предмета, «Alle» ведёт в полный список с фильтром. В «Mehr» — новая секция «Klasse» со строкой «Materialien · 6 Links». В админке у Editor-Codes и Lehrer-Codes новое право «Materialien teilen».",
     [("handy-09-stunde", "Stunde · Details + Materialien"), ("handy-10-mehr", "Mehr · Klasse → Materialien"), ("handy-11-code-recht", "Admin · neues Recht")],
     [("pc-08-stunde", "Computer · Stunde · Details + Materialien")]),
    ("seiten", "Разрешённые сайты видны на сайте", "Как вы просили: список разрешённых сайтов виден не только в форме, но и у админа в «Einstellungen» — новая карточка «Materialien»: Google Drive и OneDrive с меткой «ERLAUBT» и адресами, которые принимаются. Пока только просмотр; если позже захотите добавить другие сайты, переключатели появятся здесь.",
     [("handy-12-admin-seiten", "Admin · Einstellungen (Ausschnitt)")],
     [("pc-09-admin-seiten", "Computer · Admin · Einstellungen")]),
]
OLD = [(("1 Handy Hell", "2 Handy Dunkel", "07 Stunde · Details (Blatt)"), "Soft 07 · Stunde · Details", "phone"),
       (("1 Handy Hell", "2 Handy Dunkel", "22 Mehr"), "Soft 22 · Mehr", "phone"),
       (("1 Handy Hell", "2 Handy Dunkel", "43 Admin · Code-Aktionen (Blatt)"), "Soft 43 · Code-Aktionen", "phone"),
       (("3 PC Hell", "4 PC Dunkel", "14 Klausuren"), "Soft PC 14 · Klausuren", "pc")]

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
btns.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===v)));try{localStorage.setItem('orb15-theme',v)}catch(e){}}
let start='hell';try{start=localStorage.getItem('orb15-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dunkel':'hell')}catch(e){}
btns.forEach(b=>b.addEventListener('click',()=>show(b.dataset.v)));show(start);
"""

def page():
    out = ['<title>ORBook Materialien</title><meta name="claude:viewport-fit-sides" content="cover">',
           '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
           '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap">',
           f'<style>{CSS}</style><div class="wrap"><header><div><div class="eyebrow">Часть 15 · новые экраны ORBook Soft</div><h1>Materialien</h1></div>',
           '<div class="seg" role="group" aria-label="Тема макетов"><button data-v="hell">Hell</button><button data-v="dunkel">Dunkel</button><button data-v="beide">Beide</button></div></header>',
           '<p>Ссылки на Google Drive и OneDrive по предметам: рабочие листы, решения, папки класса. ORBook хранит только ссылку и название, сами файлы остаются в Drive. Нарисовано поверх настоящих экранов Soft (07, 22, 42, 43, PC 08, PC 14), каждый экран — в светлой и тёмной теме.</p>',
           '<div id="shots">']
    for sid, h, text, phones, pcs in SECTIONS:
        out.append(f'<section id="{sid}"><h2>{h}</h2><p>{text}</p><div class="row">')
        out += [shot(nm, cap) for nm, cap in phones]
        out += [shot(nm, cap, "pc") for nm, cap in pcs]
        out.append('</div></section>')
    out.append('<section id="vergleich"><h2>Для сравнения: старые экраны Soft</h2><p>Откуда взяты шторка, строки меню, список и левое меню.</p><div class="row">')
    out += [orig(pth, cap, kind) for pth, cap, kind in OLD]
    out.append('</div></section></div>')
    out.append('''<div class="box"><h2>Ваши ответы (учтены)</h2><ol>
<li><b>Добавляют:</b> <span>учителя (свои предметы), админ, Editor-Codes с правом «Materialien teilen».</span></li>
<li><b>Удаляют:</b> <span>автор, админ, учитель этого предмета.</span></li>
<li><b>Сайты:</b> <span>пока только Google Drive/Docs и OneDrive/SharePoint, список виден в форме и в настройках админа.</span></li>
</ol><h2 style="margin-top:20px">Решил сам (скажите, если не так)</h2><ul style="margin:0;padding-left:20px">
<li>файлы в ORBook не загружаются — только ссылка и название (до 80 знаков), без предпросмотра: так ни одна чужая страница не грузится в приложение;</li>
<li>ссылки живут, пока их не удалят (без автоудаления, как Klausuren);</li>
<li>раздел — в «Mehr» и в окне урока, а не новой вкладкой внизу: там уже 4 кнопки.</li>
</ul><p style="margin-top:12px">Ответ: «ок» или что поменять.</p></div>''')
    out.append(f'</div><script>{JS}</script>')
    return "\n".join(out)

open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(page())
print("index.html", os.path.getsize(os.path.join(HERE, "index.html")) // 1024, "KB")
