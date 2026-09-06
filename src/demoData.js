const timestamp = '2026-08-22T16:00:00.000Z'

const createDemo = ({
  id,
  name,
  description,
  source,
  category,
  maxPages,
  delayMs,
  records,
  fields,
  pages,
  snapshot,
  itemsSelector,
  driftCandidate,
  nextPage,
}) => ({
  job: { id, name },
  description,
  source,
  category,
  maxPages,
  delayMs,
  retries: 2,
  timeoutMs: 10000,
  maxBackoffMs: 5000,
  runId: `demo-${id}-20260822-160000`,
  snapshot,
  driftCandidate,
  fields,
  pages,
  records,
  extraction: {
    items: itemsSelector,
    fields: Object.fromEntries(fields.map(({ key, selector }) => [key, selector])),
    nextPage,
  },
})

export const demoScrapers = [
  createDemo({
    id: 'catalog-demo',
    name: 'Catalog product collection',
    description: 'Normalize product cards across two bundled catalog pages.',
    category: 'Product catalog',
    source: 'catalog-fixture.local',
    maxPages: 2,
    delayMs: 1000,
    snapshot: 'catalog-v1',
    itemsSelector: 'article.product',
    driftCandidate: 'article.catalog-card',
    nextPage: 'a.next::href',
    fields: [
      { key: 'title', label: 'Title', selector: 'h2 a::text' },
      { key: 'price', label: 'Price', selector: '.price::number', format: 'currency' },
      { key: 'availability', label: 'Availability', selector: '.availability::text', format: 'availability' },
      { key: 'product_url', label: 'Product URL', selector: 'h2 a::href', format: 'url' },
    ],
    pages: [
      { path: 'page-1.html', records: 2 },
      { path: 'page-2.html', records: 2 },
    ],
    records: [
      { title: 'The Data Pipeline Handbook', price: 28.5, availability: 'In stock', product_url: 'https://fixture.local/items/data-pipeline-handbook', source_fixture: 'catalog-v1/page-1.html', source_page: 1, scraped_at: timestamp, run_id: 'demo-catalog-demo-20260822-160000' },
      { title: 'Reliable Systems in Practice', price: 34, availability: 'In stock', product_url: 'https://fixture.local/items/reliable-systems', source_fixture: 'catalog-v1/page-1.html', source_page: 1, scraped_at: timestamp, run_id: 'demo-catalog-demo-20260822-160000' },
      { title: 'Designing Observable Workflows', price: 31.75, availability: 'In stock', product_url: 'https://fixture.local/items/observable-workflows', source_fixture: 'catalog-v1/page-2.html', source_page: 2, scraped_at: timestamp, run_id: 'demo-catalog-demo-20260822-160000' },
      { title: 'Practical Data Quality', price: 26.25, availability: 'In stock', product_url: 'https://fixture.local/items/data-quality', source_fixture: 'catalog-v1/page-2.html', source_page: 2, scraped_at: timestamp, run_id: 'demo-catalog-demo-20260822-160000' },
    ],
  }),
  createDemo({
    id: 'article-demo',
    name: 'Article index collection',
    description: 'Collect byline, publication date, and canonical article links.',
    category: 'Editorial index',
    source: 'articles-fixture.local',
    maxPages: 1,
    delayMs: 750,
    snapshot: 'articles-v2',
    itemsSelector: 'article.article-preview',
    driftCandidate: 'article.article-card',
    fields: [
      { key: 'headline', label: 'Headline', selector: 'h2 a::text' },
      { key: 'author', label: 'Author', selector: '.byline::text' },
      { key: 'published', label: 'Published', selector: 'time::text' },
      { key: 'article_url', label: 'Article URL', selector: 'h2 a::href', format: 'url' },
    ],
    pages: [{ path: 'index.html', records: 3 }],
    records: [
      { headline: 'Tracing a production incident', author: 'A. Rivera', published: '2026-08-19', article_url: 'https://fixture.local/articles/production-incident', source_fixture: 'articles-v2/index.html', source_page: 1, scraped_at: timestamp, run_id: 'demo-article-demo-20260822-160000' },
      { headline: 'Designing an honest retry policy', author: 'M. Chen', published: '2026-08-14', article_url: 'https://fixture.local/articles/retry-policy', source_fixture: 'articles-v2/index.html', source_page: 1, scraped_at: timestamp, run_id: 'demo-article-demo-20260822-160000' },
      { headline: 'Source provenance as a product feature', author: 'S. Patel', published: '2026-08-08', article_url: 'https://fixture.local/articles/source-provenance', source_fixture: 'articles-v2/index.html', source_page: 1, scraped_at: timestamp, run_id: 'demo-article-demo-20260822-160000' },
    ],
  }),
  createDemo({
    id: 'event-demo',
    name: 'Event directory collection',
    description: 'Build a normalized directory from a bounded event listing.',
    category: 'Event directory',
    source: 'events-fixture.local',
    maxPages: 2,
    delayMs: 1250,
    snapshot: 'events-v1',
    itemsSelector: 'article.event-listing',
    driftCandidate: 'article.event-card',
    nextPage: 'a.next::href',
    fields: [
      { key: 'event', label: 'Event', selector: 'h2 a::text' },
      { key: 'date', label: 'Date', selector: 'time::text' },
      { key: 'venue', label: 'Venue', selector: '.venue::text' },
      { key: 'registration_url', label: 'Registration URL', selector: 'h2 a::href', format: 'url' },
    ],
    pages: [
      { path: 'page-1.html', records: 2 },
      { path: 'page-2.html', records: 1 },
    ],
    records: [
      { event: 'Reliable systems meetup', date: '2026-09-12', venue: 'North Hall', registration_url: 'https://fixture.local/events/reliable-systems', source_fixture: 'events-v1/page-1.html', source_page: 1, scraped_at: timestamp, run_id: 'demo-event-demo-20260822-160000' },
      { event: 'Data quality clinic', date: '2026-09-18', venue: 'Studio 4', registration_url: 'https://fixture.local/events/data-quality', source_fixture: 'events-v1/page-1.html', source_page: 1, scraped_at: timestamp, run_id: 'demo-event-demo-20260822-160000' },
      { event: 'Observability office hours', date: '2026-09-24', venue: 'Online', registration_url: 'https://fixture.local/events/observability-office-hours', source_fixture: 'events-v1/page-2.html', source_page: 2, scraped_at: timestamp, run_id: 'demo-event-demo-20260822-160000' },
    ],
  }),
]

