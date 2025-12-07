/**
 * Script pour vérifier la configuration RPC dans .env
 * Usage: node scripts/check-rpc-config.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

console.log("🔍 Vérification de la configuration RPC...\n");

// Vérifier les URLs RPC
const amoyRpc = process.env.AMOY_RPC_URL;
const mumbaiRpc = process.env.MUMBAI_RPC_URL;

console.log("📝 Configuration actuelle:");
if (amoyRpc) {
  console.log(`   AMOY_RPC_URL: ${amoyRpc}`);
} else {
  console.log("   AMOY_RPC_URL: ❌ Non définie");
}

if (mumbaiRpc) {
  console.log(`   MUMBAI_RPC_URL: ${mumbaiRpc}`);
} else {
  console.log("   MUMBAI_RPC_URL: ❌ Non définie");
}

// Déterminer quelle URL sera utilisée
const rpcUrl = amoyRpc || mumbaiRpc;
if (!rpcUrl) {
  console.error("\n❌ Aucune URL RPC configurée !");
  console.error("   Ajoutez AMOY_RPC_URL ou MUMBAI_RPC_URL dans votre .env\n");
  process.exit(1);
}

console.log(`\n✅ URL RPC utilisée: ${rpcUrl}`);

// Vérifier si l'URL est valide
if (rpcUrl.includes("rpc-mumbai.maticvigil.com")) {
  console.log("\n⚠️  PROBLÈME DÉTECTÉ:");
  console.log("   L'URL rpc-mumbai.maticvigil.com n'est plus accessible");
  console.log("   Mumbai testnet a été déprécié au profit d'Amoy\n");
  
  console.log("💡 SOLUTION:");
  console.log("   Utilisez Polygon Amoy testnet à la place:\n");
  console.log("   AMOY_RPC_URL=https://rpc-amoy.polygon.technology\n");
  console.log("   OU utilisez un autre provider Amoy:\n");
  console.log("   AMOY_RPC_URL=https://polygon-amoy.drpc.org");
  console.log("   AMOY_RPC_URL=https://amoy.polygon.technology");
  console.log("   AMOY_RPC_URL=https://rpc.ankr.com/polygon_amoy\n");
  
} else if (rpcUrl.includes("amoy") || rpcUrl.includes("polygon")) {
  console.log("\n✅ URL RPC semble valide");
  console.log("   Si vous avez toujours des erreurs, essayez une autre URL RPC\n");
}

// Afficher les URLs RPC recommandées
console.log("\n📋 URLs RPC RECOMMANDÉES pour Polygon Amoy:\n");
console.log("# Option 1: Polygon officiel");
console.log("AMOY_RPC_URL=https://rpc-amoy.polygon.technology\n");
console.log("# Option 2: Ankr");
console.log("AMOY_RPC_URL=https://rpc.ankr.com/polygon_amoy\n");
console.log("# Option 3: DRPC");
console.log("AMOY_RPC_URL=https://polygon-amoy.drpc.org\n");
console.log("# Option 4: Alchemy (nécessite une clé API)");
console.log("AMOY_RPC_URL=https://polygon-amoy.g.alchemy.com/v2/YOUR_API_KEY\n");
console.log("# Option 5: Infura (nécessite une clé API)");
console.log("AMOY_RPC_URL=https://polygon-amoy.infura.io/v3/YOUR_PROJECT_ID\n");

