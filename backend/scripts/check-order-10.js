require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }), 'orders');
    
    // Chercher commande #10
    const order10 = await Order.findOne({ orderId: 10 }).lean();
    
    if (order10) {
      console.log('✅ Commande #10 trouvée:');
      console.log('  Status:', order10.status);
      console.log('  Client:', order10.client);
      console.log('  Deliverer:', order10.deliverer);
    } else {
      console.log('❌ Commande #10 non trouvée');
    }
    
    // Lister toutes les commandes
    const all = await Order.find({}).lean();
    console.log('\n📋 Toutes les commandes:', all.map(o => `#${o.orderId} (${o.status})`).join(', '));
    
  } catch (e) {
    console.error('Erreur:', e.message);
  } finally {
    await mongoose.disconnect();
  }
}
check();
