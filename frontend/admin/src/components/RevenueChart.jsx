/**
 * Composant RevenueChart - Graphique Revenus Plateforme
 * @notice Affiche un graphique line chart des revenus avec breakdown par source
 * @dev Combine données blockchain (on-chain) et API (off-chain)
 */

// TODO: Importer React et hooks
// import React, { useState, useEffect } from 'react';

// TODO: Importer Chart.js
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend
// } from 'chart.js';
// import { Line } from 'react-chartjs-2';

// TODO: Importer les services
// import * as blockchainService from '../services/blockchain';
// import * as apiService from '../services/api';

// TODO: Enregistrer les composants Chart.js
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend
// );

/**
 * Composant RevenueChart
 */
// TODO: Implémenter le composant RevenueChart
// function RevenueChart() {
//   // ÉTAT: timeframe = "week"
//   // ÉTAT: chartData = null
//   // ÉTAT: breakdown = null
//   // ÉTAT: loading = true
//   
//   // TODO: Utiliser useState pour gérer les états
//   // const [timeframe, setTimeframe] = useState('week');
//   // const [chartData, setChartData] = useState(null);
//   // const [breakdown, setBreakdown] = useState(null);
//   // const [loading, setLoading] = useState(true);
//   
//   // TODO: Fonction pour charger les données revenue
//   // async function fetchRevenueData() {
//   //   ESSAYER:
//   //     setLoading(true);
//   //     
//   //     // Récupérer depuis blockchain (on-chain)
//   //     const blockchainData = await blockchainService.getPlatformRevenue(timeframe);
//   //     
//   //     // Récupérer depuis API pour breakdown (off-chain)
//   //     const apiData = await apiService.getAnalytics('revenue', { timeframe });
//   //     
//   //     // Formater les données pour Chart.js avec multi-datasets
//   //     const formattedData = {
//   //       labels: blockchainData.transactions.map(t => {
//   //         const date = new Date(t.timestamp * 1000);
//   //         RETOURNER date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
//   //       }),
//   //       datasets: [
//   //         {
//   //           label: 'Revenue Total Plateforme',
//   //           data: blockchainData.transactions.map(t => parseFloat(t.platformAmount)),
//   //           borderColor: 'rgb(34, 197, 94)', // Vert
//   //           backgroundColor: 'rgba(34, 197, 94, 0.1)',
//   //           fill: true,
//   //           tension: 0.4
//   //         },
//   //         {
//   //           label: 'Revenue Restaurants (70%)',
//   //           data: apiData.restaurantRevenue || [],
//   //           borderColor: 'rgb(59, 130, 246)', // Bleu
//   //           backgroundColor: 'rgba(59, 130, 246, 0.1)',
//   //           fill: true,
//   //           tension: 0.4
//   //         },
//   //         {
//   //           label: 'Revenue Livreurs (20%)',
//   //           data: apiData.delivererRevenue || [],
//   //           borderColor: 'rgb(251, 146, 60)', // Orange
//   //           backgroundColor: 'rgba(251, 146, 60, 0.1)',
//   //           fill: true,
//   //           tension: 0.4
//   //         }
//   //       ]
//   //     };
//   //     
//   //     setChartData(formattedData);
//   //     setBreakdown(apiData.breakdown || {
//   //       restaurant: 70,
//   //       deliverer: 20,
//   //       platform: 10
//   //     });
//   //     setLoading(false);
//   //   CATCH error:
//   //     console.error('Error fetching revenue chart data:', error);
//   //     setLoading(false);
//   // }
//   
//   // TODO: Charger les données quand timeframe change
//   // useEffect(() => {
//   //   fetchRevenueData();
//   // }, [timeframe]);
//   
//   // TODO: Options du graphique Chart.js
//   // const chartOptions = {
//   //   responsive: true,
//   //   maintainAspectRatio: false,
//   //   plugins: {
//   //     legend: {
//   //       position: 'top',
//   //     },
//   //     title: {
//   //       display: true,
//   //       text: `Revenus Plateforme - ${timeframe === 'day' ? 'Jour' : timeframe === 'week' ? 'Semaine' : 'Mois'}`
//   //     },
//   //     tooltip: {
//   //       mode: 'index',
//   //       intersect: false,
//   //       callbacks: {
//   //         label: function(context) {
//   //           const value = context.parsed.y;
//   //           RETOURNER `${context.dataset.label}: ${value.toFixed(4)} MATIC (${(value * 0.8).toFixed(2)} USD)`;
//   //         }
//   //       }
//   //     }
//   //   },
//   //   scales: {
//   //     y: {
//   //       beginAtZero: true,
//   //       ticks: {
//   //         callback: function(value) {
//   //           RETOURNER value.toFixed(2) + ' MATIC';
//   //         }
//   //       }
//   //     }
//   //   }
//   // };
//   
//   // TODO: Rendu principal
//   // RETOURNER (
//   //   <div className="chart-container">
//   //     <div className="flex items-center justify-between mb-4">
//   //       <h3 className="text-xl font-semibold">Évolution des Revenus</h3>
//   //       <div className="flex gap-2">
//   //         <button
//   //           onClick={() => setTimeframe('day')}
//   //           className={`btn ${timeframe === 'day' ? 'btn-primary' : 'btn-outline'}`}
//   //         >
//   //           Jour
//   //         </button>
//   //         <button
//   //           onClick={() => setTimeframe('week')}
//   //           className={`btn ${timeframe === 'week' ? 'btn-primary' : 'btn-outline'}`}
//   //         >
//   //           Semaine
//   //         </button>
//   //         <button
//   //           onClick={() => setTimeframe('month')}
//   //           className={`btn ${timeframe === 'month' ? 'btn-primary' : 'btn-outline'}`}
//   //         >
//   //           Mois
//   //         </button>
//   //       </div>
//   //     </div>
//   //     
//   //     SI loading:
//   //       <div className="flex items-center justify-center h-64">
//   //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
//   //       </div>
//   //     SINON SI chartData:
//   //       <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//   //         <div className="lg:col-span-2 h-64">
//   //           <Line data={chartData} options={chartOptions} />
//   //         </div>
//   //         <div className="breakdown">
//   //           <h4 className="font-semibold mb-2">Breakdown</h4>
//   //           <div className="space-y-2">
//   //             <div className="flex items-center justify-between">
//   //               <span>Restaurants:</span>
//   //               <span className="font-bold">{breakdown?.restaurant || 70}%</span>
//   //             </div>
//   //             <div className="flex items-center justify-between">
//   //               <span>Livreurs:</span>
//   //               <span className="font-bold">{breakdown?.deliverer || 20}%</span>
//   //             </div>
//   //             <div className="flex items-center justify-between">
//   //               <span>Plateforme:</span>
//   //               <span className="font-bold">{breakdown?.platform || 10}%</span>
//   //             </div>
//   //           </div>
//   //         </div>
//   //       </div>
//   //     SINON:
//   //       <div className="text-center text-gray-500 h-64 flex items-center justify-center">
//   //         Aucune donnée disponible
//   //       </div>
//   //   </div>
//   // );
// }

// TODO: Exporter le composant
// export default RevenueChart;

