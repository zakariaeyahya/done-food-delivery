# Documentation API - DONE Food Delivery on Blockchain

## 📋 Table des Matières

1. [Introduction](#introduction)
2. [Base URL](#base-url)
3. [Authentification](#authentification)
4. [Endpoints Commandes](#endpoints-commandes)
5. [Endpoints Utilisateurs](#endpoints-utilisateurs)
6. [Endpoints Restaurants](#endpoints-restaurants)
7. [Endpoints Livreurs](#endpoints-livreurs)
8. [Endpoints Admin](#endpoints-admin)
9. [Endpoints Analytics](#endpoints-analytics)
10. [Endpoints Oracles](#endpoints-oracles-sprint-6---chainlink)
11. [Endpoints Arbitrage](#endpoints-arbitrage-sprint-6---donearbitration)
12. [Endpoints Tokens DONE](#endpoints-tokens-done)
13. [Endpoints Paiements](#endpoints-paiements-stripe-fallback)
14. [Endpoints Slashing](#endpoints-slashing-admin)
15. [Endpoint Health Check](#endpoint-health-check)
16. [Codes d'Erreur](#codes-derreur)
17. [Interactions Blockchain](#interactions-blockchain)

---

## Introduction

L'API DONE Food Delivery est une API REST qui orchestre les interactions entre les frontends et la blockchain Ethereum (réseau Polygon). Elle gère les données off-chain dans MongoDB et interagit avec les smart contracts pour les transactions on-chain.

**Architecture** :
- **Backend** : Node.js + Express.js
- **Base de données** : MongoDB (données off-chain)
- **Blockchain** : Polygon Mumbai (testnet) / Polygon Mainnet
- **Stockage décentralisé** : IPFS (images, preuves)
- **Notifications** : Socket.io (temps réel)

---

## Base URL

```
Development: http://localhost:3000/api
Production: https://api.donefood.com/api
```

---

## Authentification

L'API utilise l'authentification Web3 basée sur les signatures de wallet Ethereum.

### Format d'Authentification

**Header requis** :
```
Authorization: Bearer <signature>
x-wallet-address: 0x...
x-message: <message_original>
```

**Processus** :
1. Le client signe un message avec son wallet (MetaMask)
2. Le client envoie la signature dans le header `Authorization`
3. Le backend vérifie la signature avec `ethers.verifyMessage()`
4. Le backend récupère l'adresse Ethereum depuis la signature
5. L'adresse est ajoutée à `req.userAddress` pour les controllers

### Rôles Blockchain

Les rôles sont gérés via les smart contracts :
- **CLIENT_ROLE** : Rôle client (par défaut)
- **RESTAURANT_ROLE** : Rôle restaurant (assigné on-chain)
- **DELIVERER_ROLE** : Rôle livreur (après staking)
- **PLATFORM_ROLE** : Rôle administrateur plateforme

---

## Endpoints Commandes

### POST `/api/orders/create`

Créer une nouvelle commande et bloquer les fonds en escrow sur la blockchain.

**Authentification** : ✅ Requise (`verifySignature`)

**Body** :
```json
{
  "restaurantId": "507f1f77bcf86cd799439011",
  "items": [
    {
      "name": "Pizza Margherita",
      "quantity": 2,
      "price": 15.50
    }
  ],
  "deliveryAddress": "123 Rue Example, Paris 75001",
  "clientAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "orderId": 123,
    "txHash": "0xabc123...",
    "ipfsHash": "QmXxx...",
    "totalAmount": "18.50",
    "status": "CREATED"
  }
}
```

**Blockchain** :
- Appelle `DoneOrderManager.createOrder()` avec `msg.value = totalAmount`
- Fonds bloqués en escrow dans le smart contract
- Event `OrderCreated` émis on-chain
- Détails commande uploadés sur IPFS

**Erreurs** :
- `400` : Données invalides
- `401` : Non authentifié
- `404` : Restaurant non trouvé
- `500` : Erreur blockchain/IPFS

---

### GET `/api/orders/:id`

Récupérer les détails complets d'une commande (on-chain + off-chain).

**Authentification** : ❌ Non requise

**Paramètres** :
- `id` (path) : ID de la commande (number)

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "orderId": 123,
    "txHash": "0xabc123...",
    "client": {
      "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "name": "John Doe"
    },
    "restaurant": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Pizza Palace",
      "address": "0x..."
    },
    "deliverer": {
      "address": "0x...",
      "name": "Mike Deliverer"
    },
    "items": [...],
    "status": "IN_DELIVERY",
    "foodPrice": "15.50",
    "deliveryFee": "2.00",
    "platformFee": "1.50",
    "totalAmount": "19.00",
    "gpsTracking": [
      {
        "lat": 48.8566,
        "lng": 2.3522,
        "timestamp": "2025-01-15T10:30:00Z"
      }
    ],
    "ipfsHash": "QmXxx...",
    "createdAt": "2025-01-15T10:00:00Z",
    "completedAt": null
  }
}
```

**Blockchain** :
- Lit `DoneOrderManager.orders(orderId)` pour données on-chain
- Récupère détails depuis IPFS via `ipfsHash`
- Combine avec données MongoDB (GPS tracking, etc.)

---

### GET `/api/orders/client/:address`

Récupérer toutes les commandes d'un client.

**Authentification** : ❌ Non requise

**Paramètres** :
- `address` (path) : Adresse Ethereum du client

**Query Parameters** (optionnels) :
- `status` : Filtrer par statut (`CREATED`, `PREPARING`, `IN_DELIVERY`, `DELIVERED`, `DISPUTED`)

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": [
    {
      "orderId": 123,
      "restaurant": {...},
      "status": "DELIVERED",
      "totalAmount": "19.00",
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

---

### POST `/api/orders/:id/confirm-preparation`

Confirmer la préparation de la commande (restaurant).

**Authentification** : ✅ Requise (`verifySignature` + `RESTAURANT_ROLE`)

**Paramètres** :
- `id` (path) : ID de la commande

**Body** :
```json
{
  "restaurantAddress": "0x..."
}
```

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "txHash": "0xabc123...",
    "status": "PREPARING"
  }
}
```

**Blockchain** :
- Appelle `DoneOrderManager.confirmPreparation(orderId)`
- Change statut on-chain : `CREATED` → `PREPARING`
- Event `PreparationConfirmed` émis
- Notifie livreurs disponibles via Socket.io

---

### POST `/api/orders/:id/assign-deliverer`

Assigner un livreur à la commande.

**Authentification** : ✅ Requise (`verifySignature` + `PLATFORM_ROLE`)

**Paramètres** :
- `id` (path) : ID de la commande

**Body** :
```json
{
  "delivererAddress": "0x..."
}
```

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "txHash": "0xabc123...",
    "deliverer": {
      "address": "0x...",
      "name": "Mike Deliverer"
    },
    "status": "IN_DELIVERY"
  }
}
```

**Blockchain** :
- Vérifie que livreur est staké via `DoneStaking.isStaked(delivererAddress)`
- Appelle `DoneOrderManager.assignDeliverer(orderId)`
- Change statut on-chain : `PREPARING` → `IN_DELIVERY`
- Event `DelivererAssigned` émis

---

### POST `/api/orders/:id/confirm-pickup`

Confirmer la récupération de la commande (livreur).

**Authentification** : ✅ Requise (`verifySignature` + `DELIVERER_ROLE`)

**Paramètres** :
- `id` (path) : ID de la commande

**Body** :
```json
{
  "delivererAddress": "0x..."
}
```

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "txHash": "0xabc123...",
    "gpsTrackingStarted": true
  }
}
```

**Blockchain** :
- Appelle `DoneOrderManager.confirmPickup(orderId)`
- Event `PickupConfirmed` émis
- Démarre tracking GPS dans MongoDB

---

### POST `/api/orders/:id/update-gps`

Mettre à jour la position GPS du livreur.

**Authentification** : ✅ Requise (`verifySignature` + `DELIVERER_ROLE`)

**Paramètres** :
- `id` (path) : ID de la commande

**Body** :
```json
{
  "lat": 48.8566,
  "lng": 2.3522
}
```

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "eta": "15 min",
    "distance": "2.5 km"
  }
}
```

**Blockchain** :
- ⏳ Optionnel : Appelle `DoneGPSOracle.updateLocation()` si oracle GPS déployé
- Stocke coordonnées dans MongoDB
- Notifie client en temps réel via Socket.io

---

### POST `/api/orders/:id/confirm-delivery`

Confirmer la livraison et déclencher le split de paiement (client).

**Authentification** : ✅ Requise (`verifySignature` + `CLIENT_ROLE`)

**Paramètres** :
- `id` (path) : ID de la commande

**Body** :
```json
{
  "clientAddress": "0x..."
}
```

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "txHash": "0xabc123...",
    "status": "DELIVERED",
    "tokensEarned": "1.9",
    "paymentSplit": {
      "restaurant": "13.30",
      "deliverer": "3.80",
      "platform": "1.90"
    }
  }
}
```

**Blockchain** :
- Appelle `DoneOrderManager.confirmDelivery(orderId)`
- Déclenche automatiquement `DonePaymentSplitter.splitPayment()` :
  - 70% → restaurant
  - 20% → livreur
  - 10% → plateforme
- Mint tokens DONE pour client : `DoneToken.mint()` (1 DONE par 10€)
- Events : `DeliveryConfirmed`, `PaymentSplit`, `TokensMinted`

---

### POST `/api/orders/:id/dispute`

Ouvrir un litige sur une commande.

**Authentification** : ✅ Requise (`verifySignature`)

**Paramètres** :
- `id` (path) : ID de la commande

**Body** :
```json
{
  "reason": "Nourriture froide",
  "evidence": "QmXxx..." // IPFS hash de la preuve (photo)
}
```

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "txHash": "0xabc123...",
    "disputeId": 1,
    "status": "DISPUTED"
  }
}
```

**Blockchain** :
- Appelle `DoneOrderManager.openDispute(orderId)`
- Change statut on-chain : `DELIVERED` → `DISPUTED`
- Fonds gelés dans le smart contract (escrow)
- Event `DisputeOpened` émis
- Notifie arbitres via Socket.io

---

### POST `/api/orders/:id/review`

Soumettre un avis sur une commande.

**Authentification** : ✅ Requise (`verifySignature` + `CLIENT_ROLE`)

**Paramètres** :
- `id` (path) : ID de la commande

**Body** :
```json
{
  "rating": 5,
  "comment": "Excellent service !",
  "clientAddress": "0x..."
}
```

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "review": {
      "rating": 5,
      "comment": "Excellent service !",
      "createdAt": "2025-01-15T12:00:00Z"
    }
  }
}
```

**Blockchain** :
- Review stocké dans MongoDB (off-chain)
- ⏳ Optionnel : Hash du review enregistré on-chain pour immutabilité

---

### GET `/api/orders/history/:address`

Récupérer l'historique des commandes par rôle.

**Authentification** : ❌ Non requise

**Paramètres** :
- `address` (path) : Adresse Ethereum

**Query Parameters** :
- `role` : `client`, `restaurant`, ou `deliverer`
- `status` : Filtrer par statut (optionnel)
- `page` : Numéro de page (défaut: 1)
- `limit` : Nombre d'éléments par page (défaut: 20)

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "orders": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "pages": 3
    }
  }
}
```

---

## Endpoints Utilisateurs

### POST `/api/users/register`

Enregistrer un nouvel utilisateur (client).

**Authentification** : ❌ Non requise

**Body** :
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+33123456789"
}
```

**Réponse Succès (201)** :
```json
{
  "success": true,
  "data": {
    "user": {
      "address": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2025-01-15T10:00:00Z"
    }
  }
}
```

**Blockchain** :
- Utilisateur créé dans MongoDB uniquement
- ⏳ Optionnel : Enregistrement on-chain si nécessaire

---

### GET `/api/users/:address`

Récupérer le profil d'un utilisateur.

**Authentification** : ❌ Non requise

**Paramètres** :
- `address` (path) : Adresse Ethereum

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "user": {
      "address": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+33123456789",
      "deliveryAddresses": [...]
    },
    "tokenBalance": "100.5 DONE"
  }
}
```

**Blockchain** :
- Lit `DoneToken.balanceOf(address)` pour balance tokens DONE

---

### PUT `/api/users/:address`

Mettre à jour le profil utilisateur.

**Authentification** : ✅ Requise (`verifySignature` + ownership)

**Paramètres** :
- `address` (path) : Adresse Ethereum

**Body** :
```json
{
  "name": "John Updated",
  "email": "john.updated@example.com",
  "phone": "+33987654321",
  "deliveryAddresses": [
    {
      "label": "Home",
      "address": "123 Rue Example",
      "lat": 48.8566,
      "lng": 2.3522
    }
  ]
}
```

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "user": {...}
  }
}
```

---

### GET `/api/users/:address/orders`

Récupérer les commandes d'un utilisateur.

**Authentification** : ❌ Non requise

**Paramètres** :
- `address` (path) : Adresse Ethereum

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "orders": [...]
  }
}
```

---

### GET `/api/users/:address/tokens`

Récupérer la balance et l'historique des tokens DONE.

**Authentification** : ❌ Non requise

**Paramètres** :
- `address` (path) : Adresse Ethereum

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "balance": "100.5 DONE",
    "transactions": [
      {
        "type": "mint",
        "amount": "1.9",
        "txHash": "0xabc123...",
        "timestamp": "2025-01-15T12:00:00Z"
      }
    ]
  }
}
```

**Blockchain** :
- Lit `DoneToken.balanceOf(address)`
- Parse events `TokensMinted` et `TokensBurned` depuis blockchain

---

## Endpoints Restaurants

### POST `/api/restaurants/register`

Enregistrer un nouveau restaurant.

**Authentification** : ❌ Non requise

**Body** (multipart/form-data) :
```
address: 0x...
name: Pizza Palace
cuisine: Italian
description: Best pizza in town
location: {"address": "...", "lat": 48.8566, "lng": 2.3522}
menu: [{"name": "Pizza", "price": 15.50, ...}]
images: [File, File, ...] // Images du restaurant
menuItem_0: File // Image item menu 0
menuItem_1: File // Image item menu 1
...
```

**Réponse Succès (201)** :
```json
{
  "success": true,
  "data": {
    "restaurant": {
      "id": "507f1f77bcf86cd799439011",
      "address": "0x...",
      "name": "Pizza Palace",
      "images": ["QmXxx...", "QmYyy..."],
      "menu": [...]
    }
  }
}
```

**Blockchain** :
- Images uploadées sur IPFS
- Menu stocké dans MongoDB avec hash IPFS
- ⏳ Optionnel : Assignation rôle RESTAURANT_ROLE on-chain

---

### GET `/api/restaurants`

Récupérer la liste des restaurants avec filtres.

**Authentification** : ❌ Non requise

**Query Parameters** :
- `cuisine` : Type de cuisine (optionnel)
- `location` : Coordonnées GPS pour filtrage par distance (optionnel)
- `priceRange` : Plage de prix (optionnel)
- `rating` : Note minimum (optionnel)

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "restaurants": [
      {
        "id": "507f1f77bcf86cd799439011",
        "name": "Pizza Palace",
        "cuisine": "Italian",
        "rating": 4.8,
        "images": ["QmXxx..."]
      }
    ]
  }
}
```

---

### GET `/api/restaurants/:id`

Récupérer les détails d'un restaurant.

**Authentification** : ❌ Non requise

**Paramètres** :
- `id` (path) : ID du restaurant

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "restaurant": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Pizza Palace",
      "menu": [
        {
          "name": "Pizza Margherita",
          "price": 15.50,
          "image": "QmXxx..."
        }
      ],
      "rating": 4.8,
      "totalOrders": 250
    }
  }
}
```

