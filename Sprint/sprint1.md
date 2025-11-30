# SPRINT 1: SMART CONTRACTS CORE

## OBJECTIF
Développer les smart contracts Solidity pour la gestion des commandes, paiements, tokens de fidélité et staking des livreurs.

---

## ⚠️ ÉTAT ACTUEL DU PROJET

**IMPORTANT:** Les dossiers et fichiers suivants existent déjà mais sont **VIDES**. Il faut les compléter/implémenter.

**Dossiers existants:**
- ✓ `contracts/` (existe)
- ✓ `contracts/interfaces/` (existe)
- ✓ `contracts/libraries/` (existe)
- ✓ `scripts/` (existe)
- ✓ `test/` (existe)

**Fichiers existants mais vides:**
- ✓ `contracts/DoneToken.sol` (vide)
- ✓ `contracts/DonePaymentSplitter.sol` (vide)
- ✓ `contracts/DoneStaking.sol` (vide)
- ✓ `contracts/DoneOrderManager.sol` (vide)
- ✓ `contracts/interfaces/IOrderManager.sol` (vide)
- ✓ `contracts/interfaces/IPaymentSplitter.sol` (vide)
- ✓ `contracts/libraries/OrderLib.sol` (vide)
- ✓ `scripts/deploy-all.js` (vide)
- ✓ `scripts/setup-roles.js` (vide)
- ✓ `scripts/seed-data.js` (vide)
- ✓ `test/DoneOrderManager.test.js` (vide)
- ✓ `test/DonePaymentSplitter.test.js` (vide)
- ✓ `test/DoneToken.test.js` (vide)
- ✓ `test/DoneStaking.test.js` (vide)

---

## ÉTAPES À SUIVRE PAR ORDRE

### ÉTAPE 1: PRÉPARATION DE L'ENVIRONNEMENT
- ✓ Vérifier que Hardhat est installé globalement (optionnel)
- ✓ Préparer les clés privées pour déploiement (Mumbai testnet)
- ✓ Obtenir des MATIC de test depuis faucet Polygon Mumbai
- ✓ Configurer MetaMask avec réseau Polygon Mumbai

### ÉTAPE 2: INSTALLATION DES DÉPENDANCES
1. Aller dans le dossier `contracts/`:
   ```bash
   cd contracts
   ```
2. Initialiser npm (si pas déjà fait):
   ```bash
   npm init -y
   ```
3. Installer les dépendances Hardhat:
   ```bash
   npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
   npm install @openzeppelin/contracts ethers
   ```
4. Initialiser Hardhat (si pas déjà fait):
   ```bash
   npx hardhat init
   ```
   (Choisir: Create a JavaScript project)

### ÉTAPE 3: CONFIGURATION DE HARDHAT
**Fichier à compléter:** `hardhat.config.js` (à la racine - peut être vide)

**Configuration à ajouter:**
- Réseau Mumbai (RPC URL, accounts)
- Optimisation du compilateur
- Chemins des contrats et tests

### ÉTAPE 4: IMPLÉMENTATION DES INTERFACES
**Fichiers à compléter (existent mais vides):**

1. **`contracts/interfaces/IOrderManager.sol`** (vide - à compléter)
   - Définir les signatures de fonctions essentielles
   - Faciliter les interactions cross-contracts

2. **`contracts/interfaces/IPaymentSplitter.sol`** (vide - à compléter)
   - Interface pour DonePaymentSplitter
   - Standardiser la communication entre contrats

### ÉTAPE 5: IMPLÉMENTATION DES BIBLIOTHÈQUES
**Fichier à compléter:**

1. **`contracts/libraries/OrderLib.sol`** (vide - à compléter)
   - Fonctions utilitaires pour la gestion des commandes
   - Validations (montant, état)
   - Helpers (calcul totalAmount)
   - Optimisation gas

### ÉTAPE 6: IMPLÉMENTATION DU CONTRAT DoneToken.sol
**Fichier à compléter:** `contracts/DoneToken.sol` (vide - à compléter)

**Implémenter:**
- Standard ERC20 complet (OpenZeppelin)
- Fonctions `mint()` et `burn()`
- Taux de récompense: 1 DONE token par 10€ dépensés
- Contrôle d'accès MINTER_ROLE
- 18 decimals

### ÉTAPE 7: IMPLÉMENTATION DU CONTRAT DonePaymentSplitter.sol
**Fichier à compléter:** `contracts/DonePaymentSplitter.sol` (vide - à compléter)

**Implémenter:**
- Répartition automatique des paiements
- Split: 70% restaurant, 20% livreur, 10% plateforme
- Fonction `splitPayment()` appelée automatiquement
- Events PaymentSplit pour traçabilité
- Protection ReentrancyGuard

