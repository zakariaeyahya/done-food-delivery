/**
 * Script pour extraire et valider la clé privée depuis contracts/.env
 * Usage: node scripts/copy-private-key-from-contracts.js
 */

const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");

console.log("🔍 Recherche de la clé privée dans contracts/.env...\n");

// Chemin vers contracts/.env
const contractsEnvPath = path.join(__dirname, "../../contracts/.env");

// Vérifier si le fichier existe
if (!fs.existsSync(contractsEnvPath)) {
  console.error("❌ Fichier contracts/.env introuvable");
  console.error(`   Chemin attendu: ${contractsEnvPath}`);
  process.exit(1);
}

// Lire le fichier contracts/.env
let envContent;
try {
  envContent = fs.readFileSync(contractsEnvPath, "utf8");
} catch (error) {
  console.error("❌ Erreur lors de la lecture de contracts/.env:");
  console.error(`   ${error.message}`);
  process.exit(1);
}

// Extraire PRIVATE_KEY
const privateKeyMatch = envContent.match(/PRIVATE_KEY\s*=\s*(.+)/);
if (!privateKeyMatch) {
  console.error("❌ PRIVATE_KEY non trouvée dans contracts/.env");
  console.error("\n📝 Contenu du fichier (premières lignes):");
  console.error(envContent.split("\n").slice(0, 5).join("\n"));
  process.exit(1);
}

let privateKey = privateKeyMatch[1].trim();

// Supprimer les guillemets si présents
privateKey = privateKey.replace(/^["']|["']$/g, "");

console.log(`📝 Clé privée trouvée (longueur: ${privateKey.length} caractères)`);

// Normaliser la clé
let normalizedKey = privateKey.trim();

// Vérifier le préfixe
if (!normalizedKey.startsWith("0x")) {
  console.log("⚠️  Préfixe 0x manquant, ajout automatique...");
  normalizedKey = "0x" + normalizedKey;
}

// Vérifier la longueur
if (normalizedKey.length !== 66) {
  console.error(`❌ Longueur invalide: ${normalizedKey.length} caractères (attendu: 66)`);
  console.error(`   Format attendu: 0x + 64 caractères hexadécimaux`);
  console.error(`   Clé actuelle: ${normalizedKey.substring(0, 20)}...`);
  process.exit(1);
}

// Vérifier le format hexadécimal
if (!/^0x[a-fA-F0-9]{64}$/.test(normalizedKey)) {
  console.error("❌ Format invalide: la clé doit contenir uniquement des caractères hexadécimaux");
  process.exit(1);
}

// Essayer de créer un wallet avec cette clé
try {
  const wallet = new ethers.Wallet(normalizedKey);
  console.log("✅ Clé privée valide !");
  console.log(`   Adresse du wallet: ${wallet.address}`);
  console.log(`   Longueur: ${normalizedKey.length} caractères\n`);

  // Afficher la ligne à ajouter dans backend/.env
  console.log("📋 COPIEZ CETTE LIGNE dans votre fichier backend/.env :\n");
  console.log(`PRIVATE_KEY=${normalizedKey}\n`);
  console.log("⚠️  Remplacez la ligne PRIVATE_KEY existante dans backend/.env\n");

  // Vérifier si backend/.env existe
  const backendEnvPath = path.join(__dirname, "../.env");
  if (fs.existsSync(backendEnvPath)) {
    const backendEnvContent = fs.readFileSync(backendEnvPath, "utf8");
    
    // Vérifier si PRIVATE_KEY existe déjà
    if (backendEnvContent.includes("PRIVATE_KEY=")) {
      console.log("💡 Votre fichier backend/.env contient déjà une ligne PRIVATE_KEY=");
      console.log("   Remplacez-la par la ligne ci-dessus.\n");
    } else {
      console.log("💡 Ajoutez la ligne ci-dessus à votre fichier backend/.env\n");
    }
  } else {
    console.log("💡 Créez le fichier backend/.env et ajoutez la ligne ci-dessus\n");
  }

  console.log("✅ Après avoir mis à jour backend/.env, redémarrez le serveur:");
  console.log("   npm run dev\n");

} catch (error) {
  console.error("❌ Erreur lors de la validation de la clé:");
  console.error(`   ${error.message}`);
  process.exit(1);
}

