# Генератор макетов части 15 «Materialien» — ссылки на Google Drive / OneDrive по предметам.
# Помощники, цвета и меню берём из генератора части 14 (те же токены Soft, что и раньше).
# Основа — оригиналы ORBook Soft: 22 «Mehr», 07 «Stunde · Details», 13/14 «Klausuren», 43 «Code-Aktionen»,
# 16/17 «Klausur eintragen», 36 «Klausuren · leer», 38 «Toasts», PC 08/14/17/18.
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else HERE
_spec = importlib.util.spec_from_file_location("g14", os.path.join(HERE, "..", "14-lehrkraefte", "gen.py"))
g = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(g)
T, S, R, ICON, P, label, eyebrow, title, button, round_btn, note_box, svg, overlay, base, chip, form_chip, badge, checkbox = (
    g.T, g.S, g.R, g.ICON, g.P, g.label, g.eyebrow, g.title, g.button, g.round_btn, g.note_box, g.svg, g.overlay, g.base,
    g.chip, g.form_chip, g.badge, g.checkbox)
CHECK, CHEV_R, BACK, CLOSE, PLUS, PEN, TRASH, COPY, SHARE, LOCK, USER, KEY = (
    g.CHECK, g.CHEV_R, g.BACK, g.CLOSE, g.PLUS, g.PEN, g.TRASH, g.COPY, g.SHARE, g.LOCK, g.USER, g.KEY)
NAMES = g.NAMES
g.LIGHT.update(skel="#EEE7DE", toastbg="#2A2433", toastfg="#FBF7F2")
g.DARK.update(skel="#27222F", toastbg="#F4F0F8", toastfg="#16131C")
g.tw = lambda t, size, w=700: len(t) * size * 0.62  # rsvg рисует шире Nunito — оценка с запасом

# ── Иконки (контурные, как lucide) ──
FOLDER = P("M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z")
FILE = P("M6 3h9l5 5v13H6z") + P("M14 3v6h6")
SHEET_I = P("M6 3h9l5 5v13H6z") + P("M14 3v6h6M9 13h7M9 17h7M12.5 11v8")
SLIDES = '<rect x="3" y="5" width="18" height="12" rx="2"/>' + P("M12 17v4M8 21h8")
EXT = P("M14 4h6v6M20 4l-9 9") + P("M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5")
LINK = P("M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1") + P("M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1")
WARN = P("M12 4l9 16H3zM12 10v4M12 17h.01")
INFO = '<circle cx="12" cy="12" r="9"/>' + P("M12 11v5M12 8h.01")
KIND_ICON = {"Ordner": FOLDER, "PDF": FILE, "Dokument": FILE, "Word": FILE, "Tabelle": SHEET_I, "Präsentation": SLIDES}

# ── Данные-примеры ── (Fach, Titel, Anbieter, Art, von, Datum); von=None — по Editor-Code, без имени
MATERIALS = [
    ("Ma", "Arbeitsblätter Analysis", "Google Drive", "Ordner", "Mü", "12. Sept"),
    ("Ma", "Lösungen Übungsklausur", "Google Drive", "PDF", "Mü", "15. Sept"),
    ("De", "Lektüre: Der Sandmann", "OneDrive", "Ordner", "Kle", "3. Sept"),
    ("En", "Vocabulary Unit 2", "OneDrive", "Word", None, "10. Sept"),
    ("Ph", "Vorlage Versuchsprotokoll", "Google Drive", "Dokument", "Ric", "8. Sept"),
    ("Ph", "Formelsammlung Mechanik", "Google Drive", "PDF", "Ric", "1. Sept"),
]
ORDER = ["Ma", "De", "En", "Ph"]

def meta(prov, kind, who):  # «Google Drive · Ordner · von Mü»
    return f"{prov} · {kind}" + (f" · von {who}" if who else "")

def tile(x, y, code, kind, sub, s=40):
    """Плитка в цвете предмета с иконкой вида файла (как Datumsfeld в 13, только с иконкой)."""
    _, tint, text = sub[code]
    k = 0.75 * s / 40
    return R(x, y, s, s, 12, tint) + ICON(x + s / 2 - 12 * k, y + s / 2 - 12 * k, k, text, KIND_ICON[kind], 2)

