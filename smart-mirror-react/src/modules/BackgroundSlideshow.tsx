import { useEffect, useMemo, useState } from "react";
import type { BackgroundSlideshowConfig } from "../types";

// Eagerly import every photo in src/assets/photos — drop more images in there
// and they're picked up automatically (the React analogue of imagePaths).
const imageModules = import.meta.glob("../assets/photos/*.{jpg,jpeg,png,gif,webp,JPG,JPEG,PNG}", {
  eager: true,
  query: "?url",
  import: "default"
});

const ALL_IMAGES: string[] = Object.values(imageModules) as string[];

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Full-screen background photo slideshow, reproducing MMM-BackgroundSlideshow:
 * cross-fades through the images on `slideshowSpeed`, scaled with
 * `backgroundSize`, with vertical + horizontal gradient overlays so foreground
 * text stays readable.
 */
export default function BackgroundSlideshow({ config }: { config: BackgroundSlideshowConfig }) {
  const slideshowSpeed = config.slideshowSpeed ?? 10000;
  const transitionSpeed = config.transitionSpeed ?? "2s";
  const backgroundSize = config.backgroundSize ?? "cover";

  const images = useMemo(
    () => (config.randomizeImageOrder ? shuffle(ALL_IMAGES) : ALL_IMAGES),
    [config.randomizeImageOrder]
  );

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % images.length), slideshowSpeed);
    return () => clearInterval(timer);
  }, [images.length, slideshowSpeed]);

  if (images.length === 0) {
    return null;
  }

  const verticalGradient = config.gradient ? `linear-gradient(to bottom, ${config.gradient.join(", ")})` : null;
  const horizontalGradient = config.horizontalGradient
    ? `linear-gradient(to right, ${config.horizontalGradient.join(", ")})`
    : null;
  const overlays = [verticalGradient, horizontalGradient].filter(Boolean).join(", ");

  return (
    <div className="background-slideshow">
      {images.map((src, i) => (
        <div
          key={src}
          className="slide"
          style={{
            backgroundImage: `url(${src})`,
            backgroundSize,
            opacity: i === index ? 1 : 0,
            transition: `opacity ${transitionSpeed} ease-in-out`
          }}
        />
      ))}
      {overlays && <div className="slideshow-gradient" style={{ backgroundImage: overlays }} />}
    </div>
  );
}
