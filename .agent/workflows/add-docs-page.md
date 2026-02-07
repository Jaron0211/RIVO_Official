---
description: 如何新增文件頁面到技術文件中心
---

# 新增文件頁面

> [!IMPORTANT]
> 使用 i18n 系統時，只需維護一個 HTML 檔案，翻譯內容在 JSON 檔案中管理。

## 步驟

### 1. 建立 HTML 頁面

複製 `docs/getting-started.html` 作為模板。

關鍵元素：
```html
<!-- 引入 i18n -->
<script src="i18n.js"></script>

<!-- 可翻譯文字 -->
<h1 data-i18n="newPage.title">Default Text</h1>

<!-- HTML 內容翻譯 -->
<p data-i18n="newPage.content" data-i18n-html>...</p>

<!-- 語言切換按鈕 -->
<button onclick="setLang('en')" data-lang-switch="en">EN</button>
<button onclick="setLang('zh')" data-lang-switch="zh">繁中</button>
```

### 2. 新增翻譯鍵值

**同時更新兩個檔案：**
- `docs/locales/en.json`
- `docs/locales/zh.json`

範例：
```json
{
  "newPage": {
    "title": "New Page Title",
    "content": "Page content here..."
  }
}
```

### 3. 更新側邊欄

在所有文件頁面的 `.sidebar` 中新增連結：
```html
<a href="new-page.html" class="sidebar-link" data-i18n="sidebar.newPage">New Page</a>
```

記得在 locale JSON 中新增對應的側邊欄翻譯鍵：
```json
"sidebar": {
  "newPage": "New Page"  // en.json
}
```
```json
"sidebar": {
  "newPage": "新頁面"    // zh.json
}
```

## 需更新的檔案清單

新增頁面時需同步更新側邊欄的檔案：
- `docs/getting-started.html`
- `docs/api-guide.html`
- `docs/custom-schemas.html`
- `docs/deployment-config.html`
- `docs/advanced.html`
- `docs/troubleshooting.html`
- `docs/protocol-creator.html`

## 側邊欄分組

| 分組鍵值 | 中文 | English |
|----------|------|---------|
| `sidebar.introduction` | 介紹 | Introduction |
| `sidebar.apiReference` | API 參考 | API Reference |
| `sidebar.tools` | 工具 | Tools |
| `sidebar.operations` | 營運維護 | Operations |

## i18n 屬性說明

| 屬性 | 用途 |
|------|------|
| `data-i18n="key"` | 翻譯文字內容 |
| `data-i18n-html` | 允許 HTML 標籤 |
| `data-i18n-placeholder="key"` | 翻譯 placeholder |
| `data-lang-switch="lang"` | 語言切換按鈕狀態 |
