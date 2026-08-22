export class ScraperError extends Error {
  constructor(message, { code = 'SCRAPER_ERROR', cause, details } = {}) {
    super(message, { cause })
    this.name = this.constructor.name
    this.code = code
    this.details = details
  }
}

export class ConfigError extends ScraperError {
  constructor(message, details) {
    super(message, { code: 'INVALID_CONFIG', details })
  }
}

export class HttpError extends ScraperError {
  constructor(message, details) {
    super(message, { code: 'HTTP_ERROR', details })
  }
}

export class RobotsDeniedError extends ScraperError {
  constructor(url) {
    super(`robots.txt disallows scraping ${url}`, {
      code: 'ROBOTS_DENIED',
      details: { url },
    })
  }
}

export class ParseError extends ScraperError {
  constructor(message, details) {
    super(message, { code: 'PARSE_ERROR', details })
  }
}
