# Генератор макетов части 14 «Lehrkräfte». Основа — оригинальные SVG из ORBook Soft:
# шапки, меню и навигация берутся из них как есть, поверх рисуется только новое.
# Цвета — токены из src/index.css (светлая и тёмная тема).
import os, re, sys

SOFT = "/opt/orbook-be/design/ORBook Soft"
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.abspath(__file__))

LIGHT = dict(paper="#FBF7F2", card="#FFFFFF", ink="#2A2433", muted="#6A6275", faint="#978FA1", faint2="#C0B8C6", accent="#6C4DF6",
             on="#FFFFFF", accink="#4A31C9", tint="#EEE9FF", rule="#EAE2D8", hair="#F0EAE2", sand="#F3EDE5", ok="#1F9D6B", oktint="#E1F5EB",
             danger="#D6455D", dtint="#FCE7EB", seg="#FFFFFF", field="#FFFFFF", sub="#E3DBFF", soff="#C0B8C6", thumb="#FFFFFF",
             overlay=("#2A2433", 0.4), shadow="#0F121C")
DARK = dict(paper="#16131C", card="#221E2A", ink="#F4F0F8", muted="#B5ACC1", faint="#877E94", faint2="#5F576C", accent="#A58BFF",
            on="#1A1333", accink="#CFC2FF", tint="#2C2548", rule="#352F40", hair="#2B2634", sand="#2A2533", ok="#5FD3A2", oktint="#163027",
            danger="#FF8AA0", dtint="#3A1D25", seg="#3A3446", field="#221E2A", sub="#2C2548", soff="#352F40", thumb="#16131C",
            overlay=("#000000", 0.55), shadow="#000000")
# Fach: (solid, tint, text) — --color-<fach>-solid/-tint/-text
SUBJ = {
    "hell": {"Ma": ("#4C82EC", "#D8E0F1", "#2F5192"), "De": ("#E4577A", "#F6D7DA", "#8D364C"), "En": ("#EE8A2C", "#F8E1CA", "#94561B"),
             "Ph": ("#2FAFC7", "#D2E9E9", "#1D6C7B"), "Ge": ("#BF9420", "#EFE3C8", "#765C14"), "Ku": ("#C75CCB", "#F1D8EA", "#7B397E"),
             "Sp": ("#6E80A0", "#DFDFE2", "#444F63"), "Bio": ("#3FB173", "#D5E9D9", "#276E47")},
    "dunkel": {"Ma": ("#6191EE", "#28314E", "#B0C8F6"), "De": ("#E76B8A", "#482836", "#F3B5C4"), "En": ("#F09845", "#4A3326", "#F8CCA2"),
               "Ph": ("#48B9CE", "#223B47", "#A4DCE6"), "Ge": ("#C7A13B", "#403523", "#E3D09D"), "Ku": ("#CE70D1", "#422947", "#E6B8E8"),
               "Sp": ("#7F8FAB", "#2F313E", "#BFC7D5"), "Bio": ("#56BA84", "#253B35", "#AADCC2")},
}
NAMES = {"Ma": "Mathe", "De": "Deutsch", "En": "Englisch", "Ph": "Physik", "Ge": "Geschichte", "Ku": "Kunst", "Sp": "Sport", "Bio": "Biologie"}

# ── Kleine Helfer (wie in 13-admin-kurse/gen.py) ──
def esc(t): return t.replace("&", "&amp;").replace("<", "&lt;")
def T(x, y, t, size, w, c, anchor=None, ls=None, raw=False):
    a = f' text-anchor="{anchor}"' if anchor else ""
    l = f' letter-spacing="{ls}"' if ls else ""
    return f'<text x="{x}" y="{y}" font-family="Nunito" font-size="{size}" font-weight="{w}"{l} fill="{c}"{a} xml:space="preserve">{t if raw else esc(t)}</text>'
def S(t, w, c): return f'<tspan font-weight="{w}" fill="{c}">{esc(t)}</tspan>'  # Teil einer Zeile in anderer Farbe/Stärke
def R(x, y, w, h, rx, fill, stroke=None, sw=1, extra=""):
    s = f' stroke="{stroke}" stroke-width="{sw}"' if stroke else ""
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}"{s}{extra}/>'
def ICON(x, y, scale, color, inner, sw=2):
    return f'<g transform="translate({x} {y}) scale({scale} {scale})" fill="none" stroke="{color}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">{inner}</g>'
P = lambda d: f'<path d="{d}"/>'
CHECK, CHEV_R, CHEV_D, BACK = P("M5 12l5 5 9-10"), P("M10 6l6 6-6 6"), P("M6 10l6 6 6-6"), P("M14 6l-6 6 6 6")
PLUS, CLOSE = P("M12 5v14M5 12h14"), P("M6 6l12 12M18 6L6 18")
KEY = '<circle cx="8" cy="15" r="4"/>' + P("M11 12l9-9M17 6l3 3")
LOCK = '<rect x="5" y="11" width="14" height="9" rx="2"/>' + P("M8 11V8a4 4 0 0 1 8 0v3")
USER = '<circle cx="12" cy="8" r="4"/>' + P("M4 21a8 8 0 0 1 16 0")
BOOK = P("M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z")
TRASH = P("M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13")
CAL = '<rect x="3" y="5" width="18" height="16" rx="3"/>' + P("M8 3v4M16 3v4M3 10h18")
SHARE = P("M12 4v11M7 9l5-5 5 5") + P("M5 14v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5")
PEN = P("M4 20h4L19 9l-4-4L4 16v4z")
COPY = '<rect x="9" y="9" width="11" height="11" rx="2"/>' + P("M5 15V6a1 1 0 0 1 1-1h9")
DOTS_V = '<circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>'
SEARCH = '<circle cx="11" cy="11" r="6.5"/>' + P("M16 16l4.5 4.5")
SHIELD = P("M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z")
def tw(t, size, w=700): return len(t) * size * (0.6 if w >= 800 else 0.56 if w >= 600 else 0.52)

def base(name, theme, kind="Handy"):
    """Inhalt eines Originals aus ORBook Soft (ohne <svg>-Hülle) und seine Größe."""
    folder = {("Handy", "hell"): "1 Handy Hell", ("Handy", "dunkel"): "2 Handy Dunkel",
              ("PC", "hell"): "3 PC Hell", ("PC", "dunkel"): "4 PC Dunkel"}[(kind, theme)]
    s = open(os.path.join(SOFT, folder, name + ".svg"), encoding="utf-8").read()
    w, h = re.search(r'width="([\d.]+)" height="([\d.]+)"', s).groups()
    inner = s[s.index(">") + 1: s.rindex("</svg>")]
    return inner, float(w), float(h)

def svg(w, h, c, body, defs=""):
    sh = (f'<filter id="nsh0" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="24" stdDeviation="32" flood-color="{c["shadow"]}" flood-opacity="0.18"/></filter>'
          f'<filter id="nsh1" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="{c["shadow"]}" flood-opacity="0.06"/></filter>')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w:g}" height="{h:g}" viewBox="0 0 {w:g} {h:g}"><defs>{sh}{defs}</defs>'
            f'<rect x="0" y="0" width="{w:g}" height="{h:g}" fill="{c["paper"]}"/>{body}</svg>')

