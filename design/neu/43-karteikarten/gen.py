# Макеты части 43 «Karteikarten» (Vokabeln):
#   • раздел «Karteikarten»: «Heute lernen» (сколько карточек пора повторить) и список стопок по предметам;
#   • стопка: тест, к которому учим, 5 коробок (Leitner), что показывать первым, карточки;
#   • учить: карточка → «Umdrehen» → «Weiß ich» / «Weiß ich nicht», в конце итог;
#   • новая стопка: по одной или списком «Wort – Übersetzung»;
#   • 43b: блок на «Start», строка в «Aufgaben», карточка в шторке теста, «Teilen» ссылкой/QR и «Stapel übernehmen».
# Кирпичики: части 41 (шторка теста, Aufgaben), 30 (Start, нижняя навигация), 19c (поле «Kurs»), 16 (QR), 40 (окно-вопрос).
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else HERE

def _load(name, folder):
    sp = importlib.util.spec_from_file_location(name, os.path.join(HERE, "..", folder, "gen.py"))
    mod = importlib.util.module_from_spec(sp); sp.loader.exec_module(mod)
    return mod

m41 = _load("g41", "41-lernplan")
m19c = _load("g19c", "19c-kurs-auswahl")
m16 = _load("g16", "16-einladen")
g, m24, m25, m30 = m41.g, m41.m24, m41.m25, m41.m30
T, S, R, ICON, P, label, eyebrow, title, button, badge, segmented, round_btn = (
    g.T, g.S, g.R, g.ICON, g.P, g.label, g.eyebrow, g.title, g.button, g.badge, g.segmented, g.round_btn)
CHECK, CLOSE, PEN, PLUS, TRASH, SHARE, CHEV_R, CHEV_D, DOTS_V, COPY, FLAG = (
    g.CHECK, g.CLOSE, g.PEN, g.PLUS, g.TRASH, g.SHARE, g.CHEV_R, g.CHEV_D, g.DOTS_V, g.COPY, m30.FLAG)
page, toast, sheet_bg, overlay, head, HLINE, circle_code = m41.page, m41.toast, m41.sheet_bg, m41.overlay, m24.head, m24.HLINE, m24.circle_code
check_circle, dialog, progress = m41.check_circle, m41.dialog, m41.progress
NAMES = g.NAMES

# Значки: две карточки стопкой; «перевернуть» — две стрелки по кругу
CARDS = '<rect x="3" y="8" width="14" height="12" rx="2"/>' + P("M7 4h12a2 2 0 0 1 2 2v9")
FLIP = P("M4 12a8 8 0 0 1 14-5.3M20 4v4h-4M20 12a8 8 0 0 1-14 5.3M4 20v-4h4")
REDO = P("M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5")

# ── Daten (heute = Mi 17.09., wie in allen Soft-Mustern) ──
# (Fach, Name, Karten, fällig, Kästen 1–5, Test)
DECKS = [("En", "Unit 3 · Travel", 42, 12, (8, 10, 9, 7, 8), "Vokabeltest · Do 25.09."),
         ("En", "Irregular Verbs", 60, 8, (4, 9, 14, 15, 18), None),
         ("Bio", "Zelle · Fachbegriffe", 24, 3, (3, 6, 5, 6, 4), None),
         ("Ge", "Jahreszahlen", 18, 0, (0, 0, 2, 4, 12), None)]
CARDS_EN = [("the journey", "die Reise"), ("the suitcase", "der Koffer"), ("to arrive", "ankommen"),
            ("the departure", "die Abfahrt"), ("abroad", "im Ausland"), ("to book a room", "ein Zimmer buchen")]
LIST_TEXT = ["the journey – die Reise", "the suitcase – der Koffer", "to arrive – ankommen", "the departure – die Abfahrt",
             "abroad – im Ausland", "luggage"]

def nav(theme):
    return m30.nav(m30.St("soft", theme), 2)

def box_bar(x, y, w, boxes, c, h=6):
    """Полоска «Lernstand»: 5 коробок слева направо, чем дальше — тем ярче (Kasten 5 = sicher)."""
    total = sum(boxes) or 1
    out, cx = [R(x, y, w, h, h / 2, c["sand"])], x
    parts = []
    for i, n in enumerate(boxes):
        bw = w * n / total
        if bw: parts.append(f'<rect x="{cx:.1f}" y="{y}" width="{bw:.1f}" height="{h}" fill="{c["accent"]}" fill-opacity="{0.2 + i * 0.2:.1f}"/>')
        cx += bw
    out.append(f'<clipPath id="bb{int(x)}{int(y)}"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{h / 2}"/></clipPath>'
               f'<g clip-path="url(#bb{int(x)}{int(y)})">{"".join(parts)}</g>')
    return "".join(out)

