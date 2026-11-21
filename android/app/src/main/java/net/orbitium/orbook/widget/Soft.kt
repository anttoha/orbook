package net.orbitium.orbook.widget

import androidx.compose.ui.graphics.Color
import androidx.glance.color.ColorProvider
import androidx.glance.unit.ColorProvider

/**
 * Цвета Soft для виджета — те же значения, что токены в src/index.css (светлая тема и .dark).
 * Виджет рисует Android, а не браузер, поэтому значения переписаны сюда.
 */
/** Цвет в светлой и тёмной теме (ARGB). */
data class Tone(val light: Long, val dark: Long) {
    /** Тот же цвет прозрачнее: f = 0…1 (фон «Hintergrund», стекло). */
    fun alpha(f: Float) = Tone(fade(light, f), fade(dark, f))

    private fun fade(c: Long, f: Float): Long {
        val a = ((c ushr 24) and 0xFF) * f.coerceIn(0f, 1f)
        return (a.toLong() shl 24) or (c and 0xFFFFFF)
    }
}

/** Цвета одного оформления. Soft — как раньше; Glas и Klar меняют поверхности, акцент — свои 4 цвета. */
data class Palette(
    val card: Tone,
    val ink: Tone,
    val muted: Tone,
    val faint: Tone,
    val hair: Tone,
    val sand: Tone,
    val skeleton: Tone,
    val accent: Tone,
    val accentInk: Tone,
    val tint: Tone,
    val onAccent: Tone,
    val danger: Tone,
    val dangerTint: Tone,
    val ok: Tone,
    val edge: Tone? = null, // рамка карточки: Klar — линия, Glas — светлая кромка; у Soft нет
    val okTint: Tone = Tone(0xFFE1F5EB, 0xFF163027), // часть 39: плашка хорошей оценки (--color-ok-tint)
)

object Soft {
    val paper = Tone(0xFFFBF7F2, 0xFF16131C)
    val card = Tone(0xFFFFFFFF, 0xFF221E2A)
    val ink = Tone(0xFF2A2433, 0xFFF4F0F8)
    val muted = Tone(0xFF6A6275, 0xFFB5ACC1)
    val faint = Tone(0xFF978FA1, 0xFF877E94)
    val hair = Tone(0xFFF0EAE2, 0xFF2B2634)
    val sand = Tone(0xFFF3EDE5, 0xFF2A2533)
    val skeleton = Tone(0xFFEEE7DE, 0xFF27222F)
    val accent = Tone(0xFF6C4DF6, 0xFFA58BFF)
    val accentInk = Tone(0xFF4A31C9, 0xFFCFC2FF)
    val tint = Tone(0xFFEEE9FF, 0xFF2C2548)
    val onAccent = Tone(0xFFFFFFFF, 0xFF1A1333)
    val danger = Tone(0xFFD6455D, 0xFFFF8AA0)
    val dangerTint = Tone(0xFFFCE7EB, 0xFF3A1D25)
    val ok = Tone(0xFF1F9D6B, 0xFF5FD3A2)

    private val base = Palette(card, ink, muted, faint, hair, sand, skeleton, accent, accentInk, tint, onAccent, danger, dangerTint, ok)

    /** Акценты: accent, accentInk, tint, onAccent — значения [data-accent=…] из src/index.css. */
    private val accents = mapOf(
        "violett" to listOf(Tone(0xFF6C4DF6, 0xFFA58BFF), Tone(0xFF4A31C9, 0xFFCFC2FF), Tone(0xFFEEE9FF, 0xFF2C2548), Tone(0xFFFFFFFF, 0xFF1A1333)),
        "blau" to listOf(Tone(0xFF3D6FE0, 0xFF7AA2F5), Tone(0xFF2A52B0, 0xFFC4D6FB), Tone(0xFFE3ECFD, 0xFF1F2B47), Tone(0xFFFFFFFF, 0xFF0F1A33)),
        "gruen" to listOf(Tone(0xFF1F8F5E, 0xFF5FCF9C), Tone(0xFF17704A, 0xFFB5EAD0), Tone(0xFFDFF3E9, 0xFF163027), Tone(0xFFFFFFFF, 0xFF0D2219)),
        "orange" to listOf(Tone(0xFFC8650F, 0xFFF5A35A), Tone(0xFF8F4A0E, 0xFFFBD3AE), Tone(0xFFFBE8D6, 0xFF3D2A1C), Tone(0xFFFFFFFF, 0xFF2B1806)),
        "pink" to listOf(Tone(0xFFD6456D, 0xFFF0849F), Tone(0xFFA3304F, 0xFFF8C3D0), Tone(0xFFFBE3EA, 0xFF3D1F2A), Tone(0xFFFFFFFF, 0xFF2E0F19)),
        "grafit" to listOf(Tone(0xFF4A4458, 0xFFC9C2D6), Tone(0xFF2F2A3A, 0xFFEBE6F2), Tone(0xFFEBE8EF, 0xFF2E2A37), Tone(0xFFFFFFFF, 0xFF1A1722)),
    )

