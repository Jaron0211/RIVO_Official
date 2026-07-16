# RIVO 官網聯繫表單 — Cloudflare Worker + Resend

網頁表單 → Cloudflare Worker → Resend API → 寄到 `rivo@rivo.com.tw`。
站台維持純靜態；信從 `rivo.com.tw` 網域寄出（SPF/DKIM 正常）。

## 你要做的（帳號 / DNS / 部署 — 我做不了）

### 1) Resend（寄信）
1. 到 https://resend.com 註冊（免費：3,000 封/月）。
2. **Domains → Add Domain → 輸入 `rivo.com.tw`**，把它給的幾筆 DNS 記錄（SPF/DKIM，通常是 TXT + 1 筆 MX/CNAME）加到 `rivo.com.tw` 的 DNS 管理處，等驗證變綠。
   - 驗證通過後，`contact@rivo.com.tw`（worker.js 裡的 `FROM`）才能當寄件人。
3. **API Keys → Create** → 複製 `re_...` 開頭的金鑰（待會設成 Worker 機密）。

### 2) Cloudflare Worker（後端）
```bash
cd contact-worker
npx wrangler login                 # 開瀏覽器登入你的 Cloudflare 帳號
npx wrangler secret put RESEND_API_KEY   # 貼上剛剛 Resend 的 re_ 金鑰
npx wrangler deploy                # 部署，會印出網址 https://rivo-contact.<子網域>.workers.dev
```
（不想用 CLI 也可在 Cloudflare 後台 → Workers → 建立 → 貼上 `worker.js` → Settings→Variables 加密變數 `RESEND_API_KEY` → Deploy。）

用免費的 `*.workers.dev` 子網域即可，**不需要動 rivo.com.tw 的 DNS 給 Worker**（Worker 跨網域，CORS 已在程式裡鎖定只允許 rivo.com.tw）。

### 3) 把網址給我
部署後把那個 `…workers.dev` 網址給我，我就把 `frontend-snippet.html` 的表單接好、套上網站風格、放進 `index.html` 的聯繫區塊並上線。

## 檔案
- `worker.js` — Worker 程式（CORS 鎖本站、蜜罐擋機器人、驗證、呼叫 Resend、不外洩錯誤）
- `wrangler.toml` — 部署設定（金鑰用 secret，不在檔案裡）
- `frontend-snippet.html` — 前端表單 + CSS + JS（待你給 Worker 網址後接上）

## 之後可加強（可選）
- **Cloudflare Turnstile**（免費隱形驗證碼）擋垃圾：前端加 widget、Worker 端驗證 token。
- 速率限制：Cloudflare WAF rate-limiting rule，或 Worker 用 KV 計數。
