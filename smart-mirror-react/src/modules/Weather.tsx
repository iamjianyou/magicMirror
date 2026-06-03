import { useEffect, useState } from "react";
import moment from "../lib/moment";
import type { WeatherConfig } from "../types";
import { fetchWeather, weatherIcon, type WeatherData } from "../lib/weather";
import { translateKey } from "../translations";

interface Props {
  config: WeatherConfig;
  language: string;
  units: "metric" | "imperial";
}

/**
 * Current conditions or a multi-day forecast (selected via `type`), reproducing
 * the MagicMirror² weather module including per-instance language support: labels
 * and day names render in the module's `lang`, independent of the global one.
 */
export default function Weather({ config, language, units }: Props) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const locale = (config.lang || language).toLowerCase();
  const resolvedUnits = config.units ?? units;
  const days = config.maxNumberOfDays ?? 5;
  const updateInterval = config.updateInterval ?? 10 * 60 * 1000;
  const t = (key: string, vars?: Record<string, string | number>) => translateKey(locale, key, vars);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const result = await fetchWeather({
          lat: config.lat,
          lon: config.lon,
          units: resolvedUnits,
          forecastDays: days
        });
        if (active) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : String(err));
      }
    };

    load();
    const timer = setInterval(load, updateInterval);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [config.lat, config.lon, resolvedUnits, days, updateInterval]);

  if (error) return <div className="weather dimmed small">{error}</div>;
  if (!data) return <div className="weather dimmed small">{t("LOADING")}</div>;

  return config.type === "forecast" ? (
    <Forecast
      data={data}
      locale={locale}
      fade={config.fade ?? true}
      fadePoint={config.fadePoint ?? 0.25}
    />
  ) : (
    <Current data={data} locale={locale} t={t} />
  );
}

function Current({
  data,
  locale,
  t
}: {
  data: WeatherData;
  locale: string;
  t: (k: string, v?: Record<string, string | number>) => string;
}) {
  const { current, tempUnit, windUnit } = data;
  return (
    <div className="weather current">
      <div className="current-main bright">
        <span className={`wi ${weatherIcon(current.weatherCode, current.isDay)} weather-icon`} />
        <span className="current-temp large light">
          {current.temperature}
          {tempUnit}
        </span>
      </div>
      <div className="current-meta normal small">
        <div>{t("FEELS", { temp: `${current.apparentTemperature}${tempUnit}` })}</div>
        <div>
          <span className="wi wi-strong-wind label-icon" /> {t("WIND")} {current.windSpeed} {windUnit}
        </div>
        <div>
          <span className="wi wi-humidity label-icon" /> {t("HUMIDITY")} {current.humidity}%
        </div>
        <div className="sun">
          <span className="wi wi-sunrise label-icon" /> {moment(current.sunrise).locale(locale).format("HH:mm")}
          {"  "}
          <span className="wi wi-sunset label-icon" /> {moment(current.sunset).locale(locale).format("HH:mm")}
        </div>
      </div>
    </div>
  );
}

function Forecast({
  data,
  locale,
  fade,
  fadePoint
}: {
  data: WeatherData;
  locale: string;
  fade: boolean;
  fadePoint: number;
}) {
  const { forecast, tempUnit } = data;

  // Progressive fade of the later rows, matching MagicMirror²'s weather module:
  // full opacity until `fadePoint` of the way down, then linear toward 0.
  const startingPoint = forecast.length * fadePoint;
  const steps = forecast.length - startingPoint;
  const opacityFor = (index: number) => {
    if (!fade || index < startingPoint || steps <= 0) return 1;
    return 1 - (index - startingPoint) / steps;
  };

  return (
    <table className="weather forecast small">
      <tbody>
        {forecast.map((day, index) => (
          <tr key={day.date} style={{ opacity: opacityFor(index) }}>
            <td className="day normal">{moment(day.date).locale(locale).format("ddd")}</td>
            <td className="forecast-icon">
              <span className={`wi ${weatherIcon(day.weatherCode, true)}`} />
            </td>
            <td className="temp-max bright">
              {day.tempMax}
              {tempUnit}
            </td>
            <td className="temp-min dimmed">
              {day.tempMin}
              {tempUnit}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
