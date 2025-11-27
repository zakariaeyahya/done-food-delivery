# Dossier scripts/

Ce dossier contient les scripts de déploiement, configuration et initialisation des smart contracts et du système.

## Fichiers

### deploy-all.js
**Rôle** : Script principal de déploiement de tous les smart contracts sur le réseau Polygon Mumbai.

**Fonctionnalités** :
- Importe les artefacts (ABI + bytecode) de tous les contrats :
  - DoneOrderManager
  - DonePaymentSplitter
  - DoneToken
  - DoneStaking
- Se connecte au réseau Mumbai via RPC et clé privée (variables d'environnement)
- Déploie chaque contrat dans le bon ordre de dépendances :
  1. DoneToken (indépendant)
  2. DonePaymentSplitter (indépendant)
  3. DoneStaking (indépendant)
  4. DoneOrderManager (dépend des autres)
- Récupère les adresses des contrats déployés
- Écrit les adresses dans un fichier de configuration (.env ou contracts.json) pour utilisation par :
  - Le backend (API Node.js)
  - Les frontends (applications React)

**Utilisation** :
```bash
npx hardhat run scripts/deploy-all.js --network mumbai
```

**Variables d'environnement requises** :
- MUMBAI_RPC_URL
- PRIVATE_KEY

### setup-roles.js
**Rôle** : Configuration des rôles dans le système après le déploiement des contrats.

**Fonctionnalités** :
- Charge les adresses des contrats depuis .env ou contracts.json
- Se connecte à DoneOrderManager (et éventuellement DoneStaking / DoneToken)
- Configure les rôles pour les différents acteurs :
  - PLATFORM : Rôle administrateur (arbitrage, gestion globale)
  - RESTAURANT : Adresses des restaurants
  - DELIVERER : Adresses des livreurs
  - ARBITRATOR : Adresses des arbitres
- Appelle les fonctions de type `grantRole(ROLE_RESTAURANT, address)`
- Vérifie et log les rôles configurés

**Utilisation** :
```bash
npx hardhat run scripts/setup-roles.js --network mumbai
```

**Fonctions appelées** :
- `grantRole(ROLE_RESTAURANT, address)` : Attribue le rôle restaurant
- `grantRole(ROLE_DELIVERER, address)` : Attribue le rôle livreur
- `grantRole(ROLE_ARBITRATOR, address)` : Attribue le rôle arbitre

### seed-data.js
**Rôle** : Remplissage du système avec des données de test pour le développement et les démos.

**Fonctionnalités** :
- Crée des restaurants dans la base de données MongoDB (backend)
- Crée des utilisateurs (clients, livreurs) dans MongoDB
- Crée 2-3 commandes on-chain pour tester différents états :
  - Commande en CREATED (créée mais pas encore préparée)
  - Commande en PREPARING (en cours de préparation)
  - Commande en DELIVERED (livrée avec succès)
- Effectue des stakings de livreurs via DoneStaking (simulation)
- Distribue quelques tokens DONE via DoneToken (simulation)

**Utilisation** :
```bash
node scripts/seed-data.js
```

**Avantages** :
- Permet de tester rapidement le système sans créer manuellement toutes les données
- Crée un environnement réaliste pour les démos
- Facilite le développement et les tests d'intégration

## Notes

- Tous les scripts utilisent Hardhat et Ethers.js pour interagir avec la blockchain
- Les scripts nécessitent une configuration correcte des variables d'environnement
- Les scripts sont idempotents (peuvent être exécutés plusieurs fois sans problème)
- Les scripts incluent une gestion d'erreurs et des logs détaillés

