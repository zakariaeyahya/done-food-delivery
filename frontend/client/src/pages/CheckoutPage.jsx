// src/pages/CheckoutPage.jsx
import React, { useMemo } from 'react';
import Cart from '../components/Cart';
import Checkout from '../components/Checkout';
import { useWallet } from '../contexts/WalletContext';
import { useCart, useCartActions } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
// import { convertCurrency, createOrder } from '../services/api';
// import { createOnChainOrder } from '../services/blockchain';

const DELIVERY_FEE_MATIC = 0.001;
const PLATFORM_COMMISSION_RATE = 0.1;

// ✅ Tous les hooks DOIVENT être à l'intérieur du composant
const CheckoutPage = () => {
  const { address, isConnected } = useWallet();
  const cart = useCart();
  const { updateQuantity, removeItem, clearCart } = useCartActions();
  const navigate = useNavigate();

  // Extract items from cart object
  const cartItems = cart.items || [];

  // Si pas connecté → on bloque la page
  if (!isConnected) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h2 className="text-2xl font-semibold mb-2">
          Please connect your wallet to proceed to checkout
        </h2>
        <p className="text-gray-500">
          You need to connect your wallet before placing an order.
        </p>
      </div>
    );
  }

  // Si panier vide
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => navigate('/')}
        >
          Back to restaurants
        </button>
      </div>
    );
  }

  /** Handlers **/

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
    // Ici tu peux ouvrir un modal de confirmation ou scroller sur le résumé
    console.log('Review checkout clicked');
  };

  // TODO: branche cette fonction à ton bouton "Place Order" dans <Checkout />
  const handlePlaceOrder = async () => {
    alert('Place order logic not implemented yet');
    // Exemple de squelette si tu veux l’implémenter plus tard :
    //
    // if (!isConnected) {
    //   alert('Please connect wallet first');
    //   return;
    // }
    //
    // try {
    //   const conversionResponse = await convertCurrency({
    //     amount: finalTotalEUR,
    //     from: 'EUR',
    //     to: 'MATIC',
    //   });
    //
    //   const orderResponse = await createOrder({
    //     clientAddress: address,
    //     restaurantId: cartItems[0].restaurantId,
    //     items: cartItems.map((item) => ({
    //       name: item.name,
    //       quantity: item.quantity,
    //       price: item.priceEUR,
    //     })),
    //     deliveryAddress,
    //     totalAmount: conversionResponse.data.convertedAmount,
    //   });
    //
    //   const tx = await createOnChainOrder(
    //     orderResponse.data.orderId,
    //     restaurantAddress,
    //     delivererAddress,
    //     conversionResponse.data.convertedAmount
    //   );
    //
    //   await tx.wait();
    //   dispatch({ type: 'CLEAR_CART' });
    //   navigate(`/tracking/${orderResponse.data.orderId}`);
    // } catch (error) {
    //   console.error('Order failed:', error);
    // }
  };

  /** Calculs totaux (all in MATIC) **/

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

  return (
    <div className="container mx-auto p-4 sm:p-8">
      <h1 className="text-3xl font-bold text-center mb-8">Review Your Order</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Cart Details */}
        <div>
          <Cart
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onCheckout={handleCheckout}
          />
        </div>

        {/* Right Column: Checkout and Payment */}
        <div>
          <Checkout
            cartItems={cartItems}
            foodTotal={foodTotal}
            deliveryFee={DELIVERY_FEE_MATIC}
            commission={platformCommission}
            finalTotal={finalTotalMATIC}
            onPlaceOrder={handlePlaceOrder}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
