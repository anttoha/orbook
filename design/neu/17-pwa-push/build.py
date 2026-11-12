# Собирает index.html — страницу-обзор макетов части 17 со встроенными SVG (для артефакта «ок дизайн?»).
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
    ("mitteilungen", "1 · Mitteilungen: что приходит и когда",
     "Mehr → «Mitteilungen». Сверху видно, включено ли на этом устройстве и когда пришло последнее уведомление; «Test senden» — проверить. "
     "Четыре пункта: план на завтра изменился, урок сегодня выпал, вечером в 18:00 — тесты и домашки на завтра, новый тест. "
     "«Für welche Kurse»: по моим курсам (как в «Meine Kurse») или по всему классу. «Ruhezeit» — ночью тихо.",
     [("handy-01-an", "Mitteilungen · an"), ("handy-06-ruhezeit", "Ruhezeit"), ("handy-07-test", "Test senden"), ("handy-08-fehler", "Нет сети")],
     [("pc-01-an", "Computer · Einstellungen → Mitteilungen")]),
    ("einschalten", "2 · Включить: разрешение браузера и iPhone",
     "Пока выключено — одна большая кнопка «Einschalten», браузер один раз спросит разрешение; ниже серым — что будет приходить. "
     "На iPhone уведомления работают только у установленного ORBook (так устроен iOS), поэтому там сначала «Erst zum Home-Bildschirm» "
     "и три шага. Если когда-то нажал «Nicht erlauben» — экран объясняет, где разрешить снова.",
     [("handy-02-aus", "Ещё выключено"), ("handy-03-iphone", "iPhone · сначала установить"), ("handy-04-iphone-anleitung", "Шаги для iPhone"),
      ("handy-05-blockiert", "Заблокировано в браузере")],
     [("pc-02-aus", "Computer · выключено + «Als App installieren»")]),
    ("app", "3 · ORBook как приложение и админка",
     "В Mehr сверху карточка «ORBook als App · Installieren», пока приложение не установлено (✕ — убрать). На Android и ПК откроется "
     "окно браузера, на iPhone — шаги. В админке: включить Mitteilungen для класса, время вечернего напоминания, сколько устройств "
     "подписано (только число) и что отправлялось.",
     [("handy-09-mehr", "Mehr · установить"), ("handy-10-admin", "Admin · Einstellungen")], []),
]
OLD = [(("1 Handy Hell", "2 Handy Dunkel", "26 Mitteilungen"), "Soft 26 · Mitteilungen (было)", "phone"),
       (("1 Handy Hell", "2 Handy Dunkel", "22 Mehr"), "Soft 22 · Mehr (было)", "phone"),
       (("3 PC Hell", "4 PC Dunkel", "26 Einstellungen · Mitteilungen"), "Soft PC 26 · Mitteilungen (было)", "pc")]
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
btns.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===v)));try{localStorage.setItem('orb17-theme',v)}catch(e){}}
let start='hell';try{start=localStorage.getItem('orb17-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dunkel':'hell')}catch(e){}
btns.forEach(b=>b.addEventListener('click',()=>show(b.dataset.v)));show(start);
"""

def page():
    out = ['<title>ORBook App und Mitteilungen</title><meta name="claude:viewport-fit-sides" content="cover">',
           '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
           '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap">',
           f'<style>{CSS}</style><div class="wrap"><header><div><div class="eyebrow">Часть 17 · PWA + Web Push</div><h1>App und Mitteilungen</h1></div>',
           '<div class="seg" role="group" aria-label="Тема макетов"><button id="t-hell" data-v="hell">Hell</button><button id="t-dunkel" data-v="dunkel">Dunkel</button><button id="t-beide" data-v="beide">Beide</button></div></header>',
           '<p>ORBook ставится как приложение, а важное приходит уведомлением, даже когда приложение закрыто. Основа — экран Soft 26 «Mitteilungen». '
           'Всё нарисовано токенами Soft; в конце — старые экраны для сравнения.</p>',
           '<div id="shots">']
    for sid, h, text, phones, pcs in SECTIONS:
        out.append(f'<section id="{sid}"><h2>{h}</h2><p>{text}</p><div class="row">')
        out += [shot(nm, cap) for nm, cap in phones]
        out += [shot(nm, cap, "pc") for nm, cap in pcs]
        out.append('</div></section>')
    out.append('<section id="vergleich"><h2>Для сравнения: старые экраны Soft</h2><p>Какие экраны менялись.</p><div class="row">')
    out += [orig(pth, cap, kind) for pth, cap, kind in OLD]
    out.append('</div></section></div>')
    out.append('''<div class="box"><h2>Тексты уведомлений (примеры)</h2><ul>
<li><b>Plan für morgen geändert</b> <span>«Morgen: 4. Std Geschichte → Vertretung, Raum B12»; несколько изменений — «Morgen: 3 Änderungen · Mathe, Englisch, Sport»</span></li>
<li><b>Stunde fällt heute aus</b> <span>«Heute fällt die 5. Std Physik aus» — только если урок ещё не начался</span></li>
<li><b>Erinnerung für morgen (18:00)</b> <span>«Morgen: Mathe-Test (KA) · 2 Hausaufgaben» — только если на завтра что-то есть</span></li>
<li><b>Neuer Test eingetragen</b> <span>«Neu: Englisch-Test am Do 20.11.»</span></li>
<li><b>Нажал на уведомление</b> <span>— открывается ORBook на нужном дне.</span></li>
</ul></div>''')
    out.append('''<div class="box"><h2>Что изменится на сервере</h2><ul>
<li><b>Подписки устройств.</b> <span>Для каждого устройства с включёнными Mitteilungen: адрес подписки браузера, выбранные пункты, Ruhezeit и (если «Meine Kurse») номера выбранных Wahl-курсов. Без имён и IP. Нет доставки 60 дней — запись удаляется.</span></li>
<li><b>Отправка.</b> <span>Новый план — сразу (то же событие, что «Live» из части 17); новый тест — сразу; вечером в 18:00 — напоминание. Одно и то же дважды не приходит.</span></li>
<li><b>Без новой библиотеки.</b> <span>Шифрование уведомлений — на уже установленном пакете cryptography.</span></li>
<li><b>Ключи.</b> <span>Пара ключей VAPID — отдельно для демо и прода; для прода — когда скажешь «на прод».</span></li>
</ul></div>''')
    out.append('''<div class="box"><h2>Что нужно решить</h2><ol>
<li><b>Ок дизайн?</b> <span>Что поменять.</span></li>
<li><b>Приватность.</b> <span>Чтобы уведомления шли только по своим курсам, сервер должен знать номера выбранных Wahl-курсов устройства (без имён). Ок? Иначе — только «Ganze Klasse».</span></li>
<li><b>Какие уведомления.</b> <span>Четыре пункта как на макете; сразу включены три, «Neuer Test» выключен. В 18:00 — тесты и домашки вместе. Добавить или убрать что-то?</span></li>
<li><b>План сервера.</b> <span>Ок на подписки и отправку, как описано выше?</span></li>
</ol></div>''')
    out.append(f'</div><script>{JS}</script>')
    return "\n".join(out)

open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(page())
print("index.html", os.path.getsize(os.path.join(HERE, "index.html")) // 1024, "KB")
