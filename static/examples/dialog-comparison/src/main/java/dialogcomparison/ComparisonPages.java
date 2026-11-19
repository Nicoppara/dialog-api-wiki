package dialogcomparison;

import cn.fircloud.fircore.dialog.api.DialogFrame;
import cn.fircloud.fircore.dialog.api.NativeDialog;
import cn.fircloud.fircore.dialog.api.paper.NativeDialogBackend;
import io.papermc.paper.dialog.Dialog;
import io.papermc.paper.registry.data.dialog.ActionButton;
import io.papermc.paper.registry.data.dialog.DialogBase;
import io.papermc.paper.registry.data.dialog.action.DialogAction;
import io.papermc.paper.registry.data.dialog.body.DialogBody;
import io.papermc.paper.registry.data.dialog.type.DialogType;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.event.ClickEvent;

import java.util.List;

public final class ComparisonPages {
	private static final int TEXT_WIDTH = 240;
	private static final int BUTTON_WIDTH = 120;
	private static final Component CLOSE = Component.text("关闭");
	private static final Page NOTICE = leaf("维护通知", "服务器将于 23:30 重启。");
	private static final Page TRAVEL_TIP = leaf("返回主城", "输入 /spawn 返回主城。");
	private static final Page TRAVEL_CATEGORY = branch("主城", "查看如何返回主城。", "返回主城", TRAVEL_TIP);
	private static final Page TRAVEL_GUIDE = branch("旅行指南", "选择一个分类查看详情。", "主城", TRAVEL_CATEGORY);

	private record Page(Component title, Component text, Component link, Page child) {}

	private ComparisonPages() {}

	public static Dialog paper(String fixture) {
		return paper(page(fixture));
	}

	public static Dialog api(String fixture) {
		return NativeDialogBackend.create(api(page(fixture)));
	}

	private static Page page(String fixture) {
		return switch (fixture) {
			case "notice" -> NOTICE;
			case "nested" -> TRAVEL_GUIDE;
			default -> throw new IllegalArgumentException("Unknown dialog fixture: " + fixture);
		};
	}

	private static Page leaf(String title, String text) {
		return new Page(Component.text(title), Component.text(text), null, null);
	}

	private static Page branch(String title, String text, String link, Page child) {
		return new Page(Component.text(title), Component.text(text), Component.text(link), child);
	}

	private static Dialog paper(Page page) {
		var base = DialogBase.builder(page.title()).canCloseWithEscape(true).pause(false)
			.afterAction(DialogBase.DialogAfterAction.CLOSE)
			.body(List.of(DialogBody.plainMessage(page.text(), TEXT_WIDTH))).build();
		var close = ActionButton.create(CLOSE, null, BUTTON_WIDTH, null);
		var type = page.child() == null
			? DialogType.notice(close)
			: DialogType.multiAction(List.of(ActionButton.create(page.link(), null, BUTTON_WIDTH,
				DialogAction.staticAction(ClickEvent.showDialog(paper(page.child()))))), close, 1);
		return Dialog.create(builder -> builder.empty().base(base).type(type));
	}

	private static NativeDialog api(Page page) {
		var close = new NativeDialog.Button(CLOSE, null, BUTTON_WIDTH, null);
		var type = page.child() == null
			? new NativeDialog.Notice(close)
			: new NativeDialog.MultiAction(List.of(new NativeDialog.Button(page.link(), null, BUTTON_WIDTH,
				new NativeDialog.OpenDialog(new NativeDialog.InlineDialog(api(page.child()))))), close, 1);
		return new NativeDialog(page.title(), null, true, false, DialogFrame.AfterAction.CLOSE,
			List.of(new DialogFrame.Text(page.text(), TEXT_WIDTH)), List.of(), type);
	}
}
