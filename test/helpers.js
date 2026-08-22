export const config = (overrides = {}) => ({
  startUrl: 'https://example.test/catalog/page-1.html',
  maxPages: 2,
  userAgent: 'TestBot/1.0',
  selectors: {
    items: '.product',
    fields: {
      title: { selector: 'h2 a', required: true },
      price: { selector: '.price', type: 'number', required: true },
      url: { selector: 'h2 a', attr: 'href', type: 'url', required: true },
    },
    nextPage: { selector: '.next' },
  },
  request: {
    delayMs: 0,
    timeoutMs: 1000,
    retries: 2,
    backoffMs: 10,
    maxBackoffMs: 25,
    respectRobots: true,
  },
  output: { format: 'jsonl', path: 'output/test.jsonl' },
  ...overrides,
})
