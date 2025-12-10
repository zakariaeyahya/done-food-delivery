"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export function Card({ children, className, hover = true, glow = false }: CardProps) {
  return (
    <motion.div
      className={cn(
        "relative rounded-2xl border border-white/[0.08] bg-[#1a1a24]/80 backdrop-blur-xl p-6",
        "shadow-[0_4px_24px_rgba(0,0,0,0.4)]",
        hover && "transition-all duration-300 hover:border-white/[0.15] hover:bg-[#22222e]/80",
        glow && "shadow-[0_0_40px_rgba(99,102,241,0.15)]",
        className
      )}
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {glow && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

