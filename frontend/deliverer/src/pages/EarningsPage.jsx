import { useState, useEffect } from "react";
import { useApp } from "../App";
import EarningsTracker from "../components/EarningsTracker";
import blockchain from "../services/blockchain";

function EarningsPage() {
  const { address } = useApp();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (address) loadTransactions();
  }, [address]);

  async function loadTransactions() {
    setLoading(true);
    try {
      const { events } = await blockchain.getEarningsEvents(address);
      setTransactions(events);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function exportCSV() {
    if (transactions.length === 0) return;
    const rows = [
      ["Date", "Order ID", "Montant (MATIC)", "Transaction Hash", "Status"].join(","),
      ...transactions.map((tx) =>
        [
          new Date(tx.timestamp * 1000).toLocaleDateString(),
          tx.orderId,
          tx.delivererAmount,
          tx.txHash,
          "Completed",
        ].join(",")
      ),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "earnings.csv";
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
      <h1>Mes Revenus</h1>

      <EarningsTracker address={address} />

      <h2>Historique des transactions</h2>

      {loading ? (
        <div className="card center">Chargement...</div>
      ) : transactions.length === 0 ? (
        <div className="card center">Aucune transaction</div>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Order ID</th>
                <th>Montant</th>
                <th>Transaction</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, i) => (
                <tr key={i}>
                  <td>{new Date(tx.timestamp * 1000).toLocaleDateString()}</td>
                  <td>{tx.orderId}</td>
                  <td>{tx.delivererAmount} MATIC</td>
                  <td>
                    <a href={`https://mumbai.polygonscan.com/tx/${tx.txHash}`} target="_blank" rel="noopener noreferrer">
                      {tx.txHash.slice(0, 12)}...
                    </a>
                  </td>
                  <td>✅</td>
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

export default EarningsPage;
