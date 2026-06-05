// Region names mirror MagicMirror²'s layout regions.
export type Position =
  | "top_bar"
  | "top_left"
  | "top_center"
  | "top_right"
  | "upper_third"
  | "middle_center"
  | "lower_third"
  | "bottom_left"
  | "bottom_center"
  | "bottom_right"
  | "bottom_bar"
  | "fullscreen_above"
  | "fullscreen_below";

export type ModuleName =
  | "clock"
  | "countdown"
  | "compliments"
  | "weather"
  | "newsfeed"
  | "MMM-BackgroundSlideshow";

export interface ModuleDefinition {
  module: ModuleName;
  position: Position;
  /** Optional header rendered above the module, like MagicMirror²'s module header. */
  header?: string;
  config?: Record<string, unknown>;
}

export interface AppConfig {
  /** Global locale used unless a module overrides it with its own `lang`. */
  language: string;
  locale: string;
  timeFormat: 12 | 24;
  units: "metric" | "imperial";
  logLevel: string[];
  modules: ModuleDefinition[];
}

// ---- Per-module config shapes ----

export interface ClockConfig {
  timeFormat?: 12 | 24;
  displaySeconds?: boolean;
  showPeriod?: boolean;
  showDate?: boolean;
  showTime?: boolean;
  showWeek?: boolean;
  dateFormat?: string;
  /** Override moment locale for this instance (e.g. "zh-cn"); undefined uses global language. */
  lang?: string;
  /** IANA timezone (e.g. "Asia/Shanghai"); undefined uses local time. */
  timezone?: string;
  /** Append the Chinese lunar calendar date below the Gregorian date. */
  showLunarDate?: boolean;
}

export interface CountdownConfig {
  /** ISO 8601 target date/time, e.g. "2026-06-11T20:00:00-06:00". */
  targetDate?: string;
  /** Label shown above the countdown. */
  title?: string;
  /** Include the seconds unit (ticks every second when true). */
  displaySeconds?: boolean;
  /** Text shown once the target date has passed. */
  finishedText?: string;
}

export type WeatherViewType = "current" | "forecast" | "hourly";

/** A single rotating view within a weather module (see WeatherConfig.views). */
export interface WeatherView {
  type: WeatherViewType;
  /** Header shown above this view while it is on screen. */
  header?: string;
  /** Number of forecast days for type "forecast" (overrides the module default). */
  maxNumberOfDays?: number;
  /** Number of upcoming hours for type "hourly" (overrides the module default). */
  maxNumberOfHours?: number;
}

export interface WeatherConfig {
  /** Single-view render mode. Ignored when `views` is set. */
  type?: WeatherViewType;
  lat: number;
  lon: number;
  locationName?: string;
  units?: "metric" | "imperial";
  /** Per-instance language override; undefined uses global language. */
  lang?: string;
  updateInterval?: number;
  /** Number of forecast days for type "forecast". */
  maxNumberOfDays?: number;
  /** Number of upcoming hours for type "hourly" (default 24). */
  maxNumberOfHours?: number;
  /**
   * Rotate through several views in one slot, cross-fading between them (and
   * swapping the per-view header). When set, `type` is ignored. Lets e.g. the
   * daily forecast and the 24-hour table share the same space instead of
   * stacking vertically.
   */
  views?: WeatherView[];
  /** How long each view stays on screen before fading to the next (ms, default 12000). */
  rotateInterval?: number;
  /** Fade the later forecast rows toward transparent (MagicMirror² default: true). */
  fade?: boolean;
  /** Fraction of the list before fading begins (MagicMirror² default: 0.25). */
  fadePoint?: number;
}

export interface ComplimentsConfig {
  updateInterval?: number;
  fadeSpeed?: number;
  compliments?: Record<string, string[]>;
}

export interface NewsFeedConfig {
  feeds: { title: string; url: string }[];
  showSourceTitle?: boolean;
  showPublishDate?: boolean;
  updateInterval?: number;
  /** How long each headline is shown (ms). */
  rotateInterval?: number;
}

export interface BackgroundSlideshowConfig {
  slideshowSpeed?: number;
  transitionSpeed?: string;
  randomizeImageOrder?: boolean;
  backgroundSize?: string;
  /** Vertical gradient stops layered over the image. */
  gradient?: string[];
  /** Horizontal gradient stops layered over the image. */
  horizontalGradient?: string[];
}
