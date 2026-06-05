import { useEffect, useState } from "react";
import moment from "../lib/moment";
import type { WeatherConfig, WeatherView } from "../types";
import { fetchWeather, weatherIcon, type WeatherData } from "../lib/weather";
import { translateKey } from "../translations";

interface Props {
  config: WeatherConfig;
  language: string;
  units: "metric" | "imperial";
}

/** Cross-fade duration when rotating between views (ms). */
const FADE_SPEED = 1500;

type Translate = (key: string, vars?: Record<string, string | number>) => string;

/**
 * Current conditions, a multi-day forecast, or an hourly table (selected via
 * `type`), reproducing the MagicMirror² weather module including per-instance
 * language support: labels and day names render in the module's `lang`,
 * independent of the global one.
 *
 * With `views`, several of those render modes share one slot and cross-fade
 * between each other (header included), so e.g. the daily forecast and the
 * 24-hour table don't have to stack vertically.
 */
export default function Weather({ config, language, units }: Props) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const locale = (config.lang || language).toLowerCase();
  const resolvedUnits = config.units ?? units;
  const updateInterval = config.updateInterval ?? 10 * 60 * 1000;
  const t: Translate = (key, vars) => translateKey(locale, key, vars);

  // Normalize to a list of views; a single-view module is just a one-entry list.
  const views: WeatherView[] = config.views ?? [{ type: config.type ?? "current" }];
  const rotateInterval = config.rotateInterval ?? 12000;

  // Fetch enough data to satisfy every view (the largest day/hour counts asked for).
  const days = Math.max(
    1,
    ...views.map((v) => v.maxNumberOfDays ?? config.maxNumberOfDays ?? 5)
  );
  const hours = Math.max(
    1,
    ...views.map((v) => v.maxNumberOfHours ?? config.maxNumberOfHours ?? 24)
  );

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const result = await fetchWeather({
          lat: config.lat,
          lon: config.lon,
          units: resolvedUnits,
          forecastDays: days,
          forecastHours: hours
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
  }, [config.lat, config.lon, resolvedUnits, days, hours, updateInterval]);

  // Rotate through the views. `prev` is the view currently fading OUT while
  // `index` fades IN — the two overlap so the slot is never blank between them.
  const [{ index, prev }, setRotation] = useState<{ index: number; prev: number | null }>({
    index: 0,
    prev: null
  });

  useEffect(() => {
    if (views.length <= 1) return;
    let clear: ReturnType<typeof setTimeout>;
    const timer = setInterval(() => {
      setRotation((s) => ({ index: (s.index + 1) % views.length, prev: s.index }));
      // Drop the outgoing layer once its fade-out has finished.
      clear = setTimeout(() => setRotation((s) => ({ ...s, prev: null })), FADE_SPEED);
    }, rotateInterval);
    return () => {
      clearInterval(timer);
      clearTimeout(clear);
    };
  }, [views.length, rotateInterval]);

  if (error) return <div className="weather dimmed small">{error}</div>;
  if (!data) return <div className="weather dimmed small">{t("LOADING")}</div>;

  const view = views[index] ?? views[0];

  // Single view: render plainly, letting the module wrapper supply the header
  // (unless this lone view carries its own header).
  if (views.length <= 1) {
    if (!view.header) return renderView(view, data, locale, t, config);
    return (
      <div className="weather-rotator">
        <header>{view.header}</header>
        {renderView(view, data, locale, t, config)}
      </div>
    );
  }

  // Rotating: crossfade. The incoming layer sits in normal flow (so the slot
  // sizes to it); the outgoing layer is absolutely positioned on top, fading
  // out simultaneously. Remounting via `key` restarts each layer's animation.
  const prevView = prev != null ? views[prev] : null;
  return (
    <div className="weather-rotator crossfade">
      {prevView && (
        <div className="weather-layer outgoing" key={`out-${prev}`}>
          {prevView.header && <header>{prevView.header}</header>}
          {renderView(prevView, data, locale, t, config)}
        </div>
      )}
      <div className="weather-layer incoming" key={`in-${index}`}>
        {view.header && <header>{view.header}</header>}
        {renderView(view, data, locale, t, config)}
      </div>
    </div>
  );
}

function renderView(
  view: WeatherView,
  data: WeatherData,
  locale: string,
  t: Translate,
  config: WeatherConfig
) {
  const fade = config.fade ?? true;
  const fadePoint = config.fadePoint ?? 0.25;
  if (view.type === "forecast") {
    const limit = view.maxNumberOfDays ?? config.maxNumberOfDays ?? data.forecast.length;
    return <Forecast data={data} locale={locale} fade={fade} fadePoint={fadePoint} limit={limit} />;
  }
  if (view.type === "hourly") {
    const limit = view.maxNumberOfHours ?? config.maxNumberOfHours ?? data.hourly.length;
    return <Hourly data={data} locale={locale} fade={fade} fadePoint={fadePoint} limit={limit} />;
  }
  return <Current data={data} locale={locale} t={t} />;
}

function Current({ data, locale, t }: { data: WeatherData; locale: string; t: Translate }) {
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
  fadePoint,
  limit
}: {
  data: WeatherData;
  locale: string;
  fade: boolean;
  fadePoint: number;
  limit: number;
}) {
  const { tempUnit } = data;
  const forecast = data.forecast.slice(0, limit);

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

function Hourly({
  data,
  locale,
  fade,
  fadePoint,
  limit
}: {
  data: WeatherData;
  locale: string;
  fade: boolean;
  fadePoint: number;
  limit: number;
}) {
  const { tempUnit } = data;
  const hourly = data.hourly.slice(0, limit);

  // Same progressive fade as the daily forecast, applied to the later hours.
  const startingPoint = hourly.length * fadePoint;
  const steps = hourly.length - startingPoint;
  const opacityFor = (index: number) => {
    if (!fade || index < startingPoint || steps <= 0) return 1;
    return 1 - (index - startingPoint) / steps;
  };

  return (
    <table className="weather hourly small">
      <tbody>
        {hourly.map((hour, index) => (
          <tr key={hour.time} style={{ opacity: opacityFor(index) }}>
            <td className="hour normal">{moment(hour.time).locale(locale).format("HH:mm")}</td>
            <td className="forecast-icon">
              <span className={`wi ${weatherIcon(hour.weatherCode, hour.isDay)}`} />
            </td>
            <td className="temp bright">
              {hour.temperature}
              {tempUnit}
            </td>
            <td className="precip dimmed">
              <span className="wi wi-raindrop label-icon" />
              {hour.precipitation}%
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
