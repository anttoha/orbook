# Генератор макетов части 24 «Einträge zur Stunde»: Hausaufgabe и Test прямо из меню урока, виды тестов из админки
# (Klassenarbeit, Leistungskontrolle, Test …), автоматический перенос при «fällt aus», описание и Materialien у записи.
# Помощники и цвета — из генераторов частей 14–22 (те же токены Soft).
# Основа — оригиналы ORBook Soft: 09 «Stunde · Menü», 07 «Stunde · Details», 16 «Klausur eintragen», 13/14 «Klausuren»,
# 05 «Tag · Liste», 45 «Admin · Einstellungen», PC 06/10 «Tag · Rechtsklick-Menü», PC 14/17 «Klausur eintragen», PC 47.
import importlib.util, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else HERE
_spec = importlib.util.spec_from_file_location("g22", os.path.join(HERE, "..", "22-kleinigkeiten", "gen.py"))
m22 = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(m22)
m19, g, m15 = m22.m19, m22.g, m22.m15
T, S, R, ICON, P, label, eyebrow, title, button, round_btn, badge, note_box = (
    g.T, g.S, g.R, g.ICON, g.P, g.label, g.eyebrow, g.title, g.button, g.round_btn, g.badge, g.note_box)
CHECK, CHEV_R, CHEV_D, BACK, CLOSE, PEN, PLUS, TRASH, SHARE, CAL, BOOK, LOCK = (
    g.CHECK, g.CHEV_R, g.CHEV_D, g.BACK, g.CLOSE, g.PEN, g.PLUS, g.TRASH, g.SHARE, g.CAL, g.BOOK, g.LOCK)
FLAG, FILE, INFO, EXT, LINK = m19.FLAG, m15.FILE, m15.INFO, m15.EXT, m15.LINK
toast, sheet_bg, overlay, page = m15.toast, m15.sheet_bg, g.overlay, m19.page
NAMES, TEACH, ROOM, TIMES = g.NAMES, m19.TEACH, m19.ROOM, m19.TIMES
ARROW = P("M5 12h14M13 6l6 6-6 6")
MOVE = P("M4 7h11a5 5 0 0 1 0 10H9") + P("M12 14l-3 3 3 3")          # «verschoben» — Pfeil um die Ecke
GRIP = "".join(f'<circle cx="{x}" cy="{y}" r="1.3"/>' for x in (9, 15) for y in (6, 12, 18))
HLINE = lambda x1, x2, y, c: f'<line x1="{x1}" y1="{y}" x2="{x2}" y2="{y}" stroke="{c["hair"]}" stroke-width="1"/>'

# Иконки меню урока — из оригинала 09 (Details, Notiz, Teilen, Fachfarbe, Kurs ausblenden)
I_INFO, I_NOTE, I_SHARE, I_PALETTE, I_EYEOFF = m22.icons_of("09 Stunde · Menü (lange drücken)", scale="0.75")[-5:]

# ── Daten ──
TYPES = [("Klassenarbeit", "KA", 3), ("Leistungskontrolle", "LK", 5), ("Test", "T", 8), ("Abgabe", "AB", 1)]
MATS = [("Ma", "Arbeitsblätter Analysis", "Google Drive", "Ordner", "Mü"),
        ("Ma", "Lösungen Übungsklausur", "Google Drive", "PDF", "Mü"),
        ("Ma", "Formelsammlung Klasse 8", "OneDrive", "PDF", None),
        ("En", "Vocabulary Unit 3", "OneDrive", "Word", None)]

def wrap_text(x, y, lines, c, size=14, col="ink", lh=20, w=400):
    return "".join(T(x, y + i * lh, ln, size, w, c[col]) for i, ln in enumerate(lines))

def tint_button(x, y, w, text, c, icon, h=48):
    """Кнопка-добавление в Tint (как «+ Notiz», но кнопкой): «+ Hausaufgabe», «+ Test»."""
    tx = x + w / 2 + 12
    return (R(x, y, w, h, h / 2, c["tint"]) + ICON(tx - g.tw(text, 14.5) / 2 - 26, y + h / 2 - 8, 0.67, c["accink"], icon, 2.2)
            + T(tx, y + h / 2 + 5, text, 14.5, 800, c["accink"], "middle"))

def field(x, y, w, lines, c, h=52, placeholder=False):
    out = R(x, y, w, h, 16, c["field"])
    return out + "".join(T(x + 17, y + 31 + i * 21, ln, 15.5, 400, c["faint"] if placeholder else c["ink"]) for i, ln in enumerate(lines))

def hint(x, y, text, c): return T(x, y, text, 12, 400, c["faint"])

