// RIVO 官網聯繫表單 → Resend
// Cloudflare Worker：收表單 POST，驗證後用 Resend 寄到 rivo@rivo.com.tw
// 機密：RESEND_API_KEY 用 `wrangler secret put RESEND_API_KEY` 設定（不要寫在程式裡）

const ALLOWED_ORIGINS = ['https://rivo.com.tw', 'https://www.rivo.com.tw'];
const TO = 'rivo+web-contact@rivo.com.tw'; // plus-addressing：仍進 rivo@，Gmail 可用 to: 篩選分類
const FROM = 'RIVO 官網聯繫 <contact@rivo.com.tw>'; // 寄件人網域須先在 Resend 驗證通過

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin);

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, cors);
    // 只接受來自本站的請求
    if (origin && !ALLOWED_ORIGINS.includes(origin)) return json({ error: 'Forbidden' }, 403, cors);

    let d;
    try { d = await request.json(); } catch { return json({ error: 'Bad request' }, 400, cors); }

    const name = (d.name || '').toString().trim();
    const email = (d.email || '').toString().trim();
    const message = (d.message || '').toString().trim();
    const honeypot = (d.company || '').toString(); // 隱藏欄位：機器人才會填

    if (honeypot) return json({ ok: true }, 200, cors);            // 靜默丟棄機器人
    if (!message || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))     // 基本驗證
      return json({ error: '請填寫有效的 Email 與訊息' }, 422, cors);
    if (name.length > 200 || email.length > 200 || message.length > 5000)
      return json({ error: '內容過長' }, 422, cors);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: email,                                          // 你直接回信就回到訪客
        subject: `官網聯繫：${name || email}`,
        text: `姓名：${name}\nEmail：${email}\n\n${message}`,
      }),
    });

    if (!res.ok) {
      console.log('resend error', res.status, await res.text().catch(() => ''));
      return json({ error: '寄送失敗，請稍後再試' }, 502, cors);
    }
    return json({ ok: true }, 200, cors);
  },
};

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
