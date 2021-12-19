from bs4 import BeautifulSoup # this module helps in web scrapping.
import requests  # this module helps us to download a web page
import pandas as pd #pandas helps with data manipulation control
from flask import Flask

#using wikipedia that contains html with data about world populations
url_wiki = "https://en.wikipedia.org/wiki/World_population"
data_wiki = requests.get(url_wiki).text
soup_wiki = BeautifulSoup( data_wiki, "html.parser")
tables_wiki = soup_wiki.find_all('table')# find all ttml tables
table_count = len(tables_wiki)
print(str(table_count) + " is the # of tables in the wiki url.")
table_index=1
#print(tables_wiki[table_index].prettify()) #make the data pretty

population_data = pd.DataFrame(columns=["Rank", "Country", "Population", "Area", "Density"])
for row in tables_wiki[table_index].tbody.find_all("tr"):
    col = row.find_all("td")
    if (col != []):
        rank = col[0].text
        country = col[1].text
        population = col[2].text.strip()
        area = col[3].text.strip()
        density = col[4].text.strip()
        population_data = population_data.append({"Rank":rank, "Country":country, "Population":population, \
                                                  "Area":area, "Density":density}, ignore_index=True)


population_data = pd.read_html(str(tables_wiki[5]), flavor='bs4')
print (population_data)


#now to use Flask to make a web application
app = Flask("webScraper")

@app.route('/')
def on_load():
    return null
    #return 'Hello World'

if __name__ == "__main__":
    app.run(debug=True)


