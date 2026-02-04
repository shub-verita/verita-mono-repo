/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@verita/database", "@verita/auth", "@verita/shared"],
};

export default nextConfig;
