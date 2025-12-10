/**
 * Utils Chart.js
 * @notice Outils pour créer des datasets propres et automatiques pour Chart.js
 * @dev Gère couleurs, légendes, normalisation, simplification, etc.
 */

/* ============================================================
   PALETTE COULEURS AUTO
   ============================================================ */

export const COLORS = [
  "#4F46E5", // Indigo
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#14B8A6", // Teal
  "#F97316", // Orange
  "#84CC16", // Lime
];

/**
 * Retourne une couleur auto pour dataset indexé
 */
export function getColor(index) {
  return COLORS[index % COLORS.length];
}

/* ============================================================
   FORMATAGE DES LÉGENDES
   ============================================================ */

export function formatLegend(label) {
  if (!label) return "";
  return label
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

/* ============================================================
   NORMALISATION DES DONNÉES
   ============================================================ */

export function normalizeData(values = []) {
  return values.map((v) => (v === null || v === undefined ? 0 : v));
}

/**
 * Simplifie une série trop longue (ex: 365 points → 100 max)
 */
export function simplifySeries(values, maxPoints = 100) {
  if (values.length <= maxPoints) return values;

  const bucketSize = Math.floor(values.length / maxPoints);
  const simplified = [];

  for (let i = 0; i < values.length; i += bucketSize) {
    const subset = values.slice(i, i + bucketSize);
    const avg =
      subset.reduce((sum, v) => sum + (v || 0), 0) / subset.length || 0;
    simplified.push(avg);
  }

  return simplified;
}

/* ============================================================
   CRÉATION DATASET LINÉAIRE (line chart)
   ============================================================ */

export function createLineDataset({
  label,
  data,
  index = 0,
  fill = false,
  tension = 0.3,
}) {
  const color = getColor(index);

  return {
    label: formatLegend(label),
    data: normalizeData(data),
    borderColor: color,
    backgroundColor: `${color}33`, // transparence
    borderWidth: 2,
    fill,
    tension,
  };
}

/* ============================================================
   CRÉATION DATASET BAR (bar chart)
   ============================================================ */

export function createBarDataset({ label, data, index = 0 }) {
  const color = getColor(index);

  return {
    label: formatLegend(label),
    data: normalizeData(data),
    backgroundColor: `${color}AA`,
    borderColor: color,
    borderWidth: 1,
  };
}

/* ============================================================
   CRÉATION DATASET DOUGHNUT / PIE
   ============================================================ */

export function createCircularDataset({ labels, values }) {
  return {
    labels: labels.map(formatLegend),
    datasets: [
      {
        data: normalizeData(values),
        backgroundColor: labels.map((_, i) => getColor(i)),
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };
}

/* ============================================================
   PACKAGER DONNÉES CHART.JS COMPLET
   ============================================================ */

export function prepareChartData({
  labels,
  datasets,
  simplify = false,
  maxPoints = 100,
}) {
  const finalDatasets = datasets.map((ds, index) => {
    const values = simplify
      ? simplifySeries(ds.data, maxPoints)
      : normalizeData(ds.data);

    return {
      ...createLineDataset({
        label: ds.label,
        data: values,
        index,
        fill: ds.fill || false,
      }),
    };
  });

  const finalLabels = simplify
    ? simplifySeries(labels, maxPoints)
    : labels;

  return {
    labels: finalLabels,
    datasets: finalDatasets,
  };
}

/* ============================================================
   OPTIONS GLOBALES CHARTS
   ============================================================ */

export const defaultChartOptions = {
  responsive: true,
  maintainAspectRatio: false,

  interaction: {
    mode: "index",
    intersect: false,
  },

  plugins: {
    legend: {
      display: true,
      position: "top",
      labels: {
        color: "#FFF",
        font: { size: 12 },
        padding: 20,
      },
    },
    tooltip: {
      backgroundColor: "#111827",
      titleColor: "#FFF",
      bodyColor: "#FFF",
      borderColor: "#374151",
      borderWidth: 1,
      padding: 12,
      displayColors: false,
    },
  },

  scales: {
    x: {
      ticks: {
        color: "#DDD",
      },
      grid: {
        color: "#333",
      },
    },
    y: {
      ticks: {
        color: "#DDD",
      },
      grid: {
        color: "#333",
      },
    },
  },
};

/* ============================================================
   EXPORT GLOBAL
   ============================================================ */

export default {
  COLORS,
  getColor,
  formatLegend,
  normalizeData,
  simplifySeries,
  createLineDataset,
  createBarDataset,
  createCircularDataset,
  prepareChartData,
  defaultChartOptions,
};