def overlay(c, w, h):
    col, op = c["overlay"]
    return f'<rect x="0" y="0" width="{w}" height="{h}" fill="{col}" fill-opacity="{op}"/>'

def label(x, y, t, c): return T(x, y, t, 12.5, 800, c["faint"])
def eyebrow(x, y, t, c, accent=False): return T(x, y, t, 12.5, 800, c["accink"] if accent else c["faint"])
def title(x, y, t, c, size=29): return T(x, y, t, size, 900, c["ink"], ls=round(-size * 0.015, 2))

def button(x, y, w, text, c, kind="primary", icon=CHECK, h=48):
    fill, fg = {"primary": (c["accent"], c["on"]), "sand": (c["sand"], c["ink"]), "danger": (c["dtint"], c["danger"])}[kind]
    tx = x + w / 2 + (12 if icon else 0)
    ic = ICON(tx - tw(text, 14.5) / 2 - 26, y + h / 2 - 8, 0.67, fg, icon, 2.2) if icon else ""
    return R(x, y, w, h, h / 2, fill) + ic + T(tx, y + h / 2 + 5, text, 14.5, 700, fg, "middle")

def round_btn(x, y, c, icon, primary=False, size=38):
    fill, fg = (c["accent"], c["on"]) if primary else (c["card"], c["ink"])
    k = 0.71
    return R(x, y, size, size, size / 2, fill) + ICON(x + size / 2 - 12 * k, y + size / 2 - 12 * k, k, fg, icon, 2)

def note_box(x, y, w, lines, c, icon, h=None):
    """Sandfarbener Hinweis wie in 14/18/41: Icon links, 1–2 Zeilen."""
    h = h or (40.84 if len(lines) == 1 else 59.69)
    out = [R(x, y, w, h, 16, c["sand"]), ICON(x + 13, y + 12 if len(lines) > 1 else y + 12, 0.67, c["muted"], icon)]
    for i, ln in enumerate(lines):
        out.append(T(x + 39, y + 24 + i * 18.85, ln, 13, 400, c["muted"], raw=True))
    return "".join(out)

def badge(x, y, text, c, kind="sand"):
    fill, fg = {"accent": (c["accent"], c["on"]), "sand": (c["sand"], c["muted"]), "ok": (c["oktint"], c["ok"]),
                "off": (c["sand"], c["faint"]), "tint": (c["tint"], c["accink"])}[kind]
    w = len(text) * 7.1 + 16
    return R(x, y, w, 19, 9.5, fill) + T(x + 8, y + 13, text, 9.5, 800, fg, ls=0.57), w

def segmented(x, y, w, opts, active, c, h=36):
    out = [R(x, y, w, h, h / 2, c["sand"])]
    part = (w - 6) / len(opts)
    for i, o in enumerate(opts):
        on = i == active
        if on: out.append(R(x + 3 + i * part, y + 3, part, h - 6, (h - 6) / 2, c["seg"]))
        out.append(T(x + 3 + i * part + part / 2, y + h / 2 + 4.5, o, 12.5, 800, c["ink"] if on else c["muted"], "middle"))
    return "".join(out)

def chip(x, y, text, c, dot=None, on=False, h=33):
    w = tw(text, 12.5) + (36 if dot else 26)
    if on and not dot:
        return R(x, y, w, h, h / 2, c["accent"]) + T(x + 13, y + 21, text, 12.5, 700, c["on"]), w
    out = R(x + .5, y + .5, w - 1, h - 1, (h - 1) / 2, c["tint"] if on else "none", c["accent"] if on else c["rule"], 1.5 if on else 1)
    tx = x + 13
    if dot: out += R(x + 12.5, y + h / 2 - 3.5, 7, 7, 3.5, dot); tx = x + 25.5
    return out + T(tx, y + 21, text, 12.5, 700, c["ink"] if on else c["muted"]), w

def form_chip(x, y, code, name, c, sub, on=False):
    """Fach-Auswahl wie im Formular 16/17: Punkt + Name; gewählt = Tint + Rand in Fachfarbe."""
    solid, tint, _ = sub[code]
    w = tw(name, 13) + 40
    if on:
        out = R(x, y, w, 38, 19, tint) + R(x + 1, y + 1, w - 2, 36, 18, "none", solid, 2)
    else:
        out = R(x + .5, y + .5, w - 1, 37, 18.5, "none", c["rule"])
    return out + R(x + 14, y + 15, 8, 8, 4, solid) + T(x + 28, y + 23, name, 13, 700, c["ink"]), w

def date_tile(x, y, day, wd, code, sub, w=38, h=44):
    _, tint, text = sub[code]
    return (R(x, y, w, h, 12, tint) + T(x + w / 2, y + 21.5, day, 19, 900, text, "middle", -0.28)
            + T(x + w / 2, y + 34.5, wd, 9, 700, text, "middle", 0.54))

def checkbox(x, y, on, c):
    """Häkchen wie in 42 «Neuer Code» (in beiden Themen gleich)."""
    if on:
        return R(x, y, 19, 19, 3, c["accent"]) + f'<path d="M{x + 4.18},{y + 9.88} L{x + 7.98},{y + 13.68} L{x + 14.82},{y + 5.7}" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    return R(x + .5, y + .5, 18, 18, 3, "#FFFFFF", "#8A8A92")

def switch(x, y, on, c):
    return R(x, y, 42, 24, 12, c["accent"] if on else c["soff"]) + R(x + (20 if on else 2), y + 2, 20, 20, 10, c["thumb"] if on else c["card"])

# ── Daten (Beispiele) ──
HOMEWORK = [  # (Abschnitt, Tag, Wochentag, Fach, Kürzel, Aufgabe, rechts)
    ("Bis morgen", "18", "DO", "Ma", "Mü", "Buch S. 54, Nr. 3 a–d", "morgen"),
    ("Diese Woche", "19", "FR", "De", "Kle", "Gedicht lernen, Strophe 1–2", "in 2 Tagen"),
    (None, "19", "FR", "En", None, "Workbook p. 23, ex. 4", "in 2 Tagen"),  # per Editor-Code → ohne Namen
    ("Nächste Woche", "23", "DI", "Ph", "Ric", "Protokoll Federpendel fertig", "in 6 Tagen"),
]

def byline(code, who):  # «Mathe · von Mü»; Einträge per Editor-Code bleiben ohne Namen
    return f"{NAMES[code]} · von {who}" if who else NAMES[code]

