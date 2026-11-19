# Методы моста вызывает JavaScript сайта — R8 не должен их переименовать или выкинуть
-keepclassmembers class net.orbitium.orbook.AndroidBridge {
    @android.webkit.JavascriptInterface <methods>;
}
