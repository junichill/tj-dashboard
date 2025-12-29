// ---------------- FLIP CLOCK ----------------
function updateFlip(unitId, value){
  const unit = document.getElementById(unitId);
  const top = unit.querySelector('.top');
  const bottom = unit.querySelector('.bottom');
  const flip = unit.querySelector('.flip');

  const currentValue = parseInt(top.textContent);
  if(currentValue === value) return;

  flip.innerHTML = `<div class="flip-top">${currentValue}</div><div class="flip-bottom">${value}</div>`;
  flip.style.transform = 'rotateX(0deg)';
  flip.style.transition = 'transform 0.6s ease-in-out';
  requestAnimationFrame(()=>flip.style.transform='rotateX(-180deg)');

  setTimeout(()=>{
    top.textContent = value.toString().padStart(2,'0');
    bottom.textContent = value.toString().padStart(2,'0');
    flip.style.transition='none';
    flip.style.transform='rotateX(0deg)';
    flip.innerHTML='';
  },600);
}

function updateClock() {
  const now = new Date();
  updateFlip('hours', now.getHours());
  updateFlip('minutes', now.getMinutes());
  updateFlip('seconds', now.getSeconds());

  const year = now.getFullYear();
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const month = monthNames[now.getMonth()];
  const date = now.getDate();
  const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const day = weekdays[now.getDay()];
  document.getElementById('date').textContent = `${day}, ${month} ${date}, ${year}`;
}

setInterval(updateClock,1000);
updateClock();

// ---------------- NEWS ----------------
const rssUrl='https://news.web.nhk/n-data/conf/na/rss/cat0.xml';
const rss2jsonApi='https://api.rss2json.com/v1/api.json?rss_url='+encodeURIComponent(rssUrl);
const newsCard=document.getElementById('news-card');
let newsItems=[], newsIndex=0, newsElements=[];

async function fetchNews(){
  try{
    const res=await fetch(rss2jsonApi);
    const data=await res.json();
    newsItems=data.items;
    newsIndex=0;
    prepareNewsElements();
    showNews();
  }catch(err){
    newsCard.textContent='News fetch failed';
    console.error(err);
  }
}

function prepareNewsElements(){
  newsCard.innerHTML='';
  newsElements=newsItems.map(item=>{
    const div=document.createElement('div');
    div.className='news-item';
    div.innerHTML=
      `<div class="news-title">${item.title}</div>` +
      `<div class="news-pubdate">${item.pubDate}</div>` +
      `<div class="news-description">${item.description}</div>`;
    newsCard.appendChild(div);
    return div;
  });
}

function showNews(){
  if(newsElements.length===0) return;
  newsElements.forEach((el,i)=>el.classList.remove('show'));
  newsElements[newsIndex].classList.add('show');
  newsIndex=(newsIndex+1)%newsElements.length;
}

fetchNews();
setInterval(fetchNews,5*60*1000);
setInterval(showNews,5000);

// ---------------- WEATHER ----------------
const API_KEY='eed3942fcebd430b2e32dfff2c611b11';
const LAT=35.5309, LON=139.7033;
const weatherEl=document.getElementById('weather');

async function fetchWeather(){
  try{
    const res=await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${API_KEY}&lang=en&units=metric`);
    const data=await res.json();
    const now=new Date();
    const todayDate=now.getDate();
    const tomorrowDate=new Date(now.getTime()+24*60*60*1000).getDate();
    const todayWeather=data.list.find(item=>new Date(item.dt_txt).getDate()===todayDate);
    const tomorrowWeather=data.list.find(item=>new Date(item.dt_txt).getDate()===tomorrowDate);
    if(todayWeather && tomorrowWeather){
      weatherEl.innerHTML=`Today: ${todayWeather.main.temp.toFixed(1)}Åé / ${todayWeather.weather[0].description}<br>`+
                          `Tomorrow: ${tomorrowWeather.main.temp.toFixed(1)}Åé / ${tomorrowWeather.weather[0].description}`;
      weatherEl.style.textAlign='left';
    }else weatherEl.textContent='Weather info unavailable';
  }catch(err){ weatherEl.textContent='Weather fetch failed'; console.error(err);}
}

fetchWeather();
setInterval(fetchWeather,10*60*1000);
