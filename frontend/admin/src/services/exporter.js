/**
 * exporter.js
 * Utilitaire pour exporter les données analytics en CSV
 */

export function exportAnalyticsCSV(analyticsData) {
  if (!analyticsData) {
    console.error("exportAnalyticsCSV: no data provided");
    return;
  }

  // Format des colonnes CSV
  const headers = Object.keys(analyticsData[0] || {});
  const csvRows = [];

  // Ajout headers
  csvRows.push(headers.join(","));

  // Ajout des lignes
  analyticsData.forEach((row) => {
    const values = headers.map((h) =>
      JSON.stringify(row[h] ?? "", (_, value) => value)
    );
    csvRows.push(values.join(","));
  });

  // Conversion → Blob CSV
  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });

  // Téléchargement auto
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `analytics_export_${Date.now()}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}
