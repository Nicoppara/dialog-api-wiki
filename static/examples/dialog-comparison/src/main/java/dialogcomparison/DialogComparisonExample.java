package dialogcomparison;

import org.bukkit.command.Command;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import org.bukkit.plugin.java.JavaPlugin;

public final class DialogComparisonExample extends JavaPlugin {
    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] arguments) {
        if (!(sender instanceof Player player)) {
            sender.sendMessage("请在游戏内使用此命令。");
            return true;
        }
        if (arguments.length != 2 || !(arguments[1].equals("notice") || arguments[1].equals("nested"))) {
            return false;
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
