# Собирает index.html — обзор макетов части 31 со встроенными SVG (для артефакта «ок дизайн?»).
import os, re

HERE = os.path.dirname(os.path.abspath(__file__))
SOFT = "/opt/orbook-be/design/ORBook Soft"
n = 0

def unique(s):
    """SVG без пересечения id: в одной странице много макетов с одинаковыми id фильтров и градиентов."""
    global n
    n += 1
    p = f"s{n}-"
    s = re.sub(r'id="([^"]+)"', lambda m: f'id="{p}{m.group(1)}"', s)
    s = re.sub(r'url\(#([^)]+)\)', lambda m: f'url(#{p}{m.group(1)})', s)
    return s.replace("<svg ", '<svg role="img" ', 1)

def inline(name):
    return unique(open(os.path.join(HERE, name + ".svg"), encoding="utf-8").read())

def shot(name, caption, kind="phone"):
    return (f'<figure class="shot {kind}"><figcaption>{caption}</figcaption>'
            f'<div class="v v-hell">{inline(name + "-hell")}</div><div class="v v-dunkel">{inline(name + "-dunkel")}</div></figure>')

def orig(path, caption, kind="phone"):
    out = []
    for folder, cls in ((path[0], "v-hell"), (path[1], "v-dunkel")):
        s = open(os.path.join(SOFT, folder, path[2] + ".svg"), encoding="utf-8").read()
        out.append(f'<div class="v {cls}">{unique(s)}</div>')
    return f'<figure class="shot {kind} old"><figcaption>{caption}</figcaption>{"".join(out)}</figure>'


SECTIONS = [
    ("widget", "1 · Виджет на рабочем столе",
     "Виджет ORBook — это те же блоки, что на «Start»: Jetzt, Heute, Woche, Tests, Aufgaben, Änderungen, Termine, Notizen, Countdown. "
     "Положить можно сколько угодно, любого размера (Android сам даёт растянуть). Нажатие открывает приложение на нужном месте: урок, день, тест. "
     "Справа сверху у широких — класс («9b»), если у тебя их несколько.",
     [("handy-01-startbildschirm", "Jetzt 4×2, Tests и Aufgaben 2×2, Heute 4×3"), ("handy-02-startbildschirm-gross", "Woche 4×4, Änderungen, Countdown")], []),
    ("zustaende", "2 · Состояния виджета",
     "Выходные и каникулы — что будет в первый учебный день. Нет интернета — последний сохранённый план и серое «Stand Mi 07:12». "
     "Не вошёл или доступ закончился — кнопка в приложение. Пока грузится — серые полоски.",
     [("handy-03-zustaende", "Wochenende · offline · nicht angemeldet · Zugang beendet · lädt")], []),
    ("einstellen", "3 · «Einstellen» — что показывать",
     "Открывается само, когда кладёшь виджет, и потом по долгому нажатию → «Einstellen». Сверху живое превью. "
     "Klasse (если их несколько), Inhalt — один из девяти, «Nur meine Kurse», Aussehen (как приложение / светлый / тёмный) и Hintergrund (плотный или полупрозрачный). "
     "«Heute» вечером сам переключается на завтра.",
     [("handy-04-widget-einstellen", "Widget einstellen")], []),
    ("app", "4 · Скачать APK",
     "В «Mehr» на Android-телефоне сверху карточка «ORBook für Android» (вместо «ORBook als App»; крестиком убирается) и строка «Android-App» в «Seiten». "
     "На странице — кнопка «APK herunterladen», три шага установки (Android спросит разрешение — это нормально для APK не из Google Play) и как добавить виджет. "
     "Кто не хочет APK — «Lieber als Web-App», как сейчас. На ПК вместо кнопки главное — QR-код: навёл телефоном и скачал.",
     [("handy-06-mehr", "Mehr · карточка и строка"), ("handy-05-android-app", "Android-App"), ("handy-09-fehler", "Ошибка загрузки")],
     [("pc-01-android-app", "ПК · Mehr → Android-App с QR")]),
    ("update", "5 · Внутри приложения: обновления и мои виджеты",
     "Без Google Play обновлять приходится самим: приложение раз в день спрашивает сервер, есть ли новая версия, и показывает окно с тем, что изменилось. "
     "«Aktualisieren» скачивает и ставит новый APK (Android попросит подтвердить). В «Android-App» внутри приложения — список виджетов на этом телефоне, каждый можно открыть и настроить.",
     [("handy-07-update", "Update ist da"), ("handy-08-update-laedt", "Загрузка"), ("handy-10-in-der-app", "Android-App в самом приложении")], []),
]
OLD = [(("1 Handy Hell", "2 Handy Dunkel", "22 Mehr"), "Soft 22 · Mehr", "phone")]

