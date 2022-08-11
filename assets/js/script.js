var apiKey = "e61b4443ce6ea4ff5c934cd28041b0b3";
var today = dayjs().format('DD/MM/YYYY');
var searchHistoryList = [];
var searchButton = document.getElementById('searchBtn');
var city = document.getElementById('cityName');
var cityLat = 0;
var cityLon = 0;



function getWeatherApi() {

  // get the lat and lon
  var cityName = city.value;

  // storing the city name in the local storage
      if (!searchHistoryList.includes(cityName)) {
        searchHistoryList.push(cityName);
        localStorage.setItem("city", JSON.stringify(searchHistoryList));

        var notes = JSON.parse(localStorage.getItem("city"));
          $("#searchHistory").empty();
        
          for(var i = 0; i< notes.length; i++){
            var note = notes[i];
            var searchedCity = $(`
              <li class="list-group-item">${note}</li>
            `);
          $("#searchHistory").append(searchedCity);
        };
      };

    //  console.log(searchHistoryList);

  var cityCordRequestUrl = 'https://api.openweathermap.org/geo/1.0/direct?q='+cityName+'&limit=5&appid='+apiKey;

   console.log(cityCordRequestUrl);

  fetch(cityCordRequestUrl)
    .then(response => response.json())
    .then(data=> { 
    console.log(data); 

    console.log(data[0].lat);
    console.log(data[0].lon);

    cityLat = data[0].lat;
    cityLon = data[0].lon;

    // get the current weather
    var weatherApiUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat='+cityLat+'&lon='+cityLon+'&exclude=hourly,daily,minutely&units=metric&appid='+apiKey;

    // console.log(weatherApiUrl);

    fetch(weatherApiUrl)
      .then(response => response.json())
      .then(data=> { 
      console.log(data);
      console.log(data.current.temp);

      $("#cityDetail").empty();

      var currentIconUrl = "http://openweathermap.org/img/w/"+data.current.weather[0].icon+".png";

      console.log(currentIconUrl);

            var currentCity = $(`
            <h3 id="currentCity">
                ${cityName} ${today} 
            </h3>
            <p><img src="${currentIconUrl}" alt="${data.current.weather[0].description}"/></p>
            <p>Temperature: ${data.current.temp} °C</p>
            <p>Humidity: ${data.current.humidity}\%</p>
            <p>Wind Speed: ${data.current.wind_speed} m/s</p>
            
        `);

        $("#cityDetail").append(currentCity);

        var uvIndex = data.current.uvi;
        var uvIndexP = $(`
          <p>UV Index: 
            <span id="uvIndexColor" class="px-2 py-2 rounded">${uvIndex}</span>
            </p>
        `);

        $("#cityDetail").append(uvIndexP);

        if (uvIndex >= 0 && uvIndex <= 2) {
          $("#uvIndexColor").css("background-color", "#3EA72D").css("color", "white");
      } else if (uvIndex > 2 && uvIndex <= 7) {
          $("#uvIndexColor").css("background-color", "#FFF300");
      } else {
          $("#uvIndexColor").css("background-color", "#E53210").css("color", "white"); 
      };

    });

    fiveDayForecast()

  });

// get weather forecast for next 5 days
function fiveDayForecast(){
  var forecastApiUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat='+cityLat+'&lon='+cityLon+'&exclude=hourly,current,minutely&units=metric&appid='+apiKey;

  fetch(forecastApiUrl)
    .then(response => response.json())
    .then(data=> { 
    console.log(data);

    $("#fiveDay").empty();

    for (let i = 1; i < 6; i++) {
      var cityInfo = {
        date: data.daily[i].dt,
        icon: data.daily[i].weather[0].icon,
        temp: data.daily[i].temp.day,
        humidity: data.daily[i].humidity
      };

      var currentDate = dayjs.unix(cityInfo.date).format("DD/MM/YYYY");
      var forecastIconUrl = `<img src="https://openweathermap.org/img/w/${cityInfo.icon}.png" alt="${data.daily[i].weather[0].main}" />`;
      var forecastCard = $(`
        <div class="pl-3">
          <div class="card pl-3 pt-3 mb-3 bg-primary text-light" style="width: 12rem;>
            <div class="card-body">
                <h5>${currentDate}</h5>
                <p>${forecastIconUrl}</p>
                <p>Temp: ${cityInfo.temp} °C</p>
                <p>Humidity: ${cityInfo.humidity}\%</p>
            </div>
          </div>
        </div>
      `);

      $("#fiveDay").append(forecastCard);
    };

    console.log(cityInfo);

    console.log(forecastIconUrl);

    });
  };
}

searchButton.addEventListener('click', getWeatherApi);

//  When a city in the search history is clicked then current and future conditions for that city is shown
$(document).on("click", ".list-group-item", function() {
  var listCity = $(this).text();

  console.log("selected item " + listCity);
  city.value = listCity;
  getWeatherApi();
});
