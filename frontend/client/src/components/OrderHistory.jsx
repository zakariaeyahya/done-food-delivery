/**
 * Composant OrderHistory
 * @notice Historique des commandes passées avec pagination et actions
 * @dev Table avec pagination, reorder, avis, téléchargement reçu
 */

// TODO: Importer React et hooks nécessaires
// import { useState, useEffect, useMemo } from 'react';
// import { useNavigate } from 'react-router-dom';

// TODO: Importer les services
// import * as api from '../services/api';
// import * as ipfs from '../services/ipfs';
// import { formatDate, formatPrice } from '../utils/formatters';

/**
 * Composant OrderHistory
 * @param {Object} props - Props du composant
 * @param {string} props.clientAddress - Adresse wallet du client
 * @param {Function} props.onAddToCart - Callback pour ajouter items au panier
 * @returns {JSX.Element} Historique des commandes
 */
// TODO: Créer le composant OrderHistory
// function OrderHistory({ clientAddress, onAddToCart }) {
//   const navigate = useNavigate();
//   
//   // State pour les commandes
//   const [orders, setOrders] = useState([]);
//   
//   // State pour la commande sélectionnée (pour modal avis)
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   
//   // State pour l'ouverture du modal avis
//   const [reviewModal, setReviewModal] = useState(false);
//   
//   // State pour le rating dans le modal
//   const [rating, setRating] = useState(0);
//   
//   // State pour le commentaire dans le modal
//   const [comment, setComment] = useState('');
//   
//   // State pour le chargement
//   const [loading, setLoading] = useState(false);
//   
//   // State pour la pagination
//   const [currentPage, setCurrentPage] = useState(1);
//   const ordersPerPage = 10;
//   
//   // State pour la soumission d'avis
//   const [submittingReview, setSubmittingReview] = useState(false);
//   
//   // TODO: Fonction pour récupérer les commandes
//   // useEffect(() => {
//   //   async function fetchOrders() {
//   //     ESSAYER:
//   //       setLoading(true);
//   //       const ordersData = await api.getOrdersByClient(clientAddress);
//   //       // Trier par date décroissante (plus récentes en premier)
//   //       ordersData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//   //       setOrders(ordersData);
//   //     CATCH error:
//   //       console.error('Error fetching orders:', error);
//   //     FINALLY:
//   //       setLoading(false);
//   //   }
//   //   
//   //   SI clientAddress:
//   //     fetchOrders();
//   // }, [clientAddress]);
//   
//   // TODO: Calculer les commandes paginées
//   // const paginatedOrders = useMemo(() => {
//   //   const startIndex = (currentPage - 1) * ordersPerPage;
//   //   const endIndex = startIndex + ordersPerPage;
//   //   RETOURNER orders.slice(startIndex, endIndex);
//   // }, [orders, currentPage]);
//   
//   // TODO: Calculer le nombre total de pages
//   // const totalPages = Math.ceil(orders.length / ordersPerPage);
//   
//   // TODO: Fonction pour obtenir le label du status
//   // function getStatusLabel(status) {
//   //   const statusMap = {
//   //     'CREATED': 'Créée',
//   //     'PREPARING': 'En préparation',
//   //     'IN_DELIVERY': 'En livraison',
//   //     'DELIVERED': 'Livrée',
//   //     'DISPUTED': 'En litige'
//   //   };
//   //   RETOURNER statusMap[status] || status;
//   // }
//   
//   // TODO: Fonction pour obtenir la classe CSS du status
//   // function getStatusClass(status) {
//   //   const classMap = {
//   //     'CREATED': 'status-created',
//   //     'PREPARING': 'status-preparing',
//   //     'IN_DELIVERY': 'status-delivery',
//   //     'DELIVERED': 'status-delivered',
//   //     'DISPUTED': 'status-disputed'
//   //   };
//   //   RETOURNER classMap[status] || '';
//   // }
//   
//   // TODO: Fonction pour commander à nouveau
//   // function handleReorder(order) {
//   //   SI onAddToCart && order.items:
//   //     // Ajouter tous les items au panier
//   //     order.items.forEach(item => {
//   //       onAddToCart({
//   //         ...item,
//   //         restaurantId: order.restaurantId
//   //       });
//   //     });
//   //     
//   //     // Naviger vers checkout
//   //     navigate('/checkout');
//   //   }
//   // }
//   
//   // TODO: Fonction pour ouvrir le modal d'avis
//   // function handleOpenReview(order) {
//   //   setSelectedOrder(order);
//   //   setRating(0);
//   //   setComment('');
//   //   setReviewModal(true);
//   // }
//   
//   // TODO: Fonction pour fermer le modal
//   // function handleCloseReview() {
//   //   setReviewModal(false);
//   //   setSelectedOrder(null);
//   //   setRating(0);
//   //   setComment('');
//   // }
//   
//   // TODO: Fonction pour soumettre l'avis
//   // async function handleSubmitReview() {
//   //   ESSAYER:
//   //     SI !selectedOrder || rating === 0:
//   //       alert('Veuillez sélectionner une note');
//   //       RETOURNER;
//   //     
//   //     setSubmittingReview(true);
//   //     
//   //     await api.submitReview(
//   //       selectedOrder.orderId,
//   //       rating,
//   //       comment,
//   //       clientAddress
//   //     );
//   //     
//   //     // Fermer le modal
//   //     handleCloseReview();
//   //     
//   //     // Afficher message succès
//   //     alert('Avis soumis avec succès!');
//   //     
//   //     // Rafraîchir les commandes
//   //     // TODO: Re-fetch orders
//   //     
//   //   CATCH error:
//   //     console.error('Error submitting review:', error);
//   //     alert('Erreur lors de la soumission de l\'avis');
//   //   FINALLY:
//   //     setSubmittingReview(false);
//   // }
//   
//   // TODO: Fonction pour télécharger le reçu
//   // async function handleDownloadReceipt(order) {
//   //   ESSAYER:
//   //     SI !order.ipfsHash:
//   //       alert('Reçu non disponible');
//   //       RETOURNER;
//   //     
//   //     // Récupérer les données depuis IPFS
//   //     const receiptData = await ipfs.getJSON(order.ipfsHash);
//   //     
//   //     // Créer un blob JSON
//   //     const blob = new Blob([JSON.stringify(receiptData, null, 2)], { type: 'application/json' });
//   //     const url = URL.createObjectURL(blob);
//   //     
//   //     // Créer un lien de téléchargement
//   //     const a = document.createElement('a');
//   //     a.href = url;
//   //     a.download = `receipt-order-${order.orderId}.json`;
//   //     a.click();
//   //     
//   //     // Nettoyer
//   //     URL.revokeObjectURL(url);
//   //     
//   //   CATCH error:
//   //     console.error('Error downloading receipt:', error);
//   //     alert('Erreur lors du téléchargement du reçu');
//   //   }
//   // }
//   
//   // TODO: Fonction pour afficher les étoiles de rating
//   // function renderStars(rating) {
//   //   const stars = [];
//   //   POUR i DE 1 À 5:
//   //     SI i <= rating:
//   //       stars.push(
//   //         <span key={i} onClick={() => setRating(i)} className="star filled">⭐</span>
//   //       );
//   //     SINON:
//   //       stars.push(
//   //         <span key={i} onClick={() => setRating(i)} className="star empty">☆</span>
//   //       );
//   //   RETOURNER stars;
//   // }
//   
//   // TODO: Rendu du composant
//   // RETOURNER (
//   //   <div className="order-history">
//   //     <h1>Historique des commandes</h1>
//   //     
//   //     SI loading:
//   //       <div className="loading">Chargement...</div>
//   //     
//   //     SINON SI orders.length === 0:
//   //       <div className="no-orders">
//   //         <p>Aucune commande passée</p>
//   //       </div>
//   //     
//   //     SINON:
//   //       <>
//   //         {/* Table des commandes */}
//   //         <table className="orders-table">
//   //           <thead>
//   //             <tr>
//   //               <th>Order ID</th>
//   //               <th>Restaurant</th>
//   //               <th>Date</th>
//   //               <th>Total</th>
//   //               <th>Status</th>
//   //               <th>Actions</th>
//   //             </tr>
//   //           </thead>
//   //           <tbody>
//   //             {paginatedOrders.map(order => (
//   //               <tr key={order.orderId}>
//   //                 <td>#{order.orderId}</td>
//   //                 <td>{order.restaurantName}</td>
//   //                 <td>{formatDate(order.createdAt)}</td>
//   //                 <td>{formatPrice(order.totalAmount, 'MATIC')}</td>
//   //                 <td>
//   //                   <span className={`status-badge ${getStatusClass(order.status)}`}>
//   //                     {getStatusLabel(order.status)}
//   //                   </span>
//   //                 </td>
//   //                 <td>
//   //                   <div className="actions">
//   //                     <button
//   //                       onClick={() => navigate(`/tracking/${order.orderId}`)}
//   //                       className="btn btn-sm btn-primary"
//   //                     >
//   //                       Suivre
//   //                     </button>
//   //                     
//   //                     SI order.status === 'DELIVERED':
//   //                       <button
//   //                         onClick={() => handleOpenReview(order)}
//   //                         className="btn btn-sm btn-secondary"
//   //                       >
//   //                         Laisser avis
//   //                       </button>
//   //                     
//   //                     <button
//   //                       onClick={() => handleReorder(order)}
//   //                       className="btn btn-sm btn-ghost"
//   //                     >
//   //                       Commander à nouveau
//   //                     </button>
//   //                     
//   //                     <button
//   //                       onClick={() => handleDownloadReceipt(order)}
//   //                       className="btn btn-sm btn-ghost"
//   //                     >
//   //                       📥 Reçu
//   //                     </button>
//   //                   </div>
//   //                 </td>
//   //               </tr>
//   //             ))}
//   //           </tbody>
//   //         </table>
//   //         
//   //         {/* Pagination */}
//   //         SI totalPages > 1:
//   //           <div className="pagination">
//   //             <button
//   //               onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
//   //               disabled={currentPage === 1}
//   //             >
//   //               Précédent
//   //             </button>
//   //             <span>Page {currentPage} / {totalPages}</span>
//   //             <button
//   //               onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
//   //               disabled={currentPage === totalPages}
//   //             >
//   //               Suivant
//   //             </button>
//   //           </div>
//   //       </>
//   //     
//   //     {/* Modal avis */}
//   //     SI reviewModal && selectedOrder:
//   //       <div className="modal-overlay" onClick={handleCloseReview}>
//   //         <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//   //           <h2>Laisser un avis</h2>
//   //           <p>Commande #{selectedOrder.orderId}</p>
//   //           
//   //           <div className="rating-selector">
//   //             <label>Note:</label>
//   //             <div className="stars">
//   //               {renderStars(rating)}
//   //             </div>
//   //           </div>
//   //           
//   //           <textarea
//   //             value={comment}
//   //             onChange={(e) => setComment(e.target.value)}
//   //             placeholder="Votre commentaire (optionnel)"
//   //             rows={4}
//   //           />
//   //           
//   //           <div className="modal-actions">
//   //             <button onClick={handleCloseReview} className="btn btn-secondary">
//   //               Annuler
//   //             </button>
//   //             <button
//   //               onClick={handleSubmitReview}
//   //               disabled={submittingReview || rating === 0}
//   //               className="btn btn-primary"
//   //             >
//   //               {submittingReview ? 'Envoi...' : 'Soumettre'}
//   //             </button>
//   //           </div>
//   //         </div>
//   //       </div>
//   //   </div>
//   // );
// }

// TODO: Exporter le composant
// export default OrderHistory;