def mat_mini(x, y, w, m, c, sub, right="ext", h=60):
    """Строка материала внутри карточки: плитка, название, «Google Drive · PDF · von Mü», справа ↗ / × / галочка."""
    code, ttl, prov, kind, who = m
    out = [m15.tile(x + 12, y + 12, code, kind, sub, 36),
           T(x + 60, y + 27, ttl, 14, 700, c["ink"]), T(x + 60, y + 45, m15.meta(prov, kind, who), 11.5, 400, c["faint"])]
    if right == "ext": out.append(ICON(x + w - 32, y + h / 2 - 8, 0.67, c["faint"], EXT, 2))
    elif right == "x": out.append(ICON(x + w - 32, y + h / 2 - 8, 0.67, c["faint"], CLOSE, 2))
    elif right in ("on", "off"): out.append(g.checkbox(x + w - 34, y + h / 2 - 9.5, right == "on", c))
    return "".join(out)

def mat_card(x, y, w, mats, c, sub, right="ext", add=None):
    """Белая карточка с материалами; add — последняя строка «+ Material anhängen»."""
    h = len(mats) * 60 + (50 if add else 0) + 4
    out = [R(x, y, w, h, 22, c["card"])]
    for i, m in enumerate(mats):
        if i: out.append(HLINE(x + 14, x + w - 14, y + 2 + i * 60, c))
        out.append(mat_mini(x, y + 2 + i * 60, w, m, c, sub, right if isinstance(right, str) else right[i]))
    if add:
        ry = y + 2 + len(mats) * 60
        if mats: out.append(HLINE(x + 14, x + w - 14, ry, c))
        out.append(ICON(x + 20, ry + 16, 0.71, c["accink"], PLUS, 2.2) + T(x + 48, ry + 30, add, 14.5, 800, c["accink"]))
    return "".join(out), h

def circle_code(x, y, code, sub, r=22):
    _, tint, text = sub[code]
    return f'<circle cx="{x + r}" cy="{y + r}" r="{r}" fill="{tint}"/>' + T(x + r, y + r + 4.5, code, 11.5 if r > 18 else 10, 900, text, "middle")

def for_card(x, y, w, c, sub, code, line1, line2, right="Ändern", lead=None):
    """«Für diese Stunde»: к какой Stunde относится запись — подставлено из нажатого урока."""
    out = R(x, y, w, 66, 20, c["card"]) + circle_code(x + 12, y + 11, code, sub)
    if lead: out += T(x + 68, y + 16, lead, 10.5, 800, c["faint"], ls=0.4)
    out += T(x + 68, y + (34 if lead else 29), line1, 15, 800, c["ink"]) + T(x + 68, y + (52 if lead else 48), line2, 12.5, 400, c["faint"])
    if right: out += T(x + w - 14, y + 38, right, 13, 800, c["accink"], "end")
    return out

def type_chips(x, y, maxw, active, c, names=None, gap=8, h=36):
    names = names or [t[0] for t in TYPES]
    out, cx, cy = [], x, y
    for n in names:
        w = g.tw(n, 12.5) + 26
        if cx + w > x + maxw: cx, cy = x, cy + h + gap
        s, w = g.chip(cx, cy, n, c, on=n == active, h=h); out.append(s); cx += w + gap
    return "".join(out), cy + h - y

def head(c, eb, ttl, back=True, accent=True):
    return (round_btn(18, 33.31, c, BACK) if back else "") + eyebrow(66 if back else 18, 33, eb, c, accent) + title(66 if back else 18, 65, ttl, c)

# ════════════════ Telefon ════════════════
MENU_ROWS = [(I_INFO, "Details", None), (I_NOTE, "Notiz zur Stunde", None), (BOOK, "Hausaufgabe geben", "neu"),
             (FLAG, "Test eintragen", "neu"), (I_SHARE, "Teilen", None), None, (I_PALETTE, "Fachfarbe ändern", None),
             (I_EYEOFF, "Kurs ausblenden", None)]

