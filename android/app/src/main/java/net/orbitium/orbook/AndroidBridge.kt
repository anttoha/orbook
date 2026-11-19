package net.orbitium.orbook

import android.net.Uri
import android.webkit.JavascriptInterface
import android.webkit.WebView
import org.json.JSONObject

/**
 * window.ORBookAndroid — то, что сайт может попросить у приложения.
 * Отвечает только нашему сайту: на чужой странице методы ничего не делают.
 * Обёртка во фронте — src/shared/api/android.js.
 */
class AndroidBridge(private val web: WebView) {
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
