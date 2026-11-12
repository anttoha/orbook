# Генератор макетов части 17 «App + Mitteilungen»: установка ORBook как приложения (PWA) и Web Push.
# Основа — оригиналы ORBook Soft: 26 «Mitteilungen», PC 26 «Einstellungen · Mitteilungen», 22 «Mehr», 45 «Admin · Einstellungen».
# Помощники и цвета — из генераторов частей 14–26 (те же токены Soft).
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else HERE
_spec = importlib.util.spec_from_file_location("g26", os.path.join(HERE, "..", "26-live-verlauf", "gen.py"))
m26 = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(m26)
m22, m19, g, m15 = m26.m22, m26.m19, m26.g, m26.m15
T, S, R, ICON, P, label, eyebrow, title, button, round_btn, badge, note_box, switch, segmented = (
    g.T, g.S, g.R, g.ICON, g.P, g.label, g.eyebrow, g.title, g.button, g.round_btn, g.badge, g.note_box, g.switch, g.segmented)
CHECK, CHEV_R, BACK, CLOSE, SHARE = g.CHECK, g.CHEV_R, g.BACK, g.CLOSE, g.SHARE
toast, sheet_bg, page, INFO, WARN = m15.toast, m15.sheet_bg, m22.page, m15.INFO, m15.WARN
BELL, REFRESH, est, wide_button = m19.BELL, m19.REFRESH, m26.est, m26.wide_button
I_MITT, I_SHIELD = m22.I_MITT, m22.I_SHIELD
HLINE = m26.HLINE

PLUS_BOX = '<rect x="4" y="4" width="16" height="16" rx="4"/>' + P("M12 8v8M8 12h8")       # «Zum Home-Bildschirm»
DOWNLOAD = P("M12 4v11M7 10l5 5 5-5") + P("M5 19h14")                                      # «Installieren»
BELL_OFF = P("M6 16V11a6 6 0 0 1 9.5-4.9M18 11v5l2 2H8") + P("M10 21h4") + P("M4 4l16 16")
SEND = P("M4 12l16-8-6 16-3-7z") + P("M11 13l9-9")
LOCK = g.LOCK

def logo(x, y, c, k=0.39):
    """Значок ORBook из «So sieht es aus» (Soft 26): орбита с точкой."""
    return (f'<g transform="translate({x} {y}) scale({k} {k})" fill="none">'
            f'<ellipse cx="38" cy="38" rx="33" ry="13.5" stroke="{c["accent"]}" stroke-width="2.6" transform="rotate(-28 38 38)"/>'
            f'<circle cx="38" cy="38" r="11" fill="{c["ink"]}"/><circle cx="64" cy="25" r="4.5" fill="{c["accent"]}"/></g>')

def app_icon(x, y, c, s=56):
    """Иконка приложения на рабочем столе: белый/тёмный квадрат со скруглением и логотипом."""
    return R(x, y, s, s, s * 0.27, c["card"], c["rule"]) + logo(x + s * 0.06, y + s * 0.06, c, s / 85)

def head(c, ttl="Mitteilungen", eb="Mehr"):
    return round_btn(18, 33.31, c, BACK) + eyebrow(66, 33, eb, c) + title(66, 65, ttl, c)

# ── Пункты уведомлений: (заголовок, подпись, вкл. по умолчанию) ──
PREFS = [("Plan für morgen geändert", "Sobald die Schule ihn ändert", True),
         ("Stunde fällt heute aus", "Sofort, wenn es im Plan steht", True),
         ("Erinnerung für morgen", "Tests und Hausaufgaben · um 18:00", True),
         ("Neuer Test eingetragen", "Wenn jemand einen Test einträgt", False)]

def pref_card(x, y, w, c, prefs=PREFS, rh=73.5, dim=False, ov=None):
    """Карточка «Benachrichtige mich» как в Soft 26: строки 73.5, переключатель справа. dim — всё серое (ещё не включено)."""
    out = [R(x, y, w, rh * len(prefs), 22, c["card"])]
    for i, (t, s, on) in enumerate(prefs):
        if ov and i in ov: on = ov[i]
        ry = y + i * rh
        if i: out.append(HLINE(x + 14, x + w - 14, ry, c))
        out.append(T(x + 14, ry + 34, t, 14.5, 400, c["faint"] if dim else c["ink"]) + T(x + 14, ry + 53, s, 12, 400, c["faint"]))
        out.append(switch(x + w - 56, ry + 26, on and not dim, c))
    body = "".join(out)
    return (f'<g opacity="0.55">{body}</g>' if dim else body), rh * len(prefs)

