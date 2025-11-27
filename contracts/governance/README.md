# Dossier contracts/governance/

Ce dossier contient le système de gouvernance décentralisée pour la résolution des litiges. Au lieu d'avoir un administrateur centralisé qui résout les litiges, ce système permet à la communauté de voter pour résoudre les disputes de manière transparente et décentralisée.

## Fichiers

### DoneArbitration.sol
**Rôle** : Système d'arbitrage décentralisé basé sur le vote de la communauté.

**Fonctionnalités principales** :

#### Struct Dispute
```solidity
struct Dispute {
    uint256 id;                    // ID unique du litige
    uint256 orderId;               // ID de la commande en litige
    address client;                // Adresse du client
    address restaurant;            // Adresse du restaurant
    address deliverer;              // Adresse du livreur
    string reason;                 // Raison du litige
    string evidence;               // Preuve (hash IPFS)
    uint256 createdAt;            // Timestamp de création
    bool resolved;                 // True si résolu
    mapping(address => Vote) votes; // Votes des participants
    uint256 clientVotes;           // Nombre de votes pour le client
    uint256 restaurantVotes;       // Nombre de votes pour le restaurant
    uint256 delivererVotes;        // Nombre de votes pour le livreur
    address winner;                // Gagnant après résolution
}
```

#### Fonctions principales

**1. createDispute(orderId, reason, evidence)**
- Crée un nouveau litige pour une commande
- Enregistre les parties impliquées (client, restaurant, livreur)
- Stocke la raison et les preuves (hash IPFS)
- Gèle les fonds de la commande jusqu'à résolution

**2. voteDispute(disputeId, winner)**
- Permet à un votant de voter pour résoudre un litige
- Le pouvoir de vote est basé sur la quantité de tokens DONE possédés
- Plus un utilisateur a de tokens DONE, plus son vote est puissant
- Les votants choisissent entre : client, restaurant, ou livreur
- Un utilisateur ne peut voter qu'une fois par litige

**3. resolveDispute(disputeId)**
- Clôture le litige après une période de vote
- Détermine le gagnant selon le nombre de votes pondérés
- Transfère les fonds au gagnant selon la décision
- Émet un événement avec le résultat

**4. getVotingPower(address)**
- Retourne le pouvoir de vote d'un utilisateur
- Basé sur le nombre de tokens DONE possédés
- Formule : votingPower = tokenBalance / 100 (exemple)

## Système de Vote

### Pouvoir de Vote
Le pouvoir de vote est basé sur la quantité de tokens DONE possédés :
- **1 token DONE = 1 vote**
- Les utilisateurs qui ont contribué plus à la plateforme (plus de tokens) ont plus d'influence
- Cela encourage l'engagement et la participation active

### Processus de Vote
1. Un litige est créé pour une commande
2. Les membres de la communauté peuvent voter pendant une période (ex: 48h)
3. Chaque vote est pondéré par le nombre de tokens DONE du votant
4. Après la période de vote, le litige est résolu automatiquement
5. Les fonds sont transférés au gagnant selon la décision

### Options de Vote
- **CLIENT_WINS** : Le client gagne, remboursement complet
- **RESTAURANT_WINS** : Le restaurant gagne, split normal (70/20/10)
- **DELIVERER_WINS** : Le livreur gagne, split normal (70/20/10)
- **SPLIT_PARTIAL** : Répartition personnalisée selon le cas

## Avantages

### Décentralisation
- Plus besoin d'un administrateur centralisé
- La communauté décide collectivement
- Transparence totale : tous les votes sont enregistrés on-chain

### Impartialité
- Les votes sont publics et vérifiables
- Impossible de falsifier les votes
- Système résistant à la censure

### Engagement
- Encourage les utilisateurs à participer activement
- Récompense les utilisateurs fidèles (plus de tokens = plus de pouvoir)
- Crée une vraie communauté autour de la plateforme

### Automatisation
- Résolution automatique après la période de vote
- Pas d'intervention manuelle nécessaire
- Réduit les délais de résolution

## Intégration

### Avec DoneOrderManager
- Le contrat DoneOrderManager peut ouvrir un litige via `openDispute()`
- DoneArbitration gère la résolution
- Une fois résolu, DoneOrderManager libère les fonds

### Avec DoneToken
- Le pouvoir de vote dépend du nombre de tokens DONE
- Les utilisateurs actifs (plus de tokens) ont plus d'influence
- Encourage l'utilisation et l'accumulation de tokens

### Backend
- Le service `arbitrationService.js` gère les interactions
- Crée les litiges
- Récupère les votes
- Déclenche la résolution

## Sécurité

- **Contrôle d'accès** : Seuls les utilisateurs avec des tokens peuvent voter
- **Une seule voix** : Un utilisateur ne peut voter qu'une fois par litige
- **Période de vote** : Limite le temps pour éviter les blocages
- **Vérification** : Les votes sont vérifiés avant comptage
- **Immuabilité** : Une fois voté, le vote ne peut être modifié

## Événements

```solidity
event DisputeCreated(uint256 indexed disputeId, uint256 indexed orderId);
event VoteCasted(uint256 indexed disputeId, address indexed voter, address winner, uint256 votingPower);
event DisputeResolved(uint256 indexed disputeId, address winner, uint256 amount);
```

## Utilisation

1. **Créer un litige** :
   - Le client, restaurant ou livreur crée un litige via `createDispute()`
   - Les fonds sont gelés automatiquement

2. **Voter** :
   - Les membres de la communauté votent via `voteDispute()`
   - Le vote est pondéré par le nombre de tokens DONE

3. **Résoudre** :
   - Après la période de vote, `resolveDispute()` est appelé
   - Les fonds sont transférés au gagnant
   - Le litige est marqué comme résolu

## Déploiement

Le contrat DoneArbitration doit être déployé après :
1. DoneToken (nécessaire pour le pouvoir de vote)
2. DoneOrderManager (nécessaire pour geler les fonds)

Le contrat est ensuite configuré avec les adresses des autres contrats.

