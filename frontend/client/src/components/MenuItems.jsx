/**
 * Composant MenuItems
 * @notice Affiche le menu d'un restaurant avec filtres par catégorie
 * @dev Fetch menu, affichage grid, ajout au panier, conversion prix MATIC/EUR
 */

// TODO: Importer React et hooks nécessaires
// import { useState, useEffect } from 'react';

// TODO: Importer les services et utilitaires
// import * as api from '../services/api';
// import { getImage } from '../services/ipfs';
// import { formatPrice } from '../utils/formatters';

/**
 * Composant MenuItems
 * @param {Object} props - Props du composant
 * @param {string} props.restaurantId - ID du restaurant
 * @param {Function} props.onAddToCart - Callback quand item ajouté au panier
 * @returns {JSX.Element} Menu du restaurant
 */
// TODO: Créer le composant MenuItems
// function MenuItems({ restaurantId, onAddToCart }) {
//   // State pour le menu complet
//   const [menu, setMenu] = useState([]);
//   
//   // State pour la catégorie sélectionnée
//   const [selectedCategory, setSelectedCategory] = useState('all');
//   
//   // State pour l'item sélectionné (pour modal quantité)
//   const [selectedItem, setSelectedItem] = useState(null);
//   
//   // State pour la quantité dans le modal
//   const [quantity, setQuantity] = useState(1);
//   
//   // State pour le chargement
//   const [loading, setLoading] = useState(false);
//   
//   // State pour l'erreur
//   const [error, setError] = useState(null);
//   
//   // State pour toggle MATIC/EUR
//   const [currencyDisplay, setCurrencyDisplay] = useState('MATIC'); // 'MATIC' ou 'EUR'
//   
//   // TODO: Liste des catégories disponibles
//   // const categories = ['all', 'Entrées', 'Plats', 'Desserts', 'Boissons'];
//   
//   // TODO: Fonction pour récupérer le menu du restaurant
//   // useEffect(() => {
//   //   async function fetchMenu() {
//   //     ESSAYER:
//   //       setLoading(true);
//   //       setError(null);
//   //       
//   //       // Récupérer le restaurant avec son menu
//   //       const restaurant = await api.getRestaurant(restaurantId);
//   //       
//   //       SI restaurant && restaurant.menu:
//   //         setMenu(restaurant.menu);
//   //       SINON:
//   //         setError('Menu non disponible');
//   //     CATCH error:
//   //       console.error('Error fetching menu:', error);
//   //       setError('Erreur lors du chargement du menu');
//   //     FINALLY:
//   //       setLoading(false);
//   //   }
//   //   
//   //   SI restaurantId:
//   //     fetchMenu();
//   // }, [restaurantId]);
//   
//   // TODO: Fonction pour filtrer le menu par catégorie
//   // const filteredMenu = menu.filter(item => {
//   //   SI selectedCategory === 'all':
//   //     RETOURNER true;
//   //   RETOURNER item.category === selectedCategory;
//   // });
//   
//   // TODO: Fonction pour convertir MATIC en EUR (mock ou oracle)
//   // function convertToEUR(maticAmount) {
//   //   // TODO: Utiliser un price oracle ou API de conversion
//   //   // Pour l'instant, mock: 1 MATIC = 0.8 EUR
//   //   const maticPrice = 0.8;
//   //   RETOURNER (parseFloat(maticAmount) * maticPrice).toFixed(2);
//   // }
//   
//   // TODO: Fonction pour ouvrir le modal de quantité
//   // function handleAddToCartClick(item) {
//   //   setSelectedItem(item);
//   //   setQuantity(1);
//   // }
//   
//   // TODO: Fonction pour fermer le modal
//   // function handleCloseModal() {
//   //   setSelectedItem(null);
//   //   setQuantity(1);
//   // }
//   
//   // TODO: Fonction pour confirmer l'ajout au panier
//   // function handleConfirmAddToCart() {
//   //   SI selectedItem && onAddToCart:
//   //     onAddToCart({
//   //       ...selectedItem,
//   //       quantity: quantity,
//   //       restaurantId: restaurantId
//   //     });
//   //     
//   //     // Fermer le modal
//   //     handleCloseModal();
//   //     
//   //     // TODO: Afficher notification de succès (optionnel)
//   //   }
//   // }
//   
//   // TODO: Rendu du composant
//   // RETOURNER (
//   //   <div className="menu-items">
//   //     {/* Tabs de catégories */}
//   //     <div className="category-tabs">
//   //       {categories.map(category => (
//   //         <button
//   //           key={category}
//   //           onClick={() => setSelectedCategory(category)}
//   //           className={`tab ${selectedCategory === category ? 'active' : ''}`}
//   //         >
//   //           {category === 'all' ? 'Tous' : category}
//   //         </button>
//   //       ))}
//   //     </div>
//   //     
//   //     {/* Toggle MATIC/EUR */}
//   //     <div className="currency-toggle">
//   //       <button
//   //         onClick={() => setCurrencyDisplay('MATIC')}
//   //         className={currencyDisplay === 'MATIC' ? 'active' : ''}
//   //       >
//   //         MATIC
//   //       </button>
//   //       <button
//   //         onClick={() => setCurrencyDisplay('EUR')}
//   //         className={currencyDisplay === 'EUR' ? 'active' : ''}
//   //       >
//   //         EUR
//   //       </button>
//   //     </div>
//   //     
//   //     {/* Grid des items du menu */}
//   //     SI loading:
//   //       <div className="skeleton-loader">
//   //         {[1, 2, 3, 4, 5, 6].map(i => (
//   //           <div key={i} className="skeleton-menu-item" />
//   //         ))}
//   //       </div>
//   //     
//   //     SINON SI error:
//   //       <div className="error-message">{error}</div>
//   //     
//   //     SINON SI filteredMenu.length === 0:
//   //       <div className="no-items">
//   //         <p>Aucun plat dans cette catégorie</p>
//   //       </div>
//   //     
//   //     SINON:
//   //       <div className="menu-items-grid">
//   //         {filteredMenu.map(item => (
//   //           <div key={item.id || item.name} className="menu-item-card">
//   //             {/* Image du plat */}
//   //             <div className="menu-item-image">
//   //               SI item.image:
//   //                 <img 
//   //                   src={getImage(item.image)} 
//   //                   alt={item.name}
//   //                   loading="lazy"
//   //                 />
//   //               SINON:
//   //                 <div className="placeholder-image">Pas d'image</div>
//   //             </div>
//   //             
//   //             {/* Informations du plat */}
//   //             <div className="menu-item-info">
//   //               <h4 className="item-name">{item.name}</h4>
//   //               <p className="item-description">{item.description}</p>
//   //               
//   //               {/* Prix */}
//   //               <div className="item-price">
//   //                 SI currencyDisplay === 'MATIC':
//   //                   <span>{formatPrice(item.price, 'MATIC')}</span>
//   //                 SINON:
//   //                   <span>{formatPrice(convertToEUR(item.price), 'EUR')}</span>
//   //               </div>
//   //               
//   //               {/* Bouton ajouter au panier */}
//   //               <button
//   //                 onClick={() => handleAddToCartClick(item)}
//   //                 className="btn btn-primary"
//   //               >
//   //                 Ajouter au panier
//   //               </button>
//   //             </div>
//   //           </div>
//   //         ))}
//   //       </div>
//   //     
//   //     {/* Modal de quantité */}
//   //     SI selectedItem:
//   //       <div className="modal-overlay" onClick={handleCloseModal}>
//   //         <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//   //           <h3>{selectedItem.name}</h3>
//   //           
//   //           <div className="quantity-selector">
//   //             <label>Quantité:</label>
//   //             <div className="quantity-controls">
//   //               <button 
//   //                 onClick={() => setQuantity(Math.max(1, quantity - 1))}
//   //                 disabled={quantity <= 1}
//   //               >
//   //                 -
//   //               </button>
//   //               <span>{quantity}</span>
//   //               <button 
//   //                 onClick={() => setQuantity(Math.min(10, quantity + 1))}
//   //                 disabled={quantity >= 10}
//   //               >
//   //                 +
//   //               </button>
//   //             </div>
//   //           </div>
//   //           
//   //           <div className="modal-actions">
//   //             <button onClick={handleCloseModal} className="btn btn-secondary">
//   //               Annuler
//   //             </button>
//   //             <button onClick={handleConfirmAddToCart} className="btn btn-primary">
//   //               Ajouter au panier
//   //             </button>
//   //           </div>
//   //         </div>
//   //       </div>
//   //   </div>
//   // );
// }

// TODO: Exporter le composant
// export default MenuItems;