---

### PUT `/api/restaurants/:id`

Mettre à jour les informations d'un restaurant.

**Authentification** : ✅ Requise (`verifySignature` + `RESTAURANT_ROLE`)

**Paramètres** :
- `id` (path) : ID du restaurant

**Body** (multipart/form-data) :
```
name: Pizza Palace Updated
cuisine: Italian
images: [File, ...] // Nouvelles images
```

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "restaurant": {...}
  }
}
```

---

### GET `/api/restaurants/:id/orders`

Récupérer les commandes d'un restaurant.

**Authentification** : ✅ Requise (`verifySignature` + `RESTAURANT_ROLE`)

**Paramètres** :
- `id` (path) : ID du restaurant

**Query Parameters** :
- `status` : Filtrer par statut (optionnel)

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "orders": [...]
  }
}
```

---

### GET `/api/restaurants/:id/analytics`

Récupérer les analytics d'un restaurant.

**Authentification** : ✅ Requise (`verifySignature` + `RESTAURANT_ROLE`)

**Paramètres** :
- `id` (path) : ID du restaurant

**Query Parameters** :
- `startDate` : Date de début (optionnel)
- `endDate` : Date de fin (optionnel)

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "totalOrders": 250,
    "revenue": "3750.00",
    "averageRating": 4.8,
    "popularDishes": [...],
    "averagePreparationTime": "20 min"
  }
}
```

---

### PUT `/api/restaurants/:id/menu`

Mettre à jour le menu d'un restaurant.

**Authentification** : ✅ Requise (`verifySignature` + `RESTAURANT_ROLE`)

**Paramètres** :
- `id` (path) : ID du restaurant

**Body** (multipart/form-data) :
```
menu: [{"name": "Pizza", "price": 15.50, ...}]
menuItem_0: File // Image item 0
```

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "menu": [...]
  }
}
```

