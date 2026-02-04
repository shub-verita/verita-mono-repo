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
  outputFileTracingIncludes: {
    "/*": ["./node_modules/.prisma/**/*"],
  },
};

export default nextConfig;
