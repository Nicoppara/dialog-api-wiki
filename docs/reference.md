---
title: 接口与边界
description: 独立库、Paper 和业务插件各自负责什么。
---

## 常用入口

| 类型或方法 | 用途 |
| --- | --- |
| `PaperDialogRuntime.install(plugin, namespace)` | 安装插件的受管运行时，注册点击、背包打开与离服监听 |
| `showFrame(player, factory)` | 为玩家创建当前帧，绑定按钮，并显示原版 Dialog |
| `afterRead(player, worker, read, publish)` | 合并同玩家的只读请求，在所属线程发布仍然有效的结果 |
| `close(player)` / `close()` | 管理单个玩家的关闭，或在停用插件时释放运行时 |
| `DialogFrame` | 声明标题、正文、输入、按钮和点击后行为 |

## 为什么库的代码量较小

Paper 和原版客户端已经实现窗口显示、协议和输入控件。DialogAPI 集中处理每个查看者当前打开的帧、动作键、字段校验和异步生命周期。库存拖动、交易、资源包主题和数据库结构各有独立的状态与规则，分别由对应系统管理。

## 状态的含义

`isShowing(player)` 表示运行时仍持有活动帧。它不是客户端画面回执。如果另一个插件直接打开原生 Dialog，两个插件应协调关闭前一个运行时持有的页面。需要独立决定下一页的业务，在回调中重新检查当前权限或目标，再提交实际修改。
