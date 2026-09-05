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

test('aborts timed-out attempts and retries the transient network failure', async () => {
  let calls = 0
  const waits = []
  const client = createHttpClient(config({
    request: { ...config().request, timeoutMs: 10, retries: 1, backoffMs: 0 },
  }), {
    fetchImpl: async (_url, { signal }) => new Promise((_resolve, reject) => {
      calls += 1
      signal.addEventListener('abort', () => reject(new Error('request timed out')), { once: true })
    }),
    sleep: async (ms) => waits.push(ms),
  })

  await assert.rejects(
    client.request('https://example.test/slow'),
    (error) => error.code === 'HTTP_ERROR' && error.details.attempts === 2,
  )
  assert.equal(calls, 2)
  assert.deepEqual(waits, [0])
})
