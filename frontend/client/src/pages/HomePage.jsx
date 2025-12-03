/**
 * Page HomePage
 * @notice Page d'accueil de l'application client
 * @dev Hero section, recherche, catégories, restaurants populaires, offres spéciales
 */

// TODO: Importer React et hooks nécessaires
// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// TODO: Importer les composants
// import RestaurantList from '../components/RestaurantList';

// TODO: Importer les services (optionnel pour recherche)
// import * as api from '../services/api';

/**
 * Page HomePage
 * @returns {JSX.Element} Page d'accueil
 */
// TODO: Créer le composant HomePage
// function HomePage() {
//   const navigate = useNavigate();
//   
//   // State pour la recherche
//   const [searchQuery, setSearchQuery] = useState('');
//   
//   // State pour les suggestions d'autocomplete
//   const [suggestions, setSuggestions] = useState([]);
//   
//   // State pour afficher/masquer suggestions
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   
//   // TODO: Liste des catégories de cuisine
//   // const cuisineCategories = [
//   //   { name: 'Italienne', icon: '🍝', color: 'bg-red-100' },
//   //   { name: 'Japonaise', icon: '🍣', color: 'bg-pink-100' },
//   //   { name: 'Française', icon: '🥐', color: 'bg-blue-100' },
//   //   { name: 'Mexicaine', icon: '🌮', color: 'bg-yellow-100' },
//   //   { name: 'Américaine', icon: '🍔', color: 'bg-orange-100' },
//   //   { name: 'Asiatique', icon: '🥢', color: 'bg-green-100' }
//   // ];
//   
//   // TODO: Fonction pour gérer la recherche
//   // function handleSearch(event) {
//   //   const query = event.target.value;
//   //   setSearchQuery(query);
//   //   
//   //   SI query.length > 2:
//   //     // TODO: Fetch suggestions depuis API (optionnel)
//   //     // fetchSuggestions(query);
//   //     setShowSuggestions(true);
//   //   SINON:
//   //     setShowSuggestions(false);
//   // }
//   
//   // TODO: Fonction pour soumettre la recherche
//   // function handleSearchSubmit() {
//   //   SI searchQuery.trim():
//   //     navigate(`/restaurants?search=${encodeURIComponent(searchQuery)}`);
//   //   }
//   // }
//   
//   // TODO: Fonction pour cliquer sur une catégorie
//   // function handleCategoryClick(cuisineName) {
//   //   navigate(`/restaurants?cuisine=${encodeURIComponent(cuisineName)}`);
//   // }
//   
//   // TODO: Rendu du composant
//   // RETOURNER (
//   //   <div className="home-page">
//   //     {/* Hero Section */}
//   //     <section className="hero-section">
//   //       <div className="hero-content">
//   //         <h1 className="hero-title">DONE Food Delivery</h1>
//   //         <p className="hero-subtitle">Commandez vos plats préférés, livrés rapidement</p>
//   //         
//   //         {/* Barre de recherche */}
//   //         <div className="search-container">
//   //           <input
//   //             type="text"
//   //             placeholder="Rechercher un restaurant, un plat..."
//   //             value={searchQuery}
//   //             onChange={handleSearch}
//   //             onFocus={() => setShowSuggestions(searchQuery.length > 2)}
//   //             className="search-input"
//   //           />
//   //           <button 
//   //             onClick={handleSearchSubmit}
//   //             className="btn btn-primary search-button"
//   //           >
//   //             🔍 Chercher
//   //           </button>
//   //           
//   //           {/* Autocomplete suggestions */}
//   //           SI showSuggestions && suggestions.length > 0:
//   //             <div className="suggestions-dropdown">
//   //               {suggestions.map((suggestion, i) => (
//   //                 <div
//   //                   key={i}
//   //                   onClick={() => {
//   //                     setSearchQuery(suggestion.name);
//   //                     setShowSuggestions(false);
//   //                     navigate(`/restaurants?search=${encodeURIComponent(suggestion.name)}`);
//   //                   }}
//   //                   className="suggestion-item"
//   //                 >
//   //                   {suggestion.name}
//   //                 </div>
//   //               ))}
//   //             </div>
//   //         </div>
//   //       </div>
//   //     </section>
//   //     
//   //     {/* Section Catégories */}
//   //     <section className="categories-section">
//   //       <div className="container-custom">
//   //         <h2 className="section-title">Catégories</h2>
//   //         <div className="categories-grid">
//   //           {cuisineCategories.map((category, i) => (
//   //             <div
//   //               key={i}
//   //               onClick={() => handleCategoryClick(category.name)}
//   //               className={`category-card ${category.color} card-hover`}
//   //             >
//   //               <span className="category-icon">{category.icon}</span>
//   //               <span className="category-name">{category.name}</span>
//   //             </div>
//   //           ))}
//   //         </div>
//   //       </div>
//   //     </section>
//   //     
//   //     {/* Section Restaurants Populaires */}
//   //     <section className="popular-restaurants-section">
//   //       <div className="container-custom">
//   //         <div className="section-header">
//   //           <h2 className="section-title">Restaurants populaires</h2>
//   //           <button
//   //             onClick={() => navigate('/restaurants')}
//   //             className="btn btn-outline"
//   //           >
//   //             Voir tous les restaurants
//   //           </button>
//   //         </div>
//   //         
//   //         {/* Intègre RestaurantList avec limit=6 et sortBy="popular" */}
//   //         <RestaurantList 
//   //           limit={6} 
//   //           sortBy="popular"
//   //         />
//   //       </div>
//   //     </section>
//   //     
//   //     {/* Section Offres Spéciales / Promotions */}
//   //     <section className="promotions-section">
//   //       <div className="container-custom">
//   //         <h2 className="section-title">Offres spéciales</h2>
//   //         <div className="promotions-grid">
//   //           {/* TODO: Afficher promotions si disponibles depuis API */}
//   //           {/* Exemple de promotion */}
//   //           <div className="promotion-card card">
//   //             <div className="promotion-badge">Nouveau restaurant</div>
//   //             <h3>Restaurant XYZ</h3>
//   //             <p>Découvrez notre nouveau restaurant avec 20% de réduction!</p>
//   //             <button className="btn btn-primary">Voir l'offre</button>
//   //           </div>
//   //         </div>
//   //       </div>
//   //     </section>
//   //     
//   //     {/* Section Nouveaux Restaurants */}
//   //     <section className="new-restaurants-section">
//   //       <div className="container-custom">
//   //         <h2 className="section-title">Nouveaux restaurants</h2>
//   //         {/* TODO: RestaurantList avec filtre "nouveau" (créé dans les 7 derniers jours) */}
//   //         <RestaurantList 
//   //           limit={4}
//   //           sortBy="newest"
//   //         />
//   //       </div>
//   //     </section>
//   //   </div>
//   // );
// }

// TODO: Exporter le composant
// export default HomePage;

