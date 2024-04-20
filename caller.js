const APIKey = '8d087db7c3ea7a2ad09e1503dfa39963';

// To get the position of the city
async function getLocaData() {
   try {
      const position = await new Promise((resolve, reject) => {
         navigator.geolocation.getCurrentPosition(resolve, reject);
      })
      return [position.coords.latitude, position.coords.longitude]
   } catch(e) {
      document.getElementById('error-message').textContent = e.message;
      throw e;
   }
}

// Make request
async function getData(APIUrl, callback) {
   let [lat, lon] = await getLocaData();
   
   APIUrl += `units=metric&lat=${lat}&lon=${lon}&appid=${APIKey}`;

   let res = await fetch(APIUrl);
   let data = await res.json();

   if (data.cod != 200) {
      console.log(data.cod);
      document.getElementById('error-message').textContent = data.message;
   }
   else {
      callback(data);
   }

   

}

export {getLocaData, getData};