package net.orbitium.orbook.noten

import android.content.Context
import android.webkit.CookieManager
import net.orbitium.orbook.BuildConfig
import net.orbitium.orbook.Site
import org.json.JSONObject
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL

/**
 * Часть 37: «Als PDF» → «Original» — страница InfoPoint для превью и печати, нигде не сохраняется.
 * Прод: прямо с телефона (как оценки, часть 36c) — страница и стиль школы как есть, чистит сайт
 * (src/shared/utils/cleanOriginal.js). Демо (адреса нет): `POST /api/noten/original` — сервер отдаёт
 * уже очищенную страницу со стилем внутри (css = null).
 */
object NotenOriginal {
    /** html + css (стиль школы; null — страница с сервера, уже чистая) или code ошибки. */
    data class Page(val html: String? = null, val css: String? = null, val code: String? = null, val retryAfter: Int? = null)

    private const val TRIES = 6 // как на сервере: 6 за 10 минут
    private const val WINDOW_MS = 10 * 60_000L
    private val tries = ArrayDeque<Long>()

    fun load(context: Context, url: String?, username: String?, password: String?, mode: String): Page {
        if (mode != "summary" && mode != "detail") return Page(code = "validation_error")
        val saved = NotenStore(context).login()
        val user = username?.takeIf { it.isNotBlank() } ?: saved?.username
        val pass = password?.takeIf { it.isNotEmpty() } ?: saved?.password?.takeIf { saved.username == user }
        if (user == null || pass == null) return Page(code = "no_login")
        limit()?.let { return it }
        if (url == null) {
            return if (BuildConfig.SITE == "orbook-demo") viaServer(user, pass, mode) else Page(code = "feature_disabled")
        }
        return try {
            val (html, css) = InfoPoint.fetchOriginal(url, user, pass, mode)
            when {
                Regex("""type\s*=\s*["']?password""", RegexOption.IGNORE_CASE).containsMatchIn(html) -> Page(code = "infopoint_denied")
                !html.contains("Zensuren") && !html.contains("Fehlzeiten") -> Page(code = "infopoint_changed")
                else -> Page(html = html, css = css)
            }
        } catch (e: InfoPoint.Denied) {
            Page(code = "infopoint_denied")
        } catch (e: InfoPoint.Unreachable) {
            Page(code = "infopoint_unreachable")
        }
    }

    @Synchronized
    private fun limit(): Page? {
        val now = System.currentTimeMillis()
        while (tries.isNotEmpty() && tries.first() < now - WINDOW_MS) tries.removeFirst()
        if (tries.size >= TRIES) return Page(code = "too_often", retryAfter = ((tries.first() + WINDOW_MS - now + 999) / 1000).toInt())
        tries.addLast(now)
        return null
    }

    /** Демо: тот же запрос, что делает сайт, с cookie входа из WebView. */
    private fun viaServer(username: String, password: String, mode: String): Page {
        val c = URL(Site.url("/api/noten/original")).openConnection() as HttpURLConnection
        return try {
            c.connectTimeout = 15_000
            c.readTimeout = 25_000
            c.requestMethod = "POST"
            c.doOutput = true
            c.setRequestProperty("Content-Type", "application/json")
            c.setRequestProperty("Origin", Site.url("")) // иначе 403 origin_rejected
            CookieManager.getInstance().getCookie(Site.url("/"))?.let { c.setRequestProperty("Cookie", it) }
            c.outputStream.use { it.write(JSONObject().put("username", username).put("password", password).put("mode", mode).toString().toByteArray()) }
            val status = c.responseCode
            val body = (if (status < 400) c.inputStream else c.errorStream)?.bufferedReader()?.use { it.readText() } ?: ""
            if (status == 200) return Page(html = JSONObject(body).getString("html"))
            val error = runCatching { JSONObject(body).getJSONObject("error") }.getOrNull()
            Page(code = error?.optString("code")?.ifEmpty { null } ?: "infopoint_unreachable", retryAfter = error?.optJSONObject("details")?.optInt("retryAfter"))
        } catch (e: Exception) {
            Page(code = "infopoint_unreachable")
        } finally {
            c.disconnect()
        }
    }
}
