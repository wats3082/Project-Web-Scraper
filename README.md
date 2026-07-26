# Web Scraper Automation

React + Vite frontend with dummy scrape job data and an AWS-ready architecture direction.

## Live site

https://wats3082.github.io/Project-Web-Scraper/

## AWS backend direction

1. API Gateway for ingestion and management
2. Lambda workers for crawl/parse pipelines
3. DynamoDB + S3 for result storage and archives
4. EventBridge/SQS for scheduled and async workflows