def menu_card(x, y, w, c, locked=False, rh=44, pc=False):
    """Меню урока (09 / PC 10) + два новых пункта. locked — нет Editor-Code: пункты видны, но с замком и подсказкой."""
    keys = {"Details": "↵", "Notiz zur Stunde": "N", "Hausaufgabe geben": "H", "Test eintragen": "T", "Teilen": "S"}
    hs = [9 if r is None else (rh + 14 if locked and r[2] else rh) for r in MENU_ROWS]
    H = sum(hs) + 12
    out = [R(x, y, w, H, 20, c["card"], extra=' filter="url(#nsh0)"')]
    ry = y + 6
    for r, hh in zip(MENU_ROWS, hs):
        if r is None:
            out.append(R(x + 12, ry + 4, w - 24, 1, 0, c["hair"])); ry += hh; continue
        icon, text, new = r
        if pc and text == "Test eintragen": out.append(R(x + 6, ry, w - 12, hh, 14, c["tint"]))
        col = c["faint"] if (locked and new) else (c["accink"] if new else c["muted"])
        out.append(f'<g transform="translate({x + 15} {ry + (hh - 18) / 2}) scale(0.75 0.75)" fill="none" stroke="{col}" stroke-width="1.9" '
                   f'stroke-linecap="round" stroke-linejoin="round">{icon}</g>')
        if locked and new:
            out.append(T(x + 45, ry + 24, text, 15, 500, c["muted"]) + T(x + 45, ry + 42, "Editor-Code nötig", 12, 400, c["faint"]))
            out.append(ICON(x + w - 32, ry + hh / 2 - 8, 0.67, c["faint"], LOCK, 2))
        else:
            out.append(T(x + 45, ry + hh / 2 + 5, text, 14.5 if pc else 15, 500, c["accink"] if (new and not pc) else c["ink"]))
            if pc and text in keys:
                k = keys[text]
                out.append(R(x + w - 40, ry + hh / 2 - 11, 22, 22, 8, c["sand"]) + T(x + w - 29, ry + hh / 2 + 4, k, 11, 800, c["muted"], "middle"))
        ry += hh
    return "".join(out), H

def p_menue(c, theme, sub, locked=False):
    inner, w, h = g.base("09 Stunde · Menü (lange drücken)", theme)
    card, H = menu_card(112, 452, 262, c, locked)
    return page(w, h, c, inner + card)

def entry_rows(x, y, w, rows, c, rh=74):
    """Записи «Für diese Stunde»: бейдж вида + тема + серая строка + ›."""
    out = [R(x, y, w, rh * len(rows), 22, c["card"])]
    for i, (kind_txt, kind, ttl, subl) in enumerate(rows):
        ry = y + i * rh
        if i: out.append(HLINE(x + 14, x + w - 14, ry, c))
        bd, bw = badge(x + 14, ry + 12, kind_txt, c, kind); out.append(bd)
        out.append(T(x + 14, ry + 50, ttl, 15, 800, c["ink"]))
        out.append(T(x + 14 + g.tw(ttl, 15, 800) * 0.93 + 10, ry + 50, subl, 12, 400, c["faint"]) if False else "")
        out.append(T(x + 14 + bw + 8, ry + 25.5, subl, 12, 400, c["faint"]))
        out.append(ICON(x + w - 30, ry + rh / 2 - 8, 0.67, c["faint2"], CHEV_R))
    return "".join(out), rh * len(rows)

def p_stunde(c, theme, sub):
    """07 «Stunde · Details»: блок «Für diese Stunde» (Test + Hausaufgabe) и кнопки «+ Hausaufgabe» / «+ Test»."""
    inner, w, h = g.base("05 Tag · Liste", theme)
    top = 300
    _, tint, text = sub["Ma"]
    b = [inner, sheet_bg(c, top, 390, 920)]
    b.append(circle_code(18, top + 30, "Ma", sub))
    b.append(T(74, top + 42, "1. Stunde · 07:30–08:15 · Fr 19.09.", 12.5, 800, c["faint"]))
    b.append(T(74, top + 71, "Mathe", 29, 900, text, ls=-0.43))
    tbl, th = m19.info_table(18, top + 90, 354, [("Lehrer", "Mü", "ink"), ("Raum", "108", "ink"), ("Kurs", "Ma", "ink")], c)
    b.append(tbl)
    y = top + 90 + th + 18
    b.append(label(18, y + 12, "Für diese Stunde", c) + T(372, y + 12, "2 Einträge", 12.5, 700, c["faint"], "end"))
    y += 24
    rows, rh = entry_rows(18, y, 354, [("KLASSENARBEIT", "accent", "Quadratische Funktionen", "Lernen: S. 40–58 · 2 Materialien"),
                                       ("HAUSAUFGABE", "sand", "Übungsblatt 4 fertig machen", "bis zu dieser Stunde")], c)
    b.append(rows); y += rh + 16
    b.append(tint_button(18, y, 173, "Hausaufgabe", c, PLUS) + tint_button(199, y, 173, "Test", c, PLUS))
    y += 56
    b.append(button(18, y, 173, "Notiz", c, "sand", FILE) + button(199, y, 173, "Teilen", c, "sand", SHARE))
    return page(390, 920, c, "".join(b))