**Blockchain** :
- Images uploadées sur IPFS
- Menu stocké dans MongoDB avec hash IPFS

---

### POST `/api/restaurants/:id/menu/item`

Ajouter un nouvel item au menu.

**Authentification** : ✅ Requise (`verifySignature` + `RESTAURANT_ROLE`)

**Body** (multipart/form-data) :
```
name: New Pizza
price: 18.00
description: ...
category: Pizza
image: File
```

**Réponse Succès (201)** :
```json
{
  "success": true,
  "data": {
    "item": {
      "id": "...",
      "name": "New Pizza",
      "image": "QmXxx..."
    }
  }
}
```

---

### PUT `/api/restaurants/:id/menu/item/:itemId`

Modifier un item existant du menu.

**Authentification** : ✅ Requise (`verifySignature` + `RESTAURANT_ROLE`)

**Body** (multipart/form-data) :
```
name: Updated Pizza
price: 19.00
image: File // Optionnel
```

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "item": {...}
  }
}
```

---

### DELETE `/api/restaurants/:id/menu/item/:itemId`

Supprimer un item du menu.

**Authentification** : ✅ Requise (`verifySignature` + `RESTAURANT_ROLE`)

**Réponse Succès (200)** :
```json
{
  "success": true,
  "message": "Item deleted successfully"
}
```

---

### GET `/api/restaurants/:id/earnings`

Récupérer les revenus on-chain du restaurant.

**Authentification** : ✅ Requise (`verifySignature` + `RESTAURANT_ROLE`)

**Query Parameters** :
- `startDate` : Date de début (optionnel)
- `endDate` : Date de fin (optionnel)

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "totalEarnings": "3750.00",
    "breakdown": {
      "onChain": "3000.00",
      "pending": "750.00"
    },
    "transactions": [
      {
        "txHash": "0xabc123...",
        "amount": "13.30",
        "timestamp": "2025-01-15T12:00:00Z"
      }
    ]
  }
}
```

