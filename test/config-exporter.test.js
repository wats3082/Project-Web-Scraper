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

test('serializes stable JSONL and escaped CSV records', () => {
  const records = [{ title: 'Alpha, "Plus"', price: 2 }, { title: 'Beta', price: null }]

  assert.equal(
    serialize(records, 'jsonl'),
    '{"title":"Alpha, \\"Plus\\"","price":2}\n{"title":"Beta","price":null}\n',
  )
  assert.equal(serialize(records, 'csv'), 'title,price\n"Alpha, ""Plus""",2\nBeta,\n')
})
