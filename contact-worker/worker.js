// RIVO 官網聯繫表單 → Resend（含防濫用：Turnstile 人機驗證 + KV 限流 + 最短填寫時間）
//
// 機密（用 `wrangler secret put` 或後台加密變數設定，勿寫進程式）：
//   RESEND_API_KEY    — Resend 金鑰
//   TURNSTILE_SECRET  — Cloudflare Turnstile 的 secret key
// 綁定（wrangler.toml）：
//   KV namespace  binding = "RL"  — 限流計數用

const ALLOWED_ORIGINS = ['https://rivo.com.tw', 'https://www.rivo.com.tw'];
const TO = 'rivo+web-contact@rivo.com.tw'; // plus-addressing：仍進 rivo@，Gmail 可用 to: 篩選分類
const FROM = 'RIVO 官網聯繫 <contact@rivo.com.tw>'; // 寄件人網域須先在 Resend 驗證通過

// 限流上限（可自行調整）
const LIMITS = {
  ipWindow:  { max: 3,  ttl: 600 },    // 每 IP：10 分鐘內最多 3 封
  ipDay:     { max: 15, ttl: 86400 },  // 每 IP：每天最多 15 封
  globalDay: { max: 80, ttl: 86400 },  // 全站：每天最多 80 封（< Resend 免費 100/天，保護額度）
};
const MIN_FILL_MS = 2000; // 開表單到送出至少 2 秒（擋秒填機器人）

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin);
    const ip = request.headers.get('CF-Connecting-IP') || '';

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, cors);
    if (origin && !ALLOWED_ORIGINS.includes(origin)) return json({ error: 'Forbidden' }, 403, cors);

    let d;
    try { d = await request.json(); } catch { return json({ error: 'Bad request' }, 400, cors); }

    const name = (d.name || '').toString().trim();
    const email = (d.email || '').toString().trim();
    const message = (d.message || '').toString().trim();
    const honeypot = (d.company || '').toString();       // 隱藏欄位：機器人才會填
    const token = (d.token || '').toString();            // Turnstile token
    const elapsed = Number(d.elapsed) || 0;              // 開表單到送出的毫秒數

    if (honeypot) return json({ ok: true }, 200, cors);  // 蜜罐命中 → 靜默丟棄
    if (!message || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
      return json({ error: '請填寫有效的 Email 與訊息' }, 422, cors);
    if (name.length > 200 || email.length > 200 || message.length > 5000)
      return json({ error: '內容過長' }, 422, cors);

    // 最短填寫時間（機器人多半瞬間送出；被偽造也只是回到其他防線）
    if (elapsed && elapsed < MIN_FILL_MS) return json({ error: '送出太快，請再試一次' }, 429, cors);

    // 人機驗證（先擋掉機器人，再消耗限流額度，避免有人用垃圾請求灌爆每日上限）
    const human = await verifyTurnstile(token, ip, env.TURNSTILE_SECRET);
    if (!human) return json({ error: '驗證未通過，請重新整理後再試' }, 403, cors);

    // 限流（需綁定 KV：RL）
    if (env.RL) {
      const day = new Date().toISOString().slice(0, 10);
      if (ip && (await overLimit(env.RL, `ip:${ip}:w`, LIMITS.ipWindow) ||
                 await overLimit(env.RL, `ip:${ip}:d:${day}`, LIMITS.ipDay)))
        return json({ error: '請求過於頻繁，請稍後再試' }, 429, cors);
      if (await overLimit(env.RL, `all:${day}`, LIMITS.globalDay))
        return json({ error: '今日聯絡量已達上限，請直接來信 rivo@rivo.com.tw' }, 429, cors);
    } else {
      console.log('警告：未綁定 KV(RL)，限流未生效');
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: email,                                  // 你直接回信就回到訪客
        subject: `官網聯繫：${name || email}`,
        text: `姓名：${name}\nEmail：${email}\nIP：${ip}\n\n${message}`,
      }),
    });

    if (!res.ok) {
      console.log('resend error', res.status, await res.text().catch(() => ''));
      return json({ error: '寄送失敗，請稍後再試' }, 502, cors);
    }
    return json({ ok: true }, 200, cors);
  },
};

// 讀-加-寫計數。KV 為最終一致、存在極小競態，但對「防濫用節流」已足夠；
// 全站每日硬上限是最後防線，就算被鑽也燒不爆 Resend 額度。
async function overLimit(kv, key, rule) {
  const n = parseInt((await kv.get(key)) || '0', 10);
  if (n >= rule.max) return true;
  await kv.put(key, String(n + 1), { expirationTtl: rule.ttl });
  return false;
}

async function verifyTurnstile(token, ip, secret) {
  if (!secret) { console.log('警告：未設 TURNSTILE_SECRET，略過人機驗證'); return true; } // 設定完成前不中斷表單
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set('remoteip', ip);
  try {
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const j = await r.json();
    return !!j.success;
  } catch {
    return false;
  }
}

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
}
function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors },
  });
}
