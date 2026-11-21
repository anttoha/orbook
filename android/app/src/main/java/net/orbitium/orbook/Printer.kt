package net.orbitium.orbook

import android.content.Context
import android.os.Bundle
import android.os.CancellationSignal
import android.os.ParcelFileDescriptor
import android.print.PageRange
import android.print.PrintAttributes
import android.print.PrintDocumentAdapter
import android.print.PrintManager
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient

/**
 * Часть 37: системная печать Android (там же «Als PDF speichern»). В WebView window.print() не работает,
 * поэтому сайт просит приложение через мост. Вызывать в потоке экрана.
 */
object Printer {
    // Невидимый WebView с чужой страницей живёт, пока идёт печать (иначе его соберёт сборщик мусора)
    private var sheet: WebView? = null

    /** Напечатать открытую страницу сайта (@media print оставляет только лист). done — печать закрыта. */
    fun page(web: WebView, title: String, done: () -> Unit) = print(web.context, web.createPrintDocumentAdapter(title), title, done)

    /** Напечатать HTML (оригинал InfoPoint) в отдельном WebView: без JavaScript и без переходов по ссылкам. */
    fun html(context: Context, html: String, base: String?, title: String) {
        val view = WebView(context)
        view.settings.javaScriptEnabled = false
        view.settings.blockNetworkLoads = base == null // страница с сервера: стиль уже внутри, сеть не нужна
        view.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest) = true

            override fun onPageFinished(view: WebView, url: String?) {
                if (sheet !== view) return
                print(context, view.createPrintDocumentAdapter(title), title) {
                    sheet = null
                    view.destroy()
                }
            }
        }
        sheet?.destroy()
        sheet = view
        view.loadDataWithBaseURL(base, html, "text/html", "UTF-8", null)
    }

    private fun print(context: Context, adapter: PrintDocumentAdapter, title: String, done: () -> Unit) {
        val manager = context.getSystemService(Context.PRINT_SERVICE) as PrintManager
        val a4 = PrintAttributes.Builder().setMediaSize(PrintAttributes.MediaSize.ISO_A4).build()
        manager.print(title, Finish(adapter, done), a4)
    }

    /** Тот же адаптер WebView, но сообщает, когда окно печати закрыто. */
    private class Finish(private val inner: PrintDocumentAdapter, private val done: () -> Unit) : PrintDocumentAdapter() {
        override fun onStart() = inner.onStart()

        override fun onLayout(old: PrintAttributes?, new: PrintAttributes, cancel: CancellationSignal?, callback: LayoutResultCallback, extras: Bundle?) =
            inner.onLayout(old, new, cancel, callback, extras)

        override fun onWrite(pages: Array<out PageRange>, destination: ParcelFileDescriptor, cancel: CancellationSignal?, callback: WriteResultCallback) =
            inner.onWrite(pages, destination, cancel, callback)

        override fun onFinish() {
            inner.onFinish()
            done()
        }
    }
}