def mat_row(x, y, w, m, c, sub, sel=False, h=64, fresh=False):
    code, ttl, prov, kind, who, _ = m
    out = [R(x, y, w, h, 22, c["card"])]
    if sel: out.append(R(x + .5, y + .5, w - 1, h - 1, 21.5, "none", c["accent"]))
    out.append(tile(x + 12, y + 12, code, kind, sub))
    out.append(T(x + 64, y + 28, ttl, 14.5, 800, c["ink"]))
    out.append(T(x + 64, y + 47, meta(prov, kind, who), 11.5, 400, c["faint"]))
    if fresh:
        bd, bw = badge(x + w - 50 - 44, y + 22.5, "NEU", c, "tint"); out.append(bd)
    out.append(ICON(x + w - 34, y + h / 2 - 9, 0.75, c["faint"], EXT, 2))
    return "".join(out)

def mat_list(x, y, w, c, sub, codes=ORDER, sel=None, fresh=None, gap=72, cols=1, colw=None):
    """Список, сгруппированный по предметам: «Mathe · 2», потом карточки."""
    out = []
    for code in codes:
        items = [m for m in MATERIALS if m[0] == code]
        out.append(T(x, y + 12, f"{NAMES[code]} · {len(items)}", 12.5, 800, c["faint"])); y += 24
        for m in items:
            out.append(mat_row(x, y, w, m, c, sub, sel=m[1] == sel, fresh=m[1] == fresh)); y += gap
        y += 14
    return "".join(out), y

def toast(x, y, w, text, c, icon=CHECK):
    return R(x, y, w, 46, 16, c["toastbg"]) + ICON(x + 14, y + 15, 0.67, c["toastfg"], icon) + T(x + 40, y + 28, text, 13.5, 600, c["toastfg"])

def sheet_bg(c, top, W=390, H=844):
    return (overlay(c, W, H) + f'<path d="M30,{top} H{W - 30} A30,30 0 0 1 {W},{top + 30} V{H} H0 V{top + 30} A30,30 0 0 1 30,{top} Z" fill="{c["paper"]}"/>'
            + R(W / 2 - 19, top + 10, 38, 4, 2, c["faint2"]))

def menu_rows(x, y, w, rows, c, rh=50):
    """Белая карточка со строками «иконка — текст — подпись — ›», как в 43 «Code-Aktionen»."""
    out = [R(x, y, w, len(rows) * rh + 4, 22, c["card"])]
    for i, (icon, text, right, danger) in enumerate(rows):
        ry = y + 2 + i * rh
        if i: out.append(f'<line x1="{x + 14}" y1="{ry}" x2="{x + w - 14}" y2="{ry}" stroke="{c["hair"]}" stroke-width="1"/>')
        col = c["danger"] if danger else c["ink"]
        out.append(ICON(x + 14, ry + 15.5, 0.79, c["danger"] if danger else c["muted"], icon, 1.9))
        out.append(T(x + 45, ry + 31.5, text, 14.5, 500, col))
        if right: out.append(T(x + w - 38, ry + 30.5, right, 13, 400, c["faint"], "end"))
        if not danger: out.append(ICON(x + w - 30, ry + 17, 0.67, c["faint2"], CHEV_R))
    return "".join(out)

# ════════════════ Telefon ════════════════
def nav_mehr(theme):
    inner, w, h = base("22 Mehr", theme)
    i = inner.find('<rect x="16" y="820"')
    return f'<g transform="translate(0 -56)">{inner[i:inner.rindex("</g>")]}</g>'  # 22 Mehr — 900 высотой, у нас 844

def p_head(c, sub_text="Mehr · 6 Links"):
    return (round_btn(18, 33.31, c, BACK) + eyebrow(66, 33, sub_text, c) + title(66, 65, "Materialien", c)
            + round_btn(334, 33.31, c, PLUS, primary=True))

