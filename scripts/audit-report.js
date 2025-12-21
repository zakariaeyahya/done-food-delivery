/**
 * Script d'audit sécurité - Génération rapport audit
 * @fileoverview Analyse les contrats pour vulnérabilités et génère rapport markdown
 */

const fs = require("fs");
const path = require("path");
const { ethers } = require("hardhat");

/**
 * Fonction principale pour générer rapport d'audit
 */
async function main() {
  console.log(" Démarrage de l'audit sécurité...\n");

  // Initialiser variables
  const findings = {
    critical: [],
    high: [],
    medium: [],
    low: []
  };

  // Analyser chaque contrat
  const contracts = [
    "DoneOrderManager",
    "DonePaymentSplitter",
    "DoneToken",
    "DoneStaking",
    "DonePriceOracle",
    "DoneGPSOracle",
    "DoneWeatherOracle",
    "DoneArbitration"
  ];

  for (const contractName of contracts) {
    console.log(`📄 Analyse de ${contractName}...`);
    
    try {
      // Charger le contrat compilé
      const artifactsPath = path.join(__dirname, "../contracts/artifacts/contracts");
      let contractPath = null;
      
      // Chercher le fichier selon le nom
      if (contractName.includes("Oracle")) {
        contractPath = path.join(artifactsPath, `oracles/${contractName}.sol/${contractName}.json`);
      } else if (contractName === "DoneArbitration") {
        contractPath = path.join(artifactsPath, `governance/${contractName}.sol/${contractName}.json`);
      } else {
        contractPath = path.join(artifactsPath, `${contractName}.sol/${contractName}.json`);
      }
      
      if (!fs.existsSync(contractPath)) {
        console.warn(`  ${contractName} not found at ${contractPath}`);
        continue;
      }
      
      const artifact = JSON.parse(fs.readFileSync(contractPath, "utf8"));
      const sourceCode = artifact.source || "";
      
      // Vérifier protection réentrancy
      if (sourceCode.includes("ReentrancyGuard") || sourceCode.includes("nonReentrant")) {
        findings.low.push({
          contract: contractName,
          issue: "Reentrancy protection",
          status: "✓ Utilise ReentrancyGuard",
          severity: "low"
        });
      } else if (contractName === "DoneOrderManager" || contractName === "DonePaymentSplitter" || contractName === "DoneStaking") {
        findings.critical.push({
          contract: contractName,
          issue: "Reentrancy protection",
          status: "✗ Manque ReentrancyGuard",
          severity: "critical"
        });
      }
      
      // Vérifier contrôle d'accès
      if (sourceCode.includes("AccessControl") || sourceCode.includes("Ownable")) {
        findings.low.push({
          contract: contractName,
          issue: "Access control",
          status: "✓ Utilise AccessControl/Ownable",
          severity: "low"
        });
      } else if (contractName === "DoneOrderManager" || contractName === "DoneToken" || contractName === "DoneStaking") {
        findings.high.push({
          contract: contractName,
          issue: "Access control",
          status: "✗ Manque AccessControl",
          severity: "high"
        });
      }
      
      // Vérifier overflow protection (Solidity ≥ 0.8)
      if (sourceCode.includes("pragma solidity ^0.8") || sourceCode.includes("pragma solidity >=0.8")) {
        findings.low.push({
          contract: contractName,
          issue: "Integer overflow",
          status: "✓ Solidity ≥ 0.8 revert automatiquement",
          severity: "low"
        });
      }
      
      // Vérifier events pour audit trail
      const eventCount = (sourceCode.match(/event\s+\w+/g) || []).length;
      if (eventCount > 0) {
        findings.low.push({
          contract: contractName,
          issue: "Events for audit",
          status: `✓ ${eventCount} events émis`,
          severity: "low"
        });
      } else {
        findings.medium.push({
          contract: contractName,
          issue: "Events for audit",
          status: "  Aucun event émis",
          severity: "medium"
        });
      }
      
      // Vérifier Pausable pour urgence
      if (sourceCode.includes("Pausable") || sourceCode.includes("pause()")) {
        findings.low.push({
          contract: contractName,
          issue: "Pausable for emergency",
          status: "✓ Utilise Pausable",
          severity: "low"
        });
      }
      
      // Vérifier SafeMath (pas nécessaire avec Solidity ≥ 0.8)
      if (sourceCode.includes("SafeMath")) {
        findings.low.push({
          contract: contractName,
          issue: "SafeMath usage",
          status: "  SafeMath utilisé (pas nécessaire avec Solidity ≥ 0.8)",
          severity: "low"
        });
      }
      
    } catch (error) {
      console.error(` Erreur lors de l'analyse de ${contractName}:`, error.message);
      findings.medium.push({
        contract: contractName,
        issue: "Analysis error",
        status: `✗ Erreur: ${error.message}`,
        severity: "medium"
      });
    }
  }

  // Générer rapport markdown
  const report = generateMarkdownReport(findings);
  
  // Sauvegarder rapport
  const reportPath = path.join(__dirname, "../audit-report.md");
  fs.writeFileSync(reportPath, report);
  console.log(`\n Rapport d'audit généré: ${reportPath}`);
}

/**
 * Génère rapport markdown
 */
function generateMarkdownReport(findings) {
  let report = "# Rapport d'Audit Sécurité\n\n";
  report += `Généré le: ${new Date().toISOString()}\n\n`;
  
  // Section Critical
  if (findings.critical.length > 0) {
    report += "## 🔴 Critical Issues\n\n";
    for (const finding of findings.critical) {
      report += `### ${finding.contract} - ${finding.issue}\n`;
      report += `- **Status**: ${finding.status}\n`;
      report += `- **Severity**: ${finding.severity}\n\n`;
    }
  } else {
    report += "## 🔴 Critical Issues\n\n";
    report += "Aucun problème critique détecté. ✓\n\n";
  }
  
  // Section High
  if (findings.high.length > 0) {
    report += "## 🟠 High Issues\n\n";
    for (const finding of findings.high) {
      report += `### ${finding.contract} - ${finding.issue}\n`;
      report += `- **Status**: ${finding.status}\n\n`;
    }
  } else {
    report += "## 🟠 High Issues\n\n";
    report += "Aucun problème high détecté. ✓\n\n";
  }
  
  // Section Medium
  if (findings.medium.length > 0) {
    report += "## 🟡 Medium Issues\n\n";
    for (const finding of findings.medium) {
      report += `### ${finding.contract} - ${finding.issue}\n`;
      report += `- **Status**: ${finding.status}\n\n`;
    }
  } else {
    report += "## 🟡 Medium Issues\n\n";
    report += "Aucun problème medium détecté. ✓\n\n";
  }
  
  // Section Low
  report += "## 🟢 Low Issues / Recommendations\n\n";
  for (const finding of findings.low) {
    report += `### ${finding.contract} - ${finding.issue}\n`;
    report += `- **Status**: ${finding.status}\n\n`;
  }
  
  // Résumé
  report += "## Résumé\n\n";
  report += `- Critical: ${findings.critical.length}\n`;
  report += `- High: ${findings.high.length}\n`;
  report += `- Medium: ${findings.medium.length}\n`;
  report += `- Low: ${findings.low.length}\n\n`;
  
  return report;
}

// Exécuter main() si script appelé directement
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { main, generateMarkdownReport };
