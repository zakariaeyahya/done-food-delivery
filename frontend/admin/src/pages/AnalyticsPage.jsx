

import React from "react";

import OrdersAnalyticsChart from "../components/OrdersAnalyticsChart";
import RevenueChart from "../components/RevenueChart";
import UsersGrowthChart from "../components/UsersGrowthChart";
import TopRestaurantsTable from "../components/TopRestaurantsTable";
import TopDeliverersTable from "../components/TopDeliverersTable";
import DisputesHistogram from "../components/DisputesHistogram";

import { exportAnalyticsCSV } from "../services/exporter";

export default function AnalyticsPage() {
  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Analytics Avancées</h1>
          <p className="text-gray-600 mt-1">
            Analyse complète de la plateforme.
          </p>
        </div>

        <button
          onClick={() => exportAnalyticsCSV()}
          className="btn btn-primary"
        >
          Export CSV
        </button>
      </div>

      {/* Commandes dans le temps */}
      <div className="p-4 bg-white rounded shadow">
        <OrdersAnalyticsChart />
      </div>

      {/* Revenus */}
      <div className="p-4 bg-white rounded shadow">
        <RevenueChart />
      </div>

      {/* Utilisateurs */}
      <div className="p-4 bg-white rounded shadow">
        <UsersGrowthChart />
      </div>

      {/* TOP RESTAURANTS / LIVREURS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopRestaurantsTable />
        <TopDeliverersTable />
      </div>

      {/* Histogramme litiges */}
      <div className="p-4 bg-white rounded shadow">
        <DisputesHistogram />
      </div>
    </div>
  );
}