    /**
     * Палитра виджета: оформление (как [data-design] в index.css и St в макетах 31d) + акцент.
     * Glas: настоящего размытия у виджетов Android нет — полупрозрачная карточка и светлая кромка, обои просвечивают.
     */
    fun palette(design: String, accent: String): Palette {
        val (a, ink, tint, on) = accents[accent] ?: accents.getValue("violett")
        val p = base.copy(accent = a, accentInk = ink, tint = tint, onAccent = on)
        return when (design) {
            "klar" -> p.copy(
                card = Tone(0xFFFFFFFF, 0xFF0F0E13), sand = Tone(0xFFF1EFF4, 0xFF211F29), hair = Tone(0xFFE4E0EA, 0xFF2A2734),
                skeleton = Tone(0xFFECEAF0, 0xFF1F1D27), edge = Tone(0xFFCFC9D8, 0xFF454052),
            )
            "glas" -> p.copy(
                card = Tone(0x99FFFFFF, 0x2EFFFFFF), sand = Tone(0x6BFFFFFF, 0x17FFFFFF), hair = Tone(0x142A2433, 0x17FFFFFF),
                skeleton = Tone(0x8CFFFFFF, 0x1AFFFFFF), muted = Tone(0xFF554D61, 0xFFD2CADF), faint = Tone(0xFF70687F, 0xFFA9A1BA),
                tint = Tone(a.light, a.dark).let { Tone(it.alpha(0.15f).light, it.alpha(0.24f).dark) },
                edge = Tone(0xD9FFFFFF, 0x33FFFFFF),
            )
            else -> p
        }
    }

    /** Палитры предметов: светлая плашка, текст на ней и «точка» (--color-<fach>-tint/-text/-solid). */
    class Fach(val tint: Tone, val text: Tone, val solid: Tone)

    val palettes = linkedMapOf(
        "deutsch" to Fach(Tone(0xFFF6D7DA, 0xFF482836), Tone(0xFF8D364C, 0xFFF3B5C4), Tone(0xFFE4577A, 0xFFE76B8A)),
        "mathe" to Fach(Tone(0xFFD8E0F1, 0xFF28314E), Tone(0xFF2F5192, 0xFFB0C8F6), Tone(0xFF4C82EC, 0xFF6191EE)),
        "englisch" to Fach(Tone(0xFFF8E1CA, 0xFF4A3326), Tone(0xFF94561B, 0xFFF8CCA2), Tone(0xFFEE8A2C, 0xFFF09845)),
        "physik" to Fach(Tone(0xFFD2E9E9, 0xFF223B47), Tone(0xFF1D6C7B, 0xFFA4DCE6), Tone(0xFF2FAFC7, 0xFF48B9CE)),
        "geschichte" to Fach(Tone(0xFFEFE3C8, 0xFF403523), Tone(0xFF765C14, 0xFFE3D09D), Tone(0xFFBF9420, 0xFFC7A13B)),
        "kunst" to Fach(Tone(0xFFF1D8EA, 0xFF422947), Tone(0xFF7B397E, 0xFFE6B8E8), Tone(0xFFC75CCB, 0xFFCE70D1)),
        "sport" to Fach(Tone(0xFFDFDFE2, 0xFF2F313E), Tone(0xFF444F63, 0xFFBFC7D5), Tone(0xFF6E80A0, 0xFF7F8FAB)),
        "biologie" to Fach(Tone(0xFFD5E9D9, 0xFF253B35), Tone(0xFF276E47, 0xFFAADCC2), Tone(0xFF3FB173, 0xFF56BA84)),
    )

    private val defaults = mapOf(
        "De" to "deutsch", "Ma" to "mathe", "En" to "englisch", "Ph" to "physik",
        "Ge" to "geschichte", "Ku" to "kunst", "Sp" to "sport", "Bi" to "biologie",
    )

    /** Как paletteOf во фронте: свой цвет пользователя → цвет дизайна → по сумме букв кода. */
    fun fach(code: String?, overrides: Map<String, String>): Fach {
        if (code.isNullOrEmpty()) return palettes.getValue("sport")
        val key = overrides[code] ?: defaults[code] ?: palettes.keys.elementAt(code.sumOf { it.code } % palettes.size)
        return palettes[key] ?: palettes.getValue("sport")
    }
}

/**
 * Как выглядит виджет: светлый/тёмный (dark = null — как телефон), палитра оформления, плотность фона и размер шрифта.
 */
class Look(private val dark: Boolean?, val p: Palette, val design: String, private val alpha: Float, val scale: Float) {
    fun of(pair: Tone): ColorProvider = when (dark) {
        null -> ColorProvider(day = Color(pair.light), night = Color(pair.dark))
        true -> ColorProvider(Color(pair.dark))
        false -> ColorProvider(Color(pair.light))
    }

    /** Фон карточки; «Hintergrund 0 %» — фона нет, только текст на обоях. */
    val background: ColorProvider? get() = if (alpha <= 0f) null else of(p.card.alpha(alpha))

    /** Рамка (Klar, Glas) — тоже тише вместе с фоном. */
    val edge: ColorProvider? get() = p.edge?.takeIf { alpha > 0f }?.let { of(it.alpha(alpha)) }

    /** Углы: Soft 22, Glas 24, Klar 10 (как --radius-card в оформлениях). */
    val radius: Int get() = when (design) { "klar" -> 10; "glas" -> 24; else -> 22 }
    val cellRadius: Int get() = if (design == "klar") 5 else 10
}