def preview(x, y, w, c, line1="Morgen: 4. Std Geschichte → Vertretung, Raum", line2="B12"):
    """«So sieht es aus» — песочная карточка с примером уведомления (Soft 26)."""
    h = 81.78 if line2 else 62
    return (R(x, y, w, h, 22, c["sand"]) + logo(x + 14, y + 12, c) + T(x + 56, y + 25, "ORBook · jetzt", 13, 700, c["ink"])
            + T(x + 56, y + 45, line1, 13.5, 400, c["ink"]) + (T(x + 56, y + 63.9, line2, 13.5, 400, c["ink"]) if line2 else "")), h

def status_on(x, y, w, c):
    """Зелёная карточка: на этом устройстве включено + «Test senden»."""
    return (R(x, y, w, 64, 20, c["oktint"]) + f'<circle cx="{x + 30}" cy="{y + 32}" r="16" fill="{c["card"]}"/>' + ICON(x + 21, y + 23, 0.75, c["ok"], BELL, 2)
            + T(x + 56, y + 28, "An auf diesem Gerät", 14.5, 800, c["ok"]) + T(x + 56, y + 47, "Zuletzt: heute 07:14", 12, 400, c["muted"])
            + R(x + w - 104, y + 16, 90, 32, 16, c["card"]) + T(x + w - 59, y + 37, "Test senden", 12.5, 800, c["accink"], "middle"))

def courses_block(x, y, w, c, mine=True):
    out = label(x, y, "Für welche Kurse", c)
    out += segmented(x, y + 12, w, ["Meine Kurse · 7", "Ganze Klasse"], 0 if mine else 1, c, h=38)
    txt = "Wie unter „Meine Kurse“ – änderst du dort, gilt es hier mit." if mine else "Alle Kurse der Klasse, auch die, die du nicht hast."
    return out + T(x, y + 70, txt, 12, 400, c["faint"]), 78

def ruhe_card(x, y, w, c, on=True):
    return (label(x, y, "Ruhe", c) + R(x, y + 14, w, 73.5, 22, c["card"]) + T(x + 14, y + 48, "Ruhezeit", 14.5, 400, c["ink"])
            + T(x + 14, y + 67, S("Zwischen ", 400, c["faint"]) + S("21:00", 700, c["accink"]) + S(" und ", 400, c["faint"]) + S("06:30", 700, c["accink"]) + S(" still", 400, c["faint"]), 12, 400, c["faint"], raw=True)
            + switch(x + w - 56, y + 40, on, c)), 88

def settings_body(c, y, x=18, w=354, ov=None, mine=True, dim=False):
    """Всё, что под статусом: пример, список, курсы, Ruhe, подвал. Возвращает (svg, конец)."""
    b = [label(x, y, "So sieht es aus", c)]
    pv, ph = preview(x, y + 14, w, c); b.append(pv); y += 14 + ph + 34
    b.append(label(x, y, "Benachrichtige mich", c))
    card, ch = pref_card(x, y + 14, w, c, ov=ov, dim=dim); b.append(card); y += 14 + ch + 34
    cb, h = courses_block(x, y, w, c, mine); b.append(f'<g opacity="0.55">{cb}</g>' if dim else cb); y += h + 30
    rc, h = ruhe_card(x, y, w, c, not dim); b.append(f'<g opacity="0.55">{rc}</g>' if dim else rc); y += h + 14
    b.append(T(x, y + 12, "Fällt eine Stunde in der Ruhezeit aus, kommt das um 06:30.", 12, 400, c["faint"]))
    return "".join(b), y + 24

def off_button(x, y, w, c):
    return R(x, y, w, 48, 24, c["card"]) + ICON(x + w / 2 - est("Auf diesem Gerät ausschalten", 14) / 2 - 16, y + 16, 0.67, c["danger"], BELL_OFF, 2) + T(x + w / 2 + 10, y + 29, "Auf diesem Gerät ausschalten", 14, 700, c["danger"], "middle")

