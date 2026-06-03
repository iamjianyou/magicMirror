# Smart Mirror (React + TypeScript)

A TypeScript/React rebuild of the [MagicMirror²](https://github.com/MagicMirrorOrg/MagicMirror)
smart mirror, ported from the original `config/config.js` — a **dual Norway / China**
mirror:

| Region         | Modules                                                                 |
| -------------- | ----------------------------------------------------------------------- |
| **Top-left**   | Clock (`nb`) + Bergen current weather + 14-day forecast 🇳🇴             |
| **Top-right**  | Clock (`zh-cn`, Shanghai tz, lunar date) + Wenzhou weather + forecast 🇨🇳 |
| **Background** | Full-screen photo slideshow with gradient overlays                      |
| **Lower third**| Compliments (rotating, cross-fade)                                      |
| **Bottom bar** | News ticker (New York Times RSS)                                        |

Reproduced features, matching the original modules:

| Module                    | Feature                                                                          |
| ------------------------- | -------------------------------------------------------------------------------- |
| **Clock**                 | Per-instance `lang`, `timezone`, `dateFormat`, `displaySeconds`, `showLunarDate` |
| **Weather**               | `type: current \| forecast`, per-instance language (labels + day names), 14-day  |
| **Compliments**           | Time-of-day buckets + date keys, cross-fade                                      |
| **MMM-BackgroundSlideshow** | Cross-fading photos, randomize, `backgroundSize`, vertical + horizontal gradients |
| **NewsFeed**              | RSS fetch + rotating headlines with source + relative publish date               |

Languages render correctly because the moment locale data for `nb` and `zh-cn`
is loaded ([src/lib/moment.ts](src/lib/moment.ts)) and the China clock uses
`moment-timezone`. It keeps the MagicMirror² look (black background, Roboto
Condensed, region layout, weather-icons, white text over photos) and uses
[Open-Meteo](https://open-meteo.com) for weather, so **no API key is required**.

## Customise

- **Locations / languages** — edit the module entries in [src/config.ts](src/config.ts)
  (`lat`/`lon`, `lang`, `timezone`, `header`).
- **Background photos** — drop images into [src/assets/photos/](src/assets/photos/);
  they're picked up automatically. (Your MagicMirror photos were copied here.)
- **News feeds** — browsers block cross-origin RSS, so each feed host needs a proxy
  entry in [vite.config.ts](vite.config.ts) (the NYT feed is already wired as `/feed-nyt`).
- **Weather labels** — add languages in [src/translations.ts](src/translations.ts).

### Not ported

The MagicMirror `alert` and `updatenotification` modules are platform/system
modules (popup alerts, git update checks) with no visual content here, so they're
omitted.

## Run it

As a standalone full-screen desktop window (like MagicMirror², via Electron):

```bash
cd smart-mirror-react
npm install
npm start
```

Press **Esc** (or **⌘/Ctrl+Q**) to quit the window.

Other modes:

| Command         | What it does                                            |
| --------------- | ------------------------------------------------------- |
| `npm start`     | Standalone full-screen Electron window (default)        |
| `npm run dev`   | Browser only — http://localhost:3000 (handy for tweaks) |
| `npm run build` | Type-check + production build into `dist/`              |

## Configure it

All configuration lives in [`src/config.ts`](src/config.ts) — the React/TypeScript
analogue of MagicMirror²'s `config/config.js`. It has a global section plus a list
of modules, each placed in a region (`top_left`, `top_right`, `lower_third`, …)
with its own config.

### Notable options

- **Clock** — set `showLunarDate: true` to append the Chinese lunar date; set
  `lang` (e.g. `"zh-cn"`) to localise just the clock.
- **Weather** — set `lat`/`lon`/`locationName` to your location; set `lang`
  (e.g. `"fr"` or `"zh-cn"`) to translate this module independently of the
  global language. Add languages in [`src/translations.ts`](src/translations.ts).
- **Compliments** — edit the `compliments` buckets (`anytime`, `morning`,
  `afternoon`, `evening`, and date keys like `"....-01-01"`).

## Project layout

```
src/
  config.ts            # the mirror configuration (modules + regions)
  types.ts             # config + module types
  translations.ts      # weather label translations (en/fr/zh-cn)
  App.tsx              # renders modules into regions
  components/Module.tsx# module wrapper + dispatch
  modules/
    Clock.tsx
    Compliments.tsx
    Weather.tsx
  lib/weather.ts       # Open-Meteo client + WMO code → icon mapping
  styles/main.css      # MagicMirror²-style theme
```
