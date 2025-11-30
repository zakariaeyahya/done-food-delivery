# Architecture du Système DONE Food Delivery

## Vue d'Ensemble

Le système DONE Food Delivery s'appuie sur une architecture distribuée combinant :
- **Couche Blockchain** (Polygon) : Gestion des commandes, paiements, staking et litiges
- **Backend Node.js** : Orchestration des interactions off-chain, API REST
- **Base de données MongoDB** : Stockage off-chain optimisé
- **Frontends React** : Applications spécialisées par acteur
- **Services décentralisés** : IPFS, Chainlink Oracles, Socket.io

## Diagramme de Flux Complet

```
┌─────────────┐
│   CLIENT    │
└──────┬──────┘
       │
       │ 1. createOrder() + paiement
       ▼
┌─────────────────────────────────┐
│   DoneOrderManager (Smart       │
│   Contract) - État: CREATED     │
│   Fonds bloqués en escrow       │
└──────┬──────────────────────────┘
       │
       │ 2. confirmPreparation()
       ▼
┌─────────────────────────────────┐
│   État: PREPARING               │
│   Restaurant confirme préparation│
└──────┬──────────────────────────┘
       │
       │ 3. assignDeliverer()
       ▼
┌─────────────────────────────────┐
│   État: IN_DELIVERY             │
│   Livreur assigné automatiquement│
└──────┬──────────────────────────┘
       │
       │ 4. confirmPickup()
       │   Livreur récupère commande
       │
       │ 5. confirmDelivery()
       ▼
┌─────────────────────────────────┐
│   État: DELIVERED               │
│   Client valide réception        │
└──────┬──────────────────────────┘
       │
       │ 6. Appel DonePaymentSplitter
       ▼
┌─────────────────────────────────┐
│   Répartition automatique:       │
│   - 70% → Restaurant            │
│   - 20% → Livreur               │
│   - 10% → Plateforme            │
└─────────────────────────────────┘
```

## États d'une Commande

Le cycle de vie d'une commande suit ces états séquentiels :

### 1. **CREATED**
- Commande créée par le client
- Montant total bloqué dans le smart contract (escrow)
- Montant = `foodPrice + deliveryFee + platformFee`
- Fonds sécurisés, non transférables

### 2. **PREPARING**
- Restaurant confirme la préparation via `confirmPreparation()`
- Commande en cours de préparation
- Fonds toujours bloqués

### 3. **IN_DELIVERY**
- Livreur assigné automatiquement ou manuellement
- Livreur confirme le retrait via `confirmPickup()`
- Commande en transit vers le client
- Tracking GPS activé (via Chainlink Oracle)

### 4. **DELIVERED**
- Client confirme la réception via `confirmDelivery()`
- Déclenchement automatique du `DonePaymentSplitter`
- Répartition des fonds (70/20/10)
- Mint de tokens DONE pour le client (récompense fidélité)
- Commande terminée avec succès

### 5. **DISPUTED** (État alternatif)
- Peut être déclenché à tout moment par le client
- Fonds gelés pendant maximum 48h
- Mécanisme d'arbitrage activé
- Résolution par un ARBITRATOR via `resolveDispute()`
- Fonds libérés selon la décision d'arbitrage

## Acteurs du Système

### 1. **CLIENT**
**Rôle** : Utilisateur final qui commande et paie

**Actions principales** :
- Rechercher des restaurants
- Créer une commande (`createOrder()`)
- Effectuer le paiement (crypto ou carte bancaire)
- Valider la livraison (`confirmDelivery()`)
- Ouvrir un litige si nécessaire (`openDispute()`)
- Consulter l'historique des commandes
- Utiliser les tokens DONE pour des réductions

**Permissions** :
- Peut créer des commandes
- Peut confirmer la livraison
- Peut ouvrir des litiges

### 2. **RESTAURANT**
**Rôle** : Préparateur de repas

**Actions principales** :
- Recevoir les notifications de nouvelles commandes
- Confirmer la préparation (`confirmPreparation()`)
- Gérer le menu et les disponibilités
- Consulter les statistiques et revenus

**Permissions** :
- Peut confirmer la préparation de ses commandes
- Reçoit 70% du montant total après livraison

### 3. **DELIVERER (Livreur)**
**Rôle** : Livreur de commandes

**Actions principales** :
- S'inscrire comme livreur (staking 0.1 ETH minimum)
- Accepter des livraisons (`assignDeliverer()`)
- Confirmer le retrait au restaurant (`confirmPickup()`)
- Confirmer la livraison au client
- Tracking GPS en temps réel

