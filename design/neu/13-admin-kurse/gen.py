# Генератор макета «Admin · Kurse und Fächer» по геометрии ORBook Soft 45/47. Цвета — токены index.css.
import os, sys
OUT = sys.argv[1]
LIGHT = dict(paper="#FBF7F2", card="#FFFFFF", ink="#2A2433", muted="#6A6275", faint="#978FA1", faint2="#C0B8C6", accent="#6C4DF6",
             on="#FFFFFF", accink="#4A31C9", tint="#EEE9FF", rule="#EAE2D8", hair="#F0EAE2", sand="#F3EDE5", ok="#1F9D6B", oktint="#E1F5EB",
             danger="#D6455D", dtint="#FCE7EB", skel="#EEE7DE", seg="#FFFFFF", toastbg="#2A2433", toastfg="#FBF7F2", field="#FBF7F2",
             Ma="#4C82EC", De="#E4577A", En="#EE8A2C", Ph="#2FAFC7", Ge="#BF9420", Ku="#C75CCB", Sp="#6E80A0", Bi="#3FB173", none="#C0B8C6")
DARK = dict(paper="#16131C", card="#221E2A", ink="#F4F0F8", muted="#B5ACC1", faint="#877E94", faint2="#5F576C", accent="#A58BFF",
            on="#1A1333", accink="#CFC2FF", tint="#2C2548", rule="#352F40", hair="#2B2634", sand="#2A2533", ok="#5FD3A2", oktint="#163027",
            danger="#FF8AA0", dtint="#3A1D25", skel="#27222F", seg="#3A3446", toastbg="#F4F0F8", toastfg="#16131C", field="#16131C",
            Ma="#6191EE", De="#E76B8A", En="#F09845", Ph="#48B9CE", Ge="#C7A13B", Ku="#CE70D1", Sp="#7F8FAB", Bi="#56BA84", none="#5F576C")

COURSES = [  # код, назва, вчитель, стан: pflicht | wahl (адмін) | auto (група/паралельний), підпис
    ("Ma", "Mathe", "T03", "pflicht", None), ("De", "Deutsch", "T11", "pflicht", None), ("En", "Englisch", "T25", "pflicht", None),
    ("Ph", "Physik", "T07", "pflicht", None), ("Bi", "Biologie", "T05", "wahl", None),
    ("Ku", "Kunst", "T09", "auto", "parallel zu Musik"), ("SpJu", "Sport", "T18", "auto", "Gruppe SpJu"),
]
SUBJECTS = [("Ma", "Mathe"), ("De", "Deutsch"), ("En", "Englisch"), ("Ph", "Physik"), ("Bi", "Biologie"), ("Ku", "Kunst"),
            ("Sp", "Sport"), ("TW", None), ("Spr", None), ("SF", None)]
DOT = {"SpJu": "Sp"}

def esc(t): return t.replace("&", "&amp;").replace("<", "&lt;")
def T(x, y, t, size, w, c, anchor=None, ls=None):
    a = f' text-anchor="{anchor}"' if anchor else ""
    l = f' letter-spacing="{ls}"' if ls else ""
    return f'<text x="{x}" y="{y}" font-family="Nunito" font-size="{size}" font-weight="{w}"{l} fill="{c}"{a} xml:space="preserve">{esc(t)}</text>'
def R(x, y, w, h, rx, fill, stroke=None):
    s = f' stroke="{stroke}" stroke-width="1"' if stroke else ""
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}"{s}/>'
def ICON(x, y, scale, color, inner, sw=2):
    return f'<g transform="translate({x} {y}) scale({scale} {scale})" fill="none" stroke="{color}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">{inner}</g>'
P = lambda d: f'<path d="{d}"/>'
CHECK, CHEV, RENEW = P("M5 12l5 5 9-10"), P("M6 10l6 6 6-6"), P("M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6")
LOCK = P("M7 11h10a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2zM8 11V8a4 4 0 0 1 8 0v3")
WARN = P("M12 4l9 16H3zM12 10v4M12 17h.01")
TABLE = '<rect x="3" y="4" width="18" height="16" rx="2"/>' + P("M3 10h18M9 4v16")
def tw(t, size, bold=True): return len(t) * size * (0.6 if bold else 0.53)

