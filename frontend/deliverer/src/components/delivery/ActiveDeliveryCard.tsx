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
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import NavigationMap from "@/components/maps/NavigationMap";
import api from "@/services/api";
import blockchain from "@/services/blockchain";
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
  const watchIdRef = useRef<number | null>(null);

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

    watchIdRef.current = geolocation.watchPosition(async (pos) => {
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
          <Badge variant="info" pulse>Livraison en cours</Badge>
          <h2 className="text-xl font-bold text-white mt-2">
            Commande #{order.orderId.slice(0, 8)}
          </h2>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400">Gains estimés</p>
          <p className="text-2xl font-bold text-emerald-400">
            {(order.totalAmount * 0.2).toFixed(3)} POL
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
                  ? "bg-indigo-500 text-white"
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
    </Card>
  );
}

