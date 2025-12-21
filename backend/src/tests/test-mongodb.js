/**
 * Script de test pour vérifier la connexion MongoDB Atlas
 * 
 * Usage:
 * 1. Créer le fichier .env avec MONGODB_URI configuré
 * 2. Exécuter: node test-mongodb.js
 * 3. Si vous voyez " MongoDB Atlas connected!", tout fonctionne
 * 4. Supprimer ce fichier après le test
 */

require('dotenv').config();
const mongoose = require('mongoose');

console.log('='.repeat(60));
console.log(' DIAGNOSTIC DE CONNEXION MONGODB ATLAS');
console.log('='.repeat(60));

// Vérifier que MONGODB_URI est défini
if (!process.env.MONGODB_URI) {
  console.error(' Erreur: MONGODB_URI n\'est pas défini dans .env');
  console.log('💡 Vérifiez que votre fichier .env contient MONGODB_URI');
  process.exit(1);
}

console.log('\n Informations de configuration:');
console.log('    MONGODB_URI trouvé dans .env');

// Analyser l'URI
const uri = process.env.MONGODB_URI;
const uriMasked = uri.replace(/:[^:@]+@/, ':****@');
console.log('    URI (masquée):', uriMasked);

// Extraire les informations de l'URI
try {
  const uriMatch = uri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)(\?.*)?/);
  if (uriMatch) {
    const [, username, password, host, database, params] = uriMatch;
    console.log('\n Détails de l\'URI:');
    console.log('   👤 Username:', username);
    console.log('   Password:', password.length > 0 ? '***' + password.slice(-2) : 'VIDE');
    console.log('   🌐 Host:', host);
    console.log('   📁 Database:', database || 'NON SPÉCIFIÉE');
    console.log('   ⚙️  Params:', params || 'Aucun');
    
    // Vérifier si le mot de passe contient des caractères spéciaux
    const specialChars = /[@#%&+=\s]/;
    if (specialChars.test(password)) {
      console.log('\n  ATTENTION: Le mot de passe contient des caractères spéciaux!');
      console.log('   💡 Les caractères spéciaux doivent être encodés en URL:');
      console.log('      @ → %40');
      console.log('      # → %23');
      console.log('      % → %25');
      console.log('      & → %26');
      console.log('      + → %2B');
      console.log('      = → %3D');
      console.log('      espace → %20');
    }
  } else {
    console.log('\n  Format d\'URI non reconnu');
  }
} catch (err) {
  console.log('\n  Impossible d\'analyser l\'URI:', err.message);
}

console.log('\n🔄 Tentative de connexion à MongoDB Atlas...');

// Options de connexion
const connectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000, // 10 secondes
  socketTimeoutMS: 45000,
};

console.log('\n⚙️  Options de connexion:');
console.log('   - useNewUrlParser: true');
console.log('   - useUnifiedTopology: true');
console.log('   - serverSelectionTimeoutMS: 10000ms');
console.log('   - socketTimeoutMS: 45000ms');

console.log('\n⏳ Connexion en cours...\n');

const startTime = Date.now();

