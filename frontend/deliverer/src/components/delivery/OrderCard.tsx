"use client";

import { motion } from "framer-motion";
import { MapPin, Clock, Wallet, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import geolocation from "@/services/geolocation";

interface OrderCardProps {
  order: any;
  currentLocation: { lat: number; lng: number } | null;
  onAccept: (orderId: string) => void;
  accepting: boolean;
}

export function OrderCard({ order, currentLocation, onAccept, accepting }: OrderCardProps) {
  const earnings = order.totalAmount * 0.2;
  
  // Calculer la distance si GPS disponible
  let distanceMeters: number | null = null;
  let distanceFormatted: string = "N/A";
  let distanceKm: number = 0;
  let badge: { variant: "success" | "warning" | "danger"; label: string } = { variant: "warning", label: "GPS requis" };

  if (currentLocation && order.restaurant?.location) {
    distanceMeters = geolocation.getDistance(
      currentLocation,
      order.restaurant.location
    );
    distanceFormatted = geolocation.formatDistance(distanceMeters);
    distanceKm = distanceMeters / 1000;

    const getDistanceBadge = () => {
      if (distanceKm < 2) return { variant: "success" as const, label: "Proche" };
      if (distanceKm < 5) return { variant: "warning" as const, label: "Moyen" };
      return { variant: "danger" as const, label: "Loin" };
    };

    badge = getDistanceBadge();
  }

  return (
    <Card className="group" glow>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white group-hover:text-orange-400 transition-colors">
            {order.restaurant.name}
          </h3>
          <p className="text-sm text-slate-400 mt-0.5">{order.restaurant.address}</p>
        </div>
        <Badge variant={badge.variant} pulse>
          {badge.label}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="flex items-center gap-2 text-slate-300">
          <MapPin className="w-4 h-4 text-slate-500" />
          <span className="text-sm">{distanceFormatted}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <Clock className="w-4 h-4 text-slate-500" />
          <span className="text-sm">
            {distanceKm > 0 ? `~${Math.ceil(distanceKm * 3)} min` : "N/A"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-emerald-400">
          <Wallet className="w-4 h-4" />
          <span className="text-sm font-medium">{earnings.toFixed(3)} POL</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div>
          <p className="text-xs text-slate-500">Total commande</p>
          <p className="text-white font-semibold">{order.totalAmount} POL</p>
        </div>
        <Button
          onClick={() => onAccept(order.orderId)}
          loading={accepting}
          className="group/btn"
        >
          Accepter
          <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      </div>
    </Card>
  );
}

