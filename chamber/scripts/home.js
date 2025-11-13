// ========================
// SETTINGS
// ========================
const MEMBERS_JSON_FILE = "data/members.json";

const OPENWEATHER_API_KEY = "2f1718261b55e04952ea886294960a86";
const CITY_LATITUDE = 32.7767;   // Dallas, TX
const CITY_LONGITUDE = -96.7970; // Dallas, TX

const USE_IMPERIAL_UNITS = true; // true = Fahrenheit, false = Celsius
const TEMP_UNITS = USE_IMPERIAL_UNITS ? "imperial" : "metric";
const TEMP_SYMBOL = USE_IMPERIAL_UNITS ? "°F" : "°C";
const WIND_UNITS = USE_IMPERIAL_UNITS ? "mph" : "m/s";

// ========================
//  HELPERS
// ========================
function textOrEmpty(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "object") {
    if (value.name) return String(value.name);
    try { return JSON.stringify(value); } catch { return ""; }
  }
  return "";
}

function isGoldOrSilver(n) {
  return n === 3 || n === 2; // only Gold or Silver for spotlights
}

function levelNumberToName(n) {
  if (n === 3) return "Gold";
  if (n === 2) return "Silver";
  if (n === 1) return "Bronze";
  return "";
}

function pickRandomItems(members, count = 3) {
  let options = [...members]; // make a copy of the members list
  const selected = [];

  while (selected.length < count && options.length > 0) {
    const index = Math.floor(Math.random() * options.length);
    const chosen = options[index];

    selected.push(chosen);
    options = options.filter((_, i) => i !== index); // remove selection from options based on index
  }

  return selected;
}


// ========================
// WEATHER
// ========================
async function loadWeather() {
  const tempEl = document.getElementById("weather-temp");
  const descEl = document.getElementById("weather-desc");
  const metaEl = document.getElementById("weather-meta");
  const forecastEl = document.getElementById("forecast-list");

  try {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${CITY_LATITUDE}&lon=${CITY_LONGITUDE}&units=${TEMP_UNITS}&appid=${OPENWEATHER_API_KEY}`;
    const weatherRes = await fetch(weatherUrl);
    const currentWeather = await weatherRes.json();

    const temp = Math.round(currentWeather.main?.temp ?? 0);
    const desc = textOrEmpty(currentWeather.weather?.[0]?.description);
    const wind = Math.round(currentWeather.wind?.speed ?? 0);
    const humidity = Math.round(currentWeather.main?.humidity ?? 0);

    tempEl.textContent = `${temp}°`;
    descEl.textContent = desc ? `${desc.charAt(0).toUpperCase()}${desc.slice(1)}` : "—";
    metaEl.textContent = `Wind: ${wind} ${WIND_UNITS} • Humidity: ${humidity}%`;

    // Forecast
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${CITY_LATITUDE}&lon=${CITY_LONGITUDE}&units=${TEMP_UNITS}&appid=${OPENWEATHER_API_KEY}`;
    const forecastRes = await fetch(forecastUrl);
    const forecastData = await forecastRes.json();
    const all = forecastData.list || [];

    let chosen = all.filter(i => textOrEmpty(i.dt_txt).endsWith("12:00:00")).slice(0, 3); //filter date text to get noon entries; slice the first 3

    forecastEl.innerHTML = "";
    chosen.forEach(item => {
      const date = new Date(item.dt * 1000); // convert timestamp from ms
      const label = date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }); // convert timestamp to normal date
      const t = Math.round(item.main?.temp ?? 0);
      const d = textOrEmpty(item.weather?.[0]?.description);

      const li = document.createElement("li");
      li.textContent = `${label}: ${t}${TEMP_SYMBOL} — ${d.charAt(0).toUpperCase()}${d.slice(1)}`;
      forecastEl.appendChild(li);
    });

  } catch (err) {
    console.error(err);
    descEl.textContent = "Weather unavailable";
    forecastEl.innerHTML = "<li>Forecast unavailable</li>";
  }
}

// ========================
// MEMBER SPOTLIGHTS
// ========================
async function loadSpotlights() {
  const grid = document.getElementById("spotlight-grid");

  try {
    const res = await fetch(MEMBERS_JSON_FILE);
    const members = await res.json();

    // get 3 gold/silver by numeric level
    const premium = members.filter(m => isGoldOrSilver(m.level));
    const selected = pickRandomItems(premium, 3);

    grid.innerHTML = "";
    selected.forEach(member => {

      const lvlName = levelNumberToName(member.level);

      const card = document.createElement("article");
      card.className = "card spotlight member";
      card.setAttribute("role", "listitem");

      // image + name 
      const topLine = document.createElement("header");

      const img = document.createElement("img");
      img.alt = member.name
      img.src = member.image
      img.loading = "lazy";

      const title = document.createElement("h3");
      title.textContent = member.name;

      topLine.appendChild(img);
      topLine.appendChild(title);
      card.appendChild(topLine);

      //  Meta data
      const meta = document.createElement("div");
      meta.classList.add("meta");
      meta.innerHTML = `<p>${member.address}</p><p>${member.phone}</p><p><a href="${member.website}" target="_blank">${member.website.replace(/^https?:\/\//, "")}</a></p>`;
      card.appendChild(meta);

      //  Badge 
      const badge = document.createElement("div");
      badge.className = `badge ${member.level == 2 ? 'silver' : 'gold'}`;
      badge.textContent = lvlName ? `${lvlName} Member` : "";
      card.appendChild(badge);

      grid.appendChild(card);
    });

  } catch (error) {
    console.error(error);
    grid.innerHTML = "<p>Spotlights unavailable</p>";
  }
}

// ========================
// FOOTER YEAR
// ========================

document.getElementById('year').textContent = new Date().getFullYear()
document.getElementById('lastModified').textContent = document.lastModified

// ========================
// START EVERYTHING
// ========================
document.addEventListener("DOMContentLoaded", () => {
  loadWeather();
  loadSpotlights();

});
