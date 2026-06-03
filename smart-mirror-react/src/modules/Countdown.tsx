import { Fragment, useEffect, useRef, useState } from "react";
import moment from "../lib/moment";
import type { CountdownConfig } from "../types";

interface Props {
  config: CountdownConfig;
}

const DEFAULTS = {
  // FIFA World Cup 2026 opening match — Estadio Azteca, Mexico City.
  // Kickoff 13:00 local (UTC-6, no DST in Mexico); matches fifa.com.
  targetDate: "2026-06-11T13:00:00-06:00",
  title: "FIFA World Cup 2026 ⚽⚽",
  displaySeconds: true,
  finishedText: "Kick-off! ⚽",
};

// Total flip duration in ms; must match the CSS animation timings.
const FLIP_MS = 600;

const UNITS: {
  key: "days" | "hours" | "minutes" | "seconds";
  label: string;
}[] = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
];

/**
 * Counts down to a fixed target date (default: the FIFA World Cup 2026 opening
 * match), rendered as a split-flap clock: when a digit changes, its top half
 * folds down and the new bottom half folds in, like a real flip board.
 */
export default function Countdown({ config }: Props) {
  const c = { ...DEFAULTS, ...config };
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const target = moment(c.targetDate);
  const diffMs = target.diff(moment());

  if (diffMs <= 0) {
    return (
      <div className="countdown">
        <div className="countdown-title bright medium">{c.title}</div>
        <div className="countdown-finished bright large light">
          {c.finishedText}
        </div>
      </div>
    );
  }

  const dur = moment.duration(diffMs);
  const values = {
    days: Math.floor(dur.asDays()),
    hours: dur.hours(),
    minutes: dur.minutes(),
    seconds: dur.seconds(),
  };

  const units = c.displaySeconds
    ? UNITS
    : UNITS.filter((u) => u.key !== "seconds");

  return (
    <div className="countdown">
      <div className="countdown-title bright medium">{c.title}</div>
      <div className="flip-clock">
        {units.map((u, idx) => (
          <Fragment key={u.key}>
            <div className="flip-group">
              <FlipNumber value={values[u.key]} />
              <span className="flip-label">{u.label}</span>
            </div>
            {idx < units.length - 1 && <span className="flip-sep">:</span>}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

/** A 2-digit value rendered as two flip cards (e.g. 8 → "0" "8"). */
function FlipNumber({ value }: { value: number }) {
  const digits = String(value).padStart(2, "0").split("");
  return (
    <div className="flip-unit">
      {digits.map((d, i) => (
        <FlipDigit key={i} digit={d} />
      ))}
    </div>
  );
}

/**
 * A single split-flap card. Shows `digit`; when it changes, the old top flap
 * folds down (revealing the new top behind it) and the new bottom flap folds
 * up over the old bottom.
 */
function FlipDigit({ digit }: { digit: string }) {
  const prevRef = useRef(digit);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (prevRef.current === digit) return;
    setFlipping(true);
    const t = setTimeout(() => {
      prevRef.current = digit;
      setFlipping(false);
    }, FLIP_MS);
    return () => clearTimeout(t);
  }, [digit]);

  const previous = prevRef.current;
  const current = digit;

  return (
    <span className="flip-card">
      {/* Static halves underneath: top already shows the new digit; bottom keeps
          the old digit until the flap finishes covering it. */}
      <span className="flip-half top">
        <span className="flip-num">{current}</span>
      </span>
      <span className="flip-half bottom">
        <span className="flip-num">{flipping ? previous : current}</span>
      </span>
      {/* Animated flaps, mounted only during a flip so the animation re-runs. */}
      {flipping && (
        <Fragment key={`${previous}-${current}`}>
          <span className="flip-anim top">
            <span className="flip-num">{previous}</span>
          </span>
          <span className="flip-anim bottom">
            <span className="flip-num">{current}</span>
          </span>
        </Fragment>
      )}
    </span>
  );
}
