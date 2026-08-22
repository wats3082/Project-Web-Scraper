import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { parsePage } from '../src/scraper/parser.js'
import { config } from './helpers.js'

test('parses and normalizes configured fields and pagination', async () => {
  const html = await readFile(new URL('./fixtures/page-1.html', import.meta.url), 'utf8')
  const result = parsePage(html, config().startUrl, config().selectors)

  assert.deepEqual(result, {
    records: [
      { title: 'Alpha Widget', price: 19.95, url: 'https://example.test/items/alpha' },
      { title: 'Beta Widget', price: 7.5, url: 'https://example.test/items/beta' },
    ],
    nextUrl: 'https://example.test/catalog/page-2.html',
  })
})

test('raises an explicit parse error for an invalid required value', () => {
  assert.throws(
    () => parsePage('<article class="product"><span class="price">unknown</span></article>', config().startUrl, config().selectors),
    (error) => error.code === 'PARSE_ERROR' && error.details.field === 'title',
  )
})
