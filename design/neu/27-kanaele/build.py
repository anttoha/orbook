# Собирает index.html — страницу-обзор макетов части 27 со встроенными SVG (для артефакта «ок дизайн?»).
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
    ("kanaele", "1 · Admin → Kanäle: что и когда шлёт ORBook",
     "Новый раздел админки (на ПК — пункт меню, на телефоне — из Einstellungen и «Übersicht → Schnell»). Сверху — подключён ли Telegram-канал и «Test senden». "
     "«Was wird gesendet»: новый план сразу (только изменения), «Für morgen» — тесты и домашки через N минут после последнего урока, новый тест (выключен). "
     "N меняется в шторке «Für morgen · wann?» (15/30/45/60/90, по умолчанию 30). Ниже — пример сообщения, WhatsApp и что уже отправлено.",
     [("handy-01-kanaele", "Kanäle · verbunden"), ("handy-05-wann", "Für morgen · wann?"), ("handy-07-test", "Test senden"),
      ("handy-11-einstellungen", "Admin → Einstellungen · новая строка")],
     [("pc-01-kanaele", "Computer · Admin → Kanäle")]),
    ("verbinden", "2 · Подключить Telegram",
     "Пока не подключено — большая карточка «Telegram verbinden». В шторке три шага: создать бота у @BotFather и вставить его токен; "
     "добавить бота админом в канал или группу класса; ORBook сам находит канал — остаётся нажать «Mit „9b Plan“ verbinden». Код в канал писать не надо.",
     [("handy-02-leer", "Ещё нет канала"), ("handy-03-verbinden", "Шаги · ждём Telegram"), ("handy-04-gefunden", "Канал найден")],
     [("pc-02-leer", "Computer · ещё нет канала"), ("pc-03-verbinden", "Computer · подключение")]),
    ("whatsapp", "3 · WhatsApp, ошибки, загрузка",
     "WhatsApp не даёт программам писать в группы (официальный API — только переписка компании с одним человеком, у каналов WhatsApp API нет). "
     "Поэтому «Nachricht teilen»: готовый текст, кнопка открывает WhatsApp, группу выбираешь сам. Если бота убрали из канала — красная карточка и «Neu verbinden». "
     "«Trennen» спрашивает подтверждение.",
     [("handy-06-teilen", "Nachricht teilen (WhatsApp)"), ("handy-08-fehler", "Не дошло"), ("handy-09-trennen", "Trennen?"), ("handy-10-laden", "Загрузка")], []),
]
OLD = [(("1 Handy Hell", "2 Handy Dunkel", "45 Admin · Einstellungen"), "Soft 45 · Admin · Einstellungen", "phone"),
       (("1 Handy Hell", "2 Handy Dunkel", "26 Mitteilungen"), "Soft 26 · Mitteilungen (образец строк)", "phone"),
       (("3 PC Hell", "4 PC Dunkel", "47 Admin · Einstellungen"), "Soft PC 47 · Admin · Einstellungen", "pc")]
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
btns.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===v)));try{localStorage.setItem('orb27-theme',v)}catch(e){}}
let start='hell';try{start=localStorage.getItem('orb27-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dunkel':'hell')}catch(e){}
btns.forEach(b=>b.addEventListener('click',()=>show(b.dataset.v)));show(start);
"""

def page():
    out = ['<title>ORBook Kanäle</title><meta name="claude:viewport-fit-sides" content="cover">',
           '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
           '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap">',
           f'<style>{CSS}</style><div class="wrap"><header><div><div class="eyebrow">Часть 27 · Kanäle + Für morgen</div><h1>Kanäle</h1></div>',
           '<div class="seg" role="group" aria-label="Тема макетов"><button id="t-hell" data-v="hell">Hell</button><button id="t-dunkel" data-v="dunkel">Dunkel</button><button id="t-beide" data-v="beide">Beide</button></div></header>',
           '<p>ORBook сам пишет в Telegram-канал класса: новый план с тем, что изменилось, и после уроков — тесты и домашки на завтра. '
           'Основа — Soft 45 «Admin · Einstellungen» и строки Soft 26. Всё нарисовано токенами Soft; в конце — старые экраны для сравнения.</p>',
           '<div id="shots">']
    for sid, h, text, phones, pcs in SECTIONS:
        out.append(f'<section id="{sid}"><h2>{h}</h2><p>{text}</p><div class="row">')
        out += [shot(nm, cap) for nm, cap in phones]
        out += [shot(nm, cap, "pc") for nm, cap in pcs]
        out.append('</div></section>')
    out.append('<section id="vergleich"><h2>Для сравнения: старые экраны Soft</h2><p>Какие экраны менялись.</p><div class="row">')
    out += [orig(pth, cap, kind) for pth, cap, kind in OLD]
    out.append('</div></section></div>')
    out.append('''<div class="box"><h2>Сообщения (примеры)</h2><ul>
<li><b>Neuer Plan</b> <span>«Neuer Plan für Donnerstag, 13.11. · 3 Änderungen: 2. Std Mathe – fällt aus; 4. Std Geschichte – Vertretung Roth, B12; 6. Std Sport – in Halle 2 · Alles ansehen: orbook.orbitium.net». Ничего не изменилось — ничего не шлём. Несколько изменений за минуты — одно сообщение.</span></li>
<li><b>Für morgen</b> <span>«Für morgen, Freitag 14.11. · Test: Mathe – Klassenarbeit · Aufgaben: Deutsch …, Englisch … · Erste Stunde: 07:30 Deutsch, Raum 102». Если на завтра нет ни тестов, ни домашек — только «Erste Stunde». Перед выходными — про понедельник, в пятницу.</span></li>
<li><b>Neuer Test eingetragen</b> <span>«Neu: Englisch – Test am Do 20.11.» (по умолчанию выключено).</span></li>
</ul></div>''')
    out.append('''<div class="box"><h2>Решено (ответы 12.11.)</h2><ul>
<li><b>Один общий бот</b> <span>@ORBookBot на сервер; у каждого класса — своя Telegram-группа. Токен бота владелец вводит один раз: <code>orbook telegram-token</code> (скрытый ввод).</span></li>
<li><b>Подключение</b> <span>ссылка t.me/ORBookBot?startgroup=КОД: выбираешь группу, бот добавляется, ORBook видит код и подключается сам.</span></li>
<li><b>В группе</b> <span>предметы, Kürzel, кабинеты, тесты и домашки, без имён учеников; группа закрытая.</span></li>
<li><b>Сообщения</b> <span>Neuer Plan и Für morgen включены, Neuer Test выключен, N = 30 минут.</span></li>
<li><b>WhatsApp</b> <span>«Nachricht teilen» в админке; ученикам — галочка «Aufgaben» в обычном «Teilen».</span></li>
</ul></div>''')
    out.append(f'</div><script>{JS}</script>')
    return "\n".join(out)

open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(page())
print("index.html", os.path.getsize(os.path.join(HERE, "index.html")) // 1024, "KB")
