# Макеты части 40 «Kalender-Abo» (webcal):
#   • Mehr → Kalender-Abo: одна ссылка, по которой план (свои курсы, Ausfall/Vertretung), тесты и Termine
#     сами появляются в Google / Apple / Outlook Kalender и обновляются;
#   • ещё нет ссылки — пример, как это выглядит в календаре, и «Abo erstellen»;
#   • есть ссылка — «Zum Kalender» (шторка: какой календарь), «Kopieren», что в ленте, для каких курсов,
#     «Link erneuern» и «Abo löschen» (с вопросом);
#   • ПК: настройки слева, справа QR — отсканировать телефоном и добавить там.
# Кирпичики: часть 17 (шапка, переключатели, «Für welche Kurse», ПК-рамка «Mehr») и часть 16 (QR, строки, диалог).
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else HERE

def _load(name, folder):
    sp = importlib.util.spec_from_file_location(name, os.path.join(HERE, "..", folder, "gen.py"))
    mod = importlib.util.module_from_spec(sp); sp.loader.exec_module(mod)
    return mod

m17 = _load("g17", "17-pwa-push")
m16 = _load("g16", "16-einladen")
g, m15, m22 = m17.g, m17.m15, m17.m22
T, R, ICON, P, label, eyebrow, title, button, switch, segmented = (
    g.T, g.R, g.ICON, g.P, g.label, g.eyebrow, g.title, g.button, g.switch, g.segmented)
CHECK, CHEV_R, CLOSE, COPY, TRASH = g.CHECK, g.CHEV_R, g.CLOSE, g.COPY, g.TRASH
head, hero, pref_card, courses_block, wide_button, HLINE = m17.head, m17.hero, m17.pref_card, m17.courses_block, m17.wide_button, m17.HLINE
toast, sheet_bg, overlay, svg = m15.toast, m15.sheet_bg, g.overlay, g.svg
qr, rows_card, hair, REDO, WARN, LINK = m16.qr, m16.rows_card, m16.hair, m16.REDO, m16.WARN, m16.LINK
page = m22.page

# ── Иконки (контур 24×24, как lucide) ──
CAL = '<rect x="3" y="5" width="18" height="16" rx="3"/>' + P("M8 3v4M16 3v4M3 10h18")
CAL_PLUS = '<rect x="3" y="5" width="18" height="16" rx="3"/>' + P("M8 3v4M16 3v4M3 10h18M12 13.5v5M9.5 16h5")
CAL_SYNC = '<rect x="3" y="5" width="18" height="16" rx="3"/>' + P("M8 3v4M16 3v4M3 10h18") + P("M8.5 15.5a3.5 3.5 0 0 1 6.2-2.2M15.5 12v2h-2M15.5 16a3.5 3.5 0 0 1-6.2 1.7")
APPLE_DEV = '<rect x="6" y="2.5" width="12" height="19" rx="2.5"/>' + P("M11 18.5h2")   # «iPhone, iPad, Mac» — просто телефон
GLOBE = '<circle cx="12" cy="12" r="9"/>' + P("M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18")
MAIL = '<rect x="3" y="5" width="18" height="14" rx="3"/>' + P("M3.5 7l8.5 6 8.5-6")

# Что попадает в ленту (заголовок, подпись, вкл.)
FEED = [("Stunden", "Mit Raum, Ausfall und Vertretung", True),
        ("Tests und Klausuren", "Ganztägig am Tag des Tests", True),
        ("Termine", "Ausflüge, Elternabend, Ferien", True)]
LINK_TXT = "webcal://orbook.orbitium.net/…/7QX2M9PA.ics"

