---
slug: /
title: "📗 DialogAPI 使用手册"
sidebar_label: "📗 简介"
description: 在 Paper 26.3 和 Folia 26.3 插件里构建原版 Dialog、读取表单并安全地处理后台查询。
---

DialogAPI 帮助插件在 Minecraft 原版客户端显示通知、确认框和表单。玩家按下按钮时，你收到当前页声明过的字段；玩家触发受管退出动作后，迟到的查询结果会失效。

| 环境 | 要求 |
| --- | --- |
| 服务端 | Paper 26.3、Folia 26.3 |
| Java | 25 |

## 🚀 第一次使用

1. [把库引入插件](installation.md)。选择 Maven、Gradle Groovy 或 Gradle Kotlin DSL，复制对应配置。
2. [创建第一个表单](first-dialog.md)。在游戏中输入 `/profiledemo`，填写昵称并提交，聊天栏会显示这次输入的值。
3. [组合多层页面](composition.md)。下载示例，按「主城 → 返回主城」体验两次跳转，或跟着四张实机截图阅读代码。

4. [反复显示静态页面](preencoded.md)。运行 `/dialogcompare cached notice`，再看已有 NBT 怎样在第一次发送前准备好。

## 为页面选择入口

| 你的页面 | 从哪里开始 |
| --- | --- |
| 大家看到同样的通知或指南，只需要关闭或跳到固定子页 | 用 `PreparedDialog.compile` 编译一次，随后复用。[静态页面](native-dialog.md) |
| 需要读玩家填的值、决定是否保存，或展示动态查询结果 | 用 `runtime.showNativeFrame` 创建当前玩家的表单，通过 `keys.action` 接收提交。[第一个对话框](first-dialog.md) |
| 固定页面已在启动时注册，需要反复展示或引用 | 用 `PreparedDialog.registered` 取得句柄。[注册页面](native-dialog.md) |

## 🧭 按场景查找

| 我想做什么 | 阅读 |
| --- | --- |
| 复用静态页、显示服务器链接、使用注册表或在登录阶段显示页面 | [原生页面、预编译与注册](native-dialog.md) |
| 显示一条通知、做二次确认，或把一组按钮排成多列 | [页面与布局](frames.md) |
| 读取文本、复选框、单选或滑块 | [表单输入](inputs.md) |
| 原地切换选项、翻页、返回或处理 Esc | [按钮与退出](actions.md) |
| 查数据库，且玩家已退出时别再打开结果页 | [异步读取](async.md) |
| 了解哪些行为由库、Paper 和宿主负责 | [接口与边界](reference.md) |
| 比较相同界面的服务端构建时间、临时分配和显示包体 | [与 Paper 对比](comparison.md) |
