import { Module } from '@nestjs/common';
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('seo')
@Controller()
export class SeoController {
  @Get('robots.txt')
  getRobots() {
    return `User-agent: *
Allow: /
Sitemap: https://medikomplus.ru/sitemap.xml`;
  }

  @Get('sitemap.xml')
  getSitemap() {
    // Dynamic sitemap generation will be implemented later
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://medikomplus.ru/</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://medikomplus.ru/catalog</loc>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://medikomplus.ru/about</loc>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://medikomplus.ru/service</loc>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://medikomplus.ru/warranty</loc>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://medikomplus.ru/leasing</loc>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://medikomplus.ru/contacts</loc>
    <priority>0.7</priority>
  </url>
</urlset>`;
  }
}
