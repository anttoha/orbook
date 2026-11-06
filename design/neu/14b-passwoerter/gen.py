# Генератор макетов части 14b «Passwörter» (админка). Помощники, цвета и меню берём из
# генератора части 14 — так новые экраны рисуются теми же токенами Soft, что и раньше.
# Основа — оригиналы ORBook Soft: 42 «Neuer Code» (шапка с «назад»), 45/47 «Einstellungen» (поля, кнопки), 48 (окно).
import importlib.util, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else HERE
_spec = importlib.util.spec_from_file_location("g14", os.path.join(HERE, "..", "14-lehrkraefte", "gen.py"))
g = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(g)
T, S, R, ICON, P, label, eyebrow, title, button, round_btn, note_box, svg, overlay, base = (
    g.T, g.S, g.R, g.ICON, g.P, g.label, g.eyebrow, g.title, g.button, g.round_btn, g.note_box, g.svg, g.overlay, g.base)
LOCK, KEY, SHIELD, COPY, CHECK, CHEV_R, BACK, CLOSE, SHARE = g.LOCK, g.KEY, g.SHIELD, g.COPY, g.CHECK, g.CHEV_R, g.BACK, g.CLOSE, g.SHARE

# Цвета, которых нет у части 14 (взяты из 13-admin-kurse/gen.py = токены skeleton и тоста в index.css)
g.LIGHT.update(skel="#EEE7DE", toastbg="#2A2433", toastfg="#FBF7F2")
g.DARK.update(skel="#27222F", toastbg="#F4F0F8", toastfg="#16131C")
# rsvg рисует превью запасным шрифтом шире Nunito — оценку ширины берём с запасом, чтобы значок не налезал на текст кнопки
g.tw = lambda t, size, w=700: len(t) * size * 0.62

SPARK = P("M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6")  # «Erzeugen»
EYE = P("M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z") + '<circle cx="12" cy="12" r="3"/>'
WARN = P("M12 4l9 16H3zM12 10v4M12 17h.01")
INFO = '<circle cx="12" cy="12" r="9"/>' + P("M12 11v5M12 8h.01")

GENERATED = "k7mp-4rxa-92tc"  # так выглядит пароль от сервера: 12 знаков, xxxx-xxxx-xxxx
SINCE, AGO = "Seit 10. Sept", "vor 12 Tagen"

def field(x, y, w, c, text=None, placeholder=None, error=False, eye=True, h=50):
    """Поле как в 45/47: цвет карточки, радиус 16; ошибка — красная рамка 2px (как 02 «falsches Passwort»)."""
    out = R(x, y, w, h, 16, c["card"])
    if error: out += R(x + 1, y + 1, w - 2, h - 2, 15, "none", c["danger"], 2)
    if text: out += T(x + 17, y + 31, text, 16, 400, c["ink"], ls=1.5)
    elif placeholder: out += T(x + 17, y + 30, placeholder, 16, 400, c["faint2"])
    if eye: out += ICON(x + w - 36, y + 15, 0.83, c["faint"], EYE)
    return out

def error_line(x, y, text, c):
    return ICON(x, y - 11, 0.58, c["danger"], WARN) + T(x + 19, y, text, 12.5, 400, c["danger"])

def toast(x, y, w, text, c):
    return R(x, y, w, 46, 16, c["toastbg"]) + ICON(x + 14, y + 15, 0.67, c["toastfg"], CHECK) + T(x + 40, y + 28, text, 13.5, 600, c["toastfg"])

def reveal(x, y, w, c, pc=False):
    """Фиолетовая карточка «nur jetzt sichtbar» как у нового Editor-Code (42/44), но для пароля класса."""
    h = 132 if pc else 150
    out = [R(x, y, w, h, 22, c["accent"])]
    out.append(f'<g opacity="0.8">{T(x + 16, y + 27, "Neues Klassenpasswort · nur jetzt sichtbar", 12.5, 800, c["on"])}</g>')
    out.append(T(x + 16, y + 68, GENERATED, 30 if pc else 27, 900, c["on"], ls=1))
    out.append(ICON(x + w - 40, y + 46, 0.75, c["on"], COPY))
    lines = (["24 Geräte wurden abgemeldet. Später ist das Passwort nirgends mehr", "zu sehen — schreib es jetzt in die Klassengruppe."] if pc else
             ["24 Geräte wurden abgemeldet.", "Später ist das Passwort nirgends mehr zu sehen —", "schreib es jetzt in die Klassengruppe."])
    for i, ln in enumerate(lines):
        out.append(f'<g opacity="0.8">{T(x + 16, y + 95 + i * 18, ln, 12, 400, c["on"])}</g>')
    return "".join(out), h

