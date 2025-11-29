# Services Backend - Sprint 6: Oracles & Advanced Features

Ce document décrit les nouveaux services backend ajoutés dans le Sprint 6 pour intégrer les oracles et le système d'arbitrage.

## Services

### chainlinkService.js
**Rôle** : Service pour interagir avec Chainlink Price Feed et le contrat DonePriceOracle.

**Fonctionnalités** :
- **fetchPrice()** : Récupère le prix MATIC/USD depuis Chainlink
- **convertUSDtoMATIC(usdAmount)** : Convertit un montant USD en MATIC
- **convertMATICtoUSD(maticAmount)** : Convertit un montant MATIC en USD
- **syncPrice()** : Synchronise le prix avec le contrat DonePriceOracle
- **getLatestPrice()** : Récupère le dernier prix enregistré

**Utilisation** :
- Appelé automatiquement lors de la création d'une commande
- Utilisé pour afficher les prix en EUR et MATIC dans les frontends
- Synchronisation périodique pour maintenir les prix à jour

**Intégration Chainlink** :
- Utilise l'API Chainlink pour récupérer les prix
- Appelle le contrat DonePriceOracle pour mettre à jour les prix on-chain
- Gère les erreurs et les timeouts

### gpsOracleService.js
**Rôle** : Service pour gérer les données GPS et interagir avec DoneGPSOracle.

**Fonctionnalités** :
- **updateLocation(orderId, lat, lng)** : Met à jour la position du livreur
- **verifyDelivery(orderId, clientLat, clientLng)** : Vérifie que la livraison est valide
- **calculateDistance(lat1, lng1, lat2, lng2)** : Calcule la distance entre deux points
- **trackDelivery(orderId)** : Suit une livraison en temps réel
- **getDeliveryPath(orderId)** : Récupère le chemin complet de livraison

**Utilisation** :
- Appelé par le livreur pour mettre à jour sa position
- Vérifie automatiquement la proximité lors de la livraison
- Enregistre toutes les positions GPS on-chain pour traçabilité

**Intégration** :
- Reçoit les données GPS depuis l'application livreur
- Appelle le contrat DoneGPSOracle pour enregistrer on-chain
- Synchronise avec MongoDB pour le stockage off-chain

### arbitrationService.js
**Rôle** : Service pour gérer le système d'arbitrage décentralisé.

**Fonctionnalités** :
- **createDispute(orderId, reason, evidence)** : Crée un nouveau litige
- **voteDispute(disputeId, winner, voterAddress)** : Enregistre un vote
- **resolveDispute(disputeId)** : Résout un litige après la période de vote
- **getDispute(disputeId)** : Récupère les détails d'un litige
- **getVotingPower(address)** : Calcule le pouvoir de vote d'un utilisateur
- **getDisputeVotes(disputeId)** : Récupère tous les votes d'un litige

**Utilisation** :
- Appelé lorsqu'un utilisateur ouvre un litige
- Gère les votes de la communauté
- Déclenche la résolution automatique après la période de vote

**Intégration** :
- Interagit avec le contrat DoneArbitration
- Utilise DoneToken pour calculer le pouvoir de vote
- Synchronise avec MongoDB pour le stockage des preuves

## Architecture

Les services fonctionnent en couche intermédiaire entre :
- **Frontend** : Envoie les requêtes
- **Smart Contracts** : Enregistre les données on-chain
- **APIs Externes** : Récupère les données (Chainlink, GPS, etc.)
- **MongoDB** : Stocke les données off-chain

## Variables d'environnement

```env
# Chainlink
CHAINLINK_PRICE_FEED_ADDRESS=0x...
CHAINLINK_API_KEY=your_api_key

# GPS Oracle
GPS_ORACLE_ADDRESS=0x...
GOOGLE_MAPS_API_KEY=your_api_key

# Arbitration
ARBITRATION_CONTRACT_ADDRESS=0x...
TOKEN_CONTRACT_ADDRESS=0x...
VOTING_PERIOD=172800  # 48h en secondes
```

## Erreurs et Gestion

- **Timeouts** : Gestion des timeouts pour les appels externes
- **Retry Logic** : Nouvelle tentative en cas d'échec
- **Logging** : Enregistrement de toutes les opérations
- **Validation** : Vérification des données avant envoi on-chain

## Tests

Chaque service doit être testé avec :
- Tests unitaires pour chaque fonction
- Tests d'intégration avec les contrats
- Tests de performance pour les appels fréquents
- Tests de résilience en cas d'erreur

