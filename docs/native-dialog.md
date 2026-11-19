---
title: "🧱 原生页面、预编译与注册"
description: 用 DialogAPI 定义五种原版对话框，并在游戏或登录配置阶段显示。
---

`NativeDialog` 描述完整页面。标题、外部入口标题、Esc、暂停、点击后行为、正文和输入在同一个定义中设置。编写插件时可以只使用 DialogAPI 的页面类型，无需调用 Paper 的 Dialog builder。

| 页面类型 | 客户端用途 |
| --- | --- |
| `Notice` | 一条通知与一个按钮 |
| `Confirmation` | 确认和否定两个按钮 |
| `MultiAction` | 多列操作按钮，可带底部退出 |
| `DialogList` | 列出内联页、注册表中的页面或一组带标签的页面 |
| `ServerLinks` | 显示服务器公布的链接，可设置列数和按钮宽度 |

## 预编译可复用页面

例如，在插件启用后创建一次服务器链接页。这里的底部按钮沿用原版关闭行为。每次给玩家展示都可复用同一个 `PreparedDialog`。

```java
var back = new NativeDialog.Button(Component.text("返回"), null, 110, null);
var links = new NativeDialog(Component.text("服务器链接"), Component.text("查看链接"),
    true, false, DialogFrame.AfterAction.CLOSE,
    List.of(new DialogFrame.Text(Component.text("选择一个链接"), 260)),
    List.of(), new NativeDialog.ServerLinks(back, 1, 200));
var prepared = PreparedDialog.compile(links);
```

游戏阶段在玩家所属线程调用 `prepared.show(player)`。登录配置阶段调用 `prepared.show(connection)`，传入该次连接的 `PlayerConfigurationConnection`。两者都可用 `PreparedDialog.close(...)` 主动关闭。若从受管表单的按钮或 `afterRead` 回调切到此页，调用 `runtime.showPrepared(player, prepared)`，让运行时同时退役上一页的动作和待发布结果。

## 让工作线程构建页面

`PreparedDialog.compileAsync(links, executor)` 返回 `CompletableFuture<PreparedDialog>`。含物品或注册表引用时，在物品所属线程调用。库先复制物品并解析页面键和标签，再由指定执行器转换标题、正文、输入和动作。工作线程完成后，将展示交回玩家线程；同一份静态结果可以发给多名玩家。对于玩家专属、随时可能过期的搜索结果，使用[异步读取](async.md)管理当前请求。

已注册的三种内置入口可用 `PreparedDialog.registered(Key.key("minecraft:server_links"))`、`minecraft:quick_actions` 和 `minecraft:custom_options` 取得。注册表重新加载后，请重新获取需要长期持有的句柄。

## 在 bootstrap 注册自定义页面

在 Paper 插件的 `PluginBootstrap.bootstrap(BootstrapContext context)` 中注册。例如，`linksPage()` 可以直接返回上面构造的 `links` 定义。将插件的 bootstrapper 类填入 `paper-plugin.yml`。

```java
DialogRegistry.register(context, Key.key("example:links"), MyDialogs::linksPage);
```

每次组装注册表时会再次调用工厂。注册成功后可以用 `/dialog show @s example:links`；其他页面可用 `new NativeDialog.RegisteredDialog(Key.key("example:links"))` 引用它。`InlineDialog` 可嵌入另一份定义，`TagEntries` 可以引用对话框标签。

## 原生动作与回调

`StaticAction` 接受 Adventure 的静态点击事件，`OpenDialog` 跳到另一份定义或注册项，`CommandTemplate` 将玩家输入代入原版命令模板，`CustomAll` 把当前输入和附加 NBT 发给服务端。原生命令仍由服务端在命令发送者的权限下执行。

同一个固定动作键可以通过 `DialogClick.listen(plugin, key, definition, click -> ...)` 监听。用 `click.connection()` 区分游戏与配置阶段，用 `click.response()` 读取经定义校验的字段，用 `click.payload()` 取得原始 NBT。该键是协议标识，执行有权限要求的操作前应核对来源连接和当前授权。返回的订阅可单独关闭，Paper 在插件停用时也会注销监听器。

需要让提交只对当前玩家的当前页生效时，用 `runtime.showNativeFrame(player, keys -> ...)`。把 `keys.action(...)` 返回的键传给 `CustomAll`，底部退出动作也使用这次构建的键。固定的标题和正文可以复用；每次打开重新绑定玩家专属按钮。
