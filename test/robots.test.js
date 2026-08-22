import test from 'node:test'
import assert from 'node:assert/strict'
import { parseRobots, robotsAllows, robotsDelay } from '../src/scraper/robots.js'

test('uses the most specific robots rule and crawl delay', () => {
  const rules = parseRobots(`
    User-agent: *
    Disallow: /private
    Allow: /private/public
    Crawl-delay: 2
  `, 'TestBot/1.0')

  assert.equal(robotsAllows(rules, new URL('https://example.test/private/data')), false)
  assert.equal(robotsAllows(rules, new URL('https://example.test/private/public/data')), true)
  assert.equal(robotsDelay(rules), 2000)
})

test('supports wildcard and end-anchored robots paths', () => {
  const rules = parseRobots(`
    User-agent: *
    Disallow: /*.pdf$
  `, 'TestBot/1.0')

  assert.equal(robotsAllows(rules, new URL('https://example.test/files/report.pdf')), false)
  assert.equal(robotsAllows(rules, new URL('https://example.test/files/report.pdf?download=1')), true)
})

test('prefers a named user-agent group over wildcard rules', () => {
  const rules = parseRobots(`
    User-agent: *
    Disallow: /
    User-agent: TestBot
    Allow: /
  `, 'TestBot/1.0')

  assert.equal(robotsAllows(rules, new URL('https://example.test/catalog')), true)
})