def deck_row(x, y, w, d, c, sub, h=84, sel=False):
    code, name, n, due, boxes, test = d
    out = [R(x, y, w, h, 22, c["card"])]
    if sel: out.append(R(x + .5, y + .5, w - 1, h - 1, 21.5, "none", c["accent"]))
    out.append(circle_code(x + 14, y + 18, code, sub))
    out.append(T(x + 68, y + 34, name, 15, 800, c["ink"]))
    if due:
        meta = S(f"{n} Karten · ", 400, c["faint"]) + S(f"{due} fällig", 800, c["accink"])
    else:
        meta = S(f"{n} Karten · ", 400, c["faint"]) + S("alles sicher", 800, c["ok"])
    out.append(T(x + 68, y + 54, meta, 12.5, 400, c["faint"], raw=True))
    if test:
        bd, bw = badge(x + w - 16 - (len("Test Do 25.09.") * 7.1 + 16), y + 18, "TEST DO 25.09.", c, "tint"); out.append(bd)
    out.append(box_bar(x + 68, y + 66, w - 68 - 18, boxes, c))
    return "".join(out)

def hero(x, y, w, c, due=23, decks=3, h=104):
    """«Heute lernen»: сколько карточек пора повторить — одна кнопка на все стопки."""
    return (R(x, y, w, h, 22, c["tint"]) + T(x + 18, y + 30, "Heute lernen", 12.5, 800, c["accink"])
            + T(x + 18, y + 76, str(due), 38, 900, c["ink"], ls=-0.6)
            + T(x + 18 + len(str(due)) * 24 + 8, y + 64, "Karten", 14.5, 800, c["ink"])
            + T(x + 18 + len(str(due)) * 24 + 8, y + 82, f"aus {decks} Stapeln", 12.5, 400, c["muted"])
            + button(x + w - 18 - 122, y + h / 2 - 22, 122, "Lernen", c, icon=CARDS, h=44))

# ════════════════ 01 · Karteikarten (Liste) ════════════════
def p_liste(c, theme, sub):
    b = [eyebrow(18, 33, "Heute 23 fällig", c), title(18, 65, "Karteikarten", c), round_btn(334, 33.31, c, PLUS, primary=True)]
    b.append(hero(18, 92, 354, c))
    y = 222
    b.append(label(18, y + 12, "Englisch", c)); y += 24
    for d in DECKS[:2]:
        b.append(deck_row(18, y, 354, d, c, sub)); y += 92
    y += 8
    b.append(label(18, y + 12, "Andere Fächer", c)); y += 24
    for d in DECKS[2:]:
        b.append(deck_row(18, y, 354, d, c, sub)); y += 92
    b.append(R(0, 744, 390, 100, 0, c["paper"]))
    b.append(nav(theme))
    return page(390, 844, c, "".join(b))

# ════════════════ 02 · Stapel ════════════════
def boxes_card(x, y, w, boxes, c, h=140, moved=None):
    """5 коробок столбиками: «Weiß ich» — карточка уходит в следующую, «Weiß ich nicht» — обратно в 1."""
    out = [R(x, y, w, h, 22, c["card"])]
    cw = (w - 32 - 4 * 10) / 5
    mx = max(boxes) or 1
    for i, n in enumerate(boxes):
        bx = x + 16 + i * (cw + 10)
        bh = 64 * n / mx
        base = y + h - 38
        out.append(R(bx, base - 64, cw, 64, 12, c["sand"]))
        if bh: out.append(f'<rect x="{bx}" y="{base - bh:.1f}" width="{cw:.1f}" height="{bh:.1f}" rx="12" fill="{c["accent"]}" fill-opacity="{0.2 + i * 0.2:.1f}"/>')
        out.append(T(bx + cw / 2, base - 72, str(n), 14, 800, c["ink"], "middle"))
        if moved and moved[i]:
            out.append(T(bx + cw / 2 + 14, base - 72, f"{moved[i]:+d}".replace("+", "+"), 10.5, 800, c["ok"] if moved[i] > 0 else c["danger"]))
        out.append(T(bx + cw / 2, base + 22, "Neu" if i == 0 else ("Sicher" if i == 4 else str(i + 1)), 11.5, 700, c["faint"], "middle"))
    return "".join(out)

