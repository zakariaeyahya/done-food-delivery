/**
 * Composant StakingPanel - Gestion du staking livreur
 */

import { useState, useEffect } from "react";
import blockchain from "../services/blockchain";
import api from "../services/api";
import { ethers } from "ethers";

/**
 * Composant StakingPanel
 * @param {string} address - Adresse wallet du livreur
 */
function StakingPanel({ address }) {
  const [stakedAmount, setStakedAmount] = useState(0);
  const [isStaked, setIsStaked] = useState(false);
  const [stakeInput, setStakeInput] = useState("0.1");
  const [hasActiveDelivery, setHasActiveDelivery] = useState(false);
  const [slashingHistory, setSlashingHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /** Charger infos staking au montage */
  useEffect(() => {
    if (address) {
      fetchStakingInfo();
      fetchSlashingHistory();
      checkActiveDelivery();
    }
  }, [address]);

  /** Récupérer infos staking */
  async function fetchStakingInfo() {
    try {
      const stakeInfo = await blockchain.getStakeInfo(address);
      setStakedAmount(stakeInfo.amount);
      setIsStaked(stakeInfo.isStaked);
    } catch (err) {
      console.error("Erreur récupération stake info :", err);
    }
  }

  /** Récupérer historique slashing */
  async function fetchSlashingHistory() {
    try {
      const events = await blockchain.getSlashingEvents(address);
      setSlashingHistory(events);
    } catch (err) {
      console.error("Erreur récupération slashing history :", err);
    }
  }

  /** Vérifier livraison active (backend) */
  async function checkActiveDelivery() {
    try {
      const active = await api.getActiveDelivery(address);
      setHasActiveDelivery(!!active);
    } catch (err) {
      console.error("Erreur récupération livraison active :", err);
    }
  }

  /** Effectuer staking */
  /** Effectuer staking */
async function handleStake() {
  if (!address) {
    setError("Adresse wallet requise.");
    return;
  }

  let amount = parseFloat(stakeInput);

  // Si montant invalide ou 0, utiliser 0.1 par défaut
  if (isNaN(amount) || amount <= 0) {
    amount = 0.1;
    setStakeInput("0.1");
  }

  if (amount < 0.1) {
    setError("Montant minimum : 0.1 MATIC");
    return;
  }

  setLoading(true);
  setError(null);

  try {
    const { txHash } = await blockchain.stake(amount);
    console.log("Transaction staking :", txHash);

    await new Promise((resolve) => setTimeout(resolve, 3000));

    await fetchStakingInfo();
    alert(`Staking réussi ! ${amount} MATIC stakés.`);
    setStakeInput("0.1"); // Reset input
  } catch (err) {
    setError(`Erreur staking : ${err.message}`);
  } finally {
    setLoading(false);
  }
}

  /** Retirer staking */
  async function handleUnstake() {
    if (hasActiveDelivery) {
      setError("Impossible de retirer le staking pendant une livraison active.");
      return;
    }

    if (!confirm("Êtes-vous sûr de vouloir retirer votre staking ?")) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { txHash, amount } = await blockchain.unstake();
      console.log("Transaction unstaking :", txHash);

      await new Promise((resolve) => setTimeout(resolve, 3000));

      await fetchStakingInfo();
      alert(`Unstaking réussi ! ${amount} MATIC retirés.`);
    } catch (err) {
      setError(`Erreur unstaking : ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  /** Total slashing */
  const totalSlashed = slashingHistory.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="staking-panel card">
      <h2>Gestion du Staking</h2>

      {/* Statut staking */}
      <div className="staking-status">
        {isStaked ? (
          <div className="status-badge status-staked">
            ✅ Staké : {stakedAmount} MATIC
          </div>
        ) : (
          <div className="status-badge status-not-staked">❌ Non staké</div>
        )}
      </div>

      {/* Input staking */}
      <div className="stake-input">
        <label>Montant à staker (minimum 0.1 MATIC)</label>
        <input
            type="number"
            value={stakeInput}
            onChange={(e) => {
              const val = e.target.value;
              setStakeInput(val);
              if (parseFloat(val) < 0.1 && parseFloat(val) !== 0) {
                setError("Montant minimum : 0.1 MATIC");
              } else {
                setError(null);
              }
            }}
            min="0.1"
            step="0.1"
            placeholder="0.1"
          />
        <button onClick={handleStake} disabled={loading || isStaked}>
          {loading ? "En cours..." : `Stake ${parseFloat(stakeInput) > 0 ? stakeInput : "0.1"} POL`}
        </button>
      </div>

      {/* Bouton unstake */}
      {isStaked && (
        <button
          onClick={handleUnstake}
          disabled={loading || hasActiveDelivery}
          className="btn-danger"
        >
          {hasActiveDelivery
            ? "Livraison active"
            : loading
            ? "En cours..."
            : "Unstake"}
        </button>
      )}

      {/* Historique slashing */}
      {slashingHistory.length > 0 && (
        <div className="slashing-history">
          <h3>Historique Slashing</h3>

          <p>Total slashé : {totalSlashed} MATIC</p>

          {totalSlashed > 0.5 && (
            <div className="warning">
              ⚠️ Attention : vous avez été slashé plusieurs fois !
            </div>
          )}

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Raison</th>
                <th>Montant</th>
                <th>Transaction</th>
              </tr>
            </thead>

            <tbody>
              {slashingHistory.map((event, i) => (
                <tr key={i}>
                  <td>
                    {new Date(event.timestamp * 1000).toLocaleDateString()}
                  </td>
                  <td>{event.reason}</td>
                  <td>{event.amount} MATIC</td>
                  <td>
                    <a
                      href={`https://mumbai.polygonscan.com/tx/${event.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Voir
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Erreurs */}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default StakingPanel;
