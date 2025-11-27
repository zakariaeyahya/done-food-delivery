# Dossier scripts/

Ce dossier contient les scripts de déploiement, configuration et initialisation de la plateforme DONE Food Delivery sur la blockchain.

## Structure

```
scripts/
├── deploy-all.js
├── setup-roles.js
└── seed-data.js
```

## Scripts

### deploy-all.js

**Rôle** : Déployer automatiquement tous les smart contracts sur le réseau Polygon Mumbai (testnet) ou Mainnet.

**Ordre de déploiement** :
1. DoneToken.sol
2. DonePaymentSplitter.sol
3. DoneStaking.sol
4. DoneOrderManager.sol

**Contenu détaillé** :

```javascript
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Démarrage du déploiement sur", hre.network.name);

  const [deployer] = await hre.ethers.getSigners();
  console.log("Compte déployeur:", deployer.address);
  console.log("Balance:", (await deployer.getBalance()).toString());

  // 1. Déployer DoneToken
  console.log("\n1. Déploiement DoneToken...");
  const DoneToken = await hre.ethers.getContractFactory("DoneToken");
  const doneToken = await DoneToken.deploy();
  await doneToken.deployed();
  console.log("DoneToken déployé à:", doneToken.address);

  // 2. Déployer DonePaymentSplitter
  console.log("\n2. Déploiement DonePaymentSplitter...");
  const DonePaymentSplitter = await hre.ethers.getContractFactory("DonePaymentSplitter");
  const paymentSplitter = await DonePaymentSplitter.deploy();
  await paymentSplitter.deployed();
  console.log("DonePaymentSplitter déployé à:", paymentSplitter.address);

  // 3. Déployer DoneStaking
  console.log("\n3. Déploiement DoneStaking...");
  const DoneStaking = await hre.ethers.getContractFactory("DoneStaking");
  const staking = await DoneStaking.deploy();
  await staking.deployed();
  console.log("DoneStaking déployé à:", staking.address);

  // 4. Déployer DoneOrderManager
  console.log("\n4. Déploiement DoneOrderManager...");
  const DoneOrderManager = await hre.ethers.getContractFactory("DoneOrderManager");
  const orderManager = await DoneOrderManager.deploy(
    paymentSplitter.address,
    doneToken.address,
    staking.address
  );
  await orderManager.deployed();
  console.log("DoneOrderManager déployé à:", orderManager.address);

  // 5. Configuration post-déploiement
  console.log("\n5. Configuration des autorisations...");

  // Donner au OrderManager le droit de mint des tokens
  const MINTER_ROLE = await doneToken.MINTER_ROLE();
  await doneToken.grantRole(MINTER_ROLE, orderManager.address);
  console.log("OrderManager autorisé à mint des tokens");

  // 6. Sauvegarder les adresses
  const addresses = {
    network: hre.network.name,
    deployer: deployer.address,
    DoneToken: doneToken.address,
    DonePaymentSplitter: paymentSplitter.address,
    DoneStaking: staking.address,
    DoneOrderManager: orderManager.address,
    deployedAt: new Date().toISOString()
  };

  const addressesPath = path.join(__dirname, "../deployed-addresses.json");
  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
  console.log("\nAdresses sauvegardées dans:", addressesPath);

  // 7. Afficher récapitulatif
  console.log("\n=== RÉCAPITULATIF DÉPLOIEMENT ===");
  console.log("Réseau:", hre.network.name);
  console.log("DoneToken:", doneToken.address);
  console.log("DonePaymentSplitter:", paymentSplitter.address);
  console.log("DoneStaking:", staking.address);
  console.log("DoneOrderManager:", orderManager.address);
  console.log("\nCopiez ces adresses dans backend/.env et frontend/.env");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

**Variables d'environnement requises** :
- `PRIVATE_KEY` : Clé privée du compte déployeur
- `MUMBAI_RPC_URL` : URL du RPC Polygon Mumbai (ex: https://rpc-mumbai.maticvigil.com)

**Commande d'exécution** :
```bash
# Testnet Mumbai
npx hardhat run scripts/deploy-all.js --network mumbai

