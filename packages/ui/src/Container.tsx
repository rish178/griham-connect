import type { ReactNode } from "react";

/**
 * The one shared width/padding rhythm every top-level hero element (logo,
 * nav, hero copy, Property Health card, stats) aligns to — so they can never
 * drift independently against the viewport edges at different breakpoints.
 */
export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1440px] px-5 xl:px-12 2xl:px-16 ${className}`}>
      {children}
    </div>
  );
}