**Blockchain** :
- Parse events `PaymentSplit` depuis blockchain
- Filtre par `restaurantAddress`
- Calcule total earnings (70% de chaque commande)

---

### POST `/api/restaurants/:id/withdraw`

Retirer les fonds du PaymentSplitter (si pattern "pull" implémenté).

**Authentification** : ✅ Requise (`verifySignature` + `RESTAURANT_ROLE`)

**Body** :
```json
{
  "amount": "100.00"
}
```

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "txHash": "0xabc123...",
    "amount": "100.00"
  }
}
```

**Blockchain** :
- ⏳ Optionnel : Si PaymentSplitter utilise pattern "pull"
- Appelle `DonePaymentSplitter.withdraw(amount)`

---

## Endpoints Livreurs

### POST `/api/deliverers/register`

Enregistrer un nouveau livreur.

**Authentification** : ❌ Non requise

**Body** :
```json
{
  "address": "0x...",
  "name": "Mike Deliverer",
  "phone": "+33987654321",
  "vehicleType": "bike"
}
```

**Réponse Succès (201)** :
```json
{
  "success": true,
  "data": {
    "deliverer": {
      "address": "0x...",
      "name": "Mike Deliverer",
      "isStaked": false
    }
  }
}
```

---

### GET `/api/deliverers/:address`

Récupérer le profil d'un livreur.

**Authentification** : ❌ Non requise

**Paramètres** :
- `address` (path) : Adresse Ethereum

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "deliverer": {
      "address": "0x...",
      "name": "Mike Deliverer",
      "vehicleType": "bike",
      "isStaked": true,
      "stakedAmount": "0.1",
      "rating": 4.6,
      "totalDeliveries": 180
    }
  }
}
```

**Blockchain** :
- Lit `DoneStaking.isStaked(address)` et `DoneStaking.stakedAmount(address)`

---

### GET `/api/deliverers/available`

Récupérer les livreurs disponibles.

**Authentification** : ❌ Non requise

**Query Parameters** :
- `location` : Coordonnées GPS pour filtrage par distance (optionnel)

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "deliverers": [
      {
        "address": "0x...",
        "name": "Mike Deliverer",
        "distance": "2.5 km",
        "isStaked": true
      }
    ]
  }
}
```

**Blockchain** :
- Vérifie `DoneStaking.isStaked(address)` pour chaque livreur

---

### PUT `/api/deliverers/:address/status`

Mettre à jour le statut de disponibilité.

**Authentification** : ✅ Requise (`verifySignature` + `DELIVERER_ROLE`)

**Paramètres** :
- `address` (path) : Adresse Ethereum

**Body** :
```json
{
  "isAvailable": true
}
```

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "isAvailable": true
  }
}
```

---

### POST `/api/deliverers/stake`

Staker un livreur (dépôt de garantie 0.1 ETH minimum).

**Authentification** : ✅ Requise (`verifySignature` + `DELIVERER_ROLE`)

**Body** :
```json
{
  "address": "0x...",
  "amount": "0.1"
}
```

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "txHash": "0xabc123...",
    "stakedAmount": "0.1"
  }
}
```

**Blockchain** :
- Appelle `DoneStaking.stakeAsDeliverer({ value: amount })`
- Vérifie que `amount >= 0.1 ETH`
- Event `Staked` émis on-chain

---

### POST `/api/deliverers/unstake`

Retirer le stake d'un livreur.

**Authentification** : ✅ Requise (`verifySignature` + `DELIVERER_ROLE`)

**Body** :
```json
{
  "address": "0x..."
}
```

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "txHash": "0xabc123...",
    "amount": "0.1"
  }
}
```

**Blockchain** :
- Vérifie qu'aucune livraison active
- Appelle `DoneStaking.unstake()`
- Event `Unstaked` émis on-chain

---

### GET `/api/deliverers/:address/orders`

Récupérer les commandes d'un livreur.

**Authentification** : ❌ Non requise

**Paramètres** :
- `address` (path) : Adresse Ethereum

**Query Parameters** :
- `status` : Filtrer par statut (optionnel)

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "orders": [...]
  }
}
```

---

### GET `/api/deliverers/:address/earnings`

Récupérer les gains d'un livreur.

**Authentification** : ✅ Requise (`verifySignature` + `DELIVERER_ROLE`)

**Paramètres** :
- `address` (path) : Adresse Ethereum

**Query Parameters** :
- `startDate` : Date de début (optionnel)
- `endDate` : Date de fin (optionnel)

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "totalEarnings": "380.00",
    "completedDeliveries": 190,
    "averageEarning": "2.00"
  }
}
```

**Blockchain** :
- Parse events `PaymentSplit` depuis blockchain
- Filtre par `delivererAddress`
- Calcule total earnings (20% de chaque commande)

---

## Endpoints Admin

### GET `/api/admin/stats`

Récupérer les statistiques globales de la plateforme.

