/**
 * Composant DisputesManager - Gestion Litiges
 * @notice Affiche la liste des litiges actifs avec interface de vote et résolution
 * @dev Modal pour détails, preuves IPFS, historique votes
 */

// TODO: Importer React et hooks
// import React, { useState, useEffect } from 'react';

// TODO: Importer les services
// import * as apiService from '../services/api';
// import * as blockchainService from '../services/blockchain';

// TODO: Importer les utilitaires
// import { formatAddress } from '../utils/web3';

/**
 * Composant DisputesManager
 */
// TODO: Implémenter le composant DisputesManager
// function DisputesManager() {
//   // ÉTAT: disputes = []
//   // ÉTAT: selectedDispute = null
//   // ÉTAT: showModal = false
//   // ÉTAT: loading = true
//   
//   // TODO: Utiliser useState pour gérer les états
//   // const [disputes, setDisputes] = useState([]);
//   // const [selectedDispute, setSelectedDispute] = useState(null);
//   // const [showModal, setShowModal] = useState(false);
//   // const [loading, setLoading] = useState(true);
//   
//   // TODO: Fonction pour charger les litiges
//   // async function fetchDisputes() {
//   //   ESSAYER:
//   //     setLoading(true);
//   //     
//   //     const data = await apiService.getDisputes({ status: 'active' });
//   //     setDisputes(data.disputes || []);
//   //     setLoading(false);
//   //   CATCH error:
//   //     console.error('Error fetching disputes:', error);
//   //     setLoading(false);
//   // }
//   
//   // TODO: Charger les litiges au montage
//   // useEffect(() => {
//   //   fetchDisputes();
//   // }, []);
//   
//   // TODO: Fonction pour voir les détails d'un litige
//   // function handleViewDetails(dispute) {
//   //   setSelectedDispute(dispute);
//   //   setShowModal(true);
//   // }
//   
//   // TODO: Fonction pour voter sur un litige
//   // async function handleVote(disputeId, winner) {
//   //   ESSAYER:
//   //     const confirmed = window.confirm(`Voulez-vous voter en faveur de ${winner}?`);
//   //     SI !confirmed:
//   //       RETOURNER;
//   //     
//   //     // Appeler l'API pour voter (si endpoint existe)
//   //     // await apiService.voteDispute(disputeId, winner);
//   //     
//   //     // Actualiser la liste
//   //     await fetchDisputes();
//   //     alert('Vote enregistré avec succès');
//   //   CATCH error:
//   //     console.error('Error voting on dispute:', error);
//   //     alert('Erreur lors du vote: ' + error.message);
//   // }
//   
//   // TODO: Fonction pour résoudre un litige manuellement
//   // async function handleResolve(disputeId) {
//   //   ESSAYER:
//   //     const winner = prompt('Qui est le gagnant? (CLIENT, RESTAURANT, DELIVERER)');
//   //     SI !winner:
//   //       RETOURNER;
//   //     
//   //     const confirmed = window.confirm(`Résoudre le litige en faveur de ${winner}?`);
//   //     SI !confirmed:
//   //       RETOURNER;
//   //     
//   //     // Résoudre via API
//   //     await apiService.resolveDispute(disputeId, { winner, reason: 'Résolution manuelle par admin' });
//   //     
//   //     // Résoudre on-chain si nécessaire
//   //     const result = await blockchainService.resolveDisputeOnChain(disputeId, winner);
//   //     SI result.success:
//   //       alert('Litige résolu avec succès. Transaction: ' + result.txHash);
//   //     SINON:
//   //       alert('Erreur on-chain: ' + result.error);
//   //     
//   //     // Actualiser la liste
//   //     await fetchDisputes();
//   //     setShowModal(false);
//   //   CATCH error:
//   //     console.error('Error resolving dispute:', error);
//   //     alert('Erreur lors de la résolution: ' + error.message);
//   // }
//   
//   // TODO: Composant DisputeCard
//   // function DisputeCard({ dispute }) {
//   //   RETOURNER (
//   //     <div className="dispute-card card">
//   //       <div className="flex items-center justify-between mb-2">
//   //         <h4 className="font-semibold">Order ID: {dispute.orderId}</h4>
//   //         <span className={`badge ${dispute.status === 'ACTIVE' ? 'badge-warning' : 'badge-success'}`}>
//   //           {dispute.status}
//   //         </span>
//   //       </div>
//   //       <div className="space-y-1 text-sm">
//   //         <p><strong>Client:</strong> {formatAddress(dispute.client)}</p>
//   //         <p><strong>Restaurant:</strong> {formatAddress(dispute.restaurant)}</p>
//   //         <p><strong>Raison:</strong> {dispute.reason}</p>
//   //         <p><strong>Votes:</strong> Client {dispute.votes?.client || 0} | Restaurant {dispute.votes?.restaurant || 0}</p>
//   //       </div>
//   //       <div className="flex gap-2 mt-4">
//   //         <button
//   //           onClick={() => handleViewDetails(dispute)}
//   //           className="btn btn-sm btn-outline"
//   //         >
//   //           Voir détails
//   //         </button>
//   //         <button
//   //           onClick={() => handleVote(dispute.disputeId, 'CLIENT')}
//   //           className="btn btn-sm btn-primary"
//   //         >
//   //           Voter Client
//   //         </button>
//   //         <button
//   //           onClick={() => handleVote(dispute.disputeId, 'RESTAURANT')}
//   //           className="btn btn-sm btn-primary"
//   //         >
//   //           Voter Restaurant
//   //         </button>
//   //         SI dispute.votingPeriodEnded:
//   //           <button
//   //             onClick={() => handleResolve(dispute.disputeId)}
//   //             className="btn btn-sm btn-admin"
//   //           >
//   //             Résoudre
//   //           </button>
//   //       </div>
//   //     </div>
//   //   );
//   // }
//   
//   // TODO: Composant DisputeModal
//   // function DisputeModal({ dispute, onClose }) {
//   //   SI !dispute:
//   //     RETOURNER null;
//   //   
//   //   // TODO: Charger les preuves IPFS depuis evidenceIPFS
//   //   const ipfsGateway = 'https://gateway.pinata.cloud/ipfs/';
//   //   const evidenceUrl = dispute.evidenceIPFS ? `${ipfsGateway}${dispute.evidenceIPFS}` : null;
//   //   
//   //   RETOURNER (
//   //     <div className="modal-overlay" onClick={onClose}>
//   //       <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//   //         <div className="flex items-center justify-between mb-4">
//   //           <h3 className="text-xl font-semibold">Détails du Litige #{dispute.disputeId}</h3>
//   //           <button onClick={onClose} className="btn btn-sm">×</button>
//   //         </div>
//   //         
//   //         <div className="space-y-4">
//   //           <div>
//   //             <strong>Order ID:</strong> {dispute.orderId}
//   //           </div>
//   //           <div>
//   //             <strong>Client:</strong> {formatAddress(dispute.client)}
//   //           </div>
//   //           <div>
//   //             <strong>Restaurant:</strong> {formatAddress(dispute.restaurant)}
//   //           </div>
//   //           <div>
//   //             <strong>Raison:</strong> {dispute.reason}
//   //           </div>
//   //           
//   //           SI evidenceUrl:
//   //             <div>
//   //               <strong>Preuves:</strong>
//   //               <img src={evidenceUrl} alt="Preuve" className="mt-2 max-w-md rounded" />
//   //             </div>
//   //           
//   //           <div>
//   //             <strong>Votes:</strong>
//   //             <p>Client: {dispute.votes?.client || 0}</p>
//   //             <p>Restaurant: {dispute.votes?.restaurant || 0}</p>
//   //           </div>
//   //           
//   //           <div className="flex gap-2">
//   //             <button
//   //               onClick={() => handleResolve(dispute.disputeId)}
//   //               className="btn btn-admin"
//   //             >
//   //               Résoudre Manuellement
//   //             </button>
//   //           </div>
//   //         </div>
//   //       </div>
//   //     </div>
//   //   );
//   // }
//   
//   // TODO: Rendu principal
//   // RETOURNER (
//   //   <div className="disputes-manager">
//   //     <h2 className="text-2xl font-bold mb-4">Litiges Actifs</h2>
//   //     
//   //     SI loading:
//   //       <div className="flex items-center justify-center h-64">
//   //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
//   //       </div>
//   //     SINON SI disputes.length === 0:
//   //       <div className="text-center text-gray-500 py-8">
//   //         Aucun litige actif
//   //       </div>
//   //     SINON:
//   //       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//   //         {disputes.map((dispute) => (
//   //           <DisputeCard key={dispute.disputeId} dispute={dispute} />
//   //         ))}
//   //       </div>
//   //     
//   //     SI showModal:
//   //       <DisputeModal
//   //         dispute={selectedDispute}
//   //         onClose={() => {
//   //           setShowModal(false);
//   //           setSelectedDispute(null);
//   //         }}
//   //       />
//   //   </div>
//   // );
// }

// TODO: Exporter le composant
// export default DisputesManager;

