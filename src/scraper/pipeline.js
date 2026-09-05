import { createHttpClient } from './http.js'
import { parsePage } from './parser.js'
import { parseRobots, robotsAllows, robotsDelay } from './robots.js'
import { ParseError, RobotsDeniedError, ScraperError } from './errors.js'

const getRobots = async (startUrl, config, client, emit) => {
  if (!config.request.respectRobots) {
    emit('robots.skipped', { reason: 'disabled by configuration' })
    return []
  }
  const robotsUrl = new URL('/robots.txt', startUrl)
  try {
    const response = await client.request(robotsUrl, { retries: 0 })
    const rules = parseRobots(await response.text(), config.userAgent)
    emit('robots.loaded', { url: robotsUrl.href, rules: rules.filter((rule) => rule.path).length })
    return rules
  } catch (cause) {
    if (cause.details?.status === 404) {
      emit('robots.missing', { url: robotsUrl.href })
      return []
    }
    throw new ScraperError(`Unable to verify robots policy at ${robotsUrl.href}`, {
      code: 'ROBOTS_UNAVAILABLE',
      cause,
      details: { url: robotsUrl.href },
    })
  }
}

export async function runPipeline(config, deps = {}) {
  const emit = deps.emit ?? (() => {})
  const client = createHttpClient(config, { ...deps, emit })
  const startUrl = new URL(config.startUrl)
  const scrapedAt = deps.scrapedAt ?? new Date().toISOString()
  emit('pipeline.started', { jobId: config.job?.id, startUrl: startUrl.href, maxPages: config.maxPages })
  const rules = await getRobots(startUrl, config, client, emit)
  client.setMinDelay(robotsDelay(rules))

  const records = []
  const visited = new Set()
  let pageUrl = startUrl.href

  while (pageUrl && visited.size < config.maxPages) {
    const url = new URL(pageUrl)
    if (url.origin !== startUrl.origin) {
      throw new ScraperError(`Pagination left the configured origin: ${pageUrl}`, {
        code: 'CROSS_ORIGIN_PAGINATION',
        details: { pageUrl, origin: startUrl.origin },
      })
    }
    if (visited.has(url.href)) {
      throw new ScraperError(`Pagination cycle detected at ${url.href}`, {
        code: 'PAGINATION_CYCLE',
        details: { pageUrl: url.href },
      })
    }
    if (!robotsAllows(rules, url)) throw new RobotsDeniedError(url.href)

    visited.add(url.href)
    const response = await client.request(url)
    const parsed = parsePage(await response.text(), url.href, config.selectors)
    if (visited.size === 1 && parsed.records.length === 0) {
      throw new ParseError(`No records matched selectors.items on the first page: ${url.href}`, {
        selector: config.selectors.items,
        pageUrl: url.href,
      })
    }
    records.push(...parsed.records.map((record) => ({
      ...record,
      ...(config.job?.id ? { _job_id: config.job.id } : {}),
      _source_url: url.href,
      _scraped_at: scrapedAt,
    })))
    emit('page.parsed', {
      page: visited.size,
      url: url.href,
      pageRecords: parsed.records.length,
      totalRecords: records.length,
    })
    pageUrl = parsed.nextUrl
  }

  emit('pipeline.completed', { pages: visited.size, records: records.length })
  return { records, pages: visited.size }
}