def card_list(x, y, w, rows, c, rh=50):
    out = [R(x, y, w, rh * len(rows), 22, c["card"])]
    for i, (a, bb) in enumerate(rows):
        ry = y + i * rh
        if i: out.append(HLINE(x + 16, x + w - 16, ry, c))
        out.append(T(x + 16, ry + rh / 2 + 5, a, 14.5, 700, c["ink"]) + T(x + w - 16, ry + rh / 2 + 5, bb, 14, 400, c["muted"], "end"))
    return "".join(out), rh * len(rows)

def test_link(x, y, w, c, text="Vokabeltest · Do 25.09.", right="in 8 Tagen", h=56):
    return (R(x, y, w, h, 22, c["card"]) + ICON(x + 16, y + h / 2 - 10, 0.83, c["accink"], FLAG, 2)
            + T(x + 48, y + h / 2 + 5, text, 14.5, 800, c["ink"]) + T(x + w - 16, y + h / 2 + 5, right, 12.5, 800, c["accink"], "end"))

def stapel_body(c, x, y, w, sub, d=DECKS[0]):
    b = [test_link(x, y, w, c)]; y += 56 + 28
    b.append(label(x, y, "Lernstand", c)); y += 12
    b.append(boxes_card(x, y, w, d[4], c)); y += 140 + 28
    b.append(label(x, y, "Zuerst zeigen", c)); y += 12
    b.append(segmented(x, y, w, ["Englisch", "Deutsch", "Gemischt"], 0, c, h=40)); y += 40 + 22
    b.append(button(x, y, w, "12 fällige lernen", c, icon=CARDS)); y += 48 + 10
    b.append(button(x, y, w, "Alle 42 üben", c, "sand", REDO)); y += 48 + 30
    b.append(label(x, y, "Karten · 42", c) + ICON(x + w - 58, y - 13, 0.67, c["accink"], PLUS, 2.4) + T(x + w, y, "Karte", 12.5, 800, c["accink"], "end")); y += 12
    cl, ch = card_list(x, y, w, CARDS_EN, c); b.append(cl); y += ch + 14
    b.append(T(x + w / 2, y + 16, "Alle 42 anzeigen", 13, 800, c["accink"], "middle")); y += 30
    return "".join(b), y

def p_stapel(c, theme, sub, extra=None):
    b = [head(c, "Englisch · 42 Karten", "Unit 3 · Travel"), round_btn(334, 33.31, c, DOTS_V)]
    body, y = stapel_body(c, 18, 96, 354, sub); b.append(body)
    H = max(844, round(y + 30))
    if extra: b.append(extra(H))
    return page(390, H, c, "".join(b))

# ════════════════ 03/04 · Lernen ════════════════
def learn_top(c, n, total, deck="Unit 3 · Travel"):
    return (round_btn(18, 33.31, c, CLOSE) + T(195, 57, deck, 14.5, 800, c["ink"], "middle")
            + T(372, 57, f"{n} / {total}", 13, 800, c["muted"], "end") + progress(18, 90, 354, n - 1, total, c, 6))

def big_card(x, y, w, h, c):
    return R(x, y, w, h, 28, c["card"], extra=' filter="url(#nsh1)"') + R(x, y, w, h, 28, c["card"])

def p_vorne(c, theme, sub):
    b = [learn_top(c, 5, 12)]
    b.append(big_card(18, 124, 354, 470, c))
    b.append(T(195, 166, "ENGLISCH", 10.5, 800, c["faint"], "middle", 0.6))
    b.append(T(195, 372, "the journey", 34, 900, c["ink"], "middle", -0.5))
    b.append(T(195, 566, "Kasten 2", 12, 700, c["faint"], "middle"))
    b.append(button(18, 628, 354, "Umdrehen", c, icon=FLIP))
    return page(390, 844, c, "".join(b))

def back_face(x, y, w, h, c, front="the journey", back="die Reise", box="Kasten 2"):
    cx = x + w / 2
    return (big_card(x, y, w, h, c) + T(cx, y + 42, "ENGLISCH", 10.5, 800, c["faint"], "middle", 0.6)
            + T(cx, y + 104, front, 20, 800, c["muted"], "middle") + HLINE(x + 40, x + w - 40, y + h * 0.36, c)
            + T(cx, y + h * 0.36 + 50, "DEUTSCH", 10.5, 800, c["faint"], "middle", 0.6)
            + T(cx, y + h * 0.58, back, 34, 900, c["ink"], "middle", -0.5)
            + T(cx, y + h - 28, box, 12, 700, c["faint"], "middle"))