# ════════════════ Telefon ════════════════
def phone_head(c):
    return (R(18, 33.31, 38, 38, 19, c["card"]) + ICON(28.5, 43.81, 0.71, c["ink"], BACK)
            + eyebrow(66, 33, "Admin · Einstellungen", c) + title(66, 65, "Passwörter", c))

def section(y, text, right, c):
    return label(18, y, text, c) + (T(372, y, right, 12, 400, c["faint"], "end") if right else "")

def p_main(c, theme, sub, state="normal"):
    b = [phone_head(c)]
    if state == "laden":  # skeleton как в 13: серые полоски на месте подписей, поля — цвета карточки
        y = 92
        b.append(R(18, y, 354, 60, 16, c["skel"]))
        for top in (172, 418):
            b.append(R(18, top, 120, 12, 6, c["skel"]) + R(250, top, 122, 10, 5, c["skel"]))
            b.append(R(18, top + 30, 90, 10, 5, c["skel"]) + R(18, top + 50, 354, 50, 16, c["card"]))
            b.append(R(18, top + 118, 230, 10, 5, c["skel"]) + R(18, top + 142, 354, 48, 24, c["skel"]))
        return svg(390, 844, c, "".join(b))
    b.append(note_box(18, 90, 354, ["Gespeichert wird nur ein Hash. Auch du kannst", "ein Passwort später nicht mehr ansehen."], c, SHIELD))
    # ── Klassenpasswort ──
    y = 184
    b.append(section(y, "Klassenpasswort", "seit heute" if state == "erzeugt" else f"{SINCE} · {AGO}", c))
    if state == "erzeugt":
        card, h = reveal(18, y + 16, 354, c); b.append(card)
        y += 16 + h + 14
        b.append(button(18, y, 354, "Für die Klassengruppe kopieren", c, "sand", COPY)); y += 56
        b.append(button(18, y, 354, "Fertig", c)); y += 48
        y += 46
    else:
        b.append(label(18, y + 31.5, "Neues Passwort", c))
        b.append(field(18, y + 41.5, 354, c, placeholder="mindestens 10 Zeichen"))
        b.append(T(18, y + 109.5, "Alle Geräte der Klasse werden danach abgemeldet.", 12, 400, c["faint"]))
        b.append(button(18, y + 125.5, 136, "Erzeugen", c, "sand", SPARK))
        b.append(button(164, y + 125.5, 208, "Passwort ändern", c, icon=KEY))
        b.append(T(18, y + 197.5, "„Erzeugen“: ORBook denkt sich ein sicheres Passwort aus.", 12, 400, c["faint"]))
        y += 246
    # ── Admin-Passwort ──
    b.append(section(y, "Admin-Passwort", "nur für dich", c))
    err = state == "admin-fehler"
    b.append(label(18, y + 31.5, "Aktuelles Passwort", c))
    b.append(field(18, y + 41.5, 354, c, text="••••••••••" if err else None, error=err))
    y += 91.5
    if err: b.append(error_line(18, y + 18, "Passwort stimmt nicht · noch 4 Versuche", c)); y += 22
    b.append(label(18, y + 26, "Neues Passwort", c))
    b.append(field(18, y + 36, 354, c, text="••••••••••••••" if err else None, placeholder="mindestens 12 Zeichen"))
    b.append(T(18, y + 104, "Andere Admin-Geräte werden abgemeldet, dieses nicht.", 12, 400, c["faint"]))
    b.append(button(18, y + 120, 354, "Admin-Passwort ändern", c, icon=KEY))
    y += 200
    b.append(ICON(18, y - 11, 0.58, c["faint"], INFO) + T(37, y, "Vergessen? Neu setzen geht nur auf dem Server.", 12, 400, c["faint"]))
    if state == "gespeichert":
        b.append(toast(18, 776, 354, "Admin-Passwort geändert · 1 Gerät abgemeldet", c))
    return svg(390, 844, c, "".join(b))

