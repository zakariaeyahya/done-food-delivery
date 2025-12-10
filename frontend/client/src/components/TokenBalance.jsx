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

      // 1. Tokens user
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

      // 2. Taux conversion
      try {
        const rateResponse = await getTokenRate();
        setRate(rateResponse.data.rate);
      } catch (err) {
        console.error('Failed to fetch token rate:', err);
        // on ne bloque pas toute la page pour ça
      }
    } catch (err) {
      console.error('Failed to fetch token data:', err);
      setError('Failed to load token data.');
    } finally {
      setLoading(false);
    }
  }, [clientAddress]);

  useEffect(() => {
    fetchData();
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
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-2">DONE Token Balance</h2>
      <p className="mb-2">
        <strong>Balance:</strong> {balance} DONE
      </p>
      {rate && (
        <p className="mb-4">
          <strong>1 DONE =</strong> {rate['1 DONE'] ?? JSON.stringify(rate)} EUR
        </p>
      )}

      <h3 className="font-semibold mb-2">Transaction History</h3>
      {history.length === 0 ? (
        <p className="text-gray-500">No token transactions yet.</p>
      ) : (
        <ul className="space-y-1">
          {history.map((tx) => (
            <li key={tx.id} className="text-sm">
              [{formatDateTime(tx.date)}] {tx.reason}: {tx.amount} DONE
            </li>
          ))}
      </ul>
      )}

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