def p_chips(y, c, sub, active=None):
    x = 18
    on, w = chip(x, y, "Alle", c, on=active is None); out = [on]; x += w + 6.5
    for code in ORDER:
        ch, w = chip(x, y, code, c, dot=sub[code][0], on=code == active); out.append(ch); x += w + 6.5
    return "".join(out)

def p_list(c, theme, sub, state="normal"):
    b = [p_head(c, "Mehr" if state == "laden" else "Mehr · 6 Links"), p_chips(88, c, sub)]
    if state == "laden":
        y = 140
        for n in (2, 1, 1):
            b.append(R(18, y + 2, 90, 11, 5.5, c["skel"])); y += 24
            for _ in range(n):
                b.append(R(18, y, 354, 64, 22, c["card"]) + R(30, y + 12, 40, 40, 12, c["skel"])
                         + R(82, y + 17, 170, 12, 6, c["skel"]) + R(82, y + 38, 120, 9, 4.5, c["skel"]))
                y += 72
            y += 14
        b.append(nav_mehr(theme)); return svg(390, 844, c, "".join(b))
    rows, y = mat_list(18, 140, 354, c, sub, codes=["Ma", "De", "En"],
                       fresh="Lösungen Übungsklausur" if state == "gespeichert" else None)
    b.append(rows)
    b.append(T(18, y + 12, "Physik · 2", 12.5, 800, c["faint"]))
    b.append(mat_row(18, y + 24, 354, MATERIALS[4], c, sub))
    if state == "gespeichert":
        b.append(toast(18, 704, 354, "Gespeichert · die Klasse sieht den Link", c))
    b.append(nav_mehr(theme))
    if state == "aktionen": b.append(actions_sheet(c, sub))
    if state == "loeschen": b.append(overlay(c, 390, 844) + delete_dialog(c, 18, 287, 354))
    return svg(390, 844, c, "".join(b))

def actions_sheet(c, sub, top=388):
    """Lange drücken auf einen Link (wie 09 Stunde · Menü / 43 Code-Aktionen)."""
    m = MATERIALS[0]
    b = [sheet_bg(c, top)]
    b.append(tile(18, top + 32, "Ma", "Ordner", sub, 44))
    b.append(T(74, top + 46, "Mathe · Google Drive · Ordner", 12.5, 800, c["faint"]))
    b.append(T(74, top + 72, m[1], 20, 900, c["ink"], ls=-0.3))
    b.append(round_btn(338, top + 30, c, CLOSE, size=34))
    b.append(ICON(18, top + 96, 0.54, c["faint"], LINK) + T(36, top + 107, "drive.google.com/drive/folders/1aX…", 12.5, 400, c["muted"]))
    b.append(menu_rows(18, top + 124, 354, [(EXT, "Öffnen", "in Google Drive", False), (COPY, "Link kopieren", None, False),
                                             (SHARE, "Teilen", None, False), (PEN, "Bearbeiten", None, False),
                                             (TRASH, "Löschen", None, True)], c))
    b.append(T(18, top + 124 + 254 + 22, "Eingetragen von Mü · 12. Sept", 12, 400, c["faint"]))
    return "".join(b)