def dialog(c, x, y, w, pc=False):
    """Окно подтверждения как 48 «Löschen bestätigen»: значок, заголовок, текст, черта, две кнопки справа."""
    h = 236 if pc else 270
    b = [R(x, y, w, h, 28, c["paper"], extra=' filter="url(#nsh0)"'), R(x, y, w, h, 28, c["paper"])]
    b.append(ICON(x + 26, y + 26, 0.83, c["accent"], SPARK))
    b.append(R(x + w - 52, y + 22, 30, 30, 15, c["card"]) + ICON(x + w - 44.5, y + 29.5, 0.62, c["ink"], CLOSE))
    b.append(T(x + 26, y + 80, "Neues Passwort erzeugen?" if pc else "Passwort erzeugen?", 25 if pc else 22, 900, c["ink"], ls=-0.35))
    lines = (["Alle Geräte der 9b werden sofort abgemeldet. Das neue", "Passwort siehst du nur einmal — direkt danach."] if pc else
             ["Alle Geräte der 9b werden sofort", "abgemeldet. Das neue Passwort siehst", "du nur einmal — direkt danach."])
    for i, ln in enumerate(lines):
        b.append(T(x + 26, y + 112 + i * 21, ln, 14, 400, c["muted"]))
    ly = y + h - 78
    b.append(f'<line x1="{x + 26}" y1="{ly}" x2="{x + w - 26}" y2="{ly}" stroke="{c["hair"]}" stroke-width="1"/>')
    b.append(button(x + w - 26 - 124 - 8 - 112, ly + 14, 112, "Abbrechen", c, "sand", None))
    b.append(button(x + w - 26 - 124, ly + 14, 124, "Erzeugen", c, icon=SPARK))
    return "".join(b)

def p_confirm(c, theme, sub):
    page = p_main(c, theme, sub)
    inner = page[page.index("</defs>") + 7: page.rindex("</svg>")]
    return svg(390, 844, c, inner + overlay(c, 390, 844) + dialog(c, 18, 290, 354))

def cut_shift(inner, top_end, bot_start, dy, W, H, x0=0, x1=None):
    """Оригинал дважды: всё выше top_end как есть, ниже bot_start (только колонка x0..x1) сдвинуто на dy."""
    x1 = W if x1 is None else x1
    return (f'<clipPath id="ytop"><rect x="0" y="0" width="{W}" height="{top_end}"/><rect x="0" y="0" width="{x0}" height="{H}"/>'
            f'<rect x="{x1}" y="0" width="{W - x1}" height="{H}"/></clipPath>'
            f'<clipPath id="ybot"><rect x="{x0}" y="{bot_start}" width="{x1 - x0}" height="{H}"/></clipPath>'
            f'<g clip-path="url(#ytop)">{inner}</g><g transform="translate(0 {dy})"><g clip-path="url(#ybot)">{inner}</g></g>')

def link_rows(x, y, w, c, rows):
    """Белая карточка со строками-ссылками как «Schnell» в 40: значок, название, значение справа, шеврон."""
    out = [R(x, y, w, 56 * len(rows), 22, c["card"])]
    for i, (icon, name, value) in enumerate(rows):
        ry = y + i * 56
        if i: out.append(f'<line x1="{x + 14}" y1="{ry}" x2="{x + w - 14}" y2="{ry}" stroke="{c["hair"]}" stroke-width="1"/>')
        out.append(ICON(x + 14, ry + 19, 0.75, c["muted"], icon) + T(x + 45, ry + 34, name, 15, 400, c["ink"]))
        out.append(T(x + w - 34, ry + 33, value, 13, 400, c["faint"], "end") + ICON(x + w - 28, ry + 21, 0.58, c["faint"], CHEV_R))
    return "".join(out)

