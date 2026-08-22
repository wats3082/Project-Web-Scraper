import { useMemo, useRef, useState } from 'react'
import './App.css'
import {
  demoConfig,
  demoPages,
  demoRecords,
  pipelineStages,
  serializePreview,
} from './demoData.js'

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function Icon({ name }) {
  const paths = {
    shield: <path d="M12 3 5 6v5c0 4.4 2.8 8.4 7 10 4.2-1.6 7-5.6 7-10V6l-7-3Zm-3 9 2 2 4-4" />,
    play: <path d="m9 7 8 5-8 5V7Z" />,
    check: <path d="m5 12 4 4L19 6" />,
    code: <path d="m8 9-4 3 4 3m8-6 4 3-4 3m-3-9-2 12" />,
    database: <><ellipse cx="12" cy="5" rx="7" ry="3" /><path d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" /></>,
    github: <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3.3-.4 6.8-1.6 6.8-7.4A5.8 5.8 0 0 0 19.3 3 5.4 5.4 0 0 0 19.1 0S17.9-.4 15 1.5a14 14 0 0 0-6 0C6.1-.4 4.9 0 4.9 0a5.4 5.4 0 0 0-.2 3A5.8 5.8 0 0 0 3.2 7c0 5.8 3.5 7 6.8 7.4A4.8 4.8 0 0 0 9 18v4m-4-5s-2 0-3-3c0 0-1.5-1-1.5-1" />,
  }
  return <svg aria-hidden="true" className="icon" viewBox="0 0 24 24">{paths[name]}</svg>
}

