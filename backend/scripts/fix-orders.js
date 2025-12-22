require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

async function fixOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }), 'orders');
    
    // Mettre toutes les commandes en DELIVERED
    const result = await Order.updateMany(
      {},
      { 
        $set: { 
          status: 'DELIVERED',
          completedAt: new Date()
        }
      }
    );
    
    console.log(`✅ ${result.modifiedCount} commande(s) mise(s) à jour en DELIVERED`);
    
    // Vérifier
    const orders = await Order.find({}).lean();
    console.log('\n📋 Nouvel état:');
    orders.forEach(o => {
      console.log(`  Order #${o.orderId}: ${o.status} - ${new Date(o.createdAt).toISOString().split('T')[0]}`);
    });
    
  } catch (e) {
    console.error('Erreur:', e.message);
  } finally {
    await mongoose.disconnect();
  }
}
fixOrders();
