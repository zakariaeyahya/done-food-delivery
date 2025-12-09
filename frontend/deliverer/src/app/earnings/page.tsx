"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/providers/AppProvider";
import { PageTransition } from "@/components/ui/PageTransition";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { EarningsChart } from "@/components/charts/EarningsChart";
import api from "@/services/api";
import blockchain from "@/services/blockchain";
import { Download, DollarSign, Package } from "lucide-react";
import { motion } from "framer-motion";

export default function EarningsPage() {
  const { address } = useApp();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [earnings, setEarnings] = useState({
    today: 0,
    week: 0,
    month: 0,
  });
  const [period, setPeriod] = useState<"today" | "week" | "month">("week");
  const [deliveriesCount, setDeliveriesCount] = useState(0);
  const [chartData, setChartData] = useState<{
    labels: string[];
    values: number[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (address) {
      loadTransactions();
      fetchEarnings();
      fetchEarningsEvents();
    }
  }, [address, period]);

  async function loadTransactions() {
    setLoading(true);
    try {
      const { events } = await blockchain.getEarningsEvents(address!);
      setTransactions(events);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchEarnings() {
    try {
      const todayData = await api.getEarnings(address!, "today");
      const weekData = await api.getEarnings(address!, "week");
      const monthData = await api.getEarnings(address!, "month");

      setEarnings({
        today: todayData?.totalEarnings || 0,
        week: weekData?.totalEarnings || 0,
        month: monthData?.totalEarnings || 0,
      });

      setDeliveriesCount(weekData?.completedDeliveries || 0);
    } catch (err) {
      console.error("Erreur récupération earnings :", err);
    }
  }

  async function fetchEarningsEvents() {
    try {
      const { events } = await blockchain.getEarningsEvents(address!);

      const labels = events.map((e: any) =>
        new Date(e.timestamp * 1000).toLocaleDateString()
      );

      const values = events.map((e: any) => e.delivererAmount);

      setChartData({ labels, values });
    } catch (err) {
      console.error("Erreur récupération events earnings :", err);
    }
  }

  function exportCSV() {
    if (transactions.length === 0) return;
    const rows = [
      ["Date", "Order ID", "Montant (POL)", "Transaction Hash", "Status"].join(","),
      ...transactions.map((tx) =>
        [
          new Date(tx.timestamp * 1000).toLocaleDateString(),
          tx.orderId,
          tx.delivererAmount,
          tx.txHash,
          "Completed",
        ].join(",")
      ),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "earnings.csv";
    link.click();
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
          <h1 className="text-3xl font-bold text-white">Mes Revenus</h1>
          {transactions.length > 0 && (
            <Button variant="secondary" onClick={exportCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>

        <Card>
          <div className="flex gap-2 mb-6">
            {[
              { value: "today" as const, label: "Aujourd'hui" },
              { value: "week" as const, label: "Semaine" },
              { value: "month" as const, label: "Mois" },
            ].map((p) => (
              <Button
                key={p.value}
                variant={period === p.value ? "primary" : "ghost"}
                size="sm"
                onClick={() => setPeriod(p.value)}
              >
                {p.label}
              </Button>
            ))}
          </div>

          <div className="text-center mb-6">
            <p className="text-5xl font-bold text-white mb-2">
              {earnings[period].toFixed(3)} <span className="text-2xl text-slate-400">POL</span>
            </p>
            <div className="flex items-center justify-center gap-4 text-slate-400">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span>{deliveriesCount} livraisons</span>
              </div>
            </div>
          </div>

          {chartData && (
            <div className="mt-6">
              <EarningsChart data={chartData} />
            </div>
          )}
        </Card>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Historique des transactions
          </h2>

          {loading ? (
            <CardSkeleton />
          ) : transactions.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-slate-400">Aucune transaction</p>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                        Order ID
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                        Montant
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                        Transaction
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx, i) => (
                      <motion.tr
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm text-white">
                          {new Date(tx.timestamp * 1000).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-white font-mono">
                          {tx.orderId}
                        </td>
                        <td className="py-3 px-4 text-sm text-emerald-400 font-medium">
                          {tx.delivererAmount} POL
                        </td>
                        <td className="py-3 px-4">
                          <a
                            href={`https://mumbai.polygonscan.com/tx/${tx.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:text-indigo-300 text-sm"
                          >
                            {tx.txHash.slice(0, 12)}...
                          </a>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-emerald-400">✅</span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

