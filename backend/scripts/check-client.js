require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }), 'orders');
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');
    
    // Chercher commande #10 avec populate
    const order = await Order.findOne({ orderId: 10 }).populate('client').lean();
    
    console.log('📋 Commande #10:');
    console.log('  Client ID:', order.client?._id);
    console.log('  Client Address:', order.client?.address);
    console.log('  Client Name:', order.client?.name);
    
    // L'adresse du wallet connecté
    console.log('\n🔑 Adresse wallet connecté: 0x49bef4651a9316b0de3a45f72cede826cafad72a');
    
    if (order.client?.address) {
      const match = order.client.address.toLowerCase() === '0x49bef4651a9316b0de3a45f72cede826cafad72a';
      console.log('  Match:', match ? '✅ OUI' : '❌ NON');
    }
    
  } catch (e) {
    console.error('Erreur:', e.message);
  } finally {
    await mongoose.disconnect();
  }
}
check();
