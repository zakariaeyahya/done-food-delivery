# Contracts - Governance

Documentation détaillée du système de gouvernance décentralisée pour l'arbitrage des litiges.

## Vue d'ensemble

Le dossier `governance/` contient le smart contract permettant l'arbitrage décentralisé des litiges via un système de vote tokenisé. Ce système transforme la plateforme en une organisation décentralisée (DAO-like) où les détenteurs de tokens DONE peuvent participer aux décisions d'arbitrage.

## Architecture

Le système de gouvernance utilise le **token-weighted voting** :
- Chaque détenteur de tokens DONE peut voter sur les litiges
- Le pouvoir de vote est proportionnel à la quantité de tokens possédés
- Plus un utilisateur contribue à la plateforme, plus son vote a de poids
- Les décisions sont transparentes et enregistrées on-chain

## Fichiers

### DoneArbitration.sol

Smart contract gérant le système d'arbitrage décentralisé par vote communautaire.

**Dépendances:**
```solidity
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./DoneToken.sol";
import "./DoneOrderManager.sol";
```

**State Variables:**
```solidity
// Référence au token pour calculer le pouvoir de vote
DoneToken public doneToken;

// Référence au gestionnaire de commandes
DoneOrderManager public orderManager;

// Compteur de litiges
uint256 public disputeCount;

// Mapping disputeId => Dispute
mapping(uint256 => Dispute) public disputes;

// Mapping disputeId => address => bool (a voté?)
mapping(uint256 => mapping(address => bool)) public hasVoted;

// Mapping disputeId => Winner => votePower
mapping(uint256 => mapping(Winner => uint256)) public votes;
```

**Structs:**
```solidity
struct Dispute {
    uint256 orderId;           // ID de la commande contestée
    address client;            // Adresse du client
    address restaurant;        // Adresse du restaurant
    address deliverer;         // Adresse du livreur
    string reason;             // Raison du litige
    string evidenceIPFS;       // Hash IPFS des preuves (photos, etc.)
    uint256 totalVotePower;    // Somme totale du pouvoir de vote
    Winner leadingWinner;      // Gagnant actuel (temporaire)
    DisputeStatus status;      // OPEN, VOTING, RESOLVED
    uint256 createdAt;         // Timestamp de création
    uint256 resolvedAt;        // Timestamp de résolution
}

enum Winner {
    NONE,        // Pas encore décidé
    CLIENT,      // Client gagne (remboursement)
    RESTAURANT,  // Restaurant gagne (paiement normal)
    DELIVERER    // Livreur gagne (si slashing contesté)
}

enum DisputeStatus {
    OPEN,        // Litige ouvert, en attente de votes
    VOTING,      // Phase de vote active
    RESOLVED     // Litige résolu
}
```

**Events:**
```solidity
event DisputeCreated(
    uint256 indexed disputeId,
    uint256 indexed orderId,
    address client,
    string reason
);

event VoteCast(
    uint256 indexed disputeId,
    address indexed voter,
    Winner winner,
    uint256 votePower
);

event DisputeResolved(
    uint256 indexed disputeId,
    Winner winner,
    uint256 totalVotePower
);
```

**Constructor:**
```solidity
constructor(address _doneToken, address _orderManager) {
    // Initialise les références aux contrats
    doneToken = DoneToken(_doneToken);
    orderManager = DoneOrderManager(_orderManager);

    // Configure les rôles AccessControl
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _setupRole(ARBITER_ROLE, msg.sender);
}
```

**Fonctions principales:**

#### 1. createDispute
Crée un nouveau litige pour une commande.

```solidity
function createDispute(
    uint256 orderId,
    string memory reason,
    string memory evidenceIPFS
) external nonReentrant returns (uint256 disputeId) {
    // 1. Vérifier que la commande existe
    Order memory order = orderManager.getOrder(orderId);
    require(order.orderId == orderId, "Order not found");

    // 2. Vérifier que l'appelant est partie prenante
    require(
        msg.sender == order.client ||
        msg.sender == order.restaurant ||
        msg.sender == order.deliverer,
        "Not authorized"
    );

    // 3. Vérifier que la commande est dans un état disputable
    require(
        order.status == OrderStatus.IN_DELIVERY ||
        order.status == OrderStatus.DELIVERED,
        "Cannot dispute at this stage"
    );

    // 4. Créer le litige
    disputeCount++;
    disputeId = disputeCount;

    disputes[disputeId] = Dispute({
        orderId: orderId,
        client: order.client,
        restaurant: order.restaurant,
        deliverer: order.deliverer,
        reason: reason,
        evidenceIPFS: evidenceIPFS,
        totalVotePower: 0,
        leadingWinner: Winner.NONE,
        status: DisputeStatus.VOTING,
        createdAt: block.timestamp,
        resolvedAt: 0
    });

    // 5. Mettre à jour le statut de la commande
    orderManager.setDisputeStatus(orderId, true);

    emit DisputeCreated(disputeId, orderId, order.client, reason);
}
```

