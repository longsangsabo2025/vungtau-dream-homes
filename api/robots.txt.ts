import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateRobots } from '../src/lib/sitemap';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const robots = generateRobots();
    
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'public, s-maxage=86400'); // Cache 24h
    
    return res.status(200).send(robots);
  } catch (error) {
    console.error('Robots.txt generation error:', error);
    return res.status(500).json({ error: 'Failed to generate robots.txt' });
  }
}