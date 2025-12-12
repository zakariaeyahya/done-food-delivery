/**
 * Composant EarningsChart - Restaurant
 * @notice Graphique des revenus et gains on-chain
 * @dev Data depuis blockchain events PaymentSplit, retrait fonds
 */

import { useEffect, useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import { ethers } from "ethers";

import * as api from "../services/api";
import * as blockchain from "../services/blockchain";

/**
 * Convertit wei en POL (ether)
 */
function weiToPol(weiValue) {
  try {
    if (!weiValue && weiValue !== 0) return 0;
    const numValue = Number(weiValue);
    // Si la valeur est < 1e12, elle est probablement déjà en POL
    if (numValue < 1e12) return numValue;
    return parseFloat(ethers.formatEther(weiValue.toString()));
  } catch {
    return 0;
  }
}

// Si tu as déjà des helpers dans utils, remplace ceux-ci
function formatPrice(v) {
  if (v == null || Number.isNaN(Number(v))) return "0.000000";
  return Number(weiToPol(v)).toFixed(6);
}
function formatDate(d) {
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Composant EarningsChart
 * @param {string} restaurantId - ID du restaurant
 * @param {string} restaurantAddress - Adresse wallet du restaurant
 * @param {'day'|'week'|'month'} period
 * @param {string} explorerBaseUrl - ex: https://mumbai.polygonscan.com ou https://polygonscan.com
 * @param {(msg:string)=>void} showSuccess - toast success optionnel
 * @param {(msg:string)=>void} showError - toast error optionnel
 */
function EarningsChart({
  restaurantId,
  restaurantAddress,
  period = "week",
  explorerBaseUrl = "https://mumbai.polygonscan.com",
  showSuccess,
  showError,
}) {
  const [earnings, setEarnings] = useState({
    daily: [],
    weekly: [],
    pending: 0,
    withdrawn: 0,
    transactions: [],
  });

  const [loading, setLoading] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (restaurantAddress && restaurantId) {
      fetchEarnings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantAddress, restaurantId, period]);

  async function fetchEarnings() {
    try {
      setLoading(true);
      setError("");

      // Data backend
      const apiData = await api.getEarnings(
        restaurantId,
        { period },
        restaurantAddress
      );

      // Solde pending on-chain
      const pendingRaw = await blockchain.getPendingBalance(restaurantAddress);

      // normalise pending (si BigNumber)
      const pending =
        typeof pendingRaw === "object" && pendingRaw?.toString
          ? Number(pendingRaw.toString())
          : Number(pendingRaw || 0);

      setEarnings({
        daily: apiData?.daily ?? [],
        weekly: apiData?.weekly ?? [],
        withdrawn: apiData?.withdrawn ?? 0,
        transactions: apiData?.transactions ?? [],
        pending: apiData?.pending ?? pending,
      });
    } catch (e) {
      console.error("Error fetching earnings:", e);
      setError("Impossible de charger les revenus on-chain.");
      showError?.(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleWithdraw() {
    try {
      setWithdrawing(true);
      setError("");

      // Retrait blockchain
      const result = await blockchain.withdraw();

      // Update backend
      await api.withdrawEarnings(restaurantId, restaurantAddress);

      // Refresh
      await fetchEarnings();

      const amountMsg =
        result?.amount != null ? formatPrice(result.amount, 'POL', 5) : "OK";
      showSuccess?.(`Retrait réussi: ${amountMsg}`);
    } catch (e) {
      console.error("Error withdrawing:", e);
      setError(`Erreur de retrait: ${e.message}`);
      showError?.(`Erreur: ${e.message}`);
    } finally {
      setWithdrawing(false);
    }
  }

  // ----- Chart data -----
  const chartSeries = period === "month" ? earnings.weekly : earnings.daily;

  const earningsChartData = useMemo(() => {
    // Si pas de données, créer des labels pour la période
    let labels = chartSeries.map((d) => d.date || d.label);
    let values = chartSeries.map((d) => d.amount ?? 0);
    
    // Si pas de données, créer des points à zéro pour la période
    if (labels.length === 0) {
      const days = period === "day" ? 1 : period === "week" ? 7 : 30;
      const today = new Date();
      labels = [];
      values = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        labels.push(dateStr);
        values.push(0);
      }
    }

    return {
      labels,
      datasets: [
        {
          label: "Revenus (POL)",
          data: values,
          tension: 0.35,
          fill: true,
          borderWidth: 2,
          borderColor: "rgb(249, 115, 22)", // orange-500
          backgroundColor: "rgba(249, 115, 22, 0.12)",
          pointRadius: values.some(v => v > 0) ? 3 : 0, // Masquer les points si tous à zéro
          pointHoverRadius: 5,
        },
      ],
    };
  }, [chartSeries, period]);

  const lineOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: "top" },
        tooltip: { intersect: false, mode: "index" },
      },
      scales: {
        x: { grid: { display: false } },
        y: {
          grid: { color: "rgba(0,0,0,0.06)" },
          beginAtZero: true,
        },
      },
    }),
    []
  );

  return (
    <div className="space-y-5 rounded-2xl bg-white p-5 shadow-soft dark:bg-neutral-800">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl text-neutral-900 dark:text-neutral-50">
            Revenus On-Chain
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Paiements répartis via smart contract
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchEarnings}
            disabled={loading}
            className="rounded-xl bg-neutral-100 px-3 py-2 text-sm font-semibold text-neutral-700 shadow-soft transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
          >
            {loading ? "🔄 Actualisation..." : "🔄 Actualiser"}
          </button>

          <div className="flex items-center gap-3 rounded-xl bg-neutral-50 px-3 py-2 dark:bg-neutral-900/40">
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Solde en attente
            </p>
            <p className="font-semibold text-neutral-900 dark:text-neutral-50">
              {formatPrice(earnings.pending, 'POL', 5)}
            </p>
          </div>

          <button
            onClick={handleWithdraw}
            disabled={withdrawing || Number(earnings.pending) <= 0}
            className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {withdrawing ? "Retrait..." : "Retirer"}
          </button>
          </div>
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="grid place-items-center rounded-xl bg-neutral-50 p-10 text-neutral-500 dark:bg-neutral-900/40 dark:text-neutral-300">
          Chargement...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-error-200 bg-error-50 p-3 text-sm text-error-700 dark:border-error-800 dark:bg-error-900/20 dark:text-error-200">
          {error}
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <div className="space-y-6">
          {/* Chart */}
          <div className="rounded-2xl bg-white p-3 shadow-soft dark:bg-neutral-800">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-display text-lg text-neutral-900 dark:text-neutral-50">
                Évolution des revenus
              </h3>
              <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-800 dark:bg-orange-900/30 dark:text-orange-200">
                {period === "day"
                  ? "Aujourd’hui"
                  : period === "week"
                  ? "7 derniers jours"
                  : "4 dernières semaines"}
              </span>
            </div>
            <div className="h-72">
              <Line data={earningsChartData} options={lineOptions} />
            </div>
          </div>

          {/* Transactions */}
          <div className="rounded-2xl bg-white p-4 shadow-soft dark:bg-neutral-800">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-lg text-neutral-900 dark:text-neutral-50">
                Historique des transactions
              </h3>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                Retiré total:{" "}
                <span className="font-semibold text-neutral-900 dark:text-neutral-50">
                  {formatPrice(earnings.withdrawn, 'POL', 5)}
                </span>
              </div>
            </div>

            {(!earnings.transactions ||
              earnings.transactions.length === 0) && (
              <div className="grid place-items-center py-8 text-sm text-neutral-500 dark:text-neutral-400">
                Aucune transaction sur la période.
              </div>
            )}

            {earnings.transactions?.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-neutral-500 dark:text-neutral-400">
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Commande</th>
                      <th className="py-2 pr-4">Montant</th>
                      <th className="py-2 pr-4">Tx</th>
                    </tr>
                  </thead>
                  <tbody>
                    {earnings.transactions.map((tx, index) => (
                      <tr
                        key={tx.txHash || index}
                        className="border-t border-neutral-100 dark:border-neutral-700"
                      >
                        <td className="py-2 pr-4 text-neutral-700 dark:text-neutral-200">
                          {formatDate(tx.date)}
                        </td>
                        <td className="py-2 pr-4 font-medium text-neutral-900 dark:text-neutral-50">
                          #{tx.orderId ?? "—"}
                        </td>
                        <td className="py-2 pr-4 text-neutral-700 dark:text-neutral-200">
                          {formatPrice(tx.amount, 'POL', 5)}
                        </td>
                        <td className="py-2 pr-4">
                          {tx.txHash ? (
                            <a
                              href={`${explorerBaseUrl}/tx/${tx.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-orange-600 hover:underline dark:text-orange-300"
                            >
                              Voir
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default EarningsChart;