# ── «So sieht es aus»: день в чужом календаре (Google/Apple), куда пришла лента ──
def cal_preview(x, y, w, c, sub, compact=False):
    """Песочная карточка: заголовок дня, ganztägig «Test Mathe», три урока — обычный, Vertretung, Ausfall."""
    h = 214 if not compact else 196
    out = [R(x, y, w, h, 22, c["sand"])]
    out.append(T(x + 16, y + 28, "Do, 18. September", 13, 800, c["ink"]) + T(x + w - 16, y + 28, "ORBook · 9b", 12, 700, c["faint"], "end"))
    # ganztägig
    solid, tint, txt = sub["Ma"]
    out.append(R(x + 16, y + 42, w - 32, 28, 9, solid) + T(x + 28, y + 61, "Test Mathe · 2. Stunde", 12.5, 800, c["on"]))
    rows = [("07:30", "De", "Deutsch", "Raum 102", None),
            ("08:20", "Ma", "Mathe → Raum B12", "Vertretung · Kle statt Mü", "vertretung"),
            ("09:25", "En", "Englisch fällt aus", "", "ausfall")]
    ry = y + 82
    for t, code, name, place, kind in rows:
        solid, tint, txt = sub[code]
        out.append(T(x + 16, ry + 22, t, 12, 700, c["faint"]))
        bx, bw = x + 62, w - 78
        if kind == "ausfall":
            out.append(R(bx, ry + 4, bw, 32, 10, c["card"]) + R(bx, ry + 4, 4, 32, 2, c["faint2"])
                       + T(bx + 14, ry + 25, name, 12.5, 700, c["faint"]))
            out.append(f'<line x1="{bx + 14}" y1="{ry + 21}" x2="{bx + 14 + g.tw(name, 12.5, 700) * 0.82:.1f}" y2="{ry + 21}" stroke="{c["faint"]}" stroke-width="1.3"/>')
        else:
            out.append(R(bx, ry + 4, bw, 32, 10, tint) + R(bx, ry + 4, 4, 32, 2, solid)
                       + T(bx + 14, ry + 19, name, 12.5, 800, txt) + T(bx + 14, ry + 32, place, 10.5, 600, txt))
        ry += 40
    return "".join(out), h

def status_card(x, y, w, c, when="heute 06:40"):
    """Зелёная карточка «Abo aktiv» + когда календарь последний раз забирал ленту (видно, что всё работает)."""
    return (R(x, y, w, 64, 20, c["oktint"]) + f'<circle cx="{x + 30}" cy="{y + 32}" r="16" fill="{c["card"]}"/>' + ICON(x + 21, y + 23, 0.75, c["ok"], CAL_SYNC, 2)
            + T(x + 56, y + 28, "Abo aktiv", 14.5, 800, c["ok"]) + T(x + 56, y + 47, f"Vom Kalender abgerufen: {when}", 12, 400, c["muted"]))

def actions(x, y, w, c):
    bw = (w - 8) / 2
    return button(x, y, bw + 30, "Zum Kalender", c, icon=CAL_PLUS) + button(x + bw + 38, y, bw - 30, "Kopieren", c, "sand", COPY)

def settings(x, y, w, c, dim=False):
    """«Im Kalender» + «Für welche Kurse»: одинаково до и после создания."""
    b = [label(x, y, "Im Kalender", c)]
    card, ch = pref_card(x, y + 14, w, c, FEED, dim=dim); b.append(card)
    y += 14 + ch + 34
    cb, chh = courses_block(x, y, w, c); b.append(cb)
    return "".join(b), y + chh

def danger_rows(x, y, w, c):
    return rows_card(x, y, w, c, [(REDO, "Link erneuern", "alter geht aus", None), (TRASH, "Abo löschen", "", "danger")])

