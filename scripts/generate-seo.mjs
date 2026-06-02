import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const routes = ['/', '/overview', '/encoders', '/decoders', '/tools/data-url', '/tools/validator']
const defaultSiteUrl = 'https://base64-tools.pages.dev'
const siteUrl = (process.env.SITE_URL || process.env.VITE_SITE_URL || defaultSiteUrl).trim().replace(/\/+$/, '')
const distDir = resolve('dist')

const now = new Date().toISOString().slice(0, 10)
const urlEntries = routes
  .map((route) => {
    const loc = `${siteUrl}${route === '/' ? '/' : route}`
    const priority = route === '/' || route === '/overview' ? '1.0' : '0.8'

    return [
      '  <url>',
      `    <loc>${loc}</loc>`,
      `    <lastmod>${now}</lastmod>`,
      '    <changefreq>monthly</changefreq>',
      `    <priority>${priority}</priority>`,
      '  </url>',
    ].join('\n')
  })
  .join('\n')

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  urlEntries,
  '</urlset>',
  '',
].join('\n')

const robots = [
  'User-agent: *',
  'Allow: /',
  '',
  `Sitemap: ${siteUrl}/sitemap.xml`,
  '',
].join('\n')

await mkdir(distDir, { recursive: true })
await writeFile(resolve(distDir, 'sitemap.xml'), sitemap)
await writeFile(resolve(distDir, 'robots.txt'), robots)