def p_test_form(c, theme, sub, sheet=False):
    """16 «Klausur eintragen» → «Test eintragen» из урока: Stunde уже выбрана, вид — из списка админа, описание, материалы."""
    H = 1000
    b = [head(c, "Editor · Code A", "Test eintragen")]
    y = 98
    b.append(for_card(18, y, 354, c, sub, "Ma", "Mathe · 1. Stunde", "Freitag, 19. September · 07:30", lead="FÜR DIE STUNDE"))
    y += 66 + 26
    b.append(label(18, y, "Art", c)); y += 12
    chips, chh = type_chips(18, y, 354, "Klassenarbeit", c); b.append(chips); y += chh + 30
    b.append(label(18, y, "Thema", c)); y += 12
    b.append(field(18, y, 354, ["Quadratische Funktionen"], c)); y += 52 + 18
    b.append(hint(18, y, "23 von 60 Zeichen · keine Namen", c)); y += 30
    b.append(label(18, y, "Was lernen, was mitbringen · optional", c)); y += 12
    b.append(field(18, y, 354, ["Buch S. 40–58 und die Aufgaben", "vom Arbeitsblatt. Taschenrechner", "und Geodreieck mitbringen."], c, h=98)); y += 98 + 18
    b.append(hint(18, y, "88 von 300 Zeichen · Links bitte als Material", c)); y += 30
    b.append(label(18, y, "Materialien · optional", c)); y += 12
    card, ch = mat_card(18, y, 354, MATS[:2], c, sub, "x", "Material anhängen"); b.append(card); y += ch + 16
    b.append(note_box(18, y, 354, [S("Fällt die Stunde aus, ", 700, c["ink"]) + S("rutscht der Test", 400, c["muted"]),
                                   g.esc("auf die nächste Mathe-Stunde.")], c, MOVE))
    b.append(button(18, H - 76, 354, "Speichern", c))
    if sheet: b.append(attach_sheet(c, sub, H=H))
    return page(390, H, c, "".join(b))

def attach_sheet(c, sub, top=470, H=1000):
    b = [sheet_bg(c, top, 390, H)]
    b.append(eyebrow(18, top + 42, "Materialien · Mathe", c) + title(18, top + 74, "Material anhängen", c, 26))
    y = top + 96
    card, ch = mat_card(18, y, 354, MATS[:3], c, sub, ["on", "on", "off"]); b.append(card); y += ch + 12
    b.append(R(18.5, y + .5, 353, 51, 20, "none", c["rule"], 1, ' stroke-dasharray="4 3"')
             + ICON(36, y + 17, 0.71, c["accink"], LINK, 2) + T(64, y + 31, "Neuen Link teilen", 14.5, 800, c["accink"])
             + T(358, y + 31, "Drive · OneDrive", 12, 400, c["faint"], "end"))
    y += 64
    b.append(hint(18, y + 6, "Nur Links von Google Drive oder OneDrive — die Dateien", c))
    b.append(hint(18, y + 23, "bleiben dort, ORBook merkt sich nur den Link.", c))
    b.append(button(18, H - 76, 354, "2 anhängen", c))
    return "".join(b)

def choice_rows(x, y, w, rows, active, c, rh=62):
    """Варианты «Bis wann?»: выбранный — Tint и галочка (как radio_rows в 19b, без иконок слева)."""
    out = [R(x, y, w, rh * len(rows) + 8, 22, c["card"])]
    for i, (ttl, subl) in enumerate(rows):
        ry = y + 4 + i * rh
        on = i == active
        if on: out.append(R(x + 4, ry, w - 8, rh, 18, c["tint"]))
        elif i and i != active + 1: out.append(HLINE(x + 14, x + w - 14, ry, c))
        out.append(T(x + 18, ry + 27, ttl, 15, 700 if on else 400, c["accink"] if on else c["ink"])
                   + T(x + 18, ry + 46, subl, 12, 400, c["muted"] if on else c["faint"]))
        if on: out.append(ICON(x + w - 36, ry + rh / 2 - 8.5, 0.71, c["accink"], CHECK, 2.4))
        elif i == len(rows) - 1: out.append(ICON(x + w - 32, ry + rh / 2 - 8, 0.67, c["faint2"], CAL, 2))
    return "".join(out), rh * len(rows) + 8

def p_hausaufgabe(c, theme, sub):
    H = 960
    b = [head(c, "Editor · Code A", "Hausaufgabe")]
    y = 98
    b.append(for_card(18, y, 354, c, sub, "Ma", "Mathe · 2. Stunde", "Mittwoch, 17. September · heute", lead="AUFGEGEBEN IN"))
    y += 66 + 26
    b.append(label(18, y, "Bis wann?", c)); y += 12
    rows, rh = choice_rows(18, y, 354, [("Nächste Mathe-Stunde", "Freitag, 19.09. · 1. Stunde"),
                                       ("Übernächste Mathe-Stunde", "Montag, 22.09. · 3. Stunde"),
                                       ("Anderes Datum", "im Kalender wählen")], 0, c)
    b.append(rows); y += rh + 26
    b.append(label(18, y, "Aufgabe", c)); y += 12
    b.append(field(18, y, 354, ["Buch S. 54, Nr. 3 a–d.", "Rechenweg aufschreiben."], c, h=78)); y += 78 + 18
    b.append(hint(18, y, "45 von 300 Zeichen · keine Namen, keine Links", c)); y += 30
    b.append(label(18, y, "Materialien · optional", c)); y += 12
    card, ch = mat_card(18, y, 354, MATS[:1], c, sub, "x", "Material anhängen"); b.append(card)
    b.append(button(18, H - 76, 354, "Speichern", c))
    return page(390, H, c, "".join(b))