ROWS = [(LOCK, "Klassenpasswort", f"seit 10. Sept"), (SHIELD, "Admin-Passwort", "ändern")]

def p_settings(c, theme, sub):
    """45 «Einstellungen»: вместо поля пароля — ссылка на новый раздел, остальное подтянуто вверх."""
    inner, w, h = base("45 Admin · Einstellungen", theme)
    new_end = 112 + 56 * len(ROWS)
    dy = new_end + 37.5 - 311.81  # следующий заголовок «Schule & Plan» — на том же расстоянии, что в оригинале
    body = cut_shift(inner, 82, 290, dy, 390, h) + label(18, 100.81, "Passwörter", c) + link_rows(18, 112, 354, c, ROWS)
    return svg(390, 844, c, body)

def p_overview(c, theme, sub):
    """40 «Übersicht»: строка «Klassenpasswort» в «Schnell» ведёт теперь в «Passwörter»."""
    inner, w, h = base("40 Admin · Übersicht", theme)
    return svg(w, h, c, inner.replace(">Klassenpasswort<", ">Passwörter<"))

# ════════════════ Computer ════════════════
g.ADMIN_NAV.insert(3, ("Passwörter", LOCK, None))  # после «Lehrer-Codes»

def pc_head(c):
    return g.admin_sidebar(c, 900, "Passwörter") + eyebrow(284, 39, "Admin · 9b", c) + title(284, 80, "Passwörter", c, 38)

def pc_class_card(x, y, w, c, state):
    b = [label(x + 20, y + 33.5, "Klassenpasswort", c),
         T(x + w - 20, y + 33.5, "seit heute" if state == "erzeugt" else f"{SINCE} · {AGO}", 12, 400, c["faint"], "end")]
    if state == "erzeugt":
        card, hh = reveal(x + 20, y + 52, w - 40, c, pc=True); b.append(card)
        by = y + 52 + hh + 16
        b.append(button(x + 20, by, 286, "Für die Klassengruppe kopieren", c, "sand", COPY))
        b.append(button(x + 316, by, 112, "Fertig", c))
        h = by + 48 + 22 - y
    else:
        b.append(label(x + 20, y + 65, "Neues Passwort", c) + field(x + 20, y + 75, w - 40, c, placeholder="mindestens 10 Zeichen"))
        b.append(T(x + 20, y + 143, "Alle Geräte der Klasse werden danach abgemeldet.", 12, 400, c["faint"]))
        b.append(button(x + 20, y + 159, 182, "Passwort ändern", c, icon=KEY))
        b.append(button(x + 212, y + 159, 128, "Erzeugen", c, "sand", SPARK))
        b.append(f'<line x1="{x + 20}" y1="{y + 231}" x2="{x + w - 20}" y2="{y + 231}" stroke="{c["hair"]}" stroke-width="1"/>')
        b.append(T(x + 20, y + 256, "„Erzeugen“: ORBook denkt sich ein sicheres Passwort aus (12 Zeichen).", 12, 400, c["faint"]))
        b.append(T(x + 20, y + 274, "Du siehst es nur einmal, direkt danach.", 12, 400, c["faint"]))
        h = 298
    return R(x, y, w, h, 22, c["card"]) + "".join(b)

