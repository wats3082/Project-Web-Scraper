import * as cheerio from 'cheerio'
import { ParseError } from './errors.js'

const normalize = (raw, spec, pageUrl) => {
  const value = raw.replace(/\s+/g, ' ').trim()
  if (!value) return null
  if (spec.type === 'number') {
    const number = Number(value.replace(/[^0-9.+-]/g, ''))
    if (!Number.isFinite(number)) throw new Error(`cannot convert "${value}" to a number`)
    return number
  }
  if (spec.type === 'url') return new URL(value, pageUrl).href
  return value
}

export function parsePage(html, pageUrl, selectors) {
  const $ = cheerio.load(html)
  const records = []

  $(selectors.items).each((index, element) => {
    const record = {}
    for (const [name, spec] of Object.entries(selectors.fields)) {
      const node = spec.selector ? $(element).find(spec.selector).first() : $(element)
      const raw = spec.attr ? node.attr(spec.attr) ?? '' : node.text()
      try {
        const value = normalize(raw, spec, pageUrl)
        if (value === null && spec.required) {
          throw new Error('required value is missing')
        }
        record[name] = value
      } catch (cause) {
        throw new ParseError(`Invalid field "${name}" in item ${index + 1}: ${cause.message}`, {
          field: name,
          item: index + 1,
          pageUrl,
        })
      }
    }
    records.push(record)
  })

  const nextValue = selectors.nextPage
    ? $(selectors.nextPage.selector).first().attr(selectors.nextPage.attr ?? 'href')
    : null
  return {
    records,
    nextUrl: nextValue ? new URL(nextValue, pageUrl).href : null,
  }
}
