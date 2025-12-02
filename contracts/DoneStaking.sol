// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// === IMPORTS ===
// TODO: Importer AccessControl d'OpenZeppelin
// import "@openzeppelin/contracts/access/AccessControl.sol";
// TODO: Importer ReentrancyGuard d'OpenZeppelin
// import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title DoneStaking
 * @notice Gestion du staking des livreurs pour garantir leur fiabilité
 * @dev Protection contre les annulations abusives et fraudes
 * @dev Minimum: 0.1 ETH requis pour être livreur
 */
contract DoneStaking {
    // TODO: Hériter de AccessControl et ReentrancyGuard
    // contract DoneStaking is AccessControl, ReentrancyGuard {

    // === RÔLES ===
    // TODO: Définir le rôle PLATFORM_ROLE
    // bytes32 public constant PLATFORM_ROLE = keccak256("PLATFORM_ROLE");

    // === CONSTANTES ===
    // TODO: Définir le minimum de stake
    // uint256 public constant MINIMUM_STAKE = 0.1 ether;  // 0.1 ETH minimum

    // === STATE VARIABLES ===
    // TODO: Définir le mapping pour stocker les montants stakés
    // mapping(address => uint256) public stakedAmount;  // deliverer => montant staké
    
    // TODO: Définir le mapping pour vérifier si un livreur est staké
    // mapping(address => bool) private isStaked;         // deliverer => est staké? (private pour éviter conflit avec fonction isStaked())

    // === EVENTS ===
    // TODO: Définir l'event Staked
    // event Staked(address indexed deliverer, uint256 amount);
    
    // TODO: Définir l'event Unstaked
    // event Unstaked(address indexed deliverer, uint256 amount);
    
    // TODO: Définir l'event Slashed
    // event Slashed(address indexed deliverer, uint256 amount, address platform);

    // === CONSTRUCTOR ===
    /**
     * @notice Constructeur du contrat DoneStaking
     * @dev TODO: Configurer DEFAULT_ADMIN_ROLE pour msg.sender
     * @dev TODO: Configurer PLATFORM_ROLE pour msg.sender
     */
    constructor() {
        // TODO: _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        // TODO: _grantRole(PLATFORM_ROLE, msg.sender);
    }

    // === FONCTIONS PRINCIPALES ===

    /**
     * @notice Staker en tant que livreur (minimum 0.1 ETH requis)
     * @dev TODO: Implémenter la fonction stakeAsDeliverer
     * 
     * Validations:
     * - msg.value >= MINIMUM_STAKE (0.1 ETH)
     * - isStaked[msg.sender] == false (pas déjà staké)
     * 
     * Actions:
     * - Incrémenter stakedAmount[msg.sender] += msg.value
     * - Mettre isStaked[msg.sender] = true
     * - Émettre event Staked
     * 
     * Sécurité:
     * - Utiliser nonReentrant modifier
     * - Les fonds sont stockés dans le contrat
     * 
     * @dev payable: Le livreur envoie des ETH avec la transaction
     */
    function stakeAsDeliverer() external payable {
        // TODO: Ajouter modifier nonReentrant
        
        // TODO: 1. Vérifier msg.value >= MINIMUM_STAKE
        // require(msg.value >= MINIMUM_STAKE, "Staking: Minimum stake is 0.1 ETH");
        
        // TODO: 2. Vérifier isStaked[msg.sender] == false
        // require(!isStaked[msg.sender], "Staking: Already staked");
        
        // TODO: 3. Incrémenter stakedAmount[msg.sender] += msg.value
        // stakedAmount[msg.sender] += msg.value;
        
        // TODO: 4. Mettre isStaked[msg.sender] = true
        // isStaked[msg.sender] = true;
        
        // TODO: 5. Émettre event Staked
        // emit Staked(msg.sender, msg.value);
    }

    /**
     * @notice Retirer son stake (si pas de livraison active)
     * @dev TODO: Implémenter la fonction unstake
     * 
     * Validations:
     * - isStaked[msg.sender] == true
     * 
     * Actions:
     * - Capturer amount = stakedAmount[msg.sender]
     * - Mettre stakedAmount[msg.sender] = 0
     * - Mettre isStaked[msg.sender] = false
     * - Transférer amount à msg.sender via call{value}
     * - Vérifier succès du transfert
     * - Émettre event Unstaked
     * 
     * Sécurité:
     * - Utiliser nonReentrant modifier
     * - Pattern Checks-Effects-Interactions: mettre à jour l'état avant le transfert
     * 
     * Note: En production, on pourrait ajouter une vérification qu'il n'y a pas de livraison active
     */
    function unstake() external {
        // TODO: Ajouter modifier nonReentrant
        
        // TODO: 1. Vérifier isStaked[msg.sender] == true
        // require(isStaked[msg.sender], "Staking: Not staked");
        
        // TODO: 2. Capturer amount = stakedAmount[msg.sender]
        // uint256 amount = stakedAmount[msg.sender];
        
        // TODO: 3. Mettre stakedAmount[msg.sender] = 0 (avant le transfert pour éviter réentrance)
        // stakedAmount[msg.sender] = 0;
        
        // TODO: 4. Mettre isStaked[msg.sender] = false
        // isStaked[msg.sender] = false;
        
        // TODO: 5. Transférer amount à msg.sender via call{value}
        // (bool success, ) = msg.sender.call{value: amount}("");
        // require(success, "Staking: Transfer failed");
        
        // TODO: 6. Émettre event Unstaked
        // emit Unstaked(msg.sender, amount);
    }

    /**
     * @notice Slasher un livreur en cas d'abus (PLATFORM_ROLE uniquement)
     * @dev TODO: Implémenter la fonction slash
     * 
     * Validations:
     * - msg.sender a le rôle PLATFORM_ROLE (modifier onlyRole)
     * - isStaked[deliverer] == true
     * - amount <= stakedAmount[deliverer]
     * 
     * Actions:
     * - Décrémenter stakedAmount[deliverer] -= amount
     * - Si stakedAmount[deliverer] == 0, mettre isStaked[deliverer] = false
     * - Transférer amount à msg.sender (platform) via call{value}
     * - Vérifier succès du transfert
     * - Émettre event Slashed
     * 
     * Sécurité:
     * - Utiliser nonReentrant modifier
     * - Seul PLATFORM_ROLE peut slasher
     * - Pattern Checks-Effects-Interactions
     * 
     * @param deliverer Adresse du livreur à slasher
     * @param amount Montant à slasher (en wei)
     */
    function slash(address deliverer, uint256 amount) external {
        // TODO: Ajouter modifier onlyRole(PLATFORM_ROLE) et nonReentrant
        
        // TODO: 1. Vérifier isStaked[deliverer] == true
        // require(isStaked[deliverer], "Staking: Deliverer not staked");
        
        // TODO: 2. Vérifier amount <= stakedAmount[deliverer]
        // require(amount <= stakedAmount[deliverer], "Staking: Amount exceeds stake");
        
        // TODO: 3. Décrémenter stakedAmount[deliverer] -= amount
        // stakedAmount[deliverer] -= amount;
        
        // TODO: 4. Si stakedAmount[deliverer] == 0, mettre isStaked[deliverer] = false
        // if (stakedAmount[deliverer] == 0) {
        //     isStaked[deliverer] = false;
        // }
        
        // TODO: 5. Transférer amount à msg.sender (platform) via call{value}
        // (bool success, ) = msg.sender.call{value: amount}("");
        // require(success, "Staking: Transfer failed");
        
        // TODO: 6. Émettre event Slashed
        // emit Slashed(deliverer, amount, msg.sender);
    }

    // === FONCTIONS VIEW ===

    /**
     * @notice Vérifier si un livreur est staké
     * @dev TODO: Retourner isStaked[deliverer]
     * @param deliverer Adresse du livreur
     * @return bool True si le livreur est staké
     */
    function isDelivererStaked(address deliverer) external view returns (bool) {
        // TODO: return isStaked[deliverer];
    }

    /**
     * @notice Récupérer le montant staké d'un livreur
     * @dev TODO: Retourner stakedAmount[deliverer]
     * @param deliverer Adresse du livreur
     * @return uint256 Montant staké (en wei)
     */
    function getStakedAmount(address deliverer) external view returns (uint256) {
        // TODO: return stakedAmount[deliverer];
    }

    // === FONCTION ALIAS (pour compatibilité avec DoneOrderManager) ===
    /**
     * @notice Alias pour isDelivererStaked (utilisé par DoneOrderManager)
     * @dev TODO: Retourner isStaked[deliverer]
     * @param deliverer Adresse du livreur
     * @return bool True si le livreur est staké
     */
    function isStaked(address deliverer) external view returns (bool) {
        // TODO: return isStaked[deliverer];
    }
}

