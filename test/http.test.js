import test from 'node:test'
import assert from 'node:assert/strict'
import { createHttpClient } from '../src/scraper/http.js'
import { config } from './helpers.js'

test('retries retryable responses with bounded exponential backoff', async () => {
  const statuses = [503, 429, 200]
  const waits = []
  const events = []
  const client = createHttpClient(config(), {
    fetchImpl: async () => new Response('body', {
      status: statuses.shift(),
      headers: { 'retry-after': '999' },
    }),
    sleep: async (ms) => waits.push(ms),
    now: () => 0,
    emit: (event, data) => events.push({ event, ...data }),
  })

  const response = await client.request('https://example.test/data')

  assert.equal(response.status, 200)
  assert.deepEqual(waits, [25, 25])
  assert.equal(events.filter(({ event }) => event === 'request.retrying').length, 2)
})

test('surfaces non-retryable responses without retrying', async () => {
  let calls = 0
  const client = createHttpClient(config(), {
    fetchImpl: async () => {
      calls += 1
      return new Response('', { status: 403 })
    },
  })

  await assert.rejects(
    client.request('https://example.test/private'),
    (error) => error.code === 'HTTP_ERROR' && error.details.status === 403,
  )
  assert.equal(calls, 1)
})
