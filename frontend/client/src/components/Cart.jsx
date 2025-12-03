/**
 * Composant Cart
 * @notice Affiche le panier d'achat avec calcul des totaux
 * @dev Liste items, modification quantités, calcul foodPrice + deliveryFee + platformFee
 */

// TODO: Importer React et hooks nécessaires
// import { useState, useEffect, useMemo } from 'react';
// import { useNavigate } from 'react-router-dom';

// TODO: Importer les utilitaires
// import { formatPrice } from '../utils/formatters';
// import { getImage } from '../services/ipfs';

/**
 * Composant Cart
 * @param {Object} props - Props du composant
 * @param {Array} props.cart - Array d'items dans le panier (depuis Context ou props)
 * @param {Function} props.onUpdateCart - Callback pour mettre à jour le panier
 * @param {Function} props.onRemoveItem - Callback pour supprimer un item
 * @param {Function} props.onClearCart - Callback pour vider le panier
 * @returns {JSX.Element} Panier d'achat
 */
// TODO: Créer le composant Cart
// function Cart({ cart = [], onUpdateCart, onRemoveItem, onClearCart }) {
//   // Hook pour navigation
//   const navigate = useNavigate();
//   
//   // State pour le frais de livraison (fixe par défaut)
//   const [deliveryFee, setDeliveryFee] = useState(3); // 3 MATIC
//   
//   // State pour confirmation de suppression
//   const [itemToRemove, setItemToRemove] = useState(null);
//   
//   // TODO: Calculer foodPrice (somme de tous les items)
//   // const foodPrice = useMemo(() => {
//   //   RETOURNER cart.reduce((total, item) => {
//   //     const itemPrice = parseFloat(item.price) || 0;
//   //     const itemQuantity = item.quantity || 1;
//   //     RETOURNER total + (itemPrice * itemQuantity);
//   //   }, 0);
//   // }, [cart]);
//   
//   // TODO: Calculer platformFee (10% de foodPrice)
//   // const platformFee = useMemo(() => {
//   //   RETOURNER foodPrice * 0.1;
//   // }, [foodPrice]);
//   
//   // TODO: Calculer totalAmount
//   // const totalAmount = useMemo(() => {
//   //   RETOURNER foodPrice + deliveryFee + platformFee;
//   // }, [foodPrice, deliveryFee, platformFee]);
//   
//   // TODO: Fonction pour augmenter la quantité d'un item
//   // function handleIncreaseQuantity(itemId) {
//   //   SI onUpdateCart:
//   //     const updatedCart = cart.map(item => {
//   //       SI item.id === itemId:
//   //         RETOURNER { ...item, quantity: Math.min(10, (item.quantity || 1) + 1) };
//   //       RETOURNER item;
//   //     });
//   //     onUpdateCart(updatedCart);
//   //   }
//   // }
//   
//   // TODO: Fonction pour diminuer la quantité d'un item
//   // function handleDecreaseQuantity(itemId) {
//   //   SI onUpdateCart:
//   //     const updatedCart = cart.map(item => {
//   //       SI item.id === itemId:
//   //         const newQuantity = Math.max(1, (item.quantity || 1) - 1);
//   //         RETOURNER { ...item, quantity: newQuantity };
//   //       RETOURNER item;
//   //     });
//   //     onUpdateCart(updatedCart);
//   //   }
//   // }
//   
//   // TODO: Fonction pour modifier directement la quantité
//   // function handleQuantityChange(itemId, newQuantity) {
//   //   const quantity = parseInt(newQuantity) || 1;
//   //   SI quantity < 1:
//   //     RETOURNER;
//   //   SI quantity > 10:
//   //     RETOURNER;
//   //   
//   //   SI onUpdateCart:
//   //     const updatedCart = cart.map(item => {
//   //       SI item.id === itemId:
//   //         RETOURNER { ...item, quantity: quantity };
//   //       RETOURNER item;
//   //     });
//   //     onUpdateCart(updatedCart);
//   //   }
//   // }
//   
//   // TODO: Fonction pour demander confirmation avant suppression
//   // function handleRemoveClick(itemId) {
//   //   setItemToRemove(itemId);
//   // }
//   
//   // TODO: Fonction pour confirmer la suppression
//   // function handleConfirmRemove() {
//   //   SI itemToRemove && onRemoveItem:
//   //     onRemoveItem(itemToRemove);
//   //     setItemToRemove(null);
//   //   }
//   // }
//   
//   // TODO: Fonction pour annuler la suppression
//   // function handleCancelRemove() {
//   //   setItemToRemove(null);
//   // }
//   
//   // TODO: Fonction pour naviguer vers checkout
//   // function handleCheckout() {
//   //   SI cart.length === 0:
//   //     // Afficher message panier vide
//   //     RETOURNER;
//   //   
//   //   navigate('/checkout');
//   // }
//   
//   // TODO: Rendu du composant
//   // RETOURNER (
//   //   <div className="cart">
//   //     <div className="cart-header">
//   //       <h2>Panier ({cart.length} {cart.length > 1 ? 'articles' : 'article'})</h2>
//   //       SI cart.length > 0:
//   //         <button onClick={onClearCart} className="btn btn-ghost">
//   //           Vider le panier
//   //         </button>
//   //     </div>
//   //     
//   //     SI cart.length === 0:
//   //       <div className="empty-cart">
//   //         <p>Votre panier est vide</p>
//   //         <button onClick={() => navigate('/')} className="btn btn-primary">
//   //           Voir les restaurants
//   //         </button>
//   //       </div>
//   //     
//   //     SINON:
//   //       <>
//   //         {/* Liste des items */}
//   //         <div className="cart-items">
//   //           {cart.map(item => (
//   //             <div key={item.id} className="cart-item">
//   //               {/* Image */}
//   //               <div className="item-image">
//   //                 SI item.image:
//   //                   <img src={getImage(item.image)} alt={item.name} />
//   //                 SINON:
//   //                   <div className="placeholder-image">Pas d'image</div>
//   //               </div>
//   //               
//   //               {/* Détails */}
//   //               <div className="item-details">
//   //                 <h4 className="item-name">{item.name}</h4>
//   //                 <p className="item-price-unit">{formatPrice(item.price, 'MATIC')} / unité</p>
//   //                 
//   //                 {/* Contrôles quantité */}
//   //                 <div className="quantity-controls">
//   //                   <button 
//   //                     onClick={() => handleDecreaseQuantity(item.id)}
//   //                     disabled={item.quantity <= 1}
//   //                     className="btn-quantity"
//   //                   >
//   //                     -
//   //                   </button>
//   //                   <input
//   //                     type="number"
//   //                     min="1"
//   //                     max="10"
//   //                     value={item.quantity}
//   //                     onChange={(e) => handleQuantityChange(item.id, e.target.value)}
//   //                     className="quantity-input"
//   //                   />
//   //                   <button 
//   //                     onClick={() => handleIncreaseQuantity(item.id)}
//   //                     disabled={item.quantity >= 10}
//   //                     className="btn-quantity"
//   //                   >
//   //                     +
//   //                   </button>
//   //                 </div>
//   //               </div>
//   //               
//   //               {/* Prix total de l'item */}
//   //               <div className="item-total">
//   //                 <span className="total-price">
//   //                   {formatPrice((parseFloat(item.price) || 0) * (item.quantity || 1), 'MATIC')}
//   //                 </span>
//   //               </div>
//   //               
//   //               {/* Bouton supprimer */}
//   //               <button 
//   //                 onClick={() => handleRemoveClick(item.id)}
//   //                 className="btn-remove"
//   //                 title="Supprimer"
//   //               >
//   //                 ✕
//   //               </button>
//   //             </div>
//   //           ))}
//   //         </div>
//   //         
//   //         {/* Totaux */}
//   //         <div className="cart-totals">
//   //           <div className="total-line">
//   //             <span>Nourriture:</span>
//   //             <span>{formatPrice(foodPrice, 'MATIC')}</span>
//   //           </div>
//   //           <div className="total-line">
//   //             <span>Livraison:</span>
//   //             <span>{formatPrice(deliveryFee, 'MATIC')}</span>
//   //           </div>
//   //           <div className="total-line">
//   //             <span>Frais plateforme (10%):</span>
//   //             <span>{formatPrice(platformFee, 'MATIC')}</span>
//   //           </div>
//   //           <div className="total-line total-amount">
//   //             <span>Total:</span>
//   //             <span>{formatPrice(totalAmount, 'MATIC')}</span>
//   //           </div>
//   //         </div>
//   //         
//   //         {/* Bouton passer commande */}
//   //         <button 
//   //           onClick={handleCheckout}
//   //           className="btn btn-primary btn-lg checkout-button"
//   //         >
//   //           Passer commande
//   //         </button>
//   //       </>
//   //     
//   //     {/* Modal de confirmation de suppression */}
//   //     SI itemToRemove:
//   //       <div className="modal-overlay" onClick={handleCancelRemove}>
//   //         <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//   //           <h3>Supprimer l'article ?</h3>
//   //           <p>Êtes-vous sûr de vouloir supprimer cet article du panier ?</p>
//   //           <div className="modal-actions">
//   //             <button onClick={handleCancelRemove} className="btn btn-secondary">
//   //               Annuler
//   //             </button>
//   //             <button onClick={handleConfirmRemove} className="btn btn-danger">
//   //               Supprimer
//   //             </button>
//   //           </div>
//   //         </div>
//   //       </div>
//   //   </div>
//   // );
// }

// TODO: Exporter le composant
// export default Cart;