def hw_rows(x, y, w, c, sub, first_selected=True, gap_section=34):
    """Liste der Hausaufgaben wie die Klausuren-Liste 13: Datumsfeld in Fachfarbe, Fach · von Kürzel, Aufgabe."""
    out = []
    for i, (sec, day, wd, code, who, text, right) in enumerate(HOMEWORK):
        if sec:
            if i: y += 18
            out.append(T(x, y + 12, sec, 12.5, 800, c["faint"])); y += 26
        sel = first_selected and i == 0
        out.append(R(x, y, w, 64, 22, c["card"]))
        if sel: out.append(R(x + .5, y + .5, w - 1, 63, 21.5, "none", c["accent"]))
        out.append(date_tile(x + 12, y + 10, day, wd, code, sub))
        out.append(T(x + 62, y + 24, byline(code, who), 11.5, 400, c["faint"]))
        out.append(T(x + 62, y + 48.5, text, 14.5, 800, c["ink"]))
        out.append(T(x + w - 14, y + 37, right, 12, 700, c["accink"] if sel else c["faint"], "end"))
        y += 72
    return "".join(out), y

# ════════════════ Telefon ════════════════
def nav_only(theme, name="13 Klausuren"):
    """Nur die untere Navigation aus dem Original (Klausuren aktiv)."""
    inner, w, h = base(name, theme)
    i = inner.find('<rect x="16" y="764"')
    return inner[i:inner.rindex("</g>")]

def p_zugang(c, theme, sub):
    inner, w, h = base("01 Zugang", theme)
    b = [inner, R(0, 560, 390, 284, 0, c["paper"])]
    b.append(label(28, 584, "Klassenpasswort", c))
    b.append(R(28, 594, 334, 50, 16, c["field"]) + T(45, 624, "Passwort eingeben", 16, 400, c["faint2"]))
    b.append(T(28, 662, "Steht in der Klassengruppe.", 12, 400, c["faint"]))
    b.append(button(28, 682, 334, "Öffnen", c, icon=CHEV_R))
    # neu: Weg für Lehrkräfte — leise, unter dem Hauptknopf
    t1, t2 = "Lehrkraft? ", "Mit Lehrer-Code anmelden"
    b.append(T(195, 770, S(t1, 400, c["muted"]) + S(t2, 800, c["accink"]), 13.5, 400, c["muted"], "middle", raw=True))
    b.append(T(28, 812, "Datenschutz", 12, 600, c["muted"]) + T(362, 812, "Keine offizielle App von Indiware", 12, 400, c["faint"], "end"))
    return svg(w, h, c, "".join(b))

def p_lehrer_code(c, theme, sub, state="normal"):
    b = [round_btn(18, 33.31, c, BACK), eyebrow(66, 33, "Zugang", c), title(66, 65, "Lehrkraft", c)]
    for i, ln in enumerate(["Mit Ihrem Lehrer-Code sehen Sie den Plan der", "9b und tragen Klausuren, Tests und", "Hausaufgaben für die Klasse ein."]):
        b.append(T(18, 105.31 + i * 22.47, ln, 14.5, 400, c["muted"]))
    b.append(label(18, 187.72, "Lehrer-Code", c))
    y = 197.72
    if state == "fehler":
        b.append(R(18, y, 354, 53.91, 16, c["field"]) + R(19, y + 1, 352, 51.91, 15, "none", c["danger"], 2))
        b.append(T(35, y + 34.95, "ORB-L-4M8T-K2", 24, 900, c["ink"], ls=1.2))
        b.append(T(18, y + 74, "Code unbekannt oder gesperrt. Bitte beim Admin", 12.5, 400, c["danger"]))
        b.append(T(18, y + 92, "der Klasse nachfragen.", 12.5, 400, c["danger"]))
        y += 48
    else:
        b.append(R(18, y, 354, 53.91, 16, c["field"]) + T(35, y + 34.95, "ORB-L-XXXX-XX", 24, 900, c["faint2"], ls=1.2))
    b.append(button(18, y + 71.91, 354, "Anmelden", c, icon=KEY))
    b.append(note_box(18, 754.31, 354, ["Den Code bekommen Sie vom Admin der Klasse.", "Er bleibt nur auf diesem Gerät."], c, LOCK))
    return svg(390, 844, c, "".join(b))

def p_list_head(c, title_text, eyebrow_text, count_k, count_h, active):
    b = [eyebrow(18, 33, eyebrow_text, c), title(18, 65, title_text, c), round_btn(334, 33.31, c, PLUS, primary=True)]
    b.append(segmented(18, 85.31, 354, [f"Klausuren · {count_k}", f"Hausaufgaben · {count_h}"], active, c))
    return "".join(b)

def p_hausaufgaben(c, theme, sub, sheet=False):
    b = [p_list_head(c, "Hausaufgaben", "Ab heute · 4 offen", 5, 4, 1)]
    x = 18
    on, w = chip(x, 135.31, "Alle", c, on=True); b.append(on); x += w + 6.5
    for code in ("Ma", "De", "En", "Ph", "Ge"):
        ch, w = chip(x, 135.31, code, c, dot=sub[code][0]); b.append(ch); x += w + 6.5
    rows, y = hw_rows(18, 186, 354, c, sub)
    b.append(rows)
    b.append(ICON(18, y + 3, 0.54, c["faint"], TRASH) + T(36, y + 14, "Hausaufgaben verschwinden 30 Tage nach der Abgabe.", 12, 400, c["faint"]))
    b.append(nav_only(theme))
    if sheet: b.append(hw_sheet(c, sub))
    return svg(390, 844, c, "".join(b))

def hw_sheet(c, sub):
    """Blatt «Hausaufgabe» wie 14 Klausur · Details: Fach, Abgabe, Text, Autor."""
    top = 404
    solid, tint, text = sub["Ma"]
    b = [overlay(c, 390, 844),
         f'<path d="M30,{top} H360 A30,30 0 0 1 390,{top + 30} V844 H0 V{top + 30} A30,30 0 0 1 30,{top} Z" fill="{c["paper"]}"/>',
         R(176, top + 10, 38, 4, 2, c["faint2"])]
    b.append(R(18, top + 30.45, 44, 44, 22, tint) + T(40, top + 56.45, "Ma", 11.5, 900, text, "middle"))
    bd, bw = badge(74, top + 28, "HAUSAUFGABE", c, "sand"); b.append(bd)
    b.append(T(74 + bw + 8, top + 42, "Mathe", 12.5, 400, c["faint"]))
    b.append(title(74, top + 71, "Bis morgen, Do 18.9.", c, 24))
    y = top + 91
    b.append(R(18, y, 354, 92, 22, c["card"]))
    for i, ln in enumerate(["Buch S. 54, Nr. 3 a–d.", "Rechenweg aufschreiben, Ergebnisse", "unterstreichen."]):
        b.append(T(33, y + 28 + i * 22, ln, 15, 400, c["ink"]))
    y += 106
    b.append(note_box(18, y, 354, [S("Eingetragen von ", 400, c["muted"]) + S("Mü", 800, c["ink"]) + S(" · Lehrkraft", 400, c["muted"]),
                                   "Wird 30 Tage nach der Abgabe gelöscht."], c, USER))
    y += 59.69 + 14
    b.append(button(18, y, 173, "Kalender", c, "sand", CAL) + button(199, y, 173, "Teilen", c, "sand", SHARE))
    return "".join(b)

