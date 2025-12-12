"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Truck, BarChart3, User, Home } from "lucide-react";
import { WalletBadge } from "@/components/wallet/WalletBadge";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/deliveries", label: "Livraisons", icon: Truck },
  { href: "/earnings", label: "Revenus", icon: BarChart3 },
  { href: "/profile", label: "Profil", icon: User },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 flex items-center justify-center"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Truck className="w-4 h-4 text-white" />
            </motion.div>
            <span className="font-bold text-lg hidden sm:block">DONE Livreur</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive ? "text-white" : "text-slate-400 hover:text-white"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 bg-white/10 rounded-lg"
                      transition={{ type: "spring", duration: 0.5 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Wallet */}
          <WalletBadge />
        </div>
      </div>
    </header>
  );
}

