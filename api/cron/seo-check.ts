import type { VercelRequest, VercelResponse } from '@vercel/node';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID!;
const CRON_SECRET = process.env.CRON_SECRET!;
const SITE_URL =
  process.env.VITE_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://vungtauland.store');

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

function countUrlsInSitemap(xml: string): number {
  // Count <loc> tags — works for standard sitemap XML
  const matches = xml.match(/<loc>/gi);
  return matches ? matches.length : 0;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ── Auth guard ──
  const authHeader = req.headers['authorization'];
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const now = new Date();
    const results: Record<string, string> = {};

    // ── 1. Fetch sitemap.xml ──
    const sitemapUrl = `${SITE_URL}/sitemap.xml`;
    let sitemapStatus = '❌ Unreachable';
    let urlCount = 0;

    try {
      const sitemapRes = await fetch(sitemapUrl, {
        headers: { 'User-Agent': 'VungTauLand-SEO-Bot/1.0' },
      });

      if (sitemapRes.ok) {
        const xml = await sitemapRes.text();
        urlCount = countUrlsInSitemap(xml);
        sitemapStatus = `✅ OK (${sitemapRes.status})`;
      } else {
        sitemapStatus = `⚠️ HTTP ${sitemapRes.status}`;
      }
    } catch (err: any) {
      sitemapStatus = `❌ Error: ${err.message}`;
    }
    results['Sitemap'] = sitemapStatus;

    // ── 2. Check robots.txt ──
    const robotsUrl = `${SITE_URL}/robots.txt`;
    let robotsStatus = '❌ Unreachable';

    try {
      const robotsRes = await fetch(robotsUrl, {
        headers: { 'User-Agent': 'VungTauLand-SEO-Bot/1.0' },
      });

      robotsStatus = robotsRes.ok
        ? `✅ OK (${robotsRes.status})`
        : `⚠️ HTTP ${robotsRes.status}`;
    } catch (err: any) {
      robotsStatus = `❌ Error: ${err.message}`;
    }
    results['Robots.txt'] = robotsStatus;

    // ── 3. Ping Google with sitemap URL ──
    let googlePing = '⏭️ Skipped';
    try {
      const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
      const pingRes = await fetch(pingUrl, {
        headers: { 'User-Agent': 'VungTauLand-SEO-Bot/1.0' },
      });

      googlePing = pingRes.ok
        ? `✅ Pinged (${pingRes.status})`
        : `⚠️ HTTP ${pingRes.status}`;
    } catch (err: any) {
      googlePing = `❌ Error: ${err.message}`;
    }
    results['Google Ping'] = googlePing;

    // ── Build report ──
    const report = [
      `<b>🔍 VungTauLand — Weekly SEO Check</b>`,
      ``,
      `📅 <b>Date:</b> ${now.toISOString().slice(0, 10)}`,
      `🌐 <b>Site:</b> ${SITE_URL}`,
      ``,
      `📊 <b>Results</b>`,
      `  • Sitemap: ${results['Sitemap']}`,
      `  • URLs in sitemap: <b>${urlCount}</b>`,
      `  • Robots.txt: ${results['Robots.txt']}`,
      `  • Google Ping: ${results['Google Ping']}`,
      ``,
      `🕐 Checked at ${now.toISOString()}`,
    ].join('\n');

    await sendTelegram(report);

    return res.status(200).json({
      ok: true,
      message: 'SEO check report sent',
      timestamp: now.toISOString(),
      data: { sitemapStatus, urlCount, robotsStatus: results['Robots.txt'], googlePing },
    });
  } catch (error: any) {
    console.error('SEO check cron error:', error);
    return res.status(500).json({ error: error.message || 'Internal error' });
  }
}