# ════════════════ 01 · Ещё нет ссылки ════════════════
def p_leer(c, theme, sub):
    b = [head(c, "Kalender-Abo")]
    x, y, w = 18, 92, 354
    pv, ph = cal_preview(x, y, w, c, sub); b.append(pv); y += ph + 22
    b.append(T(x, y + 6, "Plan im eigenen Kalender", 18, 900, c["ink"]))
    b.append(T(x, y + 30, "Stunden, Tests und Termine landen in Google,", 13.5, 400, c["muted"]))
    b.append(T(x, y + 49, "Apple oder Outlook und bleiben aktuell.", 13.5, 400, c["muted"]))
    y += 92
    s, y = settings(x, y, w, c); b.append(s)
    b.append(button(x, y + 22, w, "Abo erstellen", c, icon=CAL_PLUS))
    return page(390, max(844, round(y + 22 + 48 + 40)), c, "".join(b))

# ════════════════ 02 · Есть ссылка ════════════════
def body_aktiv(c, x=18, y=92, w=354):
    b = [status_card(x, y, w, c), actions(x, y + 80, w, c)]
    y += 80 + 48 + 34
    s, y = settings(x, y, w, c); b.append(s)
    y += 22
    b.append(danger_rows(x, y, w, c))
    return "".join(b), y + 100

def p_aktiv(c, theme, sub, extra=""):
    body, end = body_aktiv(c)
    return page(390, 844, c, head(c, "Kalender-Abo") + body + extra)

def p_kopiert(c, theme, sub):
    return p_aktiv(c, theme, sub, toast(18, 770, 354, "Link kopiert", c))

# ════════════════ 03 · Шторка «In welchen Kalender?» ════════════════
TARGETS = [(CAL, "Google Kalender", "Aktualisiert alle paar Stunden"),
           (APPLE_DEV, "Apple Kalender", "iPhone, iPad und Mac"),
           (MAIL, "Outlook", "Outlook.com und Microsoft 365"),
           (COPY, "Anderer Kalender", "Link kopieren und dort einfügen")]

def target_list(x, y, w, c, rh=68):
    out = [R(x, y, w, rh * len(TARGETS), 22, c["card"])]
    for i, (ic, name, s) in enumerate(TARGETS):
        ry = y + i * rh
        if i: out.append(hair(x + 14, x + w - 14, ry, c))
        out.append(f'<circle cx="{x + 34}" cy="{ry + rh / 2}" r="20" fill="{c["tint"]}"/>' + ICON(x + 25, ry + rh / 2 - 9, 0.75, c["accink"], ic, 2)
                   + T(x + 68, ry + rh / 2 - 2, name, 15, 700, c["ink"]) + T(x + 68, ry + rh / 2 + 17, s, 12, 400, c["faint"])
                   + ICON(x + w - 28, ry + rh / 2 - 7, 0.58, c["faint"], CHEV_R))
    return "".join(out), rh * len(TARGETS)

def p_wahl(c, theme, sub):
    body, _ = body_aktiv(c)
    top = 844 - 32 - 112 - 68 * 4
    b = [head(c, "Kalender-Abo"), body, sheet_bg(c, top),
         eyebrow(18, top + 41, "Kalender-Abo", c), title(18, top + 70, "In welchen Kalender?", c, 26),
         R(338, top + 42, 34, 34, 17, c["card"]) + ICON(346.5, top + 50.5, 0.71, c["ink"], CLOSE)]
    tl, _ = target_list(18, top + 92, 354, c); b.append(tl)
    return page(390, 844, c, "".join(b))

# ════════════════ 04/05 · Диалоги ════════════════
def dialog(c, x, y, w, icon, ttl, lines, ok, ok_icon, danger=False, pc=False):
    """Окно как в части 16 / Soft 17: значок, заголовок, текст, черта, две кнопки справа."""
    h = 200 + len(lines) * 21
    b = [R(x, y, w, h, 28, c["paper"], extra=' filter="url(#nsh0)"'), R(x, y, w, h, 28, c["paper"])]
    b.append(ICON(x + 26, y + 26, 0.83, c["danger"] if danger else c["accink"], icon))
    b.append(R(x + w - 52, y + 22, 30, 30, 15, c["card"]) + ICON(x + w - 44.5, y + 29.5, 0.62, c["ink"], CLOSE))
    b.append(T(x + 26, y + 80, ttl, 25 if pc else 22, 900, c["ink"], ls=-0.35))
    for i, ln in enumerate(lines):
        b.append(T(x + 26, y + 112 + i * 21, ln, 14, 400, c["muted"]))
    ly = y + h - 78
    b.append(hair(x + 26, x + w - 26, ly, c))
    b.append(button(x + w - 26 - 136 - 8 - 112, ly + 14, 112, "Abbrechen", c, "sand", None))
    b.append(button(x + w - 26 - 136, ly + 14, 136, ok, c, "danger" if danger else "primary", ok_icon))
    return "".join(b)