def segmented(right, y, value, c):  # «Pflicht | Wahl», як «Schüler | Lehrer» у макеті 45/47
    opts = [("Pflicht", 70), ("Wahl", 56)]
    total = 6 + sum(w for _, w in opts)
    x0 = right - total
    out = [R(x0, y, total, 35, 17.5, c["sand"])]
    x = x0 + 3
    for label, w in opts:
        on = label.lower() == value
        if on: out.append(R(x, y + 3, w, 29, 14.5, c["seg"]))
        out.append(T(x + w / 2, y + 22, label, 12.5, 800, c["ink"] if on else c["muted"], "middle"))
        x += w
    return "".join(out)

def auto_pill(right, y, c):  # «Wahl · automatisch» з замочком: змінити не можна
    text = "Immer Wahl"; w = tw(text, 12.5) + 46
    x0 = right - w
    return R(x0, y, w, 35, 17.5, c["tint"]) + ICON(x0 + 12, y + 10.5, 0.58, c["accink"], LOCK) + T(x0 + 30, y + 22, text, 12.5, 800, c["accink"])

def course_rows(x, y, width, c, compact=False):
    out, right = [], x + width
    for i, (code, name, teacher, state, sub) in enumerate(COURSES):
        top = y + i * 64
        if i: out.append(f'<line x1="{x}" y1="{top}" x2="{right}" y2="{top}" stroke="{c["hair"]}" stroke-width="1"/>')
        out.append(R(x, top + 25, 8, 8, 4, c[DOT.get(code, code)]))
        out.append(T(x + 16, top + 30, f"{code} · {name}", 14.5, 700, c["ink"]))
        out.append(T(x + 16, top + 49, f"{teacher} · {sub}" if sub else teacher, 12, 400, c["faint"]))
        out.append(auto_pill(right, top + 14, c) if state == "auto" else segmented(right, top + 14, state, c))
    return "".join(out), len(COURSES) * 64

