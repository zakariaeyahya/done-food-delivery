export function exportAnalyticsCSV(analyticsData) {
  if (!analyticsData) {
    return;
  }

  const headers = Object.keys(analyticsData[0] || {});
  const csvRows = [];

  csvRows.push(headers.join(","));

  analyticsData.forEach((row) => {
    const values = headers.map((h) =>
      JSON.stringify(row[h] ?? "", (_, value) => value)
    );
    csvRows.push(values.join(","));
  });

  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `analytics_export_${Date.now()}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}
