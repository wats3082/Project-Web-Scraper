from bs4 import BeautifulSoup # this module helps in web scrapping.
import requests  # this module helps us to download a web page



url="http://www.ibm.com"
data = requests.get(url).text
soup= BeautifulSoup(data, "html.parser")

#scrape all links from the page
for link in soup.find_all('a', href=True):
    print(link.get('href'))

#scrape all image tags
#for link in soup.find_all('img'):  # in html image is represented by the tag <img>
 #   print(link)
  #  print(link.get('src'))

#scrape data from HTML tables, this is a website about color codes
urlColor = "https://cf-courses-data.s3.us.cloud-object-storage.appdomain.cloud/IBM-DA0321EN-\
SkillsNetwork/labs/datasets/HTMLColorCodes.html"
#get contents and save as test
dataColor = requests.get(urlColor).text