import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { errorPayload, ScraperError } from './scraper/errors.js'
import { runScrapeJob } from './scraper/job.js'

const configPath = process.argv[2]

const emit = (event, data = {}) => {
  process.stderr.write(`${JSON.stringify({ timestamp: new Date().toISOString(), event, ...data })}\n`)
}

try {
  if (!configPath) throw new ScraperError('Usage: npm run scrape -- <config.json>', { code: 'USAGE_ERROR' })
  const raw = await readFile(resolve(configPath), 'utf8')
  const result = await runScrapeJob(JSON.parse(raw), { emit })
  process.stdout.write(`${JSON.stringify(result)}\n`)
} catch (cause) {
  const error = cause instanceof SyntaxError
    ? new ScraperError(`Invalid JSON configuration: ${cause.message}`, { code: 'INVALID_JSON', cause })
    : cause
  emit('pipeline.failed', errorPayload(error))
  process.exitCode = 1
}
