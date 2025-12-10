import React, { useState, useEffect } from 'react';
import { getDoneTokenBalance } from '../services/blockchain';
import { formatDateTime, formatPriceInEUR } from '../utils/formatters';

// Placeholder: In a real app, this would come from an API
const DONE_TO_EUR_RATE = 0.50; 

// Placeholder for API call
const getTokenTransactionHistory = async (address) => {
  console.log(`Fetching token history for ${address}...`);
  // This is where you would make an API call to your backend
  // e.g., return apiClient.get(`/tokens/history/${address}`);
  return [
    { id: 1, type: 'earned', amount: 50, reason: 'First Order Bonus', date: '2023-10-26T10:00:00Z' },
    { id: 2, type: 'spent', amount: -20, reason: 'Discount on Order #123', date: '2023-10-27T14:30:00Z' },
    { id: 3, type: 'earned', amount: 15, reason: 'Restaurant Review', date: '2023-10-28T18:00:00Z' },
  ];
};


/**
 * A component to display DONE token balance and transaction history.
 * @param {object} props - The props object.
 * @param {string} props.clientAddress - The blockchain address of the client.
 */
const TokenBalance = ({ clientAddress }) => {
  const [balance, setBalance] = useState('0');
  const [balanceInEUR, setBalanceInEUR] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!clientAddress) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch balance and history in parallel
        const [tokenBalance, txHistory] = await Promise.all([
          getDoneTokenBalance(clientAddress),
          getTokenTransactionHistory(clientAddress)
        ]);
        
        const balanceNum = parseFloat(tokenBalance);
        setBalance(tokenBalance);
        setBalanceInEUR(balanceNum * DONE_TO_EUR_RATE);
        setHistory(txHistory);

      } catch (err) {
        console.error('Failed to fetch token data:', err);
        setError('Failed to load token balance and history.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clientAddress]);

  if (loading) return <p>Loading token balance...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6 bg-white border rounded-lg shadow-xl">
      <h2 className="mb-4 text-2xl font-bold">Your DONE Tokens</h2>
      
      {/* Balance Display */}
      <div className="p-4 mb-6 text-center bg-blue-50 rounded-lg">
        <p className="text-lg text-gray-600">Total Balance</p>
        <p className="text-4xl font-bold text-blue-600">{parseFloat(balance).toFixed(2)} DONE</p>
        <p className="font-semibold text-gray-500">~ {formatPriceInEUR(balanceInEUR)}</p>
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4 mb-6">
        <button className="px-4 py-2 font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600">Apply Discount</button>
        <button className="px-4 py-2 font-semibold text-white bg-purple-500 rounded-lg hover:bg-purple-600">View Rewards</button>
      </div>

      {/* Transaction History */}
      <div>
        <h3 className="mb-2 text-lg font-semibold">Transaction History</h3>
        <div className="space-y-3">
          {history.map(tx => (
            <div key={tx.id} className="flex justify-between p-3 border rounded-md bg-gray-50">
              <div>
                <p className="font-medium">{tx.reason}</p>
                <p className="text-sm text-gray-500">{formatDateTime(tx.date, 'dd MMM yyyy')}</p>
              </div>
              <p className={`font-semibold ${tx.type === 'earned' ? 'text-green-500' : 'text-red-500'}`}>
                {tx.type === 'earned' ? '+' : ''}{tx.amount} DONE
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TokenBalance;