def p_hinten(c, theme, sub):
    b = [learn_top(c, 5, 12), back_face(18, 124, 354, 470, c)]
    b.append(button(18, 628, 173, "Weiß ich nicht", c, "danger", CLOSE) + button(199, 628, 173, "Weiß ich", c, icon=CHECK))
    return page(390, 844, c, "".join(b))

# ════════════════ 05 · Fertig ════════════════
def stat_tile(x, y, w, n, text, col, c, h=96):
    return R(x, y, w, h, 22, c["card"]) + T(x + 18, y + 52, str(n), 34, 900, col, ls=-0.5) + T(x + 18, y + 76, text, 12.5, 700, c["muted"])

def p_fertig(c, theme, sub):
    b = [round_btn(18, 33.31, c, CLOSE) + T(195, 57, "Unit 3 · Travel", 14.5, 800, c["ink"], "middle") + progress(18, 90, 354, 12, 12, c, 6)]
    b.append(R(163, 136, 64, 64, 32, c["oktint"]) + ICON(179, 152, 1.33, c["ok"], CHECK, 2.4))
    b.append(T(195, 250, "Geschafft!", 29, 900, c["ink"], "middle", -0.44) + T(195, 276, "12 Karten wiederholt", 14, 400, c["muted"], "middle"))
    b.append(stat_tile(18, 304, 173, 9, "gewusst", c["ok"], c) + stat_tile(199, 304, 173, 3, "noch nicht", c["danger"], c))
    b.append(label(18, 432, "Lernstand", c))
    b.append(boxes_card(18, 444, 354, (11, 7, 11, 5, 8), c, moved=(3, -3, 2, -2, 0)))
    b.append(R(18, 608, 354, 56, 22, c["card"]) + ICON(34, 626, 0.83, c["muted"], m30.CLOCK, 2)
             + T(66, 641, "Nächste Runde", 14.5, 700, c["ink"]) + T(356, 641, "morgen · 7 Karten", 12.5, 800, c["accink"], "end"))
    b.append(button(18, 700, 173, "Die 3 nochmal", c, "sand", REDO) + button(199, 700, 173, "Fertig", c))
    return page(390, 844, c, "".join(b))

# ════════════════ 06 · Neuer Stapel (Liste einfügen) ════════════════
def text_field(x, y, w, text, c, h=52, ph=False):
    return R(x, y, w, h, 16, c["field"]) + T(x + 17, y + h / 2 + 5.5, text, 15.5, 400, c["faint2"] if ph else c["ink"])

def area(x, y, w, lines, c, bad=None, lh=26):
    h = 28 + lh * len(lines)
    out = [R(x, y, w, h, 16, c["field"]), R(x + 1, y + 1, w - 2, h - 2, 15, "none", c["accent"], 2)]
    for i, ln in enumerate(lines):
        ly = y + 30 + i * lh
        if i == bad:
            out.append(R(x + 10, ly - 18, w - 20, 25, 8, c["dtint"]) + T(x + 17, ly, ln, 14.5, 700, c["danger"]))
        else:
            out.append(T(x + 17, ly, ln, 14.5, 400, c["ink"]))
    out.append(R(x + 17 + g.tw(lines[-1], 14.5, 400) + 4, y + 30 + lh * (len(lines) - 1) - 15, 2, 19, 1, c["accent"]))
    return "".join(out), h

