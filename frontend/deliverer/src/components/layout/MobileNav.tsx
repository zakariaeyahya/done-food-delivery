"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Truck, BarChart3, User, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/deliveries", label: "Livraisons", icon: Truck },
  { href: "/earnings", label: "Revenus", icon: BarChart3 },
  { href: "/profile", label: "Profil", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors",
                isActive ? "text-orange-400" : "text-slate-400"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-pink-600"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

