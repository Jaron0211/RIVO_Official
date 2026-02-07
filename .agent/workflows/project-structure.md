---
description: RIVO Landing 網站專案結構與開發指南
---

# RIVO Landing 專案

> **注意**：完整的專案文檔請查看 [`CLAUDE.md`](file:///home/jaron0211/workspace/KairoIO_master/rivo_landing/CLAUDE.md)

## 專案概述
RIVO 是一個 IoT 機器人車隊管理平台的官方網站與文檔系統，提供產品展示、技術文件、以及 RIVO Node 感測器協議配置工具。

## 相關工作流程

| 工作流程 | 說明 |
|----------|------|
| `/local-dev` | 啟動本地開發伺服器 |
| `/add-docs-page` | 新增文件頁面 (i18n) |
| `/add-node-type` | 新增節點類型到視覺化編輯器 |
| `/add-sensor-template` | 新增感測器範本到資料庫 |

## 目錄結構

```
rivo_landing/
├── index.html               # 主頁面 - 產品介紹 Landing Page
├── style.css                # 全站主樣式
├── CLAUDE.md                # AI 助手指南
├── assets/                  # 圖片資源
│   ├── logo-*.png           # Logo 變體
│   └── favicon-*.png        # Favicon
├── docs/                    # 技術文件中心 (i18n)
│   ├── index.html           # 重導向頁面
│   ├── style.css            # 文件樣式
│   ├── i18n.js              # 翻譯載入器
│   ├── locales/             # 翻譯檔案
│   │   ├── en.json          # 英文翻譯
│   │   └── zh.json          # 繁體中文翻譯
│   ├── getting-started.html # 統一 i18n 頁面
│   ├── api-guide.html
│   ├── custom-schemas.html
│   ├── deployment-config.html
│   ├── advanced.html
│   ├── troubleshooting.html
│   └── protocol-creator.html
└── src/                     # JavaScript 模組與資源
    ├── simple-node-editor.js    # 節點編輯器核心類別
    ├── yaml-generator.js        # YAML 輸出生成
    ├── property-editor.js       # 節點屬性編輯器
    ├── template-manager.js      # 範本管理器
    ├── template-browser.js      # 範本瀏覽 UI
    ├── template-browser.css     # 範本瀏覽樣式
    ├── protocol-config.js       # 協議配置邏輯
    ├── decoder-builder.js       # 解碼器建構器
    ├── protocol-schema.json     # 協議 JSON Schema
    ├── protocol-schema-docs.md  # Schema 文件
    └── sensor-templates/        # 感測器範本
        ├── templates.json       # 範本索引 (11 個範本)
        ├── maker/               # 創客感測器 YAML
        └── industrial/          # 工業級感測器 YAML
```

## i18n 系統

文件使用輕量 i18n 系統，無需維護多語言頁面副本。

**翻譯流程：**
1. 在 HTML 使用 `data-i18n="key"` 標記
2. 在 `locales/en.json` 和 `zh.json` 新增翻譯
3. 語言切換自動更新所有標記元素

**語言選擇優先順序：**
1. URL 參數：`?lang=zh`
2. localStorage：`rivo-docs-lang`
3. 瀏覽器語言偵測
4. 預設：英文

## 核心模組

### SimpleNodeEditor (`src/simple-node-editor.js`)
視覺化節點編輯器核心，無外部依賴的輕量實作。

**支援節點類型：**
- `input/sensor`, `input/constant`
- `process/calibration`, `process/binary_op`, `process/bit_shift`, `process/bit_mask`
- `output/status`, `output/telemetry`

### TemplateManager (`src/template-manager.js`)
管理感測器範本的載入、搜尋和選擇。

### YAML Generator (`src/yaml-generator.js`)
將節點圖形轉換為 RIVO Node YAML 格式。

## 設計規範

### 色彩系統
- 主色：`#000000` (黑)
- 背景：`#FFFFFF` / `#F5F5F5` / `#FAFAFA`
- 邊框：`#E5E5E5`
- 文字：`#000000` / `#737373` (次要)
- 成功：`#22C55E` / `#15803D`

### 字體
- 標題：`Space Grotesk`, `Noto Sans TC`
- 內文：`Public Sans`, `Noto Sans TC`
- 程式碼：`Space Mono`

### 響應式斷點
- 手機：`max-width: 768px`
- 平板：`max-width: 1024px`
