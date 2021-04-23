let cityHeading = document.querySelector("#city-heading");
let currentTempLabel = document.querySelector("#current-temp-label");

let btnCelsius = document.querySelector("#btn-celsius");
let btnFarenheit = document.querySelector("#btn-farenheit");
let currentTempCelsius = null;

let apiKey = "2527ce6a742a6e5a11df614a9264b458";
let endPoint = `https://api.openweathermap.org/data/2.5/weather?`;

function formatTime(time) {
    if (time < 10) {
        return `0${time}`;
    } else {
        return time;
    }
}

function formatDate(dateInput) {
    return `${dateInput.toLocaleTimeString([], {
    hour12: true,
    hour: "numeric",
    minute: "2-digit",
    weekday: "long",
  })}`;
}
let currentTimeLabel = document.querySelector("#current-time");
currentTimeLabel.innerHTML = formatDate(new Date());

function displayWeather(response) {
    let city = response.data.name;
    cityHeading.innerHTML = city;
    console.log("reponse says:");
    console.log(response.data);

    currentTempCelsius = response.data.main.temp;
    currentTempLabel.innerHTML = Math.round(currentTempCelsius);

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
        precipitationLabel.innerHTML = `Precipitation: ${response.data.rain["1h"]} mm`;
    } else if (response.data.snow) {
        precipitationLabel.innerHTML = `Precipitation: ${response.data.snow["1h"]} mm`;
    } else {
        precipitationLabel.innerHTML = `Precipitation: 0%`;
    }

    humidityLabel.innerHTML = `Humidity: ${response.data.main.humidity}%`;
    windLabel.innerHTML = `Wind: ${Math.round(response.data.wind.speed)} km/h`;
}

///Get weather by city search
function searchCity(city) {
    if (city) {
        let apiUrlCity = `${endPoint}q=${city}&appid=${apiKey}&units=metric`;
        axios.get(apiUrlCity).then(displayWeather);
    } else {
        cityHeading.innerHTML = "Please enter a city";
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

    //Get location coords
    navigator.geolocation.getCurrentPosition(function(position) {
        let latitude = position.coords.latitude;
        let longitude = position.coords.longitude;
        let apiUrlLatLong = `${endPoint}lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
        //Make API call
        axios.get(apiUrlLatLong).then(displayWeather);
    });
}
let locationbutton = document.querySelector("#location-button");
locationbutton.addEventListener("click", retrieveLocation);

///Convert temperature units
function showFarenheit(event) {
    btnCelsius.classList.remove("active");
    btnFarenheit.classList.add("active");
    currentTempLabel.innerHTML = Math.round((currentTempCelsius * 9) / 5 + 32);
}

function showCelsius(event) {
    btnCelsius.classList.add("active");
    btnFarenheit.classList.remove("active");
    let currentTemp = Math.round(currentTempCelsius);
    currentTempLabel.innerHTML = currentTemp;
}
btnCelsius.addEventListener("click", showCelsius);
btnFarenheit.addEventListener("click", showFarenheit);

//Default city
searchCity("Monrovia");