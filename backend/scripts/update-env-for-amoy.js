/**
 * Script pour mettre à jour .env avec la configuration Amoy
 * Usage: node scripts/update-env-for-amoy.js
 */

const fs = require("fs");
const path = require("path");

console.log("🔧 Mise à jour de backend/.env pour Polygon Amoy...\n");

// Chemin vers les fichiers
const backendEnvPath = path.join(__dirname, "../.env");
const contractsAmoyPath = path.join(__dirname, "../../contracts/contracts-amoy.json");

// Vérifier si contracts-amoy.json existe
if (!fs.existsSync(contractsAmoyPath)) {
  console.error("❌ Fichier contracts/contracts-amoy.json introuvable");
  console.error("   Assurez-vous que les contrats sont déployés sur Amoy");
  process.exit(1);
}

// Lire les adresses des contrats
const contractsAmoy = JSON.parse(fs.readFileSync(contractsAmoyPath, "utf8"));

console.log("📝 Adresses des contrats Amoy trouvées:");
console.log(`   DoneOrderManager: ${contractsAmoy.DoneOrderManager}`);
console.log(`   DonePaymentSplitter: ${contractsAmoy.DonePaymentSplitter}`);
console.log(`   DoneToken: ${contractsAmoy.DoneToken}`);
console.log(`   DoneStaking: ${contractsAmoy.DoneStaking}\n`);

// Vérifier si backend/.env existe
if (!fs.existsSync(backendEnvPath)) {
  console.error("❌ Fichier backend/.env introuvable");
  console.error("   Créez d'abord le fichier .env");
  process.exit(1);
}

// Lire le contenu actuel de .env
let envContent = fs.readFileSync(backendEnvPath, "utf8");

// URLs RPC recommandées (essayer dans l'ordre)
const rpcUrls = [
  "https://rpc-amoy.polygon.technology",
  "https://rpc.ankr.com/polygon_amoy",
  "https://polygon-amoy.drpc.org"
];

console.log("📋 Mise à jour recommandée pour votre .env:\n");

// Remplacer ou ajouter AMOY_RPC_URL
if (envContent.includes("MUMBAI_RPC_URL=")) {
  console.log("⚠️  MUMBAI_RPC_URL trouvée (dépréciée)");
  console.log("   Remplacez-la par AMOY_RPC_URL\n");
}

// Afficher les modifications à faire
console.log("1️⃣  URL RPC (remplacez MUMBAI_RPC_URL par):");
console.log(`   AMOY_RPC_URL=${rpcUrls[0]}\n`);

console.log("2️⃣  Adresses des contrats (remplacez ou ajoutez):");
console.log(`   ORDER_MANAGER_ADDRESS=${contractsAmoy.DoneOrderManager}`);
console.log(`   PAYMENT_SPLITTER_ADDRESS=${contractsAmoy.DonePaymentSplitter}`);
console.log(`   TOKEN_ADDRESS=${contractsAmoy.DoneToken}`);
console.log(`   STAKING_ADDRESS=${contractsAmoy.DoneStaking}\n`);

// Vérifier les adresses actuelles
const currentOrderManager = envContent.match(/ORDER_MANAGER_ADDRESS\s*=\s*(.+)/);
const currentPaymentSplitter = envContent.match(/PAYMENT_SPLITTER_ADDRESS\s*=\s*(.+)/);
const currentToken = envContent.match(/TOKEN_ADDRESS\s*=\s*(.+)/);
const currentStaking = envContent.match(/STAKING_ADDRESS\s*=\s*(.+)/);

if (currentOrderManager || currentPaymentSplitter || currentToken || currentStaking) {
  console.log("📝 Adresses actuelles dans .env:");
  if (currentOrderManager) console.log(`   ORDER_MANAGER_ADDRESS=${currentOrderManager[1].trim()}`);
  if (currentPaymentSplitter) console.log(`   PAYMENT_SPLITTER_ADDRESS=${currentPaymentSplitter[1].trim()}`);
  if (currentToken) console.log(`   TOKEN_ADDRESS=${currentToken[1].trim()}`);
  if (currentStaking) console.log(`   STAKING_ADDRESS=${currentStaking[1].trim()}`);
  console.log("\n   ⚠️  Vérifiez si ces adresses sont sur Amoy ou Mumbai");
  console.log("   Si elles sont sur Mumbai, remplacez-les par les adresses Amoy ci-dessus\n");
}

console.log("✅ Instructions complètes dans: backend/CORRECTION_RPC_URL.md\n");

