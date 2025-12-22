/**
 * Script pour mettre à jour les dates des commandes à aujourd'hui
 * Usage: node scripts/update-order-dates.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/done-food-delivery';

async function updateOrderDates() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }), 'orders');

    // Récupérer toutes les commandes
    const orders = await Order.find({});
    console.log(`📋 ${orders.length} commande(s) trouvée(s)`);

    if (orders.length === 0) {
      console.log('❌ Aucune commande à mettre à jour');
      process.exit(0);
    }

    // Afficher les dates actuelles
    console.log('\n📅 Dates actuelles:');
    orders.forEach(o => {
      console.log(`  - Order #${o.orderId}: ${o.createdAt}`);
    });

    // Mettre à jour les dates - répartir sur les derniers jours pour un meilleur graphique
    const now = new Date();
    console.log('\n🔄 Mise à jour des dates...');
    
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      // Répartir les commandes sur les derniers jours (1 commande par jour)
      const newDate = new Date(now);
      newDate.setDate(now.getDate() - i); // Aujourd'hui, hier, avant-hier...
      
      await Order.updateOne(
        { _id: order._id },
        { 
          $set: { 
            createdAt: newDate,
            updatedAt: newDate,
            completedAt: order.status === 'DELIVERED' ? newDate : order.completedAt
          }
        }
      );
      console.log(`  ✅ Order #${order.orderId}: ${newDate.toISOString().split('T')[0]}`);
    }

    console.log('\n✅ Toutes les dates ont été mises à jour!');
    console.log('🔄 Rafraîchissez le dashboard admin pour voir les graphiques.');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Déconnecté de MongoDB');
    process.exit(0);
  }
}

updateOrderDates();
