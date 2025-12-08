/**
 * Page EarningsPage - Page complète revenus
 */

import { useState, useEffect } from "react";
import EarningsTracker from "../components/EarningsTracker";
import blockchain from "../services/blockchain";

function EarningsPage() {
  const [transactions, setTransactions] = useState([]);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(false);

  /** Charger adresse wallet au montage */
  useEffect(() => {
    loadWalletAddress();
  }, []);

  /** Charger transactions une fois l'adresse connue */
  useEffect(() => {
    if (address) {
      loadTransactions();
    }
  }, [address]);

  /** Charger adresse MetaMask */
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

  /** Charger transactions blockchain */
  async function loadTransactions() {
    setLoading(true);

    try {
      const { events } = await blockchain.getEarningsEvents(address);
      setTransactions(events);
    } catch (err) {
      console.error("Erreur chargement transactions :", err);
    } finally {
      setLoading(false);
    }
  }

  /** Export CSV */
  function handleExportCSV() {
    if (transactions.length === 0) return;

    const rows = [];
    rows.push([
      "Date",
      "Order ID",
      "Montant (MATIC)",
      "Transaction Hash",
      "Status",
    ].join(","));

    transactions.forEach((tx) => {
      rows.push([
        new Date(tx.timestamp * 1000).toLocaleDateString(),
        tx.orderId,
        tx.delivererAmount,
        tx.txHash,
        "Completed",
      ].join(","));
    });

    const blob = new Blob([rows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "earnings_history.csv";
    link.click();
  }

  return (
    <div className="earnings-page">
      <h1>Mes Revenus</h1>

      {/* Earnings Tracker */}
      {address && <EarningsTracker address={address} />}

      {/* Historique transactions */}
      <div className="transactions-history">
        <h2>Historique des transactions</h2>

        {loading ? (
          <div>Chargement...</div>
        ) : transactions.length === 0 ? (
          <div>Aucune transaction</div>
        ) : (
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Order ID</th>
                <th>Montant (20%)</th>
                <th>Transaction Hash</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((tx, index) => (
                <tr key={index}>
                  <td>{new Date(tx.timestamp * 1000).toLocaleDateString()}</td>
                  <td>{tx.orderId}</td>
                  <td>{tx.delivererAmount} MATIC</td>
                  <td>
                    <a
                      href={`https://mumbai.polygonscan.com/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {tx.txHash.slice(0, 12)}...
                    </a>
                  </td>
                  <td>✅ Complété</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Export */}
      <button onClick={handleExportCSV} className="btn-secondary">
        Export CSV
      </button>
    </div>
  );
}

export default EarningsPage;