# ════════════════ Telefon ════════════════
def p_an(c, theme, sub, H=1090, extra=""):
    """Включено: статус, пример, четыре пункта, курсы, Ruhezeit, выключить."""
    b = [head(c), status_on(18, 92, 354, c)]
    body, end = settings_body(c, 192); b.append(body)
    b.append(off_button(18, end + 18, 354, c))
    b.append(T(195, end + 96, "Ohne Namen – der Server kennt nur Gerät und Kurse.", 11.5, 400, c["faint"], "middle"))
    return page(390, H, c, "".join(b) + extra)

def hero(x, y, w, c, icon, ttl, lines, btn=None, btn_icon=BELL, foot=None, tint="tint"):
    """Большая карточка в начале: круг со значком, заголовок, 2 строки текста, кнопка, подпись."""
    h = 118 + len(lines) * 19 + (64 if btn else 0) + (22 if foot else 0)
    out = [R(x, y, w, h, 24, c["card"]), f'<circle cx="{x + w / 2}" cy="{y + 44}" r="26" fill="{c[tint]}"/>',
           ICON(x + w / 2 - 12, y + 32, 1, c["accink"] if tint == "tint" else c["muted"], icon, 2),
           T(x + w / 2, y + 100, ttl, 18, 900, c["ink"], "middle")]
    for i, ln in enumerate(lines):
        out.append(T(x + w / 2, y + 124 + i * 19, ln, 13.5, 400, c["muted"], "middle"))
    yy = y + 124 + len(lines) * 19
    if btn:
        out.append(wide_button(x + 18, yy + 4, w - 36, btn, c, btn_icon)); yy += 64
    if foot: out.append(T(x + w / 2, yy + 8, foot, 12, 400, c["faint"], "middle"))
    return "".join(out), h

def p_aus(c, theme, sub):
    """Ещё выключено (первый раз): большая кнопка «Einschalten», ниже — что будет приходить (серым)."""
    hc, hh = hero(18, 92, 354, c, BELL, "Mitteilungen sind aus",
                  ["ORBook sagt dir Bescheid, wenn sich", "dein Plan ändert oder morgen ein Test ist."],
                  "Einschalten", BELL, "Der Browser fragt dich einmal um Erlaubnis.")
    body, end = settings_body(c, 92 + hh + 32, dim=True)
    return page(390, 1180, c, head(c) + hc + body)

def p_iphone(c, theme, sub):
    """iPhone, ORBook открыт в Safari: сначала установить на Home-Bildschirm."""
    hc, hh = hero(18, 92, 354, c, PLUS_BOX, "Erst zum Home-Bildschirm",
                  ["Auf dem iPhone kommen Mitteilungen nur,", "wenn ORBook wie eine App installiert ist."],
                  "So geht's", PLUS_BOX, "Ab iOS 16.4 · dauert 10 Sekunden")
    body, end = settings_body(c, 92 + hh + 32, dim=True)
    return page(390, 1180, c, head(c) + hc + body)

def steps(x, y, w, c, items, rh=64):
    """Шаги 1-2-3: номер в круге, текст с выделенным словом, справа значок."""
    out = [R(x, y, w, rh * len(items), 22, c["card"])]
    for i, (parts, icon) in enumerate(items):
        ry = y + i * rh
        if i: out.append(HLINE(x + 56, x + w - 14, ry, c))
        out.append(f'<circle cx="{x + 30}" cy="{ry + rh / 2}" r="14" fill="{c["tint"]}"/>' + T(x + 30, ry + rh / 2 + 5, str(i + 1), 14, 900, c["accink"], "middle"))
        out.append(T(x + 56, ry + rh / 2 + 5, "".join(S(t, wt, c["ink"]) for t, wt in parts), 14, 400, c["ink"], raw=True))
        if icon == "app": out.append(app_icon(x + w - 46, ry + rh / 2 - 16, c, 32))
        elif icon: out.append(R(x + w - 46, ry + rh / 2 - 16, 32, 32, 10, c["sand"]) + ICON(x + w - 40, ry + rh / 2 - 10, 0.83, c["accink"], icon, 2))
    return "".join(out), rh * len(items)

IOS_STEPS = [([("Unten auf ", 400), ("Teilen", 800), (" tippen", 400)], SHARE),
             ([("„", 400), ("Zum Home-Bildschirm", 800), ("“", 400)], PLUS_BOX),
             ([("ORBook vom ", 400), ("Home-Bildschirm", 800), (" öffnen", 400)], "app")]