def p_hausaufgabe_form(c, theme, sub):
    b = [round_btn(18, 33.31, c, BACK), eyebrow(66, 33, "Lehrkraft · Mü", c, accent=True), title(66, 65, "Neue Hausaufgabe", c)]
    b.append(label(18, 105, "Fach", c))
    x, y = 18, 117
    for code in ("Ma", "De", "En", "Ph", "Ge", "Bio", "Sp", "Ku"):
        name = {"Bio": "Bio", "Sp": "Sp", "Ku": "Ku"}.get(code, code)
        ch, w = form_chip(x, y, code, name, c, sub, on=code == "Ma")
        if x + w > 372: x, y = 18, y + 46; ch, w = form_chip(x, y, code, name, c, sub, on=code == "Ma")
        b.append(ch); x += w + 8
    y += 46 + 24
    b.append(label(18, y, "Abgabe bis", c))
    b.append(R(18, y + 10, 354, 50, 16, c["field"]) + T(35, y + 40, "18.09.2026", 16, 400, c["ink"]) + ICON(340, y + 26, 0.75, c["faint"], CAL))
    b.append(T(18, y + 78, "Donnerstag · morgen", 12, 400, c["faint"]))
    y += 92
    ch, w = chip(18, y, "Nächste Stunde · Do", c); b.append(ch)
    ch2, w2 = chip(18 + w + 8, y, "In 1 Woche", c); b.append(ch2)
    y += 33 + 30
    b.append(label(18, y, "Aufgabe", c))
    b.append(R(18, y + 10, 354, 116, 16, c["field"]))
    for i, ln in enumerate(["Buch S. 54, Nr. 3 a–d.", "Rechenweg aufschreiben, Ergebnisse", "unterstreichen."]):
        b.append(T(35, y + 38 + i * 23, ln, 16, 400, c["ink"]))
    b.append(T(18, y + 144, "71 von 300 Zeichen · keine Namen von Schülern", 12, 400, c["faint"]))
    y += 176
    b.append(note_box(18, y, 354, ["Die Klasse sieht „eingetragen von Mü“. Ändern", "und löschen können nur Sie und der Admin."], c, USER))
    b.append(note_box(18, y + 70, 354, ["Wird 30 Tage nach der Abgabe gelöscht."], c, TRASH))
    b.append(button(18, 764, 354, "Speichern", c))
    return svg(390, 844, c, "".join(b))

def p_tag(c, theme, sub):
    inner, w, h = base("05 Tag · Liste", theme)
    H = 1150
    b = [inner, R(0, 885, 390, H - 885, 0, c["paper"])]
    y = 907.06
    b.append(T(18, y, "Hausaufgaben · fällig heute", 12.5, 800, c["faint"]))
    y += 16.5
    items = [("Ma", "Buch S. 54, Nr. 3 a–d", "Mü"), ("En", "Workbook p. 23, ex. 4", None)]
    b.append(R(18, y, 354, 12 + 60 * len(items), 22, c["card"]))
    for i, (code, text, who) in enumerate(items):
        solid, tint, tx = sub[code]
        ry = y + 6 + i * 60
        if i: b.append(f'<line x1="32" y1="{ry}" x2="358" y2="{ry}" stroke="{c["hair"]}" stroke-width="1"/>')
        b.append(R(32, ry + 12, 36, 36, 12, tint) + T(50, ry + 34.5, code, 11.5, 900, tx, "middle"))
        b.append(T(80, ry + 27, text, 14, 600, c["ink"]))
        b.append(T(80, ry + 45, byline(code, who), 11.5, 400, c["faint"]))
        b.append(ICON(340, ry + 23, 0.58, c["faint2"], CHEV_R, 2.2))
    y += 12 + 60 * len(items) + 34
    # «Meine Notizen» wie im Original, nur weiter unten
    b.append(T(18, y, "Meine Notizen", 12.5, 800, c["faint"]) + T(372, y - 0.5, "+ Notiz", 13, 700, c["accink"], "end"))
    y += 16.5
    b.append(R(18, y, 354, 65.3, 22, c["card"]) + T(32, y + 26, "Sportsachen mitnehmen.", 14, 400, c["ink"]))
    b.append(ICON(32, y + 39.3, 0.5, c["faint"], P("M4 12a8 8 0 0 1 14-5.3M20 4v5h-5M20 12a8 8 0 0 1-14 5.3M4 20v-5h5")))
    b.append(T(50, y + 49.3, "synchronisiert · nur für dich", 11.5, 400, c["faint"]))
    H = y + 65.3 + 28
    return svg(w, H, c, "".join(b))

def p_klausur_autor(c, theme, sub):
    inner, w, h = base("14 Klausur · Details (Blatt)", theme)
    b = [inner, R(18, 630.31, 354, 59.69, 16, c["paper"])]
    b.append(note_box(18, 630.31, 354, [S("Eingetragen von ", 400, c["muted"]) + S("Mü", 800, c["ink"]) + S(" · Lehrkraft", 400, c["muted"]),
                                        "Nur Fach, Datum, Stunde und Thema."], c, USER))
    return svg(w, h, c, "".join(b))

def p_leer(c, theme, sub):
    b = [p_list_head(c, "Hausaufgaben", "Ab heute · nichts offen", 5, 0, 1)]
    b.append(R(163, 304.47, 64, 64, 32, c["tint"]) + ICON(182, 323.47, 1.08, c["accink"], BOOK, 1.9))
    b.append(T(195, 405.47, "Keine Hausaufgaben", 25, 900, c["ink"], "middle", -0.37))
    b.append(T(195, 438.47, "Wenn eine Lehrkraft etwas einträgt,", 14, 400, c["muted"], "middle"))
    b.append(T(195, 460.16, "steht es hier — bis zur Abgabe.", 14, 400, c["muted"], "middle"))
    b.append(nav_only(theme))
    return svg(390, 844, c, "".join(b))

# ── Admin (Telefon) ──
TEACHERS = [  # Kürzel, Fächer, Code-Ende, Einträge, zuletzt, aktiv, gültig
    ("Mü", "Mathe, Physik", "K2", 6, "heute", True, "Schuljahresende", "Klausuren · Hausaufgaben"),
    ("Kle", "Deutsch", "R8", 2, "vor 3 Tagen", True, "Schuljahresende", "Nur Klausuren"),
    ("Sch", "Englisch", "T5", 0, "vor 2 Wochen", False, "abgelaufen", "Klausuren · Hausaufgaben"),
]

