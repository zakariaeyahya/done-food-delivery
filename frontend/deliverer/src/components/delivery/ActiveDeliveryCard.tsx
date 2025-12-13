"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Navigation,
  Phone,
  CheckCircle2,
  MapPin,
  Clock,
  Store,
  User,
  ArrowRight,
  Eye,
  X,
  Package,
  FileText,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import NavigationMap from "@/components/maps/NavigationMap";
import api from "@/services/api";
import blockchain from "@/services/blockchain";
import { formatPrice } from "@/utils/formatters";
import geolocation from "@/services/geolocation";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface ActiveDeliveryCardProps {
  order: any;
}

export function ActiveDeliveryCard({ order }: ActiveDeliveryCardProps) {
  const router = useRouter();
  const [step, setStep] = useState<"pickup" | "delivery">("pickup");
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isNearTarget, setIsNearTarget] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  // Extraire les items de la commande
  const orderItems = order?.items || [];

  useEffect(() => {
    loadCurrentLocation();

    if (order && order.status === "IN_DELIVERY") {
      startGPSTracking();
      setStep("delivery");
    }

    return () => stopGPSTracking();
  }, [order]);

  useEffect(() => {
    if (!currentLocation || !order) return;

    const interval = setInterval(() => {
      checkProximity();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentLocation, order, step]);

  async function loadCurrentLocation() {
    try {
      const position = await geolocation.getCurrentPosition();
      setCurrentLocation(position);
    } catch (error) {
      console.error("Erreur GPS :", error);
    }
  }

  function checkProximity() {
    if (!currentLocation || !order) return;

    if (step === "pickup") {
      const nearRestaurant = geolocation.isNearLocation(
        currentLocation,
        order.restaurant.location,
        100
      );
      setIsNearTarget(nearRestaurant);
    }

    if (step === "delivery") {
      const nearClient = geolocation.isNearLocation(
        currentLocation,
        order.deliveryAddress,
        100
      );
      setIsNearTarget(nearClient);
    }
  }

  function startGPSTracking() {
    if (tracking) return;

    setTracking(true);

    watchIdRef.current = geolocation.watchPosition(async (pos: { lat: number; lng: number; accuracy?: number; timestamp?: number }) => {
      setCurrentLocation(pos);

      if (order) {
        api.updateGPSLocation(order.orderId, {
          lat: pos.lat,
          lng: pos.lng,
        });
      }
    });
  }

  function stopGPSTracking() {
    setTracking(false);

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }

  async function handleConfirmPickup() {
    if (!isNearTarget) {
      alert("Vous devez être à moins de 100m du restaurant.");
      return;
    }

    setLoading(true);
    try {
      const signer = await blockchain.getSigner();
      const address = await signer.getAddress();

      await blockchain.confirmPickupOnChain(order.orderId);
      await api.confirmPickup(order.orderId, address);

      setStep("delivery");
      startGPSTracking();

      alert("Pickup confirmé. GPS activé.");
    } catch (error: any) {
      alert(`Erreur : ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmDelivery() {
    if (!isNearTarget) {
      alert("Vous devez être à moins de 100m du client.");
      return;
    }

    setLoading(true);
    try {
      const signer = await blockchain.getSigner();
      const address = await signer.getAddress();

      const { earnings } = await blockchain.confirmDeliveryOnChain(order.orderId);
      await api.confirmDelivery(order.orderId, address);

      stopGPSTracking();

      alert(`Livraison confirmée ! Vous gagnez ${earnings} POL`);
      router.push("/");
    } catch (error: any) {
      alert(`Erreur : ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  const steps = [
    { id: "pickup" as const, label: "Récupération", icon: Store },
    { id: "delivery" as const, label: "Livraison", icon: User },
  ];

  return (
    <Card className="overflow-hidden" glow>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="info" pulse>Livraison en cours</Badge>
            <Button
              onClick={() => setShowDetails(true)}
              variant="secondary"
              size="sm"
            >
              <Eye className="w-4 h-4" />
              Détails
            </Button>
          </div>
          <h2 className="text-xl font-bold text-white mt-2">
            Commande #{String(order.orderId).slice(0, 8)}
          </h2>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400">Gains estimés</p>
          <p className="text-2xl font-bold text-orange-400">
            {(() => {
              const totalAmountNumber = parseFloat(formatPrice(order.totalAmount, 'POL', 5).replace(' POL', ''));
              return formatPrice((totalAmountNumber * 0.2).toString(), 'POL', 5);
            })()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1">
            <motion.div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-xl",
                step === s.id
                  ? "bg-orange-500 text-white"
                  : s.id === "pickup" && step === "delivery"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-white/5 text-slate-500"
              )}
              animate={step === s.id ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              {s.id === "pickup" && step === "delivery" ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <s.icon className="w-5 h-5" />
              )}
            </motion.div>
            <span
              className={cn(
                "ml-2 text-sm font-medium",
                step === s.id ? "text-white" : "text-slate-500"
              )}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <ArrowRight className="w-4 h-4 text-slate-600 mx-4" />
            )}
          </div>
        ))}
      </div>

      <div className="rounded-xl overflow-hidden mb-6 border border-white/5">
        <NavigationMap
          origin={currentLocation}
          destination={
            step === "pickup" ? order.restaurant.location : order.deliveryAddress
          }
          step={step}
          onArrival={() => setIsNearTarget(true)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Store className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">Restaurant</span>
          </div>
          <p className="text-white font-medium">{order.restaurant.name}</p>
          <p className="text-sm text-slate-400 mt-1">{order.restaurant.address}</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-3"
            onClick={() => window.open(`tel:${order.restaurant.phone}`)}
          >
            <Phone className="w-4 h-4 mr-1" /> Appeler
          </Button>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <User className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">Client</span>
          </div>
          <p className="text-white font-medium">{order.client.name}</p>
          <p className="text-sm text-slate-400 mt-1">{order.deliveryAddress.address}</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-3"
            onClick={() => window.open(`tel:${order.client.phone}`)}
          >
            <Phone className="w-4 h-4 mr-1" /> Appeler
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isNearTarget && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Button
              className="w-full"
              size="lg"
              loading={loading}
              onClick={step === "pickup" ? handleConfirmPickup : handleConfirmDelivery}
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              {step === "pickup" ? "Confirmer récupération" : "Confirmer livraison"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {tracking && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          GPS actif
        </div>
      )}

      {/* Modal Détails de la commande */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 rounded-2xl border border-white/10 max-w-lg w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Détails de la commande</h2>
                  <p className="text-sm text-slate-400 mt-1">#{order.orderId}</p>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {/* Restaurant Info */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Store className="w-5 h-5 text-orange-400" />
                    <h3 className="text-lg font-semibold text-white">Restaurant</h3>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <p className="text-white font-medium">{order.restaurant?.name || 'Restaurant'}</p>
                    <p className="text-sm text-slate-400 mt-1">{order.restaurant?.address || 'Adresse non disponible'}</p>
                    {order.restaurant?.phone && (
                      <p className="text-sm text-slate-400 mt-1">📞 {order.restaurant.phone}</p>
                    )}
                  </div>
                </div>

                {/* Client/Delivery Info */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-5 h-5 text-orange-400" />
                    <h3 className="text-lg font-semibold text-white">Livraison</h3>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <p className="text-white font-medium">{order.client?.name || 'Client'}</p>
                    <p className="text-sm text-slate-400 mt-1">📍 {order.deliveryAddress?.address || order.deliveryAddress || 'Adresse non spécifiée'}</p>
                    {order.client?.phone && (
                      <p className="text-sm text-slate-400 mt-1">📞 {order.client.phone}</p>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-5 h-5 text-orange-400" />
                    <h3 className="text-lg font-semibold text-white">Articles ({orderItems.length})</h3>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
                    {orderItems.length > 0 ? (
                      orderItems.map((item: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="bg-orange-500/20 text-orange-400 text-sm font-medium px-2 py-1 rounded">
                              x{item.quantity || 1}
                            </span>
                            <span className="text-white">{item.name || item.menuItem?.name || 'Article'}</span>
                          </div>
                          <span className="text-slate-400 text-sm">
                            {formatPrice(item.price || item.menuItem?.price || 0, 'POL', 5)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-sm">Détails des articles non disponibles</p>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {order.notes && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="w-5 h-5 text-orange-400" />
                      <h3 className="text-lg font-semibold text-white">Notes</h3>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-4">
                      <p className="text-slate-300 text-sm">{order.notes}</p>
                    </div>
                  </div>
                )}

                {/* Summary */}
                <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300">Total commande</span>
                    <span className="text-white font-bold">{formatPrice(order.totalAmount, 'POL', 5)}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300">Vos gains (20%)</span>
                    <span className="text-orange-400 font-bold">
                      {(() => {
                        const totalAmountNumber = parseFloat(formatPrice(order.totalAmount, 'POL', 5).replace(' POL', ''));
                        return formatPrice((totalAmountNumber * 0.2).toString(), 'POL', 5);
                      })()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Statut</span>
                    <Badge variant={step === "pickup" ? "warning" : "info"}>
                      {step === "pickup" ? "En récupération" : "En livraison"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/10">
                <Button
                  onClick={() => setShowDetails(false)}
                  variant="secondary"
                  className="w-full"
                >
                  Fermer
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

