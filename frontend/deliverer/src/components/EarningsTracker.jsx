/**
 * Composant EarningsTracker - Suivi des gains livreur
 * @fileoverview Affiche les gains par période avec graphiques
 */

// TODO: Importer React et Chart.js
// import { useState, useEffect } from 'react';
// import { api } from '../services/api';
// import { blockchain } from '../services/blockchain';
// import { Line } from 'react-chartjs-2';

/**
 * Composant EarningsTracker
 * @param {string} address - Adresse wallet du livreur
 * @returns {JSX.Element} Tracker de gains
 */
// TODO: Implémenter EarningsTracker({ address })
// function EarningsTracker({ address }) {
//   // State
//   const [earnings, setEarnings] = useState({
//     today: 0,
//     week: 0,
//     month: 0,
//     pending: 0,
//     total: 0
//   });
//   const [period, setPeriod] = useState('week'); // 'today', 'week', 'month'
//   const [deliveriesCount, setDeliveriesCount] = useState(0);
//   const [chartData, setChartData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   
//   // Charger données au montage
//   useEffect(() => {
//     SI address:
//       fetchEarnings();
//       fetchEarningsEvents();
//   }, [address, period]);
//   
//   // Récupérer earnings depuis API
//   async function fetchEarnings() {
//     setLoading(true);
//     ESSAYER:
//       const todayData = await api.getEarnings(address, 'today');
//       const weekData = await api.getEarnings(address, 'week');
//       const monthData = await api.getEarnings(address, 'month');
//       
//       setEarnings({
//         today: todayData.totalEarnings || 0,
//         week: weekData.totalEarnings || 0,
//         month: monthData.totalEarnings || 0,
//         pending: 0, // TODO: Calculer depuis events
//         total: monthData.totalEarnings || 0
//       });
//       
//       setDeliveriesCount(weekData.completedDeliveries || 0);
//     CATCH error:
//       console.error('Error fetching earnings:', error);
//     FINALLY:
//       setLoading(false);
//   }
//   
//   // Récupérer events blockchain
//   async function fetchEarningsEvents() {
//     ESSAYER:
//       const { events, totalEarnings } = await blockchain.getEarningsEvents(address);
//       
//       // Créer données graphique
//       const labels = events.map(e => new Date(e.timestamp * 1000).toLocaleDateString());
//       const data = events.map(e => e.delivererAmount);
//       
//       setChartData({
//         labels,
//         datasets: [{
//           label: 'Gains (MATIC)',
//           data,
//           borderColor: 'rgb(75, 192, 192)',
//           backgroundColor: 'rgba(75, 192, 192, 0.2)'
//         }]
//       });
//     CATCH error:
//       console.error('Error fetching earnings events:', error);
//   }
//   
//   // Retirer fonds (si pattern PULL)
//   async function handleWithdraw() {
//     // TODO: Implémenter withdraw si pattern PULL
//     alert('Les paiements sont transférés automatiquement (pattern PUSH)');
//   }
//   
//   // Render
//   RETOURNER (
//     <div className="earnings-tracker card">
//       <h2>Mes Gains</h2>
//       
//       {/* Tabs période */}
//       <div className="period-tabs">
//         <button onClick={() => setPeriod('today')} className={period === 'today' ? 'active' : ''}>
//           Aujourd'hui
//         </button>
//         <button onClick={() => setPeriod('week')} className={period === 'week' ? 'active' : ''}>
//           Semaine
//         </button>
//         <button onClick={() => setPeriod('month')} className={period === 'month' ? 'active' : ''}>
//           Mois
//         </button>
//       </div>
//       
//       {/* Affichage gains */}
//       <div className="earnings-display">
//         <div className="earnings-value">
//           {earnings[period]} MATIC
//         </div>
//         <p>Livraisons: {deliveriesCount}</p>
//       </div>
//       
//       {/* Graphique */}
//       SI chartData:
//         <div className="chart">
//           <Line data={chartData} />
//         </div>
//       
//       {/* Paiements en attente */}
//       SI earnings.pending > 0:
//         <div className="pending-payments">
//           <p>En attente: {earnings.pending} MATIC</p>
//           <button onClick={handleWithdraw}>Retirer</button>
//         </div>
//     </div>
//   );
// }

// TODO: Exporter le composant
// export default EarningsTracker;

