import { useEffect } from "react";
import config from "./config";
import moment from "./lib/moment";
import type { Position } from "./types";
import Module from "./components/Module";
import "./styles/main.css";

// The fixed set of regions, in DOM order, matching MagicMirror²'s layout.
// Fullscreen regions render first so they sit behind the bar/column regions.
const REGIONS: Position[] = [
  "fullscreen_below",
  "top_bar",
  "top_left",
  "top_center",
  "top_right",
  "upper_third",
  "middle_center",
  "lower_third",
  "bottom_left",
  "bottom_center",
  "bottom_right",
  "bottom_bar",
  "fullscreen_above"
];

export default function App() {
  // Apply the global locale once, like MagicMirror²'s config.language/locale.
  useEffect(() => {
    moment.locale(config.language);
    if (config.logLevel.includes("INFO")) {
      // eslint-disable-next-line no-console
      console.info(
        `[MagicMirror] language=${config.language} locale=${config.locale} — ${config.modules.length} modules loaded`
      );
    }
  }, []);

  return (
    <div className="magic-mirror">
      {REGIONS.map((region) => {
        const modules = config.modules.filter((m) => m.position === region);
        if (modules.length === 0) return null;
        return (
          <div key={region} className={`region ${region.replace(/_/g, " ")}`}>
            <div className="container">
              {modules.map((definition, index) => (
                <Module key={`${definition.module}-${index}`} definition={definition} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
