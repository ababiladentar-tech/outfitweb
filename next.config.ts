import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // A package-lock.json in the home folder confuses root detection; pin it to this project.
  turbopack: { root: path.join(__dirname) },
};

export default nextConfig;