def countdown(x, y, w, n, line1, line2, c):
    return (R(x + .5, y + .5, w - 1, 75, 22, c["card"], c["accent"], 1.2) + T(x + 16, y + 56, n, 50, 900, c["accink"])
            + T(x + 56, y + 33, line1, 15, 800, c["ink"]) + T(x + 56, y + 52, line2, 12.5, 400, c["muted"]))

def p_details(c, theme, sub):
    """14 «Klausur · Details»: verschobener Test — Hinweis, Beschreibung, Materialien."""
    inner, w, h = g.base("13 Klausuren", theme)
    inner = inner.replace(">Klausuren<", ">Tests<")
    H, top = 920, 196
    _, tint, text = sub["En"]
    b = [inner, sheet_bg(c, top, 390, H), circle_code(18, top + 30, "En", sub)]
    bd, bw = badge(74, top + 30, "TEST", c, "accent"); b.append(bd)
    bd2, bw2 = badge(74 + bw + 6, top + 30, "VERSCHOBEN", c, "tint"); b.append(bd2)
    b.append(T(74 + bw + bw2 + 14, top + 44, "Englisch", 13, 400, c["faint"]))
    b.append(T(74, top + 76, "Unit 3 Vocabulary", 26, 900, c["ink"], ls=-0.39))
    y = top + 98
    b.append(countdown(18, y, 354, "2", "Tage bis zum Test", "Freitag, 19. September · 4. Stunde", c)); y += 76 + 12
    b.append(note_box(18, y, 354, [S("Verschoben von Mi 17.09., 3. Stunde ", 700, c["ink"]),
                                   S("— die Stunde fällt aus. Automatisch.", 400, c["muted"])], c, MOVE)); y += 60 + 22
    b.append(label(18, y, "Was lernen, was mitbringen", c)); y += 12
    b.append(R(18, y, 354, 74, 20, c["card"]) + wrap_text(32, y + 30, ["Vokabeln Unit 3 (S. 180–184),", "auch die Beispielsätze."], c)); y += 74 + 22
    b.append(label(18, y, "Materialien", c)); y += 12
    card, ch = mat_card(18, y, 354, MATS[3:4], c, sub); b.append(card); y += ch + 14
    b.append(hint(18, y + 6, "eingetragen per Editor-Code · geändert vor 2 Std.", c))
    b.append(button(18, H - 132, 173, "Kalender", c, "sand", CAL) + button(199, H - 132, 173, "Teilen", c, "sand", SHARE))
    b.append(button(18, H - 76, 354, "Bearbeiten", c, icon=PEN))
    return page(390, H, c, "".join(b))

def p_tag(c, theme, sub):
    """05 «Tag · Liste»: под уроком — запись (Klassenarbeit, Hausaufgabe); у выпавшего — куда уехал тест."""
    b = [m19.p_tag_head(c, theme, "Mittwoch · heute", "17. September", accent=True)]
    rows = [(1, "De", False, (), None, None),
            (2, "Ma", False, ((BOOK, "Buch S. 54, Nr. 3 a–d", "muted", "Hausaufgabe: "),), None, None),
            (3, "En", False, ((MOVE, "Test Unit 3 → Fr 19.09., 4. Std", "accink", None),), "aus", None),
            (4, "Ph", False, ((FLAG, "Federpendel", "accink", "Leistungskontrolle: "),), None, None),
            (5, "Ge", False, (), None, None)]
    lst, y = m19.day_list(135.31, rows, c, sub); b.append(lst)
    b.append(T(18, y + 20, "Meine Notizen", 12.5, 800, c["faint"]) + T(372, y + 19.5, "+ Notiz", 13, 700, c["accink"], "end"))
    b.append(hint(18, y + 44, "Lange auf eine Stunde drücken:", c) + hint(18, y + 61, "Hausaufgabe oder Test eintragen.", c))
    return page(390, 760, c, "".join(b))

