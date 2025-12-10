import React, { useMemo } from 'react';
import { formatPriceInEUR, formatPriceInMATIC } from '../utils/formatters';

const DELIVERY_FEE_EUR = 5.00;
const PLATFORM_COMMISSION_RATE = 0.10; // 10%

/**
 * A component to display the user's shopping cart.
 * @param {object} props - The props object.
 * @param {Array<object>} props.cartItems - The items in the cart. e.g., [{ id, name, priceEUR, priceMATIC, quantity }]
 * @param {Function} props.onUpdateQuantity - Function to update an item's quantity.
 * @param {Function} props.onRemoveItem - Function to remove an item from the cart.
 * @param {Function} props.onCheckout - Function to proceed to checkout.
 */
const Cart = ({ cartItems = [], onUpdateQuantity, onRemoveItem, onCheckout }) => {

  const foodTotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.priceEUR * item.quantity, 0);
  }, [cartItems]);

  const platformCommission = useMemo(() => {
    return foodTotal * PLATFORM_COMMISSION_RATE;
  }, [foodTotal]);

  const finalTotal = useMemo(() => {
    return foodTotal + DELIVERY_FEE_EUR + platformCommission;
  }, [foodTotal, platformCommission]);

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-lg">
      <h2 className="mb-4 text-2xl font-bold border-b pb-2">Your Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-4">
            {cartItems.map(item => (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-500">{formatPriceInEUR(item.priceEUR)}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="px-2 py-0.5 border rounded">-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="px-2 py-0.5 border rounded">+</button>
                  <button onClick={() => onRemoveItem(item.id)} className="text-red-500 hover:text-red-700">Remove</button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 mt-6 border-t">
            <div className="flex justify-between text-sm">
              <p>Food Total:</p>
              <p>{formatPriceInEUR(foodTotal)}</p>
            </div>
            <div className="flex justify-between text-sm">
              <p>Delivery Fee:</p>
              <p>{formatPriceInEUR(DELIVERY_FEE_EUR)}</p>
            </div>
            <div className="flex justify-between text-sm">
              <p>Platform Commission (10%):</p>
              <p>{formatPriceInEUR(platformCommission)}</p>
            </div>
            <div className="flex justify-between mt-2 text-lg font-bold">
              <p>Final Total:</p>
              <p>{formatPriceInEUR(finalTotal)}</p>
            </div>
             <div className="flex justify-between text-sm font-semibold text-gray-500">
                <p>Total in MATIC (approx.):</p>
                {/* This would require a real-time price feed in a real app */}
                <p>{formatPriceInMATIC(finalTotal * 1e18 / 0.85)}</p> {/* Placeholder conversion */}
            </div>
          </div>
          
          <button 
            onClick={onCheckout}
            className="w-full px-4 py-2 mt-6 font-bold text-white bg-green-500 rounded-lg hover:bg-green-600"
          >
            Proceed to Checkout
          </button>
        </>
      )}
    </div>
  );
};

export default Cart;