from bs4 import BeautifulSoup # this module helps in web scrapping.
import requests  # this module helps us to download a web page
import pandas as pd #pandas helps with data manipulation control
from flask import Flask
from flask import request
from tkinter import *
import customtkinter
from flask import Flask
import tkinter.messagebox
import sys
import webbrowser

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
table_index=7
#this is how you choose which table to use starting at 0
#print(tables_wiki[table_index].prettify()) #make the data pretty

"""#test here""""""
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
                                                  #ignore_index=True)"""







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
                                                "Area (km^2)":area, "Density (pop/km^2)":density}, ignore_index=True)




#population_data = pd.read_html(str(tables_wiki[0]), flavor='bs4')  #this lists the whole table
print (population_data)
population_data = population_data.to_html()







app = Flask(__name__)

@app.route("/")
def index():
    celsius = request.args.get("celsius", "")
    if celsius:
        fahrenheit = fahrenheit_from(celsius)
    else:
        fahrenheit = ""
    return (
        """<form action="" method="get">
                Celsius temperature: <input type="text" name="celsius">
                <input type="submit" value="Convert to Fahrenheit">
            </form>"""
        + "Fahrenheit: "
        + fahrenheit
    )

def fahrenheit_from(celsius):
    """Convert Celsius to Fahrenheit degrees."""
    try:
        fahrenheit = float(celsius) * 9 / 5 + 32
        fahrenheit = round(fahrenheit, 3)  # Round to three decimal places
        return str(fahrenheit)
    except ValueError:
        return "invalid input"

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8080, debug=True)


