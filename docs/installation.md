---
title: 安装与打包
description: 在 Java 25 和 Paper 26.3 的 Gradle 项目中引入 DialogAPI。
---

## 取得构件

使用有权访问的 Maven 仓库，或在持有 DialogAPI 源码的机器上运行 `.\gradlew.bat build publishToMavenLocal`。后者会把 1.1.0 安装到当前用户的 Maven 本地仓库。

如果维护者直接提供了 `dialog-api-1.1.0.jar`，把它放到消费插件的 `libs/` 下，并把下面的库依赖写为 `implementation(files("libs/dialog-api-1.1.0.jar"))`。

## 配置消费插件

下面是本地 Maven 接入方式。Paper 由服务端提供，DialogAPI 随插件一起打包。

```kotlin title="build.gradle.kts"
plugins {
    java
    id("com.gradleup.shadow") version "9.3.2"
}

repositories {
    mavenLocal()
    mavenCentral()
    maven("https://repo.papermc.io/repository/maven-public/")
}

java {
    toolchain.languageVersion.set(JavaLanguageVersion.of(25))
}

dependencies {
    implementation("cn.nicoppa.minecraft:dialog-api:1.1.0")
    compileOnly("io.papermc.paper:paper-api:26.3.build.5-alpha")
}

tasks.shadowJar {
    relocate("cn.fircloud.fircore.dialog.api", "example.profile.libs.dialog")
}
```

将重定位目标改为自己插件的私有包名。Java 源码的 import 使用原包名 `cn.fircloud.fircore.dialog.api`，Shadow 在打包时重写它。

## 安装到测试服

运行 `.\gradlew.bat shadowJar`，把生成的 `build/libs/*-all.jar` 放入 Paper 测试服的 `plugins/`，启动服务器。接下来编写[第一个对话框](first-dialog.md)。
