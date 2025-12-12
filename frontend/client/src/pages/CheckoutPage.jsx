import React, { useMemo } from 'react';
import Cart from '../components/Cart';
import Checkout from '../components/Checkout';
import { useWallet } from '../contexts/WalletContext';
import { useCart, useCartActions } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const DELIVERY_FEE_MATIC = 0.001;
const PLATFORM_COMMISSION_RATE = 0.1;

const CheckoutPage = () => {
  const { address, isConnected } = useWallet();
  const cart = useCart();
  const { updateQuantity, removeItem, clearCart } = useCartActions();
  const navigate = useNavigate();

  const cartItems = cart.items || [];

  const foodTotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + (item.price || 0) * (item.quantity || 1),
        0
      ),
    [cartItems]
  );

  const platformCommission = useMemo(
    () => foodTotal * PLATFORM_COMMISSION_RATE,
    [foodTotal]
  );

  const finalTotalMATIC = useMemo(
    () => foodTotal + DELIVERY_FEE_MATIC + platformCommission,
    [foodTotal, platformCommission]
  );

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      await handleRemoveItem(itemId);
    } else {
      await updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = async (itemId) => {
    await removeItem(itemId);
  };

  const handleCheckout = () => {
    console.log('Review checkout clicked');
  };

  // Non connecté
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Connexion requise</h2>
            <p className="text-gray-600 mb-6">
              Connectez votre wallet pour procéder au paiement de votre commande.
            </p>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-left">
              <p className="text-sm text-orange-800">
                <span className="font-semibold">Astuce :</span> Utilisez le bouton "Connecter Wallet" dans le menu de navigation.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Panier vide
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Votre panier est vide</h2>
            <p className="text-gray-600 mb-6">
              Ajoutez des articles depuis nos restaurants pour commencer votre commande.
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Découvrir les restaurants
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="container mx-auto px-4 py-8 relative">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Finaliser la commande</h1>
              <p className="text-white/80 text-sm">{cartItems.length} article{cartItems.length > 1 ? 's' : ''} dans votre panier</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 -mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Colonne gauche : Panier */}
          <div>
            <Cart
              cartItems={cartItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onCheckout={handleCheckout}
            />
          </div>

          {/* Colonne droite : Paiement */}
          <div>
            <Checkout
              cartItems={cartItems}
              foodTotal={foodTotal}
              deliveryFee={DELIVERY_FEE_MATIC}
              commission={platformCommission}
              finalTotal={finalTotalMATIC}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
