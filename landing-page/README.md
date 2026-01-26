# KairoIO Landing Page

KairoIO 機器人雲端管理平台的行銷 Landing Page。

## 部署到 GitHub Pages

### 方法一：建立獨立 Repository（推薦）

1. **建立新 Repository**
   ```bash
   # 在 GitHub 建立新 repo，例如 kairoio-landing 或 kairoio.github.io
   ```

2. **上傳檔案**
   ```bash
   git init
   git add .
   git commit -m "Initial landing page"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/kairoio-landing.git
   git push -u origin main
   ```

3. **啟用 GitHub Pages**
   - 進入 Repository → Settings → Pages
   - Source 選擇 `main` branch
   - 資料夾選擇 `/ (root)`
   - 點擊 Save

4. **自訂域名（選用）**
   - 在 Settings → Pages → Custom domain 輸入你的域名
   - 建立 `CNAME` 檔案，內容為你的域名

### 方法二：使用現有 Repository 的 /docs 資料夾

1. **將 landing-page 內容移到 docs**
   ```bash
   mv landing-page docs
   ```

2. **啟用 GitHub Pages**
   - 進入 Repository → Settings → Pages
   - Source 選擇 `main` branch
   - 資料夾選擇 `/docs`

## 自訂內容

### 修改聯絡表單

目前使用 [Formspree](https://formspree.io/) 作為表單後端：

1. 註冊 Formspree 帳號
2. 建立新表單，取得 Form ID
3. 修改 `index.html` 中的表單 action：
   ```html
   <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
   ```

### 修改聯絡資訊

編輯 `index.html` 中的聯絡區塊：
- Email 地址
- GitHub 連結
- 其他聯絡方式

### 修改價格方案

在 `index.html` 的 Pricing Section 中調整：
- 方案名稱
- 價格
- 功能列表

## 檔案結構

```
landing-page/
├── index.html      # 主頁面
├── style.css       # 樣式表
└── README.md       # 本文件
```

## 技術特點

- **純靜態** - 無需後端，部署簡單
- **響應式設計** - 支援手機、平板、桌面
- **SEO 優化** - 包含 meta tags 和 Open Graph
- **快速載入** - 無框架依賴，僅使用原生 CSS
- **中文優化** - 使用 Noto Sans TC 字體

## 自訂域名設定

如果要使用自訂域名（如 kairoio.com）：

1. **DNS 設定**
   - A 記錄指向 GitHub Pages IP：
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```
   - 或 CNAME 記錄指向 `YOUR_USERNAME.github.io`

2. **建立 CNAME 檔案**
   ```bash
   echo "kairoio.com" > CNAME
   ```

3. **啟用 HTTPS**
   - 在 GitHub Pages 設定中勾選 "Enforce HTTPS"

## 更新內容

修改後直接 push 到 GitHub，會自動部署：

```bash
git add .
git commit -m "Update landing page content"
git push
```

部署通常在 1-2 分鐘內完成。
