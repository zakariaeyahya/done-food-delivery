// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title DoneArbitration
 * @notice Systeme d'arbitrage decentralise par vote communautaire tokenise
 * @dev Transforme la plateforme en DAO-like avec token-weighted voting
 *
 * UTILISATION:
 * 1. Deployer apres DoneToken et DoneOrderManager
 * 2. Configurer setOrderManager() avec l'adresse de DoneOrderManager
 * 3. Donner le role ARBITRATION_ROLE a ce contrat dans DoneOrderManager
 * 4. Les litiges peuvent etre crees via createDispute() ou via DoneOrderManager
 *
 * WORKFLOW:
 * Client/Restaurant/Livreur -> createDispute() -> Communaute vote -> resolveDispute()
 */
contract DoneArbitration is AccessControl, ReentrancyGuard {

    // === ENUMS ===

    enum Winner {
        NONE,        // 0 - Pas encore decide
        CLIENT,      // 1 - Client gagne (remboursement)
        RESTAURANT,  // 2 - Restaurant gagne (paiement normal)
        DELIVERER    // 3 - Livreur gagne
    }

    enum DisputeStatus {
        OPEN,        // 0 - Litige ouvert
        VOTING,      // 1 - Phase de vote active
        RESOLVED,    // 2 - Litige resolu
        CANCELLED    // 3 - Litige annule
    }

    // === ROLES ===
    bytes32 public constant ARBITER_ROLE = keccak256("ARBITER_ROLE");
    bytes32 public constant PLATFORM_ROLE = keccak256("PLATFORM_ROLE");

    // === STRUCTS ===

    struct Dispute {
        uint256 orderId;
        address client;
        address restaurant;
        address deliverer;
        string reason;
        string evidenceIPFS;
        uint256 totalVotePower;
        Winner leadingWinner;
        DisputeStatus status;
        uint256 createdAt;
        uint256 votingDeadline;
        uint256 resolvedAt;
        uint256 escrowAmount;
    }

    struct Vote {
        address voter;
        Winner choice;
        uint256 votePower;
        uint256 timestamp;
    }

    // === STATE VARIABLES ===

    /// @notice Token DONE pour calculer le pouvoir de vote
    IERC20 public doneToken;

    /// @notice Adresse du DoneOrderManager
    address public orderManagerAddress;

    /// @notice Compteur de litiges
    uint256 public disputeCount;

    /// @notice Litiges par ID
    mapping(uint256 => Dispute) public disputes;

    /// @notice A vote sur ce litige?
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    /// @notice Votes par Winner
    mapping(uint256 => mapping(Winner => uint256)) public votes;

    /// @notice Liste des votants par litige
    mapping(uint256 => address[]) public disputeVoters;

    /// @notice Details du vote par votant
    mapping(uint256 => mapping(address => Vote)) public voterDetails;

    /// @notice Mapping orderId => disputeId
    mapping(uint256 => uint256) public orderToDispute;

    /// @notice Quorum minimum (1000 DONE par defaut)
    uint256 public minVotingPowerRequired = 1000 * 10**18;

    /// @notice Periode de vote (48h par defaut)
    uint256 public votingPeriod = 48 hours;

    /// @notice Minimum tokens pour voter (1 DONE)
    uint256 public minTokensToVote = 1 * 10**18;

    /// @notice Wallet plateforme
    address payable public platformWallet;

    /// @notice Frais d'arbitrage (5% par defaut)
    uint256 public arbitrationFeePercent = 5;

    // === EVENTS ===

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

    // === MODIFIERS ===

    modifier disputeExists(uint256 _disputeId) {
        require(_disputeId > 0 && _disputeId <= disputeCount, "Dispute not found");
        require(disputes[_disputeId].orderId > 0, "Invalid dispute");
        _;
    }

    modifier inVotingPhase(uint256 _disputeId) {
        require(
            disputes[_disputeId].status == DisputeStatus.VOTING,
            "Not in voting phase"
        );
        require(
            block.timestamp <= disputes[_disputeId].votingDeadline,
            "Voting period ended"
        );
        _;
    }

    // === CONSTRUCTOR ===

    /**
     * @notice Deployer le contrat d'arbitrage
     * @param _doneToken Adresse du token DONE (ERC20)
     * @param _platformWallet Adresse du wallet plateforme
     */
    constructor(address _doneToken, address payable _platformWallet) {
        require(_doneToken != address(0), "Invalid token address");
        require(_platformWallet != address(0), "Invalid platform wallet");

        doneToken = IERC20(_doneToken);
        platformWallet = _platformWallet;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ARBITER_ROLE, msg.sender);
        _grantRole(PLATFORM_ROLE, msg.sender);
    }

    // === FONCTIONS PRINCIPALES ===

    /**
     * @notice Creer un nouveau litige
     * @param _orderId ID de la commande
     * @param _client Adresse du client
     * @param _restaurant Adresse du restaurant
     * @param _deliverer Adresse du livreur
     * @param _reason Raison du litige
     * @param _evidenceIPFS Hash IPFS des preuves
     * @return disputeId ID du litige cree
     *
     * @dev Peut etre appele par:
     * - Une partie prenante (client, restaurant, livreur)
     * - Le contrat DoneOrderManager (via PLATFORM_ROLE)
     * - Un admin plateforme
     *
     * msg.value = montant a mettre en escrow (obligatoire)
     */
    function createDispute(
        uint256 _orderId,
        address _client,
        address _restaurant,
        address _deliverer,
        string calldata _reason,
        string calldata _evidenceIPFS
    ) external payable nonReentrant returns (uint256 disputeId) {
        // Verifier autorisation
        require(
            msg.sender == _client ||
            msg.sender == _restaurant ||
            msg.sender == _deliverer ||
            hasRole(PLATFORM_ROLE, msg.sender) ||
            msg.sender == orderManagerAddress,
            "Not authorized"
        );

        // Pas de doublon
        require(orderToDispute[_orderId] == 0, "Dispute already exists");

        // Escrow obligatoire
        require(msg.value > 0, "Escrow amount required");

        // Creer le litige
        disputeCount++;
        disputeId = disputeCount;

        disputes[disputeId] = Dispute({
            orderId: _orderId,
            client: _client,
            restaurant: _restaurant,
            deliverer: _deliverer,
            reason: _reason,
            evidenceIPFS: _evidenceIPFS,
            totalVotePower: 0,
            leadingWinner: Winner.NONE,
            status: DisputeStatus.VOTING,
            createdAt: block.timestamp,
            votingDeadline: block.timestamp + votingPeriod,
            resolvedAt: 0,
            escrowAmount: msg.value
        });

        orderToDispute[_orderId] = disputeId;

        emit DisputeCreated(
            disputeId,
            _orderId,
            msg.sender,
            _client,
            _restaurant,
            _deliverer,
            _reason,
            msg.value
        );

        return disputeId;
    }

    /**
     * @notice Voter sur un litige
     * @param _disputeId ID du litige
     * @param _winner Choix: CLIENT(1), RESTAURANT(2), ou DELIVERER(3)
     *
     * @dev Le pouvoir de vote = balance de tokens DONE
     * Les parties prenantes ne peuvent pas voter pour elles-memes
     */
    function voteDispute(
        uint256 _disputeId,
        Winner _winner
    ) external nonReentrant disputeExists(_disputeId) inVotingPhase(_disputeId) {
        Dispute storage dispute = disputes[_disputeId];

        // Pas de double vote
        require(!hasVoted[_disputeId][msg.sender], "Already voted");

        // Winner valide
        require(
            _winner == Winner.CLIENT ||
            _winner == Winner.RESTAURANT ||
            _winner == Winner.DELIVERER,
            "Invalid winner choice"
        );

        // Anti-fraude: pas de vote pour soi-meme
        if (msg.sender == dispute.client) {
            require(_winner != Winner.CLIENT, "Cannot vote for yourself");
        } else if (msg.sender == dispute.restaurant) {
            require(_winner != Winner.RESTAURANT, "Cannot vote for yourself");
        } else if (msg.sender == dispute.deliverer) {
            require(_winner != Winner.DELIVERER, "Cannot vote for yourself");
        }

        // Calculer pouvoir de vote
        uint256 votePower = doneToken.balanceOf(msg.sender);
        require(votePower >= minTokensToVote, "Insufficient voting power");

        // Enregistrer vote
        hasVoted[_disputeId][msg.sender] = true;
        votes[_disputeId][_winner] += votePower;
        dispute.totalVotePower += votePower;

        // Sauvegarder details
        disputeVoters[_disputeId].push(msg.sender);
        voterDetails[_disputeId][msg.sender] = Vote({
            voter: msg.sender,
            choice: _winner,
            votePower: votePower,
            timestamp: block.timestamp
        });

        // Mettre a jour leader
        _updateLeadingWinner(_disputeId);

        emit VoteCast(_disputeId, msg.sender, _winner, votePower);
    }

    /**
     * @notice Resoudre un litige apres la periode de vote
     * @param _disputeId ID du litige
     *
     * @dev Peut etre appele par n'importe qui apres la deadline
     * Ou par un ARBITER si le quorum est atteint
     */
    function resolveDispute(uint256 _disputeId)
        external
        nonReentrant
        disputeExists(_disputeId)
    {
        Dispute storage dispute = disputes[_disputeId];

        require(dispute.status == DisputeStatus.VOTING, "Not in voting phase");

        bool votingEnded = block.timestamp > dispute.votingDeadline;
        bool quorumReached = dispute.totalVotePower >= minVotingPowerRequired;
        bool isArbiter = hasRole(ARBITER_ROLE, msg.sender);

        require(
            votingEnded || (quorumReached && isArbiter),
            "Cannot resolve yet"
        );

        // Determiner gagnant
        Winner finalWinner = _determineFinalWinner(_disputeId);

        // En cas d'egalite, l'arbiter tranche
        if (finalWinner == Winner.NONE) {
            require(isArbiter, "Arbiter must resolve tie");
            finalWinner = Winner.CLIENT; // Protection consommateur
        }

        dispute.leadingWinner = finalWinner;
        dispute.status = DisputeStatus.RESOLVED;
        dispute.resolvedAt = block.timestamp;

        // Calculer et transferer
        address payable winnerAddress;
        uint256 amountToTransfer = dispute.escrowAmount;
        uint256 arbitrationFee = (amountToTransfer * arbitrationFeePercent) / 100;
        uint256 netAmount = amountToTransfer - arbitrationFee;

        if (finalWinner == Winner.CLIENT) {
            winnerAddress = payable(dispute.client);
        } else if (finalWinner == Winner.RESTAURANT) {
            winnerAddress = payable(dispute.restaurant);
        } else {
            winnerAddress = payable(dispute.deliverer);
        }

        // Transferer frais a la plateforme
        if (arbitrationFee > 0) {
            (bool feeSuccess, ) = platformWallet.call{value: arbitrationFee}("");
            require(feeSuccess, "Fee transfer failed");
        }

        // Transferer au gagnant
        (bool success, ) = winnerAddress.call{value: netAmount}("");
        require(success, "Winner transfer failed");

        emit DisputeResolved(
            _disputeId,
            dispute.orderId,
            finalWinner,
            dispute.totalVotePower,
            winnerAddress,
            netAmount
        );
    }

    /**
     * @notice Resolution manuelle par arbitre (cas urgents/egalite)
     * @param _disputeId ID du litige
     * @param _winner Gagnant choisi par l'arbitre
     */
    function resolveDisputeManual(uint256 _disputeId, Winner _winner)
        external
        onlyRole(ARBITER_ROLE)
        nonReentrant
        disputeExists(_disputeId)
    {
        Dispute storage dispute = disputes[_disputeId];

        require(dispute.status == DisputeStatus.VOTING, "Not in voting phase");
        require(_winner != Winner.NONE, "Invalid winner");

        dispute.leadingWinner = _winner;
        dispute.status = DisputeStatus.RESOLVED;
        dispute.resolvedAt = block.timestamp;

        address payable winnerAddress;
        uint256 amountToTransfer = dispute.escrowAmount;
        uint256 arbitrationFee = (amountToTransfer * arbitrationFeePercent) / 100;
        uint256 netAmount = amountToTransfer - arbitrationFee;

        if (_winner == Winner.CLIENT) {
            winnerAddress = payable(dispute.client);
        } else if (_winner == Winner.RESTAURANT) {
            winnerAddress = payable(dispute.restaurant);
        } else {
            winnerAddress = payable(dispute.deliverer);
        }

        if (arbitrationFee > 0) {
            (bool feeSuccess, ) = platformWallet.call{value: arbitrationFee}("");
            require(feeSuccess, "Fee transfer failed");
        }

        (bool success, ) = winnerAddress.call{value: netAmount}("");
        require(success, "Winner transfer failed");

        emit DisputeResolved(
            _disputeId,
            dispute.orderId,
            _winner,
            dispute.totalVotePower,
            winnerAddress,
            netAmount
        );
    }

    /**
     * @notice Annuler un litige et rembourser
     * @param _disputeId ID du litige
     * @param _reason Raison de l'annulation
     */
    function cancelDispute(uint256 _disputeId, string calldata _reason)
        external
        onlyRole(ARBITER_ROLE)
        nonReentrant
        disputeExists(_disputeId)
    {
        Dispute storage dispute = disputes[_disputeId];

        require(
            dispute.status == DisputeStatus.OPEN ||
            dispute.status == DisputeStatus.VOTING,
            "Cannot cancel"
        );

        dispute.status = DisputeStatus.CANCELLED;
        dispute.resolvedAt = block.timestamp;

        // Rembourser au client
        (bool success, ) = payable(dispute.client).call{value: dispute.escrowAmount}("");
        require(success, "Refund failed");

        delete orderToDispute[dispute.orderId];

        emit DisputeCancelled(_disputeId, dispute.orderId, _reason);
    }

    // === FONCTIONS VIEW ===

    function getDispute(uint256 _disputeId)
        external
        view
        disputeExists(_disputeId)
        returns (Dispute memory)
    {
        return disputes[_disputeId];
    }

    function getVoteDistribution(uint256 _disputeId)
        external
        view
        returns (
            uint256 clientVotes,
            uint256 restaurantVotes,
            uint256 delivererVotes
        )
    {
        clientVotes = votes[_disputeId][Winner.CLIENT];
        restaurantVotes = votes[_disputeId][Winner.RESTAURANT];
        delivererVotes = votes[_disputeId][Winner.DELIVERER];
    }

    function getUserVotingPower(address _user) external view returns (uint256) {
        return doneToken.balanceOf(_user);
    }

    function hasUserVoted(uint256 _disputeId, address _user) external view returns (bool) {
        return hasVoted[_disputeId][_user];
    }

    function getVoterCount(uint256 _disputeId) external view returns (uint256) {
        return disputeVoters[_disputeId].length;
    }

    function getDisputeVoters(uint256 _disputeId) external view returns (address[] memory) {
        return disputeVoters[_disputeId];
    }

    function getVoteDetails(uint256 _disputeId, address _voter)
        external
        view
        returns (Vote memory)
    {
        return voterDetails[_disputeId][_voter];
    }

    function canResolve(uint256 _disputeId) external view returns (bool) {
        if (_disputeId == 0 || _disputeId > disputeCount) return false;

        Dispute storage dispute = disputes[_disputeId];
        if (dispute.status != DisputeStatus.VOTING) return false;

        return block.timestamp > dispute.votingDeadline ||
               dispute.totalVotePower >= minVotingPowerRequired;
    }

    function getRemainingVotingTime(uint256 _disputeId) external view returns (uint256) {
        if (_disputeId == 0 || _disputeId > disputeCount) return 0;

        Dispute storage dispute = disputes[_disputeId];
        if (dispute.status != DisputeStatus.VOTING) return 0;
        if (block.timestamp >= dispute.votingDeadline) return 0;

        return dispute.votingDeadline - block.timestamp;
    }

    function getDisputeByOrder(uint256 _orderId) external view returns (uint256) {
        return orderToDispute[_orderId];
    }

    // === FONCTIONS INTERNES ===

    function _updateLeadingWinner(uint256 _disputeId) internal {
        Dispute storage dispute = disputes[_disputeId];

        uint256 clientVotes = votes[_disputeId][Winner.CLIENT];
        uint256 restaurantVotes = votes[_disputeId][Winner.RESTAURANT];
        uint256 delivererVotes = votes[_disputeId][Winner.DELIVERER];

        if (clientVotes >= restaurantVotes && clientVotes >= delivererVotes) {
            dispute.leadingWinner = Winner.CLIENT;
        } else if (restaurantVotes >= clientVotes && restaurantVotes >= delivererVotes) {
            dispute.leadingWinner = Winner.RESTAURANT;
        } else {
            dispute.leadingWinner = Winner.DELIVERER;
        }
    }

    function _determineFinalWinner(uint256 _disputeId) internal view returns (Winner) {
        uint256 clientVotes = votes[_disputeId][Winner.CLIENT];
        uint256 restaurantVotes = votes[_disputeId][Winner.RESTAURANT];
        uint256 delivererVotes = votes[_disputeId][Winner.DELIVERER];

        if (clientVotes == 0 && restaurantVotes == 0 && delivererVotes == 0) {
            return Winner.NONE;
        }

        uint256 maxVotes = clientVotes;
        Winner winner = Winner.CLIENT;

        if (restaurantVotes > maxVotes) {
            maxVotes = restaurantVotes;
            winner = Winner.RESTAURANT;
        }

        if (delivererVotes > maxVotes) {
            winner = Winner.DELIVERER;
        }

        // Verifier egalite
        if (
            (clientVotes == restaurantVotes && clientVotes == maxVotes) ||
            (clientVotes == delivererVotes && clientVotes == maxVotes) ||
            (restaurantVotes == delivererVotes && restaurantVotes == maxVotes)
        ) {
            return Winner.NONE;
        }

        return winner;
    }

    // === FONCTIONS ADMIN ===

    function setMinVotingPowerRequired(uint256 _newMinPower)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(_newMinPower > 0, "Must be greater than 0");
        minVotingPowerRequired = _newMinPower;
        emit ParametersUpdated(minVotingPowerRequired, votingPeriod, minTokensToVote);
    }

    function setVotingPeriod(uint256 _newPeriod)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(_newPeriod >= 1 hours, "Min 1 hour");
        require(_newPeriod <= 7 days, "Max 7 days");
        votingPeriod = _newPeriod;
        emit ParametersUpdated(minVotingPowerRequired, votingPeriod, minTokensToVote);
    }

    function setMinTokensToVote(uint256 _newMin)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        minTokensToVote = _newMin;
        emit ParametersUpdated(minVotingPowerRequired, votingPeriod, minTokensToVote);
    }

    function setArbitrationFee(uint256 _newFee)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(_newFee <= 20, "Max 20%");
        arbitrationFeePercent = _newFee;
    }

    function setPlatformWallet(address payable _newWallet)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(_newWallet != address(0), "Invalid address");
        platformWallet = _newWallet;
    }

    function setOrderManager(address _orderManager)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(_orderManager != address(0), "Invalid address");
        orderManagerAddress = _orderManager;
    }

    function addArbiter(address _arbiter)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _grantRole(ARBITER_ROLE, _arbiter);
    }

    function removeArbiter(address _arbiter)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _revokeRole(ARBITER_ROLE, _arbiter);
    }

    function emergencyWithdraw(uint256 _disputeId)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
        nonReentrant
    {
        Dispute storage dispute = disputes[_disputeId];
        require(dispute.escrowAmount > 0, "No funds");
        require(
            dispute.status == DisputeStatus.VOTING &&
            block.timestamp > dispute.votingDeadline + 30 days,
            "Cannot withdraw yet"
        );

        uint256 amount = dispute.escrowAmount;
        dispute.escrowAmount = 0;
        dispute.status = DisputeStatus.CANCELLED;

        (bool success, ) = platformWallet.call{value: amount}("");
        require(success, "Transfer failed");
    }

    receive() external payable {}
}
