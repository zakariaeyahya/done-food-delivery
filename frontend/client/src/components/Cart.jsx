import React, { useMemo } from 'react';
import { formatPriceInMATIC } from '../utils/formatters';

const DELIVERY_FEE_MATIC = 0.001;
const PLATFORM_COMMISSION_RATE = 0.10;

const Cart = ({ cartItems = [], onUpdateQuantity, onRemoveItem, onCheckout }) => {

  const foodTotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + (item.price || 0) * (item.quantity || 1), 0);
  }, [cartItems]);

  const platformCommission = useMemo(() => {
    return foodTotal * PLATFORM_COMMISSION_RATE;
  }, [foodTotal]);

  const finalTotal = useMemo(() => {
    return foodTotal + DELIVERY_FEE_MATIC + platformCommission;
  }, [foodTotal, platformCommission]);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Votre Panier</h2>
            <p className="text-white/80 text-sm">{cartItems.length} article{cartItems.length > 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {cartItems.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-gray-500">Votre panier est vide</p>
          </div>
        ) : (
          <>
            {/* Items List */}
            <div className="space-y-4 mb-6">
              {cartItems.map((item, index) => (
                <div
                  key={item.menuItemId || item._id || index}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                >
                  {/* Item Image */}
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center">
                      <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                  )}

                  {/* Item Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{item.name}</h3>
                    <p className="text-sm text-orange-500 font-medium">{formatPriceInMATIC(item.price)}</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateQuantity(item.menuItemId, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="w-8 text-center font-semibold text-gray-800">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.menuItemId, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveItem(item.menuItemId)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Sous-total</span>
                <span className="font-medium">{formatPriceInMATIC(foodTotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Frais de livraison</span>
                <span className="font-medium">{formatPriceInMATIC(DELIVERY_FEE_MATIC)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Commission plateforme (10%)</span>
                <span className="font-medium">{formatPriceInMATIC(platformCommission)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-200">
                <span className="text-lg font-bold text-gray-800">Total</span>
                <span className="text-lg font-bold text-orange-500">{formatPriceInMATIC(finalTotal)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={onCheckout}
              className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Continuer vers le paiement
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