**Authentification** : ✅ Requise (`verifyAdminRole` - PLATFORM_ROLE)

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "totalOrders": 1234,
    "gmv": "150.00",
    "activeUsers": {
      "clients": 500,
      "restaurants": 50,
      "deliverers": 80
    },
    "platformRevenue": "15.00",
    "avgDeliveryTime": "25 min",
    "satisfaction": "4.5"
  }
}
```

**Blockchain** :
- Calcule GMV depuis events `PaymentSplit`
- Calcule revenus plateforme (10% de toutes les commandes)

---

### GET `/api/admin/disputes`

Récupérer la liste de tous les litiges.

**Authentification** : ✅ Requise (`verifyAdminRole`)

**Query Parameters** :
- `status` : Filtrer par statut (`VOTING`, `RESOLVED`) (optionnel)

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": [
    {
      "disputeId": 1,
      "orderId": 123,
      "client": "0x...",
      "restaurant": "0x...",
      "deliverer": "0x...",
      "reason": "Nourriture froide",
      "evidenceIPFS": "QmXxx...",
      "status": "VOTING",
      "votes": {
        "client": 60,
        "restaurant": 40
      }
    }
  ]
}
```

**Blockchain** :
- ⏳ Si DoneArbitration déployé : Lit votes depuis `DoneArbitration.getDisputeVotes()`

---

### POST `/api/admin/resolve-dispute/:id`

Résoudre manuellement un litige.

**Authentification** : ✅ Requise (`verifyAdminRole`)

**Paramètres** :
- `id` (path) : ID du litige

**Body** :
```json
{
  "winner": "CLIENT"
}
```

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "txHash": "0xabc123...",
    "disputeId": 1,
    "winner": "CLIENT"
  }
}
```

**Blockchain** :
- Appelle `DoneOrderManager.resolveDispute(disputeId, winner)`
- Libère fonds escrow au gagnant
- Event `DisputeResolved` émis

---

### GET `/api/admin/users`

Récupérer la liste de tous les utilisateurs.

**Authentification** : ✅ Requise (`verifyAdminRole`)

**Query Parameters** :
- `status` : Filtrer par statut (`active`) (optionnel)

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": [
    {
      "address": "0x...",
      "name": "John Doe",
      "totalOrders": 15,
      "totalSpent": "5.00",
      "doneBalance": "1000 DONE",
      "status": "active"
    }
  ]
}
```

**Blockchain** :
- Lit `DoneToken.balanceOf(address)` pour chaque utilisateur

---

### GET `/api/admin/restaurants`

Récupérer la liste de tous les restaurants.

**Authentification** : ✅ Requise (`verifyAdminRole`)

**Query Parameters** :
- `cuisine` : Filtrer par type de cuisine (optionnel)

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": [
    {
      "address": "0x...",
      "name": "Pizza Palace",
      "cuisine": "Italian",
      "totalOrders": 250,
      "revenue": "50.00",
      "rating": 4.8
    }
  ]
}
```

**Blockchain** :
- Calcule revenus depuis events `PaymentSplit`

---

### GET `/api/admin/deliverers`

Récupérer la liste de tous les livreurs.

**Authentification** : ✅ Requise (`verifyAdminRole`)

**Query Parameters** :
- `staked` : Filtrer par statut staking (`true`/`false`) (optionnel)

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": [
    {
      "address": "0x...",
      "name": "Mike Deliverer",
      "vehicle": "BIKE",
      "stakedAmount": "0.1",
      "totalDeliveries": 180,
      "rating": 4.6,
      "earnings": "10.00"
    }
  ]
}
```

**Blockchain** :
- Lit `DoneStaking.stakedAmount(address)` et `DoneStaking.isStaked(address)`
- Calcule earnings depuis events `PaymentSplit`

---

## Endpoints Analytics

### GET `/api/analytics/dashboard`

Récupérer le dashboard analytics complet.

**Authentification** : ✅ Requise (`verifyAdminRole`)

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalOrders": 1234,
      "gmv": "150.00",
      "platformRevenue": "15.00"
    },
    "charts": {
      "ordersOverTime": [
        {
          "date": "2025-01-15",
          "orders": 45
        }
      ],
      "revenueOverTime": [
        {
          "date": "2025-01-15",
          "revenue": "4.50"
        }
      ]
    }
  }
}
```

**Blockchain** :
- Calcule GMV et revenus depuis events `PaymentSplit`

---

### GET `/api/analytics/orders`

Récupérer les analytics des commandes.

**Authentification** : ✅ Requise (`verifyAdminRole`)

**Query Parameters** :
- `period` : Période (`day`, `week`, `month`, `year`) (défaut: `week`)

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "period": "week",
    "data": [
      {
        "date": "2025-01-15",
        "orders": 45,
        "avgValue": "0.50"
      }
    ],
    "total": 297,
    "growth": "+15.0%"
  }
}
```

---

### GET `/api/analytics/revenue`

Récupérer les analytics des revenus.

**Authentification** : ✅ Requise (`verifyAdminRole`)

**Query Parameters** :
- `startDate` : Date de début (optionnel)
- `endDate` : Date de fin (optionnel)

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "totalRevenue": "15.00",
    "breakdown": {
      "platformFee": "15.00",
      "restaurants": "105.00",
      "deliverers": "30.00"
    },
    "timeline": [
      {
        "date": "2025-01-15",
        "revenue": "1.50"
      }
    ]
  }
}
```

**Blockchain** :
- Parse events `PaymentSplit` depuis blockchain
- Calcule breakdown (70/20/10)

---

### GET `/api/analytics/users`

Récupérer les analytics des utilisateurs.

**Authentification** : ✅ Requise (`verifyAdminRole`)

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "growth": {
      "clients": [100, 150, 200, 250],
      "restaurants": [10, 15, 18, 20],
      "deliverers": [20, 25, 30, 35]
    },
    "activeToday": {
      "clients": 50,
      "restaurants": 8,
      "deliverers": 12
    },
    "topSpenders": [
      {
        "address": "0x...",
        "spent": "10.00"
      }
    ]
  }
}
```

---

## Endpoints Oracles (Sprint 6 - Chainlink)

### GET `/api/oracles/price`

Récupérer le prix MATIC/USD depuis Chainlink Oracle.

**Authentification** : ❌ Non requise

