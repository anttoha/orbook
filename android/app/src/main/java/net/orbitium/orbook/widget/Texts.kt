package net.orbitium.orbook.widget

/**
 * Тексты виджета. Основной язык — немецкий (как на сайте); перевод на English/Українська присылает сам сайт
 * в снимке (`texts`, ключ — немецкий текст, src/shared/utils/widgetSnapshot.js). Нет перевода — немецкий.
 * {n} в тексте заменяется числом или словом.
 */
class Texts(private val map: Map<String, String>, val lang: String) {
    fun t(key: String, n: Any? = null): String {
        val text = map[key] ?: key
        return if (n == null) text else text.replace("{n}", n.toString())
    }
}
