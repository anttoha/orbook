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
    ("liste", "Список кодов входа", "Как Editor-Codes: карточка на каждый код — название (без настоящих имён), «Gruppe» или «Persönlich», конец кода ••••-M4, сколько устройств вошло из скольких, срок и «zuletzt». Переключатель справа — включить/выключить. Старый общий пароль — последней строкой «Klassenpasswort · ALT»: его можно выключить, когда у всех будут коды. Сверху — сколько всего устройств вошло.",
     [("handy-01-liste", "Zugangscodes"), ("handy-07-leer", "Leer (nur Klassenpasswort)"), ("handy-08-laden", "Laden")],
     [("pc-01-liste", "Computer · Tabelle (пункт меню вместо «Passwörter»)"), ("pc-07-laden", "Computer · Laden")]),
    ("neu", "Новый код: показывается один раз", "Название, «Eine Person / Eine Gruppe», лимит устройств (1, 2, 30, Unbegrenzt), срок (по умолчанию Schuljahresende = 31. Juli). После «Code erstellen» — фиолетовая карточка ORB-Z-…, как у Editor-Code: потом виден только конец.",
     [("handy-02-neu", "Neuer Code"), ("handy-03-neu-fertig", "Code · nur jetzt sichtbar")],
     [("pc-02-neu", "Computer · Fenster"), ("pc-03-neu-fertig", "Computer · Code erstellt")]),
    ("aktionen", "Действия с кодом", "Три точки → шторка (телефон) или меню (ПК): переименовать, лимит, срок, «Geräte abmelden» (выкинуть устройства, код остаётся), «Neu erzeugen», «Sperren», «Löschen». Перед блокировкой — вопрос, сколько устройств выйдет; после — тост.",
     [("handy-04-aktionen", "Aktionen (Blatt)"), ("handy-05-sperren-fragen", "Sperren?"), ("handy-06-gesperrt", "Gesperrt · Toast")],
     [("pc-04-aktionen", "Computer · Menü"), ("pc-05-sperren-fragen", "Computer · Sperren?"), ("pc-06-gesperrt", "Computer · Toast")]),
    ("anmelden", "Вход ученика", "На экране входа одно поле: «Zugangscode oder Klassenpasswort» — пока старый пароль включён, работают оба. Если лимит устройств полон — понятная ошибка. Если код выключили или удалили — устройство выходит и видит «Du wurdest abgemeldet».",
     [("handy-09-anmelden", "Anmelden"), ("handy-10-limit-voll", "Limit voll"), ("handy-11-abgemeldet", "Abgemeldet")],
     [("pc-08-limit-voll", "Computer · Limit voll")]),
    ("weg", "Как туда попасть", "Телефон: Einstellungen → карточка «Zugang» (Zugangscodes · Admin-Passwort). ПК: пункт меню «Zugangscodes» на месте «Passwörter». Пароль админа остаётся на своей странице.",
     [("handy-12-einstellungen", "Einstellungen · Zugang")], []),
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
btns.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===v)));try{localStorage.setItem('orb14c-theme',v)}catch(e){}}
let start='hell';try{start=localStorage.getItem('orb14c-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dunkel':'hell')}catch(e){}
btns.forEach(b=>b.addEventListener('click',()=>show(b.dataset.v)));show(start);
"""

def page():
    out = ['<title>ORBook Zugangscodes</title><meta name="claude:viewport-fit-sides" content="cover">',
           '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
           '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap">',
           f'<style>{CSS}</style><div class="wrap"><header><div><div class="eyebrow">Часть 14c · новые экраны ORBook Soft</div><h1>Admin · Zugangscodes</h1></div>',
           '<div class="seg" role="group" aria-label="Тема макетов"><button data-v="hell">Hell</button><button data-v="dunkel">Dunkel</button><button data-v="beide">Beide</button></div></header>',
           '<p>Нарисовано поверх настоящих экранов Soft (41/43 Editor-Codes, 42/44 Neuer Code, 43/45 Code-Aktionen, 48 Fenster, 01/02 Zugang): шапка, поля, кнопки, меню — как там. Каждый экран в светлой и тёмной теме.</p>',
           '<div id="shots">']
    for sid, h, text, phones, pcs in SECTIONS:
        out.append(f'<section id="{sid}"><h2>{h}</h2><p>{text}</p><div class="row">')
        out += [shot(nm, cap) for nm, cap in phones]
        out += [shot(nm, cap, "pc") for nm, cap in pcs]
        out.append('</div></section>')
    out.append('</div>')
    out.append('''<div class="box"><h2>Решил сам (скажите, если не так)</h2><ul style="margin:0;padding-left:20px">
<li>код вида <code>ORB-Z-4KX9-T2</code> (Z = Zugang), хранится только хэш, полный код виден один раз;</li>
<li>лимит на выбор 1 / 2 / 30 / Unbegrenzt (для «Person» по умолчанию 2: телефон + ноутбук);</li>
<li>срок: 30 Tage / Halbjahr / Schuljahresende (по умолчанию); после срока код сам выключается и выкидывает устройства;</li>
<li>«Geräte abmelden» — выкинуть устройства, не выключая код (например, ученик сменил телефон и упёрся в лимит);</li>
<li>Klassenpasswort остаётся строкой «ALT», выключается переключателем; пароль админа — отдельная страница, как сейчас.</li>
</ul><p style="margin-top:12px">Ответ: «ок дизайн» или что поменять.</p></div>''')
    out.append(f'</div><script>{JS}</script>')
    return "\n".join(out)

open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(page())
print("index.html", os.path.getsize(os.path.join(HERE, "index.html")) // 1024, "KB")
