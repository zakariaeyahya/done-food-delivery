# Guide d'Integration Blockchain - DONE Food Delivery

Ce document explique comment la couche blockchain (smart contracts) est integree dans les differentes parties du projet.

---

## Table des Matieres

1. [Architecture Globale](#1-architecture-globale)
2. [Contrats Deployes](#2-contrats-deployes)
3. [Integration Backend](#3-integration-backend)
4. [Integration Frontend Client](#4-integration-frontend-client)
5. [Integration Frontend Restaurant](#5-integration-frontend-restaurant)
6. [Integration Frontend Deliverer](#6-integration-frontend-deliverer)
7. [Flux de Donnees On-chain/Off-chain](#7-flux-de-donnees)
8. [Configuration Requise](#8-configuration-requise)
9. [Exemples d'Utilisation](#9-exemples-dutilisation)

---

## 1. Architecture Globale

```
+------------------+     +------------------+     +------------------+
|   Frontend       |     |   Backend        |     |   Blockchain     |
|   (React)        |<--->|   (Node.js)      |<--->|   (Polygon)      |
+------------------+     +------------------+     +------------------+
        |                        |                        |
        v                        v                        v
+------------------+     +------------------+     +------------------+
| - Client App     |     | - REST API       |     | - DoneOrderManager|
| - Restaurant App |     | - Socket.io      |     | - DoneToken       |
| - Deliverer App  |     | - MongoDB        |     | - DoneStaking     |
+------------------+     | - IPFS (Pinata)  |     | - DoneArbitration |
                         +------------------+     | - Oracles         |
                                                  +------------------+
```

### Principe Hybride

- **On-chain** : Transactions financieres, etats critiques, preuves immuables
- **Off-chain** : Donnees volumineuses (menus, GPS tracking, images), cache, analytics

---

## 2. Contrats Deployes (Polygon Amoy)

| Contrat | Adresse | Role |
|---------|---------|------|
| DoneToken | `0x24D89CC7f6F76980F2c088DB203DEa6223B1DEd9` | Token ERC20 fidelite |
| DonePaymentSplitter | `0xE99F26DA1B38a79d08ed8d853E45397C99818C2f` | Split paiements 70/20/10 |
| DoneStaking | `0xFf9CD2596e73BB0bCB28d9E24d945B0ed34f874b` | Staking livreurs |
| DoneOrderManager | `0x257D63E05bcf8840896b1ECb5c6d98eb5Ba06182` | Gestion commandes |
| DoneArbitration | `0xf339Af8A5e429E015Ee038198665026844a87EF6` | Litiges decentralises |
| DonePriceOracle | `0x1D4fF5879B7b2653b6aB8d23423A9799FdABc582` | Prix MATIC/USD |
| DoneGPSOracle | `0x1a52184023BF93eb0cD150C4595FbCeD3dE88d97` | Verification GPS |
| DoneWeatherOracle | `0xa8E5C18c397120699969D22f703e273044c5a125` | Conditions meteo |

---

## 3. Integration Backend

### 3.1 Fichiers Concernes

```
backend/
├── src/
│   ├── config/
│   │   └── blockchain.js          # Configuration provider + contrats
│   ├── services/
│   │   ├── blockchainService.js   # Interactions smart contracts
│   │   ├── chainlinkService.js    # Oracle prix
│   │   ├── gpsOracleService.js    # Oracle GPS
│   │   └── arbitrationService.js  # Gestion litiges
│   └── controllers/
│       ├── orderController.js     # Appelle blockchainService
│       ├── delivererController.js # Staking, acceptation
│       └── restaurantController.js# Confirmation preparation
```

### 3.2 Configuration Blockchain (config/blockchain.js)

```javascript
const { ethers } = require('ethers');

// Provider Polygon Amoy
const provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC_URL);

// Wallet backend (pour transactions automatiques)
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Instances des contrats
const orderManager = new ethers.Contract(
  process.env.ORDER_MANAGER_ADDRESS,
  ORDER_MANAGER_ABI,
  wallet
);

const doneToken = new ethers.Contract(
  process.env.TOKEN_ADDRESS,
  TOKEN_ABI,
  wallet
);

// ... autres contrats
```

### 3.3 Service Blockchain (services/blockchainService.js)

Ce service abstrait toutes les interactions blockchain :

```javascript
// CREATION COMMANDE
async function createOrderOnChain(restaurantAddress, foodPrice, deliveryFee, ipfsHash, clientPrivateKey) {
  const clientWallet = new ethers.Wallet(clientPrivateKey, provider);
  const orderManagerWithSigner = orderManager.connect(clientWallet);

  const platformFee = (foodPrice * 10n) / 100n; // 10%
  const totalAmount = foodPrice + deliveryFee + platformFee;

  const tx = await orderManagerWithSigner.createOrder(
    restaurantAddress,
    foodPrice,
    deliveryFee,
    ipfsHash,
    { value: totalAmount }
  );

  const receipt = await tx.wait();
  return { txHash: tx.hash, blockNumber: receipt.blockNumber };
}

// CONFIRMATION LIVRAISON (declenche le split automatique)
async function confirmDeliveryOnChain(orderId, clientPrivateKey) {
  const clientWallet = new ethers.Wallet(clientPrivateKey, provider);
  const orderManagerWithSigner = orderManager.connect(clientWallet);

  const tx = await orderManagerWithSigner.confirmDelivery(orderId);
  await tx.wait();

  // Le split 70/20/10 est fait automatiquement dans le contrat
  // Le client recoit aussi des tokens DONE (10% du foodPrice)
  return { txHash: tx.hash };
}

// STAKING LIVREUR
async function stakeAsDeliverer(amount, delivererPrivateKey) {
  const delivererWallet = new ethers.Wallet(delivererPrivateKey, provider);
  const stakingWithSigner = staking.connect(delivererWallet);

  const tx = await stakingWithSigner.stakeAsDeliverer({ value: amount });
  await tx.wait();
  return { txHash: tx.hash };
}
```

### 3.4 Utilisation dans les Controllers

#### orderController.js - Creer une commande

```javascript
async function createOrder(req, res) {
  const { restaurantId, items, deliveryAddress } = req.body;
  const clientAddress = req.user.walletAddress;

  // 1. Calculer les prix
  const foodPrice = calculateFoodPrice(items);
  const deliveryFee = calculateDeliveryFee(deliveryAddress);

  // 2. Upload details sur IPFS
  const ipfsHash = await ipfsService.uploadJSON({
    items,
    deliveryAddress,
    timestamp: Date.now()
  });

  // 3. Creer commande ON-CHAIN
  const result = await blockchainService.createOrderOnChain(
    restaurant.walletAddress,
    ethers.parseEther(foodPrice.toString()),
    ethers.parseEther(deliveryFee.toString()),
    ipfsHash,
    req.user.privateKey // ou signature du client
  );

  // 4. Sauvegarder OFF-CHAIN (MongoDB)
  const order = new Order({
    orderId: result.orderId,
    client: clientAddress,
    restaurant: restaurantId,
    items,
    txHash: result.txHash,
    status: 'CREATED'
  });
  await order.save();

  res.json({ success: true, orderId: result.orderId, txHash: result.txHash });
}
```

#### delivererController.js - Staking

```javascript
async function stake(req, res) {
  const { amount } = req.body;
  const delivererAddress = req.user.walletAddress;

  // Minimum 0.1 ETH
  if (parseFloat(amount) < 0.1) {
    return res.status(400).json({ error: 'Minimum stake: 0.1 ETH' });
  }

  // Staker ON-CHAIN
  const result = await blockchainService.stakeAsDeliverer(
    ethers.parseEther(amount),
    req.user.privateKey
  );

  // Mettre a jour OFF-CHAIN
  await Deliverer.findOneAndUpdate(
    { walletAddress: delivererAddress },
    { isStaked: true, stakedAmount: amount }
  );

  res.json({ success: true, txHash: result.txHash });
}
```

---

## 4. Integration Frontend Client

### 4.1 Fichiers Concernes

```
frontend/client/src/
├── services/
│   ├── blockchain.js    # Interactions Web3 directes
│   └── api.js           # Appels API backend
├── components/
│   ├── ConnectWallet.jsx
│   ├── Checkout.jsx     # Paiement crypto
│   └── OrderTracking.jsx
└── contexts/
    └── WalletContext.jsx
```

### 4.2 Service Blockchain (services/blockchain.js)

```javascript
import { ethers } from 'ethers';

// Connexion MetaMask
export async function connectWallet() {
  if (!window.ethereum) throw new Error('MetaMask non installe');

  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts'
  });

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  return { address: accounts[0], signer, provider };
}

// Creer commande (paiement direct)
export async function createOrder(restaurantAddress, foodPrice, deliveryFee, ipfsHash) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const orderManager = new ethers.Contract(
    ORDER_MANAGER_ADDRESS,
    ORDER_MANAGER_ABI,
    signer
  );

  const platformFee = (foodPrice * 10n) / 100n;
  const totalAmount = foodPrice + deliveryFee + platformFee;

  const tx = await orderManager.createOrder(
    restaurantAddress,
    foodPrice,
    deliveryFee,
    ipfsHash,
    { value: totalAmount }
  );

  const receipt = await tx.wait();
  return { txHash: tx.hash, orderId: extractOrderId(receipt) };
}

// Confirmer livraison
export async function confirmDelivery(orderId) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const orderManager = new ethers.Contract(
    ORDER_MANAGER_ADDRESS,
    ORDER_MANAGER_ABI,
    signer
  );

  const tx = await orderManager.confirmDelivery(orderId);
  await tx.wait();

  return { txHash: tx.hash };
}

// Ouvrir litige
export async function openDispute(orderId) {
  // ... similar pattern
}
```

### 4.3 Composant Checkout.jsx

```jsx
import { createOrder } from '../services/blockchain';
import { useWallet } from '../contexts/WalletContext';

function Checkout({ cart, restaurant }) {
  const { address, isConnected } = useWallet();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!isConnected) {
      alert('Connectez votre wallet');
      return;
    }

    setLoading(true);

    try {
      // 1. Upload sur IPFS via API
      const { ipfsHash } = await api.uploadOrderDetails(cart);

      // 2. Paiement ON-CHAIN (MetaMask popup)
      const { txHash, orderId } = await createOrder(
        restaurant.walletAddress,
        ethers.parseEther(cart.foodTotal.toString()),
        ethers.parseEther(cart.deliveryFee.toString()),
        ipfsHash
      );

      // 3. Notifier backend
      await api.confirmOrderCreated(orderId, txHash);

      navigate(`/tracking/${orderId}`);
    } catch (error) {
      console.error('Paiement echoue:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handlePayment} disabled={loading}>
      {loading ? 'Transaction en cours...' : `Payer ${cart.total} MATIC`}
    </button>
  );
}
```

---

## 5. Integration Frontend Restaurant

### 5.1 Fichiers Concernes

```
frontend/restaurant/src/
├── services/
│   ├── blockchain.js    # Confirmation preparation
│   └── api.js
└── components/
    └── OrdersQueue.jsx
```

### 5.2 Confirmation Preparation

```javascript
// services/blockchain.js
export async function confirmPreparation(orderId) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const orderManager = new ethers.Contract(
    ORDER_MANAGER_ADDRESS,
    ORDER_MANAGER_ABI,
    signer
  );

  const tx = await orderManager.confirmPreparation(orderId);
  await tx.wait();

  return { txHash: tx.hash };
}
```

```jsx
// components/OrdersQueue.jsx
function OrderCard({ order }) {
  const handleConfirmPrep = async () => {
    // 1. Confirmer ON-CHAIN
    const { txHash } = await confirmPreparation(order.orderId);

    // 2. Notifier backend
    await api.updateOrderStatus(order.orderId, 'PREPARING', txHash);

    toast.success('Preparation confirmee!');
  };

  return (
    <div>
      <p>Commande #{order.orderId}</p>
      <button onClick={handleConfirmPrep}>
        Confirmer preparation
      </button>
    </div>
  );
}
```

---

## 6. Integration Frontend Deliverer

### 6.1 Fichiers Concernes

```
frontend/deliverer/src/
├── services/
│   ├── blockchain.js    # Staking, pickup, delivery
│   └── geolocation.js   # GPS tracking
└── components/
    ├── StakingPanel.jsx
    ├── AvailableOrders.jsx
    └── ActiveDelivery.jsx
```

### 6.2 Staking Panel

```jsx
// components/StakingPanel.jsx
function StakingPanel() {
  const [stakeAmount, setStakeAmount] = useState('0.1');

  const handleStake = async () => {
    // Staker ON-CHAIN
    const { txHash } = await blockchain.stake(
      ethers.parseEther(stakeAmount)
    );

    // Notifier backend
    await api.confirmStake(txHash, stakeAmount);

    toast.success('Stake effectue!');
  };

  const handleUnstake = async () => {
    const { txHash } = await blockchain.unstake();
    await api.confirmUnstake(txHash);
  };

  return (
    <div>
      <input
        value={stakeAmount}
        onChange={e => setStakeAmount(e.target.value)}
        min="0.1"
      />
      <button onClick={handleStake}>Staker {stakeAmount} MATIC</button>
      <button onClick={handleUnstake}>Retirer stake</button>
    </div>
  );
}
```

### 6.3 Confirmation Pickup/Delivery

```jsx
// components/ActiveDelivery.jsx
function ActiveDelivery({ order }) {
  const handlePickup = async () => {
    // 1. Confirmer ON-CHAIN
    const { txHash } = await blockchain.confirmPickup(order.orderId);

    // 2. Notifier backend + Socket.io
    await api.confirmPickup(order.orderId, txHash);
  };

  const handleDelivery = async () => {
    // Le client doit confirmer, pas le livreur
    // Mais on peut envoyer une notification
    await api.notifyArrival(order.orderId);
  };

  return (
    <div>
      {order.status === 'ASSIGNED' && (
        <button onClick={handlePickup}>Confirmer recuperation</button>
      )}
      {order.status === 'IN_DELIVERY' && (
        <button onClick={handleDelivery}>Signaler arrivee</button>
      )}
    </div>
  );
}
```

---

## 7. Flux de Donnees On-chain/Off-chain

### 7.1 Workflow Complet d'une Commande

```
CLIENT                    BACKEND                 BLOCKCHAIN
   |                         |                         |
   |-- 1. Creer commande --->|                         |
   |                         |-- 2. Upload IPFS ------>|
   |<-- 3. ipfsHash ---------|                         |
   |                         |                         |
   |-- 4. createOrder() + paiement ------------------>|
   |<-- 5. txHash + orderId --------------------------|
   |                         |                         |
   |-- 6. Notifier creation->|                         |
   |                         |-- 7. Save MongoDB ----->|
   |                         |                         |

RESTAURANT                BACKEND                 BLOCKCHAIN
   |                         |                         |
   |<-- 8. Notification -----|                         |
   |-- 9. confirmPreparation() ---------------------->|
   |                         |<-- 10. Event -----------|
   |                         |-- 11. Update MongoDB -->|

DELIVERER                 BACKEND                 BLOCKCHAIN
   |                         |                         |
   |<-- 12. Notification ----|                         |
   |-- 13. acceptOrder() + assignDeliverer() -------->|
   |-- 14. confirmPickup() -------------------------->|
   |                         |                         |

CLIENT                    BACKEND                 BLOCKCHAIN
   |                         |                         |
   |-- 15. confirmDelivery() ----------------------->|
   |                         |                         |
   |                    AUTOMATIQUE:                   |
   |                    - Split 70/20/10              |
   |                    - Mint tokens DONE            |
   |                         |<-- 16. Events ---------|
   |                         |-- 17. Update MongoDB -->|
```

### 7.2 Donnees Stockees

| Donnee | On-chain | Off-chain (MongoDB) |
|--------|----------|---------------------|
| ID Commande |  |  |
| Montants (foodPrice, fees) |  |  |
| Status commande |  |  (cache) |
| Adresses wallet |  |  |
| Details items |  (IPFS hash) |  |
| Tracking GPS |  (every 5th) |  (all) |
| Images |  (IPFS hash) |  |
| Notes/Reviews |  |  |
| Analytics |  |  |

---

## 8. Configuration Requise

### 8.1 Variables d'Environnement Backend

```env
# backend/.env
AMOY_RPC_URL=https://rpc-amoy.polygon.technology
PRIVATE_KEY=your_backend_private_key

# Contrats
ORDER_MANAGER_ADDRESS=0x257D63E05bcf8840896b1ECb5c6d98eb5Ba06182
PAYMENT_SPLITTER_ADDRESS=0xE99F26DA1B38a79d08ed8d853E45397C99818C2f
TOKEN_ADDRESS=0x24D89CC7f6F76980F2c088DB203DEa6223B1DEd9
STAKING_ADDRESS=0xFf9CD2596e73BB0bCB28d9E24d945B0ed34f874b
ARBITRATION_ADDRESS=0xf339Af8A5e429E015Ee038198665026844a87EF6

# Oracles
PRICE_ORACLE_ADDRESS=0x1D4fF5879B7b2653b6aB8d23423A9799FdABc582
GPS_ORACLE_ADDRESS=0x1a52184023BF93eb0cD150C4595FbCeD3dE88d97
WEATHER_ORACLE_ADDRESS=0xa8E5C18c397120699969D22f703e273044c5a125
```

### 8.2 Variables d'Environnement Frontend

```env
# frontend/client/.env
VITE_API_URL=http://localhost:3000
VITE_ORDER_MANAGER_ADDRESS=0x257D63E05bcf8840896b1ECb5c6d98eb5Ba06182
VITE_TOKEN_ADDRESS=0x24D89CC7f6F76980F2c088DB203DEa6223B1DEd9
VITE_STAKING_ADDRESS=0xFf9CD2596e73BB0bCB28d9E24d945B0ed34f874b
VITE_CHAIN_ID=80002
VITE_RPC_URL=https://rpc-amoy.polygon.technology
```

---

## 9. Exemples d'Utilisation

### 9.1 Workflow Client - Commander

```javascript
// 1. Connecter wallet
const { address } = await connectWallet();

// 2. Verifier reseau Polygon Amoy
await switchToPolygonAmoy();

// 3. Creer commande
const tx = await orderManager.createOrder(
  restaurantAddress,
  ethers.parseEther("15"), // 15 MATIC food
  ethers.parseEther("3"),  // 3 MATIC delivery
  "QmXyz...",              // IPFS hash
  { value: ethers.parseEther("19.8") } // total + 10% platform
);

// 4. Attendre confirmation
const receipt = await tx.wait();
console.log("Commande creee, txHash:", tx.hash);
```

### 9.2 Workflow Livreur - Staker et Livrer

```javascript
// 1. Staker 0.1 ETH
await staking.stakeAsDeliverer({ value: ethers.parseEther("0.1") });

// 2. Accepter commande (assigne par backend)
// Le backend appelle assignDeliverer(orderId, delivererAddress)

// 3. Confirmer pickup
await orderManager.confirmPickup(orderId);

// 4. Livrer et attendre confirmation client
// Le client appelle confirmDelivery(orderId)

// 5. Recevoir paiement automatique (20% du total)
```

### 9.3 Workflow Litige

```javascript
// Client ouvre un litige
await orderManager.openDispute(orderId);

// Arbitrage decentralise via DoneArbitration
await arbitration.createDispute(
  orderId,
  clientAddress,
  restaurantAddress,
  delivererAddress,
  "Commande non recue",
  "QmEvidenceHash...",
  { value: ethers.parseEther("1") } // escrow
);

// Les detenteurs de DONE tokens votent
await arbitration.voteDispute(disputeId, 1); // 1 = CLIENT gagne

// Apres 48h ou quorum atteint
await arbitration.resolveDispute(disputeId);
// Fonds redistribues selon resultat du vote
```

---

## Resume

| Composant | Fichier Principal | Role Blockchain |
|-----------|-------------------|-----------------|
| Backend | `blockchainService.js` | Orchestration transactions |
| Client | `services/blockchain.js` | Paiement, confirmation livraison |
| Restaurant | `services/blockchain.js` | Confirmation preparation |
| Deliverer | `services/blockchain.js` | Staking, pickup, delivery |

**Tous les contrats sont deployes et integres. Le projet est 100% fonctionnel.**
