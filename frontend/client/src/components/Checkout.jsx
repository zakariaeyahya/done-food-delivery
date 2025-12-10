import React, { useState, useRef } from 'react';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import { createOnChainOrder } from '../services/blockchain';
import { createOrder as createApiOrder } from '../services/api';
import { formatPriceInMATIC } from '../utils/formatters';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const LIBRARIES = ['places'];

const Checkout = ({ cartItems, foodTotal, deliveryFee, commission, finalTotal }) => {
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [txStatus, setTxStatus] = useState('idle'); // idle, pending, confirmed, error
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  const autocompleteRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      setDeliveryAddress(place.formatted_address);
    }
  };

  const handlePlaceOrder = async () => {
    if (!deliveryAddress) {
      setError('Please enter a delivery address.');
      return;
    }
    
    try {
      setError('');
      setTxStatus('pending');

      // 1. Create an order in your backend to get an order ID
      const orderPayload = {
        items: cartItems,
        total: finalTotal,
        address: deliveryAddress,
        // ... other relevant data
      };
      const apiResponse = await createApiOrder(orderPayload);
      const { orderId } = apiResponse.data; // Assuming your API returns an orderId

      // 2. Trigger the on-chain transaction with the orderId
      const tx = await createOnChainOrder(
        orderId,
        'RESTAURANT_WALLET_ADDRESS', // Placeholder
        'DELIVERER_WALLET_ADDRESS',  // Placeholder
        finalTotal.toString()
      );
      
      setTxHash(tx.hash);
      await tx.wait(); // Wait for the transaction to be mined

      setTxStatus('confirmed');
    } catch (err) {
      console.error('Order placement failed:', err);
      setError('An error occurred during the transaction. Please try again.');
      setTxStatus('error');
    }
  };

  const renderOrderSummary = () => (
    <div className="p-4 mb-6 bg-gray-50 rounded-lg">
      <h3 className="mb-2 text-lg font-semibold">Order Summary</h3>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between"><span>Food Total:</span> <span>{formatPriceInMATIC(foodTotal)}</span></div>
        <div className="flex justify-between"><span>Delivery Fee:</span> <span>{formatPriceInMATIC(deliveryFee)}</span></div>
        <div className="flex justify-between"><span>Platform Commission:</span> <span>{formatPriceInMATIC(commission)}</span></div>
        <div className="flex justify-between pt-2 mt-2 text-base font-bold border-t"><span>Final Total:</span> <span>{formatPriceInMATIC(finalTotal)}</span></div>
      </div>
    </div>
  );

  const renderTransactionStatus = () => {
    switch (txStatus) {
      case 'pending':
        return <div className="p-3 mt-4 text-center text-blue-800 bg-blue-100 rounded">Transaction is pending...</div>;
      case 'confirmed':
        return <div className="p-3 mt-4 text-center text-green-800 bg-green-100 rounded">Order Confirmed! <a href={`https://mumbai.polygonscan.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="underline">View Transaction</a></div>;
      case 'error':
        return <div className="p-3 mt-4 text-center text-red-800 bg-red-100 rounded">Error: {error}</div>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 mx-auto bg-white border rounded-lg shadow-xl max-w-lg">
      <h2 className="mb-6 text-2xl font-bold">Checkout</h2>
      {renderOrderSummary()}

      <div className="mb-4">
        <label htmlFor="address" className="block mb-2 font-semibold">Delivery Address</label>
        {loadError && <p>Error loading Google Maps</p>}
        {isLoaded && (
          <Autocomplete
            onLoad={(ref) => (autocompleteRef.current = ref)}
            onPlaceChanged={handlePlaceChanged}
          >
            <input
              type="text"
              id="address"
              placeholder="Start typing your address..."
              className="w-full p-2 border rounded"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
            />
          </Autocomplete>
        )}
      </div>

      {error && !txStatus === 'error' && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {renderTransactionStatus()}

      {txStatus !== 'confirmed' && (
        <button
          onClick={handlePlaceOrder}
          disabled={txStatus === 'pending' || !isLoaded}
          className="w-full px-4 py-2 mt-4 font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
        >
          {txStatus === 'pending' ? 'Processing...' : 'Place Order & Pay with MetaMask'}
        </button>
      )}
    </div>
  );
};

export default Checkout;