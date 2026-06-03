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
    // ===== World Cup countdown =====
    {
      module: "countdown",
      position: "bottom_left",
      config: {
        // FIFA World Cup 2026 opening match — Mexico v South Africa, Estadio
        // Azteca, Mexico City. Kickoff 13:00 local (UTC-6); matches fifa.com.
        targetDate: "2026-06-11T13:00:00-06:00",
        title: "FIFA World Cup 2026 ⚽",
        displaySeconds: true,
      },
    },

    // ===== LEFT: Norway =====
    {
      module: "clock",
      position: "top_left",
      config: {
        lang: "nb",
        dateFormat: "dddd D. MMMM YYYY",
      },
    },
    {
      module: "weather",
      position: "top_left",
      config: {
        type: "current",
        lang: "nb",
        lat: 60.3553,
        lon: 5.2178,
      },
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
        lon: 5.2178,
      },
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
        dateFormat: "YYYY年M月D日 dddd",
      },
    },
    {
      module: "weather",
      position: "top_right",
      config: {
        type: "current",
        lang: "zh-cn",
        lat: 28.0387,
        lon: 120.7914,
      },
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
        lon: 120.7914,
      },
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
          "rgba(0, 0, 0, 0.75) 100%",
        ],
        horizontalGradient: [
          "rgba(0, 0, 0, 0.75) 0%",
          "rgba(0, 0, 0, 0) 25%",
          "rgba(0, 0, 0, 0) 75%",
          "rgba(0, 0, 0, 0.75) 100%",
        ],
      },
    },

    // ===== Compliments =====
    {
      module: "compliments",
      position: "lower_third",
      config: {
        updateInterval: 30000,
        fadeSpeed: 4000,
        compliments: {
          anytime: [
            "Hey there!",
            "Hei på deg!",
            "Du er fantastisk!",
            "Du klarer dette!",
            "你好呀！",
            "你今天真好看！",
            "你最棒了！",
            "笑一个！",
          ],
          morning: [
            "Good morning, handsome!",
            "Enjoy your day!",
            "God morgen, kjekken!",
            "Ha en fin dag!",
            "Sov du godt?",
            "Ny dag, nye muligheter!",
            "早上好！",
            "新的一天，加油！",
            "今天也要元气满满！",
            "睡得好吗？",
          ],
          afternoon: [
            "Hello, beauty!",
            "Looking good today!",
            "God ettermiddag!",
            "Du ser flott ut i dag!",
            "Stå på, du gjør det bra!",
            "下午好！",
            "今天辛苦了！",
            "记得喝水哦！",
            "你做得很好！",
          ],
          evening: [
            "Wow, you look great!",
            "You look nice!",
            "Hi, there!",
            "God kveld!",
            "Du ser nydelig ut!",
            "Slapp av, du fortjener det.",
            "晚上好！",
            "今天过得怎么样？",
            "辛苦一天了，好好休息！",
            "晚安，做个好梦！",
          ],
          // Date keys use a "YYYY-MM-DD" glob where "." matches any digit.
          "....-01-01": ["Happy new year!", "Godt nytt år! 🎆", "新年快乐！🎆"],
          "....-05-17": ["Gratulerer med dagen! 🇳🇴", "Hipp hipp hurra!"],
          "....-12-24": ["God jul! 🎄", "圣诞快乐！🎄"],
          "....-12-25": ["God jul! 🎄", "Merry Christmas!", "圣诞快乐！🎄"],
        },
      },
    },

    // ===== News feed =====
    {
      module: "newsfeed",
      position: "bottom_bar",
      config: {
        // URLs are proxied through Vite (see vite.config.ts) to dodge browser
        // CORS. They map to:
        //   /feed-nrk/toppsaker.rss        -> https://www.nrk.no/toppsaker.rss
        //   /feed-aftenposten/rss          -> https://www.aftenposten.no/rss
        //   /feed-bbc-zh/.../trad/rss.xml  -> https://feeds.bbci.co.uk/zhongwen/trad/rss.xml
        //   (BBC's /simp/ feed 301-redirects to /trad/, so we target /trad/ directly.)
        feeds: [
          // {
          //   title: "NRK",
          //   url: "/feed-nrk/toppsaker.rss",
          // },
          // {
          //   title: "Aftenposten",
          //   url: "/feed-aftenposten/rss",
          // },
          // {
          //   title: "BBC 中文",
          //   url: "/feed-bbc-zh/zhongwen/trad/rss.xml",
          // },
          {
            // Klar Tale: Norwegian news in easy/plain language ("lettlest") —
            // good for kids and language learners. /rss/ 302-redirects to the
            // query URL, so we target that directly.
            title: "Klar Tale",
            url: "/feed-klartale/?lab_viewport=rss",
          },
        ],
        showSourceTitle: true,
        showPublishDate: true,
        rotateInterval: 10000,
      },
    },
  ],
};

export default config;
