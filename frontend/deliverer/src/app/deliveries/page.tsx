"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/providers/AppProvider";
import { PageTransition } from "@/components/ui/PageTransition";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/ui/Skeleton";
import api from "@/services/api";
import { Download } from "lucide-react";
import { motion } from "framer-motion";

export default function DeliveriesPage() {
  const { address } = useApp();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (address) loadDeliveries();
  }, [address, filter]);

  async function loadDeliveries() {
    setLoading(true);
    try {
      const filters = filter !== "all" ? { status: filter.toUpperCase() } : {};
      const response = await api.getDelivererOrders(address!, filters);

      const orders = Array.isArray(response) ? response : response?.orders || [];
      setDeliveries(orders);
    } catch (err) {
      console.error(err);
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  }

  function exportCSV() {
    const rows = [
      ["Order ID", "Restaurant", "Client", "Status", "Earnings", "Date"].join(","),
      ...deliveries.map((d) =>
        [
          d.orderId,
          d.restaurant?.name || "",
          d.client?.name || "",
          d.status,
          d.earnings || 0,
          new Date(d.createdAt).toLocaleDateString(),
        ].join(",")
      ),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "deliveries.csv";
    link.click();
  }

  function getStatusBadge(status: string) {
    const statusLower = status?.toLowerCase() || "";
    if (statusLower.includes("active") || statusLower.includes("delivery")) {
      return <Badge variant="info">En cours</Badge>;
    }
    if (statusLower.includes("completed") || statusLower.includes("delivered")) {
      return <Badge variant="success">Complétée</Badge>;
    }
    if (statusLower.includes("cancelled")) {
      return <Badge variant="danger">Annulée</Badge>;
    }
    return <Badge variant="default">{status}</Badge>;
  }

  if (!address) {
    return (
      <PageTransition>
        <Card className="text-center py-12">
          <p className="text-slate-400">Connectez votre wallet</p>
        </Card>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Mes Livraisons</h1>
          {deliveries.length > 0 && (
            <Button variant="secondary" onClick={exportCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {[
            { value: "all", label: "Toutes" },
            { value: "active", label: "En cours" },
            { value: "completed", label: "Complétées" },
            { value: "cancelled", label: "Annulées" },
          ].map((f) => (
            <Button
              key={f.value}
              variant={filter === f.value ? "primary" : "ghost"}
              size="sm"
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>

        {loading ? (
          <TableSkeleton rows={5} />
        ) : deliveries.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-slate-400">Aucune livraison</p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                      ID
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                      Restaurant
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                      Client
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                      Gains
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((d, i) => (
                    <motion.tr
                      key={d.orderId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-white font-mono">
                        {d.orderId.slice(0, 8)}...
                      </td>
                      <td className="py-3 px-4 text-sm text-white">
                        {d.restaurant?.name || "—"}
                      </td>
                      <td className="py-3 px-4 text-sm text-white">
                        {d.client?.name || "—"}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(d.status)}</td>
                      <td className="py-3 px-4 text-sm text-emerald-400 font-medium">
                        {d.earnings || 0} POL
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-400">
                        {d.createdAt
                          ? new Date(d.createdAt).toLocaleDateString()
                          : "—"}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </PageTransition>
  );
}

