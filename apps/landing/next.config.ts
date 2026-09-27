import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  images: {
    // No Cloudflare Images binding wired up yet — avoid the Image
    // Optimization API needing one. Revisit if/when that's set up.
    unoptimized: true,
  },
};

// Gives `next dev` access to Cloudflare bindings/secrets (via .dev.vars),
// matching what the deployed Worker sees through getCloudflareContext().
initOpenNextCloudflareForDev();

export default nextConfig;
