import { ExtensionContext, workspace, window } from 'vscode';
import * as fs from "fs";
import { promisify } from 'util';

const readFileAsync = promisify(fs.readFile);

interface BookConfig {
    filePath: string;
    isEnglish: boolean;
    pageSize: number;
    lineBreak: string;
    currPageNumber: number;
}

export class Book {
    private currentPageNumber: number = 1;
    private pageSize: number = 50;
    private totalPages: number = 0;
    private startPosition: number = 0;
    private endPosition: number = 0;
    private filePath: string = "";
    private readonly extensionContext: ExtensionContext;
    private fileContent: string = "";
    private config: BookConfig;

    constructor(extensionContext: ExtensionContext) {
        this.extensionContext = extensionContext;
        this.config = this.loadConfig();
        this.initialize();
    }

    private loadConfig(): BookConfig {
        const config = workspace.getConfiguration('easyBook');
        return {
            filePath: config.get<string>('filePath') || "",
            isEnglish: config.get<boolean>('isEnglish') || false,
            pageSize: config.get<number>('pageSize') || 50,
            lineBreak: config.get<string>('lineBreak') || " ",
            currPageNumber: config.get<number>('currPageNumber') || 1
        };
    }

    /**
     * 获取配置的自动翻页时间间隔（秒）
     * @returns 自动翻页时间间隔
     */
    public static getAutoPageInterval(): number {
        return workspace.getConfiguration().get<number>('easyBook.autoPageInterval') || 10;
    }

    /**
     * 计算文本总页数
     * @param text 文本内容
     */
    private calculateTotalPages(text: string): void {
        this.totalPages = Math.max(1, Math.ceil(text.length / this.pageSize));
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
        this.startPosition = (this.currentPageNumber - 1) * this.pageSize;
        this.endPosition = Math.min(this.startPosition + this.pageSize, this.fileContent.length);
    }

    /**
     * 读取文件内容并处理格式
     * @returns 处理后的文本内容
     */
    private async readFileContent(): Promise<string> {
        if (!this.filePath) {
            throw new Error("请填写TXT格式的小说文件路径 & Please fill in the path of the TXT format novel file");
        }

        try {
            const data = await readFileAsync(this.filePath, 'utf-8');
            return this.formatContent(data.toString());
        } catch (error) {
            throw new Error(`文件读取错误: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private formatContent(content: string): string {
        return content
            .replace(/\n/g, this.config.lineBreak)
            .replace(/\r/g, " ")
            .replace(/　　/g, " ")
            .replace(/ +/g, " ");
    }

    /**
     * 初始化配置
     */
    private initialize(): void {
        this.filePath = this.config.filePath;
        this.pageSize = this.config.isEnglish ? this.config.pageSize * 2 : this.config.pageSize;
        this.currentPageNumber = this.config.currPageNumber;
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
    private async getPageContent(navigationType: "previous" | "next" | "current"): Promise<string> {
        try {
            await this.ensureFileContent();

            switch (navigationType) {
                case "previous":
                    this.currentPageNumber = this.validatePageNumber(this.currentPageNumber - 1);
                    break;
                case "next":
                    this.currentPageNumber = this.validatePageNumber(this.currentPageNumber + 1);
                    break;
                case "current":
                    this.currentPageNumber = this.validatePageNumber(this.currentPageNumber);
                    break;
            }

            this.calculatePageBoundaries();
            await this.savePagePosition();

            return `${this.fileContent.substring(this.startPosition, this.endPosition)}    ${this.currentPageNumber}/${this.totalPages}`;
        } catch (error) {
            return error instanceof Error ? error.message : String(error);
        }
    }

    private validatePageNumber(pageNumber: number): number {
        return Math.max(1, Math.min(pageNumber, this.totalPages));
    }

    private async ensureFileContent(): Promise<void> {
        if (!this.fileContent) {
            try {
                this.fileContent = await this.readFileContent();
                this.calculateTotalPages(this.fileContent);
            } catch (error) {
                window.showErrorMessage(error instanceof Error ? error.message : String(error));
                throw error;
            }
        }
    }

    /**
     * 获取上一页内容
     * @returns 上一页的内容和页面信息
     */
    public async getPreviousPage(): Promise<string> {
        return this.getPageContent("previous");
    }

    /**
     * 获取下一页内容
     * @returns 下一页的内容和页面信息
     */
    public async getNextPage(): Promise<string> {
        return this.getPageContent("next");
    }

    /**
     * 跳转到指定页
     * @returns 跳转页的内容和页面信息
     */
    public async getJumpingPage(): Promise<string> {
        return this.getPageContent("current");
    }
}