def delete_dialog(c, x, y, w, pc=False):
    """Bestätigung wie 17 «Klausur löschen»: Mülleimer, Frage, Text, zwei Knöpfe."""
    h = 236 if pc else 250
    b = [R(x, y, w, h, 28, c["paper"], extra=' filter="url(#nsh0)"'), R(x, y, w, h, 28, c["paper"])]
    b.append(R(x + 26, y + 24, 44, 44, 22, c["dtint"]) + ICON(x + 36, y + 34, 1, c["danger"], TRASH, 1.9))
    b.append(T(x + 26, y + 102, "Link löschen?", 25 if pc else 22, 900, c["ink"], ls=-0.35))
    lines = (["„Arbeitsblätter Analysis“ verschwindet für die ganze Klasse.", "Der Ordner in Google Drive bleibt unverändert."] if pc else
             ["„Arbeitsblätter Analysis“ verschwindet", "für die ganze Klasse. Der Ordner in", "Google Drive bleibt unverändert."])
    for i, ln in enumerate(lines):
        b.append(T(x + 26, y + 130 + i * 20, ln, 14, 400, c["muted"]))
    ly = y + h - 66
    if pc:
        b.append(f'<line x1="{x + 26}" y1="{ly}" x2="{x + w - 26}" y2="{ly}" stroke="{c["hair"]}" stroke-width="1"/>')
        b.append(button(x + w - 26 - 112 - 8 - 112, ly + 12, 112, "Abbrechen", c, "sand", None))
        b.append(button(x + w - 26 - 112, ly + 12, 112, "Löschen", c, "danger", TRASH))
    else:
        bw = (w - 52 - 8) / 2
        b.append(button(x + 26, ly + 6, bw, "Abbrechen", c, "sand", None) + button(x + 26 + bw + 8, ly + 6, bw, "Löschen", c, "danger", TRASH))
    return "".join(b)

def link_field(x, y, w, c, state, h=52):
    """Поле «Link»: вставили ссылку → под полем видно, что распознано (или ошибка)."""
    url = {"ok": "drive.google.com/drive/folders/1aX9…", "fehler": "dropbox.com/scl/fo/8kq2m…",
           "leer": None}[state]
    out = [R(x, y, w, h, 16, c["field"])]
    if state == "fehler": out.append(R(x + 1, y + 1, w - 2, h - 2, 15, "none", c["danger"], 2))
    out.append(ICON(x + 15, y + h / 2 - 9, 0.75, c["faint"], LINK))
    out.append(T(x + 44, y + h / 2 + 5.5, url or "Link einfügen", 15, 400, c["ink"] if url else c["faint2"]))
    if state == "ok":
        out.append(ICON(x, y + h + 11, 0.62, c["ok"], CHECK, 2.4) + T(x + 20, y + h + 23, S("Erkannt: Google Drive · Ordner", 700, c["ok"]), 12.5, 400, c["faint"], raw=True))
    elif state == "fehler":
        out.append(T(x, y + h + 22, "Nur Links von Google Drive oder OneDrive.", 12.5, 400, c["danger"]))
    else:
        out.append(T(x, y + h + 22, "Aus Google Drive oder OneDrive: „Teilen“ → „Link kopieren“.", 12, 400, c["faint"]))
    return "".join(out)

def p_form(c, theme, sub, state="ok"):
    b = [round_btn(18, 33.31, c, BACK), eyebrow(66, 33, "Lehrkraft · Mü", c, accent=True), title(66, 65, "Neuer Link", c)]
    b.append(label(18, 105, "Fach", c))
    x, y = 18, 117
    for code in ("Ma", "Ph"):
        ch, w = form_chip(x, y, code, NAMES[code], c, sub, on=code == "Ma"); b.append(ch); x += w + 8
    b.append(T(18, y + 58, "Nur Ihre Fächer laut Plan.", 12, 400, c["faint"]))
    y = 205
    b.append(label(18, y, "Link", c))
    b.append(link_field(18, y + 10, 354, c, state))
    y += 116
    b.append(label(18, y, "Titel", c))
    b.append(R(18, y + 10, 354, 52, 16, c["field"]))
    b.append(T(35, y + 41.5, "Arbeitsblätter Analysis" if state != "leer" else "z. B. Arbeitsblätter Analysis", 16, 400, c["ink"] if state != "leer" else c["faint2"]))
    b.append(T(18, y + 82, "23 von 80 Zeichen" if state != "leer" else "So steht es in der Liste.", 12, 400, c["faint"]))
    y += 108
    b.append(note_box(18, y, 354, ["In Drive „Jeder mit dem Link“ wählen,", "sonst kommt nur „Zugriff anfordern“."], c, INFO))
    b.append(note_box(18, y + 72, 354, ["Keine Dateien mit Namen oder Noten", "von Schülern. Die Klasse sieht „von Mü“."], c, LOCK))
    b.append(button(18, 764, 354, "Speichern", c) if state == "ok" else
             f'<g opacity="0.45">{button(18, 764, 354, "Speichern", c)}</g>')
    return svg(390, 844, c, "".join(b))

