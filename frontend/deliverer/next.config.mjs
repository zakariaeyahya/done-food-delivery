/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Support pour les variables d'environnement (VITE_* et NEXT_PUBLIC_*)
  env: {
    // Support VITE_* pour compatibilité avec services existants
    VITE_API_URL: process.env.NEXT_PUBLIC_API_URL || process.env.VITE_API_URL,
    VITE_ORDER_MANAGER_ADDRESS: process.env.NEXT_PUBLIC_ORDER_MANAGER_ADDRESS || process.env.VITE_ORDER_MANAGER_ADDRESS,
    VITE_STAKING_ADDRESS: process.env.NEXT_PUBLIC_STAKING_ADDRESS || process.env.VITE_STAKING_ADDRESS,
    VITE_PAYMENT_SPLITTER_ADDRESS: process.env.NEXT_PUBLIC_PAYMENT_SPLITTER_ADDRESS || process.env.VITE_PAYMENT_SPLITTER_ADDRESS,
    VITE_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || process.env.VITE_SOCKET_URL,
    VITE_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY,
    // Support NEXT_PUBLIC_* pour Next.js
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_ORDER_MANAGER_ADDRESS: process.env.NEXT_PUBLIC_ORDER_MANAGER_ADDRESS,
    NEXT_PUBLIC_STAKING_ADDRESS: process.env.NEXT_PUBLIC_STAKING_ADDRESS,
    NEXT_PUBLIC_PAYMENT_SPLITTER_ADDRESS: process.env.NEXT_PUBLIC_PAYMENT_SPLITTER_ADDRESS,
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  },
  // Configuration Turbopack (Next.js 16+)
  turbopack: {
    resolveAlias: {
      // Fallbacks pour compatibilité
    },
  },
  // Support pour les imports de services (webpack - utilisé si --webpack flag)
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

export default nextConfig;

