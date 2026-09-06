# Configurable Web Scraper Pipeline

A portfolio data-engineering project that turns HTML sources into normalized, analysis-ready JSONL or CSV. It pairs the existing React/Vite operations dashboard with a tested Node.js extraction pipeline designed around bounded work, reproducibility, and respectful collection.

**Live interactive demo:** https://wats3082.github.io/Project-Web-Scraper/

## Browser demo

The GitHub Pages frontend is an explicitly simulated view of the production pipeline. Choose from several fixture-backed scraper jobs to inspect:

- validated configuration and bounded reliability controls;
- crawl/policy/parse/export progress with accessible live status;
- normalized records with fixture, run, source-page, and collection provenance;
- deterministic JSONL and CSV previews with client-only copy/download controls;
- a selector-drift scenario with diagnosis, recovery guidance, and a fixture-safe retry.

The browser never accepts arbitrary URLs and makes **zero crawl requests**. All source pages and normalized records are bundled fixture data, so the demo is reproducible and safe to host as a static site. It does not claim that browser CORS behavior or the simulation itself validates a target site's access policy. Use the Node CLI below for authorized real-world collection.

## Pipeline architecture

```text
JSON configuration
       |
       v
validate -> robots policy -> rate-limited HTTP client -> CSS parser
                    |                 |                    |
                    |            retry/backoff         normalize
                    |                 |                    |
                    +-----------------+--------------------+
                                      |
                           provenance-enriched records
                                      |
                               JSONL / CSV export
```

The scraper provides four cohesive capabilities:

1. **Configurable jobs:** A job has a stable lowercase `job.id`, a human-readable `job.name`, and one HTTP(S) `job.targetUrl`. Each execution reports `running`, `completed`, or `failed` status events with a structured summary or error.
2. **Configuration-driven extraction:** Cheerio-compatible CSS selectors define records and typed fields (`string`, `number`, or resolved `url`). Optional same-origin pagination is capped at 100 pages and rejects cycles.
3. **Responsible, resilient collection:** `robots.txt` is checked by default, configured and robots-provided delays are honored, request timeouts are explicit, and only network failures, HTTP 429, and HTTP 5xx responses receive bounded exponential retries.
4. **Traceable output:** Every record includes `_job_id`, `_source_url`, and `_scraped_at`; exports are machine-friendly JSONL or RFC-style escaped CSV; newline-delimited JSON events expose requests, retries, job status, parsed-page counts, completion, and failures on stderr.

## Setup

Requires Node.js 22+.

```bash
npm ci
npm test
npm run build
```

## Usage

Copy `examples/books.config.json`, update the source and selectors, then run:

```bash
npm run scrape -- examples/books.config.json
```

The example targets [Books to Scrape](https://books.toscrape.com/), a sandbox intentionally published for scraping practice. Output defaults to `output/books.jsonl`; progress events are emitted separately to stderr so the data stream stays clean.

New configurations use the job-oriented shape in `examples/books.config.json`. `startUrl` and `selectors` remain accepted aliases for the earlier shape, preserving existing configurations. The CLI writes a JSON job result to stdout after a successful export; operational events remain newline-delimited JSON on stderr.

Key configuration controls:

| Setting | Purpose |
| --- | --- |
| `job.id` / `job.name` | Stable job identifier and readable label |
| `job.targetUrl` | First HTTP(S) page |
| `maxPages` | Hard pagination ceiling, 1-100 |
| `extraction.items` | CSS selector for each source record |
| `extraction.fields` | Field selectors, attributes, types, and required flags |
| `extraction.nextPage` | Optional next-link selector and attribute |
| `request.delayMs` | Minimum spacing between all requests |
| `request.timeoutMs` | Per-attempt timeout |
| `request.retries` | Retry ceiling, 0-10 |
| `request.backoffMs` / `maxBackoffMs` | Exponential backoff bounds |
| `request.respectRobots` | Robots enforcement; defaults to `true` |
| `output.format` / `output.path` | `jsonl` or `csv` destination |

Example field:

```json
"price": {
  "selector": ".price_color",
  "type": "number",
  "required": true
}
```

Failures return a non-zero exit code and structured events such as:

```json
{"event":"job.failed","jobId":"books-catalog","status":"failed","error":{"code":"ROBOTS_DENIED","message":"robots.txt disallows scraping ..."}}
```

`src/scraper/job.js` owns validation, status, pipeline invocation, and output delivery. The extraction pipeline stays independent of output delivery, so another output writer or future scheduler can call the same job boundary without changing selector parsing or crawl policy.

## Reliability tradeoffs

- Robots policy is **fail closed**: an unavailable robots file is treated as an explicit failure; HTTP 404 means no published rules.
- Pagination remains on the starting origin. Cross-origin next links and cycles stop the run instead of silently expanding scope.
- Retries exclude permanent HTTP 4xx failures. `Retry-After` is honored but capped by `maxBackoffMs`.
- Records are currently buffered and written in one shot, favoring simple portfolio-scale operation over low memory usage. Large-scale operation should write batches to object storage and checkpoint page state.
- CSS selectors are transparent and testable but source-layout changes require configuration updates. Required fields turn schema drift into a visible error rather than incomplete data.
- The CLI is intentionally single-worker. This makes rate guarantees predictable; production throughput would use a per-origin queue rather than unconstrained concurrency.

## Ethical and legal constraints

Use this project only on content you are authorized to collect. Review the site's terms, license, privacy obligations, and applicable law before running it. Keep robots enforcement enabled, identify the client honestly, choose conservative delays, minimize retained personal data, and stop when a source signals denial or throttling. The pipeline does not bypass authentication, CAPTCHAs, paywalls, anti-bot controls, or other access protections.

## Testing

`npm test` uses Node's test runner, local HTML fixtures, and mocked HTTP responses. It never depends on a live site. Coverage includes typed normalization, relative URL resolution, pagination, robots precedence and denial, bounded retry/backoff, explicit HTTP failures, safe defaults, and deterministic JSONL/CSV serialization.

## Interview talking points

- Converted a static scraper dashboard into a configuration-driven ETL pipeline with source provenance and structured outputs.
- Designed bounded reliability controls: fail-closed robots checks, per-origin pacing, retry classification, capped backoff, timeouts, pagination limits, and cycle detection.
- Isolated extraction, transport, policy, normalization, and export concerns so each can be tested deterministically without network access.
- Identified scaling seams: page checkpoints, streaming/batched sinks, schema versioning, and per-origin work queues for an AWS SQS/Lambda/S3 implementation.