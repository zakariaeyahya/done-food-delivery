# Contracts - Governance

Documentation detaillee du systeme de gouvernance decentralisee pour l'arbitrage des litiges.

## Vue d'ensemble

Le dossier `governance/` contient le smart contract permettant l'arbitrage decentralise des litiges via un systeme de vote tokenise. Ce systeme transforme la plateforme en une organisation decentralisee (DAO-like) ou les detenteurs de tokens DONE peuvent participer aux decisions d'arbitrage.

## Statut

| Contrat | Statut | Version |
|---------|--------|---------|
| DoneArbitration.sol | **Implemente** | 1.0.0 |

## Architecture

Le systeme de gouvernance utilise le **token-weighted voting** :
- Chaque detenteur de tokens DONE peut voter sur les litiges
- Le pouvoir de vote est proportionnel a la quantite de tokens possedes
- Plus un utilisateur contribue a la plateforme, plus son vote a de poids
- Les decisions sont transparentes et enregistrees on-chain

## DoneArbitration.sol

Smart contract gerant le systeme d'arbitrage decentralise par vote communautaire.

### Caracteristiques Implementees

- **Vote pondere par tokens DONE** : Pouvoir de vote = balance DONE
- **Periode de vote configurable** : 48 heures par defaut (1h min, 7 jours max)
- **Quorum configurable** : 1000 DONE minimum par defaut
- **Resolution automatique** : Apres periode de vote ou quorum atteint
- **Resolution manuelle** : Par arbitre en cas d'egalite ou urgence
- **Frais d'arbitrage** : 5% des fonds en litige vont a la plateforme
- **Protection anti-fraude** : Les parties ne peuvent pas voter pour elles-memes
- **Annulation** : Possibilite d'annuler un litige avec remboursement
- **Retrait d'urgence** : Recuperation des fonds bloques apres 30 jours

### Dependencies

```solidity
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../contracts/DoneToken.sol";
```

### Enums

```solidity
enum Winner {
    NONE,        // 0 - Pas encore decide
    CLIENT,      // 1 - Client gagne (remboursement)
    RESTAURANT,  // 2 - Restaurant gagne (paiement normal)
    DELIVERER    // 3 - Livreur gagne (si slashing conteste)
}

enum DisputeStatus {
    OPEN,        // 0 - Litige ouvert
    VOTING,      // 1 - Phase de vote active
    RESOLVED,    // 2 - Litige resolu
    CANCELLED    // 3 - Litige annule
}
```

### Structs

```solidity
struct Dispute {
    uint256 orderId;           // ID de la commande contestee
    address client;            // Adresse du client
    address restaurant;        // Adresse du restaurant
    address deliverer;         // Adresse du livreur
    string reason;             // Raison du litige
    string evidenceIPFS;       // Hash IPFS des preuves
    uint256 totalVotePower;    // Somme totale du pouvoir de vote
    Winner leadingWinner;      // Gagnant actuel
    DisputeStatus status;      // Statut du litige
    uint256 createdAt;         // Timestamp de creation
    uint256 votingDeadline;    // Deadline pour voter
    uint256 resolvedAt;        // Timestamp de resolution
    uint256 escrowAmount;      // Montant bloque en escrow
}

struct Vote {
    address voter;
    Winner choice;
    uint256 votePower;
    uint256 timestamp;
}
```

### Events

```solidity
event DisputeCreated(
    uint256 indexed disputeId,
    uint256 indexed orderId,
    address indexed initiator,
    address client,
    address restaurant,
    address deliverer,
    string reason,
    uint256 escrowAmount
);

event VoteCast(
    uint256 indexed disputeId,
    address indexed voter,
    Winner winner,
    uint256 votePower
);

event DisputeResolved(
    uint256 indexed disputeId,
    uint256 indexed orderId,
    Winner winner,
    uint256 totalVotePower,
    address winnerAddress,
    uint256 amountTransferred
);

event DisputeCancelled(
    uint256 indexed disputeId,
    uint256 indexed orderId,
    string reason
);

event ParametersUpdated(
    uint256 minVotingPower,
    uint256 votingPeriod,
    uint256 minTokensToVote
);
```

### Roles

| Role | Description |
|------|-------------|
| `DEFAULT_ADMIN_ROLE` | Administration complete du contrat |
| `ARBITER_ROLE` | Peut resoudre manuellement les litiges |
| `PLATFORM_ROLE` | Peut creer des litiges au nom des utilisateurs |

### Fonctions Principales

#### createDispute

Cree un nouveau litige pour une commande.

```solidity
function createDispute(
    uint256 _orderId,
    address _client,
    address _restaurant,
    address _deliverer,
    string calldata _reason,
    string calldata _evidenceIPFS
) external payable nonReentrant returns (uint256 disputeId)
```

