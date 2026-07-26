import { useState } from 'react'
import './App.css'

const initialEntries = [
  {
    id: 'job_001',
    source: 'Wikipedia tables',
    category: 'Reference',
    descriptor: 'https://wikipedia.org/wiki/Lists_of_lists',
    frequency: 'Daily',
    records: 1240,
    status: 'Complete',
    notes: 'Baseline nightly refresh',
  },
  {
    id: 'job_002',
    source: 'Retail catalog feed',
    category: 'Ecommerce',
    descriptor: 'Partner product endpoint',
    frequency: 'Hourly',
    records: 842,
    status: 'Running',
    notes: 'Price-change watcher',
  },
  {
    id: 'job_003',
    source: 'Security advisories RSS',
    category: 'Security',
    descriptor: 'Vendor advisory RSS feed',
    frequency: 'Daily',
    records: 465,
    status: 'Queued',
    notes: 'Waiting on credential rotation',
  },
]

const initialFormState = {
  source: '',
  category: '',
  descriptor: '',
  frequency: 'Daily',
  status: 'Queued',
  notes: '',
}

const statusToneMap = {
  Complete: 'status-complete',
  Running: 'status-running',
  Queued: 'status-queued',
}

function App() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [entries, setEntries] = useState(initialEntries)
  const [formData, setFormData] = useState(initialFormState)
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')

  const totalRecords = entries.reduce((sum, job) => sum + job.records, 0)
  const activeJobs = entries.filter((job) => job.status === 'Running').length

  const handleFieldChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (formError) {
      setFormError('')
    }
  }

  const handleCreateEntry = (event) => {
    event.preventDefault()

    if (!formData.source.trim() || !formData.category.trim() || !formData.descriptor.trim()) {
      setFormError('Source name, category, and source descriptor are required.')
      return
    }

    const newEntry = {
      id: `job_${String(entries.length + 1).padStart(3, '0')}`,
      source: formData.source.trim(),
      category: formData.category.trim(),
      descriptor: formData.descriptor.trim(),
      frequency: formData.frequency,
      status: formData.status,
      records: 0,
      notes: formData.notes.trim() || 'No notes provided.',
    }

    setEntries((prev) => [newEntry, ...prev])
    setFormData(initialFormState)
    setCurrentView('dashboard')
    setNotice(`Added ${newEntry.id} for ${newEntry.source}.`)
    setFormError('')
  }

  return (
    <div className="app-shell">
      <div className="shell-frame">
        <header className="hero">
          <p className="eyebrow">Watson portfolio demo</p>
          <h1>Web Scraper Automation</h1>
          <p>Dummy data dashboard for scrape pipeline status, exports, and job activity.</p>
          <p className="standard-note">Project standard UI shell</p>
        </header>

        <nav className="top-nav" aria-label="Primary navigation">
          <button
            type="button"
            className={`nav-button ${currentView === 'dashboard' ? 'nav-active' : ''}`}
            onClick={() => setCurrentView('dashboard')}
          >
            Dashboard
          </button>
          <button
            type="button"
            className={`nav-button ${currentView === 'add-new' ? 'nav-active' : ''}`}
            onClick={() => {
              setCurrentView('add-new')
              setNotice('')
            }}
          >
            Add New
          </button>
        </nav>

        {currentView === 'dashboard' && (
          <>
            {notice ? <p className="submission-notice">{notice}</p> : null}

            <section className="kpi-grid" aria-label="Pipeline summary cards">
              <article className="kpi-card">
                <p className="kpi-label">Jobs tracked</p>
                <p className="kpi-value">{entries.length}</p>
              </article>
              <article className="kpi-card">
                <p className="kpi-label">Total records</p>
                <p className="kpi-value">{totalRecords.toLocaleString()}</p>
              </article>
              <article className="kpi-card">
                <p className="kpi-label">Running jobs</p>
                <p className="kpi-value">{activeJobs}</p>
              </article>
            </section>

            <section className="panel controls-panel">
              <h2>Pipeline controls</h2>
              <p className="panel-subtitle">Tune filters and queue a demo run with the same dummy workflow.</p>
              <div className="controls-grid">
                <label>
                  Source filter
                  <input type="text" defaultValue="All sources" aria-label="Source filter" />
                </label>
                <label>
                  Export format
                  <select defaultValue="CSV" aria-label="Export format">
                    <option>CSV</option>
                    <option>JSON</option>
                    <option>XLSX</option>
                  </select>
                </label>
                <button type="button">Queue demo scrape</button>
              </div>
            </section>

            <section className="panel">
              <h2>Recent scrape jobs</h2>
              <p className="panel-subtitle">Latest job activity snapshot from the demo scraper queue.</p>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Job ID</th>
                      <th>Source</th>
                      <th>Category</th>
                      <th>Descriptor</th>
                      <th>Frequency</th>
                      <th>Records</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((job) => (
                      <tr key={job.id}>
                        <td>{job.id}</td>
                        <td>{job.source}</td>
                        <td>{job.category}</td>
                        <td>{job.descriptor}</td>
                        <td>{job.frequency}</td>
                        <td>{job.records.toLocaleString()}</td>
                        <td>
                          <span className={`status-chip ${statusToneMap[job.status] ?? 'status-default'}`}>{job.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="panel split">
              <article className="content-card">
                <h3>Dummy exports</h3>
                <ul>
                  <li>daily_scrape_report.csv</li>
                  <li>retail_prices_snapshot.json</li>
                  <li>security_feed_digest.xlsx</li>
                </ul>
              </article>
              <article className="content-card">
                <h3>AWS backend roadmap</h3>
                <ul>
                  <li>API Gateway ingestion endpoint</li>
                  <li>Lambda workers for crawling/parsing</li>
                  <li>DynamoDB + S3 for results and archives</li>
                </ul>
              </article>
            </section>
          </>
        )}

        {currentView === 'add-new' && (
          <section className="panel form-panel">
            <h2>Add New</h2>
            <p className="panel-subtitle">Create a new scraper entry for this demo dataset.</p>
            <form className="entry-form" onSubmit={handleCreateEntry} noValidate>
              <label>
                Source name *
                <input
                  name="source"
                  value={formData.source}
                  onChange={handleFieldChange}
                  placeholder="Security advisories API"
                  required
                />
              </label>
              <label>
                Category *
                <input
                  name="category"
                  value={formData.category}
                  onChange={handleFieldChange}
                  placeholder="Security"
                  required
                />
              </label>
              <label>
                URL / source descriptor *
                <input
                  name="descriptor"
                  value={formData.descriptor}
                  onChange={handleFieldChange}
                  placeholder="https://example.com/advisories"
                  required
                />
              </label>
              <label>
                Frequency
                <select name="frequency" value={formData.frequency} onChange={handleFieldChange}>
                  <option>Hourly</option>
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>On demand</option>
                </select>
              </label>
              <label>
                Status
                <select name="status" value={formData.status} onChange={handleFieldChange}>
                  <option>Queued</option>
                  <option>Running</option>
                  <option>Complete</option>
                </select>
              </label>
              <label className="full-width">
                Notes
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleFieldChange}
                  placeholder="Optional run notes"
                  rows={4}
                />
              </label>
              {formError ? <p className="form-error">{formError}</p> : null}
              <div className="form-actions">
                <button type="submit">Add scraper entry</button>
                <button type="button" className="ghost-button" onClick={() => setCurrentView('dashboard')}>
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}
      </div>
    </div>
  )
}

export default App