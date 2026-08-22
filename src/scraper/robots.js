const cleanLine = (line) => line.replace(/#.*$/, '').trim()

export function parseRobots(text, userAgent) {
  const target = userAgent.toLowerCase().split(/[ /]/)[0]
  const groups = []
  let agents = []
  let rules = []

  const flush = () => {
    if (agents.length) groups.push({ agents, rules })
    agents = []
    rules = []
  }

  for (const raw of text.split(/\r?\n/)) {
    const line = cleanLine(raw)
    if (!line) continue
    const colon = line.indexOf(':')
    if (colon < 0) continue
    const key = line.slice(0, colon).trim().toLowerCase()
    const value = line.slice(colon + 1).trim()

    if (key === 'user-agent') {
      if (rules.length) flush()
      agents.push(value.toLowerCase())
    } else if (agents.length && ['allow', 'disallow'].includes(key)) {
      if (value) rules.push({ allow: key === 'allow', path: value })
    } else if (agents.length && key === 'crawl-delay') {
      const seconds = Number(value)
      if (Number.isFinite(seconds) && seconds >= 0) rules.push({ crawlDelayMs: seconds * 1000 })
    }
  }
  flush()

  const exact = groups.filter(({ agents: values }) => values.includes(target))
  const matched = exact.length ? exact : groups.filter(({ agents: values }) => values.includes('*'))
  return matched.flatMap(({ rules: values }) => values)
}

const rulePattern = (path) => {
  const anchored = path.endsWith('$')
  const source = (anchored ? path.slice(0, -1) : path)
    .replace(/[\\^$+?.()|[\]{}]/g, '\\$&')
    .replaceAll('*', '.*')
  return new RegExp(`^${source}${anchored ? '$' : ''}`)
}

export function robotsAllows(rules, url) {
  const path = `${url.pathname}${url.search}`
  const matches = rules
    .filter((rule) => rule.path && rulePattern(rule.path).test(path))
    .sort((a, b) => b.path.length - a.path.length || Number(b.allow) - Number(a.allow))
  return matches[0]?.allow ?? true
}

export function robotsDelay(rules) {
  return Math.max(0, ...rules.map((rule) => rule.crawlDelayMs ?? 0))
}
