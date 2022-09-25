from bs4 import BeautifulSoup # this module helps in web scrapping.
import requests  # this module helps us to download a web page
import pandas as pd #pandas helps with data manipulation control
from flask import Flask

#using wikipedia that contains html with data about world populations
url_wiki_gunstats = "https://en.wikipedia.org/wiki/Estimated_number_of_civilian_guns_per_capita_by_country"
url_wiki_death = "https://en.wikipedia.org/wiki/List_of_causes_of_death_by_rate"
url_wiki = "https://en.wikipedia.org/wiki/World_population"
url_wiki_semic = "https://en.wikipedia.org/wiki/Semiconductor_industry#Semiconductor_sales"
#data_wiki = requests.get(url_wiki_gunstats).text
data_wiki = requests.get(url_wiki).text
soup_wiki = BeautifulSoup( data_wiki, "html.parser")
tables_wiki = soup_wiki.find_all('table')# find all ttml tables
table_count = len(tables_wiki)
print(str(table_count) + " is the # of tables in the wiki url.")
table_index=5
#this is how you choose which table to use starting at 0
#print(tables_wiki[table_index].prettify()) #make the data pretty

#test here
population_data = pd.DataFrame(columns=[ ])
for row in tables_wiki[table_index].tbody.find_all("tr"):
   col = row.find_all("td")
   if (col != []):
        rank = col[0].text.strip()
        country = col[1].text.strip()
        per100 = col[2].text.strip()
      #  subregion= col[4].text.strip()
       # pop = col[5].text.strip()
        #civposs = col[6].text.strip()


        #population_data = population_data.append({"Company":rank,
                                                #  "Country":country,
                                                 #"Major":per100,
                                               # "Subregion":subregion,
                                                 # "Population 2017": pop,
                                                 # "Total firearms": civposs,

                                                 # },
                                                  #ignore_index=True)



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




#population_data = pd.read_html(str(tables_wiki[0]), flavor='bs4')  #this lists the whole table
print (population_data)
population_data = population_data.to_html()


#now to use Flask to make a web application
app = Flask("webScraper")

@app.route('/')
def on_load():
       return population_data #or display results use the ip address link below to view website

if __name__ == "__main__":
    app.run(debug=True)


