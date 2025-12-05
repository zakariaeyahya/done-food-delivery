/**
 * Page OrdersPage - Gestion Toutes Commandes Plateforme
 * @notice Affiche toutes les commandes avec filtres avancés et actions admin
 * @dev Modal détails avec timeline, transaction hash, items IPFS
 */

// TODO: Importer React et hooks
// import React, { useState, useEffect } from 'react';

// TODO: Importer les services
// import * as apiService from '../services/api';

// TODO: Importer les utilitaires
// import { formatAddress } from '../utils/web3';

/**
 * Page OrdersPage
 */
// TODO: Implémenter le composant OrdersPage
// function OrdersPage() {
//   // ÉTAT: orders = []
//   // ÉTAT: filters = { status: "all", dateFrom: null, dateTo: null }
//   // ÉTAT: selectedOrder = null
//   // ÉTAT: showModal = false
//   // ÉTAT: loading = true
//   
//   // TODO: Utiliser useState pour gérer les états
//   // const [orders, setOrders] = useState([]);
//   // const [filters, setFilters] = useState({ status: 'all', dateFrom: null, dateTo: null });
//   // const [selectedOrder, setSelectedOrder] = useState(null);
//   // const [showModal, setShowModal] = useState(false);
//   // const [loading, setLoading] = useState(true);
//   
//   // TODO: Fonction pour charger les commandes
//   // async function fetchOrders() {
//   //   ESSAYER:
//   //     setLoading(true);
//   //     
//   //     // Note: apiService.getOrders() doit être implémenté dans api.js
//   //     // const data = await apiService.getOrders(filters);
//   //     // setOrders(data.orders || []);
//   //     
//   //     setLoading(false);
//   //   CATCH error:
//   //     console.error('Error fetching orders:', error);
//   //     setLoading(false);
//   // }
//   
//   // TODO: Charger les commandes quand filters changent
//   // useEffect(() => {
//   //   fetchOrders();
//   // }, [filters]);
//   
//   // TODO: Fonction pour voir les détails d'une commande
//   // function handleViewDetails(order) {
//   //   setSelectedOrder(order);
//   //   setShowModal(true);
//   // }
//   
//   // TODO: Fonction pour annuler une commande
//   // async function handleCancelOrder(orderId) {
//   //   const confirmed = window.confirm('Êtes-vous sûr de vouloir annuler cette commande?');
//   //   SI !confirmed:
//   //     RETOURNER;
//   //   
//   //   ESSAYER:
//   //     // Appeler l'API pour annuler (si endpoint existe)
//   //     // await apiService.cancelOrder(orderId);
//   //     
//   //     alert('Commande annulée avec succès');
//   //     await fetchOrders(); // Actualiser la liste
//   //   CATCH error:
//   //     console.error('Error canceling order:', error);
//   //     alert('Erreur lors de l\'annulation: ' + error.message);
//   // }
//   
//   // TODO: Fonction pour forcer la résolution d'un litige
//   // async function handleForceResolve(orderId) {
//   //   const confirmed = window.confirm('Êtes-vous sûr de vouloir forcer la résolution de ce litige?');
//   //   SI !confirmed:
//   //     RETOURNER;
//   //   
//   //   ESSAYER:
//   //     // Appeler l'API pour forcer résolution (si endpoint existe)
//   //     // await apiService.forceResolveOrder(orderId);
//   //     
//   //     alert('Résolution forcée avec succès');
//   //     await fetchOrders(); // Actualiser la liste
//   //   CATCH error:
//   //     console.error('Error forcing resolve:', error);
//   //     alert('Erreur lors de la résolution: ' + error.message);
//   // }
//   
//   // TODO: Fonction helper pour formater la date
//   // function formatDate(dateString) {
//   //   const date = new Date(dateString);
//   //   RETOURNER date.toLocaleDateString('fr-FR', {
//   //     day: '2-digit',
//   //     month: '2-digit',
//   //     year: 'numeric',
//   //     hour: '2-digit',
//   //     minute: '2-digit'
//   //   });
//   // }
//   
//   // TODO: Fonction helper pour formater la devise
//   // function formatCurrency(value) {
//   //   SI typeof value === 'string':
//   //     RETOURNER value;
//   //   RETOURNER `${parseFloat(value).toFixed(4)} MATIC`;
//   // }
//   
//   // TODO: Composant StatusBadge
//   // function StatusBadge({ status }) {
//   //   const statusColors = {
//   //     CREATED: 'bg-blue-100 text-blue-800',
//   //     PREPARING: 'bg-yellow-100 text-yellow-800',
//   //     IN_DELIVERY: 'bg-purple-100 text-purple-800',
//   //     DELIVERED: 'bg-green-100 text-green-800',
//   //     DISPUTED: 'bg-red-100 text-red-800'
//   //   };
//   //   
//   //   RETOURNER (
//   //     <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
//   //       {status}
//   //     </span>
//   //   );
//   // }
//   
//   // TODO: Composant OrderDetailsModal
//   // function OrderDetailsModal({ order, onClose }) {
//   //   SI !order:
//   //     RETOURNER null;
//   //   
//   //   // TODO: Charger les items depuis IPFS si nécessaire
//   //   const ipfsGateway = 'https://gateway.pinata.cloud/ipfs/';
//   //   
//   //   RETOURNER (
//   //     <div className="modal-overlay" onClick={onClose}>
//   //       <div className="modal-content max-w-4xl" onClick={(e) => e.stopPropagation()}>
//   //         <div className="flex items-center justify-between mb-4">
//   //           <h3 className="text-xl font-semibold">Détails Commande #{order.orderId}</h3>
//   //           <button onClick={onClose} className="btn btn-sm">×</button>
//   //         </div>
//   //         
//   //         <div className="space-y-4">
//   //           {/* Timeline des statuts */}
//   //           <div>
//   //             <h4 className="font-semibold mb-2">Timeline</h4>
//   //             <div className="space-y-2">
//   //               <div className="flex items-center">
//   //                 <div className={`w-3 h-3 rounded-full ${order.status === 'CREATED' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
//   //                 <span className="ml-2">Créée - {formatDate(order.createdAt)}</span>
//   //               </div>
//   //               {/* Répéter pour chaque statut */}
//   //             </div>
//   //           </div>
//   //           
//   //           {/* Transaction hash */}
//   //           <div>
//   //             <strong>Transaction Hash:</strong>
//   //             <a
//   //               href={`https://mumbai.polygonscan.com/tx/${order.txHash}`}
//   //               target="_blank"
//   //               rel="noopener noreferrer"
//   //               className="ml-2 text-primary-600 hover:underline"
//   //             >
//   //               {order.txHash}
//   //             </a>
//   //           </div>
//   //           
//   //           {/* Items commande depuis IPFS */}
//   //           <div>
//   //             <h4 className="font-semibold mb-2">Items</h4>
//   //             {/* Charger depuis IPFS et afficher */}
//   //           </div>
//   //           
//   //           {/* Livreur assigné */}
//   //           <div>
//   //             <strong>Livreur:</strong> {order.deliverer ? formatAddress(order.deliverer) : 'Non assigné'}
//   //           </div>
//   //         </div>
//   //       </div>
//   //     </div>
//   //   );
//   // }
//   
//   // TODO: Rendu principal
//   // RETOURNER (
//   //   <div className="orders-page">
//   //     <div className="mb-6">
//   //       <h1 className="text-3xl font-bold">Gestion Commandes</h1>
//   //       <p className="text-gray-600 mt-2">Gérer toutes les commandes de la plateforme</p>
//   //     </div>
//   //     
//   //     {/* Filtres */}
//   //     <div className="card mb-6">
//   //       <div className="flex flex-wrap gap-4">
//   //         <select
//   //           value={filters.status}
//   //           onChange={(e) => setFilters({ ...filters, status: e.target.value })}
//   //           className="px-4 py-2 border rounded-lg"
//   //         >
//   //           <option value="all">Tous les statuts</option>
//   //           <option value="CREATED">Créées</option>
//   //           <option value="PREPARING">En préparation</option>
//   //           <option value="IN_DELIVERY">En livraison</option>
//   //           <option value="DELIVERED">Livrées</option>
//   //           <option value="DISPUTED">En litige</option>
//   //         </select>
//   //         <input
//   //           type="date"
//   //           value={filters.dateFrom || ''}
//   //           onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
//   //           className="px-4 py-2 border rounded-lg"
//   //           placeholder="Date de début"
//   //         />
//   //         <input
//   //           type="date"
//   //           value={filters.dateTo || ''}
//   //           onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
//   //           className="px-4 py-2 border rounded-lg"
//   //           placeholder="Date de fin"
//   //         />
//   //       </div>
//   //     </div>
//   //     
//   //     {/* Table des commandes */}
//   //     SI loading:
//   //       <div className="flex items-center justify-center h-64">
//   //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
//   //       </div>
//   //     SINON:
//   //       <div className="table-container">
//   //         <table className="table">
//   //           <thead>
//   //             <tr>
//   //               <th>Order ID</th>
//   //               <th>Client</th>
//   //               <th>Restaurant</th>
//   //               <th>Total</th>
//   //               <th>Status</th>
//   //               <th>Date</th>
//   //               <th>Actions</th>
//   //             </tr>
//   //           </thead>
//   //           <tbody>
//   //             {orders.map((order) => (
//   //               <tr key={order.orderId}>
//   //                 <td>{order.orderId}</td>
//   //                 <td>{formatAddress(order.client)}</td>
//   //                 <td>{order.restaurantName || formatAddress(order.restaurant)}</td>
//   //                 <td>{formatCurrency(order.total)}</td>
//   //                 <td><StatusBadge status={order.status} /></td>
//   //                 <td>{formatDate(order.createdAt)}</td>
//   //                 <td>
//   //                   <div className="flex gap-2">
//   //                     <button
//   //                       onClick={() => handleViewDetails(order)}
//   //                       className="btn btn-sm btn-outline"
//   //                     >
//   //                       Voir
//   //                     </button>
//   //                     {order.status !== 'DELIVERED' && (
//   //                       <button
//   //                         onClick={() => handleCancelOrder(order.orderId)}
//   //                         className="btn btn-sm btn-danger"
//   //                       >
//   //                         Annuler
//   //                       </button>
//   //                     )}
//   //                     {order.status === 'DISPUTED' && (
//   //                       <button
//   //                         onClick={() => handleForceResolve(order.orderId)}
//   //                         className="btn btn-sm btn-admin"
//   //                       >
//   //                         Forcer résolution
//   //                       </button>
//   //                     )}
//   //                   </div>
//   //                 </td>
//   //               </tr>
//   //             ))}
//   //           </tbody>
//   //         </table>
//   //       </div>
//   //     
//   //     {/* Modal détails */}
//   //     SI showModal:
//   //       <OrderDetailsModal
//   //         order={selectedOrder}
//   //         onClose={() => {
//   //           setShowModal(false);
//   //           setSelectedOrder(null);
//   //         }}
//   //       />
//   //   </div>
//   // );
// }

// TODO: Exporter le composant
// export default OrdersPage;

