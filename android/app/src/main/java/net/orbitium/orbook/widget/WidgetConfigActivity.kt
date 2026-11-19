package net.orbitium.orbook.widget

import android.appwidget.AppWidgetManager
import android.content.Intent
import android.os.Bundle
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.enableEdgeToEdge
import net.orbitium.orbook.AndroidBridge
import net.orbitium.orbook.R
import net.orbitium.orbook.Site
import net.orbitium.orbook.withSystemBarPadding

/**
 * «Widget einstellen»: Android открывает этот экран, когда виджет кладут на рабочий стол.
 * Сам экран — страница сайта /mehr/android/widget/<id> (дизайн Soft, переводы, тот же вход),
 * «Fertig» вызывает ORBookAndroid.saveWidget — тогда виджет остаётся на рабочем столе.
 */
class WidgetConfigActivity : ComponentActivity(), AndroidBridge.WidgetHost {
    private lateinit var web: WebView
    private lateinit var bridge: AndroidBridge
    private var widgetId = AppWidgetManager.INVALID_APPWIDGET_ID

    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        widgetId = intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID)
        // Пока не нажали «Fertig», Android виджет не кладёт (назад = отмена)
        setResult(RESULT_CANCELED, result())
        if (widgetId == AppWidgetManager.INVALID_APPWIDGET_ID) return finish()

        web = WebView(this)
        web.setBackgroundColor(getColor(R.color.paper))
        setContentView(withSystemBarPadding(this, web))
        web.settings.javaScriptEnabled = true
        web.settings.domStorageEnabled = true
        bridge = AndroidBridge(web, this)
        web.addJavascriptInterface(bridge, AndroidBridge.NAME)
        web.webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView, url: String?, favicon: android.graphics.Bitmap?) {
                bridge.pageUrl = url
            }

            override fun doUpdateVisitedHistory(view: WebView, url: String?, isReload: Boolean) {
                bridge.pageUrl = url
            }
        }
        web.loadUrl(Site.url("/mehr/android/widget/$widgetId?neu=1"))
    }

    private fun result() = Intent().putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, widgetId)

    override fun widgetSaved(id: Int) {
        if (id != widgetId) return
        setResult(RESULT_OK, result())
        finish()
    }

    override fun widgetClosed() = finish()

    override fun onDestroy() {
        if (::web.isInitialized) web.destroy()
        super.onDestroy()
    }
}
