/**
 * DisputesHistogram.jsx
 * Histogramme du nombre de litiges par période
 */

import React, { useEffect, useState } from "react";

// Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// API
import { getAnalyticsDisputes } from "../services/api";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title);

export default function DisputesHistogram() {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      setLoading(true);

      // Requiert API GET /analytics/disputes
      const data = await getAnalyticsDisputes();

      const formatted = {
        labels: data.labels, // ["Jan", "Fév", ...]
        datasets: [
          {
            label: "Litiges",
            data: data.counts,
            backgroundColor: "rgba(239, 68, 68, 0.6)",
            borderColor: "rgb(239, 68, 68)",
            borderWidth: 1,
          },
        ],
      };

      setChartData(formatted);
    } catch (err) {
      console.error("Erreur histogramme litiges:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Histogramme des litiges",
      },
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow border">
      <h2 className="text-xl font-semibold mb-4">⚖️ Litiges par période</h2>

      {loading ? (
        <p className="text-gray-500 text-center py-6">Chargement...</p>
      ) : chartData ? (
        <div className="h-64">
          <Bar data={chartData} options={options} />
        </div>
      ) : (
        <p className="text-gray-500 text-center py-6">Aucune donnée</p>
      )}
    </div>
  );
}
