---
title: "🖼️ 页面与布局"
description: 用同一个帧声明组合正文、字段、普通按钮、确认与退出。
---

一次显示的完整内容称为一帧，类型是 `DialogFrame`。下一次调用 `showFrame` 会创建一张新帧，旧页上的动作键随之失效。页面工厂在玩家所属线程调用。

## 选择页面类型

| 页面 | 普通按钮列表 | confirm | exit |
| --- | --- | --- | --- |
| 通知 | 空 | null | 确认或退出 |
| 二次确认 | 空 | 肯定动作 | 否定或退出 |
| 多按钮 | 一个或多个 | null | 返回或退出 |

受管页面都要为 `exit` 绑定自己的动作。普通按钮和肯定动作不能复用退出键。`columns` 指定多按钮页面的列数，取正整数。

## 正文与说明

`DialogFrame.Text` 接受 Adventure 的 `Component` 和像素宽度。`DialogFrame.Item` 能展示真实物品，并可以附加一段文字说明。将当前玩家的物品传给帧时，在玩家线程准备物品，避免渲染期间继续修改同一份物品。

```java
var help = new DialogFrame.Text(Component.text("选择本次操作"), 260);
var body = List.<DialogFrame.Body>of(help);
```

### 按物品 ID 展示图标

公告里显示 3 个石头，可以直接给出注册 ID 和数量。下面的图标占 16 × 16 像素，开启数量等装饰和物品提示。把 `stone` 加入页面的 `body` 即可。

```java
var stone = new DialogFrame.KeyedItem(net.kyori.adventure.key.Key.key("minecraft:stone"),
    3, null, 16, 16, true, true);
```

`KeyedItem` 接受有效的非空气物品 ID，数量为 1–99。展示玩家手中带附魔、名称或自定义数据组件的具体物品时，使用 `DialogFrame.Item`。自行用 `switch` 穷举正文的插件应覆盖 `KeyedItem`；两种物品正文都通过 `ItemDisplay` 提供说明、尺寸和显示选项。

## 换页与返回

在动作回调中调用 `dialogs.showFrame(who, ...)` 打开下一页。需要保留的分类、页码、草稿由业务代码保存，返回时带上这些值重新构建页面。每次构建都通过当前 `keys` 创建按钮。

自定义动作适配器可以保存 `frame.responseValidator()`，用 `validator.apply(response)` 按这一页声明的输入字段读取提交值。校验器只引用字段，等待异步结果期间可以释放表单正文和物品。受管页面会自动安装这个校验器。
