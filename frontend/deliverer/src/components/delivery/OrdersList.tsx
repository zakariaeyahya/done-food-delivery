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
    // Charger les commandes même sans position GPS (on peut toujours les afficher)
    fetchAvailableOrders();

    const interval = setInterval(fetchAvailableOrders, 10000);

    // Socket setup
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
          console.log("[Livreur] ✅ Socket.io connecté - Notifications de commandes activées");
        });

        socketRef.current.on("orderReady", (order: any) => {
          console.log("[Livreur] 🔔 Nouvelle commande reçue via Socket.io:", {
            orderId: order.orderId,
            restaurant: order.restaurant?.name || 'Restaurant',
            totalAmount: order.totalAmount,
            deliveryAddress: order.deliveryAddress
          });
          setOrders((prev) => {
            const exists = prev.find((o: any) => o.orderId === order.orderId);
            if (exists) {
              console.log(`[Livreur] ⚠️ Commande #${order.orderId} déjà dans la liste, ignorée`);
              return prev;
            }
            console.log(`[Livreur] ✅ Commande #${order.orderId} ajoutée à la liste (total: ${prev.length + 1})`);
            return [order, ...prev];
          });
        });

        socketRef.current.on("orderAccepted", ({ orderId }: { orderId: string }) => {
          setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
        });

        socketRef.current.on("connect_error", (error: any) => {
          if (!orderSocketWarning && !isOrderSocketCleaningUp) {
            console.warn("[Livreur] ⚠️ Erreur connexion Socket.io - Notifications temps réel indisponibles. Actualisation toutes les 10s.");
            orderSocketWarning = true;
          }
        });

        socketRef.current.connect();
      } catch (err) {
        console.warn("Failed to initialize order socket");
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
          // Silently ignore cleanup errors
        }
        socketRef.current = null;
      }
    };
  }, [SOCKET_URL]); // Ne plus dépendre de currentLocation car on charge même sans GPS

  async function fetchAvailableOrders() {
    setLoading(true);

    try {
      // Essayer de récupérer les commandes même sans position GPS
      const locationParams = currentLocation 
        ? { lat: currentLocation.lat, lng: currentLocation.lng }
        : {};
      
      if (currentLocation) {
        console.log(`[Livreur] 📡 Récupération commandes disponibles depuis API (lat: ${currentLocation.lat}, lng: ${currentLocation.lng})...`);
      } else {
        console.log(`[Livreur] 📡 Récupération commandes disponibles depuis API (sans position GPS)...`);
      }
      
      const availableOrders = await api.getAvailableOrders(locationParams);
      console.log(`[Livreur] ✅ ${availableOrders.length} commande(s) disponible(s) reçue(s) de l'API`);
      
      if (availableOrders.length > 0) {
        console.log(`[Livreur]   - Détails:`, availableOrders.map((o: any) => ({
          orderId: o.orderId,
          restaurant: o.restaurant?.name || 'Restaurant',
          status: o.status,
          totalAmount: o.totalAmount
        })));
      } else {
        console.warn(`[Livreur] ⚠️ Aucune commande disponible. Vérifiez dans les logs backend pourquoi.`);
      }

      // Trier : READY en priorité, puis par distance ou date
      let sortedOrders = availableOrders;
      if (availableOrders.length > 0) {
        sortedOrders = availableOrders.sort((a: any, b: any) => {
          // Priorité 1: Statut READY en premier (prêtes à récupérer)
          const statusPriority = (status: string) => {
            if (status === 'READY') return 0;
            if (status === 'PREPARING') return 1;
            return 2;
          };
          const priorityDiff = statusPriority(a.status) - statusPriority(b.status);
          if (priorityDiff !== 0) return priorityDiff;

          // Priorité 2: Par distance si GPS disponible
          if (currentLocation && a.restaurant?.location && b.restaurant?.location) {
            const dA = geolocation.getDistance(currentLocation, a.restaurant.location);
            const dB = geolocation.getDistance(currentLocation, b.restaurant.location);
            return dA - dB;
          }
          
          // Fallback: trier par date de création (plus récentes en premier)
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
      }

      if (limit) {
        setOrders(sortedOrders.slice(0, limit));
        console.log(`[Livreur] 📋 Affichage des ${Math.min(limit, sortedOrders.length)} premières commandes`);
      } else {
        setOrders(sortedOrders);
        console.log(`[Livreur] 📋 ${sortedOrders.length} commande(s) affichée(s)`);
      }
    } catch (error) {
      console.error("[Livreur] ❌ Erreur chargement commandes :", error);
      console.error("[Livreur]   - Détails:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAcceptOrder(orderId: string) {
    try {
      console.log(`[Livreur] 🚚 Acceptation commande #${orderId}...`);
      const signer = await blockchain.getSigner();
      const address = await signer.getAddress();
      console.log(`[Livreur] 👤 Adresse livreur: ${address}`);

      // Vérifier le statut de staking (avec gestion d'erreur pour mode dev)
      let isStaked = false;
      try {
        isStaked = await blockchain.isStaked(address);
        console.log(`[Livreur] ✅ Vérification blockchain: ${isStaked ? 'staké' : 'non staké'}`);
      } catch (stakeError: any) {
        // En mode dev, si la blockchain n'est pas accessible, vérifier depuis la DB
        if (process.env.NODE_ENV === "development") {
          console.warn(`[Livreur] ⚠️ Erreur vérification blockchain, vérification depuis DB...`);
          try {
            const delivererData = await api.getDeliverer(address);
            isStaked = delivererData.deliverer?.isStaked || false;
            console.log(`[Livreur] 📊 Statut depuis DB: ${isStaked ? 'staké' : 'non staké'}`);
          } catch (dbError) {
            console.warn(`[Livreur] ⚠️ Impossible de vérifier depuis DB, continuation en mode dev...`);
            isStaked = true; // En dev, permettre de continuer
          }
        } else {
          // En production, bloquer si la vérification échoue
          throw stakeError;
        }
      }
      
      if (!isStaked) {
        console.log(`[Livreur] ❌ Livreur non staké, impossible d'accepter la commande`);
        alert("Vous devez staker minimum 0.1 POL pour accepter une commande.");
        return;
      }
      console.log(`[Livreur] ✅ Livreur staké, continuation...`);

      setAccepting(orderId);

      // On-chain (optionnel en mode dev)
      try {
        console.log(`[Livreur] ⛓️ Acceptation on-chain commande #${orderId}...`);
        const blockchainResult = await blockchain.acceptOrderOnChain(orderId);
        console.log(`[Livreur] ✅ Acceptation on-chain réussie pour commande #${orderId}`, blockchainResult.txHash ? `(tx: ${blockchainResult.txHash})` : '(mode dev)');
      } catch (blockchainError: any) {
        // En mode dev, continuer même si la blockchain échoue
        if (process.env.NODE_ENV === "development") {
          console.warn(`[Livreur] ⚠️ Erreur blockchain (mode dev):`, blockchainError.message);
          console.log(`[Livreur] 💡 Continuation sans blockchain en mode dev...`);
        } else {
          // En production, re-lancer l'erreur
          throw blockchainError;
        }
      }

      // Back-end (toujours nécessaire)
      console.log(`[Livreur] 📡 Notification backend acceptation commande #${orderId}...`);
      await api.acceptOrder(orderId, address);
      console.log(`[Livreur] ✅ Backend notifié pour commande #${orderId}`);

      // Supprimer de la liste
      setOrders((prev) => {
        const filtered = prev.filter((o: any) => o.orderId !== orderId);
        console.log(`[Livreur] 📋 Commande #${orderId} retirée de la liste (reste ${filtered.length} commande(s))`);
        return filtered;
      });

      // Redirection
      console.log(`[Livreur] 🔄 Redirection vers page livraison pour commande #${orderId}`);
      router.push(`/deliveries?orderId=${orderId}`);
    } catch (err: any) {
      console.error(`[Livreur] ❌ Erreur acceptation commande #${orderId}:`, err);
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

