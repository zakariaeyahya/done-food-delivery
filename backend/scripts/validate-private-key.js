/**
 * Script pour valider la clé privée dans .env
 * Usage: node scripts/validate-private-key.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const { ethers } = require("ethers");

console.log(" Validation de la clé privée...\n");

// Récupérer la clé privée
const privateKey = process.env.PRIVATE_KEY;

if (!privateKey) {
  console.error(" PRIVATE_KEY n'est pas définie dans .env");
  process.exit(1);
}

console.log(` Clé privée trouvée (longueur: ${privateKey.length} caractères)`);

// Normaliser la clé
let normalizedKey = privateKey.trim();

// Vérifier le préfixe
if (!normalizedKey.startsWith('0x')) {
  console.log("  Préfixe 0x manquant, ajout automatique...");
  normalizedKey = '0x' + normalizedKey;
}

// Vérifier la longueur
if (normalizedKey.length !== 66) {
  console.error(` Longueur invalide: ${normalizedKey.length} caractères (attendu: 66)`);
  console.error(`   Format attendu: 0x + 64 caractères hexadécimaux`);
  process.exit(1);
}

// Vérifier le format hexadécimal
if (!/^0x[a-fA-F0-9]{64}$/.test(normalizedKey)) {
  console.error(" Format invalide: la clé doit contenir uniquement des caractères hexadécimaux (0-9, a-f, A-F)");
  console.error(`   Caractères détectés: ${normalizedKey.substring(0, 20)}...`);
  
  // Trouver les caractères invalides
  const invalidChars = normalizedKey.match(/[^0-9a-fA-Fx]/g);
  if (invalidChars) {
    console.error(`   Caractères invalides trouvés: ${[...new Set(invalidChars)].join(', ')}`);
  }
  
  process.exit(1);
}

// Essayer de créer un wallet avec cette clé
try {
  const wallet = new ethers.Wallet(normalizedKey);
  console.log(" Clé privée valide !");
  console.log(`   Adresse du wallet: ${wallet.address}`);
  console.log(`   Longueur: ${normalizedKey.length} caractères`);
  console.log(`   Format: ${normalizedKey.substring(0, 10)}...${normalizedKey.substring(normalizedKey.length - 10)}`);
  
  // Vérifier si la clé dans .env a besoin d'être mise à jour
  if (privateKey !== normalizedKey) {
    console.log("\n  RECOMMANDATION:");
    console.log("   Votre clé privée dans .env devrait être mise à jour avec le préfixe 0x:");
    console.log(`   PRIVATE_KEY=${normalizedKey}`);
  } else {
    console.log("\n La clé privée est correctement formatée dans .env");
  }
  
} catch (error) {
  console.error(" Erreur lors de la création du wallet:");
  console.error(`   ${error.message}`);
  
  if (error.code === 'INVALID_ARGUMENT') {
    console.error("\n💡 SOLUTION:");
    console.error("   1. Vérifiez que la clé privée est bien hexadécimale");
    console.error("   2. Assurez-vous qu'il n'y a pas d'espaces ou de caractères invisibles");
    console.error("   3. La clé doit faire exactement 64 caractères hex (sans compter 0x)");
    console.error("\n   Exemple de format correct:");
    console.error("   PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef");
  }
  
  process.exit(1);
}

console.log("\n Validation terminée avec succès !");

