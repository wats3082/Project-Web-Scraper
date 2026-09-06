import { useMemo, useRef, useState } from 'react'
import './App.css'
import {
  demoScrapers,
  getExportMeta,
  getSelectorDriftDiagnostic,
  pipelineStages,
} from './demoData.js'

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const initialStates = () => Object.fromEntries(demoScrapers.map((scraper) => [scraper.job.id, 'idle']))

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

const statusLabel = (status) => ({
  idle: 'Ready',
  running: 'Running',
  complete: 'Complete',
  failed: 'Needs attention',
}[status])

function App() {
  const [activeDemoId, setActiveDemoId] = useState(demoScrapers[0].job.id)
  const [runStates, setRunStates] = useState(initialStates)
  const [stages, setStages] = useState({})
  const [pagesByDemo, setPagesByDemo] = useState({})
  const [recordsByDemo, setRecordsByDemo] = useState({})
  const [format, setFormat] = useState('jsonl')
  const [scenario, setScenario] = useState('success')
  const [diagnostics, setDiagnostics] = useState({})
  const [copyStatus, setCopyStatus] = useState('')
  const runId = useRef(0)
  const activeDemo = demoScrapers.find((scraper) => scraper.job.id === activeDemoId)
  const status = runStates[activeDemoId]
  const stage = stages[activeDemoId] ?? -1
  const pages = pagesByDemo[activeDemoId] ?? 0
  const records = recordsByDemo[activeDemoId] ?? []
  const exportMeta = useMemo(() => getExportMeta(records, format, activeDemo), [records, format, activeDemo])
  const progress = status === 'complete' ? 100 : Math.max(0, ((stage + 1) / pipelineStages.length) * 100)
  const stageEvent = stage < 0 ? 'awaiting.run' : pipelineStages[stage].event
  const completedJobs = Object.values(runStates).filter((item) => item === 'complete').length

  const resetDemo = (demoId = activeDemoId) => {
    runId.current += 1
    setRunStates((current) => ({ ...current, [demoId]: 'idle' }))
    setStages((current) => ({ ...current, [demoId]: -1 }))
    setPagesByDemo((current) => ({ ...current, [demoId]: 0 }))
    setRecordsByDemo((current) => ({ ...current, [demoId]: [] }))
    setDiagnostics((current) => ({ ...current, [demoId]: null }))
    setCopyStatus('')
  }

  const selectDemo = (scraper) => {
    runId.current += 1
    if (runStates[activeDemoId] === 'running') {
      setRunStates((current) => ({ ...current, [activeDemoId]: 'idle' }))
    }
    setActiveDemoId(scraper.job.id)
    setScenario('success')
    setCopyStatus('')
  }

  const runDemo = async (scraper = activeDemo, runScenario = scenario) => {
    const id = ++runId.current
    const demoId = scraper.job.id
    setActiveDemoId(demoId)
    setRunStates((current) => ({ ...current, [demoId]: 'running' }))
    setStages((current) => ({ ...current, [demoId]: 0 }))
    setPagesByDemo((current) => ({ ...current, [demoId]: 0 }))
    setRecordsByDemo((current) => ({ ...current, [demoId]: [] }))
    setDiagnostics((current) => ({ ...current, [demoId]: null }))
    setCopyStatus('')

    for (let index = 0; index < pipelineStages.length; index += 1) {
      if (runId.current !== id) return
      setStages((current) => ({ ...current, [demoId]: index }))
      await wait(520)

      if (runId.current !== id) return
      if (runScenario === 'selector-drift' && index === 2) {
        setRunStates((current) => ({ ...current, [demoId]: 'failed' }))
        setDiagnostics((current) => ({ ...current, [demoId]: getSelectorDriftDiagnostic(scraper.extraction.items, 1, scraper.driftCandidate) }))
        return
      }
      if (index === 2) {
        const firstPageRecords = scraper.records.slice(0, scraper.pages[0].records)
        setPagesByDemo((current) => ({ ...current, [demoId]: 1 }))
        setRecordsByDemo((current) => ({ ...current, [demoId]: firstPageRecords }))
      }
      if (index === 3) {
        setPagesByDemo((current) => ({ ...current, [demoId]: scraper.pages.length }))
        setRecordsByDemo((current) => ({ ...current, [demoId]: scraper.records }))
      }
    }
    setRunStates((current) => ({ ...current, [demoId]: 'complete' }))
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
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
    setCopyStatus(`${exportMeta.filename} download started.`)
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#dashboard">Skip to demo jobs</a>
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
            <h1>Choose a scraper.<br />Inspect the <em>whole run.</em></h1>
            <p>
              Compare several configured collection jobs, then run any bundled fixture
              without making a request to the public web.
            </p>
            <div className="hero-actions">
              <a className="primary-button" href="#dashboard"><Icon name="database" /> Browse demo scrapers</a>
              <a className="text-link" href="#cli"><Icon name="terminal" /> Use the real CLI <Icon name="arrow" /></a>
            </div>
          </div>
          <div className="hero-proof" aria-label="Demo scope">
            <span className="proof-mark"><Icon name="shield" /></span>
            <div>
              <strong>Nothing leaves your browser</strong>
              <p>0 live requests · no arbitrary URLs · bundled fixture data only</p>
            </div>
          </div>
        </section>

        <section className="dashboard-section" id="dashboard" aria-labelledby="dashboard-title">
          <div className="dashboard-heading">
            <div>
              <h2 id="dashboard-title">Demo scraper dashboard</h2>
              <p>Each job mirrors the production configuration model and runs against deterministic local records.</p>
            </div>
            <div className="dashboard-summary" aria-label="Demo job summary">
              <span>{demoScrapers.length} configured jobs</span>
              <span>{completedJobs} completed</span>
              <span>0 network requests</span>
            </div>
          </div>
          <div className="scraper-list">
            {demoScrapers.map((scraper) => {
              const scraperStatus = runStates[scraper.job.id]
              const isActive = scraper.job.id === activeDemoId
              return (
                <button
                  className={`scraper-row${isActive ? ' scraper-row-active' : ''}`}
                  type="button"
                  key={scraper.job.id}
                  aria-pressed={isActive}
                  onClick={() => selectDemo(scraper)}
                >
                  <span className="scraper-row-status"><span className={`status-dot status-dot-${scraperStatus}`} /></span>
                  <span className="scraper-row-main">
                    <strong>{scraper.job.name}</strong>
                    <span>{scraper.description}</span>
                  </span>
                  <span className="scraper-row-meta">
                    <span>{scraper.category}</span>
                    <code>{scraper.job.id}</code>
                  </span>
                  <span className={`scraper-row-state state-${scraperStatus}`}>{statusLabel(scraperStatus)}</span>
                </button>
              )
            })}
          </div>
        </section>

        <section className="workspace" id="workspace" aria-label="Pipeline demo workspace">
          <aside className="config-panel">
            <div className="panel-heading">
              <div>
                <p className="panel-label">Selected job</p>
                <h2>{activeDemo.job.name}</h2>
              </div>
              <span className="valid-chip"><Icon name="check" /> Ready</span>
            </div>

            <div className="job-id"><span>job.id</span><code>{activeDemo.job.id}</code></div>
            <div className="source-field">
              <span className="field-label">Target fixture</span>
              <strong>{activeDemo.source}</strong>
              <span><Icon name="lock" /> Local only</span>
            </div>

            <div className="config-rule" />
            <div className="settings-grid" aria-label="Collection controls">
              <div><span>Pages</span><strong>{activeDemo.maxPages} max</strong></div>
              <div><span>Delay</span><strong>{activeDemo.delayMs} ms</strong></div>
              <div><span>Retries</span><strong>{activeDemo.retries} attempts</strong></div>
              <div><span>Timeout</span><strong>{activeDemo.timeoutMs / 1000} sec</strong></div>
            </div>

            <div className="extraction-map">
              <div className="map-header"><Icon name="code" /><span>Extraction rules</span></div>
              <dl>
                <div><dt>items</dt><dd>{activeDemo.extraction.items}</dd></div>
                {activeDemo.fields.map((field) => <div key={field.key}><dt>{field.key}</dt><dd>{field.selector}</dd></div>)}
                {activeDemo.extraction.nextPage && <div><dt>next</dt><dd>{activeDemo.extraction.nextPage}</dd></div>}
              </dl>
            </div>

            <label className="field-label" htmlFor="scenario">Try an outcome</label>
            <select id="scenario" value={scenario} onChange={(event) => { setScenario(event.target.value); resetDemo() }}>
              <option value="success">Successful fixture run</option>
              <option value="selector-drift">Selector drift error</option>
            </select>
            <p className="panel-help">The CLI validates this same job shape before making an authorized request.</p>
          </aside>

          <section className="run-panel">
            <div className="run-topline">
              <div>
                <p className="panel-label">Live walkthrough</p>
                <h2>Watch the job move</h2>
              </div>
              <span className={`run-status status-${status}`}>
                <span className="status-dot" />
                {statusLabel(status)}
              </span>
            </div>

            <div className="run-summary">
              <div><span>Current event</span><code>{stageEvent}</code></div>
              <div><span>Scope</span><strong>Fixture only</strong></div>
              <div><span>Progress</span><strong>{Math.round(progress)}%</strong></div>
            </div>

            <div className="progress-track" role="progressbar" aria-label="Pipeline completion" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(progress)}>
              <span style={{ transform: `scaleX(${progress / 100})` }} />
            </div>
            <p className="sr-only" role="status" aria-live="polite">
              {status === 'idle' ? 'Demo ready' : status === 'failed' ? `${diagnostics[activeDemoId]?.code ?? 'PARSE_ERROR'}: selector drift detected` : `${status}. ${Math.round(progress)} percent complete.`}
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

            {diagnostics[activeDemoId] && (
              <div className="error-banner" role="alert">
                <div>
                  <strong>{diagnostics[activeDemoId].code}: selector drift detected</strong>
                  <p>Page {diagnostics[activeDemoId].page} returned no records, so export remains unavailable.</p>
                </div>
                <code>{diagnostics[activeDemoId].selector}</code>
                <p><b>Observed:</b> {diagnostics[activeDemoId].observed}</p>
                <ol>{diagnostics[activeDemoId].guidance.map((step) => <li key={step}>{step}</li>)}</ol>
                <button className="recovery-button" type="button" onClick={() => { setScenario('success'); runDemo(activeDemo, 'success') }}>
                  <Icon name="reset" /> Load compatible selector and retry
                </button>
              </div>
            )}

            <div className="run-metrics" aria-label="Current run metrics">
              <div><span>Pages visited</span><strong>{pages} <small>/ {activeDemo.pages.length}</small></strong></div>
              <div><span>Records normalized</span><strong>{records.length}</strong></div>
              <div><span>Network requests</span><strong>0</strong></div>
            </div>
            <button className="run-job-button" type="button" onClick={() => runDemo()} disabled={status === 'running'}>
              <Icon name="play" /> {status === 'running' ? 'Running selected job...' : `Run ${activeDemo.job.name}`}
            </button>
          </section>
        </section>

        <section className="results-section" id="results">
          <div className="results-heading">
            <div>
              <p className="panel-label">Collected records</p>
              <h2>{activeDemo.job.name} output</h2>
            </div>
            {status !== 'idle' && <button className="quiet-button" type="button" onClick={() => resetDemo()}><Icon name="reset" /> Reset demo</button>}
          </div>

          {records.length ? (
            <>
              <div className="provenance-strip" aria-label="Record provenance summary">
                <div><span>Snapshot</span><strong>{activeDemo.snapshot}</strong></div>
                <div><span>Run ID</span><strong>{activeDemo.runId}</strong></div>
                <div><span>Collected</span><strong>2026-08-22 · 16:00 UTC</strong></div>
                <div><span>Lineage</span><strong>100% complete</strong></div>
              </div>
              <div className="table-frame">
                <table>
                  <thead><tr>{activeDemo.fields.map((field) => <th key={field.key}>{field.label}</th>)}<th>Source fixture</th><th>Collected at</th></tr></thead>
                  <tbody>{records.map((record) => (
                    <tr key={record[activeDemo.fields.at(-1).key]}>
                      {activeDemo.fields.map((field) => (
                        <td key={field.key}>
                          {field.format === 'currency' ? `$${record[field.key].toFixed(2)}` : field.format === 'availability' ? <span className="availability"><span />{record[field.key]}</span> : field.format === 'url' ? <span className="record-url">{record[field.key]}</span> : record[field.key]}
                        </td>
                      ))}
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
              <div><strong>{activeDemo.job.name} records will appear here.</strong><p>Run this fixture to inspect data alongside its source, timestamp, and run context.</p></div>
              <button className="secondary-button" type="button" onClick={() => runDemo()} disabled={status === 'running'}><Icon name="play" /> Run job</button>
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
        <span>Fixture demos · No live browser scraping</span>
      </footer>
    </div>
  )
}

export default App
