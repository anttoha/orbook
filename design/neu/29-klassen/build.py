# Собирает index.html — страницу-обзор макетов части 29 со встроенными SVG (для артефакта «ок дизайн?»).
import os, re

HERE = os.path.dirname(os.path.abspath(__file__))
SOFT = "/opt/orbook-be/design/ORBook Soft"
n = 0

def unique(s):
    """SVG без пересечения id: в одной странице много макетов, а у оригиналов одинаковые clipPath id."""
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
    """Старый экран Soft (светлая/тёмная) — для сравнения рядом с новыми."""
    out = []
    for folder, cls in ((path[0], "v-hell"), (path[1], "v-dunkel")):
        s = open(os.path.join(SOFT, folder, path[2] + ".svg"), encoding="utf-8").read()
        out.append(f'<div class="v {cls}">{unique(s)}</div>')
    return f'<figure class="shot {kind} old"><figcaption>{caption}</figcaption>{"".join(out)}</figure>'

SECTIONS = [
    ("start", "1 · Старт: «Meine Klassen»",
     "У каждого класса своя карточка: значок в цвете класса, имя (его видишь только ты), школа и «сегодня одной строкой» — клетка на урок. "
     "Зачёркнутая красная клетка — урок выпал, точка — замена. Ниже главное одной фразой и ближайший тест. "
     "Нажал на карточку — открылся план этого класса. Ползунки справа — настройки именно этого класса. На ПК в карточке виден ещё и весь день списком.",
     [("handy-01-klassen", "Два класса"), ("handy-06-drei-klassen", "Три класса, одна из другой школы · тост"), ("handy-11-laden", "Загрузка")],
     [("pc-01-klassen", "ПК · классы рядом, с уроками дня")]),
    ("neben", "2 · «Nebeneinander»: один день, классы колонками",
     "Вторая вкладка того же экрана: уроки по строкам, классы по колонкам (до трёх). Сверху дни недели. "
     "Это и есть «в одном окне план 9b и 5a».",
     [("handy-02-nebeneinander", "Среда · 9b и 5a")], []),
    ("add", "3 · Добавить класс",
     "Нужен только Zugangscode — он сам говорит приложению, какая это школа и какой класс. Можно отсканировать QR или открыть ссылку-приглашение. "
     "Потом — имя для себя и обычный выбор курсов. Неверный код — понятная ошибка.",
     [("handy-03-hinzufuegen", "Шторка"), ("handy-04-gefunden", "Класс найден"), ("handy-05-code-falsch", "Код неверный")], []),
    ("einstellen", "4 · Настройки класса и переключатель",
     "Ползунки на карточке открывают всё про один класс: имя, цвет, Meine Kurse, уведомления, Editor-Code, «открывать при запуске», убрать класс. "
     "В шапке недели, дня и тестов появился чип «9b ⌄»: одно нажатие — другой класс. Красная точка в списке — там сегодня изменения. "
     "Если код класса выключили, не работает только его карточка.",
     [("handy-07-klasse-einstellen", "Настройки класса"), ("handy-08-woche", "Чип класса в неделе"), ("handy-09-wechsler", "Переключатель"), ("handy-10-zugang-beendet", "Код выключен")],
     [("pc-02-wechsler", "ПК · переключатель рядом с логотипом")]),
    ("admin", "5 · Админка: школы, класс у каждого кода, лимит",
     "Новый раздел «Schulen & Klassen». Школу добавляешь только ты — теми же полями, что сейчас в «Schule & Plan»: Schulnummer, Passwort der Schule, Server, и сразу «Verbindung testen». "
     "Отдельного шага «создать класс» нет: в форме любого нового кода выбираешь школу и класс из её плана, и класс появляется вместе с первым кодом. "
     "Чип класса сверху решает, к какому классу относится остальная админка (коды, тесты, Muster, Kanäle). В Einstellungen — сколько классов можно на одном устройстве, по умолчанию без лимита.",
     [("handy-12-admin-klassen", "Schulen & Klassen"), ("handy-13-admin-schule-neu", "Школа: данные и проверка"), ("handy-14-admin-code-klasse", "Новый код: школа и класс"),
      ("handy-15-admin-klasse-waehlen", "Список классов из плана"), ("handy-16-admin-wechsler", "Чип класса в админке"), ("handy-17-admin-limit", "Лимит классов на устройстве")],
     [("pc-03-admin-klassen", "ПК · Schulen & Klassen"), ("pc-04-admin-schule-neu", "ПК · Schule hinzufügen")]),
    ("verwalten", "6 · Учитель и староста: «Klasse verwalten»",
     "У Lehrer-Code и Editor-Code появилась галочка «Klasse verwalten» (выключена, пока ты не включишь). С ней учитель или староста видят в Mehr пункт «Klasse verwalten» "
     "и сами создают и выключают Zugangscodes и приглашения — только своего класса. Школы, Muster, Kanäle и настройки остаются у тебя.",
     [("handy-18-recht-klasse-verwalten", "Галочка у кода"), ("handy-19-klasse-verwalten", "Что видит учитель или староста")], []),
]
OLD = [(("1 Handy Hell", "2 Handy Dunkel", "04 Woche"), "Soft 04 · Woche", "phone"), (("1 Handy Hell", "2 Handy Dunkel", "22 Mehr"), "Soft 22 · Mehr", "phone"),
       (("1 Handy Hell", "2 Handy Dunkel", "40 Admin · Übersicht"), "Soft 40 · Admin · Übersicht", "phone")]
