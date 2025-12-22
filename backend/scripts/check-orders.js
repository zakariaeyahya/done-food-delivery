require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

async function checkOrders() {
  try {
    const uri = process.env.MONGODB_URI;
    console.log('Connecting to:', uri ? uri.substring(0, 30) + '...' : 'undefined');
    await mongoose.connect(uri);
    const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }), 'orders');
    
    const orders = await Order.find({}).lean();
    console.log('\n📋 État des commandes:\n');
    orders.forEach(o => {
      const date = o.createdAt ? new Date(o.createdAt).toISOString() : 'N/A';
      console.log(`Order #${o.orderId}: status=${o.status}, createdAt=${date}, total=${o.totalAmount}`);
    });
    
    const delivered = orders.filter(o => o.status === 'DELIVERED');
    console.log(`\n✅ Commandes DELIVERED: ${delivered.length}`);
    
  } catch (e) {
    console.error('Erreur:', e.message);
  } finally {
    await mongoose.disconnect();
  }
}
checkOrders();
