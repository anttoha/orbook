import java.util.Properties

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    // Виджет (часть 31b) рисуется Jetpack Glance — ему нужен компилятор Compose
    id("org.jetbrains.kotlin.plugin.compose")
}

// Ключ подписи и пароль лежат только на сервере (/root/.orbook-android), не в git.
// Путь к файлу с паролем передаёт scripts/android-build.sh.
val keystore = Properties().apply {
    System.getenv("ORBOOK_KEYSTORE_PROPS")?.let { path -> file(path).inputStream().use { load(it) } }
}

android {
    namespace = "net.orbitium.orbook"
    compileSdk = 35

    defaultConfig {
        applicationId = "net.orbitium.orbook"
        minSdk = 26
        targetSdk = 35
        // versionName — версия сайта из changelog, versionCode растёт с каждой сборкой (скрипт сборки)
        versionCode = (System.getenv("ORBOOK_VERSION_CODE") ?: "1").toInt()
        versionName = System.getenv("ORBOOK_VERSION_NAME") ?: "0.0.0"
    }

    signingConfigs {
        create("release") {
            if (!keystore.isEmpty) {
                storeFile = file(keystore.getProperty("storeFile"))
                storePassword = keystore.getProperty("storePassword")
                keyAlias = keystore.getProperty("keyAlias")
                keyPassword = keystore.getProperty("keyPassword")
            }
        }
    }

    // Один код — два APK: прод открывает orbook.orbitium.net, демо — orbook-demo (можно поставить оба)
    flavorDimensions += "site"
    productFlavors {
        create("prod") {
            dimension = "site"
            buildConfigField("String", "SITE_URL", "\"https://orbook.orbitium.net\"")
            buildConfigField("String", "SITE", "\"orbook\"")
            manifestPlaceholders["siteHost"] = "orbook.orbitium.net"
            resValue("string", "app_name", "ORBook")
        }
        create("demo") {
            dimension = "site"
            applicationIdSuffix = ".demo"
            buildConfigField("String", "SITE_URL", "\"https://orbook-demo.orbitium.net\"")
            buildConfigField("String", "SITE", "\"orbook-demo\"")
            manifestPlaceholders["siteHost"] = "orbook-demo.orbitium.net"
            resValue("string", "app_name", "ORBook Demo")
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            signingConfig = if (keystore.isEmpty) null else signingConfigs.getByName("release")
        }
    }

    buildFeatures {
        buildConfig = true
        compose = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.activity:activity-ktx:1.9.3")
    // Виджет на рабочем столе: Glance рисует его, WorkManager обновляет раз в 30 минут
    implementation("androidx.glance:glance-appwidget:1.1.1")
    implementation("androidx.work:work-runtime-ktx:2.10.0")
}
