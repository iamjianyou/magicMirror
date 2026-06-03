// Weather label translations. This reproduces the MagicMirror² weather module's
// per-instance translation support: a module can render labels and day names in
// a language different from the global one (its `lang` config), falling back to
// English when a key or language is missing.
//
// Values support {variable} placeholders, e.g. "Feels like {temp}".
export type TranslationSet = Record<string, string>;

export const translations: Record<string, TranslationSet> = {
  en: {
    FEELS: "Feels like {temp}",
    HUMIDITY: "Humidity",
    WIND: "Wind",
    SUNRISE: "Sunrise",
    SUNSET: "Sunset",
    LOADING: "Loading weather …"
  },
  nb: {
    FEELS: "Føles som {temp}",
    HUMIDITY: "Luftfuktighet",
    WIND: "Vind",
    SUNRISE: "Soloppgang",
    SUNSET: "Solnedgang",
    LOADING: "Laster vær …"
  },
  fr: {
    FEELS: "Ressenti {temp}",
    HUMIDITY: "Humidité",
    WIND: "Vent",
    SUNRISE: "Lever",
    SUNSET: "Coucher",
    LOADING: "Chargement de la météo …"
  },
  "zh-cn": {
    FEELS: "体感 {temp}",
    HUMIDITY: "湿度",
    WIND: "风速",
    SUNRISE: "日出",
    SUNSET: "日落",
    LOADING: "正在加载天气 …"
  }
};

/**
 * Translate a key for the given language, substituting {variables}.
 * Mirrors the weather module's `translateKey` helper: falls back to English,
 * then to the raw key.
 */
export function translateKey(
  lang: string,
  key: string,
  variables: Record<string, string | number> = {}
): string {
  const set = translations[lang.toLowerCase()] ?? translations.en;
  const template = set[key] ?? translations.en[key] ?? key;
  return template.replace(/{([^}]+)}/g, (_, name: string) =>
    name in variables ? String(variables[name]) : `{${name}}`
  );
}
