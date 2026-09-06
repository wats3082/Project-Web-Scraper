import { useMemo, useRef, useState } from 'react'
import './App.css'
import {
  demoConfig,
  demoPages,
  demoRecords,
  getExportMeta,
  getSelectorDriftDiagnostic,
  pipelineStages,
} from './demoData.js'

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function Icon({ name }) {
  const paths = {
    shield: <path d="M12 3 5 6v5c0 4.4 2.8 8.4 7 10 4.2-1.6 7-5.6 7-10V6l-7-3Zm-3 9 2 2 4-4" />,
    play: <path d="m9 7 8 5-8 5V7Z" />,
    check: <path d="m5 12 4 4L19 6" />,
    copy: <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3" /></>,
    download: <path d="M12 3v12m-4-4 4 4 4-4M5 21h14" />,
    code: <path d="m8 9-4 3 4 3m8-6 4 3-4 3m-3-9-2 12" />,
    database: <><ellipse cx="12" cy="5" rx="7" ry="3" /><path d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" /></>,
    github: <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3.3-.4 6.8-1.6 6.8-7.4A5.8 5.8 0 0 0 19.3 3 5.4 5.4 0 0 0 19.1 0S17.9-.4 15 1.5a14 14 0 0 0-6 0C6.1-.4 4.9 0 4.9 0a5.4 5.4 0 0 0-.2 3A5.8 5.8 0 0 0 3.2 7c0 5.8 3.5 7 6.8 7.4A4.8 4.8 0 0 0 9 18v4m-4-5s-2 0-3-3c0 0-1.5-1-1.5-1" />,
    terminal: <><path d="m5 7 4 4-4 4m6 1h6" /><rect x="3" y="4" width="18" height="16" rx="2" /></>,
    arrow: <path d="M5 12h13m-5-5 5 5-5 5" />,
    reset: <path d="M20 11a8.1 8.1 0 1 0 .1 2M20 4v7h-7" />,
    lock: <><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
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
  const [diagnostic, setDiagnostic] = useState(null)
  const [copyStatus, setCopyStatus] = useState('')
  const runId = useRef(0)
  const exportMeta = useMemo(() => getExportMeta(records, format), [records, format])
  const progress = status === 'complete' ? 100 : Math.max(0, ((stage + 1) / pipelineStages.length) * 100)
  const stageEvent = stage < 0 ? 'awaiting.run' : pipelineStages[stage].event

  const runDemo = async (runScenario = scenario) => {
    const id = ++runId.current
    setStatus('running')
    setStage(0)
    setPages(0)
    setRecords([])
    setDiagnostic(null)
    setCopyStatus('')

    for (let index = 0; index < pipelineStages.length; index += 1) {
      if (runId.current !== id) return
      setStage(index)
      await wait(520)

      if (runScenario === 'selector-drift' && index === 2) {
        setStatus('failed')
        setDiagnostic(getSelectorDriftDiagnostic(demoConfig.extraction.items))
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
    setDiagnostic(null)
    setCopyStatus('')
  }

  const copyExport = async () => {
    if (!exportMeta.content) return
    try {
      await navigator.clipboard.writeText(exportMeta.content)
      setCopyStatus(`${format.toUpperCase()} copied to clipboard.`)
    } catch {
      setCopyStatus('Clipboard permission was denied. Use Download instead.')
    }
  }

  const downloadExport = () => {
    if (!exportMeta.content) return
    const url = URL.createObjectURL(new Blob([exportMeta.content], { type: `${exportMeta.mime};charset=utf-8` }))
    const link = document.createElement('a')
    link.href = url
    link.download = exportMeta.filename
    link.click()
    URL.revokeObjectURL(url)
    setCopyStatus(`${exportMeta.filename} download started.`)
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#workspace">Skip to workspace</a>
      <header className="site-header">
        <a className="brand" href="./" aria-label="Pipeline Studio home">
          <span className="brand-mark"><Icon name="database" /></span>
          <span>Pipeline Studio</span>
        </a>
        <div className="header-actions">
          <span className="mode-label"><span className="mode-dot" /> Safe fixture demo</span>
          <a className="github-link" href="https://github.com/wats3082/Project-Web-Scraper" target="_blank" rel="noreferrer">
            <Icon name="github" /><span>Source code</span>
          </a>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="hero-overline">A transparent scraper pipeline</p>
            <h1>Collect web data<br />with a <em>clear trail.</em></h1>
            <p>
              Follow a fully deterministic catalog run from validated extraction rules to
              provenance-rich records. This hosted experience only uses bundled fixtures.
            </p>
            <div className="hero-actions">
              <button className="primary-button" type="button" onClick={() => runDemo()} disabled={status === 'running'}>
                <Icon name="play" />{status === 'running' ? 'Running fixture demo...' : 'Run the fixture demo'}
              </button>
              <a className="text-link" href="#cli"><Icon name="terminal" /> Use the real CLI <Icon name="arrow" /></a>
            </div>
          </div>
          <div className="hero-proof" aria-label="Demo scope">
            <span className="proof-mark"><Icon name="shield" /></span>
            <div>
              <strong>Nothing leaves your browser</strong>
              <p>0 live requests · no arbitrary URLs · bundled catalog data only</p>
            </div>
          </div>
        </section>

        <nav className="workflow-nav" aria-label="Demo steps">
          <a href="#configuration"><span>01</span>Review the job</a>
          <a href="#execution"><span>02</span>Run the fixture</a>
          <a href="#results"><span>03</span>Inspect the output</a>
        </nav>

        <section className="workspace" id="workspace" aria-label="Pipeline demo workspace">
          <aside className="config-panel" id="configuration">
            <div className="panel-heading">
              <div>
                <p className="panel-label">Configured job</p>
                <h2>{demoConfig.job.name}</h2>
              </div>
              <span className="valid-chip"><Icon name="check" /> Ready</span>
            </div>

            <div className="job-id"><span>job.id</span><code>{demoConfig.job.id}</code></div>
            <div className="source-field">
              <span className="field-label">Target fixture</span>
              <strong>{demoConfig.source}</strong>
              <span><Icon name="lock" /> Local only</span>
            </div>

            <div className="config-rule" />
            <div className="settings-grid" aria-label="Collection controls">
              <div><span>Pages</span><strong>{demoConfig.maxPages} max</strong></div>
              <div><span>Delay</span><strong>{demoConfig.delayMs} ms</strong></div>
              <div><span>Retries</span><strong>{demoConfig.retries} attempts</strong></div>
              <div><span>Timeout</span><strong>{demoConfig.timeoutMs / 1000} sec</strong></div>
            </div>

            <div className="extraction-map">
              <div className="map-header"><Icon name="code" /><span>Extraction rules</span></div>
              <dl>
                <div><dt>items</dt><dd>{demoConfig.extraction.items}</dd></div>
                <div><dt>title</dt><dd>{demoConfig.extraction.fields.title}</dd></div>
                <div><dt>price</dt><dd>{demoConfig.extraction.fields.price}</dd></div>
                <div><dt>next</dt><dd>{demoConfig.extraction.nextPage}</dd></div>
              </dl>
            </div>

            <label className="field-label" htmlFor="scenario">Try an outcome</label>
            <select id="scenario" value={scenario} onChange={(event) => { setScenario(event.target.value); resetDemo() }}>
              <option value="success">Successful two-page crawl</option>
              <option value="selector-drift">Selector drift error</option>
            </select>
            <p className="panel-help">The CLI validates this same job shape before making an authorized request.</p>
          </aside>

          <section className="run-panel" id="execution">
            <div className="run-topline">
              <div>
                <p className="panel-label">Live walkthrough</p>
                <h2>Watch the job move</h2>
              </div>
              <span className={`run-status status-${status}`}>
                <span className="status-dot" />
                {status === 'idle' ? 'Ready to run' : status === 'running' ? 'Running' : status === 'complete' ? 'Complete' : 'Needs attention'}
              </span>
            </div>

            <div className="run-summary">
              <div>
                <span>Current event</span>
                <code>{stageEvent}</code>
              </div>
              <div>
                <span>Scope</span>
                <strong>Fixture only</strong>
              </div>
              <div>
                <span>Progress</span>
                <strong>{Math.round(progress)}%</strong>
              </div>
            </div>

            <div className="progress-track" role="progressbar" aria-label="Pipeline completion" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(progress)}>
              <span style={{ transform: `scaleX(${progress / 100})` }} />
            </div>
            <p className="sr-only" role="status" aria-live="polite">
              {status === 'idle' ? 'Demo ready' : status === 'failed' ? `${diagnostic?.code ?? 'PARSE_ERROR'}: selector drift detected` : `${status}. ${Math.round(progress)} percent complete.`}
            </p>

            <ol className="stage-list">
              {pipelineStages.map((item, index) => {
                const complete = status === 'complete' || index < stage
                const active = status === 'running' && index === stage
                const failed = status === 'failed' && index === stage
                return (
                  <li className={complete ? 'stage-complete' : active ? 'stage-active' : failed ? 'stage-failed' : ''} key={item.title}>
                    <span className="stage-marker">{complete ? <Icon name="check" /> : String(index + 1).padStart(2, '0')}</span>
                    <div><strong>{item.title}</strong><span>{item.description}</span></div>
                    {active && <span className="active-label">Working</span>}
                    {complete && <span className="complete-label">Done</span>}
                  </li>
                )
              })}
            </ol>

            {diagnostic && (
              <div className="error-banner" role="alert">
                <div>
                  <strong>{diagnostic.code}: selector drift detected</strong>
                  <p>Page {diagnostic.page} returned no records, so export remains unavailable.</p>
                </div>
                <code>{diagnostic.selector}</code>
                <p><b>Observed:</b> {diagnostic.observed}</p>
                <ol>{diagnostic.guidance.map((step) => <li key={step}>{step}</li>)}</ol>
                <button className="recovery-button" type="button" onClick={() => { setScenario('success'); runDemo('success') }}>
                  <Icon name="reset" /> Load compatible selector and retry
                </button>
              </div>
            )}

            <div className="run-metrics" aria-label="Current run metrics">
              <div><span>Pages visited</span><strong>{pages} <small>/ {demoPages.length}</small></strong></div>
              <div><span>Records normalized</span><strong>{records.length}</strong></div>
              <div><span>Network requests</span><strong>0</strong></div>
            </div>
          </section>
        </section>

        <section className="results-section" id="results">
          <div className="results-heading">
            <div>
              <p className="panel-label">Collected records</p>
              <h2>Clean data with its context intact.</h2>
            </div>
            {status !== 'idle' && <button className="quiet-button" type="button" onClick={resetDemo}><Icon name="reset" /> Reset demo</button>}
          </div>

          {records.length ? (
            <>
              <div className="provenance-strip" aria-label="Record provenance summary">
                <div><span>Snapshot</span><strong>catalog-v1</strong></div>
                <div><span>Run ID</span><strong>demo-20260822-160000</strong></div>
                <div><span>Collected</span><strong>2026-08-22 · 16:00 UTC</strong></div>
                <div><span>Lineage</span><strong>100% complete</strong></div>
              </div>
              <div className="table-frame">
                <table>
                  <thead><tr><th>Title</th><th>Price</th><th>Availability</th><th>Source fixture</th><th>Collected at</th></tr></thead>
                  <tbody>{records.map((record) => (
                    <tr key={record.product_url}>
                      <td><strong>{record.title}</strong><span className="record-url">{record.product_url}</span></td>
                      <td>${record.price.toFixed(2)}</td>
                      <td><span className="availability"><span />{record.availability}</span></td>
                      <td><code>{record.source_fixture}</code></td>
                      <td>{record.scraped_at.replace('T', ' ').replace('.000Z', ' UTC')}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="results-empty">
              <span className="empty-icon"><Icon name="database" /></span>
              <div><strong>Your normalized records will appear here.</strong><p>Run the fixture demo to inspect data alongside its source, timestamp, and run context.</p></div>
              <button className="secondary-button" type="button" onClick={() => runDemo()} disabled={status === 'running'}><Icon name="play" /> Run demo</button>
            </div>
          )}
        </section>

        <section className="export-section">
          <div className="export-copy">
            <p className="panel-label">Export ready</p>
            <h2>Take the exact output with you.</h2>
            <p>Switch formats, inspect the bytes, then copy or download the fixture result locally.</p>
            <div className="format-switch" aria-label="Export preview format">
              <button className={format === 'jsonl' ? 'selected' : ''} type="button" aria-pressed={format === 'jsonl'} onClick={() => { setFormat('jsonl'); setCopyStatus('') }}>JSONL</button>
              <button className={format === 'csv' ? 'selected' : ''} type="button" aria-pressed={format === 'csv'} onClick={() => { setFormat('csv'); setCopyStatus('') }}>CSV</button>
            </div>
            <div className="export-actions">
              <button type="button" onClick={copyExport} disabled={!exportMeta.content}><Icon name="copy" /> Copy</button>
              <button type="button" onClick={downloadExport} disabled={!exportMeta.content}><Icon name="download" /> Download</button>
            </div>
            <p className="export-meta" aria-live="polite">{copyStatus || (exportMeta.content ? `${exportMeta.filename} · ${exportMeta.bytes.toLocaleString()} bytes · ${records.length} rows` : 'Run the demo to enable export.')}</p>
          </div>
          <pre aria-label={`${format.toUpperCase()} export preview`}><code>{exportMeta.content || `// ${format.toUpperCase()} preview appears after a successful run`}</code></pre>
        </section>

        <section className="cli-section" id="cli">
          <div><p className="panel-label">When you are ready</p><h2>Run authorized collection from the CLI.</h2></div>
          <div className="command-line"><Icon name="terminal" /><code>npm run scrape -- examples/books.config.json</code></div>
          <a className="text-link" href="https://github.com/wats3082/Project-Web-Scraper#usage" target="_blank" rel="noreferrer">Read the setup guide <Icon name="arrow" /></a>
        </section>
      </main>

      <footer>
        <span>Configurable web-data collection with transparent safeguards.</span>
        <span>Fixture demo · No live browser scraping</span>
      </footer>
    </div>
  )
}

export default App
