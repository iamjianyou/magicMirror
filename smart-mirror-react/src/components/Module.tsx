import type { ModuleDefinition } from "../types";
import config from "../config";
import Clock from "../modules/Clock";
import Compliments from "../modules/Compliments";
import Weather from "../modules/Weather";
import NewsFeed from "../modules/NewsFeed";
import BackgroundSlideshow from "../modules/BackgroundSlideshow";
import type {
  BackgroundSlideshowConfig,
  ClockConfig,
  ComplimentsConfig,
  NewsFeedConfig,
  WeatherConfig
} from "../types";

interface Props {
  definition: ModuleDefinition;
}

/**
 * Renders a single module (with an optional header), dispatching on module name.
 * This is the React analogue of MagicMirror²'s module wrapper.
 */
export default function Module({ definition }: Props) {
  return (
    <div className={`module ${definition.module}-module`}>
      {definition.header && <header>{definition.header}</header>}
      <div className="module-content">{renderModule(definition)}</div>
    </div>
  );
}

function renderModule(definition: ModuleDefinition) {
  const cfg = (definition.config ?? {}) as Record<string, unknown>;
  switch (definition.module) {
    case "clock":
      return (
        <Clock config={cfg as unknown as ClockConfig} language={config.language} timeFormat={config.timeFormat} />
      );
    case "weather":
      return (
        <Weather config={cfg as unknown as WeatherConfig} language={config.language} units={config.units} />
      );
    case "compliments":
      return <Compliments config={cfg as unknown as ComplimentsConfig} />;
    case "newsfeed":
      return <NewsFeed config={cfg as unknown as NewsFeedConfig} language={config.language} />;
    case "MMM-BackgroundSlideshow":
      return <BackgroundSlideshow config={cfg as unknown as BackgroundSlideshowConfig} />;
    default:
      return null;
  }
}
