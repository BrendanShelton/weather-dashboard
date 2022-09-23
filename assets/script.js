var APIKey = "cae9ee7e321e06d8e3aaa7950db54c6a";

//selects the search button
var searchBtn = document.querySelector("#search");
//selects the bar where the user enters the city for which weather data will be displayed
var cityInput = document.querySelector("#cityInput");
//selects the div where the previously searched cities will be listed
var searchHistoryEl = document.querySelector("#searchHistory");
//selects the element where today's whether will be displayed
var todayEl = $("#today");
//selects the div where the weather data of the next five days will be displayed
var forecastEl = $("#forecast");

var city;
var state;
var latitude;
var longitude;

//retrieves the search history from local memory and appends each item to the page below the search bar
var searchHistory = []
var storedSearchHistory = JSON.parse(localStorage.getItem("searchHistory"));
if (storedSearchHistory !== null) {
    searchHistory = storedSearchHistory;
}
for (i = 0; i < searchHistory.length; i++) {
    var historyItem = document.createElement("p");
    historyItem.textContent = searchHistory[i];
    searchHistoryEl.appendChild(historyItem);
}

//executes when the user clicks on the search button
function searchCity(event) {
    event.preventDefault();
    //gets the text the user entered into the search bar
    city = cityInput.value;

    //adds the entered text to the search history after making sure that it has not been entered before and that text has been entered 
    if (!searchHistory.includes(city) && city) {
        searchHistory.push(city);
    }
    //appends the newly entered city name to the page below the search bar
    var historyItem = document.createElement("p");
    historyItem.textContent = city;
    searchHistoryEl.appendChild(historyItem);
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));

    fetchData();
}

//executes when the user clicks on an item from the search history
function chooseFromHistory(event) {
    event.preventDefault();
    //gets the text of the item which has been clicked
    city = event.target.textContent;

    fetchData()
}

function fetchData() {
    //finds the latitude and longitude of the city which the user entered or selected
    fetch('http://api.openweathermap.org/geo/1.0/direct?q=' + city + '&limit=1&appid=' + APIKey)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
        console.log(data);
        //if there is no data for the name the user entered
        if (!data.length) {
            alert("no data found for entered name")
            return
        }
        latitude = data[0].lat
        longitude = data[0].lon
        city = data[0].name
        state = data[0].state

        //fetches current weather data of chosen location using latitude and longitude
        fetch('http://api.openweathermap.org/data/2.5/weather?lat=' + latitude + '&lon=' + longitude + '&units=imperial&appid=' + APIKey)
            .then(function (response) {
                return response.json();
            })
            .then(function (currentData) {
                console.log(currentData);
                displayCurrent(currentData)
            });
        //fetches forecasted weather data of chosen location for next five days using latitude and longitude
        fetch('http://api.openweathermap.org/data/2.5/forecast?lat=' + latitude + '&lon=' + longitude + '&units=imperial&appid=' + APIKey)
            .then(function (response) {
                return response.json();
            })
            .then(function (forecastData) {
                console.log(forecastData);
                displayForecast(forecastData)
            });

    });
}


function displayCurrent(current) {
    //sets the text of the heading in the "today" element to be the name of the chosen location and and today's date in M/D/YY format
    todayEl.children().eq(0).text(city + ", " + state + " " +  moment().format("M/D/YY"))
    //sets the text of the p elements in the "today" element to the corresponding weather data
    todayEl.children().eq(1).children().eq(0).text(current.main.temp + " F")
    todayEl.children().eq(2).children().eq(0).text(current.wind.speed + " MPH")
    todayEl.children().eq(3).children().eq(0).text(current.main.humidity + "%")
}

function displayForecast(forecast) {
    var dailyForecast = []
    //Adds the weather data at 3:00 PM of each of the next five days to an array
    for (i = 0; i < forecast.list.length; i++) {
        if (forecast.list[i].dt_txt.includes("15:00:00")) {
            dailyForecast.push(forecast.list[i])
        }
    }
    
    //sets the text of each element of each card with the corresponding weather data of the corresponding day
    for (i = 0; i < 5; i++) {
        forecastEl.children().eq(i).children().eq(0).text(moment(dailyForecast[i].dt_txt).format("M/D/YY h:mmA"))
        forecastEl.children().eq(i).children().eq(1).children().eq(0).text(dailyForecast[i].main.temp + " F")
        forecastEl.children().eq(i).children().eq(2).children().eq(0).text(dailyForecast[i].wind.speed + " MPH")
        forecastEl.children().eq(i).children().eq(3).children().eq(0).text(dailyForecast[i].main.humidity + "%")
    }
}

//when the user clicks on the search button
searchBtn.addEventListener("click", searchCity)
//when the user clicks on an item in the search history
searchHistoryEl.addEventListener("click", chooseFromHistory)