def p_admin_codes(c, theme, sub):
    inner, w, h = base("41 Admin · Editor-Codes", theme)
    nav = inner[inner.find('<rect x="16" y="', 3000):inner.rindex("</g>")]
    b = [eyebrow(18, 33, "Admin", c), title(18, 65, "Lehrer-Codes", c), round_btn(334, 33.31, c, PLUS, primary=True)]
    b.append(segmented(18, 85.31, 354, ["Editor-Codes · 4", "Lehrer-Codes · 3"], 1, c))
    b.append(note_box(18, 133.31, 354, ["Ein Code pro Lehrkraft. Die Klasse sieht das", "Kürzel aus dem Plan: „eingetragen von Mü“."], c, USER))
    y = 203
    for who, subj, end, n, last, active, _, rights in TEACHERS:
        g = [R(18, y, 354, 114.36, 22, c["card"]), T(32, y + 33, who, 15, 700, c["ink"])]
        bd, bw = badge(32 + tw(who, 15) + 10, y + 18.5, "AKTIV" if active else "GESPERRT", c, "ok" if active else "off"); g.append(bd)
        g.append(T(32 + tw(who, 15) + 10 + bw + 8, y + 32, subj, 12.5, 400, c["faint"]))
        g.append(R(326, y + 12, 32, 32, 16, c["card"]) + ICON(333.5, y + 19.5, 0.71, c["ink"], DOTS_V).replace('fill="none"', f'fill="{c["ink"]}"'))
        g.append(T(32, y + 66, f"••••-{end}", 17, 900, c["ink"], ls=-0.25) + T(108, y + 65.67, rights, 12.5, 400, c["muted"]))
        g.append(T(32, y + 94.36, f"zuletzt {last} · {n} Einträge", 12, 400, c["faint"]))
        g.append(switch(316, y + 78.36, active, c))
        b.append(f'<g opacity="{1 if active else 0.55}">' + "".join(g) + "</g>")
        y += 124.36
    b.append(nav)
    return svg(w, h, c, "".join(b))

def p_admin_new(c, theme, sub):
    b = [round_btn(18, 33.31, c, BACK), eyebrow(66, 33, "Admin · Lehrer-Codes", c), title(66, 65, "Neuer Lehrer-Code", c)]
    b.append(label(18, 99, "Lehrkraft", c))
    x, y = 18, 111
    for k in ("Mü", "Kle", "Bau", "Ric", "Hen"):
        on = k == "Mü"
        w = tw(k, 13) + 30
        b.append(R(x + .5, y + .5, w - 1, 37, 18.5, c["tint"] if on else "none", c["accent"] if on else c["rule"], 1.5 if on else 1))
        b.append(T(x + w / 2, y + 23.5, k, 13, 800 if on else 700, c["accink"] if on else c["ink"], "middle"))
        x += w + 8
    b.append(T(18, y + 58, "Kürzel aus dem Plan der 9b. „Sch“ hat schon einen Code.", 12, 400, c["faint"]))
    y = 205
    b.append(label(18, y, "Rechte", c))
    for i, t in enumerate(["Klausuren und Tests eintragen", "Hausaufgaben eintragen"]):
        b.append(checkbox(22, y + 18 + i * 46, True, c) + T(56, y + 32.5 + i * 46, t, 14.5, 400, c["ink"]))
    b.append(ICON(22, y + 108, 0.67, c["faint"], LOCK) + T(56, y + 120, "Ändern und löschen: nur eigene Einträge", 13, 400, c["faint"]))
    y += 162
    b.append(label(18, y, "Gültig bis", c))
    b.append(segmented(18, y + 12, 354, ["Immer", "30 Tage", "Schuljahresende"], 2, c, 35))
    y += 63
    b.append(R(18, y, 354, 134, 22, c["accent"]))
    b.append(T(34, y + 29, "Neuer Code · nur jetzt sichtbar", 12.5, 800, c["sub"]))
    b.append(T(34, y + 69.43, "ORB-L-7K2F-Q7", 27, 900, c["on"], ls=1.08))
    b.append(ICON(330.5, y + 52.5, 0.71, c["on"], COPY))
    b.append(f'<g opacity="0.75">{T(34, y + 102, "Danach siehst du nur noch ••••-Q7. Am besten", 12.5, 400, c["on"])}</g>')
    b.append(f'<g opacity="0.75">{T(34, y + 118, "persönlich übergeben.", 12.5, 400, c["on"])}</g>')
    y += 134 + 16
    b.append(button(18, y, 354, "Fertig", c))
    return svg(390, 844, c, "".join(b))

def p_admin_settings(c, theme, sub):
    b = [eyebrow(18, 33, "Admin", c), title(18, 65, "Einstellungen", c)]
    y = 100
    b.append(label(18, y, "Funktionen", c)); y += 14
    rows = [("Statistik zeigen", None, True), ("Notizen-Sync erlauben", "Zufällige Codes, ohne Namen", True),
            ("Teilen-Knopf", "Text für WhatsApp erzeugen", True), ("Klausuren ohne Editor-Code", "Jeder mit Klassenpasswort darf eintragen", False)]
    b.append(R(18, y, 354, len(rows) * 67, 22, c["card"]))
    for i, (t, s, on) in enumerate(rows):
        ry = y + i * 67
        if i: b.append(f'<line x1="32" y1="{ry}" x2="358" y2="{ry}" stroke="{c["hair"]}" stroke-width="1"/>')
        b.append(T(32, ry + (30 if s else 39), t, 15, 400, c["ink"]))
        if s: b.append(T(32, ry + 49, s, 12, 400, c["faint"]))
        b.append(switch(316, ry + 21.5, on, c))
    y += len(rows) * 67 + 34
    b.append(label(18, y, "Hausaufgaben", c) + R(108, y - 13.5, 34, 17, 8.5, c["tint"]) + T(125, y - 1.5, "NEU", 9, 800, c["accink"], "middle", 0.5)); y += 14
    b.append(R(18, y, 354, 134, 22, c["card"]))
    b.append(T(32, y + 30, "Automatisch löschen", 15, 400, c["ink"]) + T(32, y + 49, "nach dem Abgabetag", 12, 400, c["faint"]))
    pw = 128
    b.append(R(358 - pw + .5, y + 18.5, pw - 1, 31, 15.5, "none", c["rule"]) + T(358 - pw + 12, y + 39, "nach 30 Tagen", 13, 700, c["ink"]) + ICON(358 - 21, y + 28, 0.5, c["faint"], CHEV_D, 2.2))
    b.append(f'<line x1="32" y1="{y + 67}" x2="358" y2="{y + 67}" stroke="{c["hair"]}" stroke-width="1"/>')
    b.append(T(32, y + 97, "Hausaufgaben jetzt", 15, 400, c["ink"]) + T(32, y + 116, "12 gespeichert · 3 älter als 30 Tage", 12, 400, c["faint"]))
    b.append(R(358 - 96 + .5, y + 85.5, 95, 31, 15.5, c["dtint"]) + T(358 - 48, y + 106, "Alte löschen", 13, 700, c["danger"], "middle"))
    menu_y = y + 56
    y += 134 + 14
    b.append(T(18, y + 12, "Klausuren bleiben, bis du sie unter „Alle Klausuren“", 12, 400, c["faint"]))
    b.append(T(18, y + 29, "löschst. Lehrer-Codes stehen unter „Codes“.", 12, 400, c["faint"]))
    # offenes Menü (wie «Alte Pläne behalten»): Auswahl der Frist — liegt über allem
    my = menu_y
    opts = ["nach 7 Tagen", "nach 14 Tagen", "nach 30 Tagen", "nach 90 Tagen", "zum Schuljahresende"]
    mw, mx = 196, 358 - 196
    b.append(R(mx, my, mw, 12 + 40 * len(opts), 18, c["card"], extra=' filter="url(#nsh0)"') + R(mx, my, mw, 12 + 40 * len(opts), 18, c["card"], c["hair"]))
    for i, o in enumerate(opts):
        oy = my + 6 + i * 40
        if o == "nach 30 Tagen": b.append(R(mx + 6, oy, mw - 12, 40, 12, c["tint"]))
        b.append(T(mx + 18, oy + 25, o, 14, 700 if o == "nach 30 Tagen" else 400, c["accink"] if o == "nach 30 Tagen" else c["ink"]))
        if o == "nach 30 Tagen": b.append(ICON(mx + mw - 34, oy + 11, 0.71, c["accink"], CHECK, 2.4))
    return svg(390, 844, c, "".join(b))