### ÉTAPE 8: IMPLÉMENTATION DU CONTRAT DoneStaking.sol
**Fichier à compléter:** `contracts/DoneStaking.sol` (vide - à compléter)

**Implémenter:**
- Gestion du staking des livreurs
- Minimum: 0.1 ETH requis
- Fonctions: `stakeAsDeliverer()`, `unstake()`, `slash()`, `isStaked()`
- Protection contre les abus

### ÉTAPE 9: IMPLÉMENTATION DU CONTRAT DoneOrderManager.sol
**Fichier à compléter:** `contracts/DoneOrderManager.sol` (vide - à compléter)

**Implémenter:**
- Contrat principal de gestion du cycle de vie des commandes
- Rôles: CLIENT, RESTAURANT, DELIVERER, PLATFORM, ARBITRATOR
- Struct Order avec tous les champs nécessaires
- Fonctions principales:
  * `createOrder()` - Création de commande avec paiement
  * `confirmPreparation()` - Confirmation par le restaurant
  * `assignDeliverer()` - Assignation d'un livreur
  * `confirmPickup()` - Confirmation de récupération
  * `confirmDelivery()` - Confirmation de livraison + split automatique
  * `openDispute()` - Ouverture d'un litige
  * `resolveDispute()` - Résolution par arbitre
- États: CREATED, PREPARING, IN_DELIVERY, DELIVERED, DISPUTED
- Gestion escrow des fonds
- Events pour chaque transition d'état
- Intégration avec DonePaymentSplitter, DoneToken, DoneStaking

### ÉTAPE 10: IMPLÉMENTATION DES SCRIPTS DE DÉPLOIEMENT
**Fichiers à compléter (existent mais vides):**

1. **`scripts/deploy-all.js`** (vide - à compléter)
   - Déploiement automatique de tous les contrats sur Mumbai
   - Ordre de déploiement:
     1. DoneToken
     2. DonePaymentSplitter
     3. DoneStaking
     4. DoneOrderManager
   - Sauvegarde des adresses dans `deployed-addresses.json`
   - Configuration post-déploiement (autorisations)

2. **`scripts/setup-roles.js`** (vide - à compléter)
   - Configuration des rôles AccessControl après déploiement
   - Assignation des rôles RESTAURANT, DELIVERER, ARBITRATOR
   - Vérification des rôles configurés

3. **`scripts/seed-data.js`** (vide - à compléter)
   - Création de données de test
   - Utilisateurs, restaurants, livreurs
   - Commandes on-chain et off-chain
   - Environnement de développement réaliste

### ÉTAPE 11: IMPLÉMENTATION DES TESTS
**Fichiers à compléter (existent mais vides):**

1. **`test/DoneOrderManager.test.js`** (vide - à compléter)
   - Tests T1: Création de commande avec paiement correct
   - Tests T2: Workflow complet (CREATED → DELIVERED)
   - Tests T4: Dispute et gel des fonds
   - Vérification des transitions d'état
   - Vérification des events

2. **`test/DonePaymentSplitter.test.js`** (vide - à compléter)
   - Tests T3: Split de paiement automatique (70/20/10)
   - Vérification des calculs mathématiques
   - Gestion des arrondis
   - Protection contre les adresses nulles

3. **`test/DoneToken.test.js`** (vide - à compléter)
   - Tests standard ERC20
   - Tests T6: Distribution de récompenses tokens
   - Tests `mint()` et `burn()`
   - Vérification du taux (1 token / 10€)

4. **`test/DoneStaking.test.js`** (vide - à compléter)
   - Tests T5: Staking et slashing livreur
   - Vérification minimum 0.1 ETH
   - Tests `unstake()`
   - Tests `slash()` avec validations

### ÉTAPE 12: COMPILATION ET VÉRIFICATION
1. Compiler les contrats:
   ```bash
   npx hardhat compile
   ```
2. Vérifier qu'il n'y a pas d'erreurs de compilation
3. Vérifier les warnings et les corriger si nécessaire

### ÉTAPE 13: EXÉCUTION DES TESTS
1. Exécuter tous les tests:
   ```bash
   npx hardhat test
   ```
2. Vérifier que tous les tests passent (100%)
3. Si des tests échouent, corriger les bugs

### ÉTAPE 14: DÉPLOIEMENT SUR MUMBAI (TESTNET)
1. Configurer les variables d'environnement:
   - `PRIVATE_KEY` (clé privée du wallet de déploiement)
   - `MUMBAI_RPC_URL`
2. Déployer les contrats:
   ```bash
   npx hardhat run scripts/deploy-all.js --network mumbai
   ```
3. Configurer les rôles:
   ```bash
   npx hardhat run scripts/setup-roles.js --network mumbai
   ```
