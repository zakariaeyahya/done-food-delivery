import React, { useState, useMemo } from 'react';
import Cart from '../components/Cart';
import Checkout from '../components/Checkout';

// Placeholder data - in a real app, this would come from a global state (like Context or Redux)
const INITIAL_CART_ITEMS = [
  { id: 'menu1', name: 'Margherita Pizza', priceEUR: 12.50, priceMATIC: 14.7, quantity: 2 },
  { id: 'menu2', name: 'Spaghetti Carbonara', priceEUR: 15.00, priceMATIC: 17.6, quantity: 1 },
  { id: 'menu3', name: 'Tiramisu', priceEUR: 7.50, priceMATIC: 8.8, quantity: 1 },
];

const DELIVERY_FEE_EUR = 5.00;
const PLATFORM_COMMISSION_RATE = 0.10;

const CheckoutPage = () => {
  const cartItems = useCart(); t
  const dispatch = useCartDispatch();

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      // If quantity drops to 0 or less, remove the item
      handleRemoveItem(itemId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const handleRemoveItem = (itemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };
  
  const handleCheckout = () => {
    alert('Proceeding to payment!');
    // This function would typically navigate the user or trigger the next step in the flow
  };

  // Calculations to pass to both Cart and Checkout
  const foodTotal = useMemo(() => 
    cartItems.reduce((total, item) => 
      total + item.priceEUR * item.quantity, 0
    ), [cartItems]
  );
  const handlePlaceOrder = async () => {
    try {
      // 1. Convertir prix EUR → MATIC
      const conversionResponse = await convertCurrency({
        amount: finalTotalEUR,
        from: 'EUR',
        to: 'MATIC'
      });
      
      // 2. Créer commande dans backend
      const orderResponse = await createOrder({
        restaurantId: cartItems[0].restaurantId,
        items: cartItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.priceEUR
        })),
        deliveryAddress,
        clientAddress: walletAddress,
        totalAmount: conversionResponse.data.convertedAmount
      });

      // 3. Transaction blockchain
      const tx = await createOnChainOrder(
        orderResponse.data.orderId,
        restaurantAddress,
        delivererAddress,
        conversionResponse.data.convertedAmount
      );
      
      await tx.wait();
      
      // 4. Vider panier
      dispatch({ type: 'CLEAR_CART' });
      
      // 5. Rediriger vers tracking
      navigate(`/tracking/${orderResponse.data.orderId}`);
      
    } catch (error) {
      console.error('Order failed:', error);
    }
  };
  const platformCommission = useMemo(() => foodTotal * PLATFORM_COMMISSION_RATE, [foodTotal]);
  const finalTotalEUR = useMemo(() => foodTotal + DELIVERY_FEE_EUR + platformCommission, [foodTotal, platformCommission]);
  
  // This is a placeholder. In a real app, you would get this from an oracle or API.
  const EUR_TO_MATIC_RATE = 1.18; 
  const finalTotalMATIC = useMemo(() => finalTotalEUR / EUR_TO_MATIC_RATE, [finalTotalEUR]);


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
            deliveryFee={DELIVERY_FEE_EUR}
            commission={platformCommission}
            finalTotal={finalTotalEUR}
            finalTotalMATIC={finalTotalMATIC}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;