**Query Parameters** :
- `pair` : Paire de devises (`MATIC/USD`, `ETH/USD`) (défaut: `MATIC/USD`)

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "pair": "MATIC/USD",
    "price": "0.85",
    "timestamp": "2025-01-15T10:00:00Z",
    "source": "Chainlink"
  }
}
```

**Blockchain** :
- Appelle `DonePriceOracle.getLatestPrice()` on-chain
- Prix récupéré depuis Chainlink Price Feed

---

### POST `/api/oracles/convert`

Convertir un montant fiat (EUR/USD) en crypto (MATIC).

**Authentification** : ❌ Non requise

**Body** :
```json
{
  "amount": 15.50,
  "from": "USD",
  "to": "MATIC"
}
```

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "originalAmount": "15.50",
    "convertedAmount": "18.24",
    "from": "USD",
    "to": "MATIC",
    "exchangeRate": "0.85",
    "timestamp": "2025-01-15T10:00:00Z"
  }
}
```

**Blockchain** :
- Appelle `DonePriceOracle.convertUSDtoMATIC(usdAmount)` on-chain
- Utilise prix Chainlink en temps réel

---

### POST `/api/oracles/gps/verify`

Vérifier que la livraison a été effectuée dans une zone acceptable (GPS Oracle).

**Authentification** : ✅ Requise (`verifySignature` + `DELIVERER_ROLE` ou `CLIENT_ROLE`)

**Body** :
```json
{
  "orderId": 123,
  "delivererLat": 48.8566,
  "delivererLng": 2.3522,
  "clientLat": 48.8606,
  "clientLng": 2.3372
}
```

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "verified": true,
    "distance": "1.2 km",
    "withinRange": true,
    "maxRange": "2.0 km"
  }
}
```

**Blockchain** :
- Appelle `DoneGPSOracle.verifyDelivery(orderId, clientLat, clientLng)` on-chain
- Vérifie distance entre livreur et client
- Preuve cryptographique de livraison

---

### GET `/api/oracles/weather`

Récupérer les données météo pour ajuster frais de livraison (optionnel).

**Authentification** : ❌ Non requise

**Query Parameters** :
- `lat` : Latitude (requis)
- `lng` : Longitude (requis)

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "location": {
      "lat": 48.8566,
      "lng": 2.3522
    },
    "weather": {
      "condition": "rain",
      "temperature": 12,
      "windSpeed": 25
    },
    "deliveryFeeMultiplier": 1.2,
    "timestamp": "2025-01-15T10:00:00Z"
  }
}
```

**Blockchain** :
- ⏳ Optionnel : Si `DoneWeatherOracle` déployé, lit données on-chain
- Sinon, utilise API météo externe

---

## Endpoints Arbitrage (Sprint 6 - DoneArbitration)

### POST `/api/disputes/:id/vote`

Voter sur un litige (arbitrage décentralisé).

**Authentification** : ✅ Requise (`verifySignature`)

**Paramètres** :
- `id` (path) : ID du litige

**Body** :
```json
{
  "voterAddress": "0x...",
  "winner": "CLIENT",
  "reason": "Nourriture effectivement froide"
}
```

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "txHash": "0xabc123...",
    "disputeId": 1,
    "vote": {
      "voter": "0x...",
      "winner": "CLIENT",
      "votingPower": "100 DONE",
      "timestamp": "2025-01-15T10:00:00Z"
    }
  }
}
```

**Blockchain** :
- Appelle `DoneArbitration.voteDispute(disputeId, winner)`
- Voting power = balance tokens DONE du votant
- Event `DisputeVoted` émis on-chain

---

### GET `/api/disputes/:id/votes`

Récupérer tous les votes d'un litige.

**Authentification** : ❌ Non requise

**Paramètres** :
- `id` (path) : ID du litige

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "disputeId": 1,
    "votes": {
      "CLIENT": {
        "count": 15,
        "totalPower": "1500 DONE"
      },
      "RESTAURANT": {
        "count": 8,
        "totalPower": "800 DONE"
      },
      "DELIVERER": {
        "count": 2,
        "totalPower": "200 DONE"
      }
    },
    "totalVotes": 25,
    "leading": "CLIENT"
  }
}
```

**Blockchain** :
- Lit votes depuis `DoneArbitration.getDisputeVotes(disputeId)` on-chain
- Calcule total voting power par partie

---

### POST `/api/disputes/:id/resolve`

Résoudre automatiquement un litige après vote (si conditions remplies).

**Authentification** : ✅ Requise (`verifyAdminRole` ou automatique si quorum atteint)

**Paramètres** :
- `id` (path) : ID du litige

**Body** (optionnel si automatique) :
```json
{
  "force": false
}
```

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "txHash": "0xabc123...",
    "disputeId": 1,
    "winner": "CLIENT",
    "resolution": "automatic",
    "fundsReleased": "19.00"
  }
}
```

**Blockchain** :
- Vérifie quorum de votes atteint
- Appelle `DoneArbitration.resolveDispute(disputeId)`
- Libère fonds escrow au gagnant
- Event `DisputeResolved` émis

---

## Endpoints Tokens DONE

### POST `/api/tokens/burn`

Consommer des tokens DONE pour une promotion/réduction.

**Authentification** : ✅ Requise (`verifySignature`)

**Body** :
```json
{
  "userAddress": "0x...",
  "amount": "10",
  "orderId": 123,
  "discountAmount": "2.00"
}
```

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "txHash": "0xabc123...",
    "burned": "10 DONE",
    "discountApplied": "2.00",
    "newBalance": "90.5 DONE"
  }
}
```

**Blockchain** :
- Appelle `DoneToken.burn(userAddress, amount)`
- Event `TokensBurned` émis on-chain
- Réduction appliquée sur la commande

---

### POST `/api/tokens/use-discount`

Utiliser des tokens DONE pour obtenir une réduction sur une commande.

**Authentification** : ✅ Requise (`verifySignature`)

**Body** :
```json
{
  "userAddress": "0x...",
  "tokensToUse": "50",
  "orderId": 123
}
```

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "tokensUsed": "50 DONE",
    "discountAmount": "5.00",
    "originalTotal": "19.00",
    "finalTotal": "14.00",
    "txHash": "0xabc123..."
  }
}
```

**Blockchain** :
- Vérifie balance tokens via `DoneToken.balanceOf(userAddress)`
- Appelle `DoneToken.burn()` pour consommer tokens
- Réduction calculée (ex: 1 DONE = 0.10€ de réduction)

---

### GET `/api/tokens/rate`

Récupérer le taux de conversion tokens DONE (pour promotions).

**Authentification** : ❌ Non requise

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "rate": {
      "1 DONE": "0.10 EUR",
      "10 DONE": "1.00 EUR",
      "100 DONE": "10.00 EUR"
    },
    "mintingRate": "1 DONE per 10 EUR spent"
  }
}
```

