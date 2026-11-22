---
title: "📦 安装与打包"
description: 用 Maven、Gradle Groovy 或 Gradle Kotlin DSL 将 DialogAPI 打进自己的插件。
---

选择项目使用的构建工具，点击代码块右上角即可复制完整配置。示例使用 Java 25，从公开 Maven 仓库自动下载 DialogAPI。Paper API 由服务器提供，DialogAPI 随插件打包。

[跳到 Maven](#maven) · [跳到 Gradle Groovy](#gradle-groovy) · [跳到 Gradle Kotlin DSL](#gradle-kotlin-dsl)

## Maven

```xml title="pom.xml"
<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>
  <groupId>example.profile</groupId>
  <artifactId>profile-demo</artifactId>
  <version>1.0</version>

  <properties>
    <maven.compiler.release>25</maven.compiler.release>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>
  <repositories>
    <repository>
      <id>nicoppara-dialog</id>
      <url>https://nicoppara.github.io/dialog-api-wiki/maven/</url>
    </repository>
    <repository>
      <id>papermc</id>
      <url>https://repo.papermc.io/repository/maven-public/</url>
    </repository>
  </repositories>
  <dependencies>
    <dependency>
      <groupId>cn.nicoppa.minecraft</groupId>
      <artifactId>dialog-api</artifactId>
      <version>1.2.8</version>
    </dependency>
    <dependency>
      <groupId>io.papermc.paper</groupId>
      <artifactId>paper-api</artifactId>
      <version>26.3.build.5-alpha</version>
      <scope>provided</scope>
    </dependency>
  </dependencies>
  <build>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-compiler-plugin</artifactId>
        <version>3.16.0</version>
      </plugin>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-shade-plugin</artifactId>
        <version>3.6.2</version>
        <executions>
          <execution>
            <phase>package</phase>
            <goals><goal>shade</goal></goals>
            <configuration>
              <relocations>
                <relocation>
                  <pattern>cn.fircloud.fircore.dialog.api</pattern>
                  <shadedPattern>example.profile.libs.dialog</shadedPattern>
                </relocation>
              </relocations>
            </configuration>
          </execution>
        </executions>
      </plugin>
    </plugins>
  </build>
</project>
```

运行 `mvn package`，插件成品位于 `target/profile-demo-1.0.jar`。

## Gradle Groovy

```groovy title="build.gradle"
plugins {
    id 'java'
    id 'com.gradleup.shadow' version '9.3.2'
}

repositories {
    maven {
        url = uri('https://nicoppara.github.io/dialog-api-wiki/maven/')
        content { includeGroup 'cn.nicoppa.minecraft' }
    }
    mavenCentral()
    maven { url = uri('https://repo.papermc.io/repository/maven-public/') }
}

java { toolchain.languageVersion = JavaLanguageVersion.of(25) }

dependencies {
    implementation 'cn.nicoppa.minecraft:dialog-api:1.2.8'
    compileOnly 'io.papermc.paper:paper-api:26.3.build.5-alpha'
}

tasks.shadowJar {
    relocate 'cn.fircloud.fircore.dialog.api', 'example.profile.libs.dialog'
}
```

运行 `./gradlew shadowJar`，插件成品位于 `build/libs/*-all.jar`。

## Gradle Kotlin DSL

```kotlin title="build.gradle.kts"
plugins {
    java
    id("com.gradleup.shadow") version "9.3.2"
}

repositories {
    maven("https://nicoppara.github.io/dialog-api-wiki/maven/") {
        content { includeGroup("cn.nicoppa.minecraft") }
    }
    mavenCentral()
    maven("https://repo.papermc.io/repository/maven-public/")
}

java { toolchain.languageVersion.set(JavaLanguageVersion.of(25)) }
dependencies {
    implementation("cn.nicoppa.minecraft:dialog-api:1.2.8")
    compileOnly("io.papermc.paper:paper-api:26.3.build.5-alpha")
}
tasks.shadowJar {
    relocate("cn.fircloud.fircore.dialog.api", "example.profile.libs.dialog")
}
```

运行 `./gradlew shadowJar`，插件成品位于 `build/libs/*-all.jar`。

## 启动示例

把重定位目标 `example.profile.libs.dialog` 改为自己的插件包名。Java 源码仍从 `cn.fircloud.fircore.dialog.api` 导入，打包工具会同步重写引用。

按[第一个对话框](first-dialog.md)添加插件类和命令声明，把打包后的插件放进测试服的 `plugins/`。支持 Folia 的宿主还需要声明[玩家线程与调度](async.md)中列出的插件属性。
