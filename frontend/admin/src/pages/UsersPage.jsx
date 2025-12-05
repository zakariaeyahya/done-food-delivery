/**
 * Page UsersPage - Gestion Utilisateurs
 * @notice Gestion complète des utilisateurs avec table et actions
 * @dev Intègre UsersTable component avec modal détails
 */

// TODO: Importer React et hooks
// import React, { useState } from 'react';

// TODO: Importer les services
// import * as apiService from '../services/api';

// TODO: Importer les composants
// import UsersTable from '../components/UsersTable';

// TODO: Importer les utilitaires
// import { formatAddress } from '../utils/web3';

/**
 * Page UsersPage
 */
// TODO: Implémenter le composant UsersPage
// function UsersPage() {
//   // ÉTAT: selectedUser = null
//   // ÉTAT: showModal = false
//   
//   // TODO: Utiliser useState pour gérer les états
//   // const [selectedUser, setSelectedUser] = useState(null);
//   // const [showModal, setShowModal] = useState(false);
//   
//   // TODO: Fonction pour suspendre un utilisateur
//   // async function handleSuspend(userAddress) {
//   //   const confirmed = window.confirm(`Êtes-vous sûr de vouloir suspendre l'utilisateur ${formatAddress(userAddress)}?`);
//   //   SI !confirmed:
//   //     RETOURNER;
//   //   
//   //   ESSAYER:
//   //     // Appeler l'API pour suspendre (si endpoint existe)
//   //     // await apiService.suspendUser(userAddress);
//   //     
//   //     alert('Utilisateur suspendu avec succès');
//   //     // Le UsersTable se rafraîchira automatiquement
//   //   CATCH error:
//   //     console.error('Error suspending user:', error);
//   //     alert('Erreur lors de la suspension: ' + error.message);
//   // }
//   
//   // TODO: Fonction pour activer un utilisateur
//   // async function handleActivate(userAddress) {
//   //   ESSAYER:
//   //     // Appeler l'API pour activer (si endpoint existe)
//   //     // await apiService.activateUser(userAddress);
//   //     
//   //     alert('Utilisateur activé avec succès');
//   //     // Le UsersTable se rafraîchira automatiquement
//   //   CATCH error:
//   //     console.error('Error activating user:', error);
//   //     alert('Erreur lors de l\'activation: ' + error.message);
//   // }
//   
//   // TODO: Fonction pour voir les détails d'un utilisateur
//   // async function handleViewDetails(user) {
//   //   ESSAYER:
//   //     // Charger les détails complets depuis l'API (si endpoint existe)
//   //     // const userDetails = await apiService.getUserDetails(user.address);
//   //     // setSelectedUser(userDetails);
//   //     
//   //     setSelectedUser(user); // Utiliser les données de base pour l'instant
//   //     setShowModal(true);
//   //   CATCH error:
//   //     console.error('Error fetching user details:', error);
//   //     alert('Erreur lors du chargement des détails: ' + error.message);
//   // }
//   
//   // TODO: Composant UserDetailsModal
//   // function UserDetailsModal({ user, onClose }) {
//   //   SI !user:
//   //     RETOURNER null;
//   //   
//   //   // TODO: Charger l'historique des commandes (si disponible)
//   //   // const [orderHistory, setOrderHistory] = useState([]);
//   //   
//   //   RETOURNER (
//   //     <div className="modal-overlay" onClick={onClose}>
//   //       <div className="modal-content max-w-3xl" onClick={(e) => e.stopPropagation()}>
//   //         <div className="flex items-center justify-between mb-4">
//   //           <h3 className="text-xl font-semibold">Détails Utilisateur</h3>
//   //           <button onClick={onClose} className="btn btn-sm">×</button>
//   //         </div>
//   //         
//   //         <div className="space-y-4">
//   //           {/* Informations complètes */}
//   //           <div>
//   //             <h4 className="font-semibold mb-2">Informations</h4>
//   //             <div className="space-y-2">
//   //               <p><strong>Address:</strong> {formatAddress(user.address)}</p>
//   //               <p><strong>Name:</strong> {user.name || 'N/A'}</p>
//   //               <p><strong>Email:</strong> {user.email || 'N/A'}</p>
//   //               <p><strong>Status:</strong> {user.status}</p>
//   //             </div>
//   //           </div>
//   //           
//   //           {/* Tokens DONE détenus */}
//   //           <div>
//   //             <h4 className="font-semibold mb-2">Tokens DONE</h4>
//   //             <p className="text-2xl font-bold">{user.doneBalance || '0'} DONE</p>
//   //           </div>
//   //           
//   //           {/* Stats fidélité */}
//   //           <div>
//   //             <h4 className="font-semibold mb-2">Stats Fidélité</h4>
//   //             <div className="grid grid-cols-3 gap-4">
//   //               <div>
//   //                 <p className="text-sm text-gray-600">Total Commandes</p>
//   //                 <p className="text-xl font-bold">{user.totalOrders || 0}</p>
//   //               </div>
//   //               <div>
//   //                 <p className="text-sm text-gray-600">Total Dépensé</p>
//   //                 <p className="text-xl font-bold">{user.totalSpent || '0 MATIC'}</p>
//   //               </div>
//   //               <div>
//   //                 <p className="text-sm text-gray-600">Tokens Gagnés</p>
//   //                 <p className="text-xl font-bold">{user.doneBalance || '0 DONE'}</p>
//   //               </div>
//   //             </div>
//   //           </div>
//   //           
//   //           {/* Historique commandes */}
//   //           <div>
//   //             <h4 className="font-semibold mb-2">Historique Commandes</h4>
//   //             <div className="text-center text-gray-500 py-4">
//   //               Historique à charger depuis l'API
//   //             </div>
//   //           </div>
//   //         </div>
//   //       </div>
//   //     </div>
//   //   );
//   // }
//   
//   // TODO: Rendu principal
//   // RETOURNER (
//   //   <div className="users-page">
//   //     <div className="mb-6">
//   //       <h1 className="text-3xl font-bold">Gestion Utilisateurs</h1>
//   //       <p className="text-gray-600 mt-2">Gérer tous les utilisateurs (clients) de la plateforme</p>
//   //     </div>
//   //     
//   //     {/* Intègre UsersTable */}
//   //     <UsersTable
//   //       onViewDetails={handleViewDetails}
//   //       onSuspend={handleSuspend}
//   //       onActivate={handleActivate}
//   //     />
//   //     
//   //     {/* Modal détails */}
//   //     SI showModal:
//   //       <UserDetailsModal
//   //         user={selectedUser}
//   //         onClose={() => {
//   //           setShowModal(false);
//   //           setSelectedUser(null);
//   //         }}
//   //       />
//   //   </div>
//   // );
// }

// TODO: Exporter le composant
// export default UsersPage;

