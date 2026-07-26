import './App.css'

const jobs = [
  { id: 'job_001', source: 'Wikipedia tables', records: 1240, status: 'Complete' },
  { id: 'job_002', source: 'Retail catalog feed', records: 842, status: 'Running' },
  { id: 'job_003', source: 'Security advisories RSS', records: 465, status: 'Queued' },
]

const statusToneMap = {
  Complete: 'status-complete',
  Running: 'status-running',
  Queued: 'status-queued',
}

function App() {
  const totalRecords = jobs.reduce((sum, job) => sum + job.records, 0)
  const activeJobs = jobs.filter((job) => job.status === 'Running').length

  return (
    <div className="app-shell">
      <div className="shell-frame">
        <header className="hero">
          <p className="eyebrow">Watson portfolio demo</p>
          <h1>Web Scraper Automation</h1>
          <p>Dummy data dashboard for scrape pipeline status, exports, and job activity.</p>
          <p className="standard-note">Project standard UI shell</p>
        </header>

        <section className="kpi-grid" aria-label="Pipeline summary cards">
          <article className="kpi-card">
            <p className="kpi-label">Jobs tracked</p>
            <p className="kpi-value">{jobs.length}</p>
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
                <tr><th>Job ID</th><th>Source</th><th>Records</th><th>Status</th></tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td>{job.id}</td>
                    <td>{job.source}</td>
                    <td>{job.records.toLocaleString()}</td>
                    <td>
                      <span className={`status-chip ${statusToneMap[job.status]}`}>{job.status}</span>
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
      </div>
    </div>
  )
}

export default App