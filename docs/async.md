---
title: "⏳ 异步读取"
description: 在工作线程读数据，回到玩家线程发布当前结果。
---

`afterRead(player, worker, read, publish)` 适合名称搜索、只读数据库查询和分页。后台函数接收准备好的数据，发布回调在玩家所属线程执行。同一玩家最多有一个读取正在执行，另保留最新的待执行读取。

## 在提交动作中发起查询

下例的 `worker` 是宿主提供的后台执行器，`directory.findNames(query)` 返回名称列表，`openResults` 是业务插件自己的结果页。先取出请求字符串，然后让工作线程只处理这个值。

```java
keys.action((who, response) -> {
    String query = response == null ? null : response.getText("query");
    if (query == null || query.isBlank()) {
        who.sendMessage("请输入要搜索的名称");
        return;
    }
    dialogs.afterRead(who, worker, () -> directory.findNames(query), (names, failure) -> {
        if (failure != null) {
            who.sendMessage("读取失败，请稍后再试");
            return;
        }
        openResults(who, names);
    });
});
```

## 谁来处理过期结果

玩家先换页、按退出、打开背包或离服时，运行时会使相关结果失效。已失效且仍在排队的查询会在执行前跳过。已经开始的数据库读取可以完成，运行时会丢弃过期结果。发布新页本身也会使之前的读取失效，所以应在查询所属的页面就绪后再发起读取。

## 什么工作适合放进后台

数据库读取、字符串匹配、排序和快照排版适合在工作线程完成。实时权限、世界、背包和可变物品在玩家所属线程访问。事务、扣款和保存需要自己的业务完成语义；合并读取会跳过过时请求，不能用它代替写入队列。

## Folia 上的玩家线程

默认安装的运行时按目标玩家判断线程归属。例如，当甲和乙位于不同区域时，甲点击按钮后调用 `dialogs.showNativeFrame(乙, factory)`，页面工厂会在乙所属区域执行。乙在排队期间传送到其他区域，任务会跟随乙；乙先离线，尚未执行的任务会被丢弃。

| 入口 | 线程归属 |
| --- | --- |
| `showFrame`、`showNativeFrame`、`showPrepared`、`close(player)` | 运行时将操作交给目标玩家的实体调度器，已在所属区域时直接执行 |
| `afterRead` | 查询在宿主提供的工作线程执行，发布结果时回到该玩家当前所在区域 |
| `PreparedDialog.show(player)`、`PreparedDialog.close(player)` | 直接执行；调用方已在玩家所属区域时使用 |
| `compileAsync` | 在调用处复制物品和解析引用，然后交给工作线程构建。读取玩家的背包物品时，从该玩家的区域发起 |
| 配置阶段的 `show(connection)`、`DialogClick.listen` | 通过该次配置连接处理；进入游戏后再使用玩家实体 API |

宿主插件应在 `onDisable()` 中调用 `dialogs.close()`。在 `plugin.yml` 或 `paper-plugin.yml` 中声明 `folia-supported: true` 前，还需检查宿主自己的命令、世界操作和共享数据。两个玩家区域可能同时执行各自的业务回调。[PaperMC 的 Folia 线程指南](https://docs.papermc.io/paper/dev/folia-support/)

## 在真实 Folia 上验证了什么

在 Folia 26.3 build 26，两个协议客户端分别位于不同的 tick 区域。它们从后台请求打开表单，在各自的区域处理点击，再到后台读取数据。一个玩家收到了查询结果并点击退出；另一个在查询中途断线，完成的查询没有重新发布。最后让在线玩家保持受管表单并实际停用插件，客户端收到了关闭包。配置阶段的对话框和进入游戏后的对话框也分别验证了收发。
