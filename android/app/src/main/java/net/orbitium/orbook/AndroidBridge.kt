package net.orbitium.orbook

import android.net.Uri
import android.webkit.JavascriptInterface
import android.webkit.WebView
import net.orbitium.orbook.widget.WidgetStore
import net.orbitium.orbook.widget.WidgetWorker
import net.orbitium.orbook.widget.Widgets
import org.json.JSONException
import org.json.JSONObject

/**
 * window.ORBookAndroid — то, что сайт может попросить у приложения.
 * Отвечает только нашему сайту: на чужой странице методы ничего не делают.
 * Обёртка во фронте — src/shared/api/android.js.
 */
class AndroidBridge(private val web: WebView, private val host: WidgetHost? = null) {
    /** Экран «Widget einstellen» (WidgetConfigActivity) узнаёт, что виджет сохранили или закрыли. */
    interface WidgetHost {
        fun widgetSaved(id: Int)
        fun widgetClosed()
    }

    private val context = web.context.applicationContext

    @Volatile
    var pageUrl: String? = null

    private val updater = UpdateInstaller(web.context, ::send)

    private fun allowed(): Boolean = Site.isOwn(pageUrl?.let(Uri::parse))

    /** {"versionName":"0.18.0","versionCode":3,"site":"orbook"} */
    @JavascriptInterface
    fun version(): String? {
        if (!allowed()) return null
        return JSONObject()
            .put("versionName", BuildConfig.VERSION_NAME)
            .put("versionCode", BuildConfig.VERSION_CODE)
            .put("site", BuildConfig.SITE)
            .toString()
    }

    /** Скачать новое APK с нашего сайта и открыть установщик. Ход — событиями orbook-android. */
    @JavascriptInterface
    fun installUpdate() {
        if (allowed()) updater.start()
    }

    @JavascriptInterface
    fun cancelUpdate() {
        if (allowed()) updater.cancel()
    }

    // ── виджет (часть 31b) ──

    /** Виджеты на телефоне: [{"id", "kind", "classId", "mine", "look", "background", "cols", "rows"}] */
    @JavascriptInterface
    fun widgets(): String? = if (allowed()) Widgets.list(context).toString() else null

    @JavascriptInterface
    fun widget(id: Int): String? = if (allowed()) Widgets.describe(context, id).toString() else null

    /** «Fertig» в «Widget einstellen»: сохранить и обновить виджет. */
    @JavascriptInterface
    fun saveWidget(id: Int, json: String) {
        if (!allowed()) return
        try {
            Widgets.save(context, id, JSONObject(json))
        } catch (e: JSONException) {
            return
        }
        web.post { host?.widgetSaved(id) }
    }

    /** ✕ в «Widget einstellen»: при первой настройке — виджет не кладётся. */
    @JavascriptInterface
    fun closeWidget() {
        if (allowed()) web.post { host?.widgetClosed() }
    }

    /** То, чего нет на сервере: классы, «Meine Kurse», заметки, галочки, тексты (src/shared/utils/widgetSnapshot.js). */
    @JavascriptInterface
    fun saveSnapshot(json: String) {
        if (!allowed()) return
        WidgetStore(context).saveSnapshot(json)
        Widgets.redraw(context)
    }

    /** Новый план пришёл в открытое приложение — освежить виджеты сразу, не ждать 30 минут. */
    @JavascriptInterface
    fun refreshWidgets() {
        if (allowed()) WidgetWorker.refreshNow(context)
    }

    /** Событие для сайта: window.addEventListener("orbook-android", e => e.detail) */
    private fun send(detail: JSONObject) {
        val script = "window.dispatchEvent(new CustomEvent('orbook-android',{detail:$detail}))"
        web.post { web.evaluateJavascript(script, null) }
    }

    fun close() = updater.cancel()

    companion object {
        const val NAME = "ORBookAndroid"
    }
}
