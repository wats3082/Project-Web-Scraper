import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { runPipeline } from '../src/scraper/pipeline.js'
import { config } from './helpers.js'

const fixture = (name) => readFile(new URL(`./fixtures/${name}`, import.meta.url), 'utf8')

test('runs a deterministic robots-aware paginated pipeline', async () => {
  const pages = {
    'https://example.test/robots.txt': 'User-agent: *\nDisallow: /private\n',
    'https://example.test/catalog/page-1.html': await fixture('page-1.html'),
    'https://example.test/catalog/page-2.html': await fixture('page-2.html'),
  }
  const requested = []
  const events = []

  const result = await runPipeline(config(), {
    fetchImpl: async (url) => {
      const href = String(url)
      requested.push(href)
      return href in pages ? new Response(pages[href]) : new Response('', { status: 404 })
    },
    sleep: async () => {},
    now: () => 0,
    scrapedAt: '2026-01-01T00:00:00.000Z',
    emit: (event, data) => events.push({ event, ...data }),
  })

  assert.deepEqual(requested, [
    'https://example.test/robots.txt',
    'https://example.test/catalog/page-1.html',
    'https://example.test/catalog/page-2.html',
  ])
  assert.equal(result.pages, 2)
  assert.equal(result.records.length, 3)
  assert.deepEqual(result.records[2], {
    title: 'Gamma Widget',
    price: 12,
    url: 'https://example.test/items/gamma',
    _source_url: 'https://example.test/catalog/page-2.html',
    _scraped_at: '2026-01-01T00:00:00.000Z',
  })
  assert.equal(events.at(-1).event, 'pipeline.completed')
})

test('blocks a URL disallowed by robots.txt', async () => {
  await assert.rejects(
    runPipeline(config({ startUrl: 'https://example.test/private' }), {
      fetchImpl: async (url) => String(url).endsWith('/robots.txt')
        ? new Response('User-agent: *\nDisallow: /private\n')
        : new Response('unexpected'),
      sleep: async () => {},
      now: () => 0,
    }),
    (error) => error.code === 'ROBOTS_DENIED',
  )
})

test('reports first-page selector drift instead of an empty success', async () => {
  await assert.rejects(
    runPipeline(config(), {
      fetchImpl: async (url) => String(url).endsWith('/robots.txt')
        ? new Response('User-agent: *\nAllow: /\n')
        : new Response('<html><body>No products here</body></html>'),
      sleep: async () => {},
      now: () => 0,
    }),
    (error) => error.code === 'PARSE_ERROR' && error.details.selector === '.product',
  )
})