def nav_tests(c):
    """Untere Navigation Woche · Tests · Mehr (aus 22), mittlerer Platz aktiv, «Klausuren» heißt jetzt «Tests»."""
    out = [R(0, 744, 390, 100, 0, c["paper"]), R(16, 764, 358, 58, 29, c["card"]), R(16.5, 764.5, 357, 57, 28.5, "none", c["hair"])]
    cx = [16 + 358 * (i + 0.5) / 3 for i in range(3)]
    out.append(ICON(cx[0] - 10, 783, 0.83, c["muted"], '<rect x="3" y="4" width="18" height="16" rx="2"/>' + P("M3 10h18M9 4v16M15 4v16"), 2))
    pw = 96; x = cx[1] - pw / 2
    out.append(R(x, 771, pw, 44, 22, c["accent"]) + ICON(x + 21, 784, 0.75, c["on"], FLAG, 2.2) + T(x + 45, 797, "Tests", 13, 800, c["on"]))
    out.append(m22.dots_icon(cx[2] - 10, 783, 0.83, c["muted"]))
    return "".join(out)

def test_row(x, y, w, c, sub, day, wd, code, kind, std, topic, right, sel=False, moved=None):
    """Строка в «Tests»: бейджи вида (и VERSCHOBEN) + срок справа, тема, «Mathe · 1. Std», откуда перенесён."""
    h = 96 if moved else 78
    out = [R(x, y, w, h, 22, c["card"])]
    if sel: out.append(R(x + .5, y + .5, w - 1, h - 1, 21.5, "none", c["accent"], 1.2))
    out.append(g.date_tile(x + 12, y + 12, day, wd, code, sub))
    bd, bw = badge(x + 62, y + 11, kind.upper(), c, "accent" if kind == "Klassenarbeit" else "sand"); out.append(bd)
    if moved:
        bd2, _ = badge(x + 62 + bw + 6, y + 11, "VERSCHOBEN", c, "tint"); out.append(bd2)
    out.append(T(x + w - 14, y + 24.5, right, 12.5, 700, c["accink"] if sel else c["faint"], "end"))
    out.append(T(x + 62, y + 48, topic, 15, 800, c["ink"]))
    out.append(T(x + 62, y + 66, f"{NAMES[code]} · {std}", 12, 400, c["faint"]))
    if moved: out.append(ICON(x + 62, y + 74, 0.54, c["accink"], MOVE, 2.2) + T(x + 81, y + 85, moved, 12, 400, c["accink"]))
    return "".join(out), h

def p_tests(c, theme, sub):
    b = [eyebrow(18, 33, "Ab heute · 4 geplant", c), title(18, 65, "Tests", c), round_btn(334, 33.31, c, PLUS, primary=True)]
    chips, _ = type_chips(18, 88, 600, "Alle", c, ["Alle", "Klassenarbeit", "Leistungskontrolle", "Test"], h=33); b.append(chips)
    y = 146
    b.append(label(18, y, "Diese Woche", c)); y += 12
    r, h = test_row(18, y, 354, c, sub, "19", "FR", "Ma", "Klassenarbeit", "1. Std", "Quadratische Funktionen", "in 2 Tagen", sel=True); b.append(r); y += h + 8
    r, h = test_row(18, y, 354, c, sub, "19", "FR", "En", "Test", "4. Std", "Unit 3 Vocabulary", "in 2 Tagen",
                    moved="von Mi 17.09., 3. Std – fiel aus"); b.append(r); y += h + 26
    b.append(label(18, y, "Nächste Woche", c)); y += 12
    r, h = test_row(18, y, 354, c, sub, "23", "DI", "Ge", "Leistungskontrolle", "5. Std", "Weimarer Republik", "in 6 Tagen"); b.append(r); y += h + 8
    r, h = test_row(18, y, 354, c, sub, "25", "DO", "Ph", "Test", "3. Std", "Federpendel", "in 8 Tagen"); b.append(r); y += h + 8
    b.append(nav_tests(c))
    return page(390, 844, c, "".join(b))

def type_list(x, y, w, c, rh=62, sel=None):
    out = [R(x, y, w, rh * len(TYPES), 22, c["card"])]
    for i, (name, short, n) in enumerate(TYPES):
        ry = y + i * rh
        if i: out.append(HLINE(x + 14, x + w - 14, ry, c))
        if sel == i: out.append(R(x + 4, ry + 4, w - 8, rh - 8, 18, c["tint"]))
        out.append(f'<g transform="translate({x + 10} {ry + rh / 2 - 9}) scale(0.75 0.75)" fill="{c["faint2"]}">{GRIP}</g>')
        out.append(T(x + 36, ry + 27, name, 15, 700, c["ink"]))
        bd, bw = badge(x + 36, ry + 35, short, c, "sand"); out.append(bd)
        out.append(T(x + 36 + bw + 8, ry + 48, f"{n} Einträge" if n != 1 else "1 Eintrag", 12, 400, c["faint"]))
        out.append(ICON(x + w - 34, ry + rh / 2 - 9, 0.71, c["muted"], PEN, 2))
    return "".join(out), rh * len(TYPES)

