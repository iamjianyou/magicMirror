import { useEffect, useState } from "react";
import moment from "../lib/moment";
import type { NewsFeedConfig } from "../types";

interface Item {
  title: string;
  pubDate: string | null;
  source: string;
}

/**
 * Scrolling news ticker, reproducing the MagicMirror² newsfeed module: fetches
 * the configured RSS feeds, then rotates through the headlines (optionally with
 * the source title and publish date).
 *
 * Browsers block cross-origin RSS fetches, so feed URLs are proxied through the
 * Vite dev server (see vite.config.ts).
 */
export default function NewsFeed({ config, language }: { config: NewsFeedConfig; language: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [index, setIndex] = useState(0);

  const rotateInterval = config.rotateInterval ?? 10000;
  const updateInterval = config.updateInterval ?? 5 * 60 * 1000;

  useEffect(() => {
    let active = true;
    const load = async () => {
      const collected: Item[] = [];
      for (const feed of config.feeds) {
        try {
          const res = await fetch(feed.url);
          const xml = await res.text();
          const doc = new DOMParser().parseFromString(xml, "text/xml");
          doc.querySelectorAll("item").forEach((node) => {
            const title = node.querySelector("title")?.textContent?.trim();
            if (title) {
              collected.push({
                title,
                pubDate: node.querySelector("pubDate")?.textContent ?? null,
                source: feed.title
              });
            }
          });
        } catch {
          // Skip a feed that fails to load; others still show.
        }
      }
      if (active) {
        setItems(collected);
        setIndex(0);
      }
    };

    load();
    const timer = setInterval(load, updateInterval);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [JSON.stringify(config.feeds), updateInterval]);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % items.length), rotateInterval);
    return () => clearInterval(timer);
  }, [items.length, rotateInterval]);

  if (items.length === 0) return null;

  const item = items[index];
  const date = item.pubDate ? moment(item.pubDate).locale(language).fromNow() : null;

  return (
    <div className="newsfeed">
      {config.showSourceTitle && <span className="newsfeed-source bright">{item.source}</span>}
      {date && config.showPublishDate && <span className="newsfeed-date dimmed">, {date}:</span>}
      <span className="newsfeed-title light"> {item.title}</span>
    </div>
  );
}
