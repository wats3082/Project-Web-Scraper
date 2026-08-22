import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

const csvValue = (value) => {
  if (value === null || value === undefined) return ''
  const text = String(value)
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

export function serialize(records, format) {
  if (format === 'jsonl') return records.map((record) => JSON.stringify(record)).join('\n') + (records.length ? '\n' : '')
  const headers = [...new Set(records.flatMap((record) => Object.keys(record)))]
  if (!headers.length) return ''
  return [
    headers.map(csvValue).join(','),
    ...records.map((record) => headers.map((header) => csvValue(record[header])).join(',')),
  ].join('\n') + '\n'
}

export async function exportRecords(records, output) {
  await mkdir(dirname(output.path), { recursive: true })
  await writeFile(output.path, serialize(records, output.format), 'utf8')
  return { path: output.path, format: output.format, records: records.length }
}
