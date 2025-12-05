/**
 * Composant DeliverersTable - Table Livreurs
 * @notice Affiche une table paginée des livreurs avec recherche et filtres
 * @dev Debounce recherche 300ms, affiche warning si non staké
 */

// TODO: Importer React et hooks
// import React, { useState, useEffect } from 'react';

// TODO: Importer les services
// import * as apiService from '../services/api';

// TODO: Importer les utilitaires
// import { formatAddress } from '../utils/web3';

/**
 * Composant DeliverersTable
 * @param {Function} onViewDetails - Callback pour voir les détails d'un livreur
 * @param {Function} onSuspend - Callback pour suspendre un livreur
 * @param {Function} onActivate - Callback pour activer un livreur
 */
// TODO: Implémenter le composant DeliverersTable
// function DeliverersTable({ onViewDetails, onSuspend, onActivate }) {
//   // ÉTAT: deliverers = []
//   // ÉTAT: page = 1
//   // ÉTAT: limit = 10
//   // ÉTAT: search = ""
//   // ÉTAT: filters = { staked: "all", available: "all" }
//   // ÉTAT: total = 0
//   // ÉTAT: loading = true
//   
//   // TODO: Utiliser useState pour gérer les états
//   // const [deliverers, setDeliverers] = useState([]);
//   // const [page, setPage] = useState(1);
//   // const [limit] = useState(10);
//   // const [search, setSearch] = useState('');
//   // const [filters, setFilters] = useState({ staked: 'all', available: 'all' });
//   // const [total, setTotal] = useState(0);
//   // const [loading, setLoading] = useState(true);
//   
//   // TODO: Fonction pour charger les livreurs
//   // async function fetchDeliverers() {
//   //   ESSAYER:
//   //     setLoading(true);
//   //     
//   //     const data = await apiService.getDeliverers({
//   //       page,
//   //       limit,
//   //       search: search || undefined,
//   //       staked: filters.staked !== 'all' ? filters.staked : undefined,
//   //       available: filters.available !== 'all' ? filters.available : undefined
//   //     });
//   //     
//   //     setDeliverers(data.deliverers || []);
//   //     setTotal(data.total || 0);
//   //     setLoading(false);
//   //   CATCH error:
//   //     console.error('Error fetching deliverers:', error);
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
//   // TODO: Charger les livreurs quand page, debouncedSearch ou filters changent
//   // useEffect(() => {
//   //   fetchDeliverers();
//   // }, [page, debouncedSearch, filters]);
//   
//   // TODO: Fonction helper pour formater le montant staké
//   // function formatStakedAmount(amount) {
//   //   SI !amount OU parseFloat(amount) === 0:
//   //     RETOURNER (
//   //       <span className="text-warning-600 font-semibold">Non staké</span>
//   //     );
//   //   RETOURNER `${parseFloat(amount).toFixed(4)} MATIC`;
//   // }
//   
//   // TODO: Fonction helper pour formater la devise
//   // function formatCurrency(value) {
//   //   SI typeof value === 'string':
//   //     RETOURNER value;
//   //   RETOURNER `${parseFloat(value).toFixed(4)} MATIC`;
//   // }
//   
//   // TODO: Fonction helper pour afficher les étoiles (similaire à RestaurantsTable)
//   // function StarRating({ rating }) { ... }
//   
//   // TODO: Rendu principal
//   // RETOURNER (
//   //   <div className="deliverers-table">
//   //     <div className="flex items-center justify-between mb-4">
//   //       <h3 className="text-xl font-semibold">Livreurs</h3>
//   //       <div className="flex gap-2">
//   //         <input
//   //           type="text"
//   //           placeholder="Rechercher livreur..."
//   //           value={search}
//   //           onChange={(e) => setSearch(e.target.value)}
//   //           className="px-4 py-2 border rounded-lg"
//   //         />
//   //         <select
//   //           value={filters.staked}
//   //           onChange={(e) => setFilters({ ...filters, staked: e.target.value })}
//   //           className="px-4 py-2 border rounded-lg"
//   //         >
//   //           <option value="all">Tous</option>
//   //           <option value="yes">Stakés</option>
//   //           <option value="no">Non stakés</option>
//   //         </select>
//   //         <select
//   //           value={filters.available}
//   //           onChange={(e) => setFilters({ ...filters, available: e.target.value })}
//   //           className="px-4 py-2 border rounded-lg"
//   //         >
//   //           <option value="all">Tous</option>
//   //           <option value="yes">Disponibles</option>
//   //           <option value="no">Indisponibles</option>
//   //         </select>
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
//   //                 <th>Vehicle</th>
//   //                 <th>Staked Amount</th>
//   //                 <th>Total Deliveries</th>
//   //                 <th>Rating</th>
//   //                 <th>Earnings</th>
//   //                 <th>Status</th>
//   //                 <th>Actions</th>
//   //               </tr>
//   //             </thead>
//   //             <tbody>
//   //               {deliverers.map((deliverer) => (
//   //                 <tr key={deliverer.address}>
//   //                   <td>{formatAddress(deliverer.address)}</td>
//   //                   <td>{deliverer.name || 'N/A'}</td>
//   //                   <td>{deliverer.vehicle || 'N/A'}</td>
//   //                   <td>{formatStakedAmount(deliverer.stakedAmount)}</td>
//   //                   <td>{deliverer.totalDeliveries || 0}</td>
//   //                   <td><StarRating rating={deliverer.rating || 0} /></td>
//   //                   <td>{formatCurrency(deliverer.earnings)}</td>
//   //                   <td>
//   //                     <span className={`badge ${deliverer.status === 'staked' ? 'badge-success' : 'badge-warning'}`}>
//   //                       {deliverer.status}
//   //                     </span>
//   //                   </td>
//   //                   <td>
//   //                     <div className="flex gap-2">
//   //                       <button
//   //                         onClick={() => onViewDetails && onViewDetails(deliverer)}
//   //                         className="btn btn-sm btn-outline"
//   //                       >
//   //                         Voir
//   //                       </button>
//   //                       {deliverer.status === 'active' ? (
//   //                         <button
//   //                           onClick={() => onSuspend && onSuspend(deliverer.address)}
//   //                           className="btn btn-sm btn-danger"
//   //                         >
//   //                           Suspendre
//   //                         </button>
//   //                       ) : (
//   //                         <button
//   //                           onClick={() => onActivate && onActivate(deliverer.address)}
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
// export default DeliverersTable;

