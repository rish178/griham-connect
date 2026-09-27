import type { ReactNode } from "react";
import type { HeroStat } from "@grihamconnect/types";
import { Container } from "./Container";
import { SiteHeader } from "./SiteHeader";

export interface GrihamHeroProps {
  eyebrow: string | null;
  headline: string;
  description: string | null;
  accentText?: string | null;
  stats?: HeroStat[];
  desktopImageUrl: string | null;
  mobileImageUrl: string | null;
  children: ReactNode;
}

/** Renders literal line breaks in the headline and highlights the word "property" in green — content-driven, not hardcoded markup. */
function Headline({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, lineIndex) => (
        <span key={lineIndex} className="block">
          {line.split(/(\s+)/).map((word, i) =>
            /^property$/i.test(word) ? (
              <span key={i} className="text-griham-green">
                {word}
              </span>
            ) : (
              <span key={i}>{word}</span>
            )
          )}
        </span>
      ))}
    </>
  );
}

/**
 * Full-bleed editorial hero. Navigation sits transparently over the image;
 * a controlled left-to-right gradient keeps the left copy readable while
 * preserving the sky/skyline on the right.
 *
 * Three-zone desktop grid — left copy / center handwritten note / right
 * card — each in its own track. The center track always renders (even when
 * accentText is empty) so the grid never collapses to two columns; an empty
 * track just sizes to ~0 and the layout degrades gracefully.
 */
export function GrihamHero({
  eyebrow,
  headline,
  description,
  accentText,
  stats = [],
  desktopImageUrl,
  mobileImageUrl,
  children,
}: GrihamHeroProps) {
  return (
    <section className="relative isolate min-h-[720px] overflow-hidden bg-paper">
      <div className="absolute inset-0 -z-10">
        {desktopImageUrl ? (
          <picture>
            {mobileImageUrl && <source media="(max-width: 767px)" srcSet={mobileImageUrl} />}
            <img
              src={desktopImageUrl}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover"
            />
          </picture>
        ) : (
          <div
            aria-hidden="true"
            className="h-full w-full bg-[radial-gradient(circle_at_80%_30%,var(--griham-green-soft),transparent_60%)]"
          />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(245,247,243,0.96) 0%, rgba(245,247,243,0.88) 25%, rgba(245,247,243,0.45) 50%, rgba(245,247,243,0.05) 75%, rgba(245,247,243,0) 100%)",
          }}
        />
      </div>

      <SiteHeader />

      <Container className="relative grid grid-cols-1 gap-8 pb-16 pt-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-start md:gap-x-10 md:pb-28 md:pt-8">
        <div className="flex flex-col gap-5">
          {eyebrow && (
            <p className="font-mono text-s font-medium uppercase tracking-wide text-griham-green">
              {eyebrow}
            </p>
          )}
          <h1 className="font-sans text-6xl font-medium leading-[0.98] tracking-[-0.055em] text-ink sm:text-7xl">
            <Headline text={headline} />
          </h1>
          {description && (
            <p className="max-w-md text-[17px] leading-[1.55] text-ink-soft">{description}</p>
          )}

          {stats.length > 0 && (
            <div className="mt-2 flex flex-wrap items-stretch gap-x-6 gap-y-3">
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`pl-6 first:pl-0 ${i > 0 ? "border-l border-line" : ""}`}
                >
                  <p className="font-sans text-2xl font-medium text-ink">{stat.value}</p>
                  <p className="text-xs text-ink-soft">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Center zone: decorative brand annotation. Its own grid track, so
            it can never overlap the copy or the card on either side. */}
        <div className="flex justify-center md:w-44 md:justify-self-center md:pt-1">
          {accentText && (
            <p className="max-w-[12rem] rotate-[-16deg] text-center font-script text-2xl leading-[1.15] text-griham-green">
              {accentText.split("\n").map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </p>
          )}
        </div>

        <div className="w-full md:max-w-[560px] md:justify-self-end">{children}</div>
      </Container>
    </section>
  );
}
