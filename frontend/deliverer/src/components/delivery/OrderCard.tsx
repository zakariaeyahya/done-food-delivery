"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock, Wallet, ChevronRight, Eye, X, Package, User, FileText } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import geolocation from "@/services/geolocation";
import { formatPrice } from "@/utils/formatters";

interface OrderCardProps {
  order: any;
  currentLocation: { lat: number; lng: number } | null;
  onAccept: (orderId: string) => void;
  accepting: boolean;
}

export function OrderCard({ order, currentLocation, onAccept, accepting }: OrderCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Convertir totalAmount de wei à POL si nécessaire et calculer les gains
  const totalAmountFormatted = formatPrice(order.totalAmount, 'POL', 5);
  const totalAmountNumber = parseFloat(totalAmountFormatted.replace(' POL', ''));
  const earnings = totalAmountNumber * 0.2;
  
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

  // Extraire les items de la commande
  const orderItems = order.items || [];

  return (
    <>
      <Card className="group" glow>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white group-hover:text-orange-400 transition-colors">
              {order.restaurant?.name || 'Restaurant'}
            </h3>
            <p className="text-sm text-slate-400 mt-0.5">{order.restaurant?.address || 'Adresse non disponible'}</p>
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
          <div className="flex items-center gap-2 text-orange-400">
            <Wallet className="w-4 h-4" />
            <span className="text-sm font-medium">{earnings.toFixed(5)} POL</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div>
            <p className="text-xs text-slate-500">Total commande</p>
            <p className="text-white font-semibold">{totalAmountFormatted}</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowDetails(true)}
              variant="secondary"
              className="group/btn"
            >
              <Eye className="w-4 h-4" />
              Détails
            </Button>
            <Button
              onClick={() => onAccept(order.orderId)}
              loading={accepting}
              className="group/btn"
            >
              Accepter
              <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </Card>

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
                    <MapPin className="w-5 h-5 text-orange-400" />
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
                    <p className="text-sm text-slate-400 mt-1">📍 {order.deliveryAddress || 'Adresse non spécifiée'}</p>
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
                    <span className="text-white font-bold">{totalAmountFormatted}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300">Vos gains (20%)</span>
                    <span className="text-orange-400 font-bold">{earnings.toFixed(5)} POL</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Distance</span>
                    <span className="text-white">{distanceFormatted}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/10 flex gap-3">
                <Button
                  onClick={() => setShowDetails(false)}
                  variant="secondary"
                  className="flex-1"
                >
                  Fermer
                </Button>
                <Button
                  onClick={() => {
                    setShowDetails(false);
                    onAccept(order.orderId);
                  }}
                  loading={accepting}
                  className="flex-1"
                >
                  Accepter la commande
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