def p_neu(c, theme, sub):
    b = [head(c, "Karteikarten", "Neuer Stapel")]
    y = 100
    b.append(label(18, y, "Name", c) + text_field(18, y + 12, 354, "Unit 3 · Travel", c)); y += 12 + 52 + 24
    b.append(label(18, y, "Fach", c) + m19c.picker_field(18, y + 12, 354, c, sub, ("En", "En", "Englisch", "Sch", "133"))); y += 12 + 56 + 24
    b.append(label(18, y, "Seiten", c))
    b.append(text_field(18, y + 12, 173, "Englisch", c) + text_field(199, y + 12, 173, "Deutsch", c)); y += 12 + 52 + 24
    b.append(label(18, y, "Für Test", c))
    b.append(R(18, y + 12, 354, 52, 16, c["field"]) + ICON(34, y + 28, 0.83, c["accink"], FLAG, 2) + T(64, y + 43, "Vokabeltest · Do 25.09.", 15, 700, c["ink"])
             + ICON(342, y + 30, 0.67, c["faint"], CLOSE, 2.2)); y += 12 + 52 + 24
    b.append(label(18, y, "Karten", c)); y += 12
    b.append(segmented(18, y, 354, ["Einzeln", "Liste"], 1, c, h=40)); y += 40 + 12
    ar, ah = area(18, y, 354, LIST_TEXT, c, bad=5); b.append(ar); y += ah + 12
    b.append(ICON(18, y, 0.67, c["ok"], CHECK, 2.4) + T(40, y + 13, "5 Karten", 13, 800, c["ok"])
             + T(372, y + 13, "Zeile 6: «–» fehlt", 13, 800, c["danger"], "end")); y += 40
    b.append(button(18, y, 354, "Stapel speichern", c)); y += 48
    return page(390, max(844, round(y + 30)), c, "".join(b))

# ════════════════ 07 · Karte hinzufügen (einzeln) ════════════════
def add_sheet(c, H, top=420):
    b = [sheet_bg(c, top, 390, H)]
    y = top + 44
    b.append(eyebrow(18, y, "Unit 3 · Travel · 43 Karten", c, True) + title(18, y + 32, "Karte hinzufügen", c, 26)); y += 64
    b.append(label(18, y, "Englisch", c) + text_field(18, y + 12, 354, "the luggage", c)); y += 12 + 52 + 22
    b.append(label(18, y, "Deutsch", c) + R(18, y + 12, 354, 52, 16, c["field"]) + R(19, y + 13, 352, 50, 15, "none", c["accent"], 2)
             + T(35, y + 43.5, "das Gepäck", 15.5, 400, c["ink"]) + R(35 + g.tw("das Gepäck", 15.5, 400) + 4, y + 28, 2, 20, 1, c["accent"])); y += 12 + 52 + 28
    b.append(button(18, y, 140, "Fertig", c, "sand", None) + button(166, y, 206, "Nächste Karte", c, icon=PLUS))
    b.append(toast(18, top - 62, 354, "«the suitcase» gespeichert", c))
    return "".join(b)

def p_einzeln(c, theme, sub):
    return p_stapel(c, theme, sub, extra=lambda H: add_sheet(c, H))

# ════════════════ 08 · Start + 09 · Aufgaben ════════════════
def b_karten(st, x, y, w, h):
    c = st.c
    e = (h - 124) / 2
    return (m30.bhead(st, x, y, "Karteikarten", CARDS) + T(x + 14, y + 62 + e, "23", 30, 900, c["ink"], ls=-0.5) + T(x + 52, y + 60 + e, "fällig", 13, 600, c["muted"])
            + T(x + 14, y + 85 + e, "Englisch · Unit 3", 12.5, 600, c["ink"]) + T(x + 14, y + 103 + e, "Test in 8 Tagen", 12, 700, c["accink"]))

def p_start(c, theme, sub):
    m30.DRAW["notizen"] = b_karten
    out = m30.p_start(m30.St("soft", theme))
    m30.DRAW["notizen"] = m30.b_notiz
    return out

def karten_row(x, y, w, c, sub, code, deck, n, h=64):
    """Строка в «Aufgaben»: сама исчезает, когда все карточки повторены; нажатие — сразу учить."""
    _, tint, text = sub[code]
    out = [R(x, y, w, h, 22, c["card"]), R(x + 12, y + 10, 38, 44, 12, tint) + ICON(x + 19, y + 20, 1, text, CARDS, 2)]
    meta = S("Karteikarten", 800, c["accink"]) + S(f" · {NAMES[code]}", 400, c["faint"]) + S(" · heute", 700, c["accink"])
    out.append(T(x + 62, y + 24, meta, 11.5, 400, c["faint"], raw=True))
    out.append(T(x + 62, y + 48.5, f"{deck} · {n} Karten", 14.5, 800, c["ink"]))
    out.append(ICON(x + w - 36, y + h / 2 - 9, 0.75, c["faint"], CHEV_R, 2.2))
    return "".join(out)

