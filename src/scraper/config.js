import { ConfigError } from './errors.js'
import * as cheerio from 'cheerio'

const defaults = {
  job: {
    id: 'ad-hoc-scrape',
    name: 'Ad hoc scrape',
  },
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

const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value)

const intInRange = (value, min, max, path) => {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new ConfigError(`${path} must be an integer from ${min} to ${max}`)
  }
}

const validateSelector = (selector, path) => {
  if (typeof selector !== 'string' || !selector.trim()) {
    throw new ConfigError(`${path} must be a non-empty CSS selector`)
  }
  try {
    cheerio.load('')(selector)
  } catch {
    throw new ConfigError(`${path} must be a valid CSS selector`)
  }
  return selector.trim()
}

const validateFields = (fields, path) => {
  if (!isObject(fields) || !Object.keys(fields).length) {
    throw new ConfigError(`${path} must define at least one field`)
  }

  for (const [name, spec] of Object.entries(fields)) {
    if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(name) || name.startsWith('_')) {
      throw new ConfigError(`${path} field names must start with a letter, use letters, numbers, or underscores, and not start with "_"`)
    }
    if (!isObject(spec)) throw new ConfigError(`${path}.${name} must be an object`)
    validateSelector(spec.selector, `${path}.${name}.selector`)
    if (spec.type && !['string', 'number', 'url'].includes(spec.type)) {
      throw new ConfigError(`${path}.${name}.type must be string, number, or url`)
    }
    if (spec.attr !== undefined && (typeof spec.attr !== 'string' || !spec.attr.trim())) {
      throw new ConfigError(`${path}.${name}.attr must be a non-empty string when provided`)
    }
    if (spec.required !== undefined && typeof spec.required !== 'boolean') {
      throw new ConfigError(`${path}.${name}.required must be a boolean when provided`)
    }
  }
}

export function validateConfig(input) {
  if (!isObject(input)) {
    throw new ConfigError('Configuration must be a JSON object')
  }

  if (input.job !== undefined && !isObject(input.job)) {
    throw new ConfigError('job must be an object when provided')
  }
  const jobInput = input.job ?? {}
  const jobId = jobInput.id ?? input.jobId ?? input.id ?? defaults.job.id
  if (typeof jobId !== 'string' || !/^[a-z0-9][a-z0-9-]{0,63}$/.test(jobId)) {
    throw new ConfigError('job.id must be a lowercase slug of up to 64 letters, numbers, and hyphens')
  }
  const jobName = jobInput.name ?? defaults.job.name
  if (typeof jobName !== 'string' || !jobName.trim() || jobName.length > 120) {
    throw new ConfigError('job.name must be a non-empty string of up to 120 characters')
  }

  let startUrl
  try {
    startUrl = new URL(jobInput.targetUrl ?? input.targetUrl ?? input.startUrl)
  } catch {
    throw new ConfigError('job.targetUrl must be a valid HTTP(S) URL')
  }
  if (!['http:', 'https:'].includes(startUrl.protocol)) {
    throw new ConfigError('job.targetUrl must use HTTP or HTTPS')
  }

  const extraction = input.extraction ?? input.selectors
  const extractionPath = input.extraction ? 'extraction' : 'selectors'
  if (!isObject(extraction)) {
    throw new ConfigError(`${extractionPath} must be an object`)
  }
  const items = validateSelector(extraction.items, `${extractionPath}.items`)
  validateFields(extraction.fields, `${extractionPath}.fields`)
  if (extraction.nextPage !== undefined) {
    if (!isObject(extraction.nextPage)) throw new ConfigError(`${extractionPath}.nextPage must be an object when provided`)
    validateSelector(extraction.nextPage.selector, `${extractionPath}.nextPage.selector`)
    if (extraction.nextPage.attr !== undefined && (typeof extraction.nextPage.attr !== 'string' || !extraction.nextPage.attr.trim())) {
      throw new ConfigError(`${extractionPath}.nextPage.attr must be a non-empty string when provided`)
    }
  }

  if (input.request !== undefined && !isObject(input.request)) throw new ConfigError('request must be an object when provided')
  if (input.output !== undefined && !isObject(input.output)) throw new ConfigError('output must be an object when provided')
  const config = {
    ...defaults,
    ...input,
    job: { ...defaults.job, ...jobInput, id: jobId, name: jobName.trim(), targetUrl: startUrl.href },
    startUrl: startUrl.href,
    targetUrl: startUrl.href,
    selectors: {
      ...extraction,
      items,
      fields: extraction.fields,
      nextPage: extraction.nextPage && {
        ...extraction.nextPage,
        selector: extraction.nextPage.selector.trim(),
        attr: extraction.nextPage.attr?.trim(),
      },
    },
    request: { ...defaults.request, ...input.request },
    output: { ...defaults.output, ...input.output },
  }

  intInRange(config.maxPages, 1, 100, 'maxPages')
  intInRange(config.request.delayMs, 0, 60000, 'request.delayMs')
  intInRange(config.request.timeoutMs, 100, 120000, 'request.timeoutMs')
  intInRange(config.request.retries, 0, 10, 'request.retries')
  intInRange(config.request.backoffMs, 0, 60000, 'request.backoffMs')
  intInRange(config.request.maxBackoffMs, config.request.backoffMs, 300000, 'request.maxBackoffMs')
  if (typeof config.request.respectRobots !== 'boolean') {
    throw new ConfigError('request.respectRobots must be a boolean')
  }

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
