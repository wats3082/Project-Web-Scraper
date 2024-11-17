# Python and BeautifulSoup Web Scraper


<!--
[Play Now](https://quiz-game-liart.vercel.app/)
-->

## Description ##

Web Scraping service to gather info from the WWW
pulling from Wikipedia page containing top city populations of the world by area and density
https://en.wikipedia.org/wiki/World_population



## Installation ##
Open Command Line and input the following commands one line at a time

```
git clone https://github.com/wats3082/Project-Web-Scraper.git
```
```
cd Project-Web-Scraper
```
```
yarn install (or npm install)
```
```
yarn start (or npm start)
```

## Upcoming Enhancments (CI/CD) ##
* input a custom wikipedia url (after verification)
* auto scrapes from different subjects, "Population", "Science", "News", etc










Great! Let's enhance the Python web scraping code to include:

1. **Robust error handling** (handling missing elements and network retries).
2. **Dynamic content handling** using **Selenium** for websites like Yahoo Finance (which dynamically loads stock data).
3. **Data storage** (store scraped data in CSV and JSON formats).
4. **Respect for `robots.txt`**: Checking the website’s `robots.txt` to ensure scraping is allowed.

### Enhanced Python Code: `web_scraper_with_error_handling.py`

#### First, Install Required Libraries:
In addition to `requests` and `beautifulsoup4`, you’ll also need `selenium` and `webdriver-manager` to handle dynamic content. You can install these with the following:

```bash
pip install requests beautifulsoup4 lxml selenium webdriver-manager
```



## web_scraper_with_error_handling.py

### Changes and Enhancements:

1. **Respecting `robots.txt`:**
   - The `check_robots_txt()` function retrieves the `robots.txt` file for a given URL and checks if scraping is allowed. If the website disallows scraping (e.g., `/`), the script exits early.

2. **Error Handling and Retries:**
   - **Network Errors:** Wrapped the network requests in `try-except` blocks to handle potential `RequestException` errors.
   - **Missing Elements:** Before extracting content from HTML elements (e.g., stock price, paragraphs, headlines), the script checks whether the elements exist, preventing errors when elements are missing.

3. **Dynamic Content Scraping Using Selenium:**
   - We use **Selenium** to scrape dynamic content (e.g., the stock price from Yahoo Finance) that is loaded via JavaScript.
   - We wait for the content to load using `time.sleep(3)`, which waits for the page to fully render before scraping the data.

4. **Data Storage (CSV and JSON):**
   - After scraping, the data is saved in **CSV** and **JSON** formats using the `store_data_csv()` and `store_data_json()` functions.
   - The data is stored in simple dictionary format and then written to the appropriate file format.

5. **Main Function:**
   - The `main()` function coordinates the execution, ensuring that scraping happens only if the website allows it (via `robots.txt` check).
   - It scrapes from Wikipedia, government websites, and stock data sources and then stores the sample data into CSV and JSON files.

### Example Output:

When you run the script, you'll see output like:

```bash
Scraping Wikipedia...
Successfully fetched Wikipedia page!

Wikipedia - First Paragraph:
 Python is an interpreted, high-level, general-purpose programming language...

Scraping Government News...
Successfully fetched government news page!

Government News Headlines:
How To Vote In 2020
President's Budget Proposal
Public Assistance Programs
Find a Job
State and Local Governments

Scraping Stock Data...
Apple Stock Price: $150.25

Data stored successfully in scraped_data.csv
Data stored successfully in scraped_data.json
```

### Additional Considerations:

1. **Web Scraping Policies:**
   - Always check a website's `robots.txt` file before scraping, and adhere to its rules. If a website disallows scraping, do not scrape it.
   - Ensure you're not overloading the website with requests (i.e., don't make requests too frequently). Consider implementing delays (e.g., `time.sleep()`).

2. **Dynamic Content:**
   - Websites like **Yahoo Finance** (which use JavaScript to render content) may require more advanced scraping techniques like **Selenium** or **Playwright** (which can handle dynamic content).
   - When using **Selenium**, make sure to handle waiting for elements to load properly (e.g., using `WebDriverWait`).

3. **Rate Limiting and Retries:**
   - To avoid being blocked, it's a good practice to implement rate-limiting (e.g., a delay between requests) and retries for network-related errors.

4. **Data Storage:**
   - In a production setting, you may want to store data in a database rather than a CSV or JSON file, especially if you’re scraping large datasets. Use databases like MySQL, PostgreSQL, or SQLite for more robust storage.

### Conclusion:
This enhanced script includes better error handling, dynamic content scraping with Selenium, and the ability to store data in multiple formats, while also respecting the website's scraping rules. This should give you a more robust foundation for web scraping tasks!

