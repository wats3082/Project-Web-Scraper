import test from 'node:test'
import assert from 'node:assert/strict'
import { validateConfig } from '../src/scraper/config.js'
import { serialize } from '../src/scraper/exporter.js'
import { config } from './helpers.js'

test('applies safe defaults and rejects unbounded page counts', () => {
  const validated = validateConfig({
    startUrl: config().startUrl,
    selectors: config().selectors,
  })

  assert.equal(validated.maxPages, 1)
  assert.equal(validated.request.respectRobots, true)
  assert.throws(() => validateConfig({ ...config(), maxPages: 101 }), /maxPages/)
})

test('canonicalizes a named job configuration and rejects malformed selectors', () => {
  const validated = validateConfig({
    job: { id: 'catalog-import', name: 'Catalog import', targetUrl: config().startUrl },
    extraction: config().selectors,
  })

  assert.equal(validated.job.id, 'catalog-import')
  assert.equal(validated.targetUrl, config().startUrl)
  assert.equal(validated.selectors.items, '.product')
  assert.throws(
    () => validateConfig({ job: { id: 'Bad Job', targetUrl: config().startUrl }, extraction: config().selectors }),
    /job.id/,
  )
  assert.throws(
    () => validateConfig({ job: { id: 'catalog-import', targetUrl: config().startUrl }, extraction: { ...config().selectors, items: '[' } }),
    /valid CSS selector/,
  )
  assert.throws(
    () => validateConfig({ ...config(), request: { ...config().request, respectRobots: 'yes' } }),
    /respectRobots/,
  )
})

test('serializes stable JSONL and escaped CSV records', () => {
  const records = [{ title: 'Alpha, "Plus"', price: 2 }, { title: 'Beta', price: null }]

  assert.equal(
    serialize(records, 'jsonl'),
    '{"title":"Alpha, \\"Plus\\"","price":2}\n{"title":"Beta","price":null}\n',
  )
  assert.equal(serialize(records, 'csv'), 'title,price\n"Alpha, ""Plus""",2\nBeta,\n')
})
