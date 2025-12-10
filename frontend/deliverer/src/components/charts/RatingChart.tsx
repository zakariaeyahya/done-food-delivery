"use client";

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);

interface RatingChartProps {
  data: {
    labels: string[];
    datasets: any[];
  } | null;
}

export function RatingChart({ data }: RatingChartProps) {
  if (!data || !data.labels || data.labels.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400">
        Aucune donnée disponible
      </div>
    );
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "rgba(245, 158, 11, 0.5)",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#94a3b8",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
        },
      },
      y: {
        min: 0,
        max: 5,
        ticks: {
          color: "#94a3b8",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
        },
      },
    },
  };

  return (
    <div className="h-64">
      <Line data={data} options={options} />
    </div>
  );
}

