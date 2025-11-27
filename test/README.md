# Dossier test/

Ce dossier contient tous les tests unitaires pour les smart contracts. Les tests sont écrits en JavaScript/TypeScript et utilisent Hardhat avec Chai et Mocha.

## Fichiers de Tests

### DoneOrderManager.test.js
**Rôle** : Tests complets du workflow des commandes et de la gestion des états.

**Tests couverts** :
- **T1 : Création de commande avec paiement correct**
  - `createOrder` avec `msg.value` correct → Succès
  - `createOrder` avec `msg.value` incorrect → Revert
  - Vérification que les fonds sont bien bloqués (escrow)

- **T2 : Workflow complet (CREATED → DELIVERED)**
  - `createOrder` : Création et paiement
  - `confirmPreparation` : Confirmation par le restaurant
  - `assignDeliverer` : Assignation d'un livreur
  - `confirmPickup` : Confirmation de récupération
  - `confirmDelivery` : Confirmation de livraison
  - Vérification des changements d'état à chaque étape
  - Vérification des événements émis

- **T4 : Dispute et gel des fonds**
  - `openDispute` : Ouverture d'un litige → État DISPUTED
  - Vérification que les fonds restent bloqués
  - `resolveDispute` : Résolution par un arbitre
  - Vérification de la libération des fonds selon la décision

**Points critiques testés** :
- Gestion des rôles et permissions
- Transitions d'états valides
- Blocage et libération des fonds
- Émission des événements

### DonePaymentSplitter.test.js
**Rôle** : Vérification de la répartition correcte des paiements.

**Tests couverts** :
- **T3 : Split de paiement automatique**
  - Appel de `splitPayment(orderId, totalAmount)`
  - Vérification que le restaurant reçoit 70%
  - Vérification que le livreur reçoit 20%
  - Vérification que la plateforme reçoit 10%
  - Vérification de l'événement `PaymentSplit`

- **Tests d'erreur** :
  - `totalAmount = 0` → Revert
  - Fonds insuffisants dans le contrat → Revert
  - Adresses nulles → Gestion d'erreur

**Points critiques testés** :
- Calculs mathématiques corrects (70/20/10)
- Transferts de fonds sécurisés
- Émission des événements

### DoneToken.test.js
**Rôle** : Tests du token ERC20 de fidélité.

**Tests couverts** :
- **Standard ERC20** :
  - `name`, `symbol`, `decimals`, `totalSupply`
  - Transferts standards entre adresses
  - Approvals et allowances

- **Fonctions spécifiques** :
  - `mint()` :
    - Appelé seulement par une adresse autorisée (DoneOrderManager ou PLATFORM)
    - Mint du bon nombre de tokens
    - Mise à jour du totalSupply

  - `burn()` :
    - Réduction du solde
    - Réduction du totalSupply

- **T6 : Distribution de récompenses tokens**
  - Simulation d'une commande payée et livrée
  - Vérification que le client reçoit 1 DONE par 10€ dépensés
  - Calcul basé sur le montant en wei

**Points critiques testés** :
- Conformité au standard ERC20
- Contrôle d'accès pour mint/burn
- Calculs de récompenses

### DoneStaking.test.js
**Rôle** : Tests du système de staking et slashing des livreurs.

**Tests couverts** :
- **T5 : Staking et slashing livreur**
  - `stakeAsDeliverer()` :
    - Doit revert si montant < 0.1 ETH
    - Doit marquer le livreur comme staké
    - Vérification du dépôt dans le contrat

  - `unstake()` :
    - Permet de récupérer les fonds si conditions OK
    - Vérification du retrait

  - `slash(deliverer, amount)` :
    - Réduction du stake
    - Ne doit pas permettre de slasher plus que le montant staké
    - Vérification des permissions (seulement PLATFORM)

  - `isStaked(address)` :
    - Retourne true/false correctement
    - Vérification de l'état du staking

**Points critiques testés** :
- Montant minimum de staking
- Protection contre le slashing abusif
- Gestion des retraits

## Exécution des Tests

```bash
# Exécuter tous les tests
npx hardhat test

# Exécuter un fichier de test spécifique
npx hardhat test test/DoneOrderManager.test.js

# Tests avec couverture de code
npx hardhat coverage
```

## Objectifs de Test

- **Couverture** : 100% des fonctions critiques
- **Tous les tests passent** : Objectif avant déploiement
- **Tests d'intégration** : Workflow complet testé
- **Tests de sécurité** : Reentrancy, overflow, access control

## Structure des Tests

Chaque fichier de test suit cette structure :
1. Setup : Déploiement des contrats et préparation des comptes
2. Tests unitaires : Chaque fonction testée individuellement
3. Tests d'intégration : Workflow complet
4. Tests d'erreur : Cas limites et erreurs attendues
5. Cleanup : Nettoyage si nécessaire

