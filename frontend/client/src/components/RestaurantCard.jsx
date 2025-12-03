/**
 * Composant RestaurantCard
 * @notice Affiche une carte individuelle de restaurant
 * @dev Affiche image, nom, cuisine, rating, temps de livraison, prix moyen
 */

// TODO: Importer React et hooks nécessaires
// import { useNavigate } from 'react-router-dom';

// TODO: Importer les utilitaires
// import { getImage } from '../services/ipfs';
// import { formatPrice } from '../utils/formatters';

/**
 * Composant RestaurantCard
 * @param {Object} props - Props du composant
 * @param {Object} props.restaurant - Objet restaurant avec toutes les infos
 * @param {string} props.restaurant.id - ID du restaurant
 * @param {string} props.restaurant.name - Nom du restaurant
 * @param {string} props.restaurant.cuisine - Type de cuisine
 * @param {string} props.restaurant.description - Description
 * @param {Array<string>} props.restaurant.images - Array de hashes IPFS
 * @param {number} props.restaurant.rating - Note moyenne (0-5)
 * @param {number} props.restaurant.totalOrders - Nombre total de commandes
 * @param {number} props.restaurant.averagePrice - Prix moyen
 * @param {Object} props.restaurant.location - { address, lat, lng }
 * @returns {JSX.Element} Carte restaurant
 */
// TODO: Créer le composant RestaurantCard
// function RestaurantCard({ restaurant }) {
//   // Hook pour navigation
//   const navigate = useNavigate();
//   
//   // TODO: Fonction pour calculer le temps de livraison estimé
//   // function getEstimatedDeliveryTime() {
//   //   // Par défaut, retourner 20-30 min
//   //   // TODO: (Optionnel) Calculer basé sur distance si geolocation disponible
//   //   RETOURNER '20-30 min';
//   // }
//   
//   // TODO: Fonction pour obtenir l'indicateur de prix
//   // function getPriceIndicator() {
//   //   SI !restaurant.averagePrice:
//   //     RETOURNER '€€';
//   //   
//   //   SI restaurant.averagePrice < 15:
//   //     RETOURNER '€';
//   //   SINON SI restaurant.averagePrice < 30:
//   //     RETOURNER '€€';
//   //   SINON:
//   //     RETOURNER '€€€';
//   // }
//   
//   // TODO: Fonction pour afficher les étoiles de rating
//   // function renderStars(rating) {
//   //   const stars = [];
//   //   const fullStars = Math.floor(rating);
//   //   const hasHalfStar = rating % 1 >= 0.5;
//   //   
//   //   POUR i DE 0 À 5:
//   //     SI i < fullStars:
//   //       stars.push(<span key={i} className="star filled">⭐</span>);
//   //     SINON SI i === fullStars && hasHalfStar:
//   //       stars.push(<span key={i} className="star half">⭐</span>);
//   //     SINON:
//   //       stars.push(<span key={i} className="star empty">☆</span>);
//   //   
//   //   RETOURNER stars;
//   // }
//   
//   // TODO: Fonction pour naviguer vers la page restaurant
//   // function handleViewMenu() {
//   //   navigate(`/restaurant/${restaurant.id}`);
//   // }
//   
//   // TODO: Rendu du composant
//   // RETOURNER (
//   //   <div className="restaurant-card card card-hover">
//   //     {/* Image du restaurant */}
//   //     <div className="restaurant-image">
//   //       SI restaurant.images && restaurant.images.length > 0:
//   //         <img 
//   //           src={getImage(restaurant.images[0])} 
//   //           alt={restaurant.name}
//   //           loading="lazy"
//   //         />
//   //       SINON:
//   //         <div className="placeholder-image">Pas d'image</div>
//   //       
//   //       {/* Badge "Populaire" si totalOrders > 100 */}
//   //       SI restaurant.totalOrders > 100:
//   //         <span className="badge badge-primary">Populaire</span>
//   //     </div>
//   //     
//   //     {/* Contenu de la carte */}
//   //     <div className="card-content">
//   //       {/* Nom et type de cuisine */}
//   //       <h3 className="restaurant-name">{restaurant.name}</h3>
//   //       <span className="cuisine-type">{restaurant.cuisine}</span>
//   //       
//   //       {/* Description (tronquée) */}
//   //       <p className="restaurant-description">
//   //         {truncateText(restaurant.description, 100)}
//   //       </p>
//   //       
//   //       {/* Rating et nombre d'avis */}
//   //       <div className="rating-section">
//   //         <div className="stars">
//   //           {renderStars(restaurant.rating)}
//   //         </div>
//   //         <span className="rating-value">{restaurant.rating.toFixed(1)}</span>
//   //         <span className="total-orders">({restaurant.totalOrders} avis)</span>
//   //       </div>
//   //       
//   //       {/* Footer avec temps et prix */}
//   //       <div className="card-footer">
//   //         <div className="delivery-info">
//   //           <span className="delivery-time">⏱️ {getEstimatedDeliveryTime()}</span>
//   //           <span className="price-indicator">{getPriceIndicator()}</span>
//   //         </div>
//   //         
//   //         <button 
//   //           onClick={handleViewMenu}
//   //           className="btn btn-primary"
//   //         >
//   //           Voir le menu
//   //         </button>
//   //       </div>
//   //     </div>
//   //   </div>
//   // );
// }

// TODO: Exporter le composant
// export default RestaurantCard;

