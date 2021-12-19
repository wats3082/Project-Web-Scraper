from bs4 import BeautifulSoup # this module helps in web scrapping.
import requests  # this module helps us to download a web page





# this is the stored info from html get request stored in variable
html_info= "<!DOCTYPE html>\
            <html>\
            <head>\
            <title>Page Title</title>\
            </head>\
            <body>\
            <h3><b id='boldest'>Lebron James</b></h3>\
            <p> Salary: $ 92,000,000 </p>\
            <h3> Stephen Curry</h3>\
            <p> Salary: $85,000, 000 </p>\
            <h3> Kevin Durant </h3>\
            <p> Salary: $73,200, 000</p>\
            </body>\
            </html>"

# next create a beautiful soup object  which represents the document as a nested data structure
soup = BeautifulSoup(html_info, "html.parser")

#First, the document is converted to Unicode, (similar to ASCII), \
# and HTML entities are converted to Unicode characters. Beautiful Soup transforms a complex HTML document
# into a complex tree of Python objects. The BeautifulSoup object can create other types of objects.
#We can use the method prettify() to display the HTML in the nested structure:

print(soup.prettify())

