// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DoneArbitration
 * @notice Système d'arbitrage décentralisé par vote communautaire tokenisé
 * @dev Transforme la plateforme en DAO-like avec token-weighted voting
 */

// TODO: Importer AccessControl et ReentrancyGuard d'OpenZeppelin
// import "@openzeppelin/contracts/access/AccessControl.sol";
// import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// TODO: Importer DoneToken et DoneOrderManager
// import "../DoneToken.sol";
// import "../DoneOrderManager.sol";

/**
 * @dev Contrat DoneArbitration hérite de AccessControl et ReentrancyGuard
 */
// TODO: Définir le contrat
// contract DoneArbitration is AccessControl, ReentrancyGuard {

    // === ENUMS ===
    
    /**
     * @notice Gagnant possible d'un litige
     */
    // TODO: Définir enum Winner
    // enum Winner {
    //     NONE,        // 0 - Pas encore décidé
    //     CLIENT,      // 1 - Client gagne (remboursement)
    //     RESTAURANT,  // 2 - Restaurant gagne (paiement normal)
    //     DELIVERER    // 3 - Livreur gagne (si slashing contesté)
    // }
    
    /**
     * @notice Statut d'un litige
     */
    // TODO: Définir enum DisputeStatus
    // enum DisputeStatus {
    //     OPEN,        // 0 - Litige ouvert, en attente de votes
    //     VOTING,      // 1 - Phase de vote active
    //     RESOLVED     // 2 - Litige résolu
    // }
    
    // === RÔLES ===
    
    // TODO: Définir ARBITER_ROLE
    // bytes32 public constant ARBITER_ROLE = keccak256("ARBITER_ROLE");
    
    // === STRUCTS ===
    
    /**
     * @notice Structure pour un litige
     */
    // TODO: Définir struct Dispute
    // struct Dispute {
    //     uint256 orderId;           // ID de la commande contestée
    //     address client;            // Adresse du client
    //     address restaurant;        // Adresse du restaurant
    //     address deliverer;         // Adresse du livreur
    //     string reason;             // Raison du litige
    //     string evidenceIPFS;       // Hash IPFS des preuves
    //     uint256 totalVotePower;    // Somme totale du pouvoir de vote
    //     Winner leadingWinner;      // Gagnant actuel (temporaire)
    //     DisputeStatus status;      // OPEN, VOTING, RESOLVED
    //     uint256 createdAt;         // Timestamp de création
    //     uint256 resolvedAt;        // Timestamp de résolution
    // }
    
    // === VARIABLES D'ÉTAT ===
    
    // TODO: Référence au contrat DoneToken
    // DoneToken public doneToken;
    
    // TODO: Référence au contrat DoneOrderManager
    // DoneOrderManager public orderManager;
    
    // TODO: Compteur de litiges
    // uint256 public disputeCount;
    
    // TODO: Mapping disputeId => Dispute
    // mapping(uint256 => Dispute) public disputes;
    
    // TODO: Mapping disputeId => address => bool (a voté?)
    // mapping(uint256 => mapping(address => bool)) public hasVoted;
    
    // TODO: Mapping disputeId => Winner => votePower
    // mapping(uint256 => mapping(Winner => uint256)) public votes;
    
    // TODO: Paramètres configurables
    // uint256 public minVotingPowerRequired = 1000 * 10**18; // 1000 DONE tokens
    // uint256 public votingPeriod = 48 hours; // 48 heures
    
    // === EVENTS ===
    
    /**
     * @notice Émis quand un litige est créé
     */
    // TODO: Définir event DisputeCreated
    // event DisputeCreated(
    //     uint256 indexed disputeId,
    //     uint256 indexed orderId,
    //     address client,
    //     string reason
    // );
    
    /**
     * @notice Émis quand un vote est enregistré
     */
    // TODO: Définir event VoteCast
    // event VoteCast(
    //     uint256 indexed disputeId,
    //     address indexed voter,
    //     Winner winner,
    //     uint256 votePower
    // );
    
    /**
     * @notice Émis quand un litige est résolu
     */
    // TODO: Définir event DisputeResolved
    // event DisputeResolved(
    //     uint256 indexed disputeId,
    //     Winner winner,
    //     uint256 totalVotePower
    // );
    
    // === CONSTRUCTOR ===
    
    /**
     * @notice Constructeur du contrat DoneArbitration
     * @param _doneToken Adresse du contrat DoneToken
     * @param _orderManager Adresse du contrat DoneOrderManager
     */
    // TODO: Implémenter constructor(address _doneToken, address _orderManager)
    // constructor(address _doneToken, address _orderManager) {
    //     // TODO: Valider adresses
    //     // require(_doneToken != address(0), "Invalid token address");
    //     // require(_orderManager != address(0), "Invalid order manager address");
    //     
    //     // TODO: Initialiser références
    //     // doneToken = DoneToken(_doneToken);
    //     // orderManager = DoneOrderManager(_orderManager);
    //     
    //     // TODO: Configurer rôles
    //     // _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    //     // _grantRole(ARBITER_ROLE, msg.sender);
    // }
    
    // === FONCTIONS PRINCIPALES ===
    
    /**
     * @notice Crée un nouveau litige pour une commande
     * @param orderId ID de la commande
     * @param reason Raison du litige
     * @param evidenceIPFS Hash IPFS des preuves
     * @return disputeId ID du litige créé
     * @dev Modifiers: nonReentrant
     * @dev Gas estimé: ~150,000
     */
    // TODO: Implémenter createDispute(uint256 orderId, string memory reason, string memory evidenceIPFS)
    // function createDispute(
    //     uint256 orderId,
    //     string memory reason,
    //     string memory evidenceIPFS
    // ) external nonReentrant returns (uint256 disputeId) {
    //     // TODO: Récupérer order depuis orderManager
    //     // Order memory order = orderManager.getOrder(orderId);
    //     // require(order.orderId == orderId, "Order not found");
    //     
    //     // TODO: Vérifier que l'appelant est partie prenante
    //     // require(
    //     //     msg.sender == order.client ||
    //     //     msg.sender == order.restaurant ||
    //     //     msg.sender == order.deliverer,
    //     //     "Not authorized"
    //     // );
    //     
    //     // TODO: Vérifier que la commande est disputable
    //     // require(
    //     //     order.status == OrderStatus.IN_DELIVERY ||
    //     //     order.status == OrderStatus.DELIVERED,
    //     //     "Cannot dispute at this stage"
    //     // );
    //     
    //     // TODO: Incrémenter disputeCount
    //     // disputeCount++;
    //     // disputeId = disputeCount;
    //     
    //     // TODO: Créer Dispute
    //     // disputes[disputeId] = Dispute({
    //     //     orderId: orderId,
    //     //     client: order.client,
    //     //     restaurant: order.restaurant,
    //     //     deliverer: order.deliverer,
    //     //     reason: reason,
    //     //     evidenceIPFS: evidenceIPFS,
    //     //     totalVotePower: 0,
    //     //     leadingWinner: Winner.NONE,
    //     //     status: DisputeStatus.VOTING,
    //     //     createdAt: block.timestamp,
    //     //     resolvedAt: 0
    //     // });
    //     
    //     // TODO: Mettre à jour statut order dans orderManager
    //     // orderManager.setDisputeStatus(orderId, true);
    //     
    //     // TODO: Émettre event DisputeCreated
    //     // emit DisputeCreated(disputeId, orderId, order.client, reason);
    //     
    //     // TODO: Retourner disputeId
    //     // return disputeId;
    // }
    
    /**
     * @notice Vote sur un litige
     * @param disputeId ID du litige
     * @param winner Gagnant choisi (CLIENT, RESTAURANT, ou DELIVERER)
     * @dev Modifiers: nonReentrant
     * @dev Gas estimé: ~80,000
     */
    // TODO: Implémenter voteDispute(uint256 disputeId, Winner winner)
    // function voteDispute(
    //     uint256 disputeId,
    //     Winner winner
    // ) external nonReentrant {
    //     // TODO: Récupérer Dispute
    //     // Dispute storage dispute = disputes[disputeId];
    //     
    //     // TODO: Vérifier que dispute existe
    //     // require(dispute.orderId > 0, "Dispute not found");
    //     
    //     // TODO: Vérifier que dispute est en VOTING
    //     // require(dispute.status == DisputeStatus.VOTING, "Not in voting phase");
    //     
    //     // TODO: Vérifier que l'utilisateur n'a pas déjà voté
    //     // require(!hasVoted[disputeId][msg.sender], "Already voted");
    //     
    //     // TODO: Vérifier que winner est valide
    //     // require(
    //     //     winner == Winner.CLIENT ||
    //     //     winner == Winner.RESTAURANT ||
    //     //     winner == Winner.DELIVERER,
    //     //     "Invalid winner choice"
    //     // );
    //     
    //     // TODO: Calculer votePower depuis balance tokens DONE
    //     // uint256 votePower = doneToken.balanceOf(msg.sender);
    //     // require(votePower > 0, "No voting power");
    //     
    //     // TODO: Enregistrer vote
    //     // hasVoted[disputeId][msg.sender] = true;
    //     // votes[disputeId][winner] += votePower;
    //     // dispute.totalVotePower += votePower;
    //     
    //     // TODO: Mettre à jour leadingWinner si nécessaire
    //     // SI votes[disputeId][winner] > votes[disputeId][dispute.leadingWinner]:
    //     //     dispute.leadingWinner = winner;
    //     
    //     // TODO: Émettre event VoteCast
    //     // emit VoteCast(disputeId, msg.sender, winner, votePower);
    // }
    
    /**
     * @notice Résout un litige après période de vote
     * @param disputeId ID du litige
     * @dev Modifiers: onlyRole(ARBITER_ROLE), nonReentrant
     * @dev Gas estimé: ~200,000
     */
    // TODO: Implémenter resolveDispute(uint256 disputeId)
    // function resolveDispute(uint256 disputeId) external onlyRole(ARBITER_ROLE) nonReentrant {
    //     // TODO: Récupérer Dispute
    //     // Dispute storage dispute = disputes[disputeId];
    //     
    //     // TODO: Vérifier que dispute est en VOTING
    //     // require(dispute.status == DisputeStatus.VOTING, "Not in voting phase");
    //     
    //     // TODO: Vérifier minimum voting power requis
    //     // require(dispute.totalVotePower >= minVotingPowerRequired, "Not enough votes");
    //     
    //     // TODO: Vérifier qu'il y a un gagnant clair
    //     // require(dispute.leadingWinner != Winner.NONE, "No clear winner");
    //     
    //     // TODO: Marquer dispute comme résolu
    //     // dispute.status = DisputeStatus.RESOLVED;
    //     // dispute.resolvedAt = block.timestamp;
    //     
    //     // TODO: Récupérer order depuis orderManager
    //     // Order memory order = orderManager.getOrder(dispute.orderId);
    //     
    //     // TODO: Transférer fonds selon gagnant
    //     // SI dispute.leadingWinner == Winner.CLIENT:
    //     //     // Remboursement complet au client
    //     //     orderManager.refundToClient(dispute.orderId);
    //     // SINON SI dispute.leadingWinner == Winner.RESTAURANT:
    //     //     // Paiement normal (split 70/20/10)
    //     //     orderManager.releasePayment(dispute.orderId);
    //     // SINON SI dispute.leadingWinner == Winner.DELIVERER:
    //     //     // Annuler slashing et payer normalement
    //     //     orderManager.cancelSlashing(dispute.orderId);
    //     //     orderManager.releasePayment(dispute.orderId);
    //     
    //     // TODO: Mettre à jour statut dispute dans orderManager
    //     // orderManager.setDisputeStatus(dispute.orderId, false);
    //     
    //     // TODO: Émettre event DisputeResolved
    //     // emit DisputeResolved(disputeId, dispute.leadingWinner, dispute.totalVotePower);
    // }
    
    /**
     * @notice Récupère les détails d'un litige
     * @param disputeId ID du litige
     * @return dispute Structure Dispute complète
     */
    // TODO: Implémenter getDispute(uint256 disputeId)
    // function getDispute(uint256 disputeId) external view returns (Dispute memory) {
    //     // TODO: Valider disputeId
    //     // require(disputeId > 0 && disputeId <= disputeCount, "Invalid disputeId");
    //     
    //     // TODO: Retourner disputes[disputeId]
    //     // return disputes[disputeId];
    // }
    
    /**
     * @notice Récupère la distribution des votes pour un litige
     * @param disputeId ID du litige
     * @return clientVotes Votes pour CLIENT
     * @return restaurantVotes Votes pour RESTAURANT
     * @return delivererVotes Votes pour DELIVERER
     */
    // TODO: Implémenter getVoteDistribution(uint256 disputeId)
    // function getVoteDistribution(uint256 disputeId) external view returns (
    //     uint256 clientVotes,
    //     uint256 restaurantVotes,
    //     uint256 delivererVotes
    // ) {
    //     // TODO: Récupérer votes pour chaque Winner
    //     // clientVotes = votes[disputeId][Winner.CLIENT];
    //     // restaurantVotes = votes[disputeId][Winner.RESTAURANT];
    //     // delivererVotes = votes[disputeId][Winner.DELIVERER];
    //     
    //     // TODO: Retourner (clientVotes, restaurantVotes, delivererVotes)
    //     // return (clientVotes, restaurantVotes, delivererVotes);
    // }
    
    /**
     * @notice Calcule le pouvoir de vote d'un utilisateur
     * @param user Adresse de l'utilisateur
     * @return votePower Pouvoir de vote (balance tokens DONE)
     */
    // TODO: Implémenter getUserVotingPower(address user)
    // function getUserVotingPower(address user) external view returns (uint256) {
    //     // TODO: Retourner balance tokens DONE
    //     // return doneToken.balanceOf(user);
    // }
    
    // === FONCTIONS ADMIN (onlyOwner) ===
    
    /**
     * @notice Modifie le minimum voting power requis
     * @param newMinPower Nouveau minimum (en wei)
     * @dev Modifiers: onlyRole(DEFAULT_ADMIN_ROLE)
     */
    // TODO: Implémenter setMinVotingPowerRequired(uint256 newMinPower)
    // function setMinVotingPowerRequired(uint256 newMinPower) external onlyRole(DEFAULT_ADMIN_ROLE) {
    //     // TODO: Valider newMinPower > 0
    //     // require(newMinPower > 0, "Min power must be greater than 0");
    //     
    //     // TODO: Mettre à jour minVotingPowerRequired
    //     // minVotingPowerRequired = newMinPower;
    // }
    
    /**
     * @notice Modifie la période de vote
     * @param newPeriod Nouvelle période (en secondes)
     * @dev Modifiers: onlyRole(DEFAULT_ADMIN_ROLE)
     */
    // TODO: Implémenter setVotingPeriod(uint256 newPeriod)
    // function setVotingPeriod(uint256 newPeriod) external onlyRole(DEFAULT_ADMIN_ROLE) {
    //     // TODO: Valider newPeriod > 0
    //     // require(newPeriod > 0, "Period must be greater than 0");
    //     
    //     // TODO: Mettre à jour votingPeriod
    //     // votingPeriod = newPeriod;
    // }
// }

