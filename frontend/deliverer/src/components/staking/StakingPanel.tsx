"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Lock, Unlock, AlertCircle } from "lucide-react";
import blockchain from "@/services/blockchain";
import api from "@/services/api";
import { motion } from "framer-motion";

interface StakingPanelProps {
  address: string;
}

export function StakingPanel({ address }: StakingPanelProps) {
  const [stakedAmount, setStakedAmount] = useState(0);
  const [isStaked, setIsStaked] = useState(false);
  const [stakeInput, setStakeInput] = useState("0.1");
  const [hasActiveDelivery, setHasActiveDelivery] = useState(false);
  const [slashingHistory, setSlashingHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (address) {
      fetchStakingInfo();
      fetchSlashingHistory();
      checkActiveDelivery();
    }
  }, [address]);

  async function fetchStakingInfo() {
    try {
      const stakeInfo = await blockchain.getStakeInfo(address);
      setStakedAmount(stakeInfo.amount);
      setIsStaked(stakeInfo.isStaked);
    } catch (err) {
      console.error("Erreur récupération stake info :", err);
    }
  }

  async function fetchSlashingHistory() {
    try {
      const events = await blockchain.getSlashingEvents(address);
      setSlashingHistory(events);
    } catch (err) {
      console.error("Erreur récupération slashing history :", err);
    }
  }

  async function checkActiveDelivery() {
    try {
      const active = await api.getActiveDelivery(address);
      setHasActiveDelivery(!!active);
    } catch (err) {
      console.error("Erreur récupération livraison active :", err);
    }
  }

  async function handleStake() {
    if (!address) {
      setError("Adresse wallet requise.");
      return;
    }

    const amount = parseFloat(stakeInput);

    if (amount < 0.1) {
      setError("Montant minimum : 0.1 MATIC");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { txHash } = await blockchain.stake(stakeInput);
      console.log("Transaction staking :", txHash);

      await new Promise((resolve) => setTimeout(resolve, 3000));

      await fetchStakingInfo();
      alert("Staking réussi !");
    } catch (err: any) {
      setError(`Erreur staking : ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleUnstake() {
    if (hasActiveDelivery) {
      setError("Impossible de retirer le staking pendant une livraison active.");
      return;
    }

    if (!confirm("Êtes-vous sûr de vouloir retirer votre staking ?")) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { txHash, amount } = await blockchain.unstake();
      console.log("Transaction unstaking :", txHash);

      await new Promise((resolve) => setTimeout(resolve, 3000));

      await fetchStakingInfo();
      alert(`Unstaking réussi ! ${amount} MATIC retirés.`);
    } catch (err: any) {
      setError(`Erreur unstaking : ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  const totalSlashed = slashingHistory.reduce((sum, e) => sum + e.amount, 0);

  return (
    <Card>
      <h2 className="text-2xl font-bold text-white mb-6">Gestion du Staking</h2>

      <div className="mb-6">
        {isStaked ? (
          <Badge variant="success" className="text-base px-4 py-2">
            <Lock className="w-4 h-4 mr-2" />
            Staké : {stakedAmount.toFixed(2)} MATIC
          </Badge>
        ) : (
          <Badge variant="danger" className="text-base px-4 py-2">
            <Unlock className="w-4 h-4 mr-2" />
            Non staké
          </Badge>
        )}
      </div>

      {!isStaked && (
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Montant à staker (minimum 0.1 MATIC)
            </label>
            <input
              type="number"
              value={stakeInput}
              onChange={(e) => setStakeInput(e.target.value)}
              min="0.1"
              step="0.1"
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <Button
            onClick={handleStake}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? "En cours..." : "Stake 0.1 MATIC"}
          </Button>
        </div>
      )}

      {isStaked && (
        <Button
          onClick={handleUnstake}
          disabled={loading || hasActiveDelivery}
          variant="danger"
          className="w-full mb-6"
          size="lg"
        >
          {hasActiveDelivery
            ? "Livraison active"
            : loading
              ? "En cours..."
              : "Unstake"}
        </Button>
      )}

      {slashingHistory.length > 0 && (
        <div className="mt-6 pt-6 border-t border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Historique Slashing</h3>
            {totalSlashed > 0.5 && (
              <Badge variant="warning" pulse>
                <AlertCircle className="w-4 h-4 mr-1" />
                Attention
              </Badge>
            )}
          </div>

          <p className="text-sm text-slate-400 mb-4">
            Total slashé : <span className="text-red-400 font-medium">{totalSlashed.toFixed(3)} MATIC</span>
          </p>

          <div className="space-y-2">
            {slashingHistory.map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-3 rounded-lg bg-red-500/10 border border-red-500/20"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white font-medium">{event.reason}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(event.timestamp * 1000).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-sm text-red-400 font-medium">
                    -{event.amount} MATIC
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}
    </Card>
  );
}