def split_shift(inner, cut, dy, W, H, x0=0, x1=None):
    """Original zweimal: oben bis cut, darunter (nur Spalte x0..x1) um dy nach unten — Platz für eine neue Zeile."""
    x1 = W if x1 is None else x1
    return (f'<clipPath id="xtop"><rect x="0" y="0" width="{W}" height="{cut}"/><rect x="0" y="0" width="{x0}" height="{H}"/>'
            f'<rect x="{x1}" y="0" width="{W - x1}" height="{H}"/></clipPath>'
            f'<clipPath id="xbot"><rect x="{x0}" y="{cut}" width="{x1 - x0}" height="{H}"/></clipPath>'
            f'<g clip-path="url(#xtop)">{inner}</g><g transform="translate(0 {dy})"><g clip-path="url(#xbot)">{inner}</g></g>')

def new_right(x, y, c):
    bd, _ = badge(x + 34 + 166, y + 0.5, "NEU", c, "tint")
    return checkbox(x, y, False, c) + T(x + 34, y + 14.5, "Hausaufgaben eintragen", 14.5, 400, c["ink"]) + bd

def p_editor_new(c, theme, sub):
    inner, w, h = base("42 Admin · neuer Code", theme)
    b = [split_shift(inner, 352, 46, w, h)]
    b.append(new_right(22, 366.31, c))
    return svg(w, h + 46, c, "".join(b))

def pc_editor_new(c, theme, sub):
    inner, w, h = base("44 Admin · neuer Code (Fenster)", theme, "PC")
    b = [split_shift(inner, 428, 46, w, h, 450, 990), R(450, 428, 540, 46, 0, c["paper"])]
    b.append(new_right(498, 435.23, c))
    return svg(w, h, c, "".join(b))

# ════════════════ Computer ════════════════
def cover_main(c, H=900):
    return R(256, 0, 1440 - 256, H, 0, c["paper"])

def modal_head(x, y, w, eyebrow_text, title_text, c, accent=False):
    b = [eyebrow(x + 26, y + 37, eyebrow_text, c, accent), title(x + 26, y + 70, title_text, c, 28)]
    kx = x + w - 120.87
    b.append(R(kx, y + 24, 30.88, 22, 8, c["card"], c["rule"]) + T(kx + 7, y + 38, "Esc", 11, 600, c["muted"]))
    b.append(round_btn(x + w - 80, y + 24, c, CLOSE, size=34))
    return "".join(b)

def pc_list(c, sub, panel=False):
    b = [eyebrow(284, 39, "Ab heute · 4 offen", c), title(284, 80, "Hausaufgaben", c, 38)]
    # oben rechts: Suche + «Hausaufgabe eintragen» (wie 14 Klausuren)
    b.append(R(939.7, 45, 158, 36, 18, c["card"]) + ICON(951.7, 55, 0.58, c["faint"], SEARCH) + T(971.7, 68, "Aufgabe oder Fach", 13, 400, c["faint2"]))
    b.append(R(1106, 45, 36, 36, 18, c["card"]) + ICON(1115, 54, 0.75, c["ink"], P("M4 5h16l-6 8v6l-4-2v-4z")))
    b.append(button(1150, 40, 254, "Hausaufgabe eintragen", c, icon=PLUS, h=46))
    x = 284
    on, w = chip(x, 111, "Alle", c, on=True); b.append(on); x += w + 6
    for code in ("Ma", "De", "En", "Ph", "Ge"):
        ch, w = chip(x, 111, code, c, dot=sub[code][0]); b.append(ch); x += w + 6
    b.append(segmented(714, 109, 314, ["Klausuren · 5", "Hausaufgaben · 4"], 1, c, 37))
    rows, y = hw_rows(284, 160, 744, c, sub)
    b.append(rows)
    b.append(ICON(284, y + 3, 0.54, c["faint"], TRASH) + T(302, y + 14, "Hausaufgaben verschwinden 30 Tage nach der Abgabe.", 12, 400, c["faint"]))
    # rechte Spalte: nächste Abgabe (wie «2 Tage bis Klausur Mathe»)
    b.append(R(1064, 110, 340, 92, 22, c["accent"]))
    b.append(T(1084, 175, "1", 52, 900, c["on"], ls=-0.78))
    b.append(T(1128, 137, "Tag bis", 12.5, 800, c["sub"]) + T(1128, 158, "Mathe · Buch S. 54", 15, 800, c["on"]))
    b.append(f'<g opacity="0.75">{T(1128, 177, "Do, 18. Sept · von Mü", 12, 400, c["on"])}</g>')
    return "".join(b)

def pc_panel(c, sub):
    """Rechtes Panel wie 15 Klausur · Details — hier eigene Hausaufgabe der Lehrkraft (mit Bearbeiten)."""
    solid, tint, text = sub["Ma"]
    b = [overlay(c, 1440, 900).replace("<rect", '<rect opacity="0.55"', 1)]
    for f in ("nsh0", "nsh1", None):
        b.append(R(984, 16, 440, 868, 28, c["paper"], extra=f' filter="url(#{f})"' if f else ""))
    b.append(eyebrow(1010, 57.5, "Hausaufgabe", c))
    b.append(R(1325.13, 42, 30.88, 22, 8, c["card"], c["rule"]) + T(1332.13, 56, "Esc", 11, 600, c["muted"]) + round_btn(1364, 36, c, CLOSE, size=34))
    b.append(R(1010, 88.45, 44, 44, 22, tint) + T(1032, 114.45, "Ma", 11.5, 900, text, "middle"))
    bd, bw = badge(1066, 86, "HAUSAUFGABE", c, "sand"); b.append(bd)
    b.append(T(1066 + bw + 8, 100, "Mathe", 12.5, 400, c["faint"]))
    b.append(title(1066, 129, "Bis morgen, Do 18.9.", c, 24))
    b.append(R(1010, 150.91, 388, 96, 22, c["card"]))
    for i, ln in enumerate(["Buch S. 54, Nr. 3 a–d.", "Rechenweg aufschreiben, Ergebnisse", "unterstreichen."]):
        b.append(T(1025, 180.91 + i * 22, ln, 15, 400, c["ink"]))
    b.append(note_box(1010, 262.91, 388, [S("Eingetragen von ", 400, c["muted"]) + S("Ihnen (Mü)", 800, c["ink"]) + S(" · heute 08:12", 400, c["muted"]),
                                         "Wird am 18. Oktober automatisch gelöscht."], c, USER))
    b.append(button(1010, 338.6, 190, "Kalender", c, "sand", CAL) + button(1208, 338.6, 190, "Teilen", c, "sand", SHARE))
    b.append(button(1010, 402.6, 388, "Bearbeiten", c, icon=PEN))
    b.append(T(1204, 474, "Nur Sie und der Admin können diesen Eintrag ändern.", 12, 400, c["faint"], "middle"))
    return "".join(b)

