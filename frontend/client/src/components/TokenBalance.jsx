// src/components/TokenBalance.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { formatDateTime } from '../utils/formatters';
import { getUserTokens, useTokenDiscount, getTokenRate } from '../services/api';

/**
 * @param {object} props
 * @param {string} props.clientAddress
 * @param {string} [props.currentOrderId] - optionnel, si tu veux appliquer un discount sur une commande précise
 */
const TokenBalance = ({ clientAddress, currentOrderId }) => {
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [rate, setRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


const fetchData = useCallback(async () => {
  if (!clientAddress) return;

  try {
    setLoading(true);
    setError('');

    try {
      const tokensResponse = await getUserTokens(clientAddress);
      setBalance(tokensResponse.data.balance ?? 0);
      setHistory(tokensResponse.data.transactions ?? []);
    } catch (err) {
      if (err.response?.status === 404) {
        setBalance(0);
        setHistory([]);
      } else {
        throw err;
      }
    }

    try {
      const rateResponse = await getTokenRate();
      setRate(rateResponse.data.rate);
    } catch (err) {
      console.error('Token rate fetch failed:', err);
    }
  } catch (err) {
    console.error('Token data fetch failed:', err);
    setError('Failed to load token data.');
  } finally {
    setLoading(false);
  }
}, [clientAddress]);

  useEffect(() => {
    fetchData();
    
    // Écouter l'événement de mise à jour des tokens (après confirmation de livraison)
    const handleTokensUpdated = (event) => {
      console.log('[TokenBalance] Tokens mis à jour:', event.detail);
      // Rafraîchir les données après un court délai pour laisser le temps à la blockchain
      setTimeout(() => {
        fetchData();
      }, 2000);
    };
    
    window.addEventListener('tokensUpdated', handleTokensUpdated);
    
    return () => {
      window.removeEventListener('tokensUpdated', handleTokensUpdated);
    };
  }, [fetchData]);

  const handleUseDiscount = async () => {
    if (!clientAddress) {
      alert('No client address provided');
      return;
    }

    if (!currentOrderId) {
      alert('No current order to apply discount on');
      return;
    }

    try {
      const response = await useTokenDiscount({
        userAddress: clientAddress,
        tokensToUse: 50,
        orderId: currentOrderId,
      });

      alert(`Discount applied: ${response.data.discountAmount} EUR`);
      fetchData();
    } catch (error) {
      console.error('Failed to use discount:', error);
      alert('Failed to apply discount');
    }
  };

  if (!clientAddress) {
    return <p className="text-red-500">Invalid client address</p>;
  }

  if (loading) return <p>Loading token balance...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Tokens DONE</h2>
        <button
          onClick={fetchData}
          disabled={loading}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
          title="Rafraîchir le solde"
        >
          <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 mb-4 border border-purple-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🎁</span>
          </div>
          <div>
            <p className="text-sm text-gray-600">Votre solde</p>
            <p className="text-3xl font-bold text-gray-800">
              {loading ? '...' : `${parseFloat(balance || 0).toFixed(2)} DONE`}
            </p>
          </div>
        </div>
        {rate && (
          <p className="text-sm text-gray-600 mt-2">
            <strong>1 DONE =</strong> {rate['1 DONE'] ?? JSON.stringify(rate)} EUR de réduction
          </p>
        )}
        <div className="mt-4 pt-4 border-t border-purple-200">
          <p className="text-xs text-gray-500">
            💡 <strong>Comment gagner des tokens ?</strong><br />
            Vous recevez <strong>1 DONE pour chaque 10 POL</strong> dépensés lors de la confirmation de livraison.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Historique des transactions
        </h3>
        {history.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-500 text-sm">Aucune transaction de tokens pour le moment.</p>
            <p className="text-gray-400 text-xs mt-1">Les tokens apparaîtront ici après confirmation de livraison.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{tx.reason || 'Récompense'}</p>
                  <p className="text-xs text-gray-500">{formatDateTime(tx.date)}</p>
                </div>
                <div className={`text-sm font-bold ${parseFloat(tx.amount) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {parseFloat(tx.amount) > 0 ? '+' : ''}{parseFloat(tx.amount).toFixed(2)} DONE
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {currentOrderId && (
        <button
          onClick={handleUseDiscount}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Apply 50 DONE discount on current order
        </button>
      )}
    </div>
  );
};

export default TokenBalance;