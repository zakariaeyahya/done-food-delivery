/**
 * Page DashboardPage - Restaurant
 * @notice Tableau de bord principal du restaurant
 * @dev Vue d'ensemble commandes, statistiques KPIs, revenus
 */

// TODO: Importer React et hooks nécessaires
// import { useState, useEffect } from 'react';

// TODO: Importer les composants
// import OrdersQueue from '../components/OrdersQueue';
// import EarningsChart from '../components/EarningsChart';

// TODO: Importer les services
// import * as api from '../services/api';

/**
 * Page DashboardPage
 * @returns {JSX.Element} Page dashboard
 */
// TODO: Créer le composant DashboardPage
// function DashboardPage() {
//   // State pour restaurant
//   const [restaurant, setRestaurant] = useState(null);
//   
//   // State pour KPIs
//   const [kpis, setKpis] = useState({
//     pendingOrders: 0,
//     preparingOrders: 0,
//     deliveredToday: 0,
//     todayRevenue: 0
//   });
//   
//   // TODO: Récupérer restaurant depuis context ou localStorage
//   // const { restaurant: contextRestaurant, address } = useWallet();
//   
//   // TODO: useEffect pour charger KPIs
//   // useEffect(() => {
//   //   SI restaurant:
//   //     fetchKPIs();
//   // }, [restaurant]);
//   
//   // TODO: Fonction pour charger KPIs
//   // async function fetchKPIs() {
//   //   ESSAYER:
//   //     const today = new Date();
//   //     today.setHours(0, 0, 0, 0);
//   //     
//   //     const orders = await api.getOrders(restaurant._id, { startDate: today }, restaurant.address);
//   //     
//   //     setKpis({
//   //       pendingOrders: orders.filter(o => o.status === 'CREATED').length,
//   //       preparingOrders: orders.filter(o => o.status === 'PREPARING').length,
//   //       deliveredToday: orders.filter(o => o.status === 'DELIVERED').length,
//   //       todayRevenue: orders
//   //         .filter(o => o.status === 'DELIVERED')
//   //         .reduce((sum, o) => sum + o.totalAmount, 0)
//   //     });
//   //   CATCH error:
//   //     console.error('Error fetching KPIs:', error);
//   // }
//   
//   // TODO: Render du composant
//   // RETOURNER (
//   //   <div className="dashboard-page">
//   //     <div className="dashboard-header">
//   //       <h1>Tableau de bord</h1>
//   //       SI restaurant:
//   //         <p>Bienvenue, {restaurant.name}</p>
//   //     </div>
//   //     
//   //     <div className="kpis-grid">
//   //       <div className="kpi-card">
//   //         <h3>Commandes en attente</h3>
//   //         <p>{kpis.pendingOrders}</p>
//   //       </div>
//   //       
//   //       <div className="kpi-card">
//   //         <h3>En préparation</h3>
//   //         <p>{kpis.preparingOrders}</p>
//   //       </div>
//   //       
//   //       <div className="kpi-card">
//   //         <h3>Livrées aujourd'hui</h3>
//   //         <p>{kpis.deliveredToday}</p>
//   //       </div>
//   //       
//   //       <div className="kpi-card">
//   //         <h3>Revenus aujourd'hui</h3>
//   //         <p>{formatPrice(kpis.todayRevenue)} MATIC</p>
//   //       </div>
//   //     </div>
//   //     
//   //     <div className="dashboard-content">
//   //       <div className="orders-section">
//   //         <OrdersQueue
//   //           restaurantId={restaurant?._id}
//   //           restaurantAddress={restaurant?.address}
//   //           filter="CREATED"
//   //         />
//   //       </div>
//   //       
//   //       <div className="earnings-section">
//   //         <EarningsChart
//   //           restaurantId={restaurant?._id}
//   //           restaurantAddress={restaurant?.address}
//   //           period="day"
//   //         />
//   //       </div>
//   //     </div>
//   //   </div>
//   // );
// }

// TODO: Exporter le composant
// export default DashboardPage;

