"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet, CheckCircle2, AlertCircle, Lock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import blockchain, { DELIVERER_ROLE } from "@/services/blockchain";
import api from "@/services/api";
import { useRouter } from "next/navigation";

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (address: string) => void;
}

export function ConnectWalletModal({
  isOpen,
  onClose,
  onConnect,
}: ConnectWalletModalProps) {
  const router = useRouter();
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasRole, setHasRole] = useState(false);
  const [isStaked, setIsStaked] = useState(false);
  const [stakedAmount, setStakedAmount] = useState(0);
  const [deliverer, setDeliverer] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      checkWalletConnection();
    }
  }, [isOpen]);

  async function checkWalletConnection() {
    try {
      if (typeof window === "undefined" || !window.ethereum) return;

      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts.length > 0) {
        await handleConnect(accounts[0]);
      }
    } catch (err) {
      console.error("Erreur détection wallet :", err);
    }
  }

  async function handleConnect(existingAccount: string | null = null) {
    setIsConnecting(true);
    setError(null);

    try {
      let account = existingAccount;

      if (!account) {
        const { address: connectedAddress } = await blockchain.connectWallet();
        setAddress(connectedAddress);
        account = connectedAddress;
      } else {
        setAddress(account);
      }

      const hasDelivererRole = await blockchain.hasRole(DELIVERER_ROLE, account);
      setHasRole(hasDelivererRole);

      if (!hasDelivererRole) {
        setError("Vous n'avez pas le rôle DELIVERER. Veuillez vous inscrire.");
        return;
      }

      const staked = await blockchain.isStaked(account);
      setIsStaked(staked);

      if (staked) {
        const stakeInfo = await blockchain.getStakeInfo(account);
        setStakedAmount(stakeInfo.amount);
      }

      try {
        const profile = await api.getDeliverer(account);
        setDeliverer(profile.deliverer);
      } catch (err) {
        console.log("Livreur non enregistré dans la base backend.");
      }

      onConnect(account);
    } catch (err: any) {
      setError(`Erreur de connexion : ${err.message}`);
    } finally {
      setIsConnecting(false);
    }
  }

  function handleDisconnect() {
    setAddress(null);
    setHasRole(false);
    setIsStaked(false);
    setStakedAmount(0);
    setDeliverer(null);
    setError(null);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative z-10 w-full max-w-md"
        >
          <Card className="relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                Connexion Wallet
              </h2>
              <p className="text-slate-400">Connectez votre wallet MetaMask</p>
            </div>

            {!address && (
              <Button
                onClick={() => handleConnect()}
                disabled={isConnecting}
                className="w-full"
                size="lg"
              >
                <Wallet className="w-5 h-5 mr-2" />
                {isConnecting ? "Connexion..." : "Connecter MetaMask"}
              </Button>
            )}

            {address && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-sm text-slate-400 mb-1">Adresse</p>
                  <p className="text-white font-mono text-sm">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </p>
                </div>

                {!hasRole && (
                  <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-amber-400" />
                      <p className="text-amber-400 font-medium">
                        Rôle DELIVERER requis
                      </p>
                    </div>
                    <p className="text-sm text-amber-300">
                      Vous n'avez pas le rôle DELIVERER. Veuillez vous inscrire.
                    </p>
                  </div>
                )}

                {hasRole && !isStaked && (
                  <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="w-5 h-5 text-amber-400" />
                      <p className="text-amber-400 font-medium">Staking requis</p>
                    </div>
                    <p className="text-sm text-amber-300 mb-3">
                      Vous devez staker minimum 0.1 POL pour accepter des commandes.
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        onClose();
                        router.push("/profile");
                      }}
                    >
                      Aller au StakingPanel
                    </Button>
                  </div>
                )}

                {hasRole && isStaked && (
                  <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <p className="text-emerald-400 font-medium">Prêt à livrer</p>
                    </div>
                    <p className="text-sm text-emerald-300">
                      Staké : {stakedAmount.toFixed(2)} POL
                    </p>
                  </div>
                )}

                {deliverer && (
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-sm text-slate-400 mb-1">Profil</p>
                    <p className="text-white">{deliverer.name}</p>
                  </div>
                )}

                <Button
                  variant="secondary"
                  onClick={handleDisconnect}
                  className="w-full"
                >
                  Déconnexion
                </Button>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

