# Easy-Book

<p align="center">
  <img src="images/icon.png" alt="Easy-Book 图标" width="128">
</p>

## 简介

Easy-Book 是一个专为阅读 TXT 格式电子书设计的 Visual Studio Code 插件。它允许您在编程的同时，利用 VSCode 状态栏阅读喜欢的电子书，提供了简单而实用的阅读体验。

## 功能特点

- 在 VSCode 状态栏中阅读 TXT 格式电子书
- 支持上一页/下一页导航
- 支持跳转到指定页面
- 支持自动翻页功能
- 支持中英文电子书
- 可自定义每页字数及阅读设置

## 安装

在 VS Code 扩展市场中搜索 "Easy-Book"，或者直接从本仓库的 Releases 下载 VSIX 文件进行安装。

## 使用方法

1. 在 VS Code 设置中配置 TXT 电子书的路径（`easyBook.filePath`）
2. 使用以下快捷键操作：

| 功能          | Windows/Linux 快捷键 | Mac 快捷键  |
|--------------|-------------------|------------|
| 上一页        | Ctrl+Alt+W        | Alt+W      |
| 下一页        | Ctrl+Alt+S        | Alt+S      |
| 跳转到指定页   | Ctrl+Alt+E        | Alt+E      |
| 清除状态栏     | Ctrl+Alt+Q        | Alt+Q      |
| 切换自动翻页   | Ctrl+Alt+D        | Alt+D      |

## 配置选项

在 VS Code 设置中，可以配置以下选项：

- `easyBook.filePath`: TXT 格式文件的绝对路径
- `easyBook.currPageNumber`: 当前页码（默认为1）
- `easyBook.pageSize`: 每页字数（默认50）
- `easyBook.autoPageInterval`: 自动翻页时间间隔（秒）（默认10秒）
- `easyBook.isEnglish`: 是否为英文书籍（英文书籍每页字数会翻倍）
- `easyBook.lineBreak`: 换行符号（默认为空格）

## 示例配置

```json
{
  "easyBook.filePath": "/path/to/your/book.txt",
  "easyBook.pageSize": 80,
  "easyBook.autoPageInterval": 15,
  "easyBook.isEnglish": false,
  "easyBook.lineBreak": " "
}
```

## 使用提示

- 如需临时暂停阅读，可使用 "清除状态栏" 命令
- 自动翻页功能可在需要连续阅读时使用，开启后会按照设定的时间间隔自动翻页
- 可根据个人阅读习惯调整每页字数和自动翻页间隔
- 对于英文书籍，设置 `easyBook.isEnglish` 为 `true` 可获得更好的阅读体验

## 许可证

本项目基于 [MIT 许可证](LICENSE)

## 问题反馈

如发现任何问题或有功能建议，请在 [GitHub Issues](https://github.com/classfang/vscode-easy-book/issues) 提交。