def p_leer(c, theme, sub):
    b = [p_head(c, "Mehr · noch nichts geteilt")]
    b.append(R(163, 254.47, 64, 64, 32, c["tint"]) + ICON(181, 272.47, 1.17, c["accink"], FOLDER, 1.8))
    b.append(T(195, 355.47, "Noch keine Materialien", 25, 900, c["ink"], "middle", -0.37))
    for i, ln in enumerate(["Hier landen Links zu Arbeitsblättern,", "Lösungen und Ordnern – aus Google", "Drive oder OneDrive, sortiert nach Fach."]):
        b.append(T(195, 388.47 + i * 21.7, ln, 14, 400, c["muted"], "middle"))
    b.append(button(105, 470, 180, "Link teilen", c, "sand", PLUS))
    b.append(T(195, 540, "Teilen dürfen Lehrkräfte und Codes mit Recht.", 12, 400, c["faint"], "middle"))
    b.append(nav_mehr(theme))
    return svg(390, 844, c, "".join(b))

def p_stunde(c, theme, sub):
    """07 «Stunde · Details»: под «Info» новый блок «Materialien · Mathe», кнопки уезжают вниз."""
    inner, w, h = base("07 Stunde · Details (Blatt)", theme)
    dy = 168
    b = [g.split_shift(inner, 908, dy, w, h), R(0, 908, 390, dy, 0, c["paper"])]
    y = 922
    b.append(T(18, y + 12, "Materialien · Mathe", 12.5, 800, c["faint"]) + T(372, y + 12, "Alle", 13, 700, c["accink"], "end"))
    y += 24
    b.append(R(18, y, 354, 124, 22, c["card"]))
    for i, m in enumerate(MATERIALS[:2]):
        ry = y + 2 + i * 60
        if i: b.append(f'<line x1="32" y1="{ry}" x2="358" y2="{ry}" stroke="{c["hair"]}" stroke-width="1"/>')
        b.append(tile(30, ry + 12, "Ma", m[3], sub, 36))
        b.append(T(78, ry + 27, m[1], 14, 700, c["ink"]) + T(78, ry + 45, meta(m[2], m[3], m[4]), 11.5, 400, c["faint"]))
        b.append(ICON(340, ry + 21, 0.67, c["faint"], EXT, 2))
    return svg(w, h + dy, c, "".join(b))

def p_mehr(c, theme, sub):
    """22 «Mehr»: новая секция «Klasse» с одной строкой «Materialien»."""
    inner, w, h = base("22 Mehr", theme)
    dy = 102
    b = [g.split_shift(inner, 330, dy, w, 760), R(0, 330, 390, dy, 0, c["paper"])]
    b.append(T(18, 352.81, "Klasse", 12.5, 800, c["faint"]))
    b.append(R(18, 367.31, 354, 54, 22, c["card"]))
    b.append(ICON(32, 384.31, 0.79, c["muted"], FOLDER, 1.9) + T(63, 399.31, "Materialien", 14.5, 500, c["ink"]))
    b.append(T(334, 398.31, "6 Links", 13, 400, c["faint"], "end") + ICON(342, 385.81, 0.67, c["faint2"], CHEV_R))
    i = inner.find('<rect x="16" y="820"')  # нижняя навигация — на старом месте
    b.append(R(0, 800, 390, 100, 0, c["paper"]) + inner[i:inner.rindex("</g>")])
    return svg(w, h, c, "".join(b))

def p_codes(c, theme, sub):
    """42 «Neuer Code»: новое право «Materialien teilen» (у Editor- и Lehrer-Codes)."""
    inner, w, h = base("42 Admin · neuer Code", theme)
    dy = 46
    b = [g.split_shift(inner, 352, dy, w, h), R(0, 352, 390, dy, 0, c["paper"])]
    bd, _ = badge(22 + 34 + 136, 366.81, "NEU", c, "tint")
    b.append(checkbox(22, 366.31, True, c) + T(56, 380.81, "Materialien teilen", 14.5, 400, c["ink"]) + bd)
    return svg(w, h + dy, c, "".join(b))

