/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Support pour les variables d'environnement VITE_*
  env: {
    VITE_API_URL: process.env.VITE_API_URL,
    VITE_ORDER_MANAGER_ADDRESS: process.env.VITE_ORDER_MANAGER_ADDRESS,
    VITE_STAKING_ADDRESS: process.env.VITE_STAKING_ADDRESS,
    VITE_PAYMENT_SPLITTER_ADDRESS: process.env.VITE_PAYMENT_SPLITTER_ADDRESS,
    VITE_SOCKET_URL: process.env.VITE_SOCKET_URL,
    VITE_GOOGLE_MAPS_API_KEY: process.env.VITE_GOOGLE_MAPS_API_KEY,
  },
  // Support pour les imports de services
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

module.exports = nextConfig;