4. Vérifier les contrats sur Polygonscan Mumbai

### ÉTAPE 15: DOCUMENTATION
**Fichier à compléter:** `contracts/README.md` (peut être complété après implémentation)

**Contenu à ajouter:**
- Documentation détaillée de chaque contrat
- Spécifications techniques complètes
- Fonctions, events, structs
- Sécurité et optimisations
- Ordre de déploiement

### ÉTAPE 16: VALIDATION DU SPRINT 1
✓ Tous les fichiers vides complétés avec le code
✓ Tous les contrats compilés sans erreurs
✓ Tous les tests passent (100%)
✓ Contrats déployés sur Mumbai
✓ Adresses des contrats sauvegardées
✓ Documentation complète
✓ Scripts de déploiement fonctionnels

---

## RÉCAPITULATIF DES FICHIERS À COMPLÉTER PAR ORDRE

**⚠️ NOTE:** Tous ces fichiers existent déjà mais sont **VIDES**. Il faut les compléter dans l'ordre suivant:

### 1. Configuration
- `hardhat.config.js` (à la racine - peut être vide)

### 2. Interfaces (Fichiers vides - à compléter)
- `contracts/interfaces/IOrderManager.sol` ⚠️ VIDE
- `contracts/interfaces/IPaymentSplitter.sol` ⚠️ VIDE

### 3. Bibliothèques (Fichier vide - à compléter)
- `contracts/libraries/OrderLib.sol` ⚠️ VIDE

### 4. Contrats Principaux (Fichiers vides - à compléter)
- `contracts/DoneToken.sol` ⚠️ VIDE
- `contracts/DonePaymentSplitter.sol` ⚠️ VIDE
- `contracts/DoneStaking.sol` ⚠️ VIDE
- `contracts/DoneOrderManager.sol` ⚠️ VIDE

### 5. Scripts de Déploiement (Fichiers vides - à compléter)
- `scripts/deploy-all.js` ⚠️ VIDE
- `scripts/setup-roles.js` ⚠️ VIDE
- `scripts/seed-data.js` ⚠️ VIDE

### 6. Tests (Fichiers vides - à compléter)
- `test/DoneOrderManager.test.js` ⚠️ VIDE
- `test/DonePaymentSplitter.test.js` ⚠️ VIDE
- `test/DoneToken.test.js` ⚠️ VIDE
- `test/DoneStaking.test.js` ⚠️ VIDE

### 7. Documentation
- `contracts/README.md` (peut être complété après implémentation)

---

## FONCTIONNALITÉS DÉTAILLÉES PAR CONTRAT

### DoneOrderManager.sol
- Gestion complète du workflow des commandes
- Escrow pattern pour sécuriser les fonds
- AccessControl pour les rôles
- ReentrancyGuard pour sécurité
- Pausable pour urgence
- Events pour chaque action importante
- Calcul automatique de platformFee (10%)
- Intégration avec DonePaymentSplitter, DoneToken, DoneStaking

### DonePaymentSplitter.sol
- Split automatique lors de `confirmDelivery()`
- Calculs précis (70/20/10)
- Transferts sécurisés via low-level call
- Events pour audit trail
- Pas de stockage d'état (gas optimisé)

### DoneToken.sol
- Standard ERC20 complet
- Mint automatique après livraison
- Burn pour utilisation des tokens
- Contrôle d'accès MINTER_ROLE
- 18 decimals
- Transferable et échangeable

### DoneStaking.sol
- Garantie de fiabilité des livreurs
- Minimum 0.1 ETH
- Slashing pour comportements abusifs
- Unstake si pas de livraison active
- Protection contre slashing excessif

---

## TESTS CRITIQUES À IMPLÉMENTER

- **T1:** Création commande avec paiement correct
- **T2:** Workflow complet (CREATED → DELIVERED)
- **T3:** Split paiement automatique
- **T4:** Dispute freeze funds
- **T5:** Staking/slashing livreur
- **T6:** Rewards tokens distribution

---

## LIVRABLES ATTENDUS

✓ Contrats déployés sur Mumbai
✓ Tests 100% pass
✓ Adresses des contrats dans `.env`
✓ Documentation complète
✓ Scripts de déploiement fonctionnels

---

## NOTES IMPORTANTES

- Les contrats utilisent OpenZeppelin pour sécurité
- Ordre de déploiement critique (dépendances)
- Tests exhaustifs requis avant mainnet
- Documentation README très détaillée
- Vérifier les coûts de gas et optimiser si nécessaire

---

## PROCHAINES ÉTAPES

→ Passer au Sprint 2: Backend API
→ Lire `SPRINT_2.txt` pour connaître les fichiers à créer
→ Suivre `ETAPES_2.txt` pour les étapes détaillées

