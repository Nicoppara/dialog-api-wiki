---
title: "🧭 从一张通知到三层指南"
description: 用同一份界面定义对照实机截图，逐层打开内联子页，最后回到游戏。
---

本例提供一条 `/dialogcompare` 命令。安装示例插件后，选 `api` 使用 DialogAPI，或选 `paper` 体验同一界面的 Paper 写法。[下载完整示例工程](https://nicoppara.github.io/dialog-api-wiki/examples/dialog-comparison-example.zip)

## 一张只有关闭按钮的通知

运行 `/dialogcompare api notice`。客户端显示标题、重启时间和一个居中的关闭按钮。点击「关闭」回到游戏。

![维护通知实机画面，服务器将于 23:30 重启](/img/dialog-comparison-notice.png)

下面的代码在玩家所属线程执行。正文宽度 240，按钮宽度 120。按钮没有绑定业务动作，客户端按页面的 `CLOSE` 行为退出。

```java
var close = new NativeDialog.Button(Component.text("关闭"), null, 120, null);
var notice = new NativeDialog(Component.text("维护通知"), null, true, false,
    DialogFrame.AfterAction.CLOSE,
    List.of(new DialogFrame.Text(Component.text("服务器将于 23:30 重启。"), 240)),
    List.of(), new NativeDialog.Notice(close));
PreparedDialog.compile(notice).show(player);
```

如果每次展示的标题和正文相同，可以保留 `PreparedDialog.compile(notice)` 的结果，后续直接调用 `show(player)`。[预编译与线程归属](native-dialog.md)

## 三层指南怎样组合

运行 `/dialogcompare api nested`。打开时，服务端已把「旅行指南 → 主城 → 返回主城」三页装进同一个包。玩家点击能打开子页的按钮，原版客户端就能接着显示内容。

**首页**显示「主城」和「关闭」。点击「主城」进入分类页。

![旅行指南首页，正文提示选择一个分类查看详情](/img/dialog-comparison-guide.png)

**分类页**显示「返回主城」和「关闭」。这里的「返回主城」是说明页的标题，点击它会打开帮助。

![主城分类页，点击返回主城可查看说明](/img/dialog-comparison-category.png)

**说明页**显示「输入 /spawn 返回主城。」点击「关闭」回到游戏。命令在玩家手动输入后才执行。

![返回主城说明页，正文给出 /spawn 命令，下面是关闭按钮](/img/dialog-comparison-tip.png)

### 子页按钮的写法

先创建子页 `child`，再把它放进父页的 `OpenDialog` 动作。父页的 `MultiAction` 以一列显示入口按钮，并提供单独的退出按钮。相同写法可把分类页接到首页上。

```java
var openChild = new NativeDialog.Button(Component.text("返回主城"), null, 120,
    new NativeDialog.OpenDialog(new NativeDialog.InlineDialog(child)));
var close = new NativeDialog.Button(Component.text("关闭"), null, 120, null);
var category = new NativeDialog(Component.text("主城"), null, true, false,
    DialogFrame.AfterAction.CLOSE,
    List.of(new DialogFrame.Text(Component.text("查看如何返回主城。"), 240)),
    List.of(), new NativeDialog.MultiAction(List.of(openChild), close, 1));
```

这种组合适合打开时就已知全部内容的帮助页。下一页取决于玩家提交的值、即时权限或查询结果时，改用受管按钮，在服务端回调里决定打开哪一页。[按钮与退出](actions.md)

## 自己对照两套实现

示例的 `ComparisonPages` 只定义一次标题、正文和页面树。`paper` 和 `api` 两个入口各自把它构建成可显示的页面。在同一个客户端运行 `/dialogcompare paper nested` 和 `/dialogcompare api nested`，就可以逐步对照。服务器构建和编码这两种界面的成本见[与 Paper 对比](comparison.md)。[查看两种构建方式的完整 Java 文件](https://nicoppara.github.io/dialog-api-wiki/examples/dialog-comparison/src/main/java/dialogcomparison/ComparisonPages.java)