**Gas estimé:** ~150,000 gas

#### 2. voteDispute
Permet aux détenteurs de tokens DONE de voter sur un litige.

```solidity
function voteDispute(
    uint256 disputeId,
    Winner winner
) external nonReentrant {
    // 1. Vérifier que le litige existe et est ouvert au vote
    Dispute storage dispute = disputes[disputeId];
    require(dispute.status == DisputeStatus.VOTING, "Not in voting phase");

    // 2. Vérifier que l'utilisateur n'a pas déjà voté
    require(!hasVoted[disputeId][msg.sender], "Already voted");

    // 3. Vérifier que le choix est valide
    require(
        winner == Winner.CLIENT ||
        winner == Winner.RESTAURANT ||
        winner == Winner.DELIVERER,
        "Invalid winner choice"
    );

    // 4. Calculer le pouvoir de vote basé sur les tokens DONE
    uint256 votePower = doneToken.balanceOf(msg.sender);
    require(votePower > 0, "No voting power");

    // 5. Enregistrer le vote
    hasVoted[disputeId][msg.sender] = true;
    votes[disputeId][winner] += votePower;
    dispute.totalVotePower += votePower;

    // 6. Mettre à jour le gagnant actuel
    if (votes[disputeId][winner] > votes[disputeId][dispute.leadingWinner]) {
        dispute.leadingWinner = winner;
    }

    emit VoteCast(disputeId, msg.sender, winner, votePower);
}
```

**Gas estimé:** ~80,000 gas

#### 3. resolveDispute
Clôture le litige et transfère les fonds au gagnant désigné par le vote.

```solidity
function resolveDispute(uint256 disputeId)
    external
    nonReentrant
    onlyRole(ARBITER_ROLE)
{
    // 1. Vérifier que le litige est en phase de vote
    Dispute storage dispute = disputes[disputeId];
    require(dispute.status == DisputeStatus.VOTING, "Not in voting phase");

    // 2. Vérifier qu'il y a eu assez de votes (minimum requis)
    uint256 minVotePower = 1000 * 10**18; // 1000 DONE tokens minimum
    require(dispute.totalVotePower >= minVotePower, "Not enough votes");

    // 3. Vérifier qu'il y a un gagnant clair
    require(dispute.leadingWinner != Winner.NONE, "No clear winner");

    // 4. Marquer le litige comme résolu
    dispute.status = DisputeStatus.RESOLVED;
    dispute.resolvedAt = block.timestamp;

    // 5. Récupérer les détails de la commande
    Order memory order = orderManager.getOrder(dispute.orderId);

    // 6. Transférer les fonds selon le gagnant
    if (dispute.leadingWinner == Winner.CLIENT) {
        // Remboursement complet au client
        orderManager.refundToClient(dispute.orderId);

    } else if (dispute.leadingWinner == Winner.RESTAURANT) {
        // Paiement normal (split 70/20/10)
        orderManager.releasePayment(dispute.orderId);

    } else if (dispute.leadingWinner == Winner.DELIVERER) {
        // Cas spécial : livreur gagne contre slashing
        // Annuler le slashing et payer normalement
        orderManager.cancelSlashing(dispute.orderId);
        orderManager.releasePayment(dispute.orderId);
    }

    // 7. Mettre à jour le statut de dispute dans OrderManager
    orderManager.setDisputeStatus(dispute.orderId, false);

    emit DisputeResolved(
        disputeId,
        dispute.leadingWinner,
        dispute.totalVotePower
    );
}
```

**Gas estimé:** ~200,000 gas

#### 4. getDispute
Récupère les détails d'un litige.

```solidity
function getDispute(uint256 disputeId)
    external
    view
    returns (Dispute memory)
{
    require(disputeId > 0 && disputeId <= disputeCount, "Invalid disputeId");
    return disputes[disputeId];
}
```

#### 5. getVoteDistribution
Récupère la distribution des votes pour un litige.

```solidity
function getVoteDistribution(uint256 disputeId)
    external
    view
    returns (
        uint256 clientVotes,
        uint256 restaurantVotes,
        uint256 delivererVotes
    )
{
    clientVotes = votes[disputeId][Winner.CLIENT];
    restaurantVotes = votes[disputeId][Winner.RESTAURANT];
    delivererVotes = votes[disputeId][Winner.DELIVERER];
}
```

