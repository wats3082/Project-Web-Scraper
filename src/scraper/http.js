import { HttpError } from './errors.js'

const retryable = (status) => status === 429 || status >= 500

const retryAfterMs = (response, now) => {
  const value = response.headers.get('retry-after')
  if (!value) return 0
  const seconds = Number(value)
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000)
  const date = Date.parse(value)
  return Number.isNaN(date) ? 0 : Math.max(0, date - now())
}

export function createHttpClient(config, deps = {}) {
  const fetchImpl = deps.fetchImpl ?? fetch
  const sleep = deps.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)))
  const now = deps.now ?? Date.now
  const emit = deps.emit ?? (() => {})
  let lastRequestAt = null
  let minDelayMs = config.request.delayMs

  const setMinDelay = (delayMs) => {
    minDelayMs = Math.max(minDelayMs, delayMs)
  }

  const request = async (url, { retries = config.request.retries } = {}) => {
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      if (lastRequestAt !== null) {
        const wait = Math.max(0, minDelayMs - (now() - lastRequestAt))
        if (wait) await sleep(wait)
      }
      lastRequestAt = now()

      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), config.request.timeoutMs)
      let response
      try {
        emit('request.started', { url: String(url), attempt: attempt + 1 })
        response = await fetchImpl(url, {
          headers: { 'user-agent': config.userAgent, accept: 'text/html,application/xhtml+xml' },
          signal: controller.signal,
        })
      } catch (cause) {
        if (attempt === retries) {
          throw new HttpError(`Request failed after ${attempt + 1} attempt(s): ${url}`, {
            url: String(url),
            attempts: attempt + 1,
            cause: cause.message,
          })
        }
        const wait = Math.min(config.request.backoffMs * 2 ** attempt, config.request.maxBackoffMs)
        emit('request.retrying', { url: String(url), attempt: attempt + 1, waitMs: wait, reason: cause.message })
        await sleep(wait)
        continue
      } finally {
        clearTimeout(timer)
      }

      if (response.ok) {
        emit('request.completed', { url: String(url), status: response.status, attempt: attempt + 1 })
        return response
      }
      if (!retryable(response.status) || attempt === retries) {
        throw new HttpError(`HTTP ${response.status} for ${url}`, {
          url: String(url),
          status: response.status,
          attempts: attempt + 1,
        })
      }

      const exponential = Math.min(config.request.backoffMs * 2 ** attempt, config.request.maxBackoffMs)
      const wait = Math.min(Math.max(exponential, retryAfterMs(response, now)), config.request.maxBackoffMs)
      emit('request.retrying', { url: String(url), status: response.status, attempt: attempt + 1, waitMs: wait })
      await sleep(wait)
    }
    throw new HttpError(`Request attempts exhausted: ${url}`, { url: String(url) })
  }

  return { request, setMinDelay }
}
