import { useState, useEffect } from "react";
import { useApp } from "../App";
import EarningsTracker from "../components/EarningsTracker";
import blockchain from "../services/blockchain";

function EarningsPage() {
  const { address } = useApp();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (address) loadTransactions();
  }, [address]);

  async function loadTransactions() {
    setLoading(true);
    try {
      const { events } = await blockchain.getEarningsEvents(address);
      setTransactions(events);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await loadTransactions();
    } catch (err) {
      alert("Erreur lors de l'actualisation des données");
    } finally {
      setRefreshing(false);
    }
  }

  function exportCSV() {
    if (transactions.length === 0) return;
    const rows = [
      ["Date", "Order ID", "Montant (POL)", "Transaction Hash", "Status"].join(","),
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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem',
        width: '100%'
      }}>
        <h1 style={{ margin: 0, flex: '1 1 auto' }}>Mes Revenus</h1>
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
                  <td>{tx.delivererAmount} POL</td>
                  <td>
                    <a href={`https://amoy.polygonscan.com/tx/${tx.txHash}`} target="_blank" rel="noopener noreferrer">
                      {tx.txHash.slice(0, 12)}...
                    </a>
                  </td>
                  <td></td>
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
