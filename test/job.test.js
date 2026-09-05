import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runScrapeJob } from '../src/scraper/job.js'
import { config } from './helpers.js'

const fixture = (name) => readFile(new URL(`./fixtures/${name}`, import.meta.url), 'utf8')

test('runs a named job, exports configured output, and reports structured status', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'scraper-job-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  const events = []
  const pages = {
    'https://example.test/robots.txt': 'User-agent: *\nAllow: /\n',
    'https://example.test/catalog/page-1.html': await fixture('page-1.html'),
    'https://example.test/catalog/page-2.html': await fixture('page-2.html'),
  }
  const input = {
    ...config({ output: { format: 'csv', path: join(directory, 'catalog.csv') } }),
    job: { id: 'catalog-import', name: 'Catalog import', targetUrl: config().startUrl },
    extraction: config().selectors,
  }
  delete input.startUrl
  delete input.selectors

  const result = await runScrapeJob(input, {
    fetchImpl: async (url) => new Response(pages[String(url)]),
    sleep: async () => {},
    now: () => 0,
    clock: () => new Date('2026-01-01T00:00:00.000Z'),
    emit: (event, data) => events.push({ event, ...data }),
  })

  assert.equal(result.status, 'completed')
  assert.deepEqual(result.summary, { pages: 2, records: 3 })
  assert.equal(result.output.format, 'csv')
  assert.match(await readFile(result.output.path, 'utf8'), /_job_id/)
  assert.equal(events[0].event, 'job.started')
  assert.equal(events.at(-1).event, 'job.completed')
})

test('reports a failed status event with the underlying structured error', async () => {
  const events = []

  await assert.rejects(
    runScrapeJob({
      job: { id: 'private-catalog', targetUrl: 'https://example.test/private' },
      extraction: config().selectors,
    }, {
      fetchImpl: async (url) => String(url).endsWith('/robots.txt')
        ? new Response('User-agent: *\nDisallow: /private\n')
        : new Response('unexpected'),
      sleep: async () => {},
      now: () => 0,
      emit: (event, data) => events.push({ event, ...data }),
    }),
    (error) => error.code === 'ROBOTS_DENIED',
  )

  const failure = events.at(-1)
  assert.equal(failure.event, 'job.failed')
  assert.equal(failure.status, 'failed')
  assert.equal(failure.error.code, 'ROBOTS_DENIED')
})
