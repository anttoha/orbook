package net.orbitium.orbook

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.webkit.JavascriptInterface
import android.webkit.WebView
import net.orbitium.orbook.noten.NotenCheck
import net.orbitium.orbook.noten.NotenStore
import net.orbitium.orbook.noten.NotenWorker
import net.orbitium.orbook.notify.Notifications
import net.orbitium.orbook.notify.Notifier
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
class AndroidBridge(private val web: WebView, private val host: WidgetHost? = null, private val notifyHost: NotifyHost? = null) {
    /** Часть 31e: окно разрешения Android показывает экран приложения (MainActivity). */
    fun interface NotifyHost {
        fun requestNotifyPermission()
    }

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

    // ── уведомления самого приложения (часть 31e) ──

    /** {"on", "prefs", "quiet", "before", "reminderTime", "permission", "lastCheckAt"} — src/shared/utils/appNotify.js */
    @JavascriptInterface
    fun notifyState(): String? = if (allowed()) Notifications.state(context).toString() else null

    @JavascriptInterface
    fun saveNotify(json: String) {
        if (!allowed()) return
        try {
            Notifications.save(context, JSONObject(json))
        } catch (e: JSONException) {
            return
        }
    }

    /** «Einschalten»: окно разрешения Android; ответ — событием {type: "notify", permission}. */
    @JavascriptInterface
    fun requestNotify() {
        if (!allowed()) return
        val host = notifyHost
        if (host == null || Build.VERSION.SDK_INT < 33) notifyPermission() else web.post { host.requestNotifyPermission() }
    }

    /** «Einstellungen öffnen»: настройки уведомлений ORBook в Android. */
    @JavascriptInterface
    fun openNotifySettings() {
        if (!allowed()) return
        val intent = Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS)
            .putExtra(Settings.EXTRA_APP_PACKAGE, context.packageName)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(intent)
    }

    @JavascriptInterface
    fun testNotify() {
        if (allowed()) Notifications.test(context)
    }

    // ── Noten прямо из InfoPoint (часть 36c) — src/shared/api/noten.js ──

    /** {"saved": true, "username": "max.muster"} — сохранён ли логин («Angemeldet bleiben»). Пароль сайт не получает. */
    @JavascriptInterface
    fun notenState(): String? {
        if (!allowed()) return null
        val store = NotenStore(context)
        return JSONObject().put("saved", store.login() != null).put("username", store.username() ?: JSONObject.NULL).toString()
    }

    /**
     * {"id", "url", "username", "password", "remember"} → событие {type: "noten", id, ok, data | error: {code, retryAfter}}.
     * url null — через сервер ORBook (демо); password null — сохранённый. Сеть — не в потоке страницы.
     */
    @JavascriptInterface
    fun notenFetch(json: String) {
        if (!allowed()) return
        val request = try { JSONObject(json) } catch (e: JSONException) { return }
        fun text(name: String) = if (request.isNull(name)) null else request.optString(name).ifEmpty { null }
        Thread {
            val outcome = NotenCheck.fetch(context, text("url"), text("username"), text("password"), request.optBoolean("remember", true))
            val detail = JSONObject().put("type", "noten").put("id", request.opt("id")).put("ok", outcome.data != null)
            if (outcome.data != null) detail.put("data", JSONObject(outcome.data))
            else detail.put("error", JSONObject().put("code", outcome.code).put("retryAfter", outcome.retryAfter ?: JSONObject.NULL))
            send(detail)
        }.start()
    }

    /** Последние оценки, которые приложение забрало само (фон): {"data": {…}, "fetchedAt": ms} или null. */
    @JavascriptInterface
    fun notenData(): String? {
        if (!allowed()) return null
        val store = NotenStore(context)
        val data = store.data() ?: return null
        return JSONObject().put("data", JSONObject(data)).put("fetchedAt", store.fetchedAt()).toString()
    }

    /** «Abmelden»: логин и оценки из приложения стираются, фон останавливается. */
    @JavascriptInterface
    fun notenLogout() {
        if (!allowed()) return
        NotenStore(context).clear()
        NotenWorker.schedule(context)
    }

    /** Ответ на окно разрешения — сайту. */
    fun notifyPermission() = send(JSONObject().put("type", "notify").put("permission", Notifier.permission(context)))

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
