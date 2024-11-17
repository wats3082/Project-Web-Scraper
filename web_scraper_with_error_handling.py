
import requests
from bs4 import BeautifulSoup
import re
import time
import csv
import json
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
from requests.exceptions import RequestException

# 1. Function to respect robots.txt
def check_robots_txt(url):
    robots_url = urlparse(url)._replace(path="/robots.txt").geturl()
    try:
        response = requests.get(robots_url)
        if response.status_code == 200:
            print(f"Robots.txt fetched successfully from {robots_url}")
            return response.text
        else:
            print(f"Failed to retrieve robots.txt from {robots_url}")
            return None
    except RequestException as e:
        print(f"Error fetching robots.txt: {e}")
        return None

# 2. Scrape data from Wikipedia (e.g., the "Python (programming language)" page)
def scrape_wikipedia():
    url = "https://en.wikipedia.org/wiki/Python_(programming_language)"
    response = requests.get(url)
    
    if response.status_code == 200:
        print("Successfully fetched Wikipedia page!")
        soup = BeautifulSoup(response.content, 'lxml')
        
        # Extract the first paragraph in the article
        first_paragraph = soup.find('p')
        if first_paragraph:
            print("\nWikipedia - First Paragraph:\n", first_paragraph.get_text())
        else:
            print("First paragraph not found.")
    else:
        print(f"Failed to retrieve Wikipedia page. Status code: {response.status_code}")

# 3. Scrape government news (e.g., US Government News)
def scrape_government_news():
    url = "https://www.usa.gov/"
    response = requests.get(url)
    
    if response.status_code == 200:
        print("Successfully fetched government news page!")
        soup = BeautifulSoup(response.content, 'lxml')
        
        # Extract the main news headlines (just an example)
        headlines = soup.find_all('h3')
        if headlines:
            print("\nGovernment News Headlines:")
            for headline in headlines[:5]:  # Show the first 5 headlines
                print(headline.get_text().strip())
        else:
            print("No headlines found.")
    else:
        print(f"Failed to retrieve government page. Status code: {response.status_code}")

# 4. Scrape publicly traded stock data with Selenium (e.g., stock price of Apple from Yahoo Finance)
def scrape_stock_data():
    url = "https://finance.yahoo.com/quote/AAPL"
    
    # Setup Selenium WebDriver with Chrome
    options = Options()
    options.headless = True  # Run in headless mode
    driver = webdriver.Chrome(ChromeDriverManager().install(), options=options)
    
    try:
        driver.get(url)
        time.sleep(3)  # Wait for dynamic content to load

        # Locate the stock price (this might change based on the page structure)
        price_element = driver.find_element(By.XPATH, '//td[@data-test="OPEN-value"]')
        if price_element:
            stock_price = price_element.text
            print(f"\nApple Stock Price: {stock_price}")
        else:
            print("Stock price not found.")
    
    except Exception as e:
        print(f"Error while fetching stock data: {e}")
    
    finally:
        driver.quit()

# 5. Store Data in CSV and JSON
def store_data_csv(data, filename="scraped_data.csv"):
    try:
        with open(filename, mode='w', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            writer.writerow(data.keys())  # Writing header
            writer.writerow(data.values())  # Writing data
        print(f"Data stored successfully in {filename}")
    except Exception as e:
        print(f"Error storing data in CSV: {e}")

def store_data_json(data, filename="scraped_data.json"):
    try:
        with open(filename, mode='w', encoding='utf-8') as file:
            json.dump(data, file, indent=4)
        print(f"Data stored successfully in {filename}")
    except Exception as e:
        print(f"Error storing data in JSON: {e}")

# Main function to orchestrate the scraping
def main():
    # First, check robots.txt before scraping
    url = "https://www.usa.gov/"
    robots_txt = check_robots_txt(url)
    if robots_txt and "Disallow: /" in robots_txt:
        print("This website does not allow scraping. Exiting.")
        return

    print("Scraping Wikipedia...")
    scrape_wikipedia()
    
    print("\nScraping Government News...")
    scrape_government_news()
    
    print("\nScraping Stock Data...")
    scrape_stock_data()

    # Sample data to be stored
    sample_data = {
        "Website": "Wikipedia",
        "First Paragraph": "Python is an interpreted, high-level, general-purpose programming language...",
        "Stock Price (Apple)": "$150.25"
    }

    # Storing scraped data in CSV and JSON formats
    store_data_csv(sample_data)
    store_data_json(sample_data)

if __name__ == "__main__":
    main()