ERNEUERN = (REDO, "Link erneuern?", ["Der alte Link geht dann nicht mehr.", "Im Kalender musst du das Abo", "neu hinzufügen."], "Erneuern", REDO, False)
LOESCHEN = (TRASH, "Abo löschen?", ["Der Link geht dann nicht mehr.", "Das Abo im Kalender entfernst", "du dort selbst."], "Löschen", TRASH, True)

def p_dialog(c, theme, sub, which):
    body, _ = body_aktiv(c)
    return page(390, 844, c, head(c, "Kalender-Abo") + body + overlay(c, 390, 844) + dialog(c, 18, 280, 354, *which))

# ════════════════ 06 · Загрузка ════════════════
def p_laden(c, theme, sub):
    b = [head(c, "Kalender-Abo")]
    x, w = 18, 354
    b.append(R(x, 92, w, 64, 20, c["card"]) + f'<circle cx="{x + 30}" cy="124" r="16" fill="{c["skel"]}"/>'
             + R(x + 56, 110, 110, 12, 6, c["skel"]) + R(x + 56, 132, 190, 10, 5, c["skel"]))
    b.append(f'<g opacity="0.4">{actions(x, 172, w, c)}</g>')
    y = 254
    b.append(label(x, y, "Im Kalender", c) + R(x, y + 14, w, 220.5, 22, c["card"]))
    for i in range(3):
        ry = y + 14 + i * 73.5
        if i: b.append(HLINE(x + 14, x + w - 14, ry, c))
        b.append(R(x + 14, ry + 24, 140 - i * 20, 12, 6, c["skel"]) + R(x + 14, ry + 44, 200 - i * 30, 10, 5, c["skel"]) + R(x + w - 56, ry + 26, 42, 24, 12, c["skel"]))
    y += 14 + 220.5 + 34
    b.append(label(x, y, "Für welche Kurse", c) + R(x, y + 12, w, 38, 19, c["skel"]))
    return page(390, 844, c, "".join(b))

# ════════════════ 07 · Сервер недоступен ════════════════
def p_fehler(c, theme, sub):
    hc, hh = hero(18, 92, 354, c, WARN, "Gerade nicht erreichbar",
                  ["Der Server antwortet nicht.", "Dein Kalender-Abo läuft trotzdem weiter."], "Nochmal", REDO, tint="sand")
    return page(390, 844, c, head(c, "Kalender-Abo") + hc)

# ════════════════ ПК ════════════════
X0, W0 = m17.X0, m17.W0
m22.SUBNAV[1][1].insert(4, ("Kalender-Abo", CAL))   # новая строка в меню настроек — сразу после «Mitteilungen»

def pc_frame(c, theme):
    inner = m22.pc_base("22 Einstellungen · Übersicht", theme)
    return [inner, R(250, 0, 1190, 900, 0, c["paper"]), m22.pc_sidebar(inner, c, True),
            eyebrow(284, 39, "9b · Meine Schule", c) + title(284, 80, "Mehr", c, 38), m22.pc_subnav(c, "Kalender-Abo"),
            T(X0, 132, "Kalender-Abo", 26, 900, c["ink"], ls=-0.39)]