def pc_admin_card(x, y, w, c, state):
    err = state == "admin-fehler"
    fw = (w - 40 - 12) / 2
    b = [label(x + 20, y + 33.5, "Admin-Passwort", c), T(x + w - 20, y + 33.5, "nur für dich", 12, 400, c["faint"], "end")]
    b.append(label(x + 20, y + 65, "Aktuelles Passwort", c) + field(x + 20, y + 75, fw, c, text="••••••••••" if err else None, error=err))
    b.append(label(x + 32 + fw, y + 65, "Neues Passwort", c) + field(x + 32 + fw, y + 75, fw, c, text="••••••••••••••" if err else None, placeholder="mindestens 12 Zeichen"))
    if err: b.append(error_line(x + 20, y + 144, "Passwort stimmt nicht · noch 4 Versuche", c))
    else: b.append(T(x + 20, y + 143, "Andere Admin-Geräte werden abgemeldet, dieses nicht.", 12, 400, c["faint"]))
    b.append(button(x + 20, y + 159, 232, "Admin-Passwort ändern", c, icon=KEY))
    b.append(f'<line x1="{x + 20}" y1="{y + 231}" x2="{x + w - 20}" y2="{y + 231}" stroke="{c["hair"]}" stroke-width="1"/>')
    b.append(ICON(x + 20, y + 245, 0.58, c["faint"], INFO) + T(x + 39, y + 256, "Vergessen? Neu setzen geht nur auf dem Server:", 12, 400, c["faint"]))
    b.append(T(x + 39, y + 274, "orbook set-admin-password", 12, 700, c["muted"]))
    return R(x, y, w, 298, 22, c["card"]) + "".join(b)

def pc_main(c, theme, sub, state="normal"):
    b = [pc_head(c)]
    b.append(note_box(284, 110, 1120, [S("Gespeichert wird nur ein Hash. Auch du kannst ein Passwort später nicht mehr ansehen — beim Erzeugen siehst du es genau einmal.", 400, c["muted"])], c, SHIELD))
    b.append(pc_class_card(284, 172, 550, c, state))
    b.append(pc_admin_card(854, 172, 550, c, state))
    if state == "gespeichert":
        b.append(toast(1044, 830, 360, "Admin-Passwort geändert · 1 Gerät abgemeldet", c))
    return svg(1440, 900, c, "".join(b))

def pc_confirm(c, theme, sub):
    page = pc_main(c, theme, sub)
    inner = page[page.index("</defs>") + 7: page.rindex("</svg>")]
    return svg(1440, 900, c, inner + overlay(c, 1440, 900) + dialog(c, 470, 300, 500, pc=True))

def pc_settings(c, theme, sub):
    """47 «Einstellungen»: первая карточка — ссылки на «Passwörter», высота та же. В меню новый пункт."""
    inner, w, h = base("47 Admin · Einstellungen", theme, "PC")
    body = [inner, R(16, 16, 232, 900 - 32, 28, c["card"]), g.admin_sidebar(c, 900, "Einstellungen")]
    body.append(R(284, 110.03, 550, 225, 22, c["card"]))
    body.append(label(304, 143.53, "Passwörter", c))
    body.append(link_rows(290, 158, 538, c, ROWS))
    body.append(T(304, 304, "Klassenpasswort ändern oder erzeugen, Admin-Passwort ändern.", 12, 400, c["faint"]))
    return svg(1440, 900, c, "".join(body))

SCREENS = {
    "handy-01-passwoerter": p_main,
    "handy-02-erzeugen-fragen": p_confirm,
    "handy-03-erzeugt": lambda c, t, s: p_main(c, t, s, "erzeugt"),
    "handy-04-admin-falsch": lambda c, t, s: p_main(c, t, s, "admin-fehler"),
    "handy-05-gespeichert": lambda c, t, s: p_main(c, t, s, "gespeichert"),
    "handy-06-laden": lambda c, t, s: p_main(c, t, s, "laden"),
    "handy-07-einstellungen": p_settings,
    "handy-08-uebersicht": p_overview,
    "pc-01-passwoerter": pc_main,
    "pc-02-erzeugen-fragen": pc_confirm,
    "pc-03-erzeugt": lambda c, t, s: pc_main(c, t, s, "erzeugt"),
    "pc-04-admin-falsch": lambda c, t, s: pc_main(c, t, s, "admin-fehler"),
    "pc-05-gespeichert": lambda c, t, s: pc_main(c, t, s, "gespeichert"),
    "pc-06-einstellungen": pc_settings,
}
if __name__ == "__main__":
    n = 0
    for theme, c in (("hell", g.LIGHT), ("dunkel", g.DARK)):
        for name, fn in SCREENS.items():
            open(os.path.join(OUT, f"{name}-{theme}.svg"), "w", encoding="utf-8").write(fn(c, theme, g.SUBJ[theme]))
            n += 1
    print(n, "files")
