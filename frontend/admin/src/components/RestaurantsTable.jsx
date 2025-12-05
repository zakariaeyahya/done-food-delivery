/**
 * Composant RestaurantsTable - Table Restaurants
 * @notice Affiche une table paginée des restaurants avec recherche et filtres
 * @dev Debounce recherche 300ms, pagination côté serveur
 */

// TODO: Importer React et hooks
// import React, { useState, useEffect } from 'react';

// TODO: Importer les services
// import * as apiService from '../services/api';

// TODO: Importer les utilitaires
// import { formatAddress } from '../utils/web3';

/**
 * Composant RestaurantsTable
 * @param {Function} onViewDetails - Callback pour voir les détails d'un restaurant
 * @param {Function} onSuspend - Callback pour suspendre un restaurant
 * @param {Function} onActivate - Callback pour activer un restaurant
 */
// TODO: Implémenter le composant RestaurantsTable
// function RestaurantsTable({ onViewDetails, onSuspend, onActivate }) {
//   // ÉTAT: restaurants = []
//   // ÉTAT: page = 1
//   // ÉTAT: limit = 10
//   // ÉTAT: search = ""
//   // ÉTAT: filters = { status: "all", cuisine: "all", minRating: 0 }
//   // ÉTAT: total = 0
//   // ÉTAT: loading = true
//   
//   // TODO: Utiliser useState pour gérer les états
//   // const [restaurants, setRestaurants] = useState([]);
//   // const [page, setPage] = useState(1);
//   // const [limit] = useState(10);
//   // const [search, setSearch] = useState('');
//   // const [filters, setFilters] = useState({ status: 'all', cuisine: 'all', minRating: 0 });
//   // const [total, setTotal] = useState(0);
//   // const [loading, setLoading] = useState(true);
//   
//   // TODO: Liste des cuisines disponibles (depuis API ou constante)
//   // const cuisines = ['Italienne', 'Chinoise', 'Japonaise', 'Française', 'Indienne', 'Mexicaine', 'Autre'];
//   
//   // TODO: Fonction pour charger les restaurants
//   // async function fetchRestaurants() {
//   //   ESSAYER:
//   //     setLoading(true);
//   //     
//   //     const data = await apiService.getRestaurants({
//   //       page,
//   //       limit,
//   //       search: search || undefined,
//   //       status: filters.status !== 'all' ? filters.status : undefined,
//   //       cuisine: filters.cuisine !== 'all' ? filters.cuisine : undefined,
//   //       minRating: filters.minRating > 0 ? filters.minRating : undefined
//   //     });
//   //     
//   //     setRestaurants(data.restaurants || []);
//   //     setTotal(data.total || 0);
//   //     setLoading(false);
//   //   CATCH error:
//   //     console.error('Error fetching restaurants:', error);
//   //     setLoading(false);
//   // }
//   
//   // TODO: Debounce pour la recherche (300ms)
//   // const [debouncedSearch, setDebouncedSearch] = useState('');
//   // 
//   // useEffect(() => {
//   //   const timer = setTimeout(() => {
//   //     setDebouncedSearch(search);
//   //     setPage(1);
//   //   }, 300);
//   //   
//   //   RETOURNER () => clearTimeout(timer);
//   // }, [search]);
//   
//   // TODO: Charger les restaurants quand page, debouncedSearch ou filters changent
//   // useEffect(() => {
//   //   fetchRestaurants();
//   // }, [page, debouncedSearch, filters]);
//   
//   // TODO: Fonction helper pour afficher les étoiles
//   // function StarRating({ rating }) {
//   //   const fullStars = Math.floor(rating);
//   //   const hasHalfStar = rating % 1 >= 0.5;
//   //   
//   //   RETOURNER (
//   //     <div className="flex items-center">
//   //       {[...Array(5)].map((_, i) => (
//   //         <span key={i} className={i < fullStars ? 'text-yellow-400' : i === fullStars && hasHalfStar ? 'text-yellow-200' : 'text-gray-300'}>
//   //           ★
//   //         </span>
//   //       ))}
//   //       <span className="ml-2 text-sm text-gray-600">({rating.toFixed(1)})</span>
//   //     </div>
//   //   );
//   // }
//   
//   // TODO: Fonction helper pour formater la devise
//   // function formatCurrency(value) {
//   //   SI typeof value === 'string':
//   //     RETOURNER value;
//   //   RETOURNER `${parseFloat(value).toFixed(4)} MATIC`;
//   // }
//   
//   // TODO: Rendu principal
//   // RETOURNER (
//   //   <div className="restaurants-table">
//   //     <div className="flex items-center justify-between mb-4">
//   //       <h3 className="text-xl font-semibold">Restaurants</h3>
//   //       <div className="flex gap-2">
//   //         <input
//   //           type="text"
//   //           placeholder="Rechercher restaurant..."
//   //           value={search}
//   //           onChange={(e) => setSearch(e.target.value)}
//   //           className="px-4 py-2 border rounded-lg"
//   //         />
//   //         <select
//   //           value={filters.status}
//   //           onChange={(e) => setFilters({ ...filters, status: e.target.value })}
//   //           className="px-4 py-2 border rounded-lg"
//   //         >
//   //           <option value="all">Tous les statuts</option>
//   //           <option value="active">Actifs</option>
//   //           <option value="inactive">Inactifs</option>
//   //         </select>
//   //         <select
//   //           value={filters.cuisine}
//   //           onChange={(e) => setFilters({ ...filters, cuisine: e.target.value })}
//   //           className="px-4 py-2 border rounded-lg"
//   //         >
//   //           <option value="all">Toutes les cuisines</option>
//   //           {cuisines.map(cuisine => (
//   //             <option key={cuisine} value={cuisine}>{cuisine}</option>
//   //           ))}
//   //         </select>
//   //         <input
//   //           type="number"
//   //           placeholder="Rating min"
//   //           min="0"
//   //           max="5"
//   //           step="0.1"
//   //           value={filters.minRating}
//   //           onChange={(e) => setFilters({ ...filters, minRating: parseFloat(e.target.value) || 0 })}
//   //           className="px-4 py-2 border rounded-lg w-24"
//   //         />
//   //       </div>
//   //     </div>
//   //     
//   //     SI loading:
//   //       <div className="flex items-center justify-center h-64">
//   //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
//   //       </div>
//   //     SINON:
//   //       <>
//   //         <div className="table-container">
//   //           <table className="table">
//   //             <thead>
//   //               <tr>
//   //                 <th>Address</th>
//   //                 <th>Name</th>
//   //                 <th>Cuisine</th>
//   //                 <th>Total Orders</th>
//   //                 <th>Revenue</th>
//   //                 <th>Rating</th>
//   //                 <th>Status</th>
//   //                 <th>Actions</th>
//   //               </tr>
//   //             </thead>
//   //             <tbody>
//   //               {restaurants.map((restaurant) => (
//   //                 <tr key={restaurant.address}>
//   //                   <td>{formatAddress(restaurant.address)}</td>
//   //                   <td>{restaurant.name}</td>
//   //                   <td>{restaurant.cuisine}</td>
//   //                   <td>{restaurant.totalOrders || 0}</td>
//   //                   <td>{formatCurrency(restaurant.revenue)}</td>
//   //                   <td><StarRating rating={restaurant.rating || 0} /></td>
//   //                   <td>
//   //                     <span className={`badge ${restaurant.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
//   //                       {restaurant.status}
//   //                     </span>
//   //                   </td>
//   //                   <td>
//   //                     <div className="flex gap-2">
//   //                       <button
//   //                         onClick={() => onViewDetails && onViewDetails(restaurant)}
//   //                         className="btn btn-sm btn-outline"
//   //                       >
//   //                         Voir
//   //                       </button>
//   //                       {restaurant.status === 'active' ? (
//   //                         <button
//   //                           onClick={() => onSuspend && onSuspend(restaurant.address)}
//   //                           className="btn btn-sm btn-danger"
//   //                         >
//   //                           Suspendre
//   //                         </button>
//   //                       ) : (
//   //                         <button
//   //                           onClick={() => onActivate && onActivate(restaurant.address)}
//   //                           className="btn btn-sm btn-admin"
//   //                         >
//   //                           Activer
//   //                         </button>
//   //                       )}
//   //                     </div>
//   //                   </td>
//   //                 </tr>
//   //               ))}
//   //             </tbody>
//   //           </table>
//   //         </div>
//   //         
//   //         {/* Pagination - similaire à UsersTable */}
//   //       </>
//   //   </div>
//   // );
// }

// TODO: Exporter le composant
// export default RestaurantsTable;

