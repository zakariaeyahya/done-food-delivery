import React, { useState, useRef } from 'react';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import { createOnChainOrder } from '../services/blockchain';
import { createOrder as createApiOrder } from '../services/api';
import { formatPriceInMATIC } from '../utils/formatters';
import { useWallet } from '../contexts/WalletContext';
import { useCart } from '../contexts/CartContext';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const LIBRARIES = ['places'];

const Checkout = ({ cartItems, foodTotal, deliveryFee, commission, finalTotal }) => {
  const { address: clientAddress } = useWallet();
  const cart = useCart(); // Récupérer le contexte du panier pour avoir restaurantId
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
      setError('Veuillez saisir votre adresse de livraison (où vous souhaitez recevoir la commande).');
      return;
    }

    if (!clientAddress) {
      setError('Veuillez connecter votre wallet.');
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      setError('Votre panier est vide.');
      return;
    }

    // Récupérer restaurantId et restaurantAddress depuis le contexte du panier
    const restaurantId = cart.restaurantId;
    const restaurantAddress = cart.restaurantAddress;
    
    // Si restaurantId n'est pas disponible mais restaurantAddress l'est, on peut quand même créer la commande
    if (!restaurantId && !restaurantAddress) {
      console.error('[Checkout] RestaurantId et restaurantAddress manquants dans le panier:', cart);
      setError('Impossible de déterminer le restaurant. Veuillez réessayer en ajoutant des articles au panier.');
      return;
    }
    
    try {
      setError('');
      setTxStatus('pending');

      // 1. Créer la commande dans le backend pour obtenir un orderId
      const orderPayload = {
        items: cartItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image || null
        })),
        deliveryAddress: deliveryAddress,
        clientAddress: clientAddress,
        deliveryFee: deliveryFee
      };
      
      // Ajouter restaurantId ou restaurantAddress selon ce qui est disponible
      if (restaurantId) {
        orderPayload.restaurantId = restaurantId;
      }
      if (restaurantAddress) {
        orderPayload.restaurantAddress = restaurantAddress;
      }
      
      console.log('[Checkout] Order payload:', orderPayload);

      const apiResponse = await createApiOrder(orderPayload, clientAddress);
      
      // Le backend retourne { success: true, order: { orderId, txHash, ... } }
      const orderId = apiResponse.data.order?.orderId || apiResponse.data.orderId;
      
      if (!orderId) {
        throw new Error('OrderId non reçu du backend');
      }

      // 2. La transaction blockchain est déjà créée par le backend
      // On peut juste afficher le hash de transaction
      const txHashFromBackend = apiResponse.data.order?.txHash;
      
      if (txHashFromBackend) {
        setTxHash(txHashFromBackend);
        setTxStatus('confirmed');
      } else {
        // Si pas de txHash, on considère que c'est quand même créé
        setTxStatus('confirmed');
      }
    } catch (err) {
      console.error('Erreur lors de la création de la commande:', err);
      console.error('Détails de l\'erreur:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      // Afficher le contenu complet de la réponse pour debug
      if (err.response?.data) {
        console.error('Réponse complète du backend:', JSON.stringify(err.response.data, null, 2));
      }
      
      // Afficher un message d'erreur plus détaillé
      let errorMessage = 'Une erreur est survenue lors de la création de la commande.';
      
      if (err.response?.data) {
        // Afficher le message d'erreur du backend
        const backendMessage = err.response.data.message || err.response.data.error;
        if (backendMessage) {
          errorMessage = backendMessage;
        }
        // Ajouter les détails si disponibles
        if (err.response.data.details) {
          errorMessage += `\n\nDétails: ${err.response.data.details}`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
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
        <label htmlFor="address" className="block mb-2 font-semibold">Adresse de livraison (votre adresse)</label>
        {loadError && (
          <div className="p-3 mb-2 text-sm text-yellow-800 bg-yellow-100 rounded">
            <p className="font-semibold">⚠️ Google Maps ne peut pas se charger</p>
            <p className="mt-1">
              Cela peut être dû à un bloqueur de publicités. Veuillez désactiver temporairement 
              votre bloqueur de publicités ou saisir votre adresse manuellement ci-dessous.
            </p>
          </div>
        )}
        {isLoaded ? (
          <Autocomplete
            onLoad={(ref) => (autocompleteRef.current = ref)}
            onPlaceChanged={handlePlaceChanged}
          >
            <input
              type="text"
              id="address"
              placeholder="Commencez à taper votre adresse..."
              className="w-full p-2 border rounded"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
            />
          </Autocomplete>
        ) : !loadError ? (
          <div className="p-2 text-sm text-gray-500 bg-gray-50 rounded">
            Chargement de Google Maps...
          </div>
        ) : (
          <input
            type="text"
            id="address"
            placeholder="Saisissez votre adresse manuellement..."
            className="w-full p-2 border rounded"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
          />
        )}
      </div>

      {error && txStatus !== 'error' && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {renderTransactionStatus()}

      {txStatus !== 'confirmed' && (
        <button
          onClick={handlePlaceOrder}
          disabled={txStatus === 'pending'}
          className="w-full px-4 py-2 mt-4 font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
        >
          {txStatus === 'pending' ? 'Traitement en cours...' : 'Passer la commande'}
        </button>
      )}
    </div>
  );
};

export default Checkout;