---
description: 如何啟動本地開發伺服器
---

# 本地開發

## 快速啟動
// turbo-all

1. 進入專案目錄
```bash
cd /home/jaron0211/workspace/KairoIO_master/rivo_landing
```

2. 啟動本地伺服器
```bash
python3 -m http.server 8080
```

3. 在瀏覽器開啟 http://127.0.0.1:8080

## 頁面入口

| 頁面 | 路徑 | 說明 |
|------|------|------|
| 首頁 | `/index.html` | 產品 Landing Page |
| 文件首頁 | `/docs/getting-started.html` | 文件入口 (i18n) |
| 協議產生器 | `/docs/protocol-creator.html` | 整合式編輯器 |

## 語言切換測試

- 預設英文：http://127.0.0.1:8080/docs/getting-started.html
- 強制中文：http://127.0.0.1:8080/docs/getting-started.html?lang=zh

## 檔案修改後

靜態網站無需重新編譯，直接重新整理瀏覽器即可。

如果 CSS 或 JS 快取未更新，可使用強制重新整理：
- Windows/Linux: `Ctrl + Shift + R`
- macOS: `Cmd + Shift + R`