def pc_status(x, y, w, c):
    return (R(x, y, w, 58, 18, c["oktint"]) + ICON(x + 18, y + 17, 0.83, c["ok"], CAL_SYNC, 2)
            + T(x + 50, y + 25, "Abo aktiv", 14, 800, c["ok"]) + T(x + 50, y + 43, "Vom Kalender abgerufen: heute 06:40", 12, 400, c["muted"]))

L = 380
def pc_qr(x, y, w, c):
    """Правая колонка: QR (телефоном), ссылка и кнопки; ниже — «Link erneuern» / «Abo löschen»."""
    out = [R(x, y, w, 300, 22, c["card"]), qr(x + (w - 176) / 2, y + 20, 176, c),
           T(x + w / 2, y + 226, "Mit dem Handy scannen", 15, 800, c["ink"], "middle"),
           T(x + w / 2, y + 248, "und im Kalender dort hinzufügen", 12.5, 400, c["muted"], "middle"),
           T(x + w / 2, y + 278, LINK_TXT, 12, 700, c["faint"], "middle")]
    bw = (w - 8) / 2
    out.append(button(x, y + 316, bw, "Zum Kalender", c, icon=CAL_PLUS, h=44) + button(x + bw + 8, y + 316, bw, "Link kopieren", c, "sand", COPY, h=44))
    out.append(danger_rows(x, y + 384, w, c))
    return "".join(out)

def pc_aktiv(c, theme, sub, menu=False):
    b = pc_frame(c, theme)
    b.append(pc_status(X0, 156, L, c))
    s, _ = settings(X0, 248, L, c); b.append(s)
    rx, rw = X0 + L + 28, 340
    b.append(pc_qr(rx, 156, rw, c))
    if menu:
        # «Zum Kalender» на ПК — выпадающее меню под кнопкой (те же 4 пункта, что в шторке телефона)
        mx, my, mw = rx, 156 + 316 + 52, 300
        b.append(R(mx, my, mw, 4 * 60 + 12, 20, c["card"], extra=' filter="url(#nsh0)"') + R(mx, my, mw, 4 * 60 + 12, 20, c["card"]))
        for i, (ic, name, s2) in enumerate(TARGETS):
            ry = my + 6 + i * 60
            if i == 0: b.append(R(mx + 6, ry, mw - 12, 60, 14, c["sand"]))
            b.append(ICON(mx + 20, ry + 18, 0.75, c["accink"], ic, 2) + T(mx + 52, ry + 27, name, 14, 700, c["ink"]) + T(mx + 52, ry + 45, s2, 12, 400, c["faint"]))
    return page(1440, 900, c, "".join(b))

SCREENS = {
    "handy-01-leer": (p_leer, ("hell", "dunkel")),
    "handy-02-aktiv": (p_aktiv, ("hell", "dunkel")),
    "handy-03-kalender-waehlen": (p_wahl, ("hell", "dunkel")),
    "handy-04-kopiert": (p_kopiert, ("hell",)),
    "handy-05-erneuern": (lambda c, t, s: p_dialog(c, t, s, ERNEUERN), ("hell",)),
    "handy-06-loeschen": (lambda c, t, s: p_dialog(c, t, s, LOESCHEN), ("hell",)),
    "handy-07-laden": (p_laden, ("hell",)),
    "handy-08-fehler": (p_fehler, ("hell",)),
    "pc-01-aktiv": (pc_aktiv, ("hell", "dunkel")),
    "pc-02-kalender-waehlen": (lambda c, t, s: pc_aktiv(c, t, s, menu=True), ("hell",)),
}

if __name__ == "__main__":
    n = 0
    for name, (fn, themes) in SCREENS.items():
        for theme in themes:
            c = g.LIGHT if theme == "hell" else g.DARK
            open(os.path.join(OUT, f"{name}-{theme}.svg"), "w", encoding="utf-8").write(fn(c, theme, g.SUBJ[theme]))
            n += 1
    print(n, "files")
