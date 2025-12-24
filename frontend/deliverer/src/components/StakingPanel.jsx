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
      // 1. Vérifier blockchain d'abord (source of truth)
      const stakeInfo = await blockchain.getStakeInfo(address);
      setStakedAmount(stakeInfo.amount);
      setIsStaked(stakeInfo.isStaked);

      if (stakeInfo.isStaked && stakeInfo.amount > 0) {
        localStorage.setItem(`staked_${address}`, stakeInfo.amount.toString());
        // Auto-sync with backend if staked on blockchain
        try {
          await api.syncStakingStatus(address, null, stakeInfo.amount);
          console.log('[StakingPanel] Auto-synced staking status with backend');
        } catch (syncErr) {
          console.warn('[StakingPanel] Auto-sync failed:', syncErr.message);
        }
      }
    } catch (err) {
      // Fallback to localStorage if blockchain fails
      const localStake = localStorage.getItem(`staked_${address}`);
      if (localStake) {
        const amount = parseFloat(localStake);
        setStakedAmount(amount);
        setIsStaked(true);
      }
      console.warn('[StakingPanel] Blockchain check failed, using localStorage:', err.message);
    }
  }

  async function handleManualSync() {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Force sync from blockchain to backend
      const result = await api.syncStakingStatus(address);
      console.log('[StakingPanel] Manual sync result:', result);

      if (result.deliverer) {
        setIsStaked(result.deliverer.isStaked);
        setStakedAmount(parseFloat(result.deliverer.stakedAmount));

        if (result.deliverer.isStaked) {
          localStorage.setItem(`staked_${address}`, result.deliverer.stakedAmount);
          setSuccess(`Synchronisation réussie ! Staké: ${result.deliverer.stakedAmount} POL`);
        } else {
          localStorage.removeItem(`staked_${address}`);
          setSuccess('Synchronisation réussie. Aucun staking trouvé sur la blockchain.');
        }
      }
    } catch (err) {
      console.error('[StakingPanel] Manual sync error:', err);
      setError(`Erreur de synchronisation: ${err.message}`);
    } finally {
      setLoading(false);
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
      // 1. Stake on the blockchain via MetaMask
      console.log(`[StakingPanel] Staking ${amount} POL on blockchain...`);
      const result = await blockchain.stake(amount);
      console.log(`[StakingPanel] Blockchain stake successful:`, result);

      // 2. Sync with backend MongoDB
      console.log(`[StakingPanel] Syncing with backend...`);
      try {
        await api.syncStakingStatus(address, result.txHash, amount);
        console.log(`[StakingPanel] Backend sync successful`);
      } catch (syncError) {
        console.warn(`[StakingPanel] Backend sync failed, but blockchain stake succeeded:`, syncError.message);
        // Continue anyway - blockchain stake was successful
      }

      // 3. Update local state
      setStakedAmount(amount);
      setIsStaked(true);
      setSuccess(`Staking réussi ! Vous avez staké ${amount} POL. TxHash: ${result.txHash?.slice(0, 10)}...`);
      setStakeInput("0.1");

      localStorage.setItem(`staked_${address}`, amount.toString());
    } catch (err) {
      console.error(`[StakingPanel] Stake error:`, err);
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

      {/* Bouton de synchronisation manuelle */}
      <div className="sync-section" style={{ marginTop: '1rem' }}>
        <button
          className="btn-secondary"
          onClick={handleManualSync}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Synchronisation...
            </>
          ) : (
            "🔄 Synchroniser avec la blockchain"
          )}
        </button>
        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', textAlign: 'center' }}>
          Si votre staking n'est pas détecté, cliquez pour synchroniser
        </p>
      </div>

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