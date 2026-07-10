/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    serverActions: {
      // Checkout posts a payment screenshot through a server action. The default cap is 1 MB,
      // which is below the 5 MB limit enforced in lib/uploads.ts, so raise it to match.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