CSS = """
/* Раскладка: одна колонка разделов; в каждом — ряд телефонов, под ним экраны ПК во всю ширину. Цвета и шрифт — токены ORBook Soft. */
:root{--paper:#FBF7F2;--card:#FFFFFF;--ink:#2A2433;--muted:#6A6275;--faint:#978FA1;--accent:#6C4DF6;--on-accent:#FFFFFF;--accent-ink:#4A31C9;--tint:#EEE9FF;--sand:#F3EDE5;--rule:#EAE2D8;--stage:#F0EAE2;
--g1:#C9B8FF;--g2:#FFC2D4;--g3:#A9D4FF;--glass:rgba(255,255,255,.42);--glass-flat:rgba(255,255,255,.86);--glass-edge:rgba(255,255,255,.85);--glass-bg:#F3EEFB;--ma:#4C82EC;--danger:#D6455D;
--display:'Nunito',ui-rounded,system-ui,sans-serif}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--paper:#16131C;--card:#221E2A;--ink:#F4F0F8;--muted:#B5ACC1;--faint:#877E94;--accent:#A58BFF;--on-accent:#1A1333;--accent-ink:#CFC2FF;--tint:#2C2548;--sand:#2A2533;--rule:#352F40;--stage:#0F0D14;
--g1:#5B3FE0;--g2:#B03C82;--g3:#1E7FA8;--glass:rgba(255,255,255,.1);--glass-flat:rgba(48,42,66,.94);--glass-edge:rgba(255,255,255,.2);--glass-bg:#120F1C;--ma:#6191EE;--danger:#FF8AA0;color-scheme:dark}}
:root[data-theme="dark"]{--paper:#16131C;--card:#221E2A;--ink:#F4F0F8;--muted:#B5ACC1;--faint:#877E94;--accent:#A58BFF;--on-accent:#1A1333;--accent-ink:#CFC2FF;--tint:#2C2548;--sand:#2A2533;--rule:#352F40;--stage:#0F0D14;
--g1:#5B3FE0;--g2:#B03C82;--g3:#1E7FA8;--glass:rgba(255,255,255,.1);--glass-flat:rgba(48,42,66,.94);--glass-edge:rgba(255,255,255,.2);--glass-bg:#120F1C;--ma:#6191EE;--danger:#FF8AA0;color-scheme:dark}
body{background:var(--paper);color:var(--ink);font-family:var(--display);font-size:15px;line-height:1.55}
.wrap{max-width:1240px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:28px 64px}
header{display:flex;flex-wrap:wrap;gap:16px 24px;align-items:end;justify-content:space-between;margin-bottom:8px}
.eyebrow{font-size:12.5px;font-weight:800;color:var(--accent-ink);letter-spacing:.02em}
h1{font-size:clamp(28px,4vw,40px);font-weight:900;letter-spacing:-.015em;margin:2px 0 0;text-wrap:balance}
h2{font-size:22px;font-weight:900;letter-spacing:-.01em;margin:44px 0 6px;text-wrap:balance}
h3{font-size:14px;font-weight:800;margin:0 0 10px}
p{max-width:68ch;color:var(--muted);margin:0 0 14px}
.seg{display:inline-flex;background:var(--sand);border-radius:18px;padding:3px}
.seg button{font:800 12.5px var(--display);color:var(--muted);background:none;border:0;border-radius:15px;padding:8px 16px;cursor:pointer}
.seg button[aria-pressed="true"]{background:var(--card);color:var(--ink)}
.seg button:focus-visible,.play:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.row{display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start}
.shot{margin:0;background:var(--stage);border-radius:22px;padding:14px;min-width:0}
.shot figcaption{font-size:12.5px;font-weight:800;color:var(--faint);margin:0 4px 10px}
.shot svg{display:block;width:100%;height:auto;border-radius:14px}
.phone{flex:0 1 300px}
.pc{flex:1 1 100%}
.pc .v{overflow-x:auto}
.v-dunkel{display:none}
.old figcaption{color:var(--accent-ink)}
.show-dunkel .v-hell{display:none}.show-dunkel .v-dunkel{display:block}
.show-beide .v-dunkel{display:block;margin-top:12px}
.box{background:var(--card);border-radius:22px;padding:18px 22px;margin-top:44px;max-width:780px}
.box h2{margin-top:0}
.box ol,.box ul{margin:0;padding-left:20px;color:var(--ink)}.box li{margin:6px 0}
.box li span{color:var(--muted)}
"""