def install_sheet(c, top, H):
    b = [sheet_bg(c, top, 390, H), eyebrow(18, top + 41, "iPhone · Safari", c), title(18, top + 70, "ORBook installieren", c, 26),
         round_btn(338, top + 42, c, CLOSE, size=34)]
    b.append(T(18, top + 100, "Dann startet ORBook wie eine App – mit eigenem", 13.5, 400, c["muted"]))
    b.append(T(18, top + 119, "Symbol, ohne Browserleiste und mit Mitteilungen.", 13.5, 400, c["muted"]))
    st, sh = steps(18, top + 138, 354, c, IOS_STEPS); b.append(st)
    y = top + 138 + sh + 16
    # подсказка-стрелка вниз к кнопке «Teilen» Safari
    b.append(note_box(18, y, 354, ["Die Teilen-Taste ist das Quadrat mit Pfeil", "unten in der Mitte von Safari."], c, INFO))
    b.append(button(18, y + 76, 354, "Verstanden", c, "sand", None))
    return "".join(b)

def p_iphone_sheet(c, theme, sub):
    return page(390, 844, c, strip_body(p_iphone, c, theme, sub) + install_sheet(c, 330, 844))

def strip_body(fn, c, theme, sub):
    return m26.strip(fn(c, theme, sub))

def p_blockiert(c, theme, sub):
    """Пользователь когда-то нажал «Nicht erlauben»: объяснить, где включить, и «Nochmal prüfen»."""
    b = [head(c)]
    hc, hh = hero(18, 92, 354, c, BELL_OFF, "Im Browser blockiert",
                  ["Du hast Mitteilungen für ORBook einmal", "abgelehnt. Erlauben kannst du sie nur dort."], tint="sand")
    b.append(hc)
    y = 92 + hh + 30
    b.append(label(18, y, "So erlaubst du sie wieder", c))
    items = [([("Oben links auf das ", 400), ("Schloss", 800), (" tippen", 400)], LOCK),
             ([("Berechtigungen", 800), (" → ", 400), ("Mitteilungen", 800)], I_MITT),
             ([("„", 400), ("Zulassen", 800), ("“ wählen", 400)], CHECK)]
    st, sh = steps(18, y + 14, 354, c, items); b.append(st)
    y += 14 + sh + 14
    b.append(T(18, y + 12, "iPhone: Einstellungen → Mitteilungen → ORBook.", 12, 400, c["faint"]))
    b.append(button(18, y + 32, 354, "Nochmal prüfen", c, "sand", REFRESH))
    body, end = settings_body(c, y + 112, dim=True); b.append(body)
    return page(390, 1300, c, "".join(b))

def time_field(x, y, w, lab, val, c, active=False):
    out = T(x, y, lab, 12.5, 800, c["faint"])
    out += R(x + .5, y + 10.5, w - 1, 51, 18, c["field"], c["accent"] if active else c["rule"], 2 if active else 1)
    return out + T(x + 16, y + 44, val, 20, 800, c["ink"]) + ICON(x + w - 34, y + 26, 0.75, c["faint"], g.P("M12 7v5l3 2") + '<circle cx="12" cy="12" r="9"/>', 2)

def p_ruhezeit(c, theme, sub):
    """Шторка «Ruhezeit»: с какого и до какого времени молчать."""
    top = 470
    b = [strip_body(p_an, c, theme, sub), sheet_bg(c, top, 390, 844), eyebrow(18, top + 41, "Mitteilungen", c),
         title(18, top + 70, "Ruhezeit", c, 26), round_btn(338, top + 42, c, CLOSE, size=34)]
    b.append(T(18, top + 100, "In dieser Zeit bleibt dein Handy still.", 13.5, 400, c["muted"]))
    b.append(time_field(18, top + 132, 171, "Von", "21:00", c, True) + time_field(201, top + 132, 171, "Bis", "06:30", c))
    b.append(note_box(18, top + 212, 354, ["Fällt heute eine Stunde aus, kommt das", "nach der Ruhezeit – wenn es noch stimmt."], c, INFO))
    b.append(button(18, top + 288, 354, "Fertig", c))
    return page(390, 844, c, "".join(b))