def pc_hausaufgaben(c, theme, sub):
    inner, w, h = base("14 Klausuren", theme, "PC")
    return svg(1440, 900, c, inner + cover_main(c) + pc_list(c, sub) + pc_panel(c, sub))

def pc_form(c, theme, sub):
    inner, w, h = base("14 Klausuren", theme, "PC")
    b = [inner, cover_main(c), pc_list(c, sub), overlay(c, 1440, 900)]
    X, Y, W, H = 380, 170, 680, 560
    for f in ("nsh0", "nsh1", None):
        b.append(R(X, Y, W, H, 28, c["paper"], extra=f' filter="url(#{f})"' if f else ""))
    b.append(modal_head(X, Y, W, "Lehrkraft · Mü", "Neue Hausaufgabe", c, accent=True))
    L, Rx = X + 26, X + 352
    y = Y + 107
    b.append(label(L, y, "Fach", c))
    x = L
    for code in ("Ma", "De", "En", "Ph", "Ge", "Bio", "Sp", "Ku"):
        ch, w = form_chip(x, y + 12, code, NAMES[code], c, sub, on=code == "Ma")
        if x + w > X + W - 26: break
        b.append(ch); x += w + 8
    y += 82
    b.append(label(L, y, "Abgabe bis", c))
    b.append(R(L, y + 10, 302, 52, 16, c["field"]) + T(L + 17, y + 41, "18.09.2026", 16, 400, c["ink"]) + ICON(L + 270, y + 27, 0.75, c["faint"], CAL))
    b.append(T(L, y + 80, "Donnerstag · morgen", 12, 400, c["faint"]))
    ch, w = chip(L, y + 96, "Nächste Stunde · Do", c); b.append(ch)
    ch, w = chip(L + w + 8, y + 96, "In 1 Woche", c); b.append(ch)
    b.append(label(Rx, y, "Aufgabe", c))
    b.append(R(Rx, y + 10, 302, 150, 16, c["field"]))
    for i, ln in enumerate(["Buch S. 54, Nr. 3 a–d.", "Rechenweg aufschreiben,", "Ergebnisse unterstreichen."]):
        b.append(T(Rx + 17, y + 40 + i * 23, ln, 16, 400, c["ink"]))
    b.append(T(Rx, y + 178, "71 von 300 Zeichen · keine Namen von Schülern", 12, 400, c["faint"]))
    y += 206
    b.append(note_box(L, y, 628, [S("Die Klasse sieht „eingetragen von Mü“. ", 400, c["muted"]) + S("Wird 30 Tage nach der Abgabe automatisch gelöscht.", 400, c["muted"])], c, USER))
    y += 64
    b.append(f'<line x1="{L}" y1="{y}" x2="{X + W - 26}" y2="{y}" stroke="{c["hair"]}" stroke-width="1"/>')
    b.append(button(X + W - 26 - 126.77 - 8 - 109.3, y + 16.5, 109.3, "Abbrechen", c, "sand", None))
    b.append(button(X + W - 26 - 126.77, y + 16.5, 126.77, "Speichern", c))
    return svg(1440, 900, c, "".join(b))

def pc_zugang(c, theme, sub, state="normal"):
    inner, w, h = base("01 Zugang", theme, "PC")
    b = [inner, R(720, 0, 720, 900, 0, c["paper"])]
    x = 890
    b.append(T(x, 252.66, "‹  Zurück zum Klassenpasswort", 12.5, 700, c["muted"]))
    b.append(eyebrow(x, 300.66, "Lehrkraft", c, accent=True) + title(x, 348.66, "Mit Code anmelden", c, 40))
    b.append(T(x, 391.84, "Sie sehen den Plan der 9b und tragen Klausuren,", 15, 400, c["muted"]))
    b.append(T(x, 415.09, "Tests und Hausaufgaben für die Klasse ein.", 15, 400, c["muted"]))
    y = 453.34
    b.append(label(x, y, "Lehrer-Code", c))
    if state == "fehler":
        b.append(R(x, y + 10, 380, 52, 16, c["field"]) + R(x + 1, y + 11, 378, 50, 15, "none", c["danger"], 2) + T(x + 17, y + 44, "ORB-L-4M8T-K2", 20, 900, c["ink"], ls=1))
        b.append(T(x, y + 82, "Code unbekannt oder gesperrt. Bitte beim Admin nachfragen.", 12.5, 400, c["danger"]))
    else:
        b.append(R(x, y + 10, 380, 52, 16, c["field"]) + T(x + 17, y + 44, "ORB-L-XXXX-XX", 20, 900, c["faint2"], ls=1))
        b.append(T(x, y + 80, "Den Code bekommen Sie vom Admin der Klasse.", 12, 400, c["faint"]))
    b.append(button(x, y + 100, 380, "Anmelden", c, icon=KEY))
    b.append(T(x, y + 179, "Datenschutz", 12.5, 600, c["muted"]) + T(x + 380, y + 179, "Enter zum Anmelden", 12.5, 400, c["faint"], "end"))
    return svg(1440, 900, c, "".join(b))

ADMIN_NAV = [("Übersicht", P("M4 11l8-7 8 7v9H4z"), None), ("Editor-Codes", KEY, "4"), ("Lehrer-Codes", USER, "3"),
             ("Klausuren", P("M5 21V4h12l-2 4 2 4H5"), "5"), ("Kurse &amp; Fächer", '<rect x="3" y="4" width="18" height="16" rx="2"/>' + P("M3 10h18M9 4v16"), None),
             ("Protokoll", P("M5 4h14v16H5z") + P("M9 9h6M9 13h6M9 17h3"), None),
             ("Einstellungen", '<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/>' + P("M7 7.5h.01M7 16.5h.01"), None)]
