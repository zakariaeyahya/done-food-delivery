# Done Delivery Protocol

Smart Contracts pour la gestion Web3 des commandes, livraisons, paiements automatisés, staking et oracles.

## Quick Start

### 1. Installer les dépendances :
```powershell
npm install
```
### 2. Compiler les contrats :
```powershell
npx hardhat compile
```
### 3. Lancer les tests :
```powershell
npx hardhat test
npx hardhat compile
```

## 4. Configurer l’environnement :

Créer un fichier .env (voir .env.example) :
```powershell
PRIVATE_KEY=0xVotreCle
AMOY_RPC_URL=https://polygon-amoy.infura.io/v3/...
```

### 5. Déployer sur Polygon Amoy :
```powershell
npx hardhat run scripts/deploy-amoy.js --network polygon-amoy
```
### 6. Configurer les rôles :
```powershell
npx hardhat run scripts/setup-roles.js --network polygon-amoy
```
### 7. Injecter des données de test :
```powershell
npx hardhat run scripts/seed-data-amoy.js --network polygon-amoy
```
## Documentation :

Consulter :

README_CONTRACTS.md : Description des contrats

README_SCRIPTS.md : Guide des scripts

README_TESTS.md : Documentation des tests
