/**
 * Composant StakingPanel pour gestion du staking livreur
 * @fileoverview Panel de gestion du staking avec historique slashing
 */

// TODO: Importer React et hooks
// import { useState, useEffect } from 'react';
// import { blockchain } from '../services/blockchain';
// import { api } from '../services/api';
// import { ethers } from 'ethers';

/**
 * Composant StakingPanel
 * @param {string} address - Adresse wallet du livreur
 * @returns {JSX.Element} Panel de staking
 */
// TODO: Implémenter StakingPanel({ address })
// function StakingPanel({ address }) {
//   // State
//   const [stakedAmount, setStakedAmount] = useState(0);
//   const [isStaked, setIsStaked] = useState(false);
//   const [stakeInput, setStakeInput] = useState('0.1');
//   const [hasActiveDelivery, setHasActiveDelivery] = useState(false);
//   const [slashingHistory, setSlashingHistory] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   
//   // Charger infos staking au montage
//   useEffect(() => {
//     SI address:
//       fetchStakingInfo();
//       fetchSlashingHistory();
//       checkActiveDelivery();
//   }, [address]);
//   
//   // Récupérer infos staking
//   async function fetchStakingInfo() {
//     ESSAYER:
//       const stakeInfo = await blockchain.getStakeInfo(address);
//       setStakedAmount(stakeInfo.amount);
//       setIsStaked(stakeInfo.isStaked);
//     CATCH error:
//       console.error('Error fetching stake info:', error);
//   }
//   
//   // Récupérer historique slashing
//   async function fetchSlashingHistory() {
//     ESSAYER:
//       const events = await blockchain.getSlashingEvents(address);
//       setSlashingHistory(events);
//     CATCH error:
//       console.error('Error fetching slashing history:', error);
//   }
//   
//   // Vérifier livraison active
//   async function checkActiveDelivery() {
//     ESSAYER:
//       const active = await api.getActiveDelivery(address);
//       setHasActiveDelivery(!!active);
//     CATCH error:
//       console.error('Error checking active delivery:', error);
//   }
//   
//   // Effectuer staking
//   async function handleStake() {
//     SI !address:
//       setError('Adresse wallet requise');
//       RETOURNER;
//     
//     const amount = parseFloat(stakeInput);
//     SI amount < 0.1:
//       setError('Montant minimum: 0.1 MATIC');
//       RETOURNER;
//     
//     setLoading(true);
//     setError(null);
//     
//     ESSAYER:
//       const { txHash } = await blockchain.stake(stakeInput);
//       console.log('Staking transaction:', txHash);
//       
//       // Attendre confirmation et refresh
//       await new Promise(resolve => setTimeout(resolve, 3000));
//       await fetchStakingInfo();
//       
//       alert('Staking réussi!');
//     CATCH error:
//       setError(`Erreur staking: ${error.message}`);
//     FINALLY:
//       setLoading(false);
//   }
//   
//   // Retirer staking
//   async function handleUnstake() {
//     SI hasActiveDelivery:
//       setError('Impossible de retirer le staking pendant une livraison active');
//       RETOURNER;
//     
//     SI !confirm('Êtes-vous sûr de vouloir retirer votre staking?')):
//       RETOURNER;
//     
//     setLoading(true);
//     setError(null);
//     
//     ESSAYER:
//       const { txHash, amount } = await blockchain.unstake();
//       console.log('Unstaking transaction:', txHash);
//       
//       // Attendre confirmation et refresh
//       await new Promise(resolve => setTimeout(resolve, 3000));
//       await fetchStakingInfo();
//       
//       alert(`Unstaking réussi! ${amount} MATIC retirés.`);
//     CATCH error:
//       setError(`Erreur unstaking: ${error.message}`);
//     FINALLY:
//       setLoading(false);
//   }
//   
//   // Calculer total slashé
//   const totalSlashed = slashingHistory.reduce((sum, event) => sum + event.amount, 0);
//   
//   // Render
//   RETOURNER (
//     <div className="staking-panel card">
//       <h2>Gestion du Staking</h2>
//       
//       {/* Statut staking */}
//       <div className="staking-status">
//         SI isStaked:
//           <div className="status-badge status-staked">
//             ✅ Staké: {stakedAmount} MATIC
//           </div>
//         SINON:
//           <div className="status-badge status-not-staked">
//             ❌ Non staké
//           </div>
//       </div>
//       
//       {/* Input staking */}
//       <div className="stake-input">
//         <label>Montant à staker (minimum 0.1 MATIC)</label>
//         <input
//           type="number"
//           value={stakeInput}
//           onChange={(e) => setStakeInput(e.target.value)}
//           min="0.1"
//           step="0.1"
//         />
//         <button onClick={handleStake} disabled={loading || isStaked}>
//           {loading ? 'En cours...' : 'Stake 0.1 MATIC'}
//         </button>
//       </div>
//       
//       {/* Bouton unstake */}
//       SI isStaked:
//         <button
//           onClick={handleUnstake}
//           disabled={loading || hasActiveDelivery}
//           className="btn-danger"
//         >
//           {hasActiveDelivery ? 'Livraison active' : loading ? 'En cours...' : 'Unstake'}
//         </button>
//       
//       {/* Historique slashing */}
//       SI slashingHistory.length > 0:
//         <div className="slashing-history">
//           <h3>Historique Slashing</h3>
//           <p>Total slashé: {totalSlashed} MATIC</p>
//           SI totalSlashed > 0.5:
//             <div className="warning">
//               ⚠️ Attention: Vous avez été slashé plusieurs fois
//             </div>
//           
//           <table>
//             <thead>
//               <tr>
//                 <th>Date</th>
//                 <th>Raison</th>
//                 <th>Montant</th>
//                 <th>Transaction</th>
//               </tr>
//             </thead>
//             <tbody>
//               {slashingHistory.map((event, index) => (
//                 <tr key={index}>
//                   <td>{new Date(event.timestamp * 1000).toLocaleDateString()}</td>
//                   <td>{event.reason}</td>
//                   <td>{event.amount} MATIC</td>
//                   <td>
//                     <a href={`https://mumbai.polygonscan.com/tx/${event.txHash}`} target="_blank" rel="noopener noreferrer">
//                       Voir
//                     </a>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       
//       SI error:
//         <div className="error-message">{error}</div>
//     </div>
//   );
// }

// TODO: Exporter le composant
// export default StakingPanel;

