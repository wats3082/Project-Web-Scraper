from bs4 import BeautifulSoup # this module helps in web scrapping.
import requests  # this module helps us to download a web page
import pandas as pd #pandas helps with data manipulation control




url="http://www.ibm.com"
data = requests.get(url).text
soup= BeautifulSoup(data, "html.parser")

#scrape all links from the page
#for link in soup.find_all('a', href=True):
    #print(link.get('href'))

#scrape all image tags
#for link in soup.find_all('img'):  # in html image is represented by the tag <img>
 #   print(link)
  #  print(link.get('src'))

#scrape data from HTML tables, this is a website about color codes
urlColor = "https://cf-courses-data.s3.us.cloud-object-storage.appdomain.cloud/IBM-DA0321EN-\
SkillsNetwork/labs/datasets/HTMLColorCodes.html"

#get contents and save as test
dataColor = requests.get(urlColor).text
#good soup
soupColor = BeautifulSoup(dataColor, "html.parser")

#find html table in web page
table = soupColor.find('table')

#Get all rows from the table
for row in table.find_all('tr'): # in html table row is represented by the tag <tr>
    # Get all columns in each row.
    cols = row.find_all('td') # in html a column is represented by the tag <td>
    color_name = cols[2].string # store the value in column 3 as color_name
    color_code = cols[3].string # store the value in column 4 as color_code
    print("{}--->{}".format(color_name,color_code))

#using wikipedia that contains html with data about world populations
url_wiki = "https://en.wikipedia.org/wiki/World_population"
data_wiki = requests.get(url_wiki).text
soup_wiki = BeautifulSoup( data_wiki, "html.parser")
tables_wiki = soup_wiki.find_all('table')# find all ttml tables
table_count = len(tables_wiki)
print(str(table_count) + " is the length of tables in the wiki url.")
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
        population_data = population_data.append({"Rank":rank, "Country":country, "Population":population, "Area":area, "Density":density}, ignore_index=True)

population_data


