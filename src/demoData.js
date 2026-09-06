export const demoConfig = {
  job: {
    id: 'catalog-demo',
    name: 'Catalog product collection',
  },
  source: 'catalog-fixture.local',
  maxPages: 2,
  delayMs: 1000,
  retries: 2,
  timeoutMs: 10000,
  maxBackoffMs: 5000,
  extraction: {
    items: 'article.product',
    fields: {
      title: 'h2 a::text',
      price: '.price::number',
    },
    nextPage: 'a.next::href',
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
    source_fixture: 'catalog-v1/page-1.html',
    source_page: 1,
    scraped_at: '2026-08-22T16:00:00.000Z',
    run_id: 'demo-20260822-160000',
  },
  {
    title: 'Reliable Systems in Practice',
    price: 34,
    availability: 'In stock',
    product_url: 'https://fixture.local/items/reliable-systems',
    source_fixture: 'catalog-v1/page-1.html',
    source_page: 1,
    scraped_at: '2026-08-22T16:00:00.000Z',
    run_id: 'demo-20260822-160000',
  },
  {
    title: 'Designing Observable Workflows',
    price: 31.75,
    availability: 'In stock',
    product_url: 'https://fixture.local/items/observable-workflows',
    source_fixture: 'catalog-v1/page-2.html',
    source_page: 2,
    scraped_at: '2026-08-22T16:00:00.000Z',
    run_id: 'demo-20260822-160000',
  },
  {
    title: 'Practical Data Quality',
    price: 26.25,
    availability: 'In stock',
    product_url: 'https://fixture.local/items/data-quality',
    source_fixture: 'catalog-v1/page-2.html',
    source_page: 2,
    scraped_at: '2026-08-22T16:00:00.000Z',
    run_id: 'demo-20260822-160000',
  },
]

export const pipelineStages = [
  { title: 'Validate configuration', description: 'Schema, limits, and selectors accepted', event: 'config.validated' },
  { title: 'Check access policy', description: 'Bundled robots policy allows fixture paths', event: 'policy.allowed' },
  { title: 'Parse page 1', description: 'Extract and normalize typed fields', event: 'page.parsed' },
  { title: 'Follow pagination', description: 'Resolve the bounded same-origin next link', event: 'pagination.followed' },
  { title: 'Build export', description: 'Attach provenance and serialize records', event: 'export.ready' },
]

const csvCell = (value) => {
  if (value === null || value === undefined) return ''
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

export function serializePreview(records, format) {
  if (!records.length) return ''
  if (format === 'jsonl') return `${records.map((record) => JSON.stringify(record)).join('\n')}\n`
  const fields = ['title', 'price', 'availability', 'product_url', 'source_fixture', 'source_page', 'scraped_at', 'run_id']
  return [
    fields.join(','),
    ...records.map((record) => fields.map((field) => csvCell(record[field])).join(',')),
  ].join('\n') + '\n'
}

export function getExportMeta(records, format) {
  const content = serializePreview(records, format)
  return {
    content,
    filename: `catalog-demo.${format === 'jsonl' ? 'jsonl' : 'csv'}`,
    mime: format === 'jsonl' ? 'application/x-ndjson' : 'text/csv',
    bytes: new TextEncoder().encode(content).byteLength,
  }
}

export function getSelectorDriftDiagnostic(selector, page = 1) {
  return {
    code: 'PARSE_ERROR',
    page,
    selector,
    observed: '0 matching nodes; candidate structure: article.catalog-card',
    guidance: [
      'Inspect the saved fixture before changing extraction rules.',
      'Update selectors.items to the observed catalog-card structure.',
      'Re-run fixture tests before collecting from an authorized source.',
    ],
  }
}