def p_aufgaben(c, theme, sub):
    b = [eyebrow(18, 33, "Ab heute · 5 offen", c), title(18, 65, "Aufgaben", c), g.round_btn(334, 33.31, c, PLUS, primary=True)]
    b.append(m25.list_switch(18, 85.31, 354, c))
    b.append(m25.subject_chips(135.31, c, sub))
    y = 182
    b.append(label(18, y + 12, "Heute", c)); y += 24
    b.append(karten_row(18, y, 354, c, sub, "En", "Unit 3", 12)); y += 72
    b.append(karten_row(18, y, 354, c, sub, "Bio", "Zelle", 3)); y += 72
    b.append(m41.plan_row(18, y, 354, c, sub, "17", "MI", "Ma", "Textaufgaben", "heute")); y += 72 + 12
    b.append(label(18, y + 12, "Bis morgen", c)); y += 24
    b.append(m25.task_row(18, y, 354, c, sub, "18", "DO", "Ma", "Mü", "Buch S. 54, Nr. 3 a–d", "morgen", False, False)); y += 72 + 10
    b.append(m25.done_head(18, y, 354, c, 5, False))
    b.append(R(0, 744, 390, 100, 0, c["paper"]))
    b.append(nav(theme))
    return page(390, 844, c, "".join(b))

# ════════════════ 10 · Test mit Karteikarten ════════════════
def test_karten_card(x, y, w, c, sub, h=128):
    return (R(x, y, w, h, 22, c["card"]) + circle_code(x + 14, y + 16, "En", sub)
            + T(x + 68, y + 32, "Unit 3 · Travel", 15, 800, c["ink"])
            + T(x + 68, y + 52, S("30 von 42 sicher · ", 400, c["faint"]) + S("12 fällig", 800, c["accink"]), 12.5, 400, c["faint"], raw=True)
            + box_bar(x + 68, y + 64, w - 86, DECKS[0][4], c)
            + m24.tint_button(x + 14, y + h - 50, w - 28, "Jetzt lernen", c, CARDS, h=40))

def p_test(c, theme, sub):
    H, top = 900, 150
    b = [m41.tests_base(theme), sheet_bg(c, top, 390, H)]
    m41.sheet_head(b, c, sub, top, "En", "TEST", "Englisch", "Vokabeltest")
    y = top + 98
    b.append(m24.countdown(18, y, 354, "8", "Tage bis zum Test", "Donnerstag, 25. September · 3. Stunde", c)); y += 76 + 24
    b.append(label(18, y, "Karteikarten", c) + T(372, y, "Stapel wählen", 12.5, 800, c["accink"], "end")); y += 12
    b.append(test_karten_card(18, y, 354, c, sub)); y += 128 + 14
    b.append(m24.tint_button(18, y, 354, "Lernplan erstellen", c, m25.LIST_CHECK)); y += 48 + 24
    b.append(label(18, y, "Was lernen, was mitbringen", c)); y += 12
    b.append(R(18, y, 354, 54, 20, c["card"]) + T(32, y + 33, "Unit 3, S. 40–47", 14, 400, c["ink"]))
    m41.sheet_buttons(b, c, H)
    return page(390, H, c, "".join(b))

# ════════════════ 11 · Teilen · 12 · Übernehmen ════════════════
def share_sheet(c, H, top=250):
    b = [sheet_bg(c, top, 390, H)]
    y = top + 44
    b.append(eyebrow(18, y, "Unit 3 · Travel · 42 Karten", c, True) + title(18, y + 32, "Stapel teilen", c, 26)); y += 60
    b.append(R(95, y, 200, 200, 24, "#FFFFFF") + m16.qr(105, y + 10, 180, c)); y += 200 + 20
    b.append(R(18, y, 354, 52, 16, c["field"]) + T(35, y + 31, "orbook.orbitium.net/karten#v1.eJx…", 14, 400, c["muted"])
             + ICON(340, y + 16, 0.83, c["accink"], COPY, 2)); y += 52 + 20
    b.append(button(18, y, 173, "Link kopieren", c, "sand", COPY) + button(199, y, 173, "Teilen", c, icon=SHARE))
    return "".join(b)

def p_teilen(c, theme, sub):
    return p_stapel(c, theme, sub, extra=lambda H: share_sheet(c, H))

