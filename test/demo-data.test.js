import test from 'node:test'
import assert from 'node:assert/strict'
import { demoPages, demoRecords, pipelineStages, serializePreview } from '../src/demoData.js'

test('bundled demo records match the simulated crawl summary', () => {
  assert.equal(demoPages.reduce((sum, page) => sum + page.records, 0), demoRecords.length)
  assert.equal(pipelineStages.length, 5)
  assert.ok(demoRecords.every((record) => record.product_url && record.scraped_at && record.source_page))
})

test('demo export previews are deterministic and escaped', () => {
  const records = [{ title: 'Data, "Clean"', price: 2, availability: 'In stock', product_url: 'https://fixture.local/1', source_page: 1, scraped_at: 'fixed' }]
  assert.equal(serializePreview(records, 'jsonl'), JSON.stringify(records[0]))
  assert.match(serializePreview(records, 'csv'), /^title,price,availability,product_url,source_page,scraped_at\n"Data, ""Clean"""/)
  assert.equal(serializePreview([], 'csv'), '')
})
