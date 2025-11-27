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