def p_uebernehmen(c, theme, sub):
    b = [eyebrow(18, 33, "Geteilter Stapel", c, True), title(18, 65, "Stapel übernehmen", c), round_btn(334, 33.31, c, CLOSE)]
    y = 96
    b.append(R(18, y, 354, 84, 22, c["card"]) + circle_code(32, y + 20, "En", sub) + T(86, y + 37, "Unit 3 · Travel", 16, 800, c["ink"])
             + T(86, y + 58, "42 Karten · Englisch – Deutsch", 12.5, 400, c["faint"])); y += 84 + 28
    b.append(label(18, y, "Fach", c) + m19c.picker_field(18, y + 12, 354, c, sub, ("En", "En", "Englisch", "Sch", "133"))); y += 12 + 56 + 28
    b.append(label(18, y, "Karten", c)); y += 12
    cl, ch = card_list(18, y, 354, CARDS_EN[:5], c); b.append(cl); y += ch + 14
    b.append(T(195, y + 16, "und 37 weitere", 13, 700, c["faint"], "middle")); y += 44
    b.append(button(18, y, 354, "Übernehmen", c))
    return page(390, 844, c, "".join(b))

# ════════════════ 13 · Leer · 14 · Löschen ════════════════
def p_leer(c, theme, sub):
    b = [eyebrow(18, 33, "Nichts fällig", c), title(18, 65, "Karteikarten", c), round_btn(334, 33.31, c, PLUS, primary=True)]
    b.append(R(163, 270, 64, 64, 32, c["tint"]) + ICON(181, 288, 1.17, c["accink"], CARDS, 1.8))
    b.append(T(195, 372, "Noch keine Stapel", 20, 900, c["ink"], "middle", -0.3))
    b.append(T(195, 398, "Vokabeln, Begriffe, Jahreszahlen", 14, 400, c["muted"], "middle"))
    b.append(button(85, 430, 220, "Stapel anlegen", c, icon=PLUS))
    b.append(R(0, 744, 390, 100, 0, c["paper"]))
    b.append(nav(theme))
    return page(390, 844, c, "".join(b))

LOESCHEN = (TRASH, "Stapel löschen?", ["Alle 42 Karten und der Lernstand", "sind dann weg."], "Löschen", TRASH, True)
MENU = [(PEN, "Bearbeiten"), (SHARE, "Teilen"), (REDO, "Lernstand zurücksetzen"), (TRASH, "Löschen")]

def menu_sheet(c, H, top=520):
    b = [sheet_bg(c, top, 390, H), eyebrow(18, top + 44, "Englisch · 42 Karten", c, True), title(18, top + 76, "Unit 3 · Travel", c, 26)]
    y = top + 100
    b.append(R(18, y, 354, 4 * 52, 22, c["card"]))
    for i, (ic, t) in enumerate(MENU):
        ry = y + i * 52
        if i: b.append(HLINE(34, 356, ry, c))
        col = c["danger"] if ic is TRASH else c["ink"]
        b.append(ICON(34, ry + 16, 0.83, c["danger"] if ic is TRASH else c["muted"], ic, 2) + T(66, ry + 31, t, 14.5, 700, col))
    return "".join(b)

def p_menue(c, theme, sub):
    return p_stapel(c, theme, sub, extra=lambda H: menu_sheet(c, H, top=H - 360))

def p_loeschen(c, theme, sub):
    return p_stapel(c, theme, sub, extra=lambda H: overlay(c, 390, H) + dialog(c, 18, 320, 354, *LOESCHEN))

# ════════════════ ПК ════════════════
def pc_base(theme, c):
    return m24.pc_page("14 Klausuren", theme, c, [(">Klausuren<", ">Tests<")])[0]

