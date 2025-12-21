import { useState, useEffect } from "react";
import blockchain from "../services/blockchain";
import api from "../services/api";
import "./StakingPanel.css";

function StakingPanel({ address }) {
  const [stakedAmount, setStakedAmount] = useState(0);
  const [isStaked, setIsStaked] = useState(false);
  const [stakeInput, setStakeInput] = useState("0.1");
  const [hasActiveDelivery, setHasActiveDelivery] = useState(false);
  const [slashingHistory, setSlashingHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (address) {
      fetchStakingInfo();
      fetchSlashingHistory();
      checkActiveDelivery();
    }
  }, [address]);

  async function fetchStakingInfo() {
    try {
      // 1. D'abord, vérifier localStorage (MVP Mode)
      const localStake = localStorage.getItem(`staked_${address}`);
      if (localStake) {
        const amount = parseFloat(localStake);
        setStakedAmount(amount);
        setIsStaked(true);
        return;
      }
  
      // 2. Sinon, vérifier blockchain (si disponible)
      const stakeInfo = await blockchain.getStakeInfo(address);
      setStakedAmount(stakeInfo.amount);
      setIsStaked(stakeInfo.isStaked);
      
      if (stakeInfo.isStaked && stakeInfo.amount > 0) {
        localStorage.setItem(`staked_${address}`, stakeInfo.amount.toString());
      }
    } catch (err) {
    }
  }

  async function fetchSlashingHistory() {
    try {
      const events = await blockchain.getSlashingEvents(address);
      setSlashingHistory(events);
    } catch (err) {
    }
  }

  async function checkActiveDelivery() {
    try {
      const active = await api.getActiveDelivery(address);
      setHasActiveDelivery(!!active);
    } catch (err) {
    }
  }

  async function handleStake() {
    if (!address) {
      setError("Adresse wallet requise.");
      return;
    }

    let amount = parseFloat(stakeInput);

    if (isNaN(amount) || amount <= 0) {
      amount = 0.1;
      setStakeInput("0.1");
    }

    if (amount < 0.1) {
      setError("Montant minimum : 0.1 POL");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      
      await new Promise(resolve => setTimeout(resolve, 2000));

      setStakedAmount(amount);
      setIsStaked(true);
      setSuccess(`Staking réussi ! Vous avez staké ${amount} POL.`);
      setStakeInput("0.1");
      
      localStorage.setItem(`staked_${address}`, amount.toString());
    } catch (err) {
      setError(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

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
    setSuccess(null);

    try {
      
      await new Promise(resolve => setTimeout(resolve, 2000));

      const amount = stakedAmount;
      setStakedAmount(0);
      setIsStaked(false);
      setSuccess(`Unstaking réussi ! ${amount} POL retirés.`);
      
      localStorage.removeItem(`staked_${address}`);
    } catch (err) {
      setError(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  const totalSlashed = slashingHistory.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="staking-card">
      <div className="card-header">
        <h2>Gestion du Staking</h2>
      </div>

      <div className="staking-status">
        {isStaked ? (
          <div className="status-badge success">
            <span className="icon"></span>
            <div className="status-info">
              <span className="label">Staké</span>
              <span className="amount">{stakedAmount} POL</span>
            </div>
          </div>
        ) : (
          <div className="status-badge inactive">
            <span className="icon"></span>
            <div className="status-info">
              <span className="label">Non staké</span>
              <span className="amount">0 POL</span>
            </div>
          </div>
        )}
      </div>

      {!isStaked && (
        <div className="stake-form">
          <label>Montant à staker</label>
          <div className="input-group">
            <input
              type="number"
              value={stakeInput}
              onChange={(e) => {
                const val = e.target.value;
                setStakeInput(val);
                if (parseFloat(val) < 0.1 && parseFloat(val) !== 0) {
                  setError("Montant minimum : 0.1 POL");
                } else {
                  setError(null);
                }
              }}
              min="0.1"
              step="0.1"
              placeholder="0.1"
              disabled={loading}
            />
            <span className="input-suffix">POL</span>
          </div>
          <p className="hint">Minimum: 0.1 POL</p>
          
          <button 
            className="btn-primary" 
            onClick={handleStake} 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Staking en cours...
              </>
            ) : (
              `Stake ${parseFloat(stakeInput) > 0 ? stakeInput : "0.1"} POL`
            )}
          </button>
        </div>
      )}

      {isStaked && (
        <div className="unstake-section">
          <button
            className="btn-danger"
            onClick={handleUnstake}
            disabled={loading || hasActiveDelivery}
          >
            {hasActiveDelivery ? (
              "Livraison active"
            ) : loading ? (
              <>
                <span className="spinner"></span>
                Unstaking...
              </>
            ) : (
              "Retirer mon staking"
            )}
          </button>
        </div>
      )}

      {success && (
        <div className="alert success">
          <span className="icon"></span>
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="alert error">
          <span className="icon"></span>
          <span>{error}</span>
        </div>
      )}

      {slashingHistory.length > 0 && (
        <div className="slashing-section">
          <h3>Historique Slashing</h3>
          <div className="slashing-total">
            Total slashé: <strong>{totalSlashed.toFixed(3)} POL</strong>
          </div>

          {totalSlashed > 0.5 && (
            <div className="alert warning">
              <span className="icon"></span>
              <span>Attention: vous avez été slashé plusieurs fois!</span>
            </div>
          )}

          <div className="slashing-list">
            {slashingHistory.map((event, i) => (
              <div key={i} className="slashing-item">
                <div className="slashing-info">
                  <span className="reason">{event.reason}</span>
                  <span className="date">
                    {new Date(event.timestamp * 1000).toLocaleDateString()}
                  </span>
                </div>
                <div className="slashing-amount">-{event.amount} POL</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default StakingPanel;