import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@grihamconnect/db",
    "@grihamconnect/types",
    "@grihamconnect/scoring",
    "@grihamconnect/ui",
  ],
};

export default nextConfig;
