/**
 * Page AnalyticsPage - Restaurant
 * @notice Analytics détaillées du restaurant
 * @dev Intègre Analytics et EarningsChart, export CSV
 */

import { useMemo, useState } from "react";

import Analytics from "../components/Analytics";
import EarningsChart from "../components/EarningsChart";

import * as api from "../services/api";
import { useWallet } from "../contexts/WalletContext"; // adapte le chemin/nom si différent

function AnalyticsPage({ showSuccess, showError }) {
  const [period, setPeriod] = useState("week");
  const [exporting, setExporting] = useState(false);

  const { restaurant, address } = useWallet();

  const restaurantId = restaurant?._id;
  const restaurantAddress = restaurant?.address || address;

  function getStartDate(p) {
    const now = new Date();
    if (p === "day") return new Date(now.setHours(0, 0, 0, 0));
    if (p === "week") {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      return d;
    }
    const m = new Date();
    m.setMonth(m.getMonth() - 1);
    return m;
  }

  const periodLabel = useMemo(() => {
    if (period === "day") return "Aujourd'hui";
    if (period === "week") return "Cette semaine";
    return "Ce mois";
  }, [period]);

  async function handleExportCSV() {
    if (!restaurantId || !restaurantAddress) {
      showError?.("Restaurant non connecté.");
      return;
    }

    try {
      setExporting(true);

      const startDate = getStartDate(period);
      const endDate = new Date();

      // 1) Fetch analytics up-to-date
      const analytics = await api.getAnalytics(
        restaurantId,
        { startDate, endDate },
        restaurantAddress
      );

      // 2) Fetch earnings up-to-date
      const earnings = await api.getEarnings(
        restaurantId,
        { period },
        restaurantAddress
      );

      // 3) Construire CSV
      const rows = [];

      // Header général
      rows.push([
        "Restaurant",
        restaurant?.name || "",
        "Période",
        periodLabel,
        "Du",
        startDate.toISOString(),
        "Au",
        endDate.toISOString(),
      ]);

      rows.push([]); // ligne vide

      // KPIs
      rows.push(["--- KPIs ---"]);
      rows.push(["Total Orders", analytics?.totalOrders ?? 0]);
      rows.push(["Revenue (MATIC)", analytics?.revenue ?? 0]);
      rows.push(["Average Rating", analytics?.averageRating ?? 0]);
      rows.push([
        "Average Preparation Time (min)",
        analytics?.averagePreparationTime ?? 0,
      ]);

      rows.push([]);

      // Série revenus
      rows.push(["--- Revenue Series ---"]);
      rows.push(["Date/Label", "Amount (MATIC)"]);
      (analytics?.revenueSeries ?? []).forEach((p) => {
        rows.push([p.label ?? p.date ?? "", p.value ?? 0]);
      });

      rows.push([]);

      // Plats populaires
      rows.push(["--- Popular Dishes ---"]);
      rows.push(["Dish", "Orders", "Revenue (MATIC)", "Rating"]);
      (analytics?.popularDishes ?? []).forEach((d) => {
        rows.push([
          d.name ?? "",
          d.orderCount ?? 0,
          d.revenue ?? 0,
          d.rating ?? "",
        ]);
      });

      rows.push([]);

      // Earnings
      rows.push(["--- On-chain Earnings ---"]);
      rows.push(["Pending (MATIC)", earnings?.pending ?? 0]);
      rows.push(["Withdrawn (MATIC)", earnings?.withdrawn ?? 0]);
      rows.push([]);
      rows.push(["Date/Label", "Amount (MATIC)"]);

      const series =
        period === "month"
          ? earnings?.weekly ?? []
          : earnings?.daily ?? [];

      series.forEach((s) => {
        rows.push([s.date ?? s.label ?? "", s.amount ?? 0]);
      });

      rows.push([]);

      // Transactions
      rows.push(["--- Transactions ---"]);
      rows.push(["Date", "OrderId", "Amount (MATIC)", "TxHash"]);
      (earnings?.transactions ?? []).forEach((tx) => {
        rows.push([
          tx.date ?? "",
          tx.orderId ?? "",
          tx.amount ?? 0,
          tx.txHash ?? "",
        ]);
      });

      const csv = toCSV(rows);
      downloadCSV(
        csv,
        `analytics_${restaurant?.name || "restaurant"}_${period}.csv`
      );

      showSuccess?.("Export CSV généré.");
    } catch (e) {
      console.error("CSV export error:", e);
      showError?.(`Erreur export CSV: ${e.message}`);
    } finally {
      setExporting(false);
    }
  }

  function toCSV(rows) {
    return rows
      .map((row) =>
        row
          .map((cell) => {
            const str = String(cell ?? "");
            // échapper guillemets + virgules
            if (/[",\n]/.test(str)) {
              return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
          })
          .join(",")
      )
      .join("\n");
  }

  function downloadCSV(csvString, filename) {
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-neutral-900 dark:text-neutral-50">
            Statistiques & Revenus
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Analytics opérationnelles + revenus on-chain
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm shadow-soft outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200 dark:border-neutral-700 dark:bg-neutral-800 dark:focus:border-orange-500 dark:focus:ring-orange-900"
          >
            <option value="day">Aujourd&apos;hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
          </select>

          <button
            onClick={handleExportCSV}
            disabled={exporting || !restaurantId}
            className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {exporting ? "Export..." : "Export CSV"}
          </button>
        </div>
      </div>

      {!restaurantId && (
        <div className="rounded-2xl border border-warning-200 bg-warning-50 p-4 text-warning-800 dark:border-warning-900 dark:bg-warning-900/20 dark:text-warning-200">
          Connecte ton wallet restaurant pour voir les analytics.
        </div>
      )}

      {/* Components */}
      {restaurantId && (
        <div className="space-y-6">
          <Analytics
            restaurantId={restaurantId}
            restaurantAddress={restaurantAddress}
            period={period}
            onPeriodChange={setPeriod} // optionnel : synchro dropdown interne
          />

          <EarningsChart
            restaurantId={restaurantId}
            restaurantAddress={restaurantAddress}
            period={period}
          />
        </div>
      )}
    </div>
  );
}

export default AnalyticsPage;
