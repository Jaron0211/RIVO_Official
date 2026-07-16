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
- `worker.js` — Worker 程式（CORS、蜜罐、Turnstile 人機驗證、KV 限流、最短填寫時間、呼叫 Resend）
- `wrangler.toml` — 部署設定（金鑰用 secret、KV 綁定）
- `frontend-snippet.html` — 前端表單 + CSS + JS（已整合進 index.html）

## 防濫用設定（防止被洗信 — 需完成才會生效）

程式已內建 3 道防線，但 **Turnstile 與 KV 需要你在後台建立資源**才會啟用
（未設定時：Turnstile 略過、限流略過，表單仍可用，但沒有保護）。

### 1) Cloudflare Turnstile（隱形驗證碼，免費）
1. Cloudflare 後台 → **Turnstile → Add site**，網域填 `rivo.com.tw`（Widget Mode 選 **Managed**）。
2. 拿到 **Site Key**（公開）與 **Secret Key**（機密）。
3. 把 **Site Key** 貼到 `index.html` 裡的 `TURNSTILE_SITEKEY='...'`。
4. 把 **Secret Key** 設成 Worker 機密：
   ```bash
   cd contact-worker
   npx wrangler secret put TURNSTILE_SECRET   # 提示處貼 Secret Key
   ```

### 2) KV（限流計數）
```bash
npx wrangler kv namespace create RL           # 印出 id = "xxxx"
# 把該 id 貼到 wrangler.toml 的 [[kv_namespaces]] id
```

### 3) 重新部署
```bash
npx wrangler deploy
```

### 內建的三道防線（可在 worker.js 頂部調整數字）
- **Turnstile 人機驗證** — 沒通過就不寄（擋掉絕大多數自動化洗信）。
- **KV 限流** — 每 IP 10 分鐘 ≤ 3 封、每天 ≤ 15 封；**全站每天 ≤ 80 封**（< Resend 免費 100/天，護住額度）。
- **最短填寫時間** — 開表單到送出 < 2 秒直接擋（秒填的機器人）。
- 另保留蜜罐欄位；信件內文會附上來訪 IP，方便必要時封鎖。

> 註：`CORS 只允許 rivo.com.tw` 擋得住瀏覽器，但擋不住直接打 API 的腳本（Origin 可偽造），
> 所以真正的防護是上面三道，尤其是 Turnstile。
