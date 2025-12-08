/**
 * Page DeliveriesPage - Gestion et historique des livraisons
 */

import { useState, useEffect } from "react";
import api from "../services/api";

function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [filter, setFilter] = useState("all"); // all, active, completed, cancelled
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(false);

  /** Charger adresse wallet */
  useEffect(() => {
    loadWalletAddress();
  }, []);

  /** Charger livraisons lorsque adresse ou filtres changent */
  useEffect(() => {
    if (address) {
      loadDeliveries();
    }
  }, [address, filter]);

  /** Récupérer adresse MetaMask */
  async function loadWalletAddress() {
    try {
      if (!window.ethereum) return;

      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts.length > 0) {
        setAddress(accounts[0]);
      }
    } catch (err) {
      console.error("Erreur chargement wallet :", err);
    }
  }

  /** Charger liste des livraisons */
  async function loadDeliveries() {
    setLoading(true);

    try {
      const filters =
        filter !== "all" ? { status: filter.toUpperCase() } : {};

      const orders = await api.getDelivererOrders(address, filters);
      setDeliveries(orders);
    } catch (err) {
      console.error("Erreur chargement livraisons :", err);
    } finally {
      setLoading(false);
    }
  }

  /** Voir détails d’une livraison */
  async function handleViewDetails(orderId) {
    try {
      const order = await api.getOrder(orderId);
      setSelectedDelivery(order);
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  }

  /** Continuer une livraison active */
  function handleContinueDelivery(orderId) {
    window.location.href = `/?orderId=${orderId}`;
  }

  /** Export CSV */
  function handleExportCSV() {
    const csvRows = [];

    // En-têtes
    csvRows.push(
      ["Order ID", "Restaurant", "Client", "Status", "Earnings", "Date"].join(
        ","
      )
    );

    // Données
    deliveries.forEach((d) => {
      csvRows.push(
        [
          d.orderId,
          d.restaurant?.name || "",
          d.client?.name || "",
          d.status,
          d.earnings || 0,
          new Date(d.createdAt).toLocaleDateString(),
        ].join(",")
      );
    });

    const csvBlob = new Blob([csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(csvBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "deliveries.csv";
    link.click();
  }

  return (
    <div className="deliveries-page">
      <h1>Mes Livraisons</h1>

      {/* Filtres */}
      <div className="filters">
        {["all", "active", "completed", "cancelled"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={filter === f ? "active" : ""}
          >
            {f === "all"
              ? "Toutes"
              : f === "active"
              ? "En cours"
              : f === "completed"
              ? "Complétées"
              : "Annulées"}
          </button>
        ))}
      </div>

      {/* Liste livraisons */}
      {loading ? (
        <div>Chargement...</div>
      ) : deliveries.length === 0 ? (
        <div>Aucune livraison</div>
      ) : (
        <>
          <table className="deliveries-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Restaurant</th>
                <th>Client</th>
                <th>Status</th>
                <th>Gains</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {deliveries.map((delivery) => (
                <tr key={delivery.orderId}>
                  <td>{delivery.orderId}</td>
                  <td>{delivery.restaurant?.name}</td>
                  <td>{delivery.client?.name}</td>
                  <td>
                    <span
                      className={`status-badge status-${delivery.status?.toLowerCase()}`}
                    >
                      {delivery.status}
                    </span>
                  </td>
                  <td>{delivery.earnings || 0} MATIC</td>
                  <td>
                    {delivery.createdAt
                      ? new Date(delivery.createdAt).toLocaleDateString()
                      : ""}
                  </td>
                  <td>
                    {delivery.status === "IN_DELIVERY" ? (
                      <button
                        onClick={() => handleContinueDelivery(delivery.orderId)}
                      >
                        Continuer livraison
                      </button>
                    ) : delivery.status === "DELIVERED" ? (
                      <button onClick={() => handleViewDetails(delivery.orderId)}>
                        Voir détails
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button onClick={handleExportCSV} className="btn-secondary">
            Export CSV
          </button>
        </>
      )}

      {/* Modal détails */}
      {selectedDelivery && (
        <div className="modal">
          <div className="modal-content">
            <h2>Détails Livraison #{selectedDelivery.orderId}</h2>

            <p><strong>Restaurant :</strong> {selectedDelivery.restaurant?.name}</p>
            <p><strong>Client :</strong> {selectedDelivery.client?.name}</p>
            <p><strong>Total :</strong> {selectedDelivery.totalAmount} MATIC</p>
            <p><strong>Status :</strong> {selectedDelivery.status}</p>

            {/* Espace prévu pour timeline + GPS replay */}
            <div className="delivery-details-extended">
              <p>Timeline : à implémenter</p>
              <p>GPS replay : à implémenter</p>
            </div>

            <button onClick={() => setSelectedDelivery(null)}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeliveriesPage;
