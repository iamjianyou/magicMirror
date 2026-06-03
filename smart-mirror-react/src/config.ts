import type { AppConfig } from "./types";

// React/TypeScript port of the MagicMirror² config/config.js — a dual
// Norway / China mirror. The structure mirrors the original: global settings
// plus a list of modules, each placed in a region with its own config.
const config: AppConfig = {
  language: "nb",
  locale: "nb-NO",
  timeFormat: 24,
  units: "metric",
  logLevel: ["INFO", "LOG", "WARN", "ERROR"],

  modules: [
    // ===== LEFT: Norway =====
    {
      module: "clock",
      position: "top_left",
      config: {
        lang: "nb",
        dateFormat: "dddd D. MMMM YYYY"
      }
    },
    {
      module: "weather",
      position: "top_left",
      config: {
        type: "current",
        lang: "nb",
        lat: 60.3553,
        lon: 5.2178
      }
    },
    {
      module: "weather",
      position: "top_left",
      header: "Bergen, Nordbøveien 10 🇳🇴",
      config: {
        type: "forecast",
        lang: "nb",
        maxNumberOfDays: 14,
        lat: 60.3553,
        lon: 5.2178
      }
    },

    // ===== RIGHT: China =====
    {
      module: "clock",
      position: "top_right",
      config: {
        timezone: "Asia/Shanghai",
        lang: "zh-cn",
        showLunarDate: true,
        displaySeconds: true,
        dateFormat: "YYYY年M月D日 dddd"
      }
    },
    {
      module: "weather",
      position: "top_right",
      config: {
        type: "current",
        lang: "zh-cn",
        lat: 28.0387,
        lon: 120.7914
      }
    },
    {
      module: "weather",
      position: "top_right",
      header: "Wuniu, Wenzhou 温州 🇨🇳",
      config: {
        type: "forecast",
        lang: "zh-cn",
        maxNumberOfDays: 14,
        lat: 28.0387,
        lon: 120.7914
      }
    },

    // ===== Background photo slideshow =====
    {
      module: "MMM-BackgroundSlideshow",
      position: "fullscreen_below",
      config: {
        slideshowSpeed: 12 * 1000,
        transitionSpeed: "2s",
        randomizeImageOrder: true,
        backgroundSize: "cover",
        gradient: [
          "rgba(0, 0, 0, 0.75) 0%",
          "rgba(0, 0, 0, 0) 40%",
          "rgba(0, 0, 0, 0) 60%",
          "rgba(0, 0, 0, 0.75) 100%"
        ],
        horizontalGradient: [
          "rgba(0, 0, 0, 0.75) 0%",
          "rgba(0, 0, 0, 0) 25%",
          "rgba(0, 0, 0, 0) 75%",
          "rgba(0, 0, 0, 0.75) 100%"
        ]
      }
    },

    // ===== Compliments =====
    {
      module: "compliments",
      position: "lower_third",
      config: {
        updateInterval: 30000,
        fadeSpeed: 4000,
        compliments: {
          anytime: ["Hey there!"],
          morning: ["Good morning, handsome!", "Enjoy your day!", "How was your sleep?"],
          afternoon: ["Hello, beauty!", "Looking good today!"],
          evening: ["Wow, you look great!", "You look nice!", "Hi, there!"],
          "....-01-01": ["Happy new year!"]
        }
      }
    },

    // ===== News feed =====
    {
      module: "newsfeed",
      position: "bottom_bar",
      config: {
        // The URL is proxied through Vite (see vite.config.ts) to dodge browser
        // CORS — it maps to https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml
        feeds: [
          {
            title: "New York Times",
            url: "/feed-nyt/services/xml/rss/nyt/HomePage.xml"
          }
        ],
        showSourceTitle: true,
        showPublishDate: true,
        rotateInterval: 10000
      }
    }
  ]
};

export default config;
