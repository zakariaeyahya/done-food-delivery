/**
 * Composant UsersTable - Table Utilisateurs (Clients)
 * @notice Affiche une table paginée des utilisateurs avec recherche et filtres
 * @dev Debounce recherche 300ms, pagination côté serveur
 */

// TODO: Importer React et hooks
// import React, { useState, useEffect, useCallback } from 'react';

// TODO: Importer les services
// import * as apiService from '../services/api';

// TODO: Importer les utilitaires
// import { formatAddress } from '../utils/web3';

/**
 * Composant UsersTable
 * @param {Function} onViewDetails - Callback pour voir les détails d'un utilisateur
 * @param {Function} onSuspend - Callback pour suspendre un utilisateur
 * @param {Function} onActivate - Callback pour activer un utilisateur
 */
// TODO: Implémenter le composant UsersTable
// function UsersTable({ onViewDetails, onSuspend, onActivate }) {
//   // ÉTAT: users = []
//   // ÉTAT: page = 1
//   // ÉTAT: limit = 10
//   // ÉTAT: search = ""
//   // ÉTAT: filters = { status: "all", hasTokens: "all" }
//   // ÉTAT: total = 0
//   // ÉTAT: loading = true
//   
//   // TODO: Utiliser useState pour gérer les états
//   // const [users, setUsers] = useState([]);
//   // const [page, setPage] = useState(1);
//   // const [limit] = useState(10);
//   // const [search, setSearch] = useState('');
//   // const [filters, setFilters] = useState({ status: 'all', hasTokens: 'all' });
//   // const [total, setTotal] = useState(0);
//   // const [loading, setLoading] = useState(true);
//   
//   // TODO: Fonction pour charger les utilisateurs
//   // async function fetchUsers() {
//   //   ESSAYER:
//   //     setLoading(true);
//   //     
//   //     const data = await apiService.getUsers({
//   //       page,
//   //       limit,
//   //       search: search || undefined,
//   //       status: filters.status !== 'all' ? filters.status : undefined,
//   //       hasTokens: filters.hasTokens !== 'all' ? filters.hasTokens : undefined
//   //     });
//   //     
//   //     setUsers(data.users || []);
//   //     setTotal(data.total || 0);
//   //     setLoading(false);
//   //   CATCH error:
//   //     console.error('Error fetching users:', error);
//   //     setLoading(false);
//   // }
//   
//   // TODO: Charger les utilisateurs quand page, search ou filters changent
//   // useEffect(() => {
//   //   fetchUsers();
//   // }, [page, search, filters]);
//   
//   // TODO: Debounce pour la recherche (300ms)
//   // const [debouncedSearch, setDebouncedSearch] = useState('');
//   // 
//   // useEffect(() => {
//   //   const timer = setTimeout(() => {
//   //     setDebouncedSearch(search);
//   //     setPage(1); // Reset à la première page
//   //   }, 300);
//   //   
//   //   RETOURNER () => clearTimeout(timer);
//   // }, [search]);
//   
//   // TODO: Utiliser debouncedSearch dans le useEffect de fetchUsers
//   // useEffect(() => {
//   //   fetchUsers();
//   // }, [page, debouncedSearch, filters]);
//   
//   // TODO: Fonction helper pour formater la devise
//   // function formatCurrency(value) {
//   //   SI typeof value === 'string':
//   //     RETOURNER value;
//   //   const eth = parseFloat(value);
//   //   RETOURNER `${eth.toFixed(4)} MATIC (${(eth * 0.8).toFixed(2)} EUR)`;
//   // }
//   
//   // TODO: Fonction helper pour formater les tokens
//   // function formatTokens(value) {
//   //   SI typeof value === 'string':
//   //     RETOURNER value;
//   //   RETOURNER `${parseFloat(value).toFixed(2)} DONE`;
//   // }
//   
//   // TODO: Fonction pour changer de page
//   // function handlePageChange(newPage) {
//   //   setPage(newPage);
//   //   window.scrollTo({ top: 0, behavior: 'smooth' });
//   // }
//   
//   // TODO: Rendu principal
//   // RETOURNER (
//   //   <div className="users-table">
//   //     <div className="flex items-center justify-between mb-4">
//   //       <h3 className="text-xl font-semibold">Utilisateurs</h3>
//   //       <div className="flex gap-2">
//   //         <input
//   //           type="text"
//   //           placeholder="Rechercher par nom, email, adresse..."
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
//   //           value={filters.hasTokens}
//   //           onChange={(e) => setFilters({ ...filters, hasTokens: e.target.value })}
//   //           className="px-4 py-2 border rounded-lg"
//   //         >
//   //           <option value="all">Tous</option>
//   //           <option value="yes">Avec tokens</option>
//   //           <option value="no">Sans tokens</option>
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
//   //                 <th>Email</th>
//   //                 <th>Total Orders</th>
//   //                 <th>Total Spent</th>
//   //                 <th>Tokens DONE</th>
//   //                 <th>Status</th>
//   //                 <th>Actions</th>
//   //               </tr>
//   //             </thead>
//   //             <tbody>
//   //               {users.map((user) => (
//   //                 <tr key={user.address}>
//   //                   <td>{formatAddress(user.address)}</td>
//   //                   <td>{user.name || 'N/A'}</td>
//   //                   <td>{user.email || 'N/A'}</td>
//   //                   <td>{user.totalOrders || 0}</td>
//   //                   <td>{formatCurrency(user.totalSpent)}</td>
//   //                   <td>{formatTokens(user.doneBalance)}</td>
//   //                   <td>
//   //                     <span className={`badge ${user.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
//   //                       {user.status}
//   //                     </span>
//   //                   </td>
//   //                   <td>
//   //                     <div className="flex gap-2">
//   //                       <button
//   //                         onClick={() => onViewDetails && onViewDetails(user)}
//   //                         className="btn btn-sm btn-outline"
//   //                       >
//   //                         Voir
//   //                       </button>
//   //                       {user.status === 'active' ? (
//   //                         <button
//   //                           onClick={() => onSuspend && onSuspend(user.address)}
//   //                           className="btn btn-sm btn-danger"
//   //                         >
//   //                           Suspendre
//   //                         </button>
//   //                       ) : (
//   //                         <button
//   //                           onClick={() => onActivate && onActivate(user.address)}
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
//   //         {/* Pagination */}
//   //         <div className="flex items-center justify-between mt-4">
//   //           <div className="text-sm text-gray-600">
//   //             Affichage {((page - 1) * limit) + 1} à {Math.min(page * limit, total)} sur {total} utilisateurs
//   //           </div>
//   //           <div className="flex gap-2">
//   //             <button
//   //               onClick={() => handlePageChange(page - 1)}
//   //               disabled={page === 1}
//   //               className="btn btn-outline"
//   //             >
//   //               Précédent
//   //             </button>
//   //             <span className="px-4 py-2">Page {page} sur {Math.ceil(total / limit)}</span>
//   //             <button
//   //               onClick={() => handlePageChange(page + 1)}
//   //               disabled={page >= Math.ceil(total / limit)}
//   //               className="btn btn-outline"
//   //             >
//   //               Suivant
//   //             </button>
//   //           </div>
//   //         </div>
//   //       </>
//   //   </div>
//   // );
// }

// TODO: Exporter le composant
// export default UsersTable;

