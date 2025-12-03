/**
 * Page RestaurantPage
 * @notice Page de détail d'un restaurant avec menu complet
 * @dev Affiche infos restaurant, menu, avis, galerie photos
 */

// TODO: Importer React et hooks nécessaires
// import { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';

// TODO: Importer les composants
// import MenuItems from '../components/MenuItems';

// TODO: Importer les services
// import * as api from '../services/api';
// import { getImage } from '../services/ipfs';
// import { formatDate } from '../utils/formatters';

/**
 * Page RestaurantPage
 * @returns {JSX.Element} Page détail restaurant
 */
// TODO: Créer le composant RestaurantPage
// function RestaurantPage() {
//   const { id: restaurantId } = useParams();
//   const navigate = useNavigate();
//   
//   // State pour le restaurant
//   const [restaurant, setRestaurant] = useState(null);
//   
//   // State pour les avis
//   const [reviews, setReviews] = useState([]);
//   
//   // State pour le filtre d'avis par rating
//   const [reviewFilter, setReviewFilter] = useState('all'); // 'all', 5, 4, 3, 2, 1
//   
//   // State pour la pagination des avis
//   const [reviewPage, setReviewPage] = useState(1);
//   const reviewsPerPage = 10;
//   
//   // State pour l'image lightbox
//   const [lightboxImage, setLightboxImage] = useState(null);
//   
//   // State pour le chargement
//   const [loading, setLoading] = useState(false);
//   
//   // State pour les erreurs
//   const [error, setError] = useState(null);
//   
//   // TODO: Fonction pour récupérer le restaurant
//   // useEffect(() => {
//   //   async function fetchRestaurant() {
//   //     ESSAYER:
//   //       setLoading(true);
//   //       setError(null);
//   //       
//   //       const restaurantData = await api.getRestaurant(restaurantId);
//   //       setRestaurant(restaurantData);
//   //       
//   //       // Récupérer les avis si disponibles
//   //       SI restaurantData.reviews:
//   //         setReviews(restaurantData.reviews);
//   //       
//   //     CATCH error:
//   //       console.error('Error fetching restaurant:', error);
//   //       setError('Restaurant non trouvé');
//   //     FINALLY:
//   //       setLoading(false);
//   //   }
//   //   
//   //   SI restaurantId:
//   //     fetchRestaurant();
//   // }, [restaurantId]);
//   
//   // TODO: Fonction pour filtrer les avis par rating
//   // const filteredReviews = reviews.filter(review => {
//   //   SI reviewFilter === 'all':
//   //     RETOURNER true;
//   //   RETOURNER review.rating === parseInt(reviewFilter);
//   // });
//   
//   // TODO: Calculer avis paginés
//   // const paginatedReviews = filteredReviews.slice(
//   //   (reviewPage - 1) * reviewsPerPage,
//   //   reviewPage * reviewsPerPage
//   // );
//   
//   // TODO: Fonction pour afficher les étoiles
//   // function renderStars(rating) {
//   //   const stars = [];
//   //   POUR i DE 1 À 5:
//   //     SI i <= rating:
//   //       stars.push(<span key={i} className="star filled">⭐</span>);
//   //     SINON:
//   //       stars.push(<span key={i} className="star empty">☆</span>);
//   //   RETOURNER stars;
//   // }
//   
//   // TODO: Fonction pour ouvrir lightbox image
//   // function handleImageClick(imageHash) {
//   //   setLightboxImage(getImage(imageHash));
//   // }
//   
//   // TODO: Fonction pour fermer lightbox
//   // function handleCloseLightbox() {
//   //   setLightboxImage(null);
//   // }
//   
//   // TODO: Fonction pour ajouter au panier (callback pour MenuItems)
//   // function handleAddToCart(item) {
//   //   // TODO: Utiliser Context API ou prop drilling pour ajouter au panier global
//   //   // Exemple: cartContext.addItem(item);
//   // }
//   
//   // TODO: Rendu du composant
//   // RETOURNER (
//   //   <div className="restaurant-page">
//   //     SI loading:
//   //       <div className="loading">Chargement...</div>
//   //     
//   //     SINON SI error:
//   //       <div className="error-message">
//   //         {error}
//   //         <button onClick={() => navigate('/')}>Retour à l'accueil</button>
//   //       </div>
//   //     
//   //     SINON SI !restaurant:
//   //       <div className="not-found">Restaurant non trouvé</div>
//   //     
//   //     SINON:
//   //       <>
//   //         {/* Header du restaurant */}
//   //         <div className="restaurant-header">
//   //           {/* Image principale */}
//   //           <div className="restaurant-image-main">
//   //             SI restaurant.images && restaurant.images.length > 0:
//   //               <img 
//   //                 src={getImage(restaurant.images[0])} 
//   //                 alt={restaurant.name}
//   //               />
//   //             SINON:
//   //               <div className="placeholder-image">Pas d'image</div>
//   //           </div>
//   //           
//   //           {/* Informations */}
//   //           <div className="restaurant-info">
//   //             <h1 className="restaurant-name">{restaurant.name}</h1>
//   //             <span className="restaurant-cuisine">{restaurant.cuisine}</span>
//   //             
//   //             <p className="restaurant-description">{restaurant.description}</p>
//   //             
//   //             {/* Rating et avis */}
//   //             <div className="restaurant-rating">
//   //               <div className="stars">
//   //                 {renderStars(restaurant.rating)}
//   //               </div>
//   //               <span className="rating-value">{restaurant.rating.toFixed(1)}</span>
//   //               <span className="total-reviews">({restaurant.totalOrders} avis)</span>
//   //             </div>
//   //             
//   //             {/* Adresse et horaires */}
//   //             <div className="restaurant-details">
//   //               <div className="detail-item">
//   //                 <span className="detail-icon">📍</span>
//   //                 <span>{restaurant.location?.address || 'Adresse non disponible'}</span>
//   //               </div>
//   //               <div className="detail-item">
//   //                 <span className="detail-icon">🕐</span>
//   //                 <span>{restaurant.openingHours || 'Horaires non disponibles'}</span>
//   //               </div>
//   //             </div>
//   //           </div>
//   //         </div>
//   //         
//   //         {/* Galerie photos */}
//   //         SI restaurant.images && restaurant.images.length > 1:
//   //           <section className="restaurant-gallery">
//   //             <h2>Photos</h2>
//   //             <div className="gallery-grid">
//   //               {restaurant.images.map((imageHash, i) => (
//   //                 <div
//   //                   key={i}
//   //                   onClick={() => handleImageClick(imageHash)}
//   //                   className="gallery-item"
//   //                 >
//   //                   <img src={getImage(imageHash)} alt={`${restaurant.name} ${i + 1}`} />
//   //                 </div>
//   //               ))}
//   //             </div>
//   //           </section>
//   //         
//   //         {/* Menu */}
//   //         <section className="restaurant-menu">
//   //           <h2>Menu</h2>
//   //           <MenuItems
//   //             restaurantId={restaurantId}
//   //             onAddToCart={handleAddToCart}
//   //           />
//   //         </section>
//   //         
//   //         {/* Section Avis */}
//   //         <section className="restaurant-reviews">
//   //           <h2>Avis clients</h2>
//   //           
//   //           {/* Filtres par rating */}
//   //           <div className="review-filters">
//   //             <button
//   //               onClick={() => setReviewFilter('all')}
//   //               className={`filter-btn ${reviewFilter === 'all' ? 'active' : ''}`}
//   //             >
//   //               Tous
//   //             </button>
//   //             {[5, 4, 3, 2, 1].map(rating => (
//   //               <button
//   //                 key={rating}
//   //                 onClick={() => setReviewFilter(rating.toString())}
//   //                 className={`filter-btn ${reviewFilter === rating.toString() ? 'active' : ''}`}
//   //               >
//   //                 {rating} ⭐
//   //               </button>
//   //             ))}
//   //           </div>
//   //           
//   //           {/* Liste des avis */}
//   //           SI paginatedReviews.length === 0:
//   //             <p>Aucun avis pour ce filtre</p>
//   //           
//   //           SINON:
//   //             <div className="reviews-list">
//   //               {paginatedReviews.map((review, i) => (
//   //                 <div key={i} className="review-card card">
//   //                   <div className="review-header">
//   //                     <div className="review-rating">
//   //                       {renderStars(review.rating)}
//   //                     </div>
//   //                     <span className="review-date">{formatDate(review.date)}</span>
//   //                   </div>
//   //                   <p className="review-comment">{review.comment}</p>
//   //                   <span className="review-author">{review.clientName || 'Anonyme'}</span>
//   //                 </div>
//   //               ))}
//   //             </div>
//   //           
//   //           {/* Pagination avis */}
//   //           SI filteredReviews.length > reviewsPerPage:
//   //             <div className="reviews-pagination">
//   //               <button
//   //                 onClick={() => setReviewPage(prev => Math.max(1, prev - 1))}
//   //                 disabled={reviewPage === 1}
//   //               >
//   //                 Précédent
//   //               </button>
//   //               <span>Page {reviewPage}</span>
//   //               <button
//   //                 onClick={() => setReviewPage(prev => prev + 1)}
//   //                 disabled={reviewPage * reviewsPerPage >= filteredReviews.length}
//   //               >
//   //                 Suivant
//   //               </button>
//   //             </div>
//   //         </section>
//   //         
//   //         {/* Lightbox pour images */}
//   //         SI lightboxImage:
//   //           <div className="lightbox-overlay" onClick={handleCloseLightbox}>
//   //             <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
//   //               <button onClick={handleCloseLightbox} className="lightbox-close">✕</button>
//   //               <img src={lightboxImage} alt="Restaurant" />
//   //             </div>
//   //           </div>
//   //       </>
//   //   </div>
//   // );
// }

// TODO: Exporter le composant
// export default RestaurantPage;

