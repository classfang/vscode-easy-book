/**
 * Easy-Book VSCode 扩展
 * 
 * 这个扩展允许用户在 VSCode 中阅读 TXT 格式的电子书
 * 提供了翻页、跳转和清除状态栏等功能
 */
import { commands, ExtensionContext, window, Disposable } from 'vscode';
import * as book from './book-util';

class ExtensionState {
	private static instance: ExtensionState;
	private autoPageTimer?: NodeJS.Timeout;
	private isAutoPageEnabled: boolean = false;
	private disposables: Disposable[] = [];

	private constructor() {}

	static getInstance(): ExtensionState {
		if (!ExtensionState.instance) {
			ExtensionState.instance = new ExtensionState();
		}
		return ExtensionState.instance;
	}

	isAutoPageActive(): boolean {
		return this.isAutoPageEnabled;
	}

	async startAutoPage(context: ExtensionContext): Promise<void> {
		const autoPageInterval = book.Book.getAutoPageInterval();
		this.stopAutoPage();
		
		this.isAutoPageEnabled = true;
		const books = new book.Book(context);
		const content = await books.getJumpingPage();
		window.setStatusBarMessage(content);
		
		this.autoPageTimer = setInterval(async () => {
			const books = new book.Book(context);
			const content = await books.getNextPage();
			window.setStatusBarMessage(content);
		}, autoPageInterval * 1000);
	}

	stopAutoPage(): void {
		if (this.autoPageTimer) {
			clearInterval(this.autoPageTimer);
			this.autoPageTimer = undefined;
		}
		this.isAutoPageEnabled = false;
	}

	registerDisposable(disposable: Disposable): void {
		this.disposables.push(disposable);
	}

	dispose(): void {
		this.stopAutoPage();
		this.disposables.forEach(d => d.dispose());
		this.disposables = [];
	}
}

/**
 * 扩展激活时调用的函数
 * 注册所有命令并将其添加到订阅列表中
 * @param context 扩展上下文，用于存储扩展状态
 */
export function activate(context: ExtensionContext) {
	// 扩展激活时在控制台输出提示信息
	console.log('Congratulations, your extension "easy-book" is now active!');

	const state = ExtensionState.getInstance();

	/**
	 * 清除状态栏命令
	 * 用于清除状态栏中显示的文本内容
	 */
	const clearStatusBar = commands.registerCommand('easyBook.clearStatusBar', () => {
		window.setStatusBarMessage("");
		state.stopAutoPage();
	});

	/**
	 * 下一页命令
	 * 显示电子书的下一页内容到状态栏
	 */
	const navigateNextPage = commands.registerCommand('easyBook.navigateNextPage', async () => {
		const books = new book.Book(context);
		const content = await books.getNextPage();
		window.setStatusBarMessage(content);
	});

	/**
	 * 上一页命令
	 * 显示电子书的上一页内容到状态栏
	 */
	const navigatePreviousPage = commands.registerCommand('easyBook.navigatePreviousPage', async () => {
		const books = new book.Book(context);
		const content = await books.getPreviousPage();
		window.setStatusBarMessage(content);
	});

	/**
	 * 跳转到指定页命令
	 * 跳转到当前配置中指定的页码
	 */
	const jumpToPage = commands.registerCommand('easyBook.jumpToPage', async () => {
		const books = new book.Book(context);
		const content = await books.getJumpingPage();
		window.setStatusBarMessage(content);
	});

	/**
	 * 切换自动翻页命令
	 * 开始或暂停自动翻页功能
	 */
	const toggleAutoPage = commands.registerCommand('easyBook.toggleAutoPage', async () => {
		if (state.isAutoPageActive()) {
			state.stopAutoPage();
			window.setStatusBarMessage('');
		} else {
			await state.startAutoPage(context);
		}
	});

	// 将所有命令添加到上下文订阅中，确保资源能够在扩展停用时被释放
	[clearStatusBar, navigateNextPage, navigatePreviousPage, jumpToPage, toggleAutoPage]
		.forEach(cmd => {
			state.registerDisposable(cmd);
			context.subscriptions.push(cmd);
		});
}

/**
 * 扩展停用时调用的函数
 * 清理自动翻页定时器
 */
export function deactivate() {
	ExtensionState.getInstance().dispose();
}
