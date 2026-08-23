"use client";

import { useEffect, useState } from "react";
import { Copy, RefreshCw, ThumbsUp, ThumbsDown } from "lucide-react";

/* ──────────────────────────────────
 * STREAMING TEXT
 * Words resolve out of blur, inline citations appear in
 * context, then actions and follow-up prompts become usable.
 * ────────────────────────────────── */

const WORD_MS = 80;
const HOLD_MS = 3400;

type Token = { text: string; cite?: boolean };

const TOKENS: Token[] = [
  ..."Pistachio is your fastest-growing flavor — sales are up 23% this month and margins beat vanilla by 8 points."
    .split(" ")
    .map((text) => ({ text })),
  { text: "", cite: true },
  ..."Stone-fruit flavors are trending in the same range."
    .split(" ")
    .map((text) => ({ text })),
];

const FOLLOW_UPS = [
  "Which flavors sell best in winter",
  "Compare gelato and soft serve margins",
];

const SOURCE_IMAGES = {
  scoop:
    "https://images.unsplash.com/photo-1570197571499-166b36435e9f?auto=format&fit=crop&q=80&w=64&h=64",
  trends:
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=64&h=64",
  market:
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=64&h=64",
};

const SOURCES = [
  {
    name: "Scoop Data",
    domain: "scoopdata.io",
    href: "https://scoopdata.io/",
    image: SOURCE_IMAGES.scoop,
  },
  {
    name: "Trends Index",
    domain: "trends.google.com",
    href: "https://trends.google.com/trends/",
    image: SOURCE_IMAGES.trends,
  },
  {
    name: "Market Basket",
    domain: "marketbasket.io",
    href: "https://marketbasket.io/",
    image: SOURCE_IMAGES.market,
  },
];

function sourceImage(source: (typeof SOURCES)[number]) {
  return source.image;
}

function SourceChip() {
  const source = SOURCES[0];
  return (
    <a
      href={source.href}
      target="_blank"
      rel="noreferrer"
      className="ml-0 mr-1 inline-flex h-4.5 translate-y-[-1px] items-center gap-1 rounded-[5px]
        bg-inset pr-1.5 pl-[3px] align-middle font-mono text-[10.5px] text-ink-2 shadow-hairline
        transition-colors duration-150 hover:bg-hover hover:text-ink"
      style={{ animation: "pop-in 250ms cubic-bezier(0.23,1,0.32,1) both" }}
    >
      <img
        src={sourceImage(source)}
        alt=""
        className="source-avatar size-3 rounded-[3px] object-cover"
      />
      <span>{source.domain}</span>
    </a>
  );
}

const ACTION_ICONS = [
  <Copy key="copy" size={15} strokeWidth={1.8} />,
  <RefreshCw key="retry" size={15} strokeWidth={1.8} />,
  <ThumbsUp key="up" size={15} strokeWidth={1.8} />,
  <ThumbsDown key="down" size={15} strokeWidth={1.8} />,
];

export default function StreamingText() {
  const [count, setCount] = useState(0);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const done = count >= TOKENS.length;

  useEffect(() => {
    const t = setTimeout(
      () => setCount((c) => (c >= TOKENS.length ? 0 : c + 1)),
      done ? HOLD_MS : WORD_MS,
    );
    return () => clearTimeout(t);
  }, [count, done]);

  return (
    <div className="min-h-[13rem] w-full max-w-95">
      <p className="text-[13px] leading-relaxed text-ink">
        {TOKENS.slice(0, count).map((token, i) =>
          token.cite ? (
            <SourceChip key={i} />
          ) : (
            <span
              key={i}
              className="inline"
              style={{ animation: "fade-in 250ms ease-out both" }}
            >
              {token.text}{" "}
            </span>
          ),
        )}
        {!done && (
          <span
            className="ml-0.5 inline-block h-3 w-0.5 translate-y-0.5 rounded-full bg-ink"
            style={{ animation: "fade-in 150ms ease-out both" }}
          />
        )}
      </p>

      {/* action icons row */}
      <div
        className="mt-2 flex items-center gap-0.5 transition-opacity duration-400"
        style={{ opacity: done ? 1 : 0, pointerEvents: done ? "auto" : "none" }}
      >
        {ACTION_ICONS.map((icon, i) => (
          <button
            key={i}
            type="button"
            aria-label="Action"
            className="flex size-6 items-center justify-center rounded-[6px] text-ink-3
              transition-colors duration-100 hover:bg-hover-2 hover:text-ink-2"
          >
            {icon}
          </button>
        ))}
        <button
          type="button"
          aria-expanded={sourcesOpen}
          onClick={() => setSourcesOpen((current) => !current)}
          className="ml-1.5 flex items-center gap-1.5 rounded-[6px] px-1 py-0.5 text-left transition-colors duration-150 hover:bg-hover"
        >
          <span className="flex -space-x-1">
            {SOURCES.map((source) => (
              <img
                key={source.domain}
                src={sourceImage(source)}
                alt=""
                className="source-avatar size-3.5 rounded-full bg-surface shadow-[0_0_0_1.5px_var(--canvas)] object-cover"
              />
            ))}
          </span>
          <span className="text-[12px] text-ink-2">10 sources</span>
        </button>
      </div>

      <div
        className="grid transition-[grid-template-rows,opacity] duration-300"
        style={{
          gridTemplateRows: done && sourcesOpen ? "1fr" : "0fr",
          opacity: done && sourcesOpen ? 1 : 0,
          transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
        }}
      >
        <div className="overflow-hidden">
          <div className="mt-1.5 flex flex-col rounded-control bg-inset p-1 shadow-hairline">
            {SOURCES.map((source) => (
              <a
                key={source.domain}
                href={source.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-[6px] px-1.5 py-1 text-[12px] text-ink-2 transition-colors duration-150 hover:bg-hover hover:text-ink"
              >
                <img
                  src={sourceImage(source)}
                  alt=""
                  className="source-avatar size-4 rounded-[4px] object-cover"
                />
                <span className="animated-underline">{source.name}</span>
                <span className="ml-auto font-mono text-[10.5px] text-ink-3">
                  {source.domain}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* follow-ups */}
      <div
        className="mt-2.5 transition-opacity duration-400"
        style={{ opacity: done ? 1 : 0, pointerEvents: done ? "auto" : "none" }}
      >
        <p className="text-[12px] font-medium text-ink-2">Follow-ups</p>
        <div className="mt-0.5 flex flex-col">
          {FOLLOW_UPS.map((text, i) => (
            <button
              key={text}
              className="-mx-1.5 flex items-center gap-2 border-b border-line
                px-1.5 py-1.5 text-left text-[12.5px] text-ink transition-colors
                duration-100 hover:bg-hover-2"
              style={
                done
                  ? {
                      animation: `fade-up 350ms cubic-bezier(0.23,1,0.32,1) ${i * 90}ms both`,
                    }
                  : { opacity: 0 }
              }
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--ink-3)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0"
              >
                <path d="M9 10l-5 5 5 5" />
                <path d="M20 4v7a4 4 0 0 1-4 4H4" />
              </svg>
              {text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
