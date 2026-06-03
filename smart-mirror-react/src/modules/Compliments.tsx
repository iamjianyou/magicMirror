import { useCallback, useEffect, useState } from "react";
import moment from "../lib/moment";
import type { ComplimentsConfig } from "../types";

interface Props {
  config: ComplimentsConfig;
}

const DEFAULT_COMPLIMENTS: Record<string, string[]> = {
  anytime: ["Hey there!"]
};

/**
 * Rotating compliments, reproducing the MagicMirror² compliments module:
 * picks from the time-of-day bucket (plus any anytime and date-specific
 * entries), and cross-fades to a new one on `updateInterval`.
 */
export default function Compliments({ config }: Props) {
  const compliments = config.compliments ?? DEFAULT_COMPLIMENTS;
  const updateInterval = config.updateInterval ?? 30000;
  const fadeSpeed = config.fadeSpeed ?? 4000;

  const pick = useCallback(() => {
    const pool = complimentPool(compliments);
    if (pool.length === 0) return "";
    const index = Math.floor(Math.random() * pool.length);
    return pool[index];
  }, [compliments]);

  const [text, setText] = useState(pick);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      // Fade out, swap text, fade back in — like the module's fade transition.
      setVisible(false);
      const swap = setTimeout(() => {
        setText(pick());
        setVisible(true);
      }, fadeSpeed / 2);
      return () => clearTimeout(swap);
    }, updateInterval);
    return () => clearInterval(timer);
  }, [updateInterval, fadeSpeed, pick]);

  return (
    <div
      className="compliments thin xlarge bright"
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity ${fadeSpeed / 2}ms ease-in-out`
      }}
    >
      {text}
    </div>
  );
}

/**
 * Build the pool of currently-eligible compliments: the time-of-day bucket,
 * the "anytime" bucket, and any date key (e.g. "....-01-01") matching today.
 */
function complimentPool(compliments: Record<string, string[]>): string[] {
  const now = moment();
  const hour = now.hour();

  let period: "morning" | "afternoon" | "evening";
  if (hour >= 3 && hour < 12) period = "morning";
  else if (hour >= 12 && hour < 17) period = "afternoon";
  else period = "evening";

  const pool: string[] = [];
  if (compliments.anytime) pool.push(...compliments.anytime);
  if (compliments[period]) pool.push(...compliments[period]);

  // Date-specific entries use a glob-like "YYYY-MM-DD" pattern where "." is any digit.
  const todayKey = now.format("YYYY-MM-DD");
  for (const key of Object.keys(compliments)) {
    if (!key.includes("-")) continue;
    const pattern = new RegExp(`^${key.replace(/\./g, "\\d")}$`);
    if (pattern.test(todayKey)) pool.push(...compliments[key]);
  }

  return pool;
}
