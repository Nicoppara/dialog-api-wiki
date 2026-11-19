---
title: "📝 表单输入"
description: 声明字段、读取类型化响应，并在提交时处理无效值。
---

每个字段在本帧内有唯一的 key。展示给玩家的是 label，回调使用 key 读取数据。回调参数 `response` 可以为空；缺失、类型不匹配或越界的字段也会返回 null。

| 字段 | 读取方法 | 服务端校验 |
| --- | --- | --- |
| `TextInput` | `getText(key)` | 已声明字段与最大长度，支持单行、多行 |
| `BooleanInput` | `getBoolean(key)` | 布尔类型，`false` 是有效回答 |
| `SingleOptionInput` | `getOption(key)` | 选项 ID 属于本帧声明的集合 |
| `NumberRangeInput` | `getFloat(key)` | 数值有限且落在声明的闭区间 |

## 单选

```java
var mode = new DialogFrame.SingleOptionInput("mode", Component.text("可见范围"), 160,
    List.of(new DialogFrame.Option("private", Component.text("仅自己")),
            new DialogFrame.Option("public", Component.text("所有玩家"))),
    "private");
```

回调按返回的 `"private"` 或 `"public"` 执行操作。展示文案可以翻译，存储和比较使用稳定的选项 ID。

## 滑块

```java
var distance = new DialogFrame.NumberRangeInput("distance", Component.text("距离"), 160,
    0f, 100f, 20f, 5f);
```

步长控制玩家拖动时的选值。如果业务要求“必须是 5 的整数倍”，请在提交操作中再验证这条规则。扣费、权限与数据保存同理由业务插件负责。
