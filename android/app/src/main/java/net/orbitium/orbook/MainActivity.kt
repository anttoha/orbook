package net.orbitium.orbook

import android.content.ActivityNotFoundException
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.os.Bundle
import android.webkit.CookieManager
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

/**
 * Всё приложение — это наш сайт в WebView. Поэтому интерфейс обновляется вместе с сайтом,
 * а пути /api/... и cookie входа остаются такими же, как в браузере.
 */
class MainActivity : ComponentActivity() {
    private lateinit var web: WebView
    private lateinit var bridge: AndroidBridge
    private var fileCallback: ValueCallback<Array<Uri>>? = null

    // Выбор файла для <input type="file"> на сайте
    private val pickFile = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        fileCallback?.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(result.resultCode, result.data))
        fileCallback = null
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        web = WebView(this)
        web.setBackgroundColor(getColor(R.color.paper))
        setContentView(withSystemBarPadding(web))

        setUpWebView()
        bridge = AndroidBridge(web)
        web.addJavascriptInterface(bridge, AndroidBridge.NAME)
        onBackPressedDispatcher.addCallback(this, backCallback)

        if (savedInstanceState == null || web.restoreState(savedInstanceState) == null) {
            web.loadUrl(Site.url("/"))
        }
    }

    /** Android 15 рисует приложение под строкой состояния — отодвигаем сайт от системных панелей и клавиатуры. */
    private fun withSystemBarPadding(content: WebView): FrameLayout {
        val root = FrameLayout(this)
        root.setBackgroundColor(getColor(R.color.paper))
        root.addView(content)
        ViewCompat.setOnApplyWindowInsetsListener(root) { view, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.ime())
            view.setPadding(bars.left, bars.top, bars.right, bars.bottom)
            WindowInsetsCompat.CONSUMED
        }
        return root
    }

    private fun setUpWebView() {
        with(web.settings) {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = false
            allowContentAccess = false
            userAgentString = "$userAgentString ORBookAndroid/${BuildConfig.VERSION_NAME}"
        }
        CookieManager.getInstance().setAcceptCookie(true)
        web.webViewClient = SiteClient()
        web.webChromeClient = FileChooserClient()
        // Файлы по http(s)-ссылке скачивает браузер телефона
        web.setDownloadListener { url, _, _, _, _ ->
            val uri = Uri.parse(url)
            if (uri.scheme == "https") openOutside(uri)
        }
    }

    /** Чужие ссылки (Drive, Telegram, Datenschutz-Links …) — в браузере или нужном приложении. */
    private inner class SiteClient : WebViewClient() {
        override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
            if (Site.isOwn(request.url)) return false
            openOutside(request.url)
            return true
        }

        override fun onPageStarted(view: WebView, url: String?, favicon: Bitmap?) {
            bridge.pageUrl = url
        }

        override fun doUpdateVisitedHistory(view: WebView, url: String?, isReload: Boolean) {
            bridge.pageUrl = url
        }
    }

    private inner class FileChooserClient : WebChromeClient() {
        override fun onShowFileChooser(
            view: WebView,
            callback: ValueCallback<Array<Uri>>,
            params: FileChooserParams,
        ): Boolean {
            fileCallback?.onReceiveValue(null)
            fileCallback = callback
            return try {
                pickFile.launch(params.createIntent())
                true
            } catch (e: ActivityNotFoundException) {
                fileCallback = null
                false
            }
        }
    }

    private fun openOutside(uri: Uri) {
        try {
            startActivity(Intent(Intent.ACTION_VIEW, uri))
        } catch (e: ActivityNotFoundException) {
            // нечем открыть — остаёмся на месте
        }
    }

    // «Назад» листает историю сайта; на первой странице — сворачивает приложение
    private val backCallback = object : OnBackPressedCallback(true) {
        override fun handleOnBackPressed() {
            if (web.canGoBack()) web.goBack() else moveTaskToBack(true)
        }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        web.saveState(outState)
    }

    override fun onDestroy() {
        bridge.close()
        web.destroy()
        super.onDestroy()
    }
}
