---
title: "📨 静态页面重复发送"
description: 编译一张维护通知，在游戏和登录配置阶段展示，选择首次发送前或连接内的编码复用方式。
---

一张维护通知可能被同一位玩家反复打开。标题、重启时间和关闭按钮都固定时，可以把页面保存在插件字段中。玩家看到的仍是同一张原版通知。

![维护通知的原版客户端画面，正文下方有一个关闭按钮](/img/dialog-comparison-notice.png)

| 你手里的内容 | 怎样展示 | 能省下什么 |
| --- | --- | --- |
| 已编译的静态页面 | `runtime.showPrepared(player, page)` | 多次展示共用页面对象 |
| 同一连接反复打开的公告或指南 | `runtime.showPreencoded(player, page)` | 相同阶段、相同语言下，后续展示复用首次编码的字节 |
| 已经排版和翻译好的页面 NBT | 按阶段用 `EncodedDialog` 准备，再用 `runtime.showPreencoded` | 匹配的连接从首次发送起就使用已准备好的字节 |
| 已通过注册表同步的固定页面 | `PreparedDialog.registered(key)` | 游戏阶段通常只需发送注册表编号 |

## 在游戏里打开两次通知

下载[对照示例工程](https://nicoppara.github.io/dialog-api-wiki/examples/dialog-comparison-example.zip)，按[组合教程](composition.md)安装。输入 `/dialogcompare cached notice`，点击「关闭」，再输入同一命令。试 `/dialogcompare cached nested` 可以看到包含两个内联子页的旅行指南。两次打开的外观相同，区别在服务端是否重新编码。

在插件启用时安装一个运行时，并把页面保存下来。下面的 `noticeDefinition` 就是[维护通知的完整定义](composition.md)。

```java
var runtime = PaperDialogRuntime.install(plugin, "notices");
var notice = PreparedDialog.compile(noticeDefinition);
```

在展示入口按当前阶段调用其中一个方法。游戏入口会调度到玩家所属线程；登录配置阶段传入当前事件提供的 `PlayerConfigurationConnection`。

```java
runtime.showPreencoded(player, notice);      // 游戏阶段
```

```java
runtime.showPreencoded(connection, notice);  // 登录配置阶段
```

普通预构建页在当前连接首次展示时仍由原版编码器编码。换连接、重新绑定协议或玩家语言改变时，会分别准备可用的字节。内容或服务端翻译资源更新后重新编译页面。插件停用时调用 `runtime.close()`，释放运行时并恢复它接管的编码器。

## 已有 NBT，让首包也复用

这一写法使用 Minecraft 26.3 的 `CompoundTag` 和 `RegistryAccess`。插件源码需要可以编译 NMS 类型的开发依赖，例如对应版本的 paperweight 开发包。只想展示普通静态页面时，上一节的 API 足够。

下面的 Java 类从同一个通知标签准备两份页面。配置阶段可以在进入世界前显示。游戏阶段使用服务器绑定出站协议的注册表。可在加载内容时完成准备，之后按阶段复用。

```java
import cn.fircloud.fircore.dialog.api.nms.EncodedDialog;
import cn.fircloud.fircore.dialog.api.paper.PreparedDialog;
import net.minecraft.core.RegistryAccess;
import net.minecraft.nbt.CompoundTag;

public record NoticePackets(PreparedDialog configuration, PreparedDialog game) {
    public static NoticePackets prepare(RegistryAccess registries) {
        var action = new CompoundTag();
        action.putString("label", "关闭");
        action.putInt("width", 120);
        var body = new CompoundTag();
        body.putString("type", "minecraft:notice");
        body.putString("title", "维护通知");
        var message = new CompoundTag();
        message.putString("type", "minecraft:plain_message");
        message.putString("contents", "服务器将于 23:30 重启。");
        message.putInt("width", 240);
        body.put("body", message);
        body.put("action", action);

        return new NoticePackets(
            PreparedDialog.fromNbt(EncodedDialog.configuration(body)),
            PreparedDialog.fromNbt(EncodedDialog.game(body, registries)));
    }
}
```

在 Paper 的 NMS 开发环境中，下面的 `plugin` 为宿主插件。保留 `pages`，在两个展示入口各取对应的页面。

```java
var server = ((org.bukkit.craftbukkit.CraftServer) plugin.getServer()).getServer();
var pages = NoticePackets.prepare(server.registryAccess());
```

| 展示时机 | 调用 |
| --- | --- |
| 配置事件中 | `runtime.showPreencoded(connection, pages.configuration())` |
| 玩家进入游戏后 | `runtime.showPreencoded(player, pages.game())` |

准备时使用目标阶段的原版页面解码器读回完整负载。直接使用底层缓存接口时，同一个包先登记普通编码再提供固定 NBT，后续发送会使用指定的固定字节。注册表重载后重新准备游戏页。若服务端替玩家翻译文本，按目标语言准备 NBT；保留在 NBT 中的原版翻译键仍由客户端显示。连接已安装其他自定义编码器时，库沿用现有编码器，实际编码次数可能不同。

固定通知可以跨玩家复用。带玩家权限、搜索结果或本次会话按钮键的表单，应为当前玩家生成内容和动作。[受管按钮与退出](actions.md) · [真实连接的编码次数](comparison.md)
