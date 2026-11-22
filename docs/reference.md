---
title: "📚 接口与边界"
description: 独立库、Paper 和业务插件各自负责什么。
---

## 常用入口

| 类型或方法 | 用途 |
| --- | --- |
| `PaperDialogRuntime.install(plugin, namespace)` | 安装插件的受管运行时，注册点击、背包打开与离服监听 |
| `PaperDialogRuntime.entityDispatch(plugin)` | 自定义宿主可复用玩家所属线程判断、实体调度以及排队期间玩家离线的清理回调 |
| `showNativeFrame(player, factory)` | 用完整原生定义创建并托管页面 |
| `PreparedDialog.compile` / `compileAsync` | 预编译内容后多次发送，或把编译提交给工作线程 |
| `runtime.showPreencoded` | 在游戏或登录配置阶段复用静态页面的发送字节。[选择发送方式](preencoded.md) |
| `EncodedDialog.configuration` / `game`、`PreparedDialog.fromNbt` | 将已完成的内联页面 NBT 准备为对应阶段的首包 |
| `DialogFrame.KeyedItem` | 用原版物品 ID 和数量定义图标。[物品正文](frames.md) |
| `DialogCompiler.Context.of` / `DialogCompiler.build` | 在提供 26.3 原版类的宿主中绑定注册表与文本转换，编译页面定义 |
| `DialogRegistry.register` | 在 bootstrap 注册供原版命令和其他页面引用的页面 |
| `showFrame(player, factory)` | 为玩家创建当前帧，绑定按钮，并显示原版 Dialog |
| `afterRead(player, worker, read, publish)` | 合并同玩家的只读请求，在所属线程发布仍然有效的结果 |
| `close(player)` / `close()` | 管理单个玩家的关闭，或在停用插件时释放运行时 |
| `DialogFrame` | 声明标题、正文、输入、按钮和点击后行为 |

## 原生构建与平台职责

DialogAPI 定义并编译五种原版页面、按钮、输入和正文。游戏阶段直接后端构造 Minecraft 协议对象；配置阶段通过对应连接发送，启动注册通过 Paper 的注册表生命周期提交。原版客户端绘制页面。字段校验、动作归属和后台结果由 DialogAPI 管理，权限与事务由使用该库的插件决定。[原生页面、预编译与注册](native-dialog.md)

## 🧱 代码如何拆分

| 职责 | 对应代码 | 可以单独判断的问题 |
| --- | --- | --- |
| 页面长什么样 | `NativeDialog`、`DialogFrame` | 页面有哪些输入、按钮，输入值应满足什么约束？ |
| 这次点击还属于当前页吗 | `DialogSessions` | 玩家翻页后，迟到的旧按钮还能生效吗？ |
| 这次读取还需要发布吗 | `DialogReads` | 玩家又搜了一个词，先前请求如何结束？ |
| 如何交给服务端 | `DialogCompiler`、`NativeDialogBackend`、`DialogRegistry` | 哪些物品需要快照，注册键如何解析，哪种原生包负责展示？ |
| 插件如何调用 | `PaperDialogRuntime`、`PreparedDialog`、`DialogClick`、`PaperDialogTransport` | 何时绑定或释放监听，怎样发送静态页，原有插件怎样继续调用？ |

使用 `NativeDialog`、Adventure 文本和 `DialogFrame.KeyedItem`，可以在没有 Bukkit 的程序中定义带物品、输入和嵌套按钮的页面。在提供 Minecraft 26.3 原版类的宿主里，将当前 Dialog 注册表视图和文本转换函数传入 `DialogCompiler.Context.of(dialogRegistry, textConverter)`，再用 `DialogCompiler.build(definition, context)` 生成原版 Dialog。宿主负责取得玩家连接、处理点击和调度。Paper/Folia 插件可直接使用已有的 `PaperDialogRuntime` 适配器。

原版 Dialog 接收表单字段，物品正文供玩家查看。需要拖动物品、转移库存或结算交易的界面，应由管理背包槽位的插件处理。[原版能力与实测对比](comparison.md)

## 状态的含义

`isShowing(player)` 表示运行时仍持有活动帧。它不是客户端画面回执。如果另一个插件直接打开原生 Dialog，两个插件应协调关闭前一个运行时持有的页面。需要独立决定下一页的业务，在回调中重新检查当前权限或目标，再提交实际修改。
