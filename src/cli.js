import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { validateConfig } from './scraper/config.js'
import { exportRecords } from './scraper/exporter.js'
import { runPipeline } from './scraper/pipeline.js'
import { ScraperError } from './scraper/errors.js'

const configPath = process.argv[2]

const emit = (event, data = {}) => {
  process.stderr.write(`${JSON.stringify({ timestamp: new Date().toISOString(), event, ...data })}\n`)
}

try {
  if (!configPath) throw new ScraperError('Usage: npm run scrape -- <config.json>', { code: 'USAGE_ERROR' })
  const raw = await readFile(resolve(configPath), 'utf8')
  const config = validateConfig(JSON.parse(raw))
  const result = await runPipeline(config, { emit })
  const output = await exportRecords(result.records, config.output)
  emit('export.completed', output)
} catch (cause) {
  const error = cause instanceof SyntaxError
    ? new ScraperError(`Invalid JSON configuration: ${cause.message}`, { code: 'INVALID_JSON', cause })
    : cause
  emit('pipeline.failed', {
    code: error.code ?? 'UNEXPECTED_ERROR',
    message: error.message,
    details: error.details,
  })
  process.exitCode = 1
}