function App() {
  const [status, setStatus] = useState('idle')
  const [stage, setStage] = useState(-1)
  const [pages, setPages] = useState(0)
  const [records, setRecords] = useState([])
  const [format, setFormat] = useState('jsonl')
  const [scenario, setScenario] = useState('success')
  const [error, setError] = useState('')
  const runId = useRef(0)
  const preview = useMemo(() => serializePreview(records, format), [records, format])
  const progress = status === 'complete' ? 100 : Math.max(0, ((stage + 1) / pipelineStages.length) * 100)

  const runDemo = async () => {
    const id = ++runId.current
    setStatus('running')
    setStage(0)
    setPages(0)
    setRecords([])
    setError('')

    for (let index = 0; index < pipelineStages.length; index += 1) {
      if (runId.current !== id) return
      setStage(index)
      await wait(520)

      if (scenario === 'selector-drift' && index === 2) {
        setStatus('failed')
        setError('PARSE_ERROR: No records matched selectors.items on page 1. The run stopped before export.')
        return
      }
      if (index === 2) {
        setPages(1)
        setRecords(demoRecords.slice(0, 2))
      }
      if (index === 3) {
        setPages(2)
        setRecords(demoRecords)
      }
    }
    setStatus('complete')
  }

  const resetDemo = () => {
    runId.current += 1
    setStatus('idle')
    setStage(-1)
    setPages(0)
    setRecords([])
    setError('')
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#demo">Skip to demo</a>
      <header className="site-header">
        <a className="brand" href="./" aria-label="Pipeline Studio home">
          <span className="brand-mark"><Icon name="database" /></span>
          <span>Pipeline Studio</span>
        </a>
        <div className="header-actions">
          <span className="simulation-label"><span className="pulse" /> Fixture simulation</span>
          <a className="github-link" href="https://github.com/wats3082/Project-Web-Scraper" target="_blank" rel="noreferrer">
            <Icon name="github" /> View source
          </a>
        </div>
      </header>

      <main id="demo">
        <section className="hero">
          <div>
            <p className="eyebrow">Data engineering portfolio</p>
            <h1>From HTML to trusted data,<br /><span>with every step visible.</span></h1>
            <p className="hero-copy">
              Explore a deterministic crawl using bundled catalog fixtures. See policy checks,
              parsing, normalization, provenance, and export—without making a live-site request.
            </p>
            <div className="hero-actions">
              <button className="primary-button" type="button" onClick={runDemo} disabled={status === 'running'}>
                <Icon name="play" /> {status === 'running' ? 'Simulation running…' : 'Run pipeline demo'}
              </button>
              {status !== 'idle' && (
                <button className="secondary-button" type="button" onClick={resetDemo}>Reset</button>
              )}
            </div>
          </div>
          <aside className="trust-card" aria-label="Demo safety guarantees">
            <div className="trust-icon"><Icon name="shield" /></div>
            <div>
              <strong>Safe by design</strong>
              <p>No arbitrary URLs, credentials, or browser-side scraping. The production CLI remains separate.</p>
            </div>
          </aside>
        </section>

        <section className="workspace" aria-label="Pipeline demo workspace">
          <aside className="config-panel">
            <div className="section-heading">
              <div>
                <p className="section-kicker">Input</p>
                <h2>Run configuration</h2>
              </div>
              <span className="valid-chip"><Icon name="check" /> Valid</span>
            </div>

            <label className="field-label" htmlFor="fixture">Bundled source fixture</label>
            <div className="locked-field" id="fixture">
              <span>{demoConfig.source}</span>
              <span className="lock-tag">LOCAL</span>
            </div>

            <div className="config-grid">
              <div>
                <span className="field-label">Pages</span>
                <strong>{demoConfig.maxPages} max</strong>
              </div>
              <div>
                <span className="field-label">Rate limit</span>
                <strong>{demoConfig.delayMs} ms</strong>
              </div>
              <div>
                <span className="field-label">Retries</span>
                <strong>{demoConfig.retries} bounded</strong>
              </div>
              <div>
                <span className="field-label">Robots policy</span>
                <strong>Enforced</strong>
              </div>
            </div>

            <div className="selector-block">
              <div className="selector-title"><Icon name="code" /> Selector map</div>
              <code>
                <span>items</span> {demoConfig.selectors.items}<br />
                <span>title</span> {demoConfig.selectors.title}<br />
                <span>price</span> {demoConfig.selectors.price}<br />
                <span>next</span> {demoConfig.selectors.next}
              </code>
            </div>

            <label className="field-label" htmlFor="scenario">Demo scenario</label>
            <select id="scenario" value={scenario} onChange={(event) => { setScenario(event.target.value); resetDemo() }}>
              <option value="success">Successful two-page crawl</option>
              <option value="selector-drift">Selector drift error</option>
            </select>
          </aside>

          <div className="run-panel">
            <div className="run-topline">
              <div>
                <p className="section-kicker">Execution</p>
                <h2>Pipeline run</h2>
              </div>
              <span className={`run-status status-${status}`}>
                <span className="status-dot" />
                {status === 'idle' ? 'Ready' : status === 'running' ? 'Running' : status === 'complete' ? 'Complete' : 'Stopped'}
              </span>
            </div>

            <div className="progress-track" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
            <p className="sr-only" role="status" aria-live="polite">
              {status === 'idle' ? 'Demo ready' : status === 'failed' ? error : `${status}. ${Math.round(progress)} percent complete.`}
            </p>

            <ol className="stage-list">
              {pipelineStages.map((item, index) => {
                const complete = status === 'complete' || index < stage
                const active = status === 'running' && index === stage
                const failed = status === 'failed' && index === stage
                return (
                  <li className={complete ? 'stage-complete' : active ? 'stage-active' : failed ? 'stage-failed' : ''} key={item.title}>
                    <span className="stage-marker">{complete ? <Icon name="check" /> : index + 1}</span>
                    <div>
                      <strong>{item.title}</strong>
                      <span>{item.description}</span>
                    </div>
                    {active && <span className="active-label">In progress</span>}
                    {complete && <span className="complete-label">Done</span>}
                  </li>
                )
              })}
            </ol>

            {error && <div className="error-banner" role="alert"><strong>Run failed safely</strong><span>{error}</span></div>}

            <div className="run-metrics" aria-label="Current run metrics">
              <div><span>Pages visited</span><strong>{pages} / {demoPages.length}</strong></div>
              <div><span>Records normalized</span><strong>{records.length}</strong></div>
              <div><span>Network requests</span><strong>0</strong></div>
            </div>
          </div>
        </section>

        <section className="results-section">
          <div className="section-heading results-heading">
            <div>
              <p className="section-kicker">Output</p>
              <h2>Normalized records</h2>
              <p>Schema-consistent fixture data enriched with source and collection metadata.</p>
            </div>
            <span className="record-count">{records.length} records</span>
          </div>

          <div className="table-frame">
            <table>
              <thead><tr><th>Title</th><th>Price</th><th>Availability</th><th>Source page</th><th>Collected at</th></tr></thead>
              <tbody>
                {records.length ? records.map((record) => (
                  <tr key={record.product_url}>
                    <td><strong>{record.title}</strong><span className="record-url">{record.product_url}</span></td>
                    <td>${record.price.toFixed(2)}</td>
                    <td><span className="availability"><span />{record.availability}</span></td>
                    <td><code>page-{record.source_page}.html</code></td>
                    <td>{record.scraped_at.replace('T', ' ').replace('.000Z', ' UTC')}</td>
                  </tr>
                )) : (
                  <tr><td className="empty-state" colSpan="5">Run the simulation to populate normalized records.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="export-section">
          <div className="export-copy">
            <p className="section-kicker">Delivery</p>
            <h2>Export preview</h2>
            <p>Review the exact structured output the CLI writes downstream. Provenance fields travel with every record.</p>
            <div className="format-switch" aria-label="Export preview format">
              <button className={format === 'jsonl' ? 'selected' : ''} type="button" onClick={() => setFormat('jsonl')}>JSONL</button>
              <button className={format === 'csv' ? 'selected' : ''} type="button" onClick={() => setFormat('csv')}>CSV</button>
            </div>
          </div>
          <pre aria-label={`${format.toUpperCase()} export preview`}>
            <code>{preview || `// ${format.toUpperCase()} preview appears after a successful parse`}</code>
          </pre>
        </section>
      </main>

      <footer>
        <span>Built as a transparent, testable data pipeline.</span>
        <span>Fixture data only · No live browser scraping</span>
      </footer>
    </div>
  )
}

export default App