def system_note(x, y, w, c, ttl, line):
    """Уведомление системы сверху экрана (так его покажет телефон)."""
    out = [R(x, y, w, 72, 22, c["card"], extra=' filter="url(#nsh0)"'), R(x + .5, y + .5, w - 1, 71, 21.5, "none", c["hair"])]
    out.append(app_icon(x + 12, y + 14, c, 44))
    out.append(T(x + 66, y + 31, ttl, 13.5, 800, c["ink"]) + T(x + w - 14, y + 31, "jetzt", 12, 400, c["faint"], "end"))
    out.append(T(x + 66, y + 51, line, 13.5, 400, c["ink"]))
    return "".join(out)

def p_test(c, theme, sub):
    """«Test senden» нажато: тост внизу, через пару секунд сверху приходит само уведомление."""
    extra = system_note(10, 10, 370, c, "ORBook", "Test: Mitteilungen kommen an ✓") + toast(18, 770, 354, "Test gesendet · kommt in ein paar Sekunden", c, SEND)
    return page(390, 844, c, m26.strip(p_an(c, theme, sub, H=844)) + extra)

def p_fehler(c, theme, sub):
    """Нет сети: переключатель вернулся назад, тост объясняет."""
    out = m26.strip(p_an(c, theme, sub, H=844))
    return page(390, 844, c, out + toast(18, 770, 354, "Nicht gespeichert – keine Verbindung", c, WARN))

# ── Mehr: карточка «installieren» и строка «Mitteilungen» ──
def install_card(x, y, w, c):
    return (R(x, y, w, 120, 22, c["tint"]) + app_icon(x + 14, y + 16, c, 44)
            + T(x + 70, y + 34, "ORBook als App", 15, 800, c["ink"]) + T(x + 70, y + 53, "Eigenes Symbol, schneller Start, Mitteilungen.", 12.5, 400, c["muted"])
            + round_btn(x + w - 42, y + 10, c, CLOSE, size=30)
            + R(x + 14, y + 72, w - 28, 36, 18, c["accent"]) + ICON(x + w / 2 - 54, y + 82, 0.67, c["on"], DOWNLOAD, 2.2)
            + T(x + w / 2 + 10, y + 95, "Installieren", 13.5, 800, c["on"], "middle")), 120

def p_mehr(c, theme, sub):
    """Mehr: сверху — «ORBook als App» (пока не установлено, можно закрыть); в «Einstellungen» — строка «Mitteilungen · an»."""
    H = 1080
    b = [eyebrow(18, 33, "9b · Meine Schule", c), title(18, 65, "Mehr", c)]
    ic, ih = install_card(18, 88, 354, c); b.append(ic)
    y = 88 + ih + 34
    b.append(label(18, y, "Seiten", c) + T(372, y, "weitere Bereiche der App", 12, 400, c["faint"], "end"))
    rows = [(m22.BARS, "Statistik", "Woche · Monat"), (P("M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"), "Neuigkeiten", "0.12"),
            (m15.FOLDER, "Materialien", "6 Links"), (g.USER, "Klasse einladen", "Link + QR"), (INFO, "Kurz erklärt", "3 Tipps"), (I_SHIELD, "Datenschutz", None)]
    card, h = m22.rows_card(18, y + 12, 354, rows, c); b.append(card)
    y += 12 + h + 34
    b.append(label(18, y, "Einstellungen", c) + T(372, y, "so soll ORBook bei dir sein", 12, 400, c["faint"], "end"))
    rows = [(m22.I_KURSE, "Meine Kurse", "7 von 8"), (m22.I_DARST, "Darstellung", "Hell"), (m22.I_FARBEN, "Fachfarben", None),
            (I_MITT, "Mitteilungen", "3 von 4 an"), (m22.I_SYNC, "Synchronisieren", "K7QM-…"), (m22.I_KEY, "Tests eintragen", "Editor-Code")]
    card, h = m22.rows_card(18, y + 12, 354, rows, c); b.append(card)
    my = y + 12 + 3 * 52.5
    bd, _ = badge(196, my + 17, "NEU", c, "tint"); b.append(bd)
    b.append(f'<g transform="translate(0 {H - 844})">{m22.bottom_nav(c, 2)}</g>')
    return page(390, H, c, "".join(b))

