# Собирает index.html — страницу-обзор макетов части 14b со встроенными SVG (для артефакта «ок дизайн?»).
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

SECTIONS = [
    ("seite", "Раздел «Passwörter»", "Одна страница для обоих паролей. Сверху — пароль класса: ввести свой или нажать «Erzeugen», тогда сервер сам придумает надёжный пароль. Справа от заголовка — «Seit 10. Sept · vor 12 Tagen». Ниже — пароль админа: текущий и новый (мин. 12 знаков); другие устройства админа выйдут, это — нет. Поля с «глазом», чтобы проверить, что набрано.",
     [("handy-01-passwoerter", "Passwörter"), ("handy-06-laden", "Laden (Skeleton)")],
     [("pc-01-passwoerter", "Computer · Passwörter (новый пункт меню)")]),
    ("erzeugen", "Erzeugen: пароль показывается один раз", "Перед сменой — окно с вопросом: все устройства класса сразу выйдут. После «Erzeugen» — фиолетовая карточка, как у нового Editor-Code: пароль крупно, кнопка копирования, сколько устройств вышло. «Für die Klassengruppe kopieren» копирует готовый текст для чата класса. После «Fertig» пароль больше нигде не виден.",
     [("handy-02-erzeugen-fragen", "Erzeugen? (Frage)"), ("handy-03-erzeugt", "Neues Passwort · nur jetzt sichtbar")],
     [("pc-02-erzeugen-fragen", "Computer · Frage"), ("pc-03-erzeugt", "Computer · Neues Passwort")]),
    ("admin", "Пароль админа: ошибка и успех", "Неверный текущий пароль — красная рамка и «noch 4 Versuche» (сервер считает попытки, как при входе). Успех — тост внизу: «Admin-Passwort geändert · 1 Gerät abgemeldet».",
     [("handy-04-admin-falsch", "Aktuelles Passwort falsch"), ("handy-05-gespeichert", "Gespeichert (Toast)")],
     [("pc-04-admin-falsch", "Computer · falsch"), ("pc-05-gespeichert", "Computer · gespeichert")]),
    ("weg", "Как туда попасть", "Телефон: в «Einstellungen» вместо поля пароля — карточка «Passwörter» с двумя строками, в «Übersicht → Schnell» строка теперь называется «Passwörter». Компьютер: пункт меню «Passwörter» после «Lehrer-Codes», а в «Einstellungen» первая карточка ведёт туда же.",
     [("handy-07-einstellungen", "Einstellungen · Passwörter oben"), ("handy-08-uebersicht", "Übersicht · Schnell → Passwörter")],
     [("pc-06-einstellungen", "Computer · Einstellungen")]),
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
btns.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===v)));try{localStorage.setItem('orb14b-theme',v)}catch(e){}}
let start='hell';try{start=localStorage.getItem('orb14b-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dunkel':'hell')}catch(e){}
btns.forEach(b=>b.addEventListener('click',()=>show(b.dataset.v)));show(start);
"""

def page():
    out = ['<title>ORBook Passwörter</title><meta name="claude:viewport-fit-sides" content="cover">',
           '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
           '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap">',
           f'<style>{CSS}</style><div class="wrap"><header><div><div class="eyebrow">Часть 14b · новые экраны ORBook Soft</div><h1>Admin · Passwörter</h1></div>',
           '<div class="seg" role="group" aria-label="Тема макетов"><button data-v="hell">Hell</button><button data-v="dunkel">Dunkel</button><button data-v="beide">Beide</button></div></header>',
           '<p>Нарисовано поверх настоящих экранов Soft (40 Übersicht, 42 Neuer Code, 45/47 Einstellungen, 48 Fenster): шапка, поля, кнопки, меню — как там. Каждый экран в светлой и тёмной теме.</p>',
           '<div id="shots">']
    for sid, h, text, phones, pcs in SECTIONS:
        out.append(f'<section id="{sid}"><h2>{h}</h2><p>{text}</p><div class="row">')
        out += [shot(nm, cap) for nm, cap in phones]
        out += [shot(nm, cap, "pc") for nm, cap in pcs]
        out.append('</div></section>')
    out.append('</div>')
    out.append('''<div class="box"><h2>Решил сам (скажите, если не так)</h2><ul style="margin:0;padding-left:20px">
<li>заранее число устройств сервер не сообщает, поэтому в вопросе «alle Geräte», а точное число — после смены;</li>
<li>пароль класса — минимум 10 знаков, админа — 12 (так проверяет сервер);</li>
<li>карточка с паролем класса в «Einstellungen» заменена ссылкой: всё про пароли — в одном месте;</li>
<li>забытый пароль админа сбрасывается только на сервере (как сейчас), в приложении этого нет.</li>
</ul><p style="margin-top:12px">Ответ: «ок дизайн» или что поменять.</p></div>''')
    out.append(f'</div><script>{JS}</script>')
    return "\n".join(out)

open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(page())
print("index.html", os.path.getsize(os.path.join(HERE, "index.html")) // 1024, "KB")