def admin_arten(c, x=18, w=354, y=96):
    b = [hint(x, y + 4, "So heißen die Einträge in Tests, Woche und Tag.", c),
         hint(x, y + 21, "Kürzel stehen in der Woche. Ziehen = Reihenfolge.", c)]
    y += 38
    lst, lh = type_list(x, y, w, c); b.append(lst); y += lh + 12
    b.append(tint_button(x, y, w, "Art hinzufügen", c, PLUS)); y += 48 + 30
    b.append(label(x, y, "Wenn eine Stunde ausfällt", c)); y += 12
    b.append(g.switch_row(x, y, w, "Tests verschieben", "auf die nächste Stunde des Fachs", True, c)); y += 67 + 10
    b.append(g.switch_row(x, y, w, "Hausaufgaben verschieben", "Abgabe rutscht mit, wenn sie an der Stunde hängt", True, c)); y += 67 + 10
    b.append(hint(x, y + 8, "Verschobene Einträge zeigen „verschoben von …“.", c))
    return "".join(b)

def p_admin_arten(c, theme, sub, overlay_kind=None):
    H = 844
    b = [head(c, "Admin · Einstellungen", "Arten von Tests", accent=False), admin_arten(c)]
    if overlay_kind == "edit": b.append(edit_sheet(c, H=H))
    if overlay_kind == "delete": b.append(overlay(c, 390, H) + delete_dialog(c, 18, 270, 354))
    return page(390, H, c, "".join(b))

def edit_sheet(c, top=400, H=844):
    b = [sheet_bg(c, top, 390, H), eyebrow(18, top + 42, "Arten von Tests", c), title(18, top + 74, "Art bearbeiten", c, 26)]
    y = top + 100
    b.append(label(18, y, "Name", c)); b.append(field(18, y + 12, 354, ["Leistungskontrolle"], c)); y += 12 + 52 + 26
    b.append(label(18, y, "Kürzel · bis 4 Zeichen", c))
    b.append(field(18, y + 12, 120, ["LK"], c))
    b.append(T(156, y + 38, "In der Woche:", 12.5, 400, c["faint"]))
    _, tint, text = g.SUBJ["hell" if c is g.LIGHT else "dunkel"]["Ge"]
    b.append(R(256, y + 12, 62.8, 52, 14, tint) + T(266, y + 32, "Ge", 13, 800, text) + T(266, y + 50, "108", 10.5, 400, c["muted"]))
    bd, _ = badge(290, y + 4, "LK", c, "accent"); b.append(bd)
    b.append(button(18, H - 132, 354, "Speichern", c))
    b.append(button(18, H - 76, 354, "Löschen", c, "danger", TRASH))
    return "".join(b)

def delete_dialog(c, x, y, w, pc=False):
    h = 262
    b = [R(x, y, w, h, 26, c["paper"], extra=' filter="url(#nsh0)"')]
    b.append(T(x + 20, y + 40, "„Abgabe“ löschen?", 20, 900, c["ink"]))
    b.append(T(x + 20, y + 66, "1 Eintrag hat diese Art. Er bekommt dann:", 13.5, 400, c["muted"]))
    b.append(R(x + 20, y + 84, w - 40, 52, 16, c["field"]) + T(x + 37, y + 115, "Test", 15.5, 400, c["ink"])
             + ICON(x + w - 52, y + 102, 0.71, c["muted"], CHEV_D, 2))
    b.append(T(x + 20, y + 160, "Die Liste ändert sich für alle in der Klasse.", 12, 400, c["faint"]))
    bw = (w - 48) / 2
    b.append(button(x + 20, y + h - 70, bw, "Abbrechen", c, "sand", None) + button(x + 28 + bw, y + h - 70, bw, "Löschen", c, "danger", TRASH))
    return "".join(b)

# ════════════════ Computer ════════════════
def pc_page(name, theme, c, replace=()):
    inner, w, h = g.base(name, theme, "PC")
    for a, bb in replace: inner = inner.replace(a, bb)
    return inner + m22.pc_sidebar(inner, c, False), w, h

def pc_menue(c, theme, sub):
    inner, w, h = pc_page("06 Tag · Liste", theme, c, [(">Klausuren<", ">Tests<"), (">Klausur · Mathe<", ">KA · Mathe<"), ("Fr · Klausur Mathe", "Fr · Klassenarbeit Mathe")])
    card, H = menu_card(640, 470, 270, c, rh=38, pc=True)
    return page(w, h, c, inner + card)

