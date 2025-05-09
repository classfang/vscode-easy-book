/**
 * Easy-Book VSCode 扩展
 * 
 * 这个扩展允许用户在 VSCode 中阅读 TXT 格式的电子书
 * 提供了翻页、跳转和清除状态栏等功能
 */
import { commands, ExtensionContext, window } from 'vscode';
import * as book from './book-util';

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

	// 将所有命令添加到上下文订阅中，确保资源能够在扩展停用时被释放
	context.subscriptions.push(clearStatusBar);
	context.subscriptions.push(navigateNextPage);
	context.subscriptions.push(navigatePreviousPage);
	context.subscriptions.push(jumpToPage);
}

/**
 * 扩展停用时调用的函数
 * 目前没有需要清理的资源
 */
export function deactivate() { }
