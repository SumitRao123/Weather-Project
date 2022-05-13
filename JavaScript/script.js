let weatherAPIkey = "b8f5046c734acc5fe974f7af2a2219ca"
let WeatherBaseEndPoint = "https://api.openweathermap.org/data/2.5/weather?appid=" + weatherAPIkey +"&units=metric";
let forecastEndPoint  = "https://api.openweathermap.org/data/2.5/forecast?units=metric&appid="+ weatherAPIkey 
let searchInp = document.querySelector(".weather_search");
let WeatherCity = document.querySelector(".weather_city");
let day = document.querySelector(".weather_day");
let Humid =  document.querySelector(".humid");
let p = document.getElementById("press");
let wind = document.querySelector("#weather_indicator--wind>.value");
let temp = document.querySelector(".weather_temperature>.value");
let forecastBlock = document.querySelector(".weather_forecast");
let image = document.querySelector(".weather_image")
let geocodingBaseEndpoint = "http://api.openweathermap.org/geo/1.0/direct?limit=5&appid=" + weatherAPIkey + "&q=";
let datalist =  document.querySelector("#suggestions");

let weatherImg =  [
    {
        url : "images/broken-clouds.png",
        ids : [803,804]
    },
    {
        url :"images/clear-sky.png",
        ids: [800]
     },
     {
         url : "images/few-clouds.png",
         ids  : [801]
     }
     ,{
         url : "images/mist.png",
         ids : [701,711,721,731,741,751,761,762,771,781],
     },
     {
         url :"images/rain.png",
         ids :[500,501,502,503,504]
     },
     {
         url : "images/scattered-clouds.png",
         ids : [802],
     },
     {
         url : "images/shower-rain.png",

         ids : [520,521,522,531,300,301,302,310,311,312,313,314,321]
     },
     {
         url : "images/snow.png",
         ids : [511,600,601,602,611,612,613,615,616,620,621,622]
     },
     {
         url : "images/thunderstorm.png",
         ids : [200,201,202,210,211,212,221,230,231,232],
     }
]
window.addEventListener("load",()=>{
    let long;
    let lat;

    if(navigator.geolocation){

        navigator.geolocation.getCurrentPosition((positon)=>{
             long = positon.coords.longitude;
             lat = positon.coords.latitude;
            const locationEndpoint = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=` + weatherAPIkey + "&units=metric";
            fetch(locationEndpoint).then((response)=>{
                return response.json();
            })
            .then( async (data)=>{
                console.log(data);
                // const {name} =data;
                // const {feels_like} = data.main;
                
                // const{id,main} = data.weather[0];
                // WeatherCity.textContent = name;
                updateWeatherDetail(data);
                let id = data.id
               let forecast = await getForecastByCityID(id);
               updateForecast(forecast);
            })
        })
    }
})

let getWeatherDetail= async(city)=>{
    console.log(city)
    let endPoint = WeatherBaseEndPoint + "&q=" + city;
    let  response = await fetch(endPoint);
    let weather = await response.json();

    return weather;
}
let updateWeatherDetail = (data)=>{
    // console.log(data)
   WeatherCity.innerText = data.name; 
   day.innerText =  dayofWeek();
   Humid.innerText = data.main.humidity;
   p.innerText = data.main.pressure;
   let windDirection;
   let deg = data.wind.deg;
   if(deg > 45 && deg <=135){
       windDirection = "East";
   }
   else if(deg > 135 && deg <=225){
       windDirection = "South";
   }
   else if(deg > 225 && deg<= 315){
       windDirection = "West";
   }
   else{
       windDirection ="North";
   }
   wind.innerText = windDirection + ","  + data.wind.speed;
   temp.innerText = (data.main.temp >0 ) ? "+" + Math.round(data.main.temp) : Math.round(data.main.temp);
   let weatherimg = data.weather[0].id;
   weatherImg.forEach((obj)=>{
       if(obj.ids.indexOf(weatherimg)!= -1){
           image.src = obj.url;
       }
   })

}
let dayofWeek = (dt = new Date().getTime())=>{
    let today = new Date(dt).toLocaleDateString("en-EN",{weekday:"long"})
    return today;
}
let getForecastByCityID = async(id)=>{
   let endPoint = forecastEndPoint + "&id=" + id;
   let response = await fetch(endPoint);
   let result  = await response.json(); 
//    console.log(result);
   let daily = [];
   let foreCastList  =  result.list; 
   foreCastList.forEach((day)=>{
       let date_txt = day.dt_txt;
       date_txt = date_txt.replace(" ","T");
       let date = new Date(date_txt);
       let hours = date.getHours();
       if(hours===12){
           daily.push(day);

       }
   });
//   console.log(daily);
  return daily;
}
let WeatherDetail = async (city)=>{
    console.log(city)
    let weather = await  getWeatherDetail(city);
    if(weather.cod === "404"){
        Swal.fire({
            icon : "error",
            title : "OOPs..",
            text : "You Typed Wrong City Name ",
        });
        return;
    }
    
    console.log(weather)
    updateWeatherDetail(weather);
    let CityId =  weather.id;
    let forecast =  await getForecastByCityID(CityId);
     updateForecast(forecast)
}
searchInp.addEventListener("keydown", async (e)=>{
    if(e.keyCode === 13){
     WeatherDetail(searchInp.value);
    }
});
searchInp.addEventListener("input",async ()=>{
    if(searchInp.value.length <=2) {
        return;
    }
    let endPoint = geocodingBaseEndpoint + searchInp.value;
    let result = await fetch(endPoint);
    result = await result.json()
    // console.log(result);
    datalist.innerHTML = "";
    result.forEach((city)=>{
        let option  = document.createElement("option");
        option.value = `${city.name}${city.state?","+city.state : ""},${city.country}`  
        // console.log(`${city.name} ${city.state} ${city.country}`);
        datalist.appendChild(option);
    })
})
let updateForecast = (forecast)=>{
    forecastBlock.innerHTML = "";
    let forecastItem = "";
    forecast.forEach((day)=>{
        let iconUrl = "http://openweathermap.org/img/wn/"+day.weather[0].icon+"@2x.png";
        let temperature = (day.main.temp >0 ) ? "+" + Math.round(day.main.temp) : Math.round(day.main.temp)
       let dayName = dayofWeek(day.dt*1000);
        forecastItem += `<div class="col-lg-2" >
       <div class="card" style="width: 15rem; margin-right: 245px;">
         <img src="${iconUrl}" class="card-img-top" alt="${day.weather[0].description}"  />
         <div class="card-body">
           <h5 class="card-title text-center">${dayName}</h5>
           <p class="card-text text-center">${temperature} &deg;C</p>
           <!-- <a href="#" class="btn btn-primary"></a> -->
         </div>
       </div>
     </div>`
    });
    forecastBlock.innerHTML = forecastItem;
}