def subject_rows(x, y, width, c, cols=1, error=None):
    out, colw = [], (width - (cols - 1) * 12) / cols
    for i, (code, name) in enumerate(SUBJECTS):
        cx, top = x + (i % cols) * (colw + 12), y + (i // cols) * 58
        out.append(R(cx, top + 4, 40, 40, 13, c["tint"]))
        out.append(T(cx + 20, top + 29, code, 13 if len(code) < 3 else 11.5, 900, c["accink"], "middle"))
        border = c["danger"] if error == code else None
        out.append(R(cx + 50, top, colw - 50, 48, 16, c["field"], border))
        out.append(T(cx + 66, top + 30, name or f"Kein Name — „{code}“", 16 if name else 14.5, 400, c["ink"] if name else c["faint2"]))
        if error == code:
            out.append(T(cx + 50, top + 64, "Höchstens 40 Zeichen", 12.5, 400, c["danger"]))
    rows = (len(SUBJECTS) + cols - 1) // cols
    return "".join(out), rows * 58

def stats_block(x, y, width, c):
    right = x + width
    out = [T(x, y + 26, "Zählen ab", 14.5, 400, c["ink"]), T(x, y + 45, "Leer = ab dem ersten Plan", 12, 400, c["faint"])]
    label = "22. Sept"; w = tw(label, 13) + 34
    out.append(R(right - w, y + 9, w, 31, 15.5, "none", c["rule"]))
    out.append(T(right - w + 11, y + 29, label, 13, 700, c["ink"]))
    out.append(ICON(right - 22, y + 18, 0.54, c["faint"], CHEV, 2.2))
    return "".join(out), 56

def button(x, y, w, label, c, kind="primary", icon=CHECK):
    fill, fg = (c["accent"], c["on"]) if kind == "primary" else (c["sand"], c["ink"])
    tx = x + w / 2 + 12
    return R(x, y, w, 48, 24, fill) + ICON(tx - tw(label, 14.5) / 2 - 26, y + 16, 0.67, fg, icon, 2.2) + T(tx, y + 29, label, 14.5, 700, fg, "middle")

def svg(w, h, c, body):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><rect x="0" y="0" width="{w}" height="{h}" fill="{c["paper"]}"/>{body}</svg>'

def label(x, y, t, c): return T(x, y, t, 12.5, 800, c["faint"])

# ── Телефон ──
def phone(c, state="normal"):
    b, x, W = [], 18, 354
    b.append(T(x, 33, "Admin · 9b", 12.5, 800, c["faint"]))
    b.append(T(x, 68, "Kurse und Fächer", 29, 900, c["ink"], ls=-0.43))
    b.append(T(x, 100, "Gilt für die ganze Klasse, auf allen Geräten.", 14, 400, c["muted"]))
    y = 136
    if state == "laden":
        for hgt in (300, 260, 120):
            b.append(R(x, y, 120, 12, 6, c["skel"])); y += 26
            b.append(R(x, y, W, hgt, 22, c["card"]))
            for k in range(int(hgt // 64)):
                b.append(R(x + 16, y + 20 + k * 64, 150, 14, 7, c["skel"])); b.append(R(x + 16, y + 42 + k * 64, 70, 10, 5, c["skel"]))
                b.append(R(x + W - 142, y + 16 + k * 64, 126, 32, 16, c["skel"]))
            y += hgt + 26
        return svg(390, 900, c, "".join(b))
    if state == "fehler":
        cy = 360
        b.append(f'<circle cx="195" cy="{cy}" r="32" fill="{c["tint"]}"/>' + ICON(183, cy - 12, 1, c["accink"], WARN))
        b.append(T(195, cy + 72, "Nicht geladen", 25, 900, c["ink"], "middle", -0.37))
        b.append(T(195, cy + 104, "Die Einstellungen kommen gerade nicht an.", 14, 400, c["muted"], "middle"))
        b.append(T(195, cy + 124, "Prüf die Verbindung und versuch es erneut.", 14, 400, c["muted"], "middle"))
        b.append(button(34, cy + 152, 322, "Erneut versuchen", c, "primary", RENEW))
        return svg(390, 900, c, "".join(b))
    b.append(label(x, y, "Kurse", c))
    b.append(T(x, y + 20, "Wahl-Kurse wählt jeder Schüler in „Meine Kurse“ selbst.", 12, 400, c["faint"]))
    y += 34
    rows, h = course_rows(x + 16, y + 6, W - 32, c)
    b.append(R(x, y, W, h + 12, 22, c["card"])); b.append(rows)
    y += h + 12 + 14
    b.append(ICON(x, y - 1, 0.54, c["faint"], LOCK))
    b.append(T(x + 18, y + 10, "Gruppen und parallele Kurse sind immer Wahl.", 12, 400, c["faint"]))
    y += 46
    b.append(label(x, y, "Fächer", c))
    b.append(T(x, y + 20, "Namen stehen in Woche, Tag und Klausuren.", 12, 400, c["faint"]))
    y += 34
    err = "Ku" if state == "fehler-feld" else None
    rows, h = subject_rows(x + 16, y + 16, W - 32, c, 1, err)
    b.append(R(x, y, W, h + 24 + (16 if err else 0), 22, c["card"])); b.append(rows.replace('x="', 'x="', 1))
    y += h + 24 + (16 if err else 0) + 36
    b.append(label(x, y, "Statistik", c))
    y += 12
    rows, h = stats_block(x + 16, y + 6, W - 32, c)
    b.append(R(x, y, W, h + 10, 22, c["card"])); b.append(rows)
    y += h + 10 + 24
    b.append(button(x, y, W, "Änderungen speichern", c))
    y += 48 + 30
    if state == "gespeichert":  # сповіщення під кнопкою, як тости застосунку
        b.append(R(x, y - 12, W, 46, 16, c["toastbg"]))
        b.append(ICON(x + 14, y + 3, 0.67, c["toastfg"], CHECK))
        b.append(T(x + 40, y + 16, "Gespeichert · gilt sofort für alle", 13.5, 600, c["toastfg"]))
        y += 56
    return svg(390, y, c, "".join(b))

# ── ПК: сайдбар як у 47, новий пункт «Kurse & Fächer» між «Klausuren» і «Protokoll» ──
NAV = [("Übersicht", P("M4 11l8-7 8 7v9H4z"), None), ("Editor-Codes", '<circle cx="8" cy="15" r="4"/>' + P("M11 12l9-9M17 6l3 3"), "4"),
       ("Klausuren", P("M5 21V4h12l-2 4 2 4H5"), "5"), ("Kurse &amp; Fächer", TABLE, None),
       ("Protokoll", P("M5 4h14v16H5z") + P("M9 9h6M9 13h6M9 17h3"), None),
       ("Einstellungen", '<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/>' + P("M7 7.5h.01M7 16.5h.01"), None)]
def sidebar(c, H):
    b = [R(16, 16, 232, H - 32, 28, c["card"])]
    b.append(f'<g transform="translate(34 36) scale(0.39 0.39)" fill="none"><ellipse cx="38" cy="38" rx="33" ry="13.5" stroke="{c["accent"]}" stroke-width="2.6" transform="rotate(-28 38 38)"/><circle cx="38" cy="38" r="11" fill="{c["ink"]}"/><circle cx="64" cy="25" r="4.5" fill="{c["accent"]}"/></g>')
    b.append(T(74, 57.13, "ORBook", 22, 900, c["ink"], ls=-0.33))
    b.append(R(170, 41.5, 51.66, 19, 9.5, c["accent"]) + T(178, 54.5, "ADMIN", 9.5, 800, c["on"], ls=0.57))
    for i, (name, icon, count) in enumerate(NAV):
        y = 114 + i * 46
        active = name.startswith("Kurse")
        if active: b.append(R(30, y - 26, 204, 42, 21, c["accent"]))
        col = c["on"] if active else c["muted"]
        b.append(ICON(42, y - 14.5, 0.79, col, icon))
        b.append(f'<text x="73" y="{y}" font-family="Nunito" font-size="14.5" font-weight="{800 if active else 700}" fill="{col}">{name}</text>')
        if count: b.append(R(200, y - 15, 22, 20, 10, c["sand"]) + T(207.69, y - 1.5, count, 11, 700, c["muted"]))
    y = 114 + len(NAV) * 46 - 4
    b.append(R(30, y, 204, 62, 22, c["sand"]) + R(44, y + 17, 8, 8, 4, c["ok"]))
    b.append(T(60, y + 25, "Plan läuft", 13, 700, c["ink"]) + T(44, y + 46, "16:40 · nächster Abruf 16:45", 12, 400, c["muted"]))
    b.append(f'<line x1="30" y1="{H - 122.5}" x2="234" y2="{H - 122.5}" stroke="{c["hair"]}" stroke-width="1"/>')
    b.append(ICON(42, H - 102, 0.75, c["muted"], '<rect x="3" y="4" width="18" height="16" rx="2"/>' + P("M3 10h18M9 4v16M15 4v16")) + T(72, H - 88.5, "Zur App", 13.5, 700, c["muted"]))
    b.append(ICON(42, H - 62, 0.75, c["muted"], P("M14 8V5a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-3M10 12h10m0 0l-3-3m3 3l-3 3")) + T(72, H - 48.5, "Abmelden", 13.5, 700, c["muted"]))
    return "".join(b)

def pc(c):
    H = 1000
    b = [sidebar(c, H)]
    b.append(T(284, 39, "Admin · 9b", 12.5, 800, c["faint"]))
    b.append(T(284, 80, "Kurse und Fächer", 38, 900, c["ink"], ls=-0.57))
    b.append(button(1176, 40, 228, "Änderungen speichern", c))
    # ліва картка: курси
    rows, h = course_rows(304, 178, 510, c)
    b.append(R(284, 110, 550, h + 104, 22, c["card"]))
    b.append(label(304, 143.5, "Kurse", c) + T(304, 162, "Wahl-Kurse wählt jeder Schüler in „Meine Kurse“ selbst.", 12, 400, c["faint"]))
    b.append(rows.replace(f'y1="{166}"', 'y1="166"'))
    ly = 110 + h + 104 - 22
    b.append(ICON(304, ly - 11, 0.54, c["faint"], LOCK) + T(322, ly, "Gruppen und parallele Kurse sind immer Wahl.", 12, 400, c["faint"]))
    # права картка: предмети, дві колонки
    rows, h2 = subject_rows(874, 176, 510, c, 2)
    b.append(R(854, 110, 550, h2 + 92, 22, c["card"]))
    b.append(label(874, 143.5, "Fächer", c) + T(874, 162, "Namen stehen in Woche, Tag und Klausuren. Ohne Namen zeigt die App den Code.", 12, 400, c["faint"]))
    b.append(rows)
    sy = 110 + h2 + 92 + 18
    rows, h3 = stats_block(874, sy + 46, 510, c)
    b.append(R(854, sy, 550, h3 + 66, 22, c["card"]) + label(874, sy + 33.5, "Statistik", c) + rows)
    return svg(1440, H, c, "".join(b))

files = {}
for theme, c in (("hell", LIGHT), ("dunkel", DARK)):
    for st in ("normal", "laden", "fehler", "gespeichert"):
        files[f"handy-{st}-{theme}.svg"] = phone(c, st)
    files[f"pc-{theme}.svg"] = pc(c)
for name, s in files.items():
    open(os.path.join(OUT, name), "w").write(s)
print(len(files), "files")
