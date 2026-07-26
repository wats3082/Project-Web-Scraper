import './App.css'

const jobs = [
  { id: 'job_001', source: 'Wikipedia tables', records: 1240, status: 'Complete' },
  { id: 'job_002', source: 'Retail catalog feed', records: 842, status: 'Running' },
  { id: 'job_003', source: 'Security advisories RSS', records: 465, status: 'Queued' },
]

function App() {
  return (
    <div className="app-shell">
      <header className="hero">
        <p className="eyebrow">React demo</p>
        <h1>Web Scraper Automation</h1>
        <p>Dummy data dashboard for scrape pipeline status, exports, and job activity.</p>
        <p className="standard-note">Project standard UI shell</p>
      </header>

      <section className="panel">
        <h2>Recent scrape jobs</h2>
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
                  <td>{job.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel split">
        <article>
          <h3>Dummy exports</h3>
          <ul>
            <li>daily_scrape_report.csv</li>
            <li>retail_prices_snapshot.json</li>
            <li>security_feed_digest.xlsx</li>
          </ul>
        </article>
        <article>
          <h3>AWS backend roadmap</h3>
          <ul>
            <li>API Gateway ingestion endpoint</li>
            <li>Lambda workers for crawling/parsing</li>
            <li>DynamoDB + S3 for results and archives</li>
          </ul>
        </article>
      </section>
    </div>
  )
}

export default App