// Central moment instance for the whole app.
//
// We import the "moment-with-locales" build: a SINGLE module containing moment
// plus every locale. This is deliberate. Importing locales separately
// ("moment/locale/nb") fails under Vite/esbuild dev pre-bundling — each locale
// chunk inlines its own private copy of moment, so the data registers on a
// different instance and weekday names silently stay English. One module = one
// instance = locales always present. Timezone handling uses the browser's Intl
// API (see momentInZone), so moment-timezone isn't needed either.
import moment from "moment/min/moment-with-locales";

// Keep "en" as the global default; individual modules opt into their own locale.
moment.locale("en");

if (!moment.locales().includes("nb") || !moment.locales().includes("zh-cn")) {
  // eslint-disable-next-line no-console
  console.warn("[moment] locale data failed to register:", moment.locales());
}

/**
 * Return a moment for "now" as wall-clock time in the given IANA timezone
 * (e.g. "Asia/Shanghai"). The components are read with Intl and rebuilt as a
 * local moment, so locale-aware formatting (weekday, month names) works without
 * moment-timezone. Pass nothing for local time.
 */
export function momentInZone(timezone?: string) {
  if (!timezone) return moment();

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  })
    .formatToParts(new Date())
    .reduce<Record<string, string>>((acc, p) => {
      acc[p.type] = p.value;
      return acc;
    }, {});

  // Intl can emit "24" for midnight in hour12:false mode — normalize to 0.
  const hour = Number(parts.hour) % 24;

  return moment([
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    hour,
    Number(parts.minute),
    Number(parts.second)
  ]);
}

export default moment;
