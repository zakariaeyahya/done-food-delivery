/**
 * Composant OrdersChart - Graphique Commandes dans le Temps
 * @notice Affiche un graphique line chart des commandes avec filtres période
 * @dev Utilise Chart.js avec react-chartjs-2
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
//   Legend,
//   Filler
// } from 'chart.js';
// import { Line } from 'react-chartjs-2';

// TODO: Importer les services
// import * as apiService from '../services/api';

// TODO: Enregistrer les composants Chart.js
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
//   Filler
// );

/**
 * Composant OrdersChart
 */
// TODO: Implémenter le composant OrdersChart
// function OrdersChart() {
//   // ÉTAT: timeframe = "week"
//   // ÉTAT: chartData = null
//   // ÉTAT: loading = true
//   
//   // TODO: Utiliser useState pour gérer les états
//   // const [timeframe, setTimeframe] = useState('week');
//   // const [chartData, setChartData] = useState(null);
//   // const [loading, setLoading] = useState(true);
//   
//   // TODO: Fonction pour charger les données analytics
//   // async function fetchChartData() {
//   //   ESSAYER:
//   //     setLoading(true);
//   //     
//   //     // Appeler l'API analytics
//   //     const data = await apiService.getAnalytics('orders', { timeframe });
//   //     
//   //     // Formater les données pour Chart.js
//   //     const formattedData = {
//   //       labels: data.dates, // Dates sur l'axe X
//   //       datasets: [{
//   //         label: 'Commandes',
//   //         data: data.orders, // Nombre de commandes sur l'axe Y
//   //         borderColor: 'rgb(59, 130, 246)', // Bleu
//   //         backgroundColor: 'rgba(59, 130, 246, 0.1)',
//   //         fill: true,
//   //         tension: 0.4, // Courbe lisse
//   //         pointRadius: 4,
//   //         pointHoverRadius: 6,
//   //         pointBackgroundColor: 'rgb(59, 130, 246)',
//   //         pointBorderColor: '#fff',
//   //         pointBorderWidth: 2
//   //       }]
//   //     };
//   //     
//   //     // Si comparaison avec période précédente disponible
//   //     SI data.comparison && data.comparison.previousPeriod:
//   //       formattedData.datasets.push({
//   //         label: 'Période précédente',
//   //         data: data.comparison.previousPeriod,
//   //         borderColor: 'rgb(156, 163, 175)', // Gris
//   //         backgroundColor: 'rgba(156, 163, 175, 0.1)',
//   //         fill: true,
//   //         tension: 0.4,
//   //         borderDash: [5, 5], // Ligne pointillée
//   //         pointRadius: 0 // Pas de points
//   //       });
//   //     
//   //     setChartData(formattedData);
//   //     setLoading(false);
//   //   CATCH error:
//   //     console.error('Error fetching orders chart data:', error);
//   //     setLoading(false);
//   // }
//   
//   // TODO: Charger les données quand timeframe change
//   // useEffect(() => {
//   //   fetchChartData();
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
//   //       text: `Commandes - ${timeframe === 'day' ? 'Jour' : timeframe === 'week' ? 'Semaine' : timeframe === 'month' ? 'Mois' : 'Année'}`
//   //     },
//   //     tooltip: {
//   //       mode: 'index',
//   //       intersect: false,
//   //     }
//   //   },
//   //   scales: {
//   //     y: {
//   //       beginAtZero: true,
//   //       ticks: {
//   //         stepSize: 1
//   //       }
//   //     }
//   //   },
//   //   interaction: {
//   //     mode: 'nearest',
//   //     axis: 'x',
//   //     intersect: false
//   //   }
//   // };
//   
//   // TODO: Rendu principal
//   // RETOURNER (
//   //   <div className="chart-container">
//   //     <div className="flex items-center justify-between mb-4">
//   //       <h3 className="text-xl font-semibold">Évolution des Commandes</h3>
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
//   //         <button
//   //           onClick={() => setTimeframe('year')}
//   //           className={`btn ${timeframe === 'year' ? 'btn-primary' : 'btn-outline'}`}
//   //         >
//   //           Année
//   //         </button>
//   //       </div>
//   //     </div>
//   //     
//   //     SI loading:
//   //       <div className="flex items-center justify-center h-64">
//   //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
//   //       </div>
//   //     SINON SI chartData:
//   //       <div className="h-64">
//   //         <Line data={chartData} options={chartOptions} />
//   //       </div>
//   //     SINON:
//   //       <div className="text-center text-gray-500 h-64 flex items-center justify-center">
//   //         Aucune donnée disponible
//   //       </div>
//   //   </div>
//   // );
// }

// TODO: Exporter le composant
// export default OrdersChart;