# ════════════════ Computer ════════════════
SIDE_ITEMS_Y = 330  # neuer Menüpunkt unter «Statistik»

def pc_sidebar(c, theme, inner, active="Materialien"):
    """Seitenleiste aus 14 «Klausuren»: «Bald» rutscht 46 px nach unten, darüber neuer Punkt «Materialien»."""
    dy = 46
    y0, y1, X0, X1 = 335, 640, 16, 248
    clip = (f'<clipPath id="sbA"><rect x="0" y="0" width="1440" height="{y0}"/><rect x="0" y="{y1 + dy}" width="1440" height="900"/>'
            f'<rect x="{X1}" y="0" width="{1440 - X1}" height="900"/></clipPath>'
            f'<clipPath id="sbB"><rect x="{X0}" y="{y0}" width="{X1 - X0}" height="{y1 - y0}"/></clipPath>')
    out = [clip, f'<g clip-path="url(#sbA)">{inner}</g>', R(X0, y0, X1 - X0, y1 - y0 + dy, 0, c["card"]),
           f'<g transform="translate(0 {dy})"><g clip-path="url(#sbB)">{inner}</g></g>']
    if active == "Materialien":
        # «Klausuren» wieder normal
        out.append(R(24, 232, 216, 54, 0, c["card"]))
        out.append(ICON(42, 249.5, 0.79, c["muted"], P("M5 21V4h12l-2 4 2 4H5"), 2) + T(73, 264, "Klausuren", 14.5, 700, c["muted"]))
        out.append(R(200, 249, 22, 20, 10, c["sand"]) + T(211, 262.5, "5", 11, 700, c["muted"], "middle"))
        out.append(R(30, SIDE_ITEMS_Y, 204, 42, 21, c["accent"]))
        out.append(ICON(42, SIDE_ITEMS_Y + 11.5, 0.79, c["on"], FOLDER, 2) + T(73, SIDE_ITEMS_Y + 26, "Materialien", 14.5, 800, c["on"]))
    else:
        out.append(ICON(42, SIDE_ITEMS_Y + 11.5, 0.79, c["muted"], FOLDER, 2) + T(73, SIDE_ITEMS_Y + 26, "Materialien", 14.5, 700, c["muted"]))
    return "".join(out)

def pc_base(c, theme):
    inner, w, h = base("14 Klausuren", theme, "PC")
    return pc_sidebar(c, theme, inner) + R(256, 0, 1440 - 256, 900, 0, c["paper"])

