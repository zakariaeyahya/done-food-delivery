"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/providers/AppProvider";
import { PageTransition } from "@/components/ui/PageTransition";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { OrdersList } from "@/components/delivery/OrdersList";
import { ActiveDeliveryCard } from "@/components/delivery/ActiveDeliveryCard";
import api from "@/services/api";
import blockchain from "@/services/blockchain";
import { Package, DollarSign, Star, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  const { address, connectWallet, setActiveDelivery, activeDelivery } = useApp();
  const [isOnline, setIsOnline] = useState(false);
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null); // null = unknown, true = registered, false = not registered
  const [checkingRegistration, setCheckingRegistration] = useState(true);
  const [stats, setStats] = useState({
    todayDeliveries: 0,
    todayEarnings: 0,
    rating: 0,
    stakedAmount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    name: "",
    phone: "",
    vehicleType: "bike",
  });

  useEffect(() => {
    if (address) {
      loadData();
    } else {
      setCheckingRegistration(false);
      setIsRegistered(null);
    }
  }, [address]);

  async function loadData() {
    setCheckingRegistration(true);
    try {
      const delivererData = await api.getDeliverer(address).catch((err: any) => {
        if (err.response?.status === 404) {
          setIsRegistered(false);
          setCheckingRegistration(false);
          return null;
        }
        return null;
      });

      if (!delivererData) {
        setIsRegistered(false);
        setCheckingRegistration(false);
        return;
      }

      setIsRegistered(true);
      setCheckingRegistration(false);

      const active = await api.getActiveDelivery(address).catch(() => null);
      setActiveDelivery(active);

      const earnings = await api.getEarnings(address, "today").catch(() => ({
        completedDeliveries: 0,
        totalEarnings: 0,
      }));

      const stakeInfo = await blockchain.getStakeInfo(address).catch((err: any) => {
        console.warn("Blockchain stake info not available:", err.message);
        return { amount: 0, isStaked: false };
      });

      setStats({
        todayDeliveries: earnings.completedDeliveries || 0,
        todayEarnings: earnings.totalEarnings || 0,
        rating: 0,
        stakedAmount: stakeInfo.amount || 0,
      });
    } catch (err) {
      console.error("Erreur chargement:", err);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    if (!registerForm.name || !registerForm.phone) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    setRegistering(true);
    try {
      await api.registerDeliverer({
        address: address,
        name: registerForm.name,
        phone: registerForm.phone,
        vehicleType: registerForm.vehicleType,
      });
      alert("Inscription réussie !");
      await loadData();
    } catch (err: any) {
      // Si déjà inscrit, recharger les données pour afficher le dashboard
      if (err.alreadyRegistered) {
        alert("Ce wallet est déjà inscrit. Redirection vers le tableau de bord...");
        await loadData();
        return;
      }

      const errorMsg =
        err.response?.data?.details ||
        err.response?.data?.message ||
        err.message;
      alert("Erreur lors de l'inscription: " + errorMsg);
    } finally {
      setRegistering(false);
    }
  }

  async function toggleStatus() {
    setLoading(true);
    try {
      await api.updateStatus(address!, !isOnline);
      setIsOnline(!isOnline);
    } catch (err: any) {
      alert("Erreur: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!address) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Bienvenue sur DONE Livreur 🚀
            </h2>
            <p className="text-slate-400 mb-6">Connectez votre wallet pour commencer</p>
            <Button onClick={connectWallet} size="lg">
              Connecter MetaMask
            </Button>
          </Card>
        </div>
      </PageTransition>
    );
  }

  // Show loading while checking registration status
  if (checkingRegistration) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Vérification en cours...
            </h2>
            <p className="text-slate-400 mb-6">Vérification de votre statut d'inscription</p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          </Card>
        </div>
      </PageTransition>
    );
  }

  if (isRegistered === false) {
    return (
      <PageTransition>
        <Card className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-white mb-2">Inscription Livreur</h2>
          <p className="text-slate-400 mb-6">Complétez votre profil pour commencer</p>
          <p className="text-sm text-slate-500 mb-4">
            <strong>Adresse:</strong> {address}
          </p>

          <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="text"
              placeholder="Nom complet"
              value={registerForm.name}
              onChange={(e) =>
                setRegisterForm({ ...registerForm, name: e.target.value })
              }
              required
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />

            <input
              type="tel"
              placeholder="Téléphone (ex: +33612345678)"
              value={registerForm.phone}
              onChange={(e) =>
                setRegisterForm({ ...registerForm, phone: e.target.value })
              }
              required
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />

            <select
              value={registerForm.vehicleType}
              onChange={(e) =>
                setRegisterForm({ ...registerForm, vehicleType: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="bike">Vélo</option>
              <option value="scooter">Scooter</option>
              <option value="car">Voiture</option>
            </select>

            <Button type="submit" disabled={registering} className="w-full" size="lg">
              {registering ? "Inscription..." : "S'inscrire"}
            </Button>
          </form>
        </Card>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Tableau de bord</h1>
          <div className="flex items-center gap-3">
            <Badge variant={isOnline ? "success" : "danger"} pulse={isOnline}>
              {isOnline ? "🟢 En ligne" : "🔴 Hors ligne"}
            </Badge>
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleStatus}
              disabled={loading}
            >
              {isOnline ? "Passer hors ligne" : "Passer en ligne"}
            </Button>
          </div>
        </div>

        {activeDelivery ? (
          <ActiveDeliveryCard order={activeDelivery} />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="text-center">
                  <Package className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                  <h3 className="text-sm text-slate-400 mb-1">Livraisons</h3>
                  <p className="text-3xl font-bold text-white">{stats.todayDeliveries}</p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="text-center">
                  <DollarSign className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <h3 className="text-sm text-slate-400 mb-1">Gains</h3>
                  <p className="text-3xl font-bold text-white">
                    {stats.todayEarnings.toFixed(2)} POL
                  </p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="text-center">
                  <Star className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <h3 className="text-sm text-slate-400 mb-1">Rating</h3>
                  <p className="text-3xl font-bold text-white">
                    {stats.rating.toFixed(1)}/5
                  </p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="text-center">
                  <Lock className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <h3 className="text-sm text-slate-400 mb-1">Staké</h3>
                  <p className="text-3xl font-bold text-white">
                    {stats.stakedAmount.toFixed(2)} POL
                  </p>
                </Card>
              </motion.div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Commandes disponibles</h2>
              {isOnline ? (
                <OrdersList limit={6} />
              ) : (
                <Card className="text-center py-12">
                  <p className="text-slate-400">Passez en ligne pour voir les commandes</p>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </PageTransition>
  );
}

