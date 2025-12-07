/**
 * Script pour générer une clé privée valide
 * Usage: node scripts/generate-private-key.js
 */

const crypto = require("crypto");

console.log("🔑 Génération d'une nouvelle clé privée...\n");

// Générer 32 bytes aléatoires (256 bits)
const privateKeyBytes = crypto.randomBytes(32);

// Convertir en hexadécimal avec préfixe 0x
const privateKey = "0x" + privateKeyBytes.toString("hex");

// Créer un wallet pour vérifier
const { ethers } = require("ethers");
const wallet = new ethers.Wallet(privateKey);

console.log("✅ Clé privée générée avec succès !\n");
console.log("📝 Ajoutez cette ligne dans votre fichier backend/.env :\n");
console.log(`PRIVATE_KEY=${privateKey}\n`);
console.log("📋 Informations du wallet :");
console.log(`   Adresse: ${wallet.address}`);
console.log(`   Longueur de la clé: ${privateKey.length} caractères`);
console.log(`\n⚠️  IMPORTANT: Ne partagez JAMAIS cette clé privée !`);
console.log("   Elle est uniquement pour le développement/test.\n");