---

## Endpoints Paiements (Stripe Fallback)

### POST `/api/payments/stripe/create-intent`

Créer un PaymentIntent Stripe pour paiement par carte bancaire (fallback).

**Authentification** : ✅ Requise (`verifySignature`)

**Body** :
```json
{
  "orderId": 123,
  "amount": 19.00,
  "currency": "eur",
  "clientAddress": "0x..."
}
```

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_xxx_secret_xxx",
    "paymentIntentId": "pi_xxx",
    "amount": 19.00,
    "currency": "eur"
  }
}
```

**Blockchain** :
- Après confirmation Stripe, hash transaction enregistré on-chain
- Event `StripePaymentRecorded` émis pour audit trail

---

### POST `/api/payments/stripe/confirm`

Confirmer un paiement Stripe et enregistrer sur blockchain.

**Authentification** : ✅ Requise (`verifySignature`)

**Body** :
```json
{
  "paymentIntentId": "pi_xxx",
  "orderId": 123,
  "clientAddress": "0x..."
}
```

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "txHash": "0xabc123...",
    "paymentHash": "0xdef456...",
    "status": "confirmed",
    "blockchainRecorded": true
  }
}
```

**Blockchain** :
- Hash transaction Stripe enregistré on-chain via smart contract
- Permet audit trail complet même pour paiements fiat

---

## Endpoints Slashing (Admin)

### POST `/api/admin/deliverers/:address/slash`

Slasher (pénaliser) un livreur pour comportement abusif.

**Authentification** : ✅ Requise (`verifyAdminRole`)

**Paramètres** :
- `address` (path) : Adresse Ethereum du livreur

**Body** :
```json
{
  "amount": "0.05",
  "reason": "Annulation abusive de commande",
  "orderId": 123
}
```

**Réponse Succès (200)** :
```json
{
  "success": true,
  "data": {
    "txHash": "0xabc123...",
    "deliverer": "0x...",
    "slashedAmount": "0.05 ETH",
    "remainingStake": "0.05 ETH",
    "reason": "Annulation abusive de commande"
  }
}
```

**Blockchain** :
- Appelle `DoneStaking.slash(delivererAddress, amount)`
- Réduit le stake du livreur
- Event `Slashed` émis on-chain
- Fonds slashed peuvent être redistribués ou brûlés

---

## Endpoint Health Check

### GET `/health`

Vérifier l'état du backend et des services externes.

**Authentification** : ❌ Non requise

**Réponse Succès (200)** :
```json
{
  "status": "OK",
  "uptime": 12345,
  "timestamp": "2025-01-15T10:00:00Z",
  "checks": {
    "database": "connected (5ms)",
    "blockchain": "connected (120ms)",
    "ipfs": "connected (80ms)"
  },
  "version": "1.0.0"
}
```

**Réponse Erreur (503)** :
```json
{
  "status": "ERROR",
  "uptime": 12345,
  "timestamp": "2025-01-15T10:00:00Z",
  "checks": {
    "database": "disconnected",
    "blockchain": "connected (120ms)",
    "ipfs": "connected (80ms)"
  },
  "message": "Database not connected"
}
```

**Utilisation** :
- Monitoring externe (UptimeRobot, etc.)
- Health check pour load balancer
- Vérification rapide de l'état du système

---

## Codes d'Erreur

### Codes HTTP Standards

| Code | Signification | Description |
|------|---------------|-------------|
| `200` | OK | Requête réussie |
| `201` | Created | Ressource créée avec succès |
| `400` | Bad Request | Données invalides |
| `401` | Unauthorized | Authentification requise |
| `403` | Forbidden | Accès refusé (rôle insuffisant) |
| `404` | Not Found | Ressource non trouvée |
| `409` | Conflict | Conflit (ex: utilisateur existe déjà) |
| `500` | Internal Server Error | Erreur serveur |
| `503` | Service Unavailable | Service indisponible (blockchain/IPFS) |

### Format d'Erreur

```json
{
  "error": "Error Type",
  "message": "Description détaillée de l'erreur",
  "details": {
    "field": "validation error"
  }
}
```

### Exemples d'Erreurs

**400 - Bad Request** :
```json
{
  "error": "Bad Request",
  "message": "Invalid Ethereum address"
}
```

