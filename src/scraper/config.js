import { ConfigError } from './errors.js'

const defaults = {
  maxPages: 1,
  userAgent: 'PortfolioDataPipeline/1.0 (+https://github.com/wats3082/Project-Web-Scraper)',
  request: {
    delayMs: 1000,
    timeoutMs: 10000,
    retries: 2,
    backoffMs: 500,
    maxBackoffMs: 5000,
    respectRobots: true,
  },
  output: { format: 'jsonl', path: 'output/records.jsonl' },
}

const intInRange = (value, min, max, path) => {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new ConfigError(`${path} must be an integer from ${min} to ${max}`)
  }
}

export function validateConfig(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new ConfigError('Configuration must be a JSON object')
  }

  let startUrl
  try {
    startUrl = new URL(input.startUrl)
  } catch {
    throw new ConfigError('startUrl must be a valid HTTP(S) URL')
  }
  if (!['http:', 'https:'].includes(startUrl.protocol)) {
    throw new ConfigError('startUrl must use HTTP or HTTPS')
  }

  const items = input.selectors?.items
  const fields = input.selectors?.fields
  if (typeof items !== 'string' || !items.trim()) {
    throw new ConfigError('selectors.items must be a non-empty CSS selector')
  }
  if (!fields || typeof fields !== 'object' || Array.isArray(fields) || !Object.keys(fields).length) {
    throw new ConfigError('selectors.fields must define at least one field')
  }

  for (const [name, spec] of Object.entries(fields)) {
    if (!spec || typeof spec !== 'object' || typeof spec.selector !== 'string') {
      throw new ConfigError(`selectors.fields.${name}.selector must be a string`)
    }
    if (spec.type && !['string', 'number', 'url'].includes(spec.type)) {
      throw new ConfigError(`selectors.fields.${name}.type must be string, number, or url`)
    }
  }

  const config = {
    ...defaults,
    ...input,
    selectors: { ...input.selectors, items: items.trim(), fields },
    request: { ...defaults.request, ...input.request },
    output: { ...defaults.output, ...input.output },
  }

  intInRange(config.maxPages, 1, 100, 'maxPages')
  intInRange(config.request.delayMs, 0, 60000, 'request.delayMs')
  intInRange(config.request.timeoutMs, 100, 120000, 'request.timeoutMs')
  intInRange(config.request.retries, 0, 10, 'request.retries')
  intInRange(config.request.backoffMs, 0, 60000, 'request.backoffMs')
  intInRange(config.request.maxBackoffMs, config.request.backoffMs, 300000, 'request.maxBackoffMs')

  if (!['jsonl', 'csv'].includes(config.output.format)) {
    throw new ConfigError('output.format must be jsonl or csv')
  }
  if (typeof config.output.path !== 'string' || !config.output.path.trim()) {
    throw new ConfigError('output.path must be a non-empty string')
  }
  if (typeof config.userAgent !== 'string' || !config.userAgent.trim()) {
    throw new ConfigError('userAgent must be a non-empty string')
  }

  return config
}
