/**
 * Generate sitemap.xml từ database
 * Chạy: node scripts/generate-sitemap.mjs
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = 'https://rxjsdoylkflzsxlyccqh.supabase.co';
const SUPABASE_ACCESS_TOKEN = 'sbp_d9fd9f159ba3a08854384eedc801d9d3bc7d9c77';
const PROJECT_REF = 'rxjsdoylkflzsxlyccqh';
const BASE_URL = 'https://vungtauland.com';

async function getServiceKey() {
  const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/api-keys?reveal=true`, {
    headers: {
      'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
  const keys = await response.json();
  return keys.find(k => k.name === 'service_role')?.api_key;
}

// Các trang tĩnh
const staticPages = [
  { loc: '/', changefreq: 'daily', priority: '1.0' },
  { loc: '/mua-ban', changefreq: 'daily', priority: '0.9' },
  { loc: '/cho-thue', changefreq: 'daily', priority: '0.9' },
  { loc: '/dang-tin', changefreq: 'monthly', priority: '0.7' },
  { loc: '/tin-tuc', changefreq: 'daily', priority: '0.8' },
  { loc: '/lien-he', changefreq: 'monthly', priority: '0.6' },
  { loc: '/about', changefreq: 'monthly', priority: '0.6' },
];

// Tạo slug từ title
function createSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function generateSitemap() {
  console.log('🗺️ GENERATE SITEMAP');
  console.log('====================\n');

  // Get service key for full access
  console.log('🔑 Getting service key...');
  const serviceKey = await getServiceKey();
  if (!serviceKey) {
    console.error('❌ Could not get service key');
    return;
  }
  
  const supabase = createClient(SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // Get all approved properties
  const { data: properties } = await supabase
    .from('properties')
    .select('id, title, updated_at, created_at')
    .eq('approval_status', 'approved')
    .order('created_at', { ascending: false });

  // Get all categories
  const { data: categories } = await supabase
    .from('categories')
    .select('slug, name')
    .eq('is_active', true);

  // Get all news articles
  const { data: news } = await supabase
    .from('news')
    .select('id, title, updated_at, created_at')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  // Build sitemap XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

  // Add static pages
  console.log(`📄 Adding ${staticPages.length} static pages...`);
  for (const page of staticPages) {
    xml += `  <url>
    <loc>${BASE_URL}${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
`;
  }

  // Add category pages
  if (categories && categories.length > 0) {
    console.log(`📁 Adding ${categories.length} category pages...`);
    for (const cat of categories) {
      xml += `  <url>
    <loc>${BASE_URL}/danh-muc/${cat.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
`;
    }
  }

  // Add property pages
  if (properties && properties.length > 0) {
    console.log(`🏠 Adding ${properties.length} property pages...`);
    for (const prop of properties) {
      const slug = createSlug(prop.title);
      const lastmod = (prop.updated_at || prop.created_at || new Date().toISOString()).split('T')[0];
      xml += `  <url>
    <loc>${BASE_URL}/bat-dong-san/${prop.id}/${slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <lastmod>${lastmod}</lastmod>
  </url>
`;
    }
  }

  // Add news pages
  if (news && news.length > 0) {
    console.log(`📰 Adding ${news.length} news pages...`);
    for (const article of news) {
      const slug = createSlug(article.title);
      const lastmod = (article.updated_at || article.created_at || new Date().toISOString()).split('T')[0];
      xml += `  <url>
    <loc>${BASE_URL}/tin-tuc/${article.id}/${slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <lastmod>${lastmod}</lastmod>
  </url>
`;
    }
  }

  xml += '</urlset>';

  // Write to public folder
  const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  fs.writeFileSync(sitemapPath, xml);
  console.log(`\n✅ Sitemap saved to: ${sitemapPath}`);

  // Count
  const totalUrls = staticPages.length + 
    (categories?.length || 0) + 
    (properties?.length || 0) + 
    (news?.length || 0);
  console.log(`📊 Total URLs: ${totalUrls}`);

  // Generate sitemap index if needed (for large sites)
  console.log('\n✅ Sitemap generation complete!');
}

generateSitemap().catch(console.error);
