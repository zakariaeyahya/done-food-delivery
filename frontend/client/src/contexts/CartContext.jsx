import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useWallet } from './WalletContext';
import * as api from '../services/api';

const CartContext = createContext();
const CartDispatchContext = createContext();

const initialState = {
  items: [],
  restaurantId: null,
  restaurantAddress: null,
  loading: false,
  error: null
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };

    case 'SET_CART':
      return {
        ...state,
        items: action.payload.items || [],
        restaurantId: action.payload.restaurantId || null,
        restaurantAddress: action.payload.restaurantAddress || null,
        loading: false,
        error: null
      };

    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.menuItemId === action.payload.menuItemId);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.menuItemId === action.payload.menuItemId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
        restaurantId: action.payload.restaurantId || state.restaurantId,
        restaurantAddress: action.payload.restaurantAddress || state.restaurantAddress
      };
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.menuItemId !== action.payload.menuItemId)
      };

    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.menuItemId !== action.payload.menuItemId)
        };
      }
      return {
        ...state,
        items: state.items.map(item =>
          item.menuItemId === action.payload.menuItemId
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
    }

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        restaurantId: null,
        restaurantAddress: null
      };

    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { address, isConnected } = useWallet();

  // Load cart from backend when wallet connects
  useEffect(() => {
    const loadCart = async () => {
      if (!address || !isConnected) {
        dispatch({ type: 'CLEAR_CART' });
        return;
      }

      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        console.log('[CartContext] Loading cart for:', address);

        const response = await api.getCart(address);
        console.log('[CartContext] Cart loaded:', response.data);

        dispatch({ type: 'SET_CART', payload: response.data.cart || { items: [] } });
      } catch (error) {
        console.error('[CartContext] Error loading cart:', error);
        // If user not found, just set empty cart
        if (error.response?.status === 404) {
          dispatch({ type: 'SET_CART', payload: { items: [] } });
        } else {
          dispatch({ type: 'SET_ERROR', payload: error.message });
        }
      }
    };

    loadCart();
  }, [address, isConnected]);

  // Action to add item to cart (syncs with backend)
  const addToCart = useCallback(async (item, restaurantId, restaurantAddress) => {
    if (!address) {
      console.error('[CartContext] Cannot add to cart: no wallet connected');
      return { success: false, error: 'Please connect your wallet first' };
    }

    const itemData = {
      menuItemId: item._id || item.id || item.menuItemId,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image || item.imageUrl,
      restaurantId,
      restaurantAddress
    };

    console.log('[CartContext] Adding to cart:', itemData);

    // Optimistic update
    dispatch({ type: 'ADD_ITEM', payload: { ...itemData, restaurantId, restaurantAddress } });

    try {
      const response = await api.addToCart(address, itemData);
      console.log('[CartContext] Item added to backend:', response.data);

      // Update with actual server data
      dispatch({ type: 'SET_CART', payload: response.data.cart });

      return { success: true, cart: response.data.cart };
    } catch (error) {
      console.error('[CartContext] Error adding to cart:', error);

      // Revert optimistic update
      dispatch({ type: 'REMOVE_ITEM', payload: { menuItemId: itemData.menuItemId } });

      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }, [address]);

  // Action to update item quantity
  const updateQuantity = useCallback(async (menuItemId, quantity) => {
    if (!address) return { success: false, error: 'No wallet connected' };

    console.log('[CartContext] Updating quantity:', { menuItemId, quantity });

    // Optimistic update
    dispatch({ type: 'UPDATE_QUANTITY', payload: { menuItemId, quantity } });

    try {
      const response = await api.updateCartItem(address, menuItemId, quantity);
      console.log('[CartContext] Quantity updated:', response.data);

      dispatch({ type: 'SET_CART', payload: response.data.cart });
      return { success: true };
    } catch (error) {
      console.error('[CartContext] Error updating quantity:', error);
      return { success: false, error: error.message };
    }
  }, [address]);

  // Action to remove item from cart
  const removeItem = useCallback(async (menuItemId) => {
    if (!address) return { success: false, error: 'No wallet connected' };

    console.log('[CartContext] Removing item:', menuItemId);

    // Optimistic update
    dispatch({ type: 'REMOVE_ITEM', payload: { menuItemId } });

    try {
      const response = await api.removeFromCart(address, menuItemId);
      console.log('[CartContext] Item removed:', response.data);

      dispatch({ type: 'SET_CART', payload: response.data.cart });
      return { success: true };
    } catch (error) {
      console.error('[CartContext] Error removing item:', error);
      return { success: false, error: error.message };
    }
  }, [address]);

  // Action to clear cart
  const clearCart = useCallback(async () => {
    if (!address) {
      dispatch({ type: 'CLEAR_CART' });
      return { success: true };
    }

    console.log('[CartContext] Clearing cart');

    // Optimistic update
    dispatch({ type: 'CLEAR_CART' });

    try {
      const response = await api.clearCart(address);
      console.log('[CartContext] Cart cleared:', response.data);
      return { success: true };
    } catch (error) {
      console.error('[CartContext] Error clearing cart:', error);
      return { success: false, error: error.message };
    }
  }, [address]);

  // Calculate total
  const total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  const value = {
    ...state,
    total,
    itemCount
  };

  const actions = {
    addToCart,
    updateQuantity,
    removeItem,
    clearCart
  };

  return (
    <CartContext.Provider value={value}>
      <CartDispatchContext.Provider value={actions}>
        {children}
      </CartDispatchContext.Provider>
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
export const useCartActions = () => useContext(CartDispatchContext);

// Legacy support
export const useCartDispatch = () => {
  const actions = useCartActions();
  return (action) => {
    console.warn('[CartContext] useCartDispatch is deprecated, use useCartActions instead');
    // Map old dispatch actions to new action functions
    switch (action.type) {
      case 'ADD_ITEM':
        return actions.addToCart(action.payload);
      case 'REMOVE_ITEM':
        return actions.removeItem(action.payload.id);
      case 'UPDATE_QUANTITY':
        return actions.updateQuantity(action.payload.id, action.payload.quantity);
      case 'CLEAR_CART':
        return actions.clearCart();
      default:
        console.error('Unknown cart action:', action.type);
    }
  };
};
