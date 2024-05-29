const cityHistoryDiv = document.querySelector('#prevCities')
const searchInput = document.querySelector('#city-input')
const currentWeatherDiv = document.querySelector('#currentWeather')
const forecastDiv = document.querySelector('#forecast')
const searchForm = document.querySelector('.form')

let cityHistory = []

dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

var weatherApiRootUrl = 'https://api.openweathermap.org';
const weatherApiKey = '7229a6e7e0b0a94619e37305a2401bbd';



function initSearchHistory() {
    var storedHistory = localStorage.getItem('search-history');
    if (storedHistory) {
      cityHistory = JSON.parse(storedHistory);
    }
    renderSearchHistory();
};

function appendToHistory(search) {
  if (cityHistory.indexOf(search) !== -1) {
    return;
  }
  cityHistory.push(search);

  localStorage.setItem('search-history', JSON.stringify(cityHistory));
  renderSearchHistory();
};

function renderSearchHistory() {
    cityHistoryDiv.innerHTML = '';
  
    for (var i = cityHistory.length - 1; i >= 0; i--) {
      var btn = document.createElement('button');
      btn.setAttribute('type', 'button');
      btn.setAttribute('aria-controls', 'today forecast');
      btn.classList = 'btn btn-info history-btn btn-history m-2';
  
      btn.setAttribute('data-search', cityHistory[i]);
      btn.textContent = cityHistory[i];
      cityHistoryDiv.append(btn);
    }
};

function handleSearchHistoryClick(e) {
    if (!e.target.matches('.btn-history')) {
      return;
    }
  
    var btn = e.target;
    var search = btn.getAttribute('data-search');
    fetchCoords(search);
};

function handleSearchFormSubmit(e) {
    if (!searchInput.value) {
      return;
    }
  
    e.preventDefault();
    var search = searchInput.value.trim();
    fetchCoords(search);
    searchInput.value = '';
};

function fetchCoords(search) {
    var apiUrl = `${weatherApiRootUrl}/geo/1.0/direct?q=${search}&limit=5&appid=${weatherApiKey}`;
  
    fetch(apiUrl)
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        if (!data[0]) {
          alert('Location not found');
        } else {
          appendToHistory(search);
          fetchWeather(data[0]);
        }
      })
      .catch(function (err) {
        console.error(err);
      });
};

function fetchWeather(location) {
    var { lat } = location;
    var { lon } = location;
    var city = location.name;
  
    var apiUrl = `${weatherApiRootUrl}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${weatherApiKey}`;
  
    fetch(apiUrl)
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        renderItems(city, data);
      })
      .catch(function (err) {
        console.error(err);
      });
};

function renderItems(city, data) {
    renderCurrentWeather(city, data.list[0], data.city.timezone);
    renderForecast(data.list);
};

function renderCurrentWeather(city, weather) {
    var date = dayjs().format('M/D/YYYY');

    var tempF = weather.main.temp;
    var windMph = weather.wind.speed;
    var humidity = weather.main.humidity;
    var iconUrl = `https://openweathermap.org/img/w/${weather.weather[0].icon}.png`;
    var iconDescription = weather.weather[0].description || weather[0].main;
  
    var card = document.createElement('div');
    var cardBody = document.createElement('div');
    var heading = document.createElement('h2');
    var weatherIcon = document.createElement('img');
    var tempEl = document.createElement('p');
    var windEl = document.createElement('p');
    var humidityEl = document.createElement('p');
  
    card.setAttribute('class', 'card');
    cardBody.setAttribute('class', 'card-body');
    card.append(cardBody);
  
    heading.setAttribute('class', 'h3 card-title');
    tempEl.setAttribute('class', 'card-text');
    windEl.setAttribute('class', 'card-text');
    humidityEl.setAttribute('class', 'card-text');
  
    heading.textContent = `${city} (${date})`;
    weatherIcon.setAttribute('src', iconUrl);
    weatherIcon.setAttribute('alt', iconDescription);
    weatherIcon.setAttribute('class', 'weather-img');
    heading.append(weatherIcon);
    tempEl.textContent = `Temp: ${tempF}°F`;
    windEl.textContent = `Wind: ${windMph} MPH`;
    humidityEl.textContent = `Humidity: ${humidity} %`;
    cardBody.append(heading, tempEl, windEl, humidityEl);
  
    currentWeatherDiv.innerHTML = '';
    currentWeatherDiv.append(card);
};

function renderForecast(dailyForecast) {
    var startDt = dayjs().add(1, 'day').startOf('day').unix();
    var endDt = dayjs().add(6, 'day').startOf('day').unix();
  
    var headingCol = document.createElement('div');
    var heading = document.createElement('h4');
  
    headingCol.setAttribute('class', 'col-12');
    heading.textContent = '5-Day Forecast:';
    headingCol.append(heading);
  
    forecastDiv.innerHTML = '';
    forecastDiv.append(headingCol);
  
    for (var i = 0; i < dailyForecast.length; i++) {
      if (dailyForecast[i].dt >= startDt && dailyForecast[i].dt < endDt) {
        if (dailyForecast[i].dt_txt.slice(11, 13) == "12") {
          renderForecastCard(dailyForecast[i]);
        }
      }
    }
};

function renderForecastCard(forecast) {
    var iconUrl = `https://openweathermap.org/img/w/${forecast.weather[0].icon}.png`;
    var iconDescription = forecast.weather[0].description;
    var tempF = forecast.main.temp;
    var humidity = forecast.main.humidity;
    var windMph = forecast.wind.speed;
  
    var col = document.createElement('div');
    var card = document.createElement('div');
    var cardBody = document.createElement('div');
    var cardTitle = document.createElement('h5');
    var weatherIcon = document.createElement('img');
    var tempEl = document.createElement('p');
    var windEl = document.createElement('p');
    var humidityEl = document.createElement('p');
  
    col.append(card);
    card.append(cardBody);
    cardBody.append(cardTitle, weatherIcon, tempEl, windEl, humidityEl);
  
    col.setAttribute('class', 'col-md');
    col.classList.add('five-day-card');
    card.setAttribute('class', 'card bg-primary h-100 text-white');
    cardBody.setAttribute('class', 'card-body p-2');
    cardTitle.setAttribute('class', 'card-title');
    tempEl.setAttribute('class', 'card-text');
    windEl.setAttribute('class', 'card-text');
    humidityEl.setAttribute('class', 'card-text');
  
    cardTitle.textContent = dayjs(forecast.dt_txt).format('M/D/YYYY');
    weatherIcon.setAttribute('src', iconUrl);
    weatherIcon.setAttribute('alt', iconDescription);
    tempEl.textContent = `Temp: ${tempF} °F`;
    windEl.textContent = `Wind: ${windMph} MPH`;
    humidityEl.textContent = `Humidity: ${humidity} %`;
  
    forecastDiv.append(col);
};





initSearchHistory();
searchForm.addEventListener('submit', handleSearchFormSubmit);
cityHistoryDiv.addEventListener('click', handleSearchHistoryClick);