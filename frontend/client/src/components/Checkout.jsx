import React, { useState, useRef } from 'react';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import { createOrder as createApiOrder } from '../services/api';
import { formatPriceInMATIC } from '../utils/formatters';
import { useWallet } from '../contexts/WalletContext';
import { useCart } from '../contexts/CartContext';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const LIBRARIES = ['places'];

const Checkout = ({ cartItems, foodTotal, deliveryFee, commission, finalTotal }) => {
  const { address: clientAddress } = useWallet();
  const cart = useCart();
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [txStatus, setTxStatus] = useState('idle');
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
      setError('Veuillez saisir votre adresse de livraison.');
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

    const restaurantId = cart.restaurantId;
    const restaurantAddress = cart.restaurantAddress;

    if (!restaurantId && !restaurantAddress) {
      setError('Impossible de déterminer le restaurant. Veuillez réessayer.');
      return;
    }

    try {
      setError('');
      setTxStatus('pending');

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

      if (restaurantId) {
        orderPayload.restaurantId = restaurantId;
      }
      if (restaurantAddress) {
        orderPayload.restaurantAddress = restaurantAddress;
      }

      const apiResponse = await createApiOrder(orderPayload, clientAddress);
      const orderId = apiResponse.data.order?.orderId || apiResponse.data.orderId;

      if (!orderId) {
        throw new Error('OrderId non reçu du backend');
      }

      const txHashFromBackend = apiResponse.data.order?.txHash;

      if (txHashFromBackend) {
        setTxHash(txHashFromBackend);
      }
      setTxStatus('confirmed');
    } catch (err) {
      let errorMessage = 'Une erreur est survenue lors de la création de la commande.';

      if (err.response?.data) {
        const backendMessage = err.response.data.message || err.response.data.error;
        if (backendMessage) {
          errorMessage = backendMessage;
        }
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

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Paiement</h2>
            <p className="text-white/80 text-sm">Finalisez votre commande</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Order Summary */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Récapitulatif
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Sous-total</span>
              <span className="font-medium">{formatPriceInMATIC(foodTotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Frais de livraison</span>
              <span className="font-medium">{formatPriceInMATIC(deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Commission plateforme</span>
              <span className="font-medium">{formatPriceInMATIC(commission)}</span>
            </div>
            <div className="flex justify-between pt-3 mt-3 border-t border-gray-200">
              <span className="text-base font-bold text-gray-800">Total à payer</span>
              <span className="text-base font-bold text-purple-500">{formatPriceInMATIC(finalTotal)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="mb-6">
          <label className="block font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Adresse de livraison
          </label>

          {loadError && (
            <div className="p-4 mb-3 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="font-semibold text-yellow-800">Google Maps ne peut pas se charger</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Veuillez désactiver votre bloqueur de publicités ou saisir votre adresse manuellement.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isLoaded ? (
            <Autocomplete
              onLoad={(ref) => (autocompleteRef.current = ref)}
              onPlaceChanged={handlePlaceChanged}
            >
              <input
                type="text"
                placeholder="Entrez votre adresse de livraison..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
              />
            </Autocomplete>
          ) : !loadError ? (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-gray-500 text-sm">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-purple-500 rounded-full animate-spin" />
              Chargement de Google Maps...
            </div>
          ) : (
            <input
              type="text"
              placeholder="Saisissez votre adresse manuellement..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
            />
          )}
        </div>

        {/* Error Message */}
        {error && txStatus !== 'error' && (
          <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Transaction Status */}
        {txStatus === 'pending' && (
          <div className="p-4 mb-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-blue-700 font-medium">Transaction en cours...</p>
            </div>
          </div>
        )}

        {txStatus === 'confirmed' && (
          <div className="p-4 mb-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-green-800">Commande confirmée !</p>
                {txHash && (
                  <a
                    href={`https://amoy.polygonscan.com/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-green-600 hover:text-green-700 underline flex items-center gap-1 mt-1"
                  >
                    Voir la transaction
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {txStatus === 'error' && (
          <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-red-800">Erreur</p>
                <p className="text-sm text-red-600 mt-1 whitespace-pre-line">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Method */}
        {txStatus !== 'confirmed' && (
          <>
            <div className="mb-6">
              <p className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Mode de paiement
              </p>
              <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xl">Ξ</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">POL (Polygon)</p>
                    <p className="text-sm text-gray-500">Paiement via votre wallet</p>
                  </div>
                  <svg className="w-5 h-5 text-green-500 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={txStatus === 'pending'}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {txStatus === 'pending' ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Traitement en cours...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Confirmer et payer {formatPriceInMATIC(finalTotal)}
                </>
              )}
            </button>

            {/* Security Note */}
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Paiement sécurisé via smart contract
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Checkout;
