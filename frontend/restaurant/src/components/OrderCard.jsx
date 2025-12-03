/**
 * Composant OrderCard - Restaurant
 * @notice Carte individuelle d'une commande
 * @dev Affiche détails commande, items, client, statut, actions
 */

// TODO: Importer React et hooks nécessaires
// import { useState, useEffect } from 'react';

// TODO: Importer utils
// import { formatAddress } from '../utils/web3';
// import { formatPrice, formatDate } from '../utils/formatters';

/**
 * Composant OrderCard
 * @param {Object} order - Données de la commande
 * @param {Function} onConfirmPreparation - Callback pour confirmer préparation
 * @returns {JSX.Element} Carte de commande
 */
// TODO: Créer le composant OrderCard
// function OrderCard({ order, onConfirmPreparation }) {
//   // State pour le temps écoulé
//   const [elapsedTime, setElapsedTime] = useState('');
//   
//   // TODO: useEffect pour calculer temps écoulé
//   // useEffect(() => {
//   //   const interval = setInterval(() => {
//   //     const now = new Date();
//   //     const created = new Date(order.createdAt);
//   //     const diff = Math.floor((now - created) / 1000 / 60); // minutes
//   //     setElapsedTime(`${diff} min`);
//   //   }, 60000); // Update chaque minute
//   //   
//   //   RETOURNER () => clearInterval(interval);
//   // }, [order.createdAt]);
//   
//   // TODO: Fonction pour obtenir la couleur du badge selon le statut
//   // function getStatusColor(status) {
//   //   const colors = {
//   //     'CREATED': 'yellow',
//   //     'PREPARING': 'orange',
//   //     'IN_DELIVERY': 'blue',
//   //     'DELIVERED': 'green',
//   //     'DISPUTED': 'red'
//   //   };
//   //   RETOURNER colors[status] || 'gray';
//   // }
//   
//   // TODO: Render du composant
//   // RETOURNER (
//   //   <div className="order-card">
//   //     <div className="order-header">
//   //       <span className="order-id">Commande #{order.orderId}</span>
//   //       <span className={`badge badge-${getStatusColor(order.status)}`}>
//   //         {order.status}
//   //       </span>
//   //       <span className="elapsed-time">{elapsedTime}</span>
//   //     </div>
//   //     
//   //     <div className="order-items">
//   //       <h4>Items:</h4>
//   //       {order.items.map((item, index) => (
//   //         <div key={index} className="order-item">
//   //           SI item.image:
//   //             <img src={`${IPFS_GATEWAY}${item.image}`} alt={item.name} />
//   //           <span>{item.quantity}x {item.name}</span>
//   //           <span>{formatPrice(item.price * item.quantity)} MATIC</span>
//   //         </div>
//   //       ))}
//   //     </div>
//   //     
//   //     <div className="order-info">
//   //       <div className="client-info">
//   //         <h4>Client:</h4>
//   //         <p>{order.client?.name || 'N/A'}</p>
//   //         <p>{formatAddress(order.client?.address)}</p>
//   //         SI order.client?.phone:
//   //           <p>{order.client.phone}</p>
//   //       </div>
//   //       
//   //       <div className="delivery-address">
//   //         <h4>Adresse de livraison:</h4>
//   //         <p>{order.deliveryAddress}</p>
//   //       </div>
//   //     </div>
//   //     
//   //     <div className="order-footer">
//   //       <div className="total">
//   //         <span>Total: {formatPrice(order.totalAmount)} MATIC</span>
//   //       </div>
//   //       
//   //       SI order.status === 'CREATED' && onConfirmPreparation:
//   //         <button
//   //           onClick={() => onConfirmPreparation(order.orderId)}
//   //           className="btn btn-primary"
//   //         >
//   //           Confirmer préparation
//   //         </button>
//   //     </div>
//   //   </div>
//   // );
// }

// TODO: Exporter le composant
// export default OrderCard;

