# Paper 与 DialogAPI 对照示例

同一份中文页面内容分别用 Paper 公开 builder 和 DialogAPI 的原生定义构建。示例注册一个命令，支持通知和三级静态导航。

| 命令 | 页面 |
|---|---|
| `/dialogcompare paper notice` | Paper builder 构建的维护通知 |
| `/dialogcompare api notice` | DialogAPI 构建的维护通知 |
| `/dialogcompare paper nested` | Paper builder 构建的旅行指南 |
| `/dialogcompare api nested` | DialogAPI 构建的旅行指南 |

输入 `/dialogcompare cached notice` 或 `/dialogcompare cached nested`，关闭后再打开，可在同一连接复用预构建页面及编码。

输入 `/dialogcompare document before`与 `/dialogcompare document after`，查看局部修改正文前后的通知。旧版本仍可独立打开。

在旅行指南点「主城」，然后点「返回主城」，叶页提示用 `/spawn` 返回主城。末页「关闭」回到游戏。

准备 JDK 25、Gradle 9 和 Paper 26.3 build 41。Gradle 从公共 Maven 仓库获取 `cn.nicoppa.minecraft:dialog-api:1.3.0`。

```text
gradle shadowJar
```

把 `build/libs/dialog-comparison-example-1.0.0-all.jar` 放进测试服的 `plugins/`，启动后在游戏中执行上面的命令。

[共同页面定义](src/main/java/dialogcomparison/ComparisonPages.java) · [命令入口](src/main/java/dialogcomparison/DialogComparisonExample.java) · [项目构建](build.gradle.kts)
