import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export class SitemapGenerator {
  private baseUrl: string;
  private urls: SitemapUrl[] = [];

  constructor(baseUrl: string = 'https://vungtauland.com') {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  // Add static pages
  addStaticPages() {
    const staticPages = [
      { loc: '/', changefreq: 'daily' as const, priority: 1.0 },
      { loc: '/mua-ban', changefreq: 'daily' as const, priority: 0.9 },
      { loc: '/cho-thue', changefreq: 'daily' as const, priority: 0.9 },
      { loc: '/tin-tuc', changefreq: 'weekly' as const, priority: 0.8 },
      { loc: '/dang-tin', changefreq: 'monthly' as const, priority: 0.7 },
    ];

    staticPages.forEach(page => {
      this.urls.push({
        loc: `${this.baseUrl}${page.loc}`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: page.changefreq,
        priority: page.priority,
      });
    });
  }

  // Add property pages from database
  async addPropertyPages() {
    try {
      const { data: properties, error } = await supabase
        .from('properties')
        .select('id, updated_at, status')
        .eq('status', 'approved')
        .limit(50000); // SEO limit

      if (error) {
        console.error('Error fetching properties for sitemap:', error);
        return;
      }

      properties?.forEach(property => {
        this.urls.push({
          loc: `${this.baseUrl}/property/${property.id}`,
          lastmod: property.updated_at ? new Date(property.updated_at).toISOString().split('T')[0] : undefined,
          changefreq: 'weekly',
          priority: 0.8,
        });
      });
    } catch (error) {
      console.error('Error generating property sitemap:', error);
    }
  }

  // Add news pages
  async addNewsPages() {
    try {
      const { data: news, error } = await supabase
        .from('news')
        .select('id, updated_at, status')
        .eq('status', 'published')
        .limit(1000);

      if (error) {
        console.error('Error fetching news for sitemap:', error);
        return;
      }

      news?.forEach(article => {
        this.urls.push({
          loc: `${this.baseUrl}/tin-tuc/${article.id}`,
          lastmod: article.updated_at ? new Date(article.updated_at).toISOString().split('T')[0] : undefined,
          changefreq: 'monthly',
          priority: 0.6,
        });
      });
    } catch (error) {
      console.error('Error generating news sitemap:', error);
    }
  }

  // Generate XML sitemap
  async generateXML(): Promise<string> {
    // Add all pages
    this.addStaticPages();
    await this.addPropertyPages();
    await this.addNewsPages();

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${this.urls.map(url => `  <url>
    <loc>${this.escapeXML(url.loc)}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority ? `<priority>${url.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

    return xml;
  }

  // Generate robots.txt
  generateRobotsTxt(): string {
    return `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${this.baseUrl}/sitemap.xml

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

  private escapeXML(str: string): string {
    return str.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case "'": return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  }
}

// Usage function
export async function generateSitemap(): Promise<string> {
  const generator = new SitemapGenerator();
  return await generator.generateXML();
}

export function generateRobots(): string {
  const generator = new SitemapGenerator();
  return generator.generateRobotsTxt();
}