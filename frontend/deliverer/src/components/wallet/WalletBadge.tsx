"use client";

import { useApp } from "@/providers/AppProvider";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";

export function WalletBadge() {
  const { address, connectWallet } = useApp();

  if (address) {
    return (
      <motion.div
        className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {address.slice(0, 6)}...{address.slice(-4)}
      </motion.div>
    );
  }

  return (
    <Button variant="primary" size="sm" onClick={connectWallet}>
      Connecter Wallet
    </Button>
  );
}

