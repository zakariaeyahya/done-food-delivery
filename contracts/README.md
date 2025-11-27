# Dossier contracts/

Ce dossier contient tous les smart contracts Solidity qui constituent le cœur métier de la plateforme DONE Food Delivery. Les contrats sont déployés sur le réseau Polygon Mumbai (testnet).

## Structure

### Contrats Principaux

#### DoneOrderManager.sol
**Rôle** : Contrat principal de gestion du cycle de vie complet des commandes.

**Fonctionnalités** :
- Gestion des rôles : CLIENT, RESTAURANT, DELIVERER, PLATFORM, ARBITRATOR
- Gestion des états de commande : CREATED → PREPARING → IN_DELIVERY → DELIVERED ou DISPUTED
- Système d'escrow : blocage des fonds jusqu'à livraison
- Fonctions principales :
  - `createOrder()` : Création d'une commande avec paiement (blocage des fonds)
  - `confirmPreparation()` : Confirmation de préparation par le restaurant
  - `assignDeliverer()` : Assignation d'un livreur à la commande
  - `confirmPickup()` : Confirmation de récupération par le livreur
  - `confirmDelivery()` : Confirmation de livraison par le client (déclenche le split)
  - `openDispute()` : Ouverture d'un litige
  - `resolveDispute()` : Résolution d'un litige par un arbitre

**Struct Order** : Contient toutes les informations d'une commande (id, client, restaurant, livreur, prix, statut, hash IPFS, etc.)

#### DonePaymentSplitter.sol
**Rôle** : Répartition automatique des paiements selon le ratio prédéfini.

**Fonctionnalités** :
- Split automatique : 70% restaurant, 20% livreur, 10% plateforme
- Fonction `splitPayment(orderId, totalAmount)` : Répartit les fonds automatiquement
- Émission d'événements pour traçabilité on-chain
- Transactions irréversibles et transparentes

**Utilisation** : Appelé automatiquement par DoneOrderManager lors de la confirmation de livraison.

#### DoneToken.sol
**Rôle** : Token ERC20 de fidélité pour récompenser les clients.

**Fonctionnalités** :
- Standard ERC20 avec fonctions `mint()` et `burn()`
- Système de récompenses : 1 token DONE par 10€ dépensés
- `mint()` : Attribue des tokens après une livraison réussie
- `burn()` : Consomme des tokens pour des réductions
- Tokens transférables et échangeables

**Utilisation** : Les tokens sont minés automatiquement après chaque commande livrée.

#### DoneStaking.sol
**Rôle** : Gestion du staking des livreurs pour garantir leur fiabilité.

**Fonctionnalités** :
- `stakeAsDeliverer()` : Dépôt minimum de 0.1 ETH requis pour être livreur
- `unstake()` : Retrait de la caution (si pas d'abus)
- `slash(deliverer, amount)` : Pénalité en cas de comportement abusif
- `isStaked(address)` : Vérification qu'un livreur est bien staké

**Sécurité** : Protège les clients et restaurants contre les annulations abusives et fraudes.

### Dossier interfaces/

#### IOrderManager.sol
**Rôle** : Interface standardisée pour le contrat DoneOrderManager.

**Fonctionnalités** :
- Définit les signatures de fonctions essentielles
- Permet les interactions cross-contracts sans dépendance directe
- Facilite l'upgrade, le testing et la modularité

#### IPaymentSplitter.sol
**Rôle** : Interface standardisée pour le contrat DonePaymentSplitter.

**Fonctionnalités** :
- Définit les signatures de fonctions de répartition
- Standardise la communication entre contrats
- Améliore la maintenabilité du code

### Dossier libraries/

#### OrderLib.sol
**Rôle** : Bibliothèque de fonctions utilitaires pour la gestion des commandes.

**Fonctionnalités** :
- Validations (montant correct, état valide)
- Helpers (calcul du totalAmount)
- Gestion interne des structures Order
- Outils de lecture/écriture optimisée

**Avantages** : Réduit la taille du contrat principal, améliore le gas et la lisibilité.

## Dépendances

- Les contrats utilisent OpenZeppelin pour les rôles et la sécurité
- DoneOrderManager dépend de DonePaymentSplitter, DoneToken et DoneStaking
- Les interfaces permettent la modularité et l'évolutivité

## Déploiement

Les contrats doivent être déployés dans l'ordre suivant :
1. DoneToken.sol
2. DonePaymentSplitter.sol
3. DoneStaking.sol
4. DoneOrderManager.sol (utilise les adresses des contrats précédents)

Utiliser le script `scripts/deploy-all.js` pour un déploiement automatique.

