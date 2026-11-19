---
title: "💬 第一个对话框"
description: 用一条命令打开原生表单，读取玩家输入的昵称。
---

这个例子注册 `/profiledemo`。点击“提交”会在聊天栏回显昵称；点击“取消”或按 Esc 会退出表单。

![原版客户端运行 /profiledemo 后的昵称表单，输入框下是提交按钮，底部是取消按钮](/img/dialog-profile-form.png)

要查看静态通知和嵌套页的实际效果，见[从一张通知到三层指南](composition.md)。

## 注册命令

```yaml title="src/main/resources/plugin.yml"
name: ProfileDemo
version: '1.0'
main: example.profile.ProfilePlugin
api-version: '26.3'
folia-supported: true
commands:
  profiledemo:
    description: 打开昵称示例表单
```

## 在插件中安装运行时

```java title="src/main/java/example/profile/ProfilePlugin.java"
package example.profile;

import cn.fircloud.fircore.dialog.api.DialogFrame;
import cn.fircloud.fircore.dialog.api.NativeDialog;
import cn.fircloud.fircore.dialog.api.paper.PaperDialogRuntime;
import java.util.List;
import net.kyori.adventure.text.Component;
import org.bukkit.entity.Player;
import org.bukkit.plugin.java.JavaPlugin;

public final class ProfilePlugin extends JavaPlugin {
    private PaperDialogRuntime<Void> dialogs;

    @Override
    public void onEnable() {
        dialogs = PaperDialogRuntime.install(this, "profiledemo");
        getCommand("profiledemo").setExecutor((sender, command, label, args) -> {
            if (sender instanceof Player player) open(player);
            return true;
        });
    }

    private void open(Player player) {
        dialogs.showNativeFrame(player, keys -> {
            var name = new NativeDialog.TextInput("nickname", Component.text("昵称"),
                "", 180, 24, true, null);
            var submit = NativeDialog.Button.callback(Component.text("提交"), null, 100,
                keys.action((who, response) -> {
                    String text = response == null ? null : response.getText("nickname");
                    who.sendMessage(text == null || text.isBlank()
                        ? "没有填写昵称" : "你填写的昵称是 " + text);
                }));
            var exit = NativeDialog.Button.callback(Component.text("取消"), null, 100,
                keys.action((who, response) -> dialogs.close(who)));
            return new NativeDialog(Component.text("昵称"), null, true, false,
                DialogFrame.AfterAction.NONE, List.of(), List.of(name),
                new NativeDialog.MultiAction(List.of(submit), exit, 1));
        });
    }

    @Override
    public void onDisable() {
        if (dialogs != null) dialogs.close();
    }
}
```

## 验证结果

在游戏中输入 `/profiledemo`，填写昵称后提交。一次性动作返回时，如果没有打开下一页或启动受管读取，运行时会结束当前页。重新执行命令并按 Esc，可以单独验证取消路径。
