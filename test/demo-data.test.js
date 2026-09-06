import test from 'node:test'
import assert from 'node:assert/strict'
import {
  demoConfig,
  demoScrapers,
  demoPages,
  demoRecords,
  getExportMeta,
  getDemoVariant,
  getSelectorDriftDiagnostic,
  pipelineStages,
  serializePreview,
} from '../src/demoData.js'

test('bundled demo records match the simulated crawl summary', () => {
  assert.equal(demoPages.reduce((sum, page) => sum + page.records, 0), demoRecords.length)
  assert.equal(pipelineStages.length, 5)
  assert.ok(demoRecords.every((record) => record.product_url && record.scraped_at && record.source_fixture && record.run_id))
  assert.ok(pipelineStages.every((stage) => stage.event))
  assert.ok(demoConfig.timeoutMs > demoConfig.delayMs)
  assert.ok(demoConfig.maxBackoffMs >= demoConfig.delayMs)
  assert.equal(demoConfig.job.id, 'catalog-demo')
  assert.ok(demoConfig.extraction.items)
  assert.equal(demoScrapers.length, 3)
  assert.ok(demoScrapers.every((scraper) => scraper.job.id && scraper.records.length && scraper.fields.length && scraper.variants.length))
})

test('demo export previews are deterministic and escaped', () => {
  const records = [{ title: 'Data, "Clean"', price: 2, availability: 'In stock', product_url: 'https://fixture.local/1', source_page: 1, scraped_at: 'fixed' }]
  assert.equal(serializePreview(records, 'jsonl'), `${JSON.stringify(records[0])}\n`)
  assert.match(serializePreview(records, 'csv'), /^title,price,availability,product_url,source_fixture,source_page,scraped_at,run_id\n"Data, ""Clean"""/)
  assert.equal(serializePreview([], 'csv'), '')
})

test('export metadata is format-specific and byte accurate', () => {
  const jsonl = getExportMeta(demoRecords.slice(0, 1), 'jsonl')
  const csv = getExportMeta(demoRecords.slice(0, 1), 'csv')

  assert.equal(jsonl.filename, 'catalog-demo.jsonl')
  assert.equal(jsonl.mime, 'application/x-ndjson')
  assert.equal(jsonl.bytes, new TextEncoder().encode(jsonl.content).byteLength)
  assert.equal(csv.filename, 'catalog-demo.csv')
  assert.match(csv.content, /source_fixture/)
})

test('each demo scraper serializes its own configured field set', () => {
  const articles = demoScrapers.find((scraper) => scraper.job.id === 'article-demo')
  const csv = serializePreview(articles.records.slice(0, 1), 'csv', articles)

  assert.match(csv, /^headline,author,published,article_url,source_fixture/)
  assert.equal(getExportMeta(articles.records, 'csv', articles).filename, 'article-demo.csv')
})

test('demo jobs expose named fixture variants with distinct records', () => {
  const catalog = demoScrapers.find((scraper) => scraper.job.id === 'catalog-demo')
  const walmart = getDemoVariant(catalog, 'catalog-walmart-demo')
  const ebay = getDemoVariant(catalog, 'catalog-ebay-demo')
  const articles = demoScrapers.find((scraper) => scraper.job.id === 'article-demo')

  assert.equal(walmart.job.name, 'Walmart catalog sample')
  assert.equal(ebay.job.name, 'eBay catalog sample')
  assert.notDeepEqual(walmart.records, ebay.records)
  assert.equal(articles.variants.length, 4)
})

test('CSV preserves columns while rendering nullish edge values empty', () => {
  const record = { title: null, price: undefined }
  assert.match(serializePreview([record], 'csv'), /\n,,,,,,,\n$/)
})

test('selector drift diagnostic is actionable and deterministic', () => {
  const diagnostic = getSelectorDriftDiagnostic('article.product', 2)

  assert.deepEqual(
    { code: diagnostic.code, page: diagnostic.page, selector: diagnostic.selector },
    { code: 'PARSE_ERROR', page: 2, selector: 'article.product' },
  )
  assert.match(diagnostic.observed, /0 matching nodes/)
  assert.equal(diagnostic.guidance.length, 3)
})

test('selector diagnostics describe the selected demo scraper candidate', () => {
  const events = demoScrapers.find((scraper) => scraper.job.id === 'event-demo')
  const diagnostic = getSelectorDriftDiagnostic(events.extraction.items, 1, events.driftCandidate)

  assert.match(diagnostic.observed, /article\.event-card/)
  assert.match(diagnostic.guidance[1], /article\.event-card/)
})
