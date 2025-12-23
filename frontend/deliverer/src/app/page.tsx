"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/providers/AppProvider";

export const dynamic = 'force-dynamic';
import { PageTransition } from "@/components/ui/PageTransition";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { OrdersList } from "@/components/delivery/OrdersList";
import { ActiveDeliveryCard } from "@/components/delivery/ActiveDeliveryCard";
import api from "@/services/api";
import blockchain from "@/services/blockchain";
import { Package, DollarSign, Star, Lock, AlertTriangle, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isStaked, setIsStaked] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    name: "",
    phone: "",
    vehicleType: "bike",
  });
  const [isMounted, setIsMounted] = useState(false);
  const [allActiveDeliveries, setAllActiveDeliveries] = useState<any[]>([]);
  const [managingOrder, setManagingOrder] = useState<number | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

      const isAvailable = delivererData.deliverer?.isAvailable || false;
      const isStaked = delivererData.deliverer?.isStaked || false;
      
      if (!isStaked) {
      } else if (!isAvailable) {
      } else {
      }

      if (isStaked && !isAvailable) {
        try {
          await api.updateStatus(address, true);
          setIsOnline(true);
        } catch (statusError) {
        }
      } else if (isAvailable) {
        setIsOnline(true);
      }

      const activeData = await api.getAllActiveDeliveries(address).catch(() => ({
        activeDelivery: null,
        allActiveDeliveries: [],
        count: 0
      }));
      
      setAllActiveDeliveries(activeData.allActiveDeliveries || []);
      
      setActiveDelivery(activeData.activeDelivery);
      
      if (activeData.count > 1) {
      }

      const earningsResponse = await api.getEarnings(address, "today").catch(() => ({
        earnings: { completedDeliveries: 0, totalEarnings: 0 }
      }));
      const earnings = earningsResponse.earnings || { completedDeliveries: 0, totalEarnings: 0 };

      const stakeInfo = await blockchain.getStakeInfo(address).catch((err: any) => {
        if (!err.message?.includes('RPC endpoint') && !err.message?.includes('too many errors')) {
        }
        return { amount: 0, isStaked: false };
      });

      const stakedAmount = stakeInfo.amount || 0;
      const staked = stakedAmount > 0 || delivererData.deliverer?.isStaked || false;
      setIsStaked(staked);

      setStats({
        todayDeliveries: earnings.completedDeliveries || 0,
        todayEarnings: earnings.totalEarnings || 0,
        rating: 0,
        stakedAmount: stakedAmount,
      });
    } catch (err) {
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

  async function handleCancelDelivery(orderId: number) {
    if (!address) return;
    if (!confirm(`Annuler la livraison #${orderId} ? Elle sera remise à disposition pour un autre livreur.`)) return;
    
    setManagingOrder(orderId);
    try {
      await api.cancelDelivery(orderId, address);
      alert(`Livraison #${orderId} annulée avec succès !`);
      await loadData();
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    } finally {
      setManagingOrder(null);
    }
  }

  async function handleForceComplete(orderId: number) {
    if (!address) return;
    if (!confirm(`Marquer la livraison #${orderId} comme terminée ?`)) return;
    
    setManagingOrder(orderId);
    try {
      await api.forceCompleteDelivery(orderId, address);
      alert(`Livraison #${orderId} terminée avec succès !`);
      await loadData();
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    } finally {
      setManagingOrder(null);
    }
  }

  async function toggleStatus() {
    setLoading(true);
    try {
      const newStatus = !isOnline;
      
      if (newStatus && !isStaked) {
        const confirmMessage = " Vous n'êtes pas staké sur la blockchain.\n\n" +
          "Pour recevoir des commandes, vous devez staker minimum 0.1 POL.\n\n" +
          "Voulez-vous quand même passer en ligne ? (Vous ne recevrez pas de commandes tant que vous n'êtes pas staké)";
        
        if (!window.confirm(confirmMessage)) {
          setLoading(false);
          return;
        }
      }
      
      await api.updateStatus(address!, newStatus);
      setIsOnline(newStatus);
      
      if (newStatus) {
        await loadData();
      }
    } catch (err: any) {
      alert("Erreur: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!isMounted) {
    return null;
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
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
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />

            <input
              type="tel"
              placeholder="Téléphone (ex: +33612345678)"
              value={registerForm.phone}
              onChange={(e) =>
                setRegisterForm({ ...registerForm, phone: e.target.value })
              }
              required
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />

            <select
              value={registerForm.vehicleType}
              onChange={(e) =>
                setRegisterForm({ ...registerForm, vehicleType: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-orange-500"
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

        {!isStaked && (
          <Card className="bg-amber-500/10 border-amber-500/50">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-amber-400 font-semibold mb-1">
                   Vous n'êtes pas staké
                </h3>
                <p className="text-amber-300/80 text-sm">
                  Pour recevoir des commandes, vous devez staker minimum <strong>0.1 POL</strong> sur la blockchain.
                  {!isOnline && " Une fois staké, passez en ligne pour recevoir des commandes."}
                </p>
              </div>
            </div>
          </Card>
        )}

        {isStaked && !isOnline && (
          <Card className="bg-orange-500/10 border-orange-500/50">
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-orange-400 font-semibold mb-1">
                  💡 Passez en ligne
                </h3>
                <p className="text-orange-300/80 text-sm">
                  Vous êtes staké et prêt à recevoir des commandes. Cliquez sur "Passer en ligne" pour commencer.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Panneau des livraisons actives multiples */}
        {allActiveDeliveries.length > 0 && (
          <Card className="bg-amber-500/10 border-amber-500/50">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-amber-400 font-semibold mb-1">
                  📦 Vos livraisons en cours ({allActiveDeliveries.length})
                </h3>
                <p className="text-amber-300/80 text-sm">
                  Gérez vos livraisons actives ci-dessous
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              {allActiveDeliveries.map((order: any) => (
                <div 
                  key={order.orderId}
                  className="bg-slate-800/50 rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-semibold">Commande #{order.orderId}</span>
                      <Badge variant="info">IN_DELIVERY</Badge>
                    </div>
                    <p className="text-sm text-slate-400">
                      {order.restaurant?.name || 'Restaurant'} → {order.deliveryAddress || 'Client'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Créée le {new Date(order.createdAt).toLocaleDateString('fr-FR', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleForceComplete(order.orderId)}
                      loading={managingOrder === order.orderId}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4" />
                      Terminer
                    </Button>
                    <Button
                      onClick={() => handleCancelDelivery(order.orderId)}
                      loading={managingOrder === order.orderId}
                      size="sm"
                      variant="secondary"
                      className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                    >
                      <X className="w-4 h-4" />
                      Annuler
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

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
                  <Package className="w-8 h-8 text-orange-400 mx-auto mb-2" />
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
                  <DollarSign className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                  <h3 className="text-sm text-slate-400 mb-1">Gains</h3>
                  <p className="text-3xl font-bold text-white">
                    {stats.todayEarnings.toFixed(5)} POL
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
                  <Lock className="w-8 h-8 text-pink-400 mx-auto mb-2" />
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