**Parametres:**
- `_orderId`: ID de la commande contestee
- `_client`: Adresse du client
- `_restaurant`: Adresse du restaurant
- `_deliverer`: Adresse du livreur
- `_reason`: Raison du litige
- `_evidenceIPFS`: Hash IPFS des preuves

**Requirements:**
- Appelant doit etre partie prenante ou PLATFORM_ROLE
- Pas de litige existant pour cette commande
- `msg.value` > 0 (montant en escrow)

**Gas estime:** ~200,000

#### voteDispute

Permet aux detenteurs de tokens DONE de voter sur un litige.

```solidity
function voteDispute(
    uint256 _disputeId,
    Winner _winner
) external nonReentrant
```

**Requirements:**
- Litige en phase VOTING
- Utilisateur n'a pas deja vote
- Winner valide (CLIENT, RESTAURANT, ou DELIVERER)
- Balance DONE >= minTokensToVote
- Parties prenantes ne peuvent pas voter pour elles-memes

**Gas estime:** ~80,000

#### resolveDispute

Resout un litige apres periode de vote.

```solidity
function resolveDispute(uint256 _disputeId) external nonReentrant
```

**Conditions de resolution:**
1. Periode de vote terminee, OU
2. Quorum atteint ET appelant est ARBITER

**Gas estime:** ~150,000

#### resolveDisputeManual

Resolution forcee par un arbitre.

```solidity
function resolveDisputeManual(uint256 _disputeId, Winner _winner)
    external
    onlyRole(ARBITER_ROLE)
    nonReentrant
```

**Gas estime:** ~130,000

#### cancelDispute

Annule un litige et rembourse l'escrow au client.

```solidity
function cancelDispute(uint256 _disputeId, string calldata _reason)
    external
    onlyRole(ARBITER_ROLE)
    nonReentrant
```

### Fonctions View

| Fonction | Description |
|----------|-------------|
| `getDispute(disputeId)` | Recupere les details d'un litige |
| `getVoteDistribution(disputeId)` | Distribution des votes |
| `getUserVotingPower(user)` | Pouvoir de vote d'un utilisateur |
| `hasUserVoted(disputeId, user)` | Verifie si l'utilisateur a vote |
| `getVoterCount(disputeId)` | Nombre de votants |
| `getDisputeVoters(disputeId)` | Liste des votants |
| `getVoteDetails(disputeId, voter)` | Details du vote d'un utilisateur |
| `canResolve(disputeId)` | Verifie si le litige peut etre resolu |
| `getRemainingVotingTime(disputeId)` | Temps restant pour voter |
| `getDisputeByOrder(orderId)` | Recupere le disputeId pour une commande |

### Fonctions Admin

| Fonction | Description |
|----------|-------------|
| `setMinVotingPowerRequired(uint256)` | Modifier le quorum minimum |
| `setVotingPeriod(uint256)` | Modifier la periode de vote |
| `setMinTokensToVote(uint256)` | Modifier le minimum pour voter |
| `setArbitrationFee(uint256)` | Modifier les frais (max 20%) |
| `setPlatformWallet(address)` | Modifier le wallet plateforme |
| `setOrderManager(address)` | Configurer le OrderManager |
| `addArbiter(address)` | Ajouter un arbitre |
| `removeArbiter(address)` | Retirer un arbitre |
| `emergencyWithdraw(disputeId)` | Recuperation d'urgence (30j+) |

### Parametres Configurables

| Parametre | Valeur par defaut | Min | Max |
|-----------|-------------------|-----|-----|
| `minVotingPowerRequired` | 1000 DONE | > 0 | - |
| `votingPeriod` | 48 hours | 1 hour | 7 days |
| `minTokensToVote` | 1 DONE | 0 | - |
| `arbitrationFeePercent` | 5% | 0 | 20% |

## Workflow d'arbitrage

```
1. Creation du litige
   Partie prenante → createDispute{value: escrow}(...)
   ↓
   Dispute cree avec status = VOTING
   votingDeadline = now + 48h

2. Phase de vote (48h)
   Detenteurs DONE → voteDispute(disputeId, winner)
   ↓
   Votes ponderes enregistres
   leadingWinner mis a jour en temps reel
   Les parties ne peuvent pas voter pour elles-memes

3. Resolution
   a) Automatique apres deadline:
      Anyone → resolveDispute(disputeId)

   b) Resolution rapide (quorum atteint):
      ARBITER → resolveDispute(disputeId)

   c) Resolution manuelle (egalite/urgence):
      ARBITER → resolveDisputeManual(disputeId, winner)
   ↓
   Verification: quorum OU deadline passe
   Si egalite: ARBITER tranche (favorise CLIENT par defaut)

4. Transfert des fonds
   - 5% frais → platformWallet
   - 95% net → winnerAddress
   ↓
   status = RESOLVED
```