def pc_list(c, sub, state="normal"):
    b = [eyebrow(284, 39, "Noch nichts geteilt" if state == "leer" else "6 Links · Google Drive und OneDrive", c), title(284, 80, "Materialien", c, 38)]
    b.append(R(1040, 45, 158, 36, 18, c["card"]) + ICON(1052, 55, 0.58, c["faint"], g.SEARCH) + T(1072, 68, "Titel oder Fach", 13, 400, c["faint2"]))
    b.append(button(1206, 40, 198, "Link teilen", c, icon=PLUS, h=46))
    x = 284
    on, w = chip(x, 111, "Alle", c, on=True); b.append(on); x += w + 6
    for code in ORDER:
        ch, w = chip(x, 111, NAMES[code], c, dot=sub[code][0]); b.append(ch); x += w + 6
    if state == "leer":
        cx = 844
        b.append(R(cx - 32, 300, 64, 64, 32, c["tint"]) + ICON(cx - 14, 318, 1.17, c["accink"], FOLDER, 1.8))
        b.append(T(cx, 404, "Noch keine Materialien", 28, 900, c["ink"], "middle", -0.42))
        for i, ln in enumerate(["Hier landen Links zu Arbeitsblättern, Lösungen und Ordnern –", "aus Google Drive oder OneDrive, sortiert nach Fach."]):
            b.append(T(cx, 438 + i * 22, ln, 14.5, 400, c["muted"], "middle"))
        b.append(button(cx - 100, 494, 200, "Link teilen", c, "sand", PLUS))
        b.append(T(cx, 566, "Teilen dürfen Lehrkräfte und Codes mit dem Recht „Materialien teilen“.", 12, 400, c["faint"], "middle"))
        return "".join(b)
    # zwei Spalten: links Mathe + Deutsch, rechts Englisch + Physik
    col1, _ = mat_list(284, 160, 552, c, sub, codes=["Ma", "De"], sel="Arbeitsblätter Analysis" if state == "menu" else None)
    col2, _ = mat_list(852, 160, 552, c, sub, codes=["En", "Ph"])
    b += [col1, col2]
    b.append(ICON(284, 858, 0.54, c["faint"], LOCK) + T(302, 869, "Links öffnen sich in Google Drive oder OneDrive. ORBook speichert nur den Link, keine Dateien.", 12, 400, c["faint"]))
    if state == "menu":  # Rechtsklick / ⋯ — Menü wie 10 «Rechtsklick-Menü»
        mx, my, mw = 560, 150, 236
        items = [(EXT, "Öffnen", "↵"), (COPY, "Link kopieren", "⌘C"), (SHARE, "Teilen", None), (PEN, "Bearbeiten", "E"), (TRASH, "Löschen", "⌫")]
        hh = 12 + 40 * len(items) + 9
        b.append(R(mx, my, mw, hh, 18, c["card"], extra=' filter="url(#nsh0)"') + R(mx, my, mw, hh, 18, c["card"], c["hair"]))
        for i, (ic, t, k) in enumerate(items):
            oy = my + 6 + i * 40 + (9 if i == 4 else 0)
            if i == 4: b.append(f'<line x1="{mx + 12}" y1="{oy - 5}" x2="{mx + mw - 12}" y2="{oy - 5}" stroke="{c["hair"]}" stroke-width="1"/>')
            if i == 0: b.append(R(mx + 6, oy, mw - 12, 40, 12, c["tint"]))
            col = c["danger"] if i == 4 else (c["accink"] if i == 0 else c["ink"])
            b.append(ICON(mx + 18, oy + 11, 0.75, col, ic, 2) + T(mx + 48, oy + 25, t, 14, 700 if i == 0 else 400, col))
            if k: b.append(T(mx + mw - 18, oy + 25, k, 12, 600, c["faint"], "end"))
    return "".join(b)

def pc_page(c, theme, sub, state="normal"):
    b = [pc_base(c, theme), pc_list(c, sub, state)]
    if state == "gespeichert":
        b.append(toast(1044, 830, 360, "Gespeichert · die Klasse sieht den Link", c))
    if state == "loeschen":
        b.append(overlay(c, 1440, 900) + delete_dialog(c, 470, 330, 500, pc=True))
    return svg(1440, 900, c, "".join(b))

def pc_form(c, theme, sub, state="ok"):
    b = [pc_base(c, theme), pc_list(c, sub), overlay(c, 1440, 900)]
    X, Y, W, H = 400, 140, 640, 600
    for f in ("nsh0", "nsh1", None):
        b.append(R(X, Y, W, H, 28, c["paper"], extra=f' filter="url(#{f})"' if f else ""))
    b.append(g.modal_head(X, Y, W, "Lehrkraft · Mü", "Neuer Link", c, accent=True))
    L = X + 26
    y = Y + 107
    b.append(label(L, y, "Fach", c))
    x = L
    for code in ("Ma", "Ph"):
        ch, w = form_chip(x, y + 12, code, NAMES[code], c, sub, on=code == "Ma"); b.append(ch); x += w + 8
    b.append(T(x + 6, y + 36, "Nur Ihre Fächer laut Plan.", 12, 400, c["faint"]))
    y += 80
    b.append(label(L, y, "Link", c))
    b.append(link_field(L, y + 10, W - 52, c, state))
    y += 116
    b.append(label(L, y, "Titel", c))
    b.append(R(L, y + 10, W - 52, 52, 16, c["field"]) + T(L + 17, y + 41.5, "Arbeitsblätter Analysis", 16, 400, c["ink"]))
    b.append(T(L, y + 82, "23 von 80 Zeichen", 12, 400, c["faint"]))
    y += 100
    b.append(note_box(L, y, W - 52, ["Freigabe in Drive: „Jeder mit dem Link“ – sonst sehen Schüler nur „Zugriff anfordern“.",
                                      "Keine Dateien mit Namen oder Noten von Schülern."], c, INFO))
    y = Y + H - 78
    b.append(f'<line x1="{L}" y1="{y}" x2="{X + W - 26}" y2="{y}" stroke="{c["hair"]}" stroke-width="1"/>')
    b.append(button(X + W - 26 - 126.77 - 8 - 109.3, y + 16.5, 109.3, "Abbrechen", c, "sand", None))
    save = button(X + W - 26 - 126.77, y + 16.5, 126.77, "Speichern", c)
    b.append(save if state == "ok" else f'<g opacity="0.45">{save}</g>')
    return svg(1440, 900, c, "".join(b))