def admin_sidebar(c, H, active):
    b = [R(16, 16, 232, H - 32, 28, c["card"])]
    b.append(f'<g transform="translate(34 36) scale(0.39 0.39)" fill="none"><ellipse cx="38" cy="38" rx="33" ry="13.5" stroke="{c["accent"]}" stroke-width="2.6" transform="rotate(-28 38 38)"/><circle cx="38" cy="38" r="11" fill="{c["ink"]}"/><circle cx="64" cy="25" r="4.5" fill="{c["accent"]}"/></g>')
    b.append(T(74, 57.13, "ORBook", 22, 900, c["ink"], ls=-0.33))
    b.append(R(170, 41.5, 51.66, 19, 9.5, c["accent"]) + T(178, 54.5, "ADMIN", 9.5, 800, c["on"], ls=0.57))
    for i, (name, icon, count) in enumerate(ADMIN_NAV):
        y = 114 + i * 46
        on = name == active
        if on: b.append(R(30, y - 26, 204, 42, 21, c["accent"]))
        col = c["on"] if on else c["muted"]
        b.append(ICON(42, y - 14.5, 0.79, col, icon))
        b.append(T(73, y, name, 14.5, 800 if on else 700, col, raw=True))
        if count: b.append(R(200, y - 15, 22, 20, 10, c["card"] if on else c["sand"]) + T(211, y - 1.5, count, 11, 700, c["accent"] if on else c["muted"], "middle"))
    y = 114 + len(ADMIN_NAV) * 46 - 4
    b.append(R(30, y, 204, 62, 22, c["sand"]) + R(44, y + 17, 8, 8, 4, c["ok"]))
    b.append(T(60, y + 25, "Plan läuft", 13, 700, c["ink"]) + T(44, y + 46, "16:40 · nächster Abruf 16:45", 12, 400, c["muted"]))
    b.append(f'<line x1="30" y1="{H - 122.5}" x2="234" y2="{H - 122.5}" stroke="{c["hair"]}" stroke-width="1"/>')
    b.append(ICON(42, H - 102, 0.75, c["muted"], '<rect x="3" y="4" width="18" height="16" rx="2"/>' + P("M3 10h18M9 4v16M15 4v16")) + T(72, H - 88.5, "Zur App", 13.5, 700, c["muted"]))
    b.append(ICON(42, H - 62, 0.75, c["muted"], P("M14 8V5a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-3M10 12h10m0 0l-3-3m3 3l-3 3")) + T(72, H - 48.5, "Abmelden", 13.5, 700, c["muted"]))
    return "".join(b)

def pc_admin_codes(c, theme, sub):
    H = 900
    b = [admin_sidebar(c, H, "Lehrer-Codes")]
    b.append(eyebrow(284, 39, "Admin · 9b", c) + title(284, 80, "Lehrer-Codes", c, 38))
    b.append(R(1020, 45, 190, 36, 18, c["card"]) + ICON(1032, 55, 0.58, c["faint"], SEARCH) + T(1052, 68, "Kürzel suchen", 13, 400, c["faint2"]))
    b.append(button(1220, 40, 184, "Neuer Code", c, icon=PLUS, h=46))
    b.append(note_box(284, 110, 1120, [S("Ein Code pro Lehrkraft. Die Klasse sieht das Kürzel aus dem Plan: „eingetragen von Mü“. Lehrkräfte ändern nur ihre eigenen Einträge.", 400, c["muted"])], c, USER))
    ty = 168
    cols = [("Lehrkraft", 304), ("Fächer", 420), ("Code", 560), ("Darf", 660), ("Gültig bis", 880), ("Zuletzt", 1020), ("Einträge", 1140), ("Status", 1230)]
    b.append(R(284, ty, 1120, 46 + 57 * len(TEACHERS), 22, c["card"]))
    for name, cx in cols: b.append(T(cx, ty + 30, name, 12, 800, c["faint"]))
    for i, (who, subj, end, n, last, active, valid, rights) in enumerate(TEACHERS):
        ry = ty + 46 + i * 57
        b.append(f'<line x1="304" y1="{ry}" x2="1384" y2="{ry}" stroke="{c["hair"]}" stroke-width="1"/>')
        dim = c["ink"] if active else c["faint"]
        g = [T(304, ry + 33, who, 14, 800, dim), T(420, ry + 33, subj, 13, 400, c["muted"] if active else c["faint"]),
             T(560, ry + 33, f"••••-{end}", 13, 700, dim), T(660, ry + 33, rights, 13, 400, c["muted"] if active else c["faint"]),
             T(880, ry + 33, valid, 13, 400, c["muted"] if active else c["faint"]), T(1020, ry + 33, last, 13, 400, c["muted"] if active else c["faint"]),
             T(1140, ry + 33, str(n), 13, 700, dim)]
        bd, _ = badge(1230, ry + 19, "AKTIV" if active else "GESPERRT", c, "ok" if active else "off"); g.append(bd)
        g.append(switch(1318, ry + 16.5, active, c))
        g.append(ICON(1366, ry + 20, 0.71, c["ink"], DOTS_V).replace('fill="none"', f'fill="{c["ink"]}"'))
        b.append("".join(g))
    b.append(T(284, ty + 46 + 57 * len(TEACHERS) + 28, "Codes werden nur als Hash gespeichert. Den vollen Code siehst du nur einmal — beim Erstellen.", 12, 400, c["faint"]))
    return svg(1440, H, c, "".join(b))

# ── Ausgabe ──
SCREENS = {
    "handy-01-zugang": p_zugang,
    "handy-02-lehrer-code": p_lehrer_code,
    "handy-03-lehrer-code-fehler": lambda c, t, s: p_lehrer_code(c, t, s, "fehler"),
    "handy-04-hausaufgaben": p_hausaufgaben,
    "handy-05-hausaufgabe-details": lambda c, t, s: p_hausaufgaben(c, t, s, sheet=True),
    "handy-06-hausaufgabe-eintragen": p_hausaufgabe_form,
    "handy-07-tag": p_tag,
    "handy-08-klausur-autor": p_klausur_autor,
    "handy-09-hausaufgaben-leer": p_leer,
    "handy-10-admin-lehrer-codes": p_admin_codes,
    "handy-11-admin-neuer-lehrer-code": p_admin_new,
    "handy-12-admin-einstellungen": p_admin_settings,
    "handy-13-admin-neuer-editor-code": p_editor_new,
    "pc-01-zugang-lehrkraft": pc_zugang,
    "pc-02-hausaufgaben": pc_hausaufgaben,
    "pc-03-hausaufgabe-eintragen": pc_form,
    "pc-04-admin-lehrer-codes": pc_admin_codes,
    "pc-05-admin-neuer-editor-code": pc_editor_new,
}
if __name__ == "__main__":
    n = 0
    for theme, c in (("hell", LIGHT), ("dunkel", DARK)):
        for name, fn in SCREENS.items():
            open(os.path.join(OUT, f"{name}-{theme}.svg"), "w", encoding="utf-8").write(fn(c, theme, SUBJ[theme]))
            n += 1
    print(n, "files")
