import { ExtensionContext, workspace, window } from 'vscode';
import * as fs from "fs";

export class Book {
    private currentPageNumber: number = 1;
    private pageSize: number = 50;
    private totalPages: number = 0;
    private startPosition: number = 0;
    private endPosition: number = 0;
    private filePath: string = "";
    private extensionContext: ExtensionContext;

    constructor(extensionContext: ExtensionContext) {
        this.extensionContext = extensionContext;
    }

    /**
     * 计算文本总页数
     * @param text 文本内容
     */
    private calculateTotalPages(text: string): void {
        const size = text.length;
        this.totalPages = Math.ceil(size / this.pageSize);
    }

    /**
     * 获取文件名
     * @returns 文件名
     */
    private getFileName(): string | undefined {
        return this.filePath.split("/").pop();
    }

    /**
     * 获取指定类型的页面
     * @param type 翻页类型："previous"(上一页), "next"(下一页), "current"(当前页)
     */
    private navigateToPage(type: "previous" | "next" | "current"): void {
        const currPage = workspace.getConfiguration().get<number>('easyBook.currPageNumber') || 1;
        let targetPage = currPage;

        switch (type) {
            case "previous":
                targetPage = currPage <= 1 ? 1 : currPage - 1;
                break;
            case "next":
                targetPage = currPage >= this.totalPages ? this.totalPages : currPage + 1;
                break;
            case "current":
                targetPage = currPage;
                break;
        }

        this.currentPageNumber = targetPage;
    }

    /**
     * 更新页码配置
     */
    private savePagePosition(): void {
        workspace.getConfiguration().update('easyBook.currPageNumber', this.currentPageNumber, true);
    }

    /**
     * 计算当前页的开始和结束位置
     */
    private calculatePageBoundaries(): void {
        // 修正计算逻辑，开始和结束位置计算错误
        this.startPosition = (this.currentPageNumber - 1) * this.pageSize;
        this.endPosition = this.startPosition + this.pageSize;
    }

    /**
     * 读取文件内容并处理格式
     * @returns 处理后的文本内容
     */
    private readFile(): string {
        if (!this.filePath) {
            window.showWarningMessage("请填写TXT格式的小说文件路径 & Please fill in the path of the TXT format novel file");
            return "";
        }

        try {
            const data = fs.readFileSync(this.filePath, 'utf-8');
            const lineBreak = workspace.getConfiguration().get<string>('easyBook.lineBreak') || " ";
            
            return data.toString()
                .replace(/\n/g, lineBreak)
                .replace(/\r/g, " ")
                .replace(/　　/g, " ")
                .replace(/ /g, " ");
        } catch (error) {
            window.showErrorMessage(`文件读取错误: ${error instanceof Error ? error.message : String(error)}`);
            return "";
        }
    }

    /**
     * 初始化配置
     */
    private initialize(): void {
        this.filePath = workspace.getConfiguration().get<string>('easyBook.filePath') || "";
        const isEnglish = workspace.getConfiguration().get<boolean>('easyBook.isEnglish') || false;
        const configPageSize = workspace.getConfiguration().get<number>('easyBook.pageSize') || 50;

        this.pageSize = isEnglish ? configPageSize * 2 : configPageSize;
    }

    /**
     * 获取页面信息格式化字符串
     * @returns 页面信息字符串
     */
    private getPageInfo(): string {
        return `${this.currentPageNumber}/${this.totalPages}`;
    }

    /**
     * 获取页面内容
     * @param navigationType 导航类型
     * @returns 页面内容和页面信息
     */
    private getPageContent(navigationType: "previous" | "next" | "current"): string {
        this.initialize();

        const text = this.readFile();
        if (!text) {
            return "文件读取失败 & Failed to read file";
        }

        this.calculateTotalPages(text);
        this.navigateToPage(navigationType);
        this.calculatePageBoundaries();

        const pageInfo = this.getPageInfo();
        this.savePagePosition();

        return text.substring(this.startPosition, this.endPosition) + "    " + pageInfo;
    }

    /**
     * 获取上一页内容
     * @returns 上一页的内容和页面信息
     */
    public getPreviousPage(): string {
        return this.getPageContent("previous");
    }

    /**
     * 获取下一页内容
     * @returns 下一页的内容和页面信息
     */
    public getNextPage(): string {
        return this.getPageContent("next");
    }

    /**
     * 跳转到指定页
     * @returns 跳转页的内容和页面信息
     */
    public getJumpingPage(): string {
        return this.getPageContent("current");
    }
}