export const demoConfig = demoScrapers[0]
export const demoPages = demoConfig.pages
export const demoRecords = demoConfig.records

export const pipelineStages = [
  { title: 'Validate configuration', description: 'Schema, limits, and selectors accepted', event: 'config.validated' },
  { title: 'Check access policy', description: 'Bundled robots policy allows fixture paths', event: 'policy.allowed' },
  { title: 'Parse source page', description: 'Extract and normalize typed fields', event: 'page.parsed' },
  { title: 'Follow pagination', description: 'Resolve bounded next links where present', event: 'pagination.followed' },
  { title: 'Build export', description: 'Attach provenance and serialize records', event: 'export.ready' },
]

const csvCell = (value) => {
  if (value === null || value === undefined) return ''
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

const exportFields = (scraper) => [
  ...scraper.fields.map(({ key }) => key),
  'source_fixture',
  'source_page',
  'scraped_at',
  'run_id',
]

export function serializePreview(records, format, scraper = demoConfig) {
  if (!records.length) return ''
  if (format === 'jsonl') return `${records.map((record) => JSON.stringify(record)).join('\n')}\n`
  const fields = exportFields(scraper)
  return [
    fields.join(','),
    ...records.map((record) => fields.map((field) => csvCell(record[field])).join(',')),
  ].join('\n') + '\n'
}

export function getExportMeta(records, format, scraper = demoConfig) {
  const content = serializePreview(records, format, scraper)
  return {
    content,
    filename: `${scraper.job.id}.${format === 'jsonl' ? 'jsonl' : 'csv'}`,
    mime: format === 'jsonl' ? 'application/x-ndjson' : 'text/csv',
    bytes: new TextEncoder().encode(content).byteLength,
  }
}

export function getSelectorDriftDiagnostic(selector, page = 1, candidate = 'article.catalog-card') {
  return {
    code: 'PARSE_ERROR',
    page,
    selector,
    observed: `0 matching nodes; candidate structure: ${candidate}`,
    guidance: [
      'Inspect the saved fixture before changing extraction rules.',
      `Update selectors.items to the observed ${candidate} structure.`,
      'Re-run fixture tests before collecting from an authorized source.',
    ],
  }
}