#### 6. getUserVotingPower
Calcule le pouvoir de vote actuel d'un utilisateur.

```solidity
function getUserVotingPower(address user)
    external
    view
    returns (uint256)
{
    return doneToken.balanceOf(user);
}
```

## Workflow d'arbitrage

### Scénario complet:

```
1. Création du litige
   Client/Restaurant/Livreur → createDispute(orderId, reason, evidenceIPFS)
   ↓
   Dispute créé avec status = VOTING
   Order.status → DISPUTED

2. Phase de vote (durée: 48h par défaut)
   Token holders → voteDispute(disputeId, winner)
   ↓
   Votes pondérés enregistrés
   leadingWinner mis à jour en temps réel

3. Résolution
   Arbitre (ou automatique après deadline) → resolveDispute(disputeId)
   ↓
   Vérifications:
   - Minimum 1000 DONE de voting power total
   - Un gagnant clair existe
   ↓
   Transfert des fonds selon le gagnant:
   - CLIENT: Remboursement total
   - RESTAURANT: Paiement normal (70%)
   - DELIVERER: Annulation slashing + paiement (20%)

4. Litige clôturé
   status = RESOLVED
   Order.status → mise à jour selon résolution
```

## Sécurité

### Protection ReentrancyGuard
Toutes les fonctions modifiant l'état utilisent `nonReentrant` pour prévenir les attaques de réentrance.

### AccessControl
Le rôle `ARBITER_ROLE` est requis pour:
- Résoudre les litiges
- Gérer les paramètres système (délais, minimums)

### Vérifications critiques
```solidity
// Impossible de voter deux fois
require(!hasVoted[disputeId][msg.sender], "Already voted");

// Seuls les détenteurs de tokens peuvent voter
require(votePower > 0, "No voting power");

// Impossible de résoudre sans votes suffisants
require(dispute.totalVotePower >= minVotePower, "Not enough votes");

// Snapshot du voting power au moment du vote (pas manipulable après)
uint256 votePower = doneToken.balanceOf(msg.sender);
```

## Intégration avec DoneOrderManager

DoneArbitration nécessite des fonctions dans DoneOrderManager:

```solidity
// Dans DoneOrderManager.sol
function setDisputeStatus(uint256 orderId, bool disputed) external onlyRole(ARBITRATION_ROLE);
function refundToClient(uint256 orderId) external onlyRole(ARBITRATION_ROLE);
function releasePayment(uint256 orderId) external onlyRole(ARBITRATION_ROLE);
function cancelSlashing(uint256 orderId) external onlyRole(ARBITRATION_ROLE);
```

## Paramètres configurables

```solidity
// Minimum de voting power total requis
uint256 public minVotingPowerRequired = 1000 * 10**18; // 1000 DONE

// Durée de la phase de vote
uint256 public votingPeriod = 48 hours;

// Modification par ADMIN
function setMinVotingPower(uint256 newMin) external onlyRole(DEFAULT_ADMIN_ROLE);
function setVotingPeriod(uint256 newPeriod) external onlyRole(DEFAULT_ADMIN_ROLE);
```

## Gas Estimations

| Fonction | Gas estimé | Notes |
|----------|-----------|-------|
| createDispute | ~150,000 | Création + update order status |
| voteDispute | ~80,000 | Enregistrement vote + calculs |
| resolveDispute | ~200,000 | Transferts + updates multiples |
| getDispute | ~5,000 | Lecture seule |
| getVoteDistribution | ~8,000 | 3 lectures mapping |

## Améliorations futures

1. **Time-lock sur résolution**: Attendre automatiquement 48h avant résolution
2. **Quadratic voting**: Réduire l'influence des gros détenteurs (√tokens au lieu de tokens)
3. **Délégation de vote**: Permettre de déléguer son pouvoir de vote
4. **Stake pour voter**: Exiger un stake temporaire pour éviter le vote spam
5. **Reputation system**: Pondérer aussi par réputation on-chain
6. **Multi-sig arbitration**: Exiger plusieurs arbitres pour résoudre

## Avantages du système

**Décentralisation:**
- Pas d'autorité centrale
- Transparence totale on-chain
- Impossible de falsifier les résultats

**Incitation à la participation:**
- Les détenteurs de tokens sont incités à arbitrer équitablement
- Leur token prend de la valeur si la plateforme est juste

**Scalabilité:**
- Pas de goulot d'étranglement humain
- Résolution rapide (48h max)
- Automatisable

**DAO-like governance:**
- Base pour évoluer vers une vraie DAO
- Gouvernance communautaire
- Alignement des intérêts
