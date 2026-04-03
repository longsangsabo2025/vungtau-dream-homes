import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY!;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID!;
const CRON_SECRET = process.env.CRON_SECRET!;

async function sendTelegram(message: string): Promise<void> {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML',
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error('Telegram send failed:', res.status, body);
    throw new Error(`Telegram API error: ${res.status}`);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ── Auth guard ──
  const authHeader = req.headers['authorization'];
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    // ── Total properties ──
    const { count: totalProperties, error: countErr } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true });

    if (countErr) {
      console.error('Error counting properties:', countErr.message);
    }

    // ── New listings today ──
    const { count: newToday, error: newErr } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString());

    if (newErr) {
      console.error('Error counting new listings:', newErr.message);
    }

    // ── Page views (best-effort — table may not exist) ──
    let pageViews: number | string = 'N/A';
    try {
      const { count, error: pvErr } = await supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayStart.toISOString());

      if (!pvErr && count !== null) {
        pageViews = count;
      }
    } catch {
      // table doesn't exist — ignore
    }

    // ── Build report ──
    const env = process.env.VERCEL_ENV || 'unknown';
    const version = process.env.VITE_APP_VERSION || '1.0.0';
    const report = [
      `<b>🏠 VungTauLand — Daily Health Report</b>`,
      ``,
      `📅 <b>Date:</b> ${now.toISOString().slice(0, 10)}`,
      `🌐 <b>Environment:</b> ${env}`,
      `📦 <b>Version:</b> ${version}`,
      ``,
      `📊 <b>Metrics</b>`,
      `  • Total properties: <b>${totalProperties ?? 'error'}</b>`,
      `  • New listings today: <b>${newToday ?? 0}</b>`,
      `  • Page views today: <b>${pageViews}</b>`,
      ``,
      `✅ Supabase: ${SUPABASE_URL ? 'connected' : 'missing'}`,
      `🕐 Generated at ${now.toISOString()}`,
    ].join('\n');

    await sendTelegram(report);

    return res.status(200).json({
      ok: true,
      message: 'Health report sent',
      timestamp: now.toISOString(),
      data: { totalProperties, newToday, pageViews },
    });
  } catch (error: any) {
    console.error('Health report cron error:', error);
    return res.status(500).json({ error: error.message || 'Internal error' });
  }
}