JS = """
const root=document.getElementById('shots');const btns=[...document.querySelectorAll('#themes button')];
function show(v){root.classList.remove('show-hell','show-dunkel','show-beide');root.classList.add('show-'+v);
btns.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===v)));try{localStorage.setItem('orb31-theme',v)}catch(e){}}
let start='hell';try{start=localStorage.getItem('orb31-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dunkel':'hell')}catch(e){}
btns.forEach(b=>b.addEventListener('click',()=>show(b.dataset.v)));show(start);
"""

def page():
    out = ['<title>ORBook Android-Widget</title><meta name="claude:viewport-fit-sides" content="cover">',
           '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
           '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap">',
           f'<style>{CSS}</style><div class="wrap"><header><div><div class="eyebrow">Часть 31 · Android-App и виджет</div><h1>Widget, APK, Updates</h1></div>',
           '<div class="seg" id="themes" role="group" aria-label="Тема макетов"><button id="t-hell" data-v="hell">Hell</button><button id="t-dunkel" data-v="dunkel">Dunkel</button><button id="t-beide" data-v="beide">Beide</button></div></header>',
           '<p>По твоим ответам 19.11.: Android — APK с сайта (без Google Play), iPhone и ПК остаются на PWA, виджет настраиваемый. '
           'Приложение внутри — тот же ORBook, что в браузере; виджет рисуется отдельно, в стиле Soft, и берёт данные с того же сервера.</p>',
           '<div id="shots">']
    for sid, h, text, phones, pcs in SECTIONS:
        out.append(f'<section id="{sid}"><h2>{h}</h2><p>{text}</p><div class="row">')
        out += [shot(nm, cap) for nm, cap in phones]
        out += [shot(nm, cap, "pc") for nm, cap in pcs]
        out.append('</div></section>')
    out.append('<section id="vergleich"><h2>Для сравнения: старый экран Soft</h2><div class="row">')
    out += [orig(pth, cap, kind) for pth, cap, kind in OLD]
    out.append('</div></section></div>')
    out.append("""<div class="box"><h2>План (коротко)</h2><ul>
<li><b>31a · Android-App</b> <span>обёртка Capacitor над нынешним сайтом (тот же код, без второго приложения), подпись APK, сборка в GitHub Actions при релизе, файл и версия на сайте, проверка обновлений.</span></li>
<li><b>31b · Виджет</b> <span>нативная часть на Kotlin (Jetpack Glance): блоки, размеры, «Einstellen», обновление раз в 15–30 минут и сразу при открытии приложения.</span></li>
<li><b>31c · Сайт</b> <span>карточка и страница «Android-App» в Mehr, QR на ПК, Datenschutz (что хранит виджет на телефоне), «Was ist neu».</span></li>
<li><b>Бэкенд</b> <span>небольшой: отдать APK и номер последней версии (<code>/api/public/info</code>).</span></li>
</ul></div>""")
    out.append(f'</div><script>{JS}</script>')
    return "\n".join(out)

open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(page())
print("index.html", os.path.getsize(os.path.join(HERE, "index.html")) // 1024, "KB")