CSS = """
/* Раскладка: одна колонка разделов; в каждом — ряд телефонов, под ним экраны ПК во всю ширину. Цвета и шрифт — токены ORBook Soft. */
:root{--paper:#FBF7F2;--card:#FFFFFF;--ink:#2A2433;--muted:#6A6275;--faint:#978FA1;--accent:#6C4DF6;--accent-ink:#4A31C9;--tint:#EEE9FF;--sand:#F3EDE5;--rule:#EAE2D8;--stage:#F0EAE2;
--display:'Nunito',ui-rounded,system-ui,sans-serif}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--paper:#16131C;--card:#221E2A;--ink:#F4F0F8;--muted:#B5ACC1;--faint:#877E94;--accent:#A58BFF;--accent-ink:#CFC2FF;--tint:#2C2548;--sand:#2A2533;--rule:#352F40;--stage:#0F0D14;color-scheme:dark}}
:root[data-theme="dark"]{--paper:#16131C;--card:#221E2A;--ink:#F4F0F8;--muted:#B5ACC1;--faint:#877E94;--accent:#A58BFF;--accent-ink:#CFC2FF;--tint:#2C2548;--sand:#2A2533;--rule:#352F40;--stage:#0F0D14;color-scheme:dark}
body{background:var(--paper);color:var(--ink);font-family:var(--display);font-size:15px;line-height:1.55}
.wrap{max-width:1240px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:28px 64px}
header{display:flex;flex-wrap:wrap;gap:16px 24px;align-items:end;justify-content:space-between;margin-bottom:8px}
.eyebrow{font-size:12.5px;font-weight:800;color:var(--accent-ink);letter-spacing:.02em}
h1{font-size:clamp(28px,4vw,40px);font-weight:900;letter-spacing:-.015em;margin:2px 0 0;text-wrap:balance}
h2{font-size:22px;font-weight:900;letter-spacing:-.01em;margin:44px 0 6px;text-wrap:balance}
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
const root=document.getElementById('shots');const btns=[...document.querySelectorAll('.seg button')];
function show(v){root.classList.remove('show-hell','show-dunkel','show-beide');root.classList.add('show-'+v);
btns.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===v)));try{localStorage.setItem('orb29-theme',v)}catch(e){}}
let start='hell';try{start=localStorage.getItem('orb29-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dunkel':'hell')}catch(e){}
btns.forEach(b=>b.addEventListener('click',()=>show(b.dataset.v)));show(start);
"""

