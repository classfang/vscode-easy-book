/**
 * Easy-Book VSCode 扩展
 * 
 * 这个扩展允许用户在 VSCode 中阅读 TXT 格式的电子书
 * 提供了翻页、跳转和清除状态栏等功能
 */
import { commands, ExtensionContext, window } from 'vscode';
import * as book from './book-util';

// 全局变量，用于存储自动翻页的定时器
let autoPageTimer: NodeJS.Timeout | undefined;
// 用于存储自动翻页状态
let isAutoPageEnabled = false;

/**
 * 扩展激活时调用的函数
 * 注册所有命令并将其添加到订阅列表中
 * @param context 扩展上下文，用于存储扩展状态
 */
export function activate(context: ExtensionContext) {
	// 扩展激活时在控制台输出提示信息
	console.log('Congratulations, your extension "easy-book" is now active!');

	/**
	 * 清除状态栏命令
	 * 用于清除状态栏中显示的文本内容
	 */
	let clearStatusBar = commands.registerCommand('easyBook.clearStatusBar', () => {
		window.setStatusBarMessage("");
	});

	/**
	 * 下一页命令
	 * 显示电子书的下一页内容到状态栏
	 */
	let navigateNextPage = commands.registerCommand('easyBook.navigateNextPage', () => {
		let books = new book.Book(context);
		window.setStatusBarMessage(books.getNextPage());
	});

	/**
	 * 上一页命令
	 * 显示电子书的上一页内容到状态栏
	 */
	let navigatePreviousPage = commands.registerCommand('easyBook.navigatePreviousPage', () => {
		let books = new book.Book(context);
		window.setStatusBarMessage(books.getPreviousPage());
	});

	/**
	 * 跳转到指定页命令
	 * 跳转到当前配置中指定的页码
	 */
	let jumpToPage = commands.registerCommand('easyBook.jumpToPage', () => {
		let books = new book.Book(context);
		window.setStatusBarMessage(books.getJumpingPage());
	});

	/**
	 * 切换自动翻页命令
	 * 开始或暂停自动翻页功能
	 */
	let toggleAutoPage = commands.registerCommand('easyBook.toggleAutoPage', () => {
		if (isAutoPageEnabled) {
			// 如果自动翻页已启用，则停止
			stopAutoPage();
		} else {
			// 如果自动翻页未启用，则启动
			startAutoPage(context);
		}
	});

	// 将所有命令添加到上下文订阅中，确保资源能够在扩展停用时被释放
	context.subscriptions.push(clearStatusBar);
	context.subscriptions.push(navigateNextPage);
	context.subscriptions.push(navigatePreviousPage);
	context.subscriptions.push(jumpToPage);
	context.subscriptions.push(toggleAutoPage);
}

/**
 * 启动自动翻页
 * @param context 扩展上下文
 */
function startAutoPage(context: ExtensionContext) {
	// 获取配置的自动翻页时间间隔（秒）
	const autoPageInterval = book.Book.getAutoPageInterval();
	
	// 如果已有定时器，先清除
	stopAutoPage();
	
	// 将状态设置为已启用
	isAutoPageEnabled = true;
	
	// 设置新的定时器，定期执行下一页命令
	autoPageTimer = setInterval(() => {
		let books = new book.Book(context);
		window.setStatusBarMessage(books.getNextPage());
	}, autoPageInterval * 1000);
}

/**
 * 停止自动翻页
 */
function stopAutoPage() {
	if (autoPageTimer) {
		clearInterval(autoPageTimer);
		autoPageTimer = undefined;
	}
	isAutoPageEnabled = false;
}

/**
 * 扩展停用时调用的函数
 * 清理自动翻页定时器
 */
export function deactivate() {
	stopAutoPage();
}