def pc_form(c, theme, sub):
    inner, w, h = pc_page("14 Klausuren", theme, c, [(">Klausuren<", ">Tests<"), (">Klausur eintragen<", ">Test eintragen<"),
                                                    (">Klausur Mathe<", ">Klassenarbeit Mathe<"), (">Klausur · Mathe<", ">KA · Mathe<")])
    x, y, W, Hd = 360, 92, 720, 716
    b = [inner, overlay(c, w, h), R(x, y, W, Hd, 28, c["paper"], extra=' filter="url(#nsh0)"')]
    b.append(eyebrow(x + 28, y + 40, "Editor · Code A", c) + title(x + 28, y + 74, "Test eintragen", c, 28))
    b.append(R(x + W - 64, y + 22, 36, 36, 18, c["card"]) + ICON(x + W - 54, y + 32, 0.67, c["ink"], CLOSE, 2.2))
    lx, rx, cw = x + 28, x + 376, 316
    ly = y + 100
    b.append(for_card(lx, ly, cw, c, sub, "Ma", "Mathe · 1. Stunde", "Fr, 19. September · 07:30", lead="FÜR DIE STUNDE"))
    ly += 66 + 26
    b.append(label(lx, ly, "Art", c)); ly += 12
    chips, chh = type_chips(lx, ly, cw, "Klassenarbeit", c); b.append(chips); ly += chh + 30
    b.append(label(lx, ly, "Thema", c)); ly += 12
    b.append(field(lx, ly, cw, ["Quadratische Funktionen"], c)); ly += 52 + 18
    b.append(hint(lx, ly, "23 von 60 Zeichen · keine Namen", c)); ly += 26
    b.append(note_box(lx, ly, cw, [S("Fällt die Stunde aus, ", 700, c["ink"]) + S("rutscht der", 400, c["muted"]),
                                   g.esc("Test auf die nächste Mathe-Stunde.")], c, MOVE))
    ry = y + 100
    b.append(label(rx, ry, "Was lernen, was mitbringen · optional", c)); ry += 12
    b.append(field(rx, ry, cw, ["Buch S. 40–58 und die Aufgaben", "vom Arbeitsblatt. Taschenrechner", "und Geodreieck mitbringen."], c, h=98)); ry += 98 + 18
    b.append(hint(rx, ry, "88 von 300 Zeichen · Links bitte als Material", c)); ry += 30
    b.append(label(rx, ry, "Materialien · optional", c)); ry += 12
    card, _ = mat_card(rx, ry, cw, MATS[:2], c, sub, "x", "Material anhängen"); b.append(card)
    fy = y + Hd - 76
    b.append(R(x + 28, fy - 8, W - 56, 1, 0, c["hair"]))
    b.append(button(x + W - 28 - 150 - 10 - 130, fy + 8, 130, "Abbrechen", c, "sand", None) + button(x + W - 28 - 150, fy + 8, 150, "Speichern", c))
    b.append(T(x + 28, fy + 37, "Strg + Enter speichert", 12, 400, c["faint"]))
    return page(w, h, c, "".join(b))

def pc_admin(c, theme, sub):
    inner, w, h = g.base("47 Admin · Einstellungen", theme, "PC")
    inner = inner.replace(">Klausuren<", ">Tests<").replace("Alle Klausuren löschen", "Alle Tests löschen")
    x, y, W, Hd = 470, 90, 500, 690
    b = [inner, overlay(c, w, h), R(x, y, W, Hd, 28, c["paper"], extra=' filter="url(#nsh0)"')]
    b.append(eyebrow(x + 28, y + 40, "Admin · Einstellungen", c) + title(x + 28, y + 74, "Arten von Tests", c, 28))
    b.append(R(x + W - 64, y + 22, 36, 36, 18, c["card"]) + ICON(x + W - 54, y + 32, 0.67, c["ink"], CLOSE, 2.2))
    b.append(admin_arten(c, x + 28, W - 56, y + 100))
    return page(w, h, c, "".join(b))

SCREENS = {
    "handy-01-menue": p_menue,
    "handy-02-menue-ohne-code": lambda c, t, s: p_menue(c, t, s, True),
    "handy-03-stunde": p_stunde,
    "handy-04-test-eintragen": p_test_form,
    "handy-05-material-anhaengen": lambda c, t, s: p_test_form(c, t, s, True),
    "handy-06-hausaufgabe": p_hausaufgabe,
    "handy-07-tag": p_tag,
    "handy-08-tests": p_tests,
    "handy-09-test-details": p_details,
    "handy-10-admin-arten": p_admin_arten,
    "handy-11-art-bearbeiten": lambda c, t, s: p_admin_arten(c, t, s, "edit"),
    "handy-12-art-loeschen": lambda c, t, s: p_admin_arten(c, t, s, "delete"),
    "pc-01-menue": pc_menue,
    "pc-02-test-eintragen": pc_form,
    "pc-03-admin-arten": pc_admin,
}
if __name__ == "__main__":
    n = 0
    for theme, c in (("hell", g.LIGHT), ("dunkel", g.DARK)):
        for name, fn in SCREENS.items():
            open(os.path.join(OUT, f"{name}-{theme}.svg"), "w", encoding="utf-8").write(fn(c, theme, g.SUBJ[theme]))
            n += 1
    print(n, "files")