def page():
    out = ['<title>ORBook Mehrere Klassen</title><meta name="claude:viewport-fit-sides" content="cover">',
           '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
           '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap">',
           f'<style>{CSS}</style><div class="wrap"><header><div><div class="eyebrow">Часть 29 · несколько классов и школ</div><h1>Meine Klassen</h1></div>',
           '<div class="seg" role="group" aria-label="Тема макетов"><button id="t-hell" data-v="hell">Hell</button><button id="t-dunkel" data-v="dunkel">Dunkel</button><button id="t-beide" data-v="beide">Beide</button></div></header>',
           '<p>На одном устройстве — несколько классов, в том числе из разных школ. Стартовый экран показывает их рядом, у каждого своя кнопка настроек. '
           'Если класс один, приложение выглядит как раньше. Основа — Soft 04 «Woche», 22 «Mehr», 40 «Admin · Übersicht» и экраны частей 14c, 22, 27.</p>',
           '<div id="shots">']
    for sid, h, text, phones, pcs in SECTIONS:
        out.append(f'<section id="{sid}"><h2>{h}</h2><p>{text}</p><div class="row">')
        out += [shot(nm, cap) for nm, cap in phones]
        out += [shot(nm, cap, "pc") for nm, cap in pcs]
        out.append('</div></section>')
    out.append('<section id="vergleich"><h2>Для сравнения: старые экраны Soft</h2><p>Откуда взяты шапка, карточки и меню.</p><div class="row">')
    out += [orig(pth, cap, kind) for pth, cap, kind in OLD]
    out.append('</div></section></div>')
    out.append("""<div class="box"><h2>Решено (твои ответы 13.11.)</h2><ul>
<li><b>Админ</b> <span>только ты. У класса — свои учитель и староста; с галочкой «Klasse verwalten» они сами ведут коды входа своего класса.</span></li>
<li><b>Школы</b> <span>добавляешь только ты: Schulnummer, Passwort der Schule, Server. Класс выбирается у каждого кода и появляется с первым кодом.</span></li>
<li><b>Klassenpasswort</b> <span>остаётся только у Petrischule 8a, все остальные входы — по кодам.</span></li>
<li><b>Sync-Code</b> <span>переносит имена, цвета и курсы классов, но не коды входа.</span></li>
<li><b>Лимитов нет</b> <span>сколько классов можно на устройстве, задаёшь в Admin → Einstellungen.</span></li>
</ul></div>""")
    out.append("""<div class="box"><h2>План бэкенда (коротко)</h2><ul>
<li><b>Школы и классы в базе</b> <span>новые таблицы; нынешняя школа и класс становятся № 1, для тех, кто уже пользуется, ничего не меняется.</span></li>
<li><b>Всё по классам</b> <span>коды, тесты, домашки, материалы, термины, уведомления, Muster, каналы и настройки получают метку класса.</span></li>
<li><b>Одно устройство — несколько классов</b> <span>вход ещё одним кодом добавляет класс, а не заменяет. Имён по-прежнему нет.</span></li>
<li><b>План школы скачивается один раз</b> <span>и разбирается для всех её классов — нагрузка на сайт школы не растёт.</span></li>
<li><b>Старое приложение на проде продолжает работать</b> <span>пока не выйдет новое.</span></li>
<li><b>Порядок</b> <span>29a бэкенд → 29b «Meine Klassen» → 29c «Nebeneinander» и админка → 29d уведомления, Telegram, Sync, Datenschutz. Каждая — отдельный чат. Подробно: docs/specs/29-klassen/spec.md.</span></li>
</ul></div>""")
    out.append(f'</div><script>{JS}</script>')
    return "\n".join(out)

open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(page())
print("index.html", os.path.getsize(os.path.join(HERE, "index.html")) // 1024, "KB")
