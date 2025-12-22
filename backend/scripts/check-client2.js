require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const orders = mongoose.connection.collection('orders');
    const users = mongoose.connection.collection('users');
    
    // Chercher commande #10
    const order = await orders.findOne({ orderId: 10 });
    console.log('📋 Commande #10:');
    console.log('  Client ObjectId:', order.client);
    
    // Chercher le user
    const user = await users.findOne({ _id: order.client });
    console.log('\n👤 Client:');
    console.log('  Address:', user?.address);
    console.log('  Name:', user?.name);
    
    // L'adresse connectée
    const connectedAddr = '0x49bef4651a9316b0de3a45f72cede826cafad72a';
    console.log('\n🔑 Wallet connecté:', connectedAddr);
    
    if (user?.address) {
      const match = user.address.toLowerCase() === connectedAddr.toLowerCase();
      console.log('  Match:', match ? '✅ OUI' : '❌ NON');
      
      if (!match) {
        console.log('\n⚠️ Les adresses ne correspondent pas!');
        console.log('  DB:', user.address.toLowerCase());
        console.log('  Req:', connectedAddr.toLowerCase());
      }
    }
    
  } catch (e) {
    console.error('Erreur:', e.message);
  } finally {
    await mongoose.disconnect();
  }
}
check();
