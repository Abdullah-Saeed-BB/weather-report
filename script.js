import {getData} from './caller.js';

const currentDate = new Date();
let currentWeather;
let lastActive;

const allForecasts = new Array();

const getWeatherIcon = (iconId) => (`https://openweathermap.org/img/wn/${iconId}@2x.png`);

function appendForecast(forecast, hourly=false) {
   let weatherDesc = forecast.weather[0].description
   const newForecast = {
      temp: forecast.main.temp,
      wind: {speed: forecast.wind.speed, deg: forecast.wind.deg},
      dt_txt: hourly? 
         forecast.dt_txt.toLocaleTimeString('default', {day: 'numeric', weekday: 'short', hour: 'numeric'}):
         forecast.dt_txt.toLocaleDateString('default', {weekday: 'short', month: 'long', day: '2-digit'}),
      weatherDescription: weatherDesc[0].toUpperCase() + weatherDesc.slice(1)      
   }
   switch (weatherDesc) {
      case 'clear sky':
      case 'few clouds':
         if (forecast.sys.pod == 'n') {
            newForecast['background'] = ['#080a2c', '#333759'];
         }
         else {
            newForecast['background'] = ['#6eb5e4', '#b8ebff'];
         }
         break
      case 'scattered clouds':
      case 'mist':
         newForecast['background'] = ['#a0a8bb', '#597296'];
         break
      case 'broken clouds':
      case 'shower rain':
      case 'rain':
      case 'thunderstorm':
         newForecast['background'] = ['#6f7686', '#344255']
         break
      case 'snow':
         newForecast['background'] = ['#2643b9', '#7378d9'];
         break
   }


   allForecasts.push(newForecast);

   return allForecasts.length - 1;
}

function updateForecast(data) {
   document.body.style.backgroundImage = `linear-gradient(${data['background'].join(',')})`;
   document.getElementById('temp-temp').textContent = data.temp + '°';
   document.getElementById('temp-date').textContent = data.dt_txt;
   document.getElementById('temp-wind').textContent = `${data.wind.speed} m/s ${data.wind.deg}°`;
   document.getElementById('temp-desc').textContent = data.weatherDescription;
}

// Current weather
getData('https://api.openweathermap.org/data/2.5/weather?', (d) => {
   document.getElementById('error-popup').style.display = 'none';
   document.getElementById('data-section').style.display = 'block';

   currentWeather = {...d, dt_txt: currentDate};
   appendForecast(currentWeather); 

   document.getElementById('temp-city').textContent = currentWeather.name;
   updateForecast(allForecasts[0])
   
   lastActive = document.querySelector('.forecast.active');

   document.getElementById('today-forecast-img').src = getWeatherIcon(d.weather[0].icon)
   document.getElementById('today-forecast-temp').textContent = d.main.temp + '°';
});

// Forecast section
getData('https://api.openweathermap.org/data/2.5/forecast?', (d) => {
   const forecastList = d.list.map(f => {
      f.dt_txt = new Date(f.dt_txt);
      return f
   })
   const forecasts = {'daily': new Array(), 'horuly': new Array()}

   forecasts['horuly'] = forecastList.slice(0, 9);

   for (let i = (24 - forecastList[0].dt_txt.getHours())/3; i < forecastList.length; i += 8) {
      let forecastsDay = forecastList.slice(i, i + 8);
      console.log(forecastsDay);
      if (forecastsDay.length >= 5) {
         console.log(forecastsDay[4]);
         forecasts['daily'].push(forecastsDay[4])
      }
      else {
         // console.log(forecastsDay[forecastsDay.length - 1]);
         forecasts['daily'].push(forecastsDay[forecastsDay.length - 1])
      }
   }

   for (let section in forecasts) {
      for (let forecast of forecasts[section]) {
         const li = document.createElement('li');
         const img = document.createElement('img');
         const temp = document.createElement('h4');
         const date = document.createElement('p');

         li.classList.add('forecast')
         li.id = appendForecast(forecast);
         img.src = getWeatherIcon(forecast.weather[0].icon);
         temp.textContent = forecast.main.temp + '°';

         li.append(
            date,
            img,
            temp
         );

         if (section == 'horuly') {
            date.textContent = forecast.dt_txt.getDay() == currentDate.getDay() ?
               forecast.dt_txt.toLocaleTimeString('default', {hour: 'numeric'}):
               forecast.dt_txt.toLocaleTimeString('default', {weekday: 'short', hour: 'numeric'});
            document.querySelector('#hourly-forecast ul').appendChild(li);
         }
         else {
            li.appendChild(document.createElement('hr'));
            date.textContent = forecast.dt_txt.toLocaleDateString('default', {weekday: 'long'});
         
            document.querySelector('#daily-forecast ul').appendChild(li);
         }
      }
   }
   // Delete the last <hr> tag in daily forcast
   const hrs = document.querySelectorAll('#daily-forecast ul hr');
   hrs[hrs.length - 1].remove()

   document.getElementById('forecast-section').addEventListener('click', forecastPreview);
});

function forecastPreview(e) {
   if ((['HR', 'P', 'H4', 'IMG'].indexOf(e.target.tagName) !== -1 && e.target.parentNode.className == 'forecast') || e.target.classList.contains('forecast')) {
      const forecast = e.target.classList.contains('forecast')? e.target: e.target.parentNode;
      if (!forecast.classList.contains('active')) {
         lastActive.classList.remove('active');
         forecast.classList.add('active');
         lastActive = forecast;

         updateForecast(allForecasts[forecast.id])
      }
   }
}