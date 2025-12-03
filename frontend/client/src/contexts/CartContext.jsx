/**
 * Context CartContext
 * @notice Fournit cart, addItem, removeItem, clearCart à toute l'application
 * @dev Gère l'état du panier global avec persistence localStorage
 */

// TODO: Importer React
// import { createContext, useState, useEffect } from 'react';

/**
 * Créer le Context
 */
// TODO: Créer CartContext
// export const CartContext = createContext(null);

/**
 * Provider pour CartContext
 * @param {Object} props - Props avec children
 * @returns {JSX.Element} Provider avec valeur du context
 */
// TODO: Créer CartProvider
// export function CartProvider({ children }) {
//   const [cart, setCart] = useState([]);
//   
//   // TODO: Charger panier depuis localStorage au montage
//   // useEffect(() => {
//   //   const savedCart = localStorage.getItem('cart');
//   //   SI savedCart:
//   //     ESSAYER:
//   //       const parsedCart = JSON.parse(savedCart);
//   //       setCart(parsedCart);
//   //     CATCH error:
//   //       console.error('Error parsing saved cart:', error);
//   //       localStorage.removeItem('cart');
//   //   }
//   // }, []);
//   
//   // TODO: Sauvegarder panier dans localStorage quand il change
//   // useEffect(() => {
//   //   localStorage.setItem('cart', JSON.stringify(cart));
//   // }, [cart]);
//   
//   // TODO: Fonction pour ajouter un item au panier
//   // function addItem(item) {
//   //   setCart(prev => {
//   //     // Vérifier si l'item existe déjà (même id et même restaurantId)
//   //     const existingIndex = prev.findIndex(
//   //       i => i.id === item.id && i.restaurantId === item.restaurantId
//   //     );
//   //     
//   //     SI existingIndex >= 0:
//   //       // Incrémenter la quantité
//   //       const updated = [...prev];
//   //       updated[existingIndex].quantity = 
//   //         (updated[existingIndex].quantity || 1) + (item.quantity || 1);
//   //       RETOURNER updated;
//   //     SINON:
//   //       // Ajouter nouvel item
//   //       RETOURNER [...prev, { ...item, quantity: item.quantity || 1 }];
//   //   });
//   // }
//   
//   // TODO: Fonction pour supprimer un item du panier
//   // function removeItem(itemId) {
//   //   setCart(prev => prev.filter(item => item.id !== itemId));
//   // }
//   
//   // TODO: Fonction pour modifier la quantité d'un item
//   // function updateQuantity(itemId, quantity) {
//   //   SI quantity <= 0:
//   //     removeItem(itemId);
//   //     RETOURNER;
//   //   
//   //   setCart(prev => prev.map(item => 
//   //     item.id === itemId ? { ...item, quantity: Math.min(quantity, 10) } : item
//   //   ));
//   // }
//   
//   // TODO: Fonction pour vider le panier
//   // function clearCart() {
//   //   setCart([]);
//   // }
//   
//   // TODO: Fonction pour obtenir le nombre total d'items
//   // function getItemCount() {
//   //   RETOURNER cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
//   // }
//   
//   // TODO: Fonction pour obtenir le total du panier
//   // function getTotal() {
//   //   RETOURNER cart.reduce((sum, item) => {
//   //     const itemPrice = parseFloat(item.price) || 0;
//   //     const itemQuantity = item.quantity || 1;
//   //     RETOURNER sum + (itemPrice * itemQuantity);
//   //   }, 0);
//   // }
//   
//   // TODO: Valeur du context
//   // const value = {
//   //   cart,
//   //   addItem,
//   //   removeItem,
//   //   updateQuantity,
//   //   clearCart,
//   //   getItemCount,
//   //   getTotal
//   // };
//   
//   // TODO: Retourner le Provider
//   // RETOURNER (
//   //   <CartContext.Provider value={value}>
//   //     {children}
//   //   </CartContext.Provider>
//   // );
// }

