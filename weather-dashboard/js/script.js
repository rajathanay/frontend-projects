const API_KEY = "API";

const GEO_URL = "https://api.openweathermap.org/geo/1.0/direct";

const WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";

const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

const searchForm = document.getElementById("search-form");

const cityInput = document.getElementById("city-input");

const locationButton = document.getElementById("location-button");

const statusMessage = document.getElementById("status-message");

const currentWeather = document.getElementById("current-weather");

const forecastSection = document.getElementById("forecast-section");

const forecastContainer = document.getElementById("forecast-container");

const cityName = document.getElementById("city-name");

const weatherDate = document.getElementById("weather-date");

const weatherIcon = document.getElementById("weather-icon");

const temperature = document.getElementById("temperature");

const weatherDescription = document.getElementById("weather-description");

const feelsLike = document.getElementById("feels-like");

const humidity = document.getElementById("humidity");

const windSpeed = document.getElementById("wind-speed");

const pressure = document.getElementById("pressure");

// Search by city

searchForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const city = cityInput.value.trim();

  if (!city) {
    return;
  }

  try {
    showLoading(`Finding weather for ${city}...`);

    const location = await getCoordinates(city);

    await loadWeather(location.lat, location.lon);
  } catch (error) {
    showError(error.message);
  }
});

async function getCoordinates(city) {
  const url =
    `${GEO_URL}?q=${encodeURIComponent(city)}` + `&limit=1&appid=${API_KEY}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Unable to search for that city.");
  }

  const locations = await response.json();

  if (locations.length === 0) {
    throw new Error("City not found. Try another city name.");
  }

  return locations[0];
}

// Current location

locationButton.addEventListener("click", function () {
  if (!navigator.geolocation) {
    showError("Geolocation is not supported by this browser.");

    return;
  }

  showLoading("Getting your current location...");

  navigator.geolocation.getCurrentPosition(
    async function (position) {
      const latitude = position.coords.latitude;

      const longitude = position.coords.longitude;

      try {
        await loadWeather(latitude, longitude);
      } catch (error) {
        showError(error.message);
      }
    },

    function () {
      showError(
        "Unable to access your location. Check your browser permission.",
      );
    },
  );
});

// Weather requests

async function loadWeather(latitude, longitude) {
  const weatherUrl =
    `${WEATHER_URL}?lat=${latitude}` +
    `&lon=${longitude}` +
    `&units=imperial` +
    `&appid=${API_KEY}`;

  const forecastUrl =
    `${FORECAST_URL}?lat=${latitude}` +
    `&lon=${longitude}` +
    `&units=imperial` +
    `&appid=${API_KEY}`;

  const [weatherResponse, forecastResponse] = await Promise.all([
    fetch(weatherUrl),
    fetch(forecastUrl),
  ]);

  if (!weatherResponse.ok || !forecastResponse.ok) {
    throw new Error("Weather information could not be loaded.");
  }

  const weatherData = await weatherResponse.json();

  const forecastData = await forecastResponse.json();

  displayCurrentWeather(weatherData);

  displayForecast(forecastData.list);

  statusMessage.textContent = `Weather updated for ${weatherData.name}.`;

  statusMessage.classList.remove("error");
}

// Current weather display

function displayCurrentWeather(data) {
  const condition = data.weather[0];

  cityName.textContent = `${data.name}, ${data.sys.country}`;

  weatherDate.textContent = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  temperature.textContent = `${Math.round(data.main.temp)}°F`;

  weatherDescription.textContent = condition.description;

  feelsLike.textContent = `${Math.round(data.main.feels_like)}°F`;

  humidity.textContent = `${data.main.humidity}%`;

  windSpeed.textContent = `${Math.round(data.wind.speed)} mph`;

  pressure.textContent = `${data.main.pressure} hPa`;

  weatherIcon.src = `https://openweathermap.org/img/wn/${condition.icon}@2x.png`;

  weatherIcon.alt = condition.description;

  currentWeather.hidden = false;
}

// 5-day forecast

function displayForecast(list) {
  const dailyForecasts = getDailyForecasts(list);

  forecastContainer.innerHTML = "";

  dailyForecasts.forEach((forecast) => {
    const card = document.createElement("article");

    card.className = "forecast-card";

    const date = new Date(forecast.dt * 1000);

    const day = date.toLocaleDateString("en-US", {
      weekday: "short",
    });

    const shortDate = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const condition = forecast.weather[0];

    card.innerHTML = `
                <h3>${day}</h3>

                <p class="forecast-date">
                    ${shortDate}
                </p>

                <img
                    src="https://openweathermap.org/img/wn/${condition.icon}@2x.png"
                    alt="${condition.description}"
                >

                <p class="forecast-temp">
                    ${Math.round(forecast.main.temp)}°F
                </p>

                <p class="forecast-description">
                    ${condition.description}
                </p>
            `;

    forecastContainer.appendChild(card);
  });

  forecastSection.hidden = false;
}

function getDailyForecasts(list) {
  const days = {};

  list.forEach((item) => {
    const date = item.dt_txt.split(" ")[0];

    const hour = Number(item.dt_txt.split(" ")[1].split(":")[0]);

    if (!days[date]) {
      days[date] = item;

      return;
    }

    const savedHour = Number(days[date].dt_txt.split(" ")[1].split(":")[0]);

    if (Math.abs(hour - 12) < Math.abs(savedHour - 12)) {
      days[date] = item;
    }
  });

  return Object.values(days).slice(0, 5);
}

// Status messages

function showLoading(message) {
  statusMessage.textContent = message;

  statusMessage.classList.remove("error");

  currentWeather.hidden = true;

  forecastSection.hidden = true;
}

function showError(message) {
  statusMessage.textContent = message;

  statusMessage.classList.add("error");

  currentWeather.hidden = true;

  forecastSection.hidden = true;
}
