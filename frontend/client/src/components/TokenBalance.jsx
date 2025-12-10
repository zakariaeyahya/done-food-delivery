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
import { getUserTokens, useTokenDiscount, getTokenRate } from '../services/api';

const TokenBalance = ({ clientAddress }) => {
  const [balance, setBalance] = useState('0');
  const [history, setHistory] = useState([]);
  const [rate, setRate] = useState({});
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Balance + historique depuis backend
        const tokensResponse = await getUserTokens(clientAddress);
        setBalance(tokensResponse.data.balance);
        setHistory(tokensResponse.data.transactions);
        
        // 2. Taux conversion
        const rateResponse = await getTokenRate();
        setRate(rateResponse.data.rate);
        
      } catch (error) {
        console.error('Failed to fetch token data:', error);
      }
    };
    
    if (clientAddress) {
      fetchData();
    }
  }, [clientAddress]);

  const handleUseDiscount = async () => {
    try {
      const response = await useTokenDiscount({
        userAddress: clientAddress,
        tokensToUse: 50,
        orderId: currentOrderId
      });
      
      alert(`Discount applied: ${response.data.discountAmount} EUR`);
      // Rafraîchir balance
      fetchData();
      
    } catch (error) {
      console.error('Failed to use discount:', error);
    }
  };

  return (
    <div>
      <h2>Balance: {balance} DONE</h2>
      <p>1 DONE = {rate['1 DONE']} EUR</p>
      
      {/* Historique */}
      {history.map(tx => (
        <div key={tx.id}>
          <p>{tx.reason}: {tx.amount} DONE</p>
        </div>
      ))}
      
      <button onClick={handleUseDiscount}>
        Apply Discount
      </button>
    </div>
  );
};

export default TokenBalance;