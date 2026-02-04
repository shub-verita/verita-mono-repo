import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@verita/database", "@verita/auth", "@verita/shared"],
  typescript: {
    // Type checking done separately, skip during build to save memory
    ignoreBuildErrors: true,
  },
  eslint: {
    // Linting done separately, skip during build to save memory
    ignoreDuringBuilds: true,
  },
  experimental: {
    outputFileTracingRoot: path.join(process.cwd(), "../../"),
  },
};

export default nextConfig;
