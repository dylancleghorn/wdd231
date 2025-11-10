// ========================
// SETTINGS
// ========================
const OPENWEATHER_API_KEY = "2f1718261b55e04952ea886294960a86";
const USE_IMPERIAL_UNITS = true; // true = Fahrenheit, false = Celsius
const CITY_LATITUDE = 32.7767;   // Dallas, TX
const CITY_LONGITUDE = -96.7970; // Dallas, TX
const MEMBERS_JSON_FILE = "data/members.json";

const TEMP_UNITS = USE_IMPERIAL_UNITS ? "imperial" : "metric";
const TEMP_SYMBOL = USE_IMPERIAL_UNITS ? "°F" : "°C";
const WIND_UNITS = USE_IMPERIAL_UNITS ? "mph" : "m/s";

// ========================
// BASIC HELPERS
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

// ========================
// MEMBERSHIP HELPERS 
// ========================
function getLevelNumber(member) {
  const n = Number(member.level);
  if (Number.isFinite(n)) return n;
  const s = (member.membershipLevel || member.membership || member.tier || "")
    .toString()
    .toLowerCase();
  if (s.includes("gold")) return 3;
  if (s.includes("silver")) return 2;
  if (s.includes("bronze")) return 1;
  return 0;
}

function levelNumberToName(n) {
  if (n === 3) return "Gold";
  if (n === 2) return "Silver";
  if (n === 1) return "Bronze";
  return "";
}

function isPremiumLevel(n) {
  return n === 3 || n === 2; // only Gold or Silver for spotlights
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
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${CITY_LATITUDE}&lon=${CITY_LONGITUDE}&units=${TEMP_UNITS}&appid=${OPENWEATHER_API_KEY}`;
    const currentRes = await fetch(currentUrl);

    if (currentRes.status === 401) {
      tempEl.textContent = "—";
      descEl.textContent = "Invalid OpenWeather API key";
      forecastEl.innerHTML = "<li>Fix API key to load forecast</li>";
      return;
    }

    const current = await currentRes.json();
    const temp = Math.round(current.main?.temp ?? 0);
    const desc = textOrEmpty(current.weather?.[0]?.description);
    const wind = Math.round(current.wind?.speed ?? 0);
    const humidity = Math.round(current.main?.humidity ?? 0);

    tempEl.textContent = `${temp}°`;
    descEl.textContent = desc ? `${desc.charAt(0).toUpperCase()}${desc.slice(1)}` : "—";
    metaEl.textContent = `Wind: ${wind} ${WIND_UNITS} • Humidity: ${humidity}%`;

    // Forecast
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${CITY_LATITUDE}&lon=${CITY_LONGITUDE}&units=${TEMP_UNITS}&appid=${OPENWEATHER_API_KEY}`;
    const forecastRes = await fetch(forecastUrl);
    const forecastData = await forecastRes.json();
    const all = forecastData.list || [];

    let chosen = all.filter(i => textOrEmpty(i.dt_txt).endsWith("12:00:00")).slice(0, 3);
    if (chosen.length < 3) {
      chosen = [];
      for (let i = 0; i < all.length && chosen.length < 3; i += 8) chosen.push(all[i]);
    }

    forecastEl.innerHTML = "";
    chosen.forEach(item => {
      const date = new Date(item.dt * 1000);
      const label = date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
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
    if (!res.ok) throw new Error("Could not load members.json");

    const data = await res.json();
    const members = Array.isArray(data) ? data : (data.members || data.directory || []);

    // keep only gold/silver by numeric level
    const premium = members.filter(m => isPremiumLevel(getLevelNumber(m)));

    // choose 3 random
    const pickCount = 3
    const copy = premium.slice();
    const selected = [];
    while (copy.length > 0 && selected.length < pickCount) {
      const index = Math.floor(Math.random() * copy.length);
      selected.push(copy.splice(index, 1)[0]);
    }

    // render
    grid.innerHTML = "";
    selected.forEach(member => {
      const lvlNum = getLevelNumber(member);
      const lvlName = levelNumberToName(lvlNum);

      const card = document.createElement("article");
      card.className = "card spotlight";
      card.setAttribute("role", "listitem");

      // Top line: image + name 
      const topLine = document.createElement("div");
      topLine.className = "top-line";

      const img = document.createElement("img");
      img.alt = member.name || "Company logo";
      img.src = member.image || member.logo || "";
      img.loading = "lazy";

      const title = document.createElement("h4");
      title.textContent = member.name || "Company";

      topLine.appendChild(img);
      topLine.appendChild(title);
      card.appendChild(topLine);

      //  Phone line + Address line 
      const info = document.createElement("p");
      const phoneHtml = member.phone ? `<strong>Phone:</strong> ${member.phone}<br>` : "";
      const addrHtml = member.address ? `<strong>Address:</strong> ${member.address}` : "";
      info.innerHTML = `${phoneHtml}${addrHtml}`;
      card.appendChild(info);

      //  Badge (last line)
      const badge = document.createElement("div");
      badge.className = "badge";
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
function setFooterYear() {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

// ========================
// START EVERYTHING
// ========================
document.addEventListener("DOMContentLoaded", () => {
  setFooterYear();
  loadWeather();
  loadSpotlights();
});