"""customtkinter.set_appearance_mode("Dark")  # Modes: "System" (standard), "Dark", "Light"
customtkinter.set_default_color_theme("green")  # Themes: "blue" (standard), "green", "dark-blue"


class App(customtkinter.CTk):
    WIDTH = 600
    HEIGHT = 550

    def __init__(self):
        super().__init__()

        self.title("RW web")
        self.geometry(f"{App.WIDTH}x{App.HEIGHT}")
        # self.minsize(App.WIDTH, App.HEIGHT)

        self.protocol("WM_DELETE_WINDOW", self.on_closing)  # call .on_closing() when app gets closed

        # ============ create two frames ============

        # configure grid layout (2x1)
        self.grid_columnconfigure(1, weight=10)
        self.grid_rowconfigure(0, weight=1)

        self.frame_left = customtkinter.CTkFrame(master=self,
                                                 width=180,
                                                 corner_radius=0)
        self.frame_left.grid(row=0, column=0, sticky="nswe")

        self.frame_right = customtkinter.CTkFrame(master=self)
        self.frame_right.grid(row=0, column=1, sticky="nswe", padx=20, pady=20)

        # ============ frame_left ============

        # configure grid layout (1x11)
        self.frame_left.grid_rowconfigure(0, minsize=10)  # empty row with minsize as spacing
        self.frame_left.grid_rowconfigure(6, weight=10)  # empty row as spacing
        self.frame_left.grid_rowconfigure(8, minsize=20)  # empty row with minsize as spacing
        self.frame_left.grid_rowconfigure(11, minsize=10)  # empty row with minsize as spacing

        self.label_1 = customtkinter.CTkLabel(master=self.frame_left,
                                              text="WebScraper App",
                                              text_font=("Roboto Medium", 16))  # font name and size in px
        self.label_1.grid(row=1, column=0, pady=10, padx=10)


    #https://pythonbasics.org/pandas-web-scraping/
        self.button_1 = customtkinter.CTkButton(master=self.frame_left,
                                                text=".pandas. info",
                                                fg_color=("green"),  # <- custom tuple-color
                                                command=self.button_event24,
                                                text_font=("Roboto Medium", 12))
        self.button_1.grid(row=2, column=0, pady=10, padx=10, )

        self.button_2 = customtkinter.CTkButton(master=self.frame_left,
                                                text="Demo wiki site",
                                                fg_color=("green"),  # <- custom tuple-color
                                                command=self.button_eventweek,
                                                text_font=("Roboto Medium", 12))
        self.button_2.grid(row=3, column=0, pady=10, padx=10)


        self.switch_2 = customtkinter.CTkSwitch(master=self.frame_left,
                                                text="Dark Mode",
                                                command=self.change_mode,
                                                text_font=("Roboto Medium", 12))
        self.switch_2.grid(row=6, column=0, pady=10, padx=10, sticky="")

        # ============ frame_right ============

        # configure grid layout (3x7)
        self.frame_right.rowconfigure((0, 1, 2, 3), weight=1)
        self.frame_right.rowconfigure(7, weight=5)
        self.frame_right.columnconfigure((0, 1), weight=1)
        self.frame_right.columnconfigure(2, weight=1)

        self.frame_info = customtkinter.CTkFrame(master=self.frame_right)
        self.frame_info.grid(row=0, column=0, columnspan=2, rowspan=4, pady=10, padx=20, sticky="nsew")

        # ============ frame_info ============

        # configure grid layout (1x1)
        self.frame_info.rowconfigure(0, weight=1)
        self.frame_info.columnconfigure(0, weight=1)

        # ============ frame_right ============

        self.radio_var = tkinter.IntVar(value=0)



        self.radio_button_1 = customtkinter.CTkComboBox(master=self.frame_right,
                                                        variable=self.radio_var,
                                                        width=350,
                                                        command=self.button_event,

                                                        values=[
                                                                "Worldwide Cause of Death", "Gun Stats",
                                                                "Nuclear Arsenal", "Semiconductor", "World GDP"
                                                        ,"Population Density-City", "Most profitable companies"],
                                                        text_font=("Roboto Medium", 14)
                                                        )

        self.radio_button_1.grid(row=0, column=1, pady=10, padx=10, sticky="n")

        # -----------------------------------------------------------------------------------
        self.label_display = customtkinter.CTkTextbox(master=self.frame_info,
                                                         #text='requirements.txt',
                                                         height=400,
                                                        width=400,

                                                        fg_color=("white", "black"), # <- custom tuple-color
                                                        #justify=tkinter.CENTER,
                                                        text_font=("Roboto Medium", 8))
        self.label_display.grid(column=1, row=1, sticky="s", padx=15, pady=15),



        self.button_5 = customtkinter.CTkButton(master=self.frame_left,
                                                text="Clear",
                                                # command=lambda: getWeather(userCity.get()))
                                                command=self.clear_button_event,
                                                text_font=("Roboto Medium", 12),

                                                )
        self.button_5.grid(row=4, column=0, pady=10, padx=10, sticky="")

        self.button_6 = customtkinter.CTkLabel(master=self.frame_left,
                                                text="This app uses .pandas. for Python to select tables "
                                               "from a selected website and displays the table "
                                               "next version to have a user input subject and automatically collected",
                                                # command=lambda: getWeather(userCity.get()))

                                                text_font=("Roboto Medium", 8),
                                               wraplength=150)
        self.button_6.grid(row=5, column=0, pady=10, padx=10, sticky="")






        # set default values
        self.radio_button_1.set('Population Density-City')
        self.label_display.insert(tkinter.END, population_data )
        self.label_display.insert(tkinter.END, "\n\n")
        new = self.label_display.grab_current()
        self.switch_2.select()


    def clear_button_event(self):
        self.label_display.insert(tkinter.END, "\n\n")
        print('clear')



    def button_event24(self):
        #self.label_display.set_text(getWeather(city))
        print("open 24")
        webbrowser.open_new_tab('https://pythonbasics.org/pandas-web-scraping/')


    def button_eventweek(self):
        #self.label_display.set_text(getWeatherweek(city))
        print("open week")
        webbrowser.open_new_tab(url_wiki)




    def button_event(self, event):
        self.label_display.insert(tkinter.END, population_data)
        self.label_display.insert(tkinter.END, "\n\n")

    # print(self.radio_button_1.grab_current())

    def change_mode(self):
        if self.switch_2.get() == 1:
            customtkinter.set_appearance_mode("dark")
        else:
            customtkinter.set_appearance_mode("light")

    def on_closing(self, event=0):
        self.destroy()

    def start(self):
        #self.mainloop()"""