# Mainnet Polygon
npx hardhat run scripts/deploy-all.js --network polygon
```

**Fichier de sortie** :
Le script crée `deployed-addresses.json` à la racine du projet avec toutes les adresses déployées.

**Durée estimée** : 2-3 minutes sur Mumbai, 5-10 minutes sur Mainnet.

---

### setup-roles.js

**Rôle** : Configurer les rôles AccessControl pour les adresses des restaurants, livreurs et arbitres après déploiement.

**Prérequis** :
- Les contrats doivent être déployés (`deployed-addresses.json` doit exister)
- Le compte exécutant le script doit avoir le rôle `DEFAULT_ADMIN_ROLE` sur DoneOrderManager

**Contenu détaillé** :

```javascript
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Configuration des rôles sur", hre.network.name);

  // 1. Charger les adresses déployées
  const addressesPath = path.join(__dirname, "../deployed-addresses.json");
  if (!fs.existsSync(addressesPath)) {
    throw new Error("Fichier deployed-addresses.json introuvable. Exécutez d'abord deploy-all.js");
  }
  const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));

  const [admin] = await hre.ethers.getSigners();
  console.log("Admin:", admin.address);

  // 2. Récupérer l'instance du contrat DoneOrderManager
  const DoneOrderManager = await hre.ethers.getContractFactory("DoneOrderManager");
  const orderManager = DoneOrderManager.attach(addresses.DoneOrderManager);

  // 3. Définir les rôles (keccak256)
  const CLIENT_ROLE = await orderManager.CLIENT_ROLE();
  const RESTAURANT_ROLE = await orderManager.RESTAURANT_ROLE();
  const DELIVERER_ROLE = await orderManager.DELIVERER_ROLE();
  const PLATFORM_ROLE = await orderManager.PLATFORM_ROLE();
  const ARBITRATOR_ROLE = await orderManager.ARBITRATOR_ROLE();

  console.log("\nRôles disponibles:");
  console.log("CLIENT_ROLE:", CLIENT_ROLE);
  console.log("RESTAURANT_ROLE:", RESTAURANT_ROLE);
  console.log("DELIVERER_ROLE:", DELIVERER_ROLE);
  console.log("PLATFORM_ROLE:", PLATFORM_ROLE);
  console.log("ARBITRATOR_ROLE:", ARBITRATOR_ROLE);

  // 4. Configurer les adresses de test
  // IMPORTANT: Remplacer ces adresses par les vraies adresses de production

  const restaurantAddresses = [
    "0x1234567890123456789012345678901234567890", // Restaurant 1
    "0x2345678901234567890123456789012345678901", // Restaurant 2
    "0x3456789012345678901234567890123456789012"  // Restaurant 3
  ];

  const delivererAddresses = [
    "0x4567890123456789012345678901234567890123", // Livreur 1
    "0x5678901234567890123456789012345678901234", // Livreur 2
    "0x6789012345678901234567890123456789012345"  // Livreur 3
  ];

  const arbitratorAddresses = [
    admin.address // L'admin est aussi arbitre
  ];

  const platformAddress = admin.address; // L'admin est la plateforme

  // 5. Assigner le rôle RESTAURANT
  console.log("\nAssignation rôle RESTAURANT...");
  for (const addr of restaurantAddresses) {
    const tx = await orderManager.grantRole(RESTAURANT_ROLE, addr);
    await tx.wait();
    console.log("Restaurant autorisé:", addr);
  }

  // 6. Assigner le rôle DELIVERER
  console.log("\nAssignation rôle DELIVERER...");
  for (const addr of delivererAddresses) {
    const tx = await orderManager.grantRole(DELIVERER_ROLE, addr);
    await tx.wait();
    console.log("Livreur autorisé:", addr);
  }

  // 7. Assigner le rôle ARBITRATOR
  console.log("\nAssignation rôle ARBITRATOR...");
  for (const addr of arbitratorAddresses) {
    const tx = await orderManager.grantRole(ARBITRATOR_ROLE, addr);
    await tx.wait();
    console.log("Arbitre autorisé:", addr);
  }

  // 8. Assigner le rôle PLATFORM
  console.log("\nAssignation rôle PLATFORM...");
  const tx = await orderManager.grantRole(PLATFORM_ROLE, platformAddress);
  await tx.wait();
  console.log("Plateforme autorisée:", platformAddress);

  // 9. Vérification
  console.log("\n=== VÉRIFICATION DES RÔLES ===");
  console.log("Restaurant 1 a le rôle?", await orderManager.hasRole(RESTAURANT_ROLE, restaurantAddresses[0]));
  console.log("Livreur 1 a le rôle?", await orderManager.hasRole(DELIVERER_ROLE, delivererAddresses[0]));
  console.log("Admin a le rôle ARBITRATOR?", await orderManager.hasRole(ARBITRATOR_ROLE, admin.address));
  console.log("Admin a le rôle PLATFORM?", await orderManager.hasRole(PLATFORM_ROLE, platformAddress));

  console.log("\nConfiguration des rôles terminée.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

**Commande d'exécution** :
```bash
npx hardhat run scripts/setup-roles.js --network mumbai
```

**Note importante** :
Les adresses dans le tableau doivent être remplacées par les vraies adresses de production. Pour le développement, utiliser les adresses des comptes Hardhat ou MetaMask de test.

---

### seed-data.js

**Rôle** : Créer des données de test réalistes dans MongoDB et sur la blockchain pour faciliter le développement et les démonstrations.

**Prérequis** :
- MongoDB doit être démarré et accessible
- Les contrats doivent être déployés
- Les rôles doivent être configurés
- Le backend doit être démarré

**Contenu détaillé** :

```javascript
const mongoose = require("mongoose");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../backend/.env") });

// Importer les modèles MongoDB
const User = require("../backend/src/models/User");
const Restaurant = require("../backend/src/models/Restaurant");
const Deliverer = require("../backend/src/models/Deliverer");
const Order = require("../backend/src/models/Order");

async function main() {
  console.log("Initialisation du seed de données...");

  // 1. Connexion à MongoDB
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log("Connecté à MongoDB");

  // 2. Nettoyer les collections existantes
  console.log("\nSuppression des anciennes données...");
  await User.deleteMany({});
  await Restaurant.deleteMany({});
  await Deliverer.deleteMany({});
  await Order.deleteMany({});
  console.log("Données effacées");

  // 3. Charger les adresses des contrats
  const addressesPath = path.join(__dirname, "../deployed-addresses.json");
  const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));

  // 4. Récupérer les signers Hardhat
  const [deployer, client1, client2, restaurant1, restaurant2, deliverer1, deliverer2] = await ethers.getSigners();

  // 5. Créer des utilisateurs (clients)
  console.log("\nCréation des utilisateurs...");
  const users = [
    {
      address: client1.address,
      name: "Alice Martin",
      email: "alice@example.com",
      phone: "+33612345678",
      deliveryAddresses: [
        {
          label: "Domicile",
          address: "15 Rue de la Paix, 75002 Paris",
          lat: 48.8698,
          lng: 2.3316
        }
      ]
    },
    {
      address: client2.address,
      name: "Bob Dupont",
      email: "bob@example.com",
      phone: "+33623456789",
      deliveryAddresses: [
        {
          label: "Travail",
          address: "10 Avenue des Champs-Élysées, 75008 Paris",
          lat: 48.8698,
          lng: 2.3079
        }
      ]
    }
  ];

  for (const userData of users) {
    const user = await User.create(userData);
    console.log("Utilisateur créé:", user.name, "-", user.address);
  }

  // 6. Créer des restaurants
  console.log("\nCréation des restaurants...");
  const restaurants = [
    {
      address: restaurant1.address,
      name: "Pizza Roma",
      cuisine: "Italienne",
      description: "Pizzas authentiques cuites au feu de bois",
      location: {
        address: "5 Rue de Rivoli, 75001 Paris",
        lat: 48.8606,
        lng: 2.3376
      },
      images: ["QmPizzaRoma1", "QmPizzaRoma2"], // IPFS hashes simulés
      menu: [
        {
          name: "Pizza Margherita",
          description: "Tomate, mozzarella, basilic",
          price: 12,
          image: "QmMargherita",
          category: "Pizzas",
          available: true
        },
        {
          name: "Pizza Quattro Formaggi",
          description: "4 fromages italiens",
          price: 15,
          image: "QmQuattroFormaggi",
          category: "Pizzas",
          available: true
        },
        {
          name: "Tiramisu",
          description: "Dessert italien traditionnel",
          price: 6,
          image: "QmTiramisu",
          category: "Desserts",
          available: true
        }
      ],
      rating: 4.5,
      totalOrders: 0,
      isActive: true
    },
    {
      address: restaurant2.address,
      name: "Sushi Tokyo",
      cuisine: "Japonaise",
      description: "Sushis frais préparés par un chef japonais",
      location: {
        address: "20 Rue Saint-Honoré, 75001 Paris",
        lat: 48.8626,
        lng: 2.3345
      },
      images: ["QmSushiTokyo1", "QmSushiTokyo2"],
      menu: [
        {
          name: "Sushi Mix 12 pièces",
          description: "Assortiment de sushis variés",
          price: 18,
          image: "QmSushiMix",
          category: "Sushis",
          available: true
        },
        {
          name: "Maki Saumon",
          description: "6 pièces au saumon frais",
          price: 8,
          image: "QmMakiSaumon",
          category: "Makis",
          available: true
        }
      ],
      rating: 4.8,
      totalOrders: 0,
      isActive: true
    }
  ];

  for (const restaurantData of restaurants) {
    const restaurant = await Restaurant.create(restaurantData);
    console.log("Restaurant créé:", restaurant.name, "-", restaurant.address);
  }

  // 7. Créer des livreurs
  console.log("\nCréation des livreurs...");
  const deliverers = [
    {
      address: deliverer1.address,
      name: "Jean Livreur",
      phone: "+33634567890",
      vehicleType: "scooter",
      currentLocation: {
        lat: 48.8566,
        lng: 2.3522,
        lastUpdated: new Date()
      },
      isAvailable: true,
      isStaked: false,
      stakedAmount: 0,
      rating: 4.7,
      totalDeliveries: 0
    },
    {
      address: deliverer2.address,
      name: "Marie Course",
      phone: "+33645678901",
      vehicleType: "bike",
      currentLocation: {
        lat: 48.8606,
        lng: 2.3376,
        lastUpdated: new Date()
      },
      isAvailable: true,
      isStaked: false,
      stakedAmount: 0,
      rating: 4.9,
      totalDeliveries: 0
    }
  ];

  for (const delivererData of deliverers) {
    const deliverer = await Deliverer.create(delivererData);
    console.log("Livreur créé:", deliverer.name, "-", deliverer.address);
  }

  // 8. Créer une commande on-chain et off-chain
  console.log("\nCréation d'une commande de test...");

  const DoneOrderManager = await ethers.getContractFactory("DoneOrderManager");
  const orderManager = DoneOrderManager.attach(addresses.DoneOrderManager);

  const foodPrice = ethers.utils.parseEther("12"); // 12 MATIC
  const deliveryFee = ethers.utils.parseEther("3"); // 3 MATIC
  const platformFee = foodPrice.mul(10).div(100); // 10% de 12 = 1.2 MATIC
  const totalAmount = foodPrice.add(deliveryFee).add(platformFee);

  const ipfsHash = "QmOrder1Details"; // Hash IPFS simulé

  const tx = await orderManager.connect(client1).createOrder(
    restaurant1.address,
    foodPrice,
    deliveryFee,
    ipfsHash,
    { value: totalAmount }
  );
  const receipt = await tx.wait();

  const orderCreatedEvent = receipt.events.find(e => e.event === "OrderCreated");
  const orderId = orderCreatedEvent.args.orderId.toNumber();

  console.log("Commande créée on-chain, ID:", orderId);

  // Créer l'entrée MongoDB correspondante
  const restaurantDoc = await Restaurant.findOne({ address: restaurant1.address });
  const clientDoc = await User.findOne({ address: client1.address });

  const order = await Order.create({
    orderId: orderId,
    txHash: tx.hash,
    client: clientDoc._id,
    restaurant: restaurantDoc._id,
    items: [
      {
        name: "Pizza Margherita",
        quantity: 1,
        price: 12,
        image: "QmMargherita"
      }
    ],
    deliveryAddress: "15 Rue de la Paix, 75002 Paris",
    ipfsHash: ipfsHash,
    status: "CREATED",
    foodPrice: 12,
    deliveryFee: 3,
    platformFee: 1.2,
    totalAmount: 16.2,
    gpsTracking: [],
    createdAt: new Date()
  });

  console.log("Commande créée dans MongoDB, ID:", order._id);

  // 9. Récapitulatif
  console.log("\n=== RÉCAPITULATIF SEED ===");
  console.log("Utilisateurs:", await User.countDocuments());
  console.log("Restaurants:", await Restaurant.countDocuments());
  console.log("Livreurs:", await Deliverer.countDocuments());
  console.log("Commandes:", await Order.countDocuments());
  console.log("\nDonnées de test créées avec succès.");

  // 10. Fermer la connexion
  await mongoose.connection.close();
  console.log("Connexion MongoDB fermée.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

**Variables d'environnement requises** :
- `MONGODB_URI` : URI de connexion MongoDB

**Commande d'exécution** :
```bash
node scripts/seed-data.js
```

**Données créées** :
- 2 utilisateurs (clients)
- 2 restaurants avec menus complets
- 2 livreurs
- 1 commande on-chain et off-chain

**Utilisation** :
Ce script doit être exécuté après le déploiement des contrats et la configuration des rôles pour avoir un environnement de développement fonctionnel avec des données réalistes.

---

## Ordre d'exécution recommandé

1. `deploy-all.js` - Déployer tous les contrats
2. `setup-roles.js` - Configurer les rôles AccessControl
3. `seed-data.js` - Créer les données de test

## Notes importantes

- Tous les scripts utilisent Hardhat pour les interactions blockchain
- Les adresses déployées sont sauvegardées dans `deployed-addresses.json`
- Les scripts incluent des validations et des messages d'erreur clairs
- Chaque script peut être exécuté indépendamment après satisfaction des prérequis
