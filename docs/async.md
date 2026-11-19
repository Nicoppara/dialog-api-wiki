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

玩家先换页、按退出、打开背包或离服时，运行时会使相关结果失效。底层数据库操作可能继续执行；完成后不会用过期结果重新打开页面。发布新页本身也会使之前的读取失效，所以应在查询所属的页面就绪后再发起读取。

## 什么工作适合放进后台

数据库读取、字符串匹配、排序和快照排版适合在工作线程完成。实时权限、世界、背包和可变物品在玩家所属线程访问。事务、扣款和保存需要自己的业务完成语义；合并读取会跳过过时请求，不能用它代替写入队列。