def pc_liste(c, theme, sub):
    """Слева список стопок, справа выбранная стопка (как «Noten» и «Aufgaben» на ПК)."""
    b = [pc_base(theme, c), R(262, 0, 1178, 900, 0, c["paper"])]
    b.append(eyebrow(284, 39, "Heute 23 fällig", c) + title(284, 80, "Karteikarten", c, 38))
    b.append(round_btn(670, 47, c, PLUS, primary=True))
    x, w, y = 284, 424, 116
    b.append(hero(x, y, w, c)); y += 104 + 24
    b.append(label(x, y + 12, "Englisch", c)); y += 24
    for i, d in enumerate(DECKS[:2]):
        b.append(deck_row(x, y, w, d, c, sub, sel=i == 0)); y += 92
    y += 8
    b.append(label(x, y + 12, "Andere Fächer", c)); y += 24
    for d in DECKS[2:]:
        b.append(deck_row(x, y, w, d, c, sub)); y += 92
    # rechte Spalte — Stapel
    rx, rw = 748, 656
    b.append(eyebrow(rx, 39, "Englisch · 42 Karten", c, True) + title(rx, 80, "Unit 3 · Travel", c, 30))
    b.append(R(rx + rw - 124, 45, 80, 38, 19, c["card"]) + ICON(rx + rw - 112, 55, 0.75, c["ink"], SHARE, 2) + T(rx + rw - 88, 69, "Teilen", 13, 800, c["ink"])
             + round_btn(rx + rw - 38, 45, c, DOTS_V))
    hw = (rw - 20) / 2
    y = 116
    b.append(test_link(rx, y, hw, c, right="")); y += 56 + 28
    b.append(label(rx, y, "Lernstand", c) + boxes_card(rx, y + 12, hw, DECKS[0][4], c)); y += 12 + 140 + 28
    b.append(label(rx, y, "Zuerst zeigen", c) + segmented(rx, y + 12, hw, ["Englisch", "Deutsch", "Gemischt"], 0, c, h=40)); y += 12 + 40 + 24
    b.append(button(rx, y, hw, "12 fällige lernen", c, icon=CARDS)); y += 58
    b.append(button(rx, y, hw, "Alle 42 üben", c, "sand", REDO))
    cx = rx + hw + 20
    b.append(label(cx, 116, "Karten · 42", c) + ICON(cx + hw - 58, 103, 0.67, c["accink"], PLUS, 2.4) + T(cx + hw, 116, "Karte", 12.5, 800, c["accink"], "end"))
    more = CARDS_EN + [("the ticket", "die Fahrkarte"), ("the platform", "der Bahnsteig"), ("to miss the bus", "den Bus verpassen"),
                       ("the sights", "die Sehenswürdigkeiten"), ("to explore", "erkunden")]
    cl, ch = card_list(cx, 128, hw, more, c, rh=48); b.append(cl)
    b.append(T(cx + hw / 2, 128 + ch + 30, "Alle 42 anzeigen", 13, 800, c["accink"], "middle"))
    return page(1440, 900, c, "".join(b))

def pc_lernen(c, theme, sub):
    """Lernen auf dem PC: Karte groß in der Mitte, darunter beide Antworten."""
    b = [pc_base(theme, c), R(262, 0, 1178, 900, 0, c["paper"])]
    cx = 262 + 1178 / 2
    b.append(R(284, 33, 38, 38, 19, c["card"]) + ICON(294, 43, 0.75, c["ink"], CLOSE, 2))
    b.append(T(cx, 58, "Unit 3 · Travel", 16, 800, c["ink"], "middle") + T(1404, 58, "5 / 12", 14, 800, c["muted"], "end"))
    b.append(progress(cx - 280, 96, 560, 4, 12, c, 6))
    b.append(back_face(cx - 280, 140, 560, 520, c))
    b.append(button(cx - 280, 700, 274, "Weiß ich nicht", c, "danger", CLOSE) + button(cx + 6, 700, 274, "Weiß ich", c, icon=CHECK))
    return page(1440, 900, c, "".join(b))

SCREENS = {
    "handy-01-karteikarten": (p_liste, ("hell", "dunkel")),
    "handy-02-stapel": (p_stapel, ("hell", "dunkel")),
    "handy-03-lernen": (p_vorne, ("hell",)),
    "handy-04-umgedreht": (p_hinten, ("hell", "dunkel")),
    "handy-05-geschafft": (p_fertig, ("hell",)),
    "handy-06-neuer-stapel": (p_neu, ("hell", "dunkel")),
    "handy-07-karte-hinzufuegen": (p_einzeln, ("hell",)),
    "handy-08-start": (p_start, ("hell",)),
    "handy-09-aufgaben": (p_aufgaben, ("hell",)),
    "handy-10-test": (p_test, ("hell",)),
    "handy-11-teilen": (p_teilen, ("hell",)),
    "handy-12-uebernehmen": (p_uebernehmen, ("hell",)),
    "handy-13-leer": (p_leer, ("hell",)),
    "handy-14-menue": (p_menue, ("hell",)),
    "handy-15-loeschen": (p_loeschen, ("hell",)),
    "pc-01-karteikarten": (pc_liste, ("hell", "dunkel")),
    "pc-02-lernen": (pc_lernen, ("hell",)),
}

if __name__ == "__main__":
    n = 0
    for name, (fn, themes) in SCREENS.items():
        for theme in themes:
            c = g.LIGHT if theme == "hell" else g.DARK
            open(os.path.join(OUT, f"{name}-{theme}.svg"), "w", encoding="utf-8").write(fn(c, theme, g.SUBJ[theme]))
            n += 1
    print(n, "files")
