import { validateConfig } from './config.js'
import { errorPayload } from './errors.js'
import { exportRecords } from './exporter.js'
import { runPipeline } from './pipeline.js'

const timestamp = (clock) => {
  const value = clock()
  return value instanceof Date ? value.toISOString() : value
}

export async function runScrapeJob(input, deps = {}) {
  const emit = deps.emit ?? (() => {})
  const clock = deps.clock ?? (() => new Date())
  let config
  let startedAt

  try {
    config = validateConfig(input)
    startedAt = timestamp(clock)
    emit('job.started', {
      jobId: config.job.id,
      status: 'running',
      targetUrl: config.job.targetUrl,
      startedAt,
    })

    const crawl = await runPipeline(config, { ...deps, emit })
    const output = await exportRecords(crawl.records, config.output)
    const result = {
      job: config.job,
      status: 'completed',
      startedAt,
      completedAt: timestamp(clock),
      summary: {
        pages: crawl.pages,
        records: crawl.records.length,
      },
      output,
    }
    emit('job.completed', { jobId: config.job.id, status: result.status, ...result.summary, output })
    return result
  } catch (error) {
    const failure = {
      jobId: config?.job.id ?? input?.job?.id ?? input?.jobId ?? input?.id,
      status: 'failed',
      startedAt,
      completedAt: timestamp(clock),
      error: errorPayload(error),
    }
    emit('job.failed', failure)
    throw error
  }
}