**401 - Unauthorized** :
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing wallet signature"
}
```

**403 - Forbidden** :
```json
{
  "error": "Forbidden",
  "message": "Access denied: PLATFORM/ADMIN role required"
}
```

**404 - Not Found** :
```json
{
  "error": "Not Found",
  "message": "Order not found"
}
```

**500 - Internal Server Error** :
```json
{
  "error": "Internal Server Error",
  "message": "Failed to create order on blockchain"
}
```

---

## Interactions Blockchain

### Smart Contracts Utilisés

1. **DoneOrderManager** : Gestion des commandes
2. **DonePaymentSplitter** : Split automatique des paiements (70/20/10)
3. **DoneToken** : Token ERC20 de fidélité (DONE)
4. **DoneStaking** : Staking des livreurs + slashing
5. **DoneArbitration** : Résolution décentralisée des litiges (Sprint 6)
6. **DonePriceOracle** : Oracle Chainlink pour prix MATIC/USD (Sprint 6)
7. **DoneGPSOracle** : Oracle GPS pour vérification livraison (Sprint 6)
8. **DoneWeatherOracle** : Oracle météo (optionnel, Sprint 6)

### Events Blockchain Écoutés

| Event | Contrat | Description |
|-------|---------|-------------|
| `OrderCreated` | DoneOrderManager | Nouvelle commande créée |
| `PreparationConfirmed` | DoneOrderManager | Restaurant confirme préparation |
| `DelivererAssigned` | DoneOrderManager | Livreur assigné |
| `PickupConfirmed` | DoneOrderManager | Livreur récupère commande |
| `DeliveryConfirmed` | DoneOrderManager | Client confirme livraison |
| `PaymentSplit` | DonePaymentSplitter | Paiement divisé (70/20/10) |
| `TokensMinted` | DoneToken | Tokens DONE mintés |
| `DisputeOpened` | DoneOrderManager | Litige ouvert |
| `DisputeResolved` | DoneOrderManager | Litige résolu |
| `Staked` | DoneStaking | Livreur staké |
| `Unstaked` | DoneStaking | Stake retiré |
| `Slashed` | DoneStaking | Livreur slasher (pénalité) |
| `PriceUpdated` | DonePriceOracle | Prix MATIC/USD mis à jour |
| `LocationUpdated` | DoneGPSOracle | Position GPS mise à jour |
| `DeliveryVerified` | DoneGPSOracle | Livraison vérifiée GPS |
| `DisputeVoted` | DoneArbitration | Vote émis sur litige |
| `TokensBurned` | DoneToken | Tokens DONE brûlés |
| `StripePaymentRecorded` | DoneOrderManager | Paiement Stripe enregistré on-chain |

### Flux Blockchain Typique

**Création Commande** :
1. Client signe transaction avec MetaMask
2. Backend appelle `DoneOrderManager.createOrder()` avec `msg.value`
3. Fonds bloqués en escrow
4. Event `OrderCreated` émis
5. Backend écoute event et update MongoDB

**Livraison Complète** :
1. Client confirme livraison
2. Backend appelle `DoneOrderManager.confirmDelivery()`
3. Smart contract appelle automatiquement `DonePaymentSplitter.splitPayment()`
4. Split 70/20/10 exécuté
5. Smart contract appelle `DoneToken.mint()` pour récompenses
6. Events `DeliveryConfirmed`, `PaymentSplit`, `TokensMinted` émis
7. Backend écoute events et update MongoDB

### Adresses Smart Contracts

Les adresses des contrats sont configurées dans `.env` :
```
ORDER_MANAGER_ADDRESS=0x...
PAYMENT_SPLITTER_ADDRESS=0x...
TOKEN_ADDRESS=0x...
STAKING_ADDRESS=0x...
ARBITRATION_ADDRESS=0x...        # Sprint 6 (optionnel)
PRICE_ORACLE_ADDRESS=0x...       # Sprint 6 (optionnel)
GPS_ORACLE_ADDRESS=0x...         # Sprint 6 (optionnel)
WEATHER_ORACLE_ADDRESS=0x...     # Sprint 6 (optionnel)
```

### Flux Blockchain Avancés

**Arbitrage Décentralisé** :
1. Client ouvre litige via `DoneOrderManager.openDispute()`
2. Fonds gelés en escrow
3. Communauté vote via `DoneArbitration.voteDispute()`
4. Voting power = balance tokens DONE
5. Si quorum atteint, `DoneArbitration.resolveDispute()` appelé automatiquement
6. Fonds libérés au gagnant selon votes

**Conversion Prix Fiat/Crypto** :
1. Restaurant définit prix en EUR
2. Backend appelle `DonePriceOracle.getLatestPrice()` pour prix MATIC/USD
3. Backend appelle `DonePriceOracle.convertUSDtoMATIC(eurAmount)` 
4. Client paie montant exact en MATIC

**Vérification GPS Livraison** :
1. Livreur met à jour position via `DoneGPSOracle.updateLocation()`
2. À livraison, backend appelle `DoneGPSOracle.verifyDelivery()`
3. Oracle vérifie distance livreur-client < seuil acceptable
4. Preuve cryptographique enregistrée on-chain

---

## Notes Importantes

### Développement vs Production

- **Development** : Utilise Polygon Mumbai (testnet)
- **Production** : Utilise Polygon Mainnet
- Les adresses de contrats diffèrent entre testnet et mainnet

### Rate Limiting

- Limite : 100 requêtes/minute par IP
- Headers de réponse : `X-RateLimit-Limit`, `X-RateLimit-Remaining`

### WebSocket (Socket.io)

Notifications temps réel disponibles sur :
```
ws://localhost:3000
```

Events Socket.io :
- `orderCreated` : Nouvelle commande
- `orderStatusChanged` : Statut commande changé
- `gpsUpdate` : Mise à jour GPS livreur
- `disputeOpened` : Litige ouvert

### IPFS

- Toutes les images sont uploadées sur IPFS
- Gateway : `https://gateway.pinata.cloud/ipfs/`
- Hash IPFS retourné dans les réponses API

---

## Support

Pour toute question ou problème :
- **Documentation** : Voir `README.md` et `ARCHITECTURE.md`
- **Issues** : Créer une issue sur le repository
- **Email** : support@donefood.com

---

---

## 📊 Récapitulatif des Endpoints

### Total des Endpoints Documentés : **62 routes**

| Catégorie | Nombre | Routes |
|-----------|--------|--------|
| **Commandes** | 11 | create, get, client/:address, confirm-preparation, assign-deliverer, confirm-pickup, update-gps, confirm-delivery, dispute, review, history |
| **Utilisateurs** | 5 | register, get, update, orders, tokens |
| **Restaurants** | 12 | register, list, get, update, orders, analytics, menu (CRUD), earnings, withdraw |
| **Livreurs** | 8 | register, get, available, status, stake, unstake, orders, earnings |
| **Admin** | 7 | stats, disputes, resolve-dispute, users, restaurants, deliverers, slash |
| **Analytics** | 4 | dashboard, orders, revenue, users |
| **Oracles** | 4 | price, convert, gps/verify, weather |
| **Arbitrage** | 3 | vote, votes, resolve |
| **Tokens DONE** | 3 | burn, use-discount, rate |
| **Paiements** | 2 | stripe/create-intent, stripe/confirm |
| **Health** | 1 | health |
| **TOTAL** | **62** | |

### Fonctionnalités Blockchain Documentées

✅ **Gestion Commandes** : Création, workflow complet, litiges  
✅ **Paiements** : Split automatique 70/20/10, Stripe fallback  
✅ **Tokens DONE** : Mint, burn, utilisation pour promotions  
✅ **Staking** : Stake/unstake livreurs, slashing  
✅ **Oracles** : Prix fiat/crypto, GPS, météo  
✅ **Arbitrage** : Vote décentralisé, résolution automatique  
✅ **Analytics** : Dashboard, revenus, croissance  
✅ **Admin** : Statistiques, gestion litiges, slashing  

---

**Dernière mise à jour** : 2025-01-15  
**Version API** : 1.0.0