**Permissions** :
- Doit avoir staké minimum 0.1 ETH
- Peut accepter des livraisons
- Reçoit 20% du montant total après livraison
- Peut être "slashé" en cas de comportement abusif

### 4. **PLATFORM**
**Rôle** : Administrateur de la plateforme

**Actions principales** :
- Gestion globale du système
- Configuration des rôles
- Monitoring des transactions
- Gestion des litiges (en tant qu'arbitrator)
- Reçoit 10% de commission sur chaque commande

**Permissions** :
- Accès administrateur complet
- Peut résoudre les litiges
- Peut gérer les rôles des utilisateurs

### 5. **ARBITRATOR**
**Rôle** : Résolution des litiges

**Actions principales** :
- Examiner les preuves de litige
- Voter pour la résolution
- Décider de la répartition des fonds en cas de litige

**Permissions** :
- Peut résoudre les litiges via `resolveDispute()`
- Décision finale sur la répartition des fonds

## Split des Paiements

Lorsqu'une commande est livrée (`DELIVERED`), le contrat `DonePaymentSplitter` est automatiquement invoqué pour répartir les fonds :

### Répartition Automatique

```
Montant Total = foodPrice + deliveryFee + platformFee
                │
                ├─→ 70% → RESTAURANT
                ├─→ 20% → DELIVERER
                └─→ 10% → PLATFORM
```

### Exemple Concret

Pour une commande de **100€** :
- **Restaurant** : 70€ (70%)
- **Livreur** : 20€ (20%)
- **Plateforme** : 10€ (10%)

### Caractéristiques

- **Automatique** : Aucune intervention manuelle requise
- **Irréversible** : Transaction on-chain immuable
- **Transparent** : Tous les paiements sont visibles sur la blockchain
- **Instantané** : Pas de délai de traitement (contrairement aux systèmes traditionnels)

## Mécanisme de Dispute

### Déclenchement

Un litige peut être ouvert par le **CLIENT** à tout moment via `openDispute(orderId)`.

### Processus

1. **Ouverture du litige**
   - État de la commande → `DISPUTED`
   - Fonds gelés dans le contrat (escrow)
   - Délai maximum : 48h pour résolution

2. **Collecte de preuves**
   - Photos stockées sur IPFS
   - Messages et communications
   - Preuves GPS (via Chainlink Oracle)
   - Toutes les preuves sont immuables

3. **Arbitrage**
   - Un ou plusieurs **ARBITRATOR** examinent les preuves
   - Vote et décision sur la résolution
   - Appel de `resolveDispute(orderId, winner)`

4. **Résolution**
   - Les fonds sont libérés selon la décision :
     - **Client gagne** : Remboursement complet
     - **Restaurant/Livreur gagne** : Split normal (70/20/10)
     - **Split partiel** : Répartition personnalisée selon le cas

### Cas d'Usage

- Commande non livrée
- Commande incorrecte ou incomplète
- Qualité insuffisante
- Retard excessif
- Problème de paiement

## Sécurité et Garanties

### Escrow System
- Tous les fonds sont bloqués dans le smart contract jusqu'à livraison
- Aucun retrait possible sans validation du client

### Staking des Livreurs
- Dépôt minimum de 0.1 ETH requis
- Protection contre les annulations abusives
- Slashing en cas de comportement frauduleux

### Immuabilité
- Toutes les transactions sont enregistrées on-chain
- Impossible de modifier ou supprimer les données
- Traçabilité complète et transparente

 
Le système DONE Food Delivery est conçu pour assurer une haute disponibilité et résilience face aux pannes grâce à une architecture redondante multi-couches.

### Redondance Blockchain

**Polygon Network**
- Réseau décentralisé avec **100+ validateurs** indépendants
- Consensus Proof-of-Stake (PoS) tolérant jusqu'à 33% de validateurs défaillants
- Aucun point de défaillance unique (Single Point of Failure)
- Réplication automatique sur tous les nœuds du réseau
- Disponibilité : **99.9%+** (SLA Polygon)

**Failover RPC Endpoints**
- Configuration multi-RPC pour redondance :
  ```
  Primary: https://rpc-mumbai.maticvigil.com
  Fallback 1: https://polygon-mumbai.g.alchemy.com
  Fallback 2: https://polygon-mumbai.infura.io
  ```
- Basculement automatique en cas d'indisponibilité
- Load balancing entre les endpoints

**Smart Contracts Immuables**
- Code déployé de manière permanente et répliqué
- Pas de downtime possible une fois déployé
- Accessibilité garantie tant que la blockchain existe

### Redondance Backend

**Architecture Multi-Instances**
- Déploiement possible sur plusieurs serveurs (Docker/Kubernetes)
- Load balancer (NGINX/HAProxy) pour répartir la charge
- Health checks automatiques et failover

**Services Découplés**
```
Backend Node.js
  ├── API Service (stateless)
  ├── Blockchain Service (interaction smart contracts)
  ├── IPFS Service (stockage décentralisé)
  ├── Socket.io Service (temps réel)
  └── Cron Jobs (synchronisation oracles)
```

**Stratégie de Déploiement**
- Blue-Green Deployment : Zéro downtime lors des mises à jour
- Rolling Updates : Mise à jour progressive des instances
- Circuit Breaker Pattern : Isolation des services défaillants

### Redondance Base de Données

**MongoDB Atlas Cluster**
- Replica Set avec **3 nœuds minimum** :
  - 1 Primary (lectures/écritures)
  - 2 Secondary (réplication synchrone)
- Failover automatique en < 30 secondes si Primary défaille
- Synchronisation continue des données

**Backups Automatiques**
- Snapshots automatiques quotidiens (rétention 7 jours)
- Point-in-Time Recovery (PITR) activé
- Backups géo-distribués sur différentes régions

**Stratégie de Lecture**
```javascript
// Read Preference pour haute disponibilité
readPreference: "secondaryPreferred"
// Lit depuis Secondary si disponible, sinon Primary
```

### Redondance IPFS

**Pinning Multi-Services**
- Service principal : **Pinata**
- Service backup : **Infura IPFS**
- Nœud IPFS local (optionnel)

**Garantie de Disponibilité**
- Pinning permanent sur au moins 2 services
- Réplication automatique sur le réseau IPFS
- Accès via multiples gateways :
  ```
  Primary: https://gateway.pinata.cloud/ipfs/{hash}
  Fallback 1: https://ipfs.io/ipfs/{hash}
  Fallback 2: https://cloudflare-ipfs.com/ipfs/{hash}
  ```

**Stratégie de Récupération**
- Si un gateway échoue, essai automatique sur le suivant
- Timeout configuré : 10 secondes par gateway
- Cache local des fichiers fréquemment accédés

### Redondance Oracles

**Chainlink Decentralized Oracles**
- Réseau de **multiples nœuds oracles indépendants**
- Agrégation des données de plusieurs sources
- Pas de dépendance à un seul fournisseur de données

**Price Feed Redundancy**
```solidity
// Multiple price feeds pour validation croisée
Chainlink MATIC/USD (primary)
Fallback: API CoinGecko (off-chain)
```

**GPS Oracle Fallback**
- Données GPS stockées off-chain (MongoDB) ET on-chain
- En cas d'échec oracle, validation manuelle possible
- Preuves GPS conservées sur IPFS

### Mesures de Performance

#### Latence

**Temps de confirmation blockchain (Polygon)**
- **~2 secondes** : Temps moyen de confirmation d'une transaction sur Polygon
- **Avantage** : Beaucoup plus rapide qu'Ethereum mainnet (~15 secondes)
- **Impact utilisateur** : Expérience fluide, pas d'attente excessive
- **Comparaison** :
  - Ethereum : ~15 secondes
  - Polygon : ~2 secondes
  - Système traditionnel : 1-3 secondes (mais centralisé)

**Temps de réponse API Backend**
- **<200ms** : Temps de réponse moyen des endpoints REST (95th percentile)
- **Optimisations** : Cache MongoDB, connexions poolées, indexation optimale
- **Endpoints critiques** :
  - GET /api/orders/:id : **<100ms**
  - POST /api/orders/create : **<300ms** (incluant validation blockchain)
  - GET /api/restaurants : **<150ms** (avec cache)
  - GET /api/menu/:restaurantId : **<120ms**

**Temps de chargement Frontend**
- **<1 seconde** : First Contentful Paint (FCP)
- **<3 secondes** : Time to Interactive (TTI)
- **<5 secondes** : Largest Contentful Paint (LCP)
- **Optimisations** :
  - Code splitting (lazy loading des routes)
  - Compression Gzip/Brotli
  - CDN pour assets statiques
  - Images optimisées (WebP, lazy loading)
  - Tree shaking et minification

#### Vitesse de Transfert

**Débit blockchain (TPS Polygon)**
- **7,000+ TPS** : Transactions par seconde supportées par Polygon
- **Capacité actuelle** : ~100-200 TPS en moyenne
- **Avantage** : Pas de congestion même en pic d'utilisation
- **Comparaison** :
  - Ethereum mainnet : ~15 TPS
  - Polygon : **7,000+ TPS**
  - Visa : ~1,700 TPS
  - Solana : ~65,000 TPS

**Débit IPFS (upload/download)**
- **Upload** : 5-10 MB/s (selon connexion utilisateur et taille fichier)
- **Download** : 10-50 MB/s via gateway Pinata (optimisé)
- **Fichiers typiques** :
  - Photo plat (500 KB) : ~0.5 seconde upload
  - Preuve livraison (1 MB) : ~1 seconde upload
- **Optimisations** :
  - Compression images avant upload (JPEG quality 80%)
  - Lazy loading des images dans les listings
  - Cache local navigateur

**Bande passante API**
- **100+ requêtes/seconde** : Capacité backend avec load balancing
- **Peak handling** : 500 req/s avec 5 instances backend
- **Scalabilité** : Horizontal scaling possible (ajout instances)
- **Rate limiting** :
  - 100 req/min par IP (protection DDoS)
  - 1000 req/min par utilisateur authentifié

**Scalabilité**
- Backend : Horizontal scaling (ajout d'instances)
- MongoDB : Sharding si nécessaire (>100GB données)
- IPFS : Infiniment scalable (réseau P2P)
- Polygon : 7,000+ TPS (largement suffisant pour la plateforme)

**Monitoring et Alertes**
- Uptime monitoring (UptimeRobot, Datadog)
- Alertes automatiques si :
  - Backend down > 1 minute
  - MongoDB replica lag > 10 secondes
  - RPC endpoint indisponible
  - Gas price anormal (> 500 gwei)

**Recovery Time Objective (RTO)**
- Blockchain : **0 seconde** (pas de downtime possible)
- Backend : **< 5 minutes** (failover automatique)
- MongoDB : **< 30 secondes** (replica failover)
- IPFS : **< 10 secondes** (switch gateway)

**Recovery Point Objective (RPO)**
- Blockchain : **0 perte** (immuable)
- MongoDB : **< 1 seconde** (replica sync)
- IPFS : **0 perte** (pinning permanent)

## Intégrations Décentralisées

### IPFS (InterPlanetary File System)
- Stockage des images de plats
- Preuves de livraison (photos)
- Documents de litige
- Pinning permanent via Pinata

### Chainlink Oracles
- **Price Oracle** : Conversion fiat/crypto en temps réel
- **GPS Oracle** : Tracking géolocalisé on-chain
- **Weather Oracle** : Conditions météo (optionnel)

### Socket.io
- Notifications en temps réel
- Mise à jour des statuts de commande
- Alertes pour tous les acteurs

## Flux de Données

### On-Chain (Blockchain)
- États des commandes
- Transactions de paiement
- Staking des livreurs
- Tokens DONE
- Résolutions de litiges

### Off-Chain (MongoDB)
- Menus des restaurants
- Historique GPS détaillé
- Photos et médias (références IPFS)
- Données analytics
- Sessions utilisateurs
- Notifications

## Workflow Complet Détaillé

```
1. CLIENT crée commande
   ├─→ Recherche restaurant (off-chain)
   ├─→ Sélection plats (off-chain)
   ├─→ Calcul total (off-chain)
   └─→ createOrder() on-chain
       ├─→ Vérification montant
       ├─→ Blocage fonds (escrow)
       └─→ État: CREATED

2. RESTAURANT confirme préparation
   └─→ confirmPreparation() on-chain
       └─→ État: PREPARING

3. Assignation LIVREUR
   ├─→ Recherche livreur disponible (off-chain)
   ├─→ Vérification staking (on-chain)
   └─→ assignDeliverer() on-chain
       └─→ État: IN_DELIVERY

4. LIVREUR récupère commande
   └─→ confirmPickup() on-chain
       ├─→ Tracking GPS activé
       └─→ Notification client

5. LIVRAISON au client
   ├─→ Tracking GPS (Chainlink Oracle)
   └─→ confirmDelivery() on-chain
       ├─→ État: DELIVERED
       ├─→ Appel DonePaymentSplitter
       │   ├─→ 70% → Restaurant
       │   ├─→ 20% → Livreur
       │   └─→ 10% → Plateforme
       └─→ Mint tokens DONE (récompense)

6. (Optionnel) LITIGE
   ├─→ openDispute() on-chain
   │   └─→ État: DISPUTED
   ├─→ Collecte preuves (IPFS)
   ├─→ Arbitrage (ARBITRATOR)
   └─→ resolveDispute() on-chain
       └─→ Libération fonds selon décision
```

## Points Clés de l'Architecture

1. **Décentralisation** : Logique métier critique sur blockchain
2. **Hybridité** : Combinaison on-chain/off-chain optimale
3. **Automatisation** : Réduction des interventions manuelles
4. **Transparence** : Toutes les transactions vérifiables
5. **Sécurité** : Escrow et staking pour protéger les parties
6. **Évolutivité** : Architecture modulaire et extensible