def pc_stunde(c, theme, sub):
    """08 «Stunde · Details (Panel rechts)»: unter den Knöpfen «Materialien · Mathe»."""
    inner, w, h = base("08 Stunde · Details (Panel rechts)", theme, "PC")
    b = [inner]
    y = 428
    b.append(T(1010, y, "Materialien · Mathe", 12.5, 800, c["faint"]) + T(1398, y, "Alle", 13, 700, c["accink"], "end"))
    y += 14
    b.append(R(1010, y, 388, 124, 22, c["card"]))
    for i, m in enumerate(MATERIALS[:2]):
        ry = y + 2 + i * 60
        if i: b.append(f'<line x1="1024" y1="{ry}" x2="1384" y2="{ry}" stroke="{c["hair"]}" stroke-width="1"/>')
        b.append(tile(1022, ry + 12, "Ma", m[3], sub, 36))
        b.append(T(1070, ry + 27, m[1], 14, 700, c["ink"]) + T(1070, ry + 45, meta(m[2], m[3], m[4]), 11.5, 400, c["faint"]))
        b.append(ICON(1366, ry + 21, 0.67, c["faint"], EXT, 2))
    return svg(w, h, c, "".join(b))

SCREENS = {
    "handy-01-materialien": p_list,
    "handy-02-aktionen": lambda c, t, s: p_list(c, t, s, "aktionen"),
    "handy-03-neu": p_form,
    "handy-04-link-falsch": lambda c, t, s: p_form(c, t, s, "fehler"),
    "handy-05-gespeichert": lambda c, t, s: p_list(c, t, s, "gespeichert"),
    "handy-06-loeschen": lambda c, t, s: p_list(c, t, s, "loeschen"),
    "handy-07-leer": p_leer,
    "handy-08-laden": lambda c, t, s: p_list(c, t, s, "laden"),
    "handy-09-stunde": p_stunde,
    "handy-10-mehr": p_mehr,
    "handy-11-code-recht": p_codes,
    "pc-01-materialien": pc_page,
    "pc-02-menue": lambda c, t, s: pc_page(c, t, s, "menu"),
    "pc-03-neu": pc_form,
    "pc-04-link-falsch": lambda c, t, s: pc_form(c, t, s, "fehler"),
    "pc-05-gespeichert": lambda c, t, s: pc_page(c, t, s, "gespeichert"),
    "pc-06-loeschen": lambda c, t, s: pc_page(c, t, s, "loeschen"),
    "pc-07-leer": lambda c, t, s: pc_page(c, t, s, "leer"),
    "pc-08-stunde": pc_stunde,
}
if __name__ == "__main__":
    n = 0
    for theme, c in (("hell", g.LIGHT), ("dunkel", g.DARK)):
        for name, fn in SCREENS.items():
            open(os.path.join(OUT, f"{name}-{theme}.svg"), "w", encoding="utf-8").write(fn(c, theme, g.SUBJ[theme]))
            n += 1
    print(n, "files")
