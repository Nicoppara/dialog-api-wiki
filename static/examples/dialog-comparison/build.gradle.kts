plugins {
    java
    id("com.gradleup.shadow") version "9.3.2"
}

version = "1.0.0"

repositories {
    maven("https://nicoppara.github.io/dialog-api-wiki/maven/") {
        name = "DialogApi"
        content { includeGroup("cn.nicoppa.minecraft") }
    }
    maven("https://repo.momirealms.net/releases/") { content { includeModule("net.momirealms", "sparrow-nbt") } }
    mavenCentral()
    maven("https://repo.papermc.io/repository/maven-public/")
}

java { toolchain.languageVersion.set(JavaLanguageVersion.of(25)) }

dependencies {
    implementation("cn.nicoppa.minecraft:dialog-api:1.3.0")
    compileOnly("io.papermc.paper:paper-api:26.3.build.41-alpha")
}

tasks.withType<JavaCompile>().configureEach {
    options.encoding = "UTF-8"
}

tasks.shadowJar {
    manifest.attributes["paperweight-mappings-namespace"] = "mojang"
    relocate("net.momirealms.sparrow.nbt", "dialogcomparison.internal.nbt")
    relocate("cn.fircloud.fircore.dialog.api", "dialogcomparison.internal.dialogapi")
}
