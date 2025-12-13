import { useState, useEffect } from "react";
import { useApp } from "../App";
import api from "../services/api";

function DeliveriesPage() {
  const { address } = useApp();
  const [deliveries, setDeliveries] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (address) loadDeliveries();
  }, [address, filter]);

  async function loadDeliveries() {
    setLoading(true);
    try {
      const filters = filter !== "all" ? { status: filter.toUpperCase() } : {};
      const response = await api.getDelivererOrders(address, filters);

      // Ensure we have an array
      const orders = Array.isArray(response) ? response : (response?.orders || []);
      setDeliveries(orders);
    } catch (err) {
      console.error(err);
      setDeliveries([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await loadDeliveries();
    } catch (err) {
      console.error("Erreur lors de l'actualisation:", err);
      alert("Erreur lors de l'actualisation des données");
    } finally {
      setRefreshing(false);
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

  if (!address) {
    return (
      <div className="page">
        <div className="card center">
          <p>Connectez votre wallet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem',
        width: '100%'
      }}>
        <h1 style={{ margin: 0, flex: '1 1 auto' }}>Mes Livraisons</h1>
        <button 
          onClick={handleRefresh} 
          disabled={refreshing || loading}
          className="btn-primary"
          style={{ 
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: (refreshing || loading) ? 'not-allowed' : 'pointer',
            minWidth: '150px',
            justifyContent: 'center',
            whiteSpace: 'nowrap',
            opacity: (refreshing || loading) ? 0.7 : 1
          }}
        >
          {refreshing ? (
            <>
              <span>🔄</span>
              <span>Actualisation...</span>
            </>
          ) : (
            <>
              <span>🔄</span>
              <span>Actualiser</span>
            </>
          )}
        </button>
      </div>

      <div className="filters">
        {["all", "active", "completed", "cancelled"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={filter === f ? "active" : ""}
          >
            {f === "all" ? "Toutes" : f === "active" ? "En cours" : f === "completed" ? "Complétées" : "Annulées"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card center">Chargement...</div>
      ) : deliveries.length === 0 ? (
        <div className="card center">Aucune livraison</div>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Restaurant</th>
                <th>Client</th>
                <th>Status</th>
                <th>Gains</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((d) => (
                <tr key={d.orderId}>
                  <td>{d.orderId}</td>
                  <td>{d.restaurant?.name}</td>
                  <td>{d.client?.name}</td>
                  <td>
                    <span className={`badge badge-${d.status?.toLowerCase()}`}>
                      {d.status}
                    </span>
                  </td>
                  <td>{d.earnings || 0} POL</td>
                  <td>{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={exportCSV} className="btn-secondary">
            Export CSV
          </button>
        </>
      )}
    </div>
  );
}

export default DeliveriesPage;
