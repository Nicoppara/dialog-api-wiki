---
title: "📚 接口与边界"
description: 独立库、Paper 和业务插件各自负责什么。
---

## 常用入口

| 类型或方法 | 用途 |
| --- | --- |
| `PaperDialogRuntime.install(plugin, namespace)` | 安装插件的受管运行时，注册点击、背包打开与离服监听 |
| `showNativeFrame(player, factory)` | 用完整原生定义创建并托管页面 |
| `PreparedDialog.compile` / `compileAsync` | 预编译内容后多次发送，或把编译提交给工作线程 |
| `DialogRegistry.register` | 在 bootstrap 注册供原版命令和其他页面引用的页面 |
| `showFrame(player, factory)` | 为玩家创建当前帧，绑定按钮，并显示原版 Dialog |
| `afterRead(player, worker, read, publish)` | 合并同玩家的只读请求，在所属线程发布仍然有效的结果 |
| `close(player)` / `close()` | 管理单个玩家的关闭，或在停用插件时释放运行时 |
| `DialogFrame` | 声明标题、正文、输入、按钮和点击后行为 |

## 原生构建与平台职责

DialogAPI 定义并编译五种原版页面、按钮、输入和正文。游戏阶段直接后端构造 Minecraft 协议对象；配置阶段通过对应连接发送，启动注册通过 Paper 的注册表生命周期提交。原版客户端绘制页面。字段校验、动作归属和后台结果由 DialogAPI 管理，权限与事务由使用该库的插件决定。[原生页面、预编译与注册](native-dialog.md)

## 🧱 代码如何拆分

DialogAPI 1.2.0 有 **11 个生产 Java 源文件**，发布 JAR 包含 **68 个 `.class` 文件**。例如，`NativeDialog.java` 在同一份定义旁放置了通知、确认、页面列表等不同类型，编译器会为这些嵌套类型分别生成文件。

| 职责 | 对应代码 | 可以单独判断的问题 |
| --- | --- | --- |
| 页面长什么样 | `NativeDialog`、`DialogFrame` | 页面有哪些输入、按钮，输入值应满足什么约束？ |
| 这次点击还属于当前页吗 | `DialogSessions` | 玩家翻页后，迟到的旧按钮还能生效吗？ |
| 这次读取还需要发布吗 | `DialogReads` | 玩家又搜了一个词，先前请求如何结束？ |
| 如何交给服务端 | `DialogBuildContext`、`NativeDialogBackend`、`DialogRegistry` | 哪些物品需要快照，注册键如何解析，哪种原生包负责展示？ |
| 插件如何调用 | `PaperDialogRuntime`、`PreparedDialog`、`DialogClick`、`PaperDialogTransport` | 何时绑定或释放监听，怎样发送静态页，原有插件怎样继续调用？ |

`DialogSessions` 与 `DialogReads` 可以脱离 Minecraft 服务端测试。平台依赖也有明确的位置：物品正文使用 Bukkit 的 `ItemStack`，直接构建和发包适配 Paper 26.3；升级服务端时要复验这一层。

SparrowUI 面向容器界面，源码里还有槽位、物品拖动、虚拟背包和物品交易的处理。原版 Dialog 提交的是表单字段，物品正文供玩家查看，没有背包槽位可拖。比较两个库时，先看所管理的交互。[SparrowUI 源码](https://github.com/Catnies/sparrow-ui) · [原版能力与实测对比](comparison.md)

## 状态的含义

`isShowing(player)` 表示运行时仍持有活动帧。它不是客户端画面回执。如果另一个插件直接打开原生 Dialog，两个插件应协调关闭前一个运行时持有的页面。需要独立决定下一页的业务，在回调中重新检查当前权限或目标，再提交实际修改。
