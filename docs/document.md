---
title: "✏️ 可编辑页面"
description: 从 Sparrow NBT 读入页面，修改一段正文，复用未改的内容并重新展示。
---

维护通知最初显示「服务器将于 23:30 重启」。维护结束时，只需修改正文，标题与关闭按钮沿用原页面的定义。

```java
import cn.fircloud.fircore.dialog.api.document.DialogDocument;
import cn.fircloud.fircore.dialog.api.paper.PreparedDialog;

var notice = DialogDocument.notice("维护通知", "关闭").appendText("服务器将于 23:30 重启。");
var before = PreparedDialog.game(notice);
var edited = notice.withBodyText(0, "服务器维护已完成。");
var after = before.withDocument(edited);
runtime.showPreencoded(player, after);
```

`runtime` 是已安装的 `PaperDialogRuntime`。需要再次发送旧通知时调用 `runtime.showPreencoded(player, before)`。使用对照工程可以分别输入 `/dialogcompare document before` 和 `/dialogcompare document after` 查看两个版本。[下载对照工程](https://nicoppara.github.io/dialog-api-wiki/examples/dialog-comparison-example.zip)

## 读入、修改与保存

已有 `net.momirealms.sparrow.nbt.CompoundTag` 时，使用 `DialogDocument.fromNbt(source)` 读入。编辑方法返回一个新的版本。`edited.toNbt()` 导出可独立修改的 Sparrow 标签树，原有的富文本、嵌套页面与未知字段会随文档保留。二进制接口 `readNbt(DataInput)` 和 `writeNbt(DataOutput)` 使用根标签带类型且无名称的网络 NBT。

```java
var form = DialogDocument.confirmation("搜索玩家", "查询", "取消")
    .appendTextInput("name", "玩家名")
    .withSubmitAction(0, "town:search");
var page = PreparedDialog.game(form);
runtime.showPreencoded(player, page);
```

`town:search` 由游戏连接作为自定义动作提交，宿主要按当前会话和权限处理查询。配置连接对应 `PreparedDialog.configuration(form)` 和 `runtime.showPreencoded(connection, page)`。[受管点击与退出](actions.md)

## 页面版本与滚动位置

同一来源的普通标题、单个按钮文案或一段普通正文支持增量准备。改变多个字段、替换子页或切换来源时，库会按目标协议重新验证。游戏注册表更换后再次准备游戏版本。

协议仍会传输完整页面。26.3 原版客户端收到展示包就创建新画面，正文滚动位置会回到顶部。`AfterAction.NONE` 可以让玩家点击后继续停留在当前页；服务器重新发送页面时仍会重建画面。[准备成本与实测数据](comparison.md)
