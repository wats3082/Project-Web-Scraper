export const demoConfig = {
  source: 'catalog-fixture.local',
  maxPages: 2,
  delayMs: 1000,
  retries: 2,
  selectors: {
    items: 'article.product',
    title: 'h2 a::text',
    price: '.price::number',
    next: 'a.next::href',
  },
}

export const demoPages = [
  { path: 'page-1.html', records: 2 },
  { path: 'page-2.html', records: 2 },
]

export const demoRecords = [
  {
    title: 'The Data Pipeline Handbook',
    price: 28.5,
    availability: 'In stock',
    product_url: 'https://fixture.local/items/data-pipeline-handbook',
    source_page: 1,
    scraped_at: '2026-08-22T16:00:00.000Z',
  },
  {
    title: 'Reliable Systems in Practice',
    price: 34,
    availability: 'In stock',
    product_url: 'https://fixture.local/items/reliable-systems',
    source_page: 1,
    scraped_at: '2026-08-22T16:00:00.000Z',
  },
  {
    title: 'Designing Observable Workflows',
    price: 31.75,
    availability: 'In stock',
    product_url: 'https://fixture.local/items/observable-workflows',
    source_page: 2,
    scraped_at: '2026-08-22T16:00:00.000Z',
  },
  {
    title: 'Practical Data Quality',
    price: 26.25,
    availability: 'In stock',
    product_url: 'https://fixture.local/items/data-quality',
    source_page: 2,
    scraped_at: '2026-08-22T16:00:00.000Z',
  },
]

export const pipelineStages = [
  { title: 'Validate configuration', description: 'Schema, limits, and selectors accepted' },
  { title: 'Check access policy', description: 'Bundled robots policy allows fixture paths' },
  { title: 'Parse page 1', description: 'Extract and normalize typed fields' },
  { title: 'Follow pagination', description: 'Resolve the bounded same-origin next link' },
  { title: 'Build export', description: 'Attach provenance and serialize records' },
]

const csvCell = (value) => {
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

export function serializePreview(records, format) {
  if (!records.length) return ''
  if (format === 'jsonl') return records.map((record) => JSON.stringify(record)).join('\n')
  const fields = ['title', 'price', 'availability', 'product_url', 'source_page', 'scraped_at']
  return [
    fields.join(','),
    ...records.map((record) => fields.map((field) => csvCell(record[field])).join(',')),
  ].join('\n')
}