# ── Admin ──
def p_admin(c, theme, sub):
    """Admin → Einstellungen → «Mitteilungen»: включить для класса, время напоминания, сколько устройств."""
    b = [round_btn(18, 33.31, c, BACK) + eyebrow(66, 33, "Admin", c) + title(66, 65, "Einstellungen", c)]
    y = 104
    b.append(label(18, y, "Mitteilungen", c)); bd, _ = badge(118, y - 13.5, "NEU", c, "tint"); b.append(bd); y += 14
    b.append(R(18, y, 354, 67 * 3, 22, c["card"]))
    b.append(T(32, y + 30, "Mitteilungen erlauben", 15, 400, c["ink"]) + T(32, y + 49, "Schüler können sie in „Mehr“ einschalten", 12, 400, c["faint"]) + switch(316, y + 21.5, True, c))
    b.append(HLINE(32, 358, y + 67, c))
    b.append(T(32, y + 97, "Erinnerung für morgen", 15, 400, c["ink"]) + T(32, y + 116, "Tests und Hausaufgaben", 12, 400, c["faint"]))
    pw = 84
    b.append(R(358 - pw + .5, y + 85.5, pw - 1, 31, 15.5, "none", c["rule"]) + T(358 - pw + 14, y + 106, "18:00", 13, 700, c["ink"]) + ICON(358 - 23, y + 95, 0.5, c["faint"], g.P("M6 9l6 6 6-6"), 2.2))
    b.append(HLINE(32, 358, y + 134, c))
    b.append(T(32, y + 164, "Geräte mit Mitteilungen", 15, 400, c["ink"]) + T(32, y + 183, "ohne Namen · nur die Anzahl", 12, 400, c["faint"]) + T(358, y + 170, "14", 17, 900, c["ink"], "end"))
    y += 67 * 3 + 14
    b.append(T(18, y + 12, "Ruhezeit und Auswahl legt jeder selbst fest.", 12, 400, c["faint"]))
    b.append(T(18, y + 29, "Ausgeschaltet: keine Mitteilungen mehr, Anmeldungen", 12, 400, c["faint"]))
    b.append(T(18, y + 46, "der Geräte werden gelöscht.", 12, 400, c["faint"]))
    y += 80
    b.append(label(18, y, "Zuletzt gesendet", c)); y += 14
    sent = [("Heute 07:14", "Plan für morgen geändert", "12 Geräte"), ("Gestern 18:00", "Erinnerung: Mathe-Test", "11 Geräte"), ("Mo 06:30", "Englisch fällt aus", "9 Geräte")]
    b.append(R(18, y, 354, 56 * 3, 22, c["card"]))
    for i, (w_, t_, n_) in enumerate(sent):
        ry = y + i * 56
        if i: b.append(HLINE(32, 358, ry, c))
        b.append(T(32, ry + 25, t_, 14, 600, c["ink"]) + T(32, ry + 43, w_, 12, 400, c["faint"]) + T(358, ry + 34, n_, 12.5, 400, c["muted"], "end"))
    return page(390, 844, c, "".join(b))

# ════════════════ Computer ════════════════
X0, W0 = 558, 680

def pc_frame(c, theme):
    inner = m22.pc_base("22 Einstellungen · Übersicht", theme)
    return [inner, R(250, 0, 1190, 900, 0, c["paper"]), m22.pc_sidebar(inner, c, True),
            eyebrow(284, 39, "9b · Meine Schule", c) + title(284, 80, "Mehr", c, 38), m22.pc_subnav(c, "Mitteilungen"),
            T(X0, 132, "Mitteilungen", 26, 900, c["ink"], ls=-0.39)]

def pc_status_on(x, y, w, c):
    return (R(x, y, w, 58, 18, c["oktint"]) + ICON(x + 18, y + 17, 0.83, c["ok"], BELL, 2)
            + T(x + 50, y + 25, "An auf diesem Computer", 14, 800, c["ok"]) + T(x + 50, y + 43, "Zuletzt angekommen: heute 07:14", 12, 400, c["muted"])
            + R(x + w - 236, y + 13, 108, 32, 16, c["card"]) + T(x + w - 182, y + 34, "Test senden", 12.5, 800, c["accink"], "middle")
            + R(x + w - 120, y + 13, 106, 32, 16, c["card"]) + T(x + w - 67, y + 34, "Ausschalten", 12.5, 800, c["danger"], "middle"))

