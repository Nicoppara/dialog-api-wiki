package dialogcomparison;

import cn.fircloud.fircore.dialog.api.document.DialogDocument;
import cn.fircloud.fircore.dialog.api.paper.PaperDialogRuntime;
import cn.fircloud.fircore.dialog.api.paper.PreparedDialog;
import org.bukkit.command.Command;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import org.bukkit.plugin.java.JavaPlugin;

public final class DialogComparisonExample extends JavaPlugin {
    private PaperDialogRuntime<Void> runtime;
    private PreparedDialog notice;
    private PreparedDialog guide;
    private PreparedDialog before;
    private PreparedDialog after;

    @Override
    public void onEnable() {
        runtime = PaperDialogRuntime.install(this, "dialogcompare");
        var document = DialogDocument.notice("维护通知", "关闭").appendText("服务器将于 23:30 重启。");
        before = PreparedDialog.game(document);
        after = before.withDocument(document.withBodyText(0, "服务器维护已完成。"));
        notice = ComparisonPages.prepare("notice");
        guide = ComparisonPages.prepare("nested");
    }

    @Override
    public void onDisable() {
        if (runtime != null) runtime.close();
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] arguments) {
        if (!(sender instanceof Player player)) {
            sender.sendMessage("请在游戏内使用此命令。");
            return true;
        }
        if (arguments.length == 2 && arguments[0].equals("document")) {
            var page = switch (arguments[1]) {
                case "before" -> before;
                case "after" -> after;
                default -> null;
            };
            if (page == null) return false;
            runtime.showPreencoded(player, page);
            return true;
        }
        if (arguments.length != 2 || !(arguments[1].equals("notice") || arguments[1].equals("nested"))) {
            return false;
        }
        if (arguments[0].equals("cached")) {
            runtime.showPreencoded(player, arguments[1].equals("notice") ? notice : guide);
            return true;
        }
        var dialog = switch (arguments[0]) {
            case "paper" -> ComparisonPages.paper(arguments[1]);
            case "api" -> ComparisonPages.api(arguments[1]);
            default -> null;
        };
        if (dialog == null) {
            return false;
        }
        player.showDialog(dialog);
        return true;
    }
}
