import { useEffect, useState } from "react";
import moment, { momentInZone } from "../lib/moment";
import type { ClockConfig } from "../types";

interface Props {
  config: ClockConfig;
  language: string;
  timeFormat: 12 | 24;
}

const DEFAULTS = {
  displaySeconds: true,
  showPeriod: true,
  showDate: true,
  showTime: true,
  showWeek: false,
  dateFormat: "dddd, LL",
  showLunarDate: false
};

/**
 * Digital clock, reproducing the MagicMirror² clock module: per-instance `lang`
 * locale, `timezone`, `dateFormat`, `displaySeconds`, and the optional Chinese
 * lunar calendar date (`showLunarDate`).
 */
export default function Clock({ config, language, timeFormat }: Props) {
  const c = { ...DEFAULTS, ...config };
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = c.displaySeconds ? 1000 : 1000 * 60;
    const timer = setInterval(() => setTick((t) => t + 1), interval);
    return () => clearInterval(timer);
  }, [c.displaySeconds]);

  // Build "now" in the configured timezone, then apply the per-instance locale.
  const now = momentInZone(config.timezone).locale(config.lang || language);

  const tf = config.timeFormat ?? timeFormat;
  const hoursMinutes = tf === 24 ? now.format("HH:mm") : now.format("h:mm");
  const seconds = c.displaySeconds ? now.format("ss") : null;
  const period = tf !== 24 && c.showPeriod ? now.format("A") : null;

  // When showing the lunar date, strip the weekday tokens from the Gregorian
  // date format (the weekday is appended after the lunar date instead).
  let dateFormat = c.dateFormat;
  if (c.showLunarDate) {
    dateFormat = dateFormat
      .replace(/dddd\s*,?\s*/g, "")
      .replace(/ddd\s*,?\s*/g, "")
      .replace(/^[,\s]+|[,\s]+$/g, "");
  }

  const lunarDate = c.showLunarDate ? buildLunarDate(now) : null;

  return (
    <div className="clock">
      {c.showDate && <div className="date dimmed medium">{now.format(dateFormat)}</div>}
      {lunarDate && (
        <div className="lunar-date normal medium">
          {lunarDate} {now.format("dddd")}
        </div>
      )}
      {c.showTime && (
        <div className="time bright large light">
          {hoursMinutes}
          {/* Seconds as a small, raised superscript like MagicMirror². */}
          {seconds && <sup className="seconds dimmed">{seconds}</sup>}
          {period && <span className="period"> {period}</span>}
        </div>
      )}
      {c.showWeek && <div className="week dimmed medium">Week {now.week()}</div>}
    </div>
  );
}

// Traditional lunar-day names (初一 … 三十). Chrome/Electron's Intl chinese
// calendar returns the day as an Arabic numeral, so we map it ourselves.
const LUNAR_DAYS = [
  "初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
  "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
  "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十"
];

/**
 * Build the Chinese lunar calendar date using the Intl chinese calendar,
 * converting the day to its traditional lunar form (e.g. 18 → 十八).
 */
function buildLunarDate(m: moment.Moment): string {
  const parts = new Intl.DateTimeFormat("zh-CN-u-ca-chinese", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).formatToParts(m.toDate());

  return parts
    // "relatedYear" is emitted by the chinese calendar but absent from the TS
    // lib types, so compare as a string.
    .filter((part) => (part.type as string) !== "relatedYear")
    .map((part) => {
      if (part.type === "day") {
        const n = parseInt(part.value, 10);
        return LUNAR_DAYS[n - 1] ?? part.value;
      }
      return part.value;
    })
    .join("");
}
