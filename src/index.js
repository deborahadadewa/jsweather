let apiKey = "2527ce6a742a6e5a11df614a9264b458";
let endPoint = `https://api.openweathermap.org/data/2.5/weather?`;

let errorSign = document.querySelector("#error-sign");
let toggleWeatherContent = document.querySelector("#toggle-weather-content");

let locationClicked = false;

function formatTime(time) {
    if (time < 10) {
        return `0${time}`;
    } else {
        return time;
    }
}

function formatDate(dateInput) {
    return `Updated: ${dateInput.toLocaleTimeString([], {
    hour12: true,
    hour: "numeric",
    minute: "2-digit",
    weekday: "long",
  })}`;
}

let currentTimeLabel = document.querySelector("#current-time");
currentTimeLabel.innerHTML = formatDate(new Date());

function formatDay(timestamp) {
    let date = new Date(timestamp * 1000);
    let day = date.getDay();
    let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return days[day];
}

function displayForecast(response) {
    let forecastData = response.data.daily;
    let forecastHTML = `<div class="row">`;

    forecastData.forEach(function(forecastDay, index) {
        if (index < 5) {
            if (index === 0) {
                if (forecastDay.rain) {
                    let precipitationLabel = document.querySelector("#precipitation");
                    precipitationLabel.innerHTML = `Precip: ${Math.round(
            forecastDay.rain
          )} mm`;
                }
            }
            forecastHTML += `
            <div class="col">
                <div class="forecast-day" id="forecast-day">
                    <p>${formatDay(forecastDay.dt)}</p>
                    <img class="forecast-icon" src="https://openweathermap.org/img/wn/${
                      forecastDay.weather[0].icon
                    }@2x.png" alt="Weather icon" />
                </div>
                <div class="forecast-temperature">
                    <span class="hi">${Math.round(forecastDay.temp.max)}°</span>
                    <span class="lo">${Math.round(forecastDay.temp.min)}°</span>
                </div>
            </div>`;
        }
    });

    forecastHTML += `</div>`;

    let forecast = document.querySelector("#forecast");
    forecast.innerHTML = forecastHTML;
}

function toggleForecast() {
    let toggleForecastBtn = document.querySelector("#toggle-forecast");

    toggleForecastBtn.addEventListener("click", () => {
        if (forecast.style.display === "") {
            forecast.style.display = "block";
            toggleForecastBtn.innerHTML = "Tap to hide five day forecast";
        } else {
            forecast.style.display = "";
            toggleForecastBtn.innerHTML = "Tap to show five day forecast";
        }
    });
}

function getOnecallApi(lat, lon) {
    let apiURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    axios.get(apiURL).then(displayForecast);
}

function displayError(errorMessageHTML, errorNote) {
    let errorMesage = document.querySelector("#error-message");
    let errorType = errorNote;
    let errorImage = document.querySelector("#error-image");

    errorSign.style.display = "block";
    errorMesage.innerHTML = errorMessageHTML;

    toggleWeatherContent.style.display = "none";
    if (errorType === "general") {
        errorImage.innerHTML = `<img src="media/storm.png" alt="storm" />
`;
    } else if (errorType === "location") {
        errorImage.innerHTML = `<img src="media/lost-space.png" alt="lost"/>`;
    } else {
        errorImage.innerHTML = `<img src="media/where.png" alt="globe"/>`;
        if (errorImage.style.width === "120px") {
            errorImage.style.width = "0px";
        }
    }
}

function removeErrorSign() {
    errorSign.style.display = "none";
    toggleWeatherContent.style.display = "block";
}

function displayWeather(response) {
    if (!locationClicked) {
        getOnecallApi(response.data.coord.lat, response.data.coord.lon);
    }
    removeErrorSign();

    let city = response.data.name;
    let cityHeading = document.querySelector("#city-heading");

    cityHeading.innerHTML = city.toUpperCase();
    let currentTempLabel = document.querySelector("#current-temp-label");

    currentTempLabel.innerHTML = Math.round(response.data.main.temp);

    let weatherDescriptionLabel = document.querySelector("#weather-description");
    weatherDescriptionLabel.innerHTML = response.data.weather[0].description;

    let currentTempIcon = document.querySelector("#current-temp-icon");
    let weatherIconId = response.data.weather[0].icon;
    let iconUrl = `https://openweathermap.org/img/wn/${weatherIconId}@2x.png`;
    currentTempIcon.src = iconUrl;

    let precipitationLabel = document.querySelector("#precipitation");
    let humidityLabel = document.querySelector("#humidity");
    let windLabel = document.querySelector("#wind");

    if (response.data.rain) {
        precipitationLabel.innerHTML = `Precip: ${response.data.rain["1h"]} mm`;
    } else if (response.data.snow) {
        precipitationLabel.innerHTML = `Precip: ${response.data.snow["1h"]} mm`;
    } else {
        precipitationLabel.innerHTML = `Precip: 0 mm`;
    }

    humidityLabel.innerHTML = `Humidity: ${response.data.main.humidity}%`;
    windLabel.innerHTML = `Wind: ${Math.round(response.data.wind.speed)} km/h`;
}

///Get weather by city search
function searchCity(city) {
    locationClicked = false;

    if (city) {
        let apiUrlCity = `${endPoint}q=${city}&appid=${apiKey}&units=metric`;

        axios.get(apiUrlCity).then(displayWeather, (error) => {
            displayError(
                `<p>I've traveled around the world<br /> 
                Through storm and rain<br />
                But I can't seem to find a city named <span>"${city}"</span>.<br />
                What I want to say<br />
                In simpler terms is</p>
                <p>Please check your spelling and try again ;).</p>`,
                "general"
            );
        });
    } else {
        displayError(`<p>Please enter a city name</p>`, " ");
    }
}

function handleSubmit(event) {
    event.preventDefault();

    //Get city from search bar
    let searchCityLabel = document.querySelector("#search");
    let city = searchCityLabel.value.trim();
    searchCity(city);
}
let searchForm = document.querySelector("#search-form");
searchForm.addEventListener("submit", handleSubmit);

///Get weather by location
function retrieveLocation(event) {
    event.preventDefault();

    navigator.geolocation.getCurrentPosition(
        function(position) {
            let latitude = position.coords.latitude;
            let longitude = position.coords.longitude;
            let apiUrlLatLong = `${endPoint}lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
            //Make API call
            locationClicked = true;

            axios.get(apiUrlLatLong).then(displayWeather);
            getOnecallApi(latitude, longitude);
        },
        (error) => {
            displayError(
                `<p>I can't find you anywhere on this planet<br/> 
                Please turn on your location or enter your current city using the search bar :) </p>`,
                "location"
            );
        }
    );

    searchForm.reset();
}
let locationbutton = document.querySelector("#location-button");
locationbutton.addEventListener("click", retrieveLocation);

//Default city
searchCity("Tema");
toggleForecast();