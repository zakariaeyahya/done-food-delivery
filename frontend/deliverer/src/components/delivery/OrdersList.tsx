"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { OrderCard } from "./OrderCard";
import { CardSkeleton } from "@/components/ui/Skeleton";
import api from "@/services/api";
import geolocation from "@/services/geolocation";
import blockchain from "@/services/blockchain";
import io from "socket.io-client";
import { useRouter } from "next/navigation";
import { useApp } from "@/providers/AppProvider";

interface OrdersListProps {
  limit?: number;
}

export function OrdersList({ limit }: OrdersListProps) {
  const { currentLocation } = useApp();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState<string | null>(null);
  const socketRef = useRef<any>(null);

  const SOCKET_URL =
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    process.env.VITE_SOCKET_URL ||
    "http://localhost:3000";

  useEffect(() => {
    fetchAvailableOrders();

    const interval = setInterval(fetchAvailableOrders, 10000);

    let orderSocketWarning = false;
    let isOrderSocketCleaningUp = false;

    if (!socketRef.current) {
      try {
        socketRef.current = io(SOCKET_URL, {
          transports: ["websocket"],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 3,
          timeout: 5000,
          autoConnect: false,
        });

        socketRef.current.on("connect", () => {
        });

        socketRef.current.on("orderReady", (order: any) => {
          setOrders((prev) => {
            const exists = prev.find((o: any) => o.orderId === order.orderId);
            if (exists) {
              return prev;
            }
            return [order, ...prev];
          });
        });

        socketRef.current.on("orderAccepted", ({ orderId }: { orderId: string }) => {
          setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
        });

        socketRef.current.on("connect_error", (error: any) => {
          if (!orderSocketWarning && !isOrderSocketCleaningUp) {
            orderSocketWarning = true;
          }
        });

        socketRef.current.connect();
      } catch (err) {
      }
    }

    return () => {
      isOrderSocketCleaningUp = true;
      clearInterval(interval);
      if (socketRef.current) {
        try {
          socketRef.current.removeAllListeners();
          if (socketRef.current.connected) {
            socketRef.current.disconnect();
          }
        } catch (err) {
        }
        socketRef.current = null;
      }
    };
  }, [SOCKET_URL]); // Ne plus dépendre de currentLocation car on charge même sans GPS

  async function fetchAvailableOrders() {
    setLoading(true);

    try {
      const locationParams = currentLocation
        ? { lat: currentLocation.lat, lng: currentLocation.lng }
        : {};

      const availableOrders = await api.getAvailableOrders(locationParams);
      

      let sortedOrders = availableOrders;
      if (availableOrders.length > 0) {
        sortedOrders = availableOrders.sort((a: any, b: any) => {
          const statusPriority = (status: string) => {
            if (status === 'READY') return 0;
            if (status === 'PREPARING') return 1;
            return 2;
          };
          const priorityDiff = statusPriority(a.status) - statusPriority(b.status);
          if (priorityDiff !== 0) return priorityDiff;

          if (currentLocation && a.restaurant?.location && b.restaurant?.location) {
            const dA = geolocation.getDistance(currentLocation, a.restaurant.location);
            const dB = geolocation.getDistance(currentLocation, b.restaurant.location);
            return dA - dB;
          }
          
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
      }

      if (limit) {
        setOrders(sortedOrders.slice(0, limit));
      } else {
        setOrders(sortedOrders);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  async function handleAcceptOrder(orderId: string) {
    try {
      const signer = await blockchain.getSigner();
      const address = await signer.getAddress();

      let isStaked = false;
      try {
        isStaked = await blockchain.isStaked(address);
      } catch (stakeError: any) {
        if (process.env.NODE_ENV === "development") {
          try {
            const delivererData = await api.getDeliverer(address);
            isStaked = delivererData.deliverer?.isStaked || false;
          } catch (dbError) {
            isStaked = true; // En dev, permettre de continuer
          }
        } else {
          throw stakeError;
        }
      }
      
      if (!isStaked) {
        alert("Vous devez staker minimum 0.1 POL pour accepter une commande.");
        return;
      }

      setAccepting(orderId);

      try {
        const blockchainResult = await blockchain.acceptOrderOnChain(orderId);
      } catch (blockchainError: any) {
        if (process.env.NODE_ENV === "development") {
        } else {
          throw blockchainError;
        }
      }

      await api.acceptOrder(orderId, address);

      setOrders((prev) => {
        const filtered = prev.filter((o: any) => o.orderId !== orderId);
        return filtered;
      });

      router.push(`/deliveries?orderId=${orderId}`);
    } catch (err: any) {
      alert("Erreur: " + err.message);
    } finally {
      setAccepting(null);
    }
  }

  if (loading && orders.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: limit || 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!loading && orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Aucune commande disponible</p>
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      initial="initial"
      animate="animate"
      variants={{
        animate: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
    >
      {orders.map((order) => (
        <motion.div
          key={order.orderId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <OrderCard
            order={order}
            currentLocation={currentLocation}
            onAccept={handleAcceptOrder}
            accepting={accepting === order.orderId}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

