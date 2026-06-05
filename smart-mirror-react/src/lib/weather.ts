// Weather data access via Open-Meteo (https://open-meteo.com) — free, no API key.
// Returns a normalized shape the Weather module can render directly.

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  isDay: boolean;
  sunrise: string;
  sunset: string;
}

export interface ForecastDay {
  date: string; // ISO date (YYYY-MM-DD)
  weatherCode: number;
  tempMax: number;
  tempMin: number;
}

export interface HourlyHour {
  time: string; // ISO datetime (YYYY-MM-DDTHH:mm)
  temperature: number;
  weatherCode: number;
  isDay: boolean;
  /** Probability of precipitation, 0–100. */
  precipitation: number;
}

export interface WeatherData {
  current: CurrentWeather;
  forecast: ForecastDay[];
  hourly: HourlyHour[];
  tempUnit: string; // "°C" | "°F"
  windUnit: string; // "m/s" | "mph"
}

interface FetchParams {
  lat: number;
  lon: number;
  units: "metric" | "imperial";
  forecastDays: number;
  /** Number of upcoming hours to include in `hourly`. */
  forecastHours: number;
}

export async function fetchWeather({ lat, lon, units, forecastDays, forecastHours }: FetchParams): Promise<WeatherData> {
  const metric = units === "metric";
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m",
    hourly: "temperature_2m,weather_code,is_day,precipitation_probability",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset",
    timezone: "auto",
    forecast_days: String(Math.min(Math.max(forecastDays + 1, 1), 16)),
    temperature_unit: metric ? "celsius" : "fahrenheit",
    wind_speed_unit: metric ? "ms" : "mph"
  });

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Open-Meteo HTTP ${res.status}`);
  }
  const json = await res.json();

  const c = json.current;
  const d = json.daily;

  const current: CurrentWeather = {
    temperature: Math.round(c.temperature_2m),
    apparentTemperature: Math.round(c.apparent_temperature),
    humidity: Math.round(c.relative_humidity_2m),
    windSpeed: Math.round(c.wind_speed_10m),
    weatherCode: c.weather_code,
    isDay: c.is_day === 1,
    sunrise: d.sunrise[0],
    sunset: d.sunset[0]
  };

  // Skip today's entry (index 0) so the forecast lists upcoming days.
  const forecast: ForecastDay[] = [];
  for (let i = 1; i < d.time.length && forecast.length < forecastDays; i++) {
    forecast.push({
      date: d.time[i],
      weatherCode: d.weather_code[i],
      tempMax: Math.round(d.temperature_2m_max[i]),
      tempMin: Math.round(d.temperature_2m_min[i])
    });
  }

  // Hourly entries start at midnight of the current day. Begin at the current
  // hour (per Open-Meteo's `current.time`) and take the next `forecastHours`.
  const h = json.hourly;
  const hourly: HourlyHour[] = [];
  const nowHour = (c.time as string).slice(0, 13); // "YYYY-MM-DDTHH"
  let start = h.time.findIndex((t: string) => t.slice(0, 13) >= nowHour);
  if (start < 0) start = 0;
  for (let i = start; i < h.time.length && hourly.length < forecastHours; i++) {
    hourly.push({
      time: h.time[i],
      temperature: Math.round(h.temperature_2m[i]),
      weatherCode: h.weather_code[i],
      isDay: h.is_day[i] === 1,
      precipitation: Math.round(h.precipitation_probability?.[i] ?? 0)
    });
  }

  return {
    current,
    forecast,
    hourly,
    tempUnit: metric ? "°C" : "°F",
    windUnit: metric ? "m/s" : "mph"
  };
}

// Map WMO weather codes to weather-icons classes. Day/night variants where useful.
// Reference: https://open-meteo.com/en/docs (WMO Weather interpretation codes)
export function weatherIcon(code: number, isDay: boolean): string {
  const dayNight = (day: string, night: string) => (isDay ? day : night);
  switch (code) {
    case 0:
      return dayNight("wi-day-sunny", "wi-night-clear");
    case 1:
      return dayNight("wi-day-sunny-overcast", "wi-night-partly-cloudy");
    case 2:
      return dayNight("wi-day-cloudy", "wi-night-alt-cloudy");
    case 3:
      return "wi-cloudy";
    case 45:
    case 48:
      return "wi-fog";
    case 51:
    case 53:
    case 55:
      return "wi-sprinkle";
    case 56:
    case 57:
      return "wi-sleet";
    case 61:
    case 63:
    case 65:
      return "wi-rain";
    case 66:
    case 67:
      return "wi-rain-mix";
    case 71:
    case 73:
    case 75:
    case 77:
      return "wi-snow";
    case 80:
    case 81:
    case 82:
      return "wi-showers";
    case 85:
    case 86:
      return "wi-snow";
    case 95:
      return "wi-thunderstorm";
    case 96:
    case 99:
      return "wi-storm-showers";
    default:
      return "wi-na";
  }
}