mongoose.connect(process.env.MONGODB_URI, connectionOptions)
  .then(() => {
    const connectionTime = Date.now() - startTime;
    console.log(' MongoDB Atlas connecté avec succès!');
    console.log('   ⏱️  Temps de connexion:', connectionTime + 'ms');
    
    console.log('\n Informations de connexion:');
    console.log('   📁 Base de données:', mongoose.connection.name || 'N/A');
    console.log('   🌐 Host:', mongoose.connection.host || 'N/A');
    console.log('    Port:', mongoose.connection.port || 'N/A (Atlas)');
    console.log('   🔗 Ready State:', mongoose.connection.readyState);
    console.log('   📡 State:', getConnectionState(mongoose.connection.readyState));
    
    // Tester une opération simple
    console.log('\n Test d\'écriture en cours...');
    const testCollection = mongoose.connection.db.collection('test_connection');
    return testCollection.insertOne({ 
      test: true, 
      timestamp: new Date(),
      message: 'Test de connexion MongoDB Atlas'
    });
  })
  .then((result) => {
    console.log(' Test d\'écriture réussi!');
    console.log('    Document ID:', result.insertedId);
    return mongoose.connection.close();
  })
  .then(() => {
    console.log('\n Connexion fermée proprement');
    console.log('='.repeat(60));
    console.log(' Tout fonctionne! Vous pouvez commencer à coder.');
    console.log('='.repeat(60));
    process.exit(0);
  })
  .catch((err) => {
    const connectionTime = Date.now() - startTime;
    console.error('\n Erreur de connexion MongoDB Atlas');
    console.error('   ⏱️  Temps écoulé:', connectionTime + 'ms');
    console.error('   📛 Type d\'erreur:', err.name);
    console.error('   💬 Message:', err.message);
    
    if (err.stack) {
      console.error('\n Stack trace:');
      console.error(err.stack);
    }
    
    // Messages d'aide selon le type d'erreur
    console.log('\n' + '='.repeat(60));
    console.log(' SOLUTIONS POSSIBLES:');
    console.log('='.repeat(60));
    
    if (err.message.includes('authentication failed') || err.message.includes('bad auth')) {
      console.log('\n🔐 Problème d\'authentification:');
      console.log('   1. Vérifiez le username dans MongoDB Atlas:');
      console.log('      → Database Access → Vérifiez le nom d\'utilisateur');
      console.log('   2. Vérifiez le mot de passe:');
      console.log('      → Le mot de passe doit correspondre exactement');
      console.log('   3. Encodez les caractères spéciaux dans le mot de passe:');
      console.log('      → @ devient %40');
      console.log('      → # devient %23');
      console.log('      → % devient %25');
      console.log('      → & devient %26');
      console.log('      → + devient %2B');
      console.log('      → = devient %3D');
      console.log('      → Espace devient %20');
      console.log('   4. Exemple avec mot de passe "pass@word":');
      console.log('      → mongodb+srv://user:pass%40word@cluster...');
      console.log('   5. Vérifiez que l\'utilisateur a les bonnes permissions:');
      console.log('      → Database Access → Vérifiez "Atlas admin" ou "Read and write"');
    } else if (err.message.includes('IP') || err.message.includes('whitelist') || err.message.includes('network')) {
      console.log('\n🌐 Problème de réseau/IP:');
      console.log('   1. Allez dans MongoDB Atlas → Network Access');
      console.log('   2. Cliquez sur "Add IP Address"');
      console.log('   3. Cliquez sur "Add Current IP Address" (pour votre IP actuelle)');
      console.log('   4. OU cliquez sur "Allow Access from Anywhere" (0.0.0.0/0)');
      console.log('        Moins sécurisé mais pratique pour le développement');
      console.log('   5. Attendez 1-2 minutes que les changements prennent effet');
    } else if (err.message.includes('ENOTFOUND') || err.message.includes('timeout') || err.message.includes('ECONNREFUSED')) {
      console.log('\n🌍 Problème de connexion réseau:');
      console.log('   1. Vérifiez votre connexion internet');
      console.log('   2. Vérifiez que le cluster MongoDB Atlas est démarré:');
      console.log('      → Database → Vérifiez que le statut est "Running"');
      console.log('   3. Vérifiez que l\'URI est correcte:');
      console.log('      → Format: mongodb+srv://user:pass@cluster.xxxxx.mongodb.net/db?retryWrites=true&w=majority');
      console.log('   4. Vérifiez que le hostname est correct (cluster0.xxxxx.mongodb.net)');
    } else if (err.message.includes('MongoServerError')) {
      console.log('\n  Erreur serveur MongoDB:');
      console.log('   1. Vérifiez les logs MongoDB Atlas');
      console.log('   2. Vérifiez que le cluster n\'est pas en maintenance');
      console.log('   3. Réessayez dans quelques minutes');
    } else {
      console.log('\n❓ Erreur inconnue:');
      console.log('   1. Vérifiez tous les points ci-dessus');
      console.log('   2. Consultez la documentation MongoDB Atlas');
      console.log('   3. Vérifiez les logs MongoDB Atlas dans le dashboard');
    }
    
    console.log('\n' + '='.repeat(60));
    process.exit(1);
  });

// Fonction helper pour obtenir l'état de connexion
function getConnectionState(readyState) {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  return states[readyState] || 'unknown';
}

