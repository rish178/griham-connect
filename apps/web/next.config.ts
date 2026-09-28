import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@grihamconnect/db",
    "@grihamconnect/types",
    "@grihamconnect/scoring",
    "@grihamconnect/ui",
  ],
  images: {
    // No Cloudflare Images binding wired up yet, and the app only uses plain
    // <img> tags anyway — avoid the Image Optimization API needing sharp,
    // which can't bundle for the Workers runtime.
    unoptimized: true,
  },
  // `unoptimized: true` alone doesn't stop Next from tracing sharp (its
  // optional image-optimization dependency) into the standalone output —
  // OpenNext's esbuild step then fails trying to bundle sharp's native
  // .node binary, which can't run in a Workers isolate at all. Marking it
  // external keeps it out of the trace entirely.
  serverExternalPackages: ["sharp"],
};

// Gives `next dev` access to Cloudflare bindings/secrets (via .dev.vars),
// matching what the deployed Worker sees through getCloudflareContext().
initOpenNextCloudflareForDev();

export default nextConfig;
