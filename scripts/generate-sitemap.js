#!/usr/bin/env node

/**
 * Generate sitemap locally for development
 * Usage: node scripts/generate-sitemap.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Static pages sitemap
const staticPages = [
  { loc: '/', changefreq: 'daily', priority: 1.0 },
  { loc: '/mua-ban', changefreq: 'daily', priority: 0.9 },
  { loc: '/cho-thue', changefreq: 'daily', priority: 0.9 },
  { loc: '/tin-tuc', changefreq: 'weekly', priority: 0.8 },
  { loc: '/dang-tin', changefreq: 'monthly', priority: 0.7 },
];

const baseUrl = 'https://vungtauland.com';

function generateSitemap() {
  const urls = staticPages.map(page => {
    const lastmod = new Date().toISOString().split('T')[0];
    return `  <url>
    <loc>${baseUrl}${page.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  }).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return sitemap;
}

function generateRobots() {
  return `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml

# Disallow admin pages
Disallow: /admin/
Disallow: /dashboard/
Disallow: /my-properties/
Disallow: /profile/
Disallow: /settings/

# Allow important CSS and JS
Allow: /assets/
Allow: /*.css
Allow: /*.js

# Crawl-delay for politeness
Crawl-delay: 1`;
}

// Generate files
const sitemapContent = generateSitemap();
const robotsContent = generateRobots();

// Write to public directory
const publicDir = path.join(__dirname, '..', 'public');

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapContent);
fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsContent);

console.log('✅ Generated sitemap.xml and robots.txt');
console.log('📍 Files created in /public directory');
console.log('🔗 Access at:');
console.log('   - http://localhost:5175/sitemap.xml');
console.log('   - http://localhost:5175/robots.txt');