def pc_right(c, x, y, w):
    """Правая колонка: курсы и Ruhe рядом со списком (на ПК места хватает)."""
    cb, _ = courses_block(x, y, w, c)
    rc, _ = ruhe_card(x, y + 110, w, c)
    return cb + rc

def pc_an(c, theme, sub):
    b = pc_frame(c, theme)
    b.append(pc_status_on(X0, 156, W0, c))
    L = 380
    b.append(label(X0, 248, "So sieht es aus", c))
    pv, ph = preview(X0, 262, L, c, "Morgen: 4. Std Geschichte → Vertretung, B12", None); b.append(pv)
    b.append(label(X0, 262 + ph + 34, "Benachrichtige mich", c))
    card, ch = pref_card(X0, 262 + ph + 48, L, c); b.append(card)
    b.append(pc_right(c, X0 + L + 28, 248, W0 - L - 28))
    b.append(T(X0, 262 + ph + 48 + ch + 26, "Ohne Namen: der Server kennt nur dieses Gerät und deine Kurse. Fällt in der Ruhezeit eine Stunde aus, kommt das um 06:30.", 12, 400, c["faint"]))
    return page(1440, 900, c, "".join(b))

def pc_aus(c, theme, sub):
    """ПК, ещё выключено: «Einschalten» (браузер спросит слева вверху) и «Als App installieren» (Chrome/Edge)."""
    b = pc_frame(c, theme)
    L = 380
    hc = (R(X0, 156, L, 150, 22, c["card"]) + f'<circle cx="{X0 + 40}" cy="{196}" r="22" fill="{c["tint"]}"/>' + ICON(X0 + 30, 186, 0.83, c["accink"], BELL, 2)
          + T(X0 + 74, 192, "Mitteilungen sind aus", 16, 900, c["ink"]) + T(X0 + 74, 212, "Plan geändert, Test morgen – ORBook sagt Bescheid.", 12.5, 400, c["muted"])
          + wide_button(X0 + 18, 236, L - 36, "Einschalten", c, BELL, h=44) + T(X0 + L / 2, 298, "Der Browser fragt oben links einmal um Erlaubnis.", 11.5, 400, c["faint"], "middle"))
    b.append(hc)
    rx, rw = X0 + L + 28, W0 - L - 28
    b.append(R(rx, 156, rw, 150, 22, c["tint"]) + app_icon(rx + 18, 174, c, 44) + T(rx + 74, 192, "Als App installieren", 15, 800, c["ink"])
             + T(rx + 74, 211, "Eigenes Fenster, ohne Tabs.", 12.5, 400, c["muted"]) + T(rx + 74, 228, "Chrome und Edge.", 12.5, 400, c["muted"])
             + R(rx + 18, 248, rw - 36, 40, 20, c["accent"]) + ICON(rx + rw / 2 - 52, 260, 0.67, c["on"], DOWNLOAD, 2.2)
             + T(rx + rw / 2 + 10, 273, "Installieren", 13.5, 800, c["on"], "middle"))
    b.append(label(X0, 344, "Benachrichtige mich", c))
    card, ch = pref_card(X0, 358, L, c, dim=True); b.append(card)
    b.append(f'<g opacity="0.55">{pc_right(c, rx, 344, rw)}</g>')
    return page(1440, 900, c, "".join(b))

SCREENS = {
    "handy-01-an": p_an,
    "handy-02-aus": p_aus,
    "handy-03-iphone": p_iphone,
    "handy-04-iphone-anleitung": p_iphone_sheet,
    "handy-05-blockiert": p_blockiert,
    "handy-06-ruhezeit": p_ruhezeit,
    "handy-07-test": p_test,
    "handy-08-fehler": p_fehler,
    "handy-09-mehr": p_mehr,
    "handy-10-admin": p_admin,
    "pc-01-an": pc_an,
    "pc-02-aus": pc_aus,
}
if __name__ == "__main__":
    n = 0
    for theme, c in (("hell", g.LIGHT), ("dunkel", g.DARK)):
        for name, fn in SCREENS.items():
            open(os.path.join(OUT, f"{name}-{theme}.svg"), "w", encoding="utf-8").write(fn(c, theme, g.SUBJ[theme]))
            n += 1
    print(n, "files")