## Securite

### Protections implementees

| Protection | Description |
|------------|-------------|
| ReentrancyGuard | Protection contre les attaques de reentrance |
| AccessControl | Gestion granulaire des permissions |
| Checks-Effects-Interactions | Pattern respecte pour les transferts |
| Input validation | Toutes les entrees sont validees |
| Self-voting prevention | Les parties ne peuvent pas voter pour elles-memes |
| Double voting prevention | Impossible de voter deux fois |

### Considerations

1. **Manipulation des votes**: Utilisateurs pourraient acheter tokens avant vote
   - Solution: Implementer un snapshot des balances (evolution future)

2. **Sybil Attack**: Plusieurs wallets pour un utilisateur
   - Solution: Cout en tokens DONE rend cela non viable

3. **Collusion**: Parties pourraient s'entendre
   - Solution: Surveillance par communaute et arbitres humains

## Gas Estimations

| Fonction | Gas estime |
|----------|-----------|
| createDispute | ~200,000 |
| voteDispute | ~80,000 |
| resolveDispute | ~150,000 |
| resolveDisputeManual | ~130,000 |
| cancelDispute | ~90,000 |
| getDispute | ~5,000 |
| getVoteDistribution | ~8,000 |

## Deploiement

### Prerequis

- DoneToken.sol deploye
- Adresse du wallet plateforme

### Script de deploiement

```javascript
const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();

    // Adresses prerequis
    const doneTokenAddress = "0x...";
    const platformWallet = deployer.address;

    // Deployer DoneArbitration
    const DoneArbitration = await ethers.getContractFactory("DoneArbitration");
    const arbitration = await DoneArbitration.deploy(
        doneTokenAddress,
        platformWallet
    );
    await arbitration.waitForDeployment();

    console.log("DoneArbitration deployed to:", await arbitration.getAddress());
}

main().catch(console.error);
```

### Configuration post-deploiement

```javascript
// 1. Ajouter des arbitres
await arbitration.addArbiter(arbiterAddress);

// 2. Configurer le OrderManager (optionnel)
await arbitration.setOrderManager(orderManagerAddress);

// 3. Ajuster les parametres si necessaire
await arbitration.setVotingPeriod(24 * 3600); // 24h
await arbitration.setMinVotingPowerRequired(ethers.parseEther("500")); // 500 DONE
await arbitration.setArbitrationFee(3); // 3%
```

## Tests

```bash
# Executer les tests
npx hardhat test test/governance/DoneArbitration.test.js

# Coverage
npx hardhat coverage --testfiles "test/governance/*.js"
```

### Scenarios de test recommandes

1. **Flux normal**: Creation → Vote → Resolution
2. **Egalite**: Resolution manuelle par arbitre
3. **Timeout**: Resolution apres expiration periode
4. **Annulation**: Annulation avant resolution
5. **Self-voting**: Verification que parties ne peuvent pas voter pour elles
6. **Double vote**: Verification qu'on ne peut pas voter deux fois
7. **Quorum insuffisant**: Gestion des cas sans assez de votes
8. **Emergency withdraw**: Recuperation apres 30 jours

## Evolutions futures

1. **Snapshot voting**: Figer les balances au moment de la creation du litige
2. **Delegation de vote**: Permettre de deleguer son pouvoir de vote
3. **Quadratic voting**: Reduire l'influence des gros detenteurs
4. **Recompenses pour votants**: Recompenser les votants avec tokens DONE
5. **Systeme d'appel**: Permettre de faire appel d'une decision
6. **Multi-signature arbitrage**: Requrir plusieurs arbitres pour les gros montants
7. **Reputation system**: Ponderer aussi par reputation on-chain

## Integration avec DoneOrderManager

Le contrat s'integre avec DoneOrderManager:

```solidity
// Dans DoneOrderManager
function openDisputeWithArbitration(
    uint256 _orderId,
    string memory _reason,
    string memory _evidenceIPFS
) external payable {
    Order storage order = orders[_orderId];
    require(order.status == OrderStatus.IN_DELIVERY, "Invalid state");
    require(msg.value == order.totalAmount, "Must send full amount");

    // Creer le litige dans DoneArbitration
    uint256 disputeId = arbitrationContract.createDispute{value: msg.value}(
        _orderId,
        order.client,
        order.restaurant,
        order.deliverer,
        _reason,
        _evidenceIPFS
    );

    order.status = OrderStatus.DISPUTED;
    order.disputed = true;

    emit DisputeOpened(_orderId, msg.sender);
}
```

## Licence

MIT License - Voir le fichier LICENSE a